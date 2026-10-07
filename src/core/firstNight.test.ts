import { describe, expect, it } from "vitest";
import {
  queryInitialSetup,
  type FirstNightReport,
  type SetupQueryInput,
} from "./symbolicSetup";
import type { Role } from "./model";
import { replayFirstNight } from "./replayFirstNight";

const spyAndRecluse: Role[] = [
  "Washerwoman",
  "Librarian",
  "Investigator",
  "Chef",
  "Empath",
  "Recluse",
  "Spy",
  "Imp",
];
const chefSplit: Role[] = [
  "Washerwoman",
  "Librarian",
  "Investigator",
  "Chef",
  "Imp",
  "Recluse",
  "Poisoner",
  "Empath",
];
const walkthrough: Role[] = [
  "Investigator",
  "Chef",
  "Fortune Teller",
  "Poisoner",
  "Monk",
  "Undertaker",
  "Imp",
  "Butler",
];
const facts = (roles: Role[]) =>
  roles.map((role, i) => ({ seat: i + 1, role }));
const active = { acceptedMessage: true, abilityActive: true };

describe("conditional first-night information rules", () => {
  it("allows Spy and Recluse to register differently for independent pair reports", async () => {
    const reports: FirstNightReport[] = [
      {
        kind: "pair_role",
        ability: "Washerwoman",
        speaker: 1,
        targets: [7, 8],
        seenRole: "Monk",
        ...active,
      },
      {
        kind: "pair_role",
        ability: "Librarian",
        speaker: 2,
        targets: [7, 8],
        seenRole: "Saint",
        ...active,
      },
      {
        kind: "pair_role",
        ability: "Investigator",
        speaker: 3,
        targets: [6, 8],
        seenRole: "Poisoner",
        ...active,
      },
    ];
    const result = await queryInitialSetup({
      playerCount: 8,
      facts: facts(spyAndRecluse),
      query: { seat: 8, role: "Imp" },
      reports,
    });
    expect(result.scope).toBe("first_night_slice");
    expect(result.classification).toBe("necessary");
  });
  it("lets Recluse register evil in one Chef pair and good in the other", async () => {
    const result = await queryInitialSetup({
      playerCount: 8,
      facts: facts(chefSplit),
      query: { seat: 5, role: "Imp" },
      reports: [{ kind: "chef", speaker: 4, count: 1, ...active }],
    });
    expect(result.classification).toBe("necessary");
  });
  it("keeps an accurate Fortune Teller NO separate from a healthy ability", async () => {
    const report: FirstNightReport = {
      kind: "fortune_teller",
      speaker: 3,
      targets: [7, 8],
      yes: false,
      acceptedMessage: true,
      abilityActive: false,
    };
    const base: SetupQueryInput = {
      playerCount: 8,
      facts: facts(walkthrough),
      query: { seat: 7, role: "Imp" },
      reports: [report],
    };
    expect((await queryInitialSetup(base)).classification).toBe("necessary");
    expect(
      (
        await queryInitialSetup({
          ...base,
          reports: [{ ...report, abilityActive: true }],
        })
      ).classification,
    ).toBe("inconsistent");
  });
  it("uses one good red herring and does not mark an evil player as it", async () => {
    const result = await queryInitialSetup({
      playerCount: 8,
      facts: facts(walkthrough),
      query: { seat: 7, role: "Imp" },
      reports: [
        {
          kind: "fortune_teller",
          speaker: 3,
          targets: [4, 5],
          yes: true,
          ...active,
        },
      ],
    });
    expect(result.classification).toBe("necessary");
    expect(result.yes?.redHerringSeat).toBe(5);
  });
  it("bounds an Empath result by the two actual neighbors", async () => {
    const base: SetupQueryInput = {
      playerCount: 8,
      facts: facts(spyAndRecluse),
      query: { seat: 8, role: "Imp" },
      reports: [{ kind: "empath" as const, speaker: 5, count: 1, ...active }],
    };
    expect((await queryInitialSetup(base)).status).toBe("sat");
    expect(
      (
        await queryInitialSetup({
          ...base,
          reports: [{ kind: "empath", speaker: 5, count: 2, ...active }],
        })
      ).classification,
    ).toBe("inconsistent");
  });
  it("replays registration choices independently from the SMT compiler", async () => {
    const input: SetupQueryInput = {
      playerCount: 8,
      facts: facts(chefSplit),
      query: { seat: 5, role: "Imp" },
      reports: [{ kind: "chef", speaker: 4, count: 1, ...active }],
    };
    const result = await queryInitialSetup(input);
    expect(replayFirstNight(input, result.yes!).valid).toBe(true);
    const altered = structuredClone(result.yes!);
    const split = altered.registrations.find(
      (choice) => choice.interaction === "chef_0_5_left" && choice.seat === 6,
    );
    expect(split).toBeDefined();
    split!.evil = !split!.evil;
    expect(replayFirstNight(input, altered).valid).toBe(false);
  });
  it("accepts Librarian zero with no mandatory Outsider registration", async () => {
    const report: FirstNightReport = {
      kind: "librarian_zero",
      speaker: 2,
      ...active,
    };
    const noOutsider: Role[] = [
      "Washerwoman",
      "Librarian",
      "Investigator",
      "Chef",
      "Empath",
      "Poisoner",
      "Imp",
    ];
    const yes = await queryInitialSetup({
      playerCount: 7,
      facts: facts(noOutsider),
      query: { seat: 7, role: "Imp" },
      reports: [report],
    });
    expect(yes.classification).toBe("necessary");
    const no = await queryInitialSetup({
      playerCount: 8,
      facts: facts(
        spyAndRecluse.map((role) => (role === "Recluse" ? "Saint" : role)),
      ),
      query: { seat: 8, role: "Imp" },
      reports: [report],
    });
    expect(no.classification).toBe("inconsistent");
  });
  it("makes a specified N1 Poisoner action conflict with an active target's information", async () => {
    const report: FirstNightReport = {
      kind: "fortune_teller",
      speaker: 3,
      targets: [7, 8],
      yes: true,
      ...active,
    };
    const input: SetupQueryInput = {
      playerCount: 8,
      facts: facts(walkthrough),
      query: { seat: 7, role: "Imp" },
      reports: [report],
      nightOnePoisoner: { seat: 4, target: 2 },
    };
    const healthy = await queryInitialSetup(input);
    expect(healthy.classification).toBe("necessary");
    expect(healthy.yes?.nightOnePoisoner).toEqual(input.nightOnePoisoner);
    expect(
      (
        await queryInitialSetup({
          ...input,
          nightOnePoisoner: { seat: 4, target: 3 },
        })
      ).classification,
    ).toBe("inconsistent");
    expect(
      (
        await queryInitialSetup({
          ...input,
          reports: [{ ...report, abilityActive: false }],
          nightOnePoisoner: { seat: 4, target: 3 },
        })
      ).classification,
    ).toBe("necessary");
    expect(
      (
        await queryInitialSetup({
          ...input,
          nightOnePoisoner: { seat: 4, target: 4 },
        })
      ).classification,
    ).toBe("necessary");
  });
  it("rejects a poisoned Recluse registering as Baron in a healthy Investigator report", async () => {
    const roles: Role[] = [
      "Investigator",
      "Chef",
      "Fortune Teller",
      "Soldier",
      "Poisoner",
      "Recluse",
      "Imp",
      "Monk",
    ];
    const report: FirstNightReport = {
      kind: "pair_role",
      ability: "Investigator",
      speaker: 1,
      targets: [6, 4],
      seenRole: "Baron",
      ...active,
    };
    const input: SetupQueryInput = {
      playerCount: 8,
      facts: facts(roles),
      query: { seat: 7, role: "Imp" },
      reports: [report],
      nightOnePoisoner: { seat: 5, target: 2 },
    };
    const healthy = await queryInitialSetup(input);
    expect(healthy.classification).toBe("necessary");
    expect(healthy.yes?.registrations).toContainEqual({
      interaction: "pair_0",
      seat: 6,
      role: "Baron",
    });
    const poisonedInput = {
      ...input,
      nightOnePoisoner: { seat: 5, target: 6 },
    };
    expect((await queryInitialSetup(poisonedInput)).classification).toBe(
      "inconsistent",
    );
    const invalidWitness = structuredClone(healthy.yes!);
    invalidWitness.nightOnePoisoner = poisonedInput.nightOnePoisoner;
    expect(replayFirstNight(poisonedInput, invalidWitness).valid).toBe(false);
  });
  it("does not count a poisoned Recluse as evil for Chef", async () => {
    const input: SetupQueryInput = {
      playerCount: 8,
      facts: facts(chefSplit),
      query: { seat: 5, role: "Imp" },
      reports: [{ kind: "chef", speaker: 4, count: 1, ...active }],
      nightOnePoisoner: { seat: 7, target: 6 },
    };
    expect((await queryInitialSetup(input)).classification).toBe(
      "inconsistent",
    );
  });
  it("rejects two accepted displays from the same once-only N1 ability", async () => {
    const report: FirstNightReport = {
      kind: "chef",
      speaker: 4,
      count: 0,
      ...active,
    };
    await expect(
      queryInitialSetup({
        playerCount: 8,
        facts: facts(chefSplit),
        query: { seat: 5, role: "Imp" },
        reports: [report, report],
      }),
    ).rejects.toThrow("只可采纳一次");
  });
});
