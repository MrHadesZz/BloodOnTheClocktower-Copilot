import { describe, expect, it } from "vitest";
import { queryInitialSetup } from "./symbolicSetup";
import { replayFirstNight } from "./replayFirstNight";
import { OUTSIDERS, TOWNSFOLK, validateInitialSetup } from "./setup";
import type { Role } from "./model";

function validateWitness(roles: Role[]) {
  const shown = TOWNSFOLK.find((role) => !roles.includes(role));
  return validateInitialSetup(
    roles.map((actualRole, i) => ({
      seat: i + 1,
      actualRole,
      ...(actualRole === "Drunk" ? { shownToken: shown } : {}),
    })),
  );
}

describe("Z3 initial setup compiler", () => {
  it("finds both a Demon and a non-Demon assignment for an unconstrained seat", async () => {
    const result = await queryInitialSetup({
      playerCount: 8,
      facts: [],
      query: { seat: 1, role: "Imp" },
    });
    expect(result.classification).toBe("contingent");
    expect(result.yes?.roles[0]).toBe("Imp");
    expect(result.no?.roles[0]).not.toBe("Imp");
    expect(validateWitness(result.yes!.roles).valid).toBe(true);
    expect(validateWitness(result.no!.roles).valid).toBe(true);
  });
  it("respects Baron setup changes and distinct role tokens", async () => {
    const result = await queryInitialSetup({
      playerCount: 8,
      facts: [{ seat: 1, role: "Baron" }],
      query: { seat: 2, role: "Baron" },
    });
    expect(result.classification).toBe("impossible");
    const roles = result.no!.roles;
    expect(roles.filter((role) => OUTSIDERS.includes(role))).toHaveLength(3);
    expect(validateWitness(roles).valid).toBe(true);
  });
  it("marks contradictory fixed roles as an inconsistent branch", async () => {
    const result = await queryInitialSetup({
      playerCount: 8,
      facts: [
        { seat: 1, role: "Baron" },
        { seat: 2, role: "Poisoner" },
      ],
      query: { seat: 3, role: "Imp" },
    });
    expect(result.classification).toBe("inconsistent");
  });
  it("keeps Drunk truth separate from the unseen Townsfolk token", async () => {
    const roles: Role[] = [
      "Drunk",
      "Chef",
      "Empath",
      "Fortune Teller",
      "Monk",
      "Undertaker",
      "Poisoner",
      "Imp",
    ];
    const input = {
      playerCount: 8,
      facts: roles.map((role, index) => ({ seat: index + 1, role })),
      tokenFacts: [{ seat: 1, shownRole: "Investigator" as Role }],
      query: { seat: 1, role: "Drunk" as Role },
    };
    const valid = await queryInitialSetup(input);
    expect(valid.classification).toBe("necessary");
    expect(valid.yes?.shownTokens[0]).toBe("Investigator");
    expect(replayFirstNight(input, valid.yes!).valid).toBe(true);
    const altered = structuredClone(valid.yes!);
    altered.shownTokens[0] = "Chef";
    expect(replayFirstNight(input, altered).valid).toBe(false);
    expect(
      (
        await queryInitialSetup({
          ...input,
          tokenFacts: [{ seat: 1, shownRole: "Chef" as Role }],
        })
      ).classification,
    ).toBe("inconsistent");
  });
  it("does not promote a seen Townsfolk token into certain actual truth", async () => {
    const result = await queryInitialSetup({
      playerCount: 8,
      facts: [],
      tokenFacts: [{ seat: 1, shownRole: "Investigator" }],
      query: { seat: 1, role: "Drunk" },
    });
    expect(result.classification).toBe("contingent");
    expect(result.yes?.roles[0]).toBe("Drunk");
    expect(result.no?.roles[0]).toBe("Investigator");
  });
  it("answers a 15-player existential query without enumerating the role space", async () => {
    const result = await queryInitialSetup({
      playerCount: 15,
      facts: [],
      query: { seat: 15, role: "Imp" },
      timeoutMs: 5000,
    });
    expect(result.classification).toBe("contingent");
    expect(result.yes?.roles).toHaveLength(15);
    expect(validateWitness(result.yes!.roles).valid).toBe(true);
  });
});
