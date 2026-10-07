import { describe, expect, it } from "vitest";
import {
  queryObservedTimeline,
  type ObservedQueryInput,
} from "./symbolicSetup";
import { replayTimeline } from "./timeline";
import { matchObservedTimeline } from "./observedTimeline";
import type { Role } from "./model";

const scenario = (deaths: number[]): ObservedQueryInput => ({
  playerCount: 7,
  facts: [
    { seat: 1, role: "Imp" },
    { seat: 2, role: "Spy" },
    { seat: 3, role: "Investigator" },
    { seat: 4, role: "Chef" },
    { seat: 5, role: "Empath" },
    { seat: 6, role: "Slayer" },
  ],
  query: { seat: 7, role: "Soldier" },
  phases: [
    { kind: "night", cycle: 1, deaths: [] },
    { kind: "day", cycle: 1, events: [], deaths: [], executedSeat: null },
    { kind: "night", cycle: 2, deaths },
  ],
  timeoutMs: 10000,
  maxWorlds: 100,
  maxHistories: 100,
});

describe("observed timeline hidden action inference", () => {
  it("excludes a healthy Soldier from a closed N2 death and replays the counterexample", async () => {
    const result = await queryObservedTimeline(scenario([7]));
    expect(result.scope).toBe("bounded_timeline");
    expect(result.classification).toBe("impossible");
    expect(result.no?.timeline?.[2]).toMatchObject({
      kind: "night",
      actions: { impTarget: 7 },
    });
    const witness = result.no!;
    const replay = replayTimeline({
      initialPlayers: witness.roles.map((actualRole, index) => ({
        seat: index + 1,
        actualRole,
        shownToken: witness.shownTokens[index],
      })),
      phases: witness.timeline!,
    });
    expect(replay.status).toBe("ok");
  });

  it("uses the setup role for immutable current Townsfolk characters", async () => {
    const input = scenario([7]);
    const result = await queryObservedTimeline({
      ...input,
      currentQuery: { seat: 7, role: "Soldier" },
    });
    expect(result.classification).toBe("impossible");
  });

  it("retains a real Soldier death when hidden Poisoner action can disable protection", async () => {
    const input = scenario([7]);
    input.facts[1] = { seat: 2, role: "Poisoner" };
    const result = await queryObservedTimeline(input);
    expect(result.classification).toBe("contingent");
    expect(result.yes?.roles[6]).toBe("Soldier");
    expect(result.yes?.timeline?.[2]).toMatchObject({
      kind: "night",
      actions: { poisonerTarget: 7, impTarget: 7 },
    });
  });

  it("keeps a Soldier as a possible explanation of no N2 death", async () => {
    const result = await queryObservedTimeline(scenario([]));
    expect(result.yes?.roles[6]).toBe("Soldier");
    expect(result.yes?.timeline?.[2]).toMatchObject({
      kind: "night",
      actions: { impTarget: 7 },
    });
  });

  it("infers a night attack after a recorded execution ends Poisoner effects", () => {
    const roles: Role[] = [
      "Investigator",
      "Chef",
      "Fortune Teller",
      "Poisoner",
      "Monk",
      "Undertaker",
      "Imp",
      "Butler",
    ];
    const witness = { roles, shownTokens: [...roles], registrations: [] };
    const setup = {
      playerCount: 8,
      facts: [],
      query: { seat: 7, role: "Imp" as const },
    };
    const result = matchObservedTimeline(
      witness,
      {
        phases: [
          { kind: "night", cycle: 1, deaths: [] },
          {
            kind: "day",
            cycle: 1,
            events: [
              {
                kind: "nomination",
                nominator: 1,
                nominee: 4,
                votes: [1, 2, 3, 5, 6],
              },
            ],
            deaths: [4],
            executedSeat: 4,
          },
          { kind: "night", cycle: 2, deaths: [2] },
        ],
        maxHistories: 10000,
      },
      setup,
      Date.now() + 10000,
    );
    expect(result.status).toBe("valid");
    if (result.status !== "valid") return;
    expect(result.timeline[2]).toMatchObject({
      kind: "night",
      actions: { impTarget: 2 },
    });
    expect(
      replayTimeline({
        initialPlayers: roles.map((actualRole, index) => ({
          seat: index + 1,
          actualRole,
        })),
        phases: result.timeline,
      }).status,
    ).toBe("ok");
  });

  it("matches a healthy Saint execution to the recorded evil victory", () => {
    const roles: Role[] = [
      "Chef",
      "Saint",
      "Investigator",
      "Spy",
      "Monk",
      "Fortune Teller",
      "Imp",
      "Undertaker",
    ];
    const witness = { roles, shownTokens: [...roles], registrations: [] };
    const setup = {
      playerCount: 8,
      facts: [],
      query: { seat: 2, role: "Saint" as const },
    };
    const day = {
      kind: "day" as const,
      cycle: 1,
      events: [
        {
          kind: "nomination" as const,
          nominator: 3,
          nominee: 2,
          votes: [1, 2, 3, 4],
        },
      ],
      deaths: [2],
      executedSeat: 2,
    };
    const query = (winner: "good" | "evil") =>
      matchObservedTimeline(
        witness,
        {
          phases: [
            { kind: "night", cycle: 1, deaths: [] },
            { ...day, winner },
          ],
          maxHistories: 100,
        },
        setup,
        Date.now() + 10000,
      );
    expect(query("evil").status).toBe("valid");
    expect(query("good").status).toBe("invalid");
  });

  it("replays a Virgin immediate execution without inventing a vote", () => {
    const roles: Role[] = [
      "Chef",
      "Virgin",
      "Investigator",
      "Spy",
      "Monk",
      "Fortune Teller",
      "Imp",
      "Butler",
    ];
    const result = matchObservedTimeline(
      { roles, shownTokens: [...roles], registrations: [] },
      {
        phases: [
          { kind: "night", cycle: 1, deaths: [] },
          {
            kind: "day",
            cycle: 1,
            events: [
              { kind: "nomination", nominator: 1, nominee: 2, votes: [] },
            ],
            deaths: [1],
            executedSeat: 1,
          },
        ],
        maxHistories: 100,
      },
      { playerCount: 8, facts: [], query: { seat: 2, role: "Virgin" } },
      Date.now() + 10000,
    );
    expect(result.status).toBe("valid");
  });

  it("checks Undertaker registration per interaction after a Spy execution", () => {
    const roles: Role[] = [
      "Investigator",
      "Chef",
      "Fortune Teller",
      "Spy",
      "Monk",
      "Undertaker",
      "Imp",
      "Butler",
    ];
    const witness = { roles, shownTokens: [...roles], registrations: [] };
    const setup = {
      playerCount: 8,
      facts: [],
      query: { seat: 7, role: "Imp" as const },
    };
    const phases = [
      { kind: "night" as const, cycle: 1, deaths: [] },
      {
        kind: "day" as const,
        cycle: 1,
        events: [
          {
            kind: "nomination" as const,
            nominator: 1,
            nominee: 4,
            votes: [1, 2, 3, 5],
          },
        ],
        deaths: [4],
        executedSeat: 4,
      },
      { kind: "night" as const, cycle: 2, deaths: [2] },
    ];
    const query = (seenRole: Role) =>
      matchObservedTimeline(
        witness,
        {
          phases,
          laterReports: [
            {
              kind: "undertaker",
              cycle: 2,
              speaker: 6,
              seenRole,
              acceptedMessage: true,
              abilityActive: true,
            },
          ],
          maxHistories: 10000,
        },
        setup,
        Date.now() + 10000,
      );
    const valid = query("Chef");
    expect(valid.status).toBe("valid");
    if (valid.status === "valid")
      expect(valid.timeline[2]).toMatchObject({
        kind: "night",
        actions: { undertakerRegistrationRole: "Chef" },
      });
    expect(query("Imp").status).toBe("invalid");
  });

  it("requires a Ravenkeeper death and checks the shown character", () => {
    const roles: Role[] = [
      "Investigator",
      "Chef",
      "Ravenkeeper",
      "Spy",
      "Monk",
      "Undertaker",
      "Imp",
      "Butler",
    ];
    const witness = { roles, shownTokens: [...roles], registrations: [] };
    const setup = {
      playerCount: 8,
      facts: [],
      query: { seat: 3, role: "Ravenkeeper" as const },
    };
    const phases = [
      { kind: "night" as const, cycle: 1, deaths: [] },
      {
        kind: "day" as const,
        cycle: 1,
        events: [],
        deaths: [],
        executedSeat: null,
      },
      { kind: "night" as const, cycle: 2, deaths: [3] },
    ];
    const query = (seenRole: Role) =>
      matchObservedTimeline(
        witness,
        {
          phases,
          laterReports: [
            {
              kind: "ravenkeeper",
              cycle: 2,
              speaker: 3,
              target: 4,
              seenRole,
              acceptedMessage: true,
              abilityActive: true,
            },
          ],
          maxHistories: 10000,
        },
        setup,
        Date.now() + 10000,
      );
    const valid = query("Chef");
    expect(valid.status).toBe("valid");
    if (valid.status === "valid")
      expect(valid.timeline[2]).toMatchObject({
        kind: "night",
        actions: {
          impTarget: 3,
          ravenkeeperTarget: 4,
          ravenkeeperRegistrationRole: "Chef",
        },
      });
    expect(query("Imp").status).toBe("invalid");
  });

  it("checks the current Imp after Scarlet Woman succession with one fixed red herring", () => {
    const roles: Role[] = [
      "Fortune Teller",
      "Chef",
      "Investigator",
      "Scarlet Woman",
      "Monk",
      "Undertaker",
      "Imp",
      "Butler",
    ];
    const witness = {
      roles,
      shownTokens: [...roles],
      redHerringSeat: 2,
      registrations: [],
    };
    const setup = {
      playerCount: 8,
      facts: [],
      query: { seat: 4, role: "Scarlet Woman" as const },
    };
    const phases = [
      { kind: "night" as const, cycle: 1, deaths: [] },
      {
        kind: "day" as const,
        cycle: 1,
        events: [
          {
            kind: "nomination" as const,
            nominator: 1,
            nominee: 7,
            votes: [1, 2, 3, 5],
          },
        ],
        deaths: [7],
        executedSeat: 7,
      },
      { kind: "night" as const, cycle: 2, deaths: [3] },
    ];
    const query = (yes: boolean) =>
      matchObservedTimeline(
        witness,
        {
          phases,
          laterReports: [
            {
              kind: "fortune_teller",
              cycle: 2,
              speaker: 1,
              targets: [4, 5],
              yes,
              acceptedMessage: true,
              abilityActive: true,
            },
          ],
          maxHistories: 10000,
        },
        setup,
        Date.now() + 10000,
      );
    const valid = query(true);
    expect(valid.status).toBe("valid");
    if (valid.status === "valid")
      expect(valid.timeline[2]).toMatchObject({
        kind: "night",
        actions: { impTarget: 3 },
      });
    expect(query(false).status).toBe("invalid");
  });

  it("uses the Empath's living neighbors after night deaths", () => {
    const roles: Role[] = [
      "Imp",
      "Spy",
      "Empath",
      "Chef",
      "Investigator",
      "Monk",
      "Fortune Teller",
      "Butler",
    ];
    const witness = { roles, shownTokens: [...roles], registrations: [] };
    const setup = {
      playerCount: 8,
      facts: [],
      query: { seat: 3, role: "Empath" as const },
    };
    const phases = [
      { kind: "night" as const, cycle: 1, deaths: [] },
      {
        kind: "day" as const,
        cycle: 1,
        events: [
          {
            kind: "nomination" as const,
            nominator: 1,
            nominee: 4,
            votes: [1, 2, 3, 5],
          },
        ],
        deaths: [4],
        executedSeat: 4,
      },
      { kind: "night" as const, cycle: 2, deaths: [5] },
    ];
    const query = (count: number) =>
      matchObservedTimeline(
        witness,
        {
          phases,
          laterReports: [
            {
              kind: "empath",
              cycle: 2,
              speaker: 3,
              count,
              acceptedMessage: true,
              abilityActive: true,
            },
          ],
          maxHistories: 10000,
        },
        setup,
        Date.now() + 10000,
      );
    expect(query(1).status).toBe("valid");
    expect(query(2).status).toBe("invalid");
  });

  it("distinguishes current Imp from initial character after Scarlet Woman succession", async () => {
    const roles: Role[] = [
      "Fortune Teller",
      "Chef",
      "Investigator",
      "Scarlet Woman",
      "Monk",
      "Undertaker",
      "Imp",
      "Butler",
    ];
    const input = {
      playerCount: 8,
      facts: roles.map((role, index) => ({ seat: index + 1, role })),
      query: { seat: 4, role: "Imp" as const },
      phases: [
        { kind: "night" as const, cycle: 1, deaths: [] },
        {
          kind: "day" as const,
          cycle: 1,
          events: [],
          deaths: [],
          executedSeat: null,
        },
        { kind: "night" as const, cycle: 2, deaths: [7] },
      ],
      timeoutMs: 10000,
      maxWorlds: 20,
      maxHistories: 10000,
    };
    const initial = await queryObservedTimeline(input);
    expect(initial.classification).toBe("impossible");
    const current = await queryObservedTimeline({
      ...input,
      currentQuery: { seat: 4, role: "Imp" },
    });
    expect(current.classification).toBe("necessary");
    expect(current.yes?.roles[3]).toBe("Scarlet Woman");
    expect(current.yes?.currentRoles?.[3]).toBe("Imp");
    expect(current.yes?.timeline?.[2]).toMatchObject({
      kind: "night",
      actions: { impTarget: 7 },
    });
  });

  it("searches red herring placements for an adopted later Fortune Teller report", async () => {
    const roles: Role[] = [
      "Fortune Teller",
      "Chef",
      "Investigator",
      "Scarlet Woman",
      "Monk",
      "Undertaker",
      "Imp",
      "Butler",
    ];
    const result = await queryObservedTimeline({
      playerCount: 8,
      facts: roles.map((role, index) => ({ seat: index + 1, role })),
      query: { seat: 4, role: "Scarlet Woman" },
      phases: [
        { kind: "night", cycle: 1, deaths: [] },
        { kind: "day", cycle: 1, events: [], deaths: [], executedSeat: null },
        { kind: "night", cycle: 2, deaths: [3] },
      ],
      laterReports: [
        {
          kind: "fortune_teller",
          cycle: 2,
          speaker: 1,
          targets: [2, 5],
          yes: true,
          acceptedMessage: true,
          abilityActive: true,
        },
      ],
      maxHistories: 10000,
      maxWorlds: 50,
      timeoutMs: 10000,
    });
    expect(result.classification).toBe("necessary");
    expect([2, 5]).toContain(result.yes?.redHerringSeat);
    expect(result.yes?.timeline?.[2]).toMatchObject({
      kind: "night",
      actions: { impTarget: 3 },
    });
  });

  it("returns unknown when hidden action enumeration is cut short", async () => {
    const result = await queryObservedTimeline({
      ...scenario([7]),
      maxHistories: 1,
    });
    expect(result.classification).toBe("unknown");
    expect(result.unknownReason).toBe("candidate_limit");
  });
});
