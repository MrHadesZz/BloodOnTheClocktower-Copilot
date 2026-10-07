import { describe, expect, it } from "vitest";
import { parseEntry } from "./parser";
import { classify, solve } from "./solver";
import { commitDrafts, createFixture, retractEvent } from "./workspace";
import { activeEvents, AssumptionId } from "./model";
import { replayTimeline } from "./timeline";
import type { NightTrace } from "./night";

const fixture = createFixture();
const solveWith = (ids: AssumptionId[], revision = fixture.events.length) =>
  solve(fixture.events, ids, revision);
const beforeDay = 8;

describe("bounded H0 scenario against supplied independent oracle", () => {
  it("keeps raw claims out of the hard world constraints before public deaths", () => {
    const result = solveWith([], beforeDay);
    expect(result.status).toBe("sat");
    expect(result.count.value).toBe("24");
    expect(result.possibleImpSeats).toEqual([4, 5, 7, 8]);
  });
  it("reproduces the 24 → 12 → 8 → 8 → 0 → 2 → 1 stages", () => {
    const inv: AssumptionId[] = ["inv_report", "inv_active"];
    const chef: AssumptionId[] = [...inv, "chef_report", "chef_active"];
    const ft: AssumptionId[] = [...chef, "ft_report"];
    expect(solveWith(inv, beforeDay).count.value).toBe("12");
    expect(solveWith(chef, beforeDay).count.value).toBe("8");
    const ftResult = solveWith(ft, beforeDay);
    expect(ftResult.count.value).toBe("8");
    expect([...new Set(ftResult.witnesses.map((w) => w.poisonN1))]).toEqual([
      3,
    ]);
    const conflict = solveWith([...ft, "ft_active"], beforeDay);
    expect(conflict.status).toBe("unsat");
    expect(conflict.count.value).toBe("0");
    expect(conflict.conflict.includes("ft_active")).toBe(true);
    const butler = solveWith([...ft, "butler8"], beforeDay);
    expect(butler.count.value).toBe("2");
    expect(butler.possibleImpSeats).toEqual([7]);
    const final = solveWith([...ft, "butler8", "ut_report_n2", "ft_report_n2"]);
    expect(final.count.value).toBe("1");
    expect(final.witnesses[0].roles[4]).toBe("Poisoner");
    expect(final.witnesses[0].roles[5]).toBe("Monk");
  });
  it("uses a recorded N2 death before or after the channel is closed", () => {
    for (const revision of [13, 14]) {
      const result = solveWith([], revision);
      expect(result.status).toBe("sat");
      expect(result.count.value).toBe("18");
      expect(result.possibleImpSeats).toEqual([4, 7, 8]);
      expect(
        classify(result, { kind: "actual_role", seat: 5, role: "Imp" })
          .classification,
      ).toBe("impossible");
    }
  });
  it("lets the N2 Undertaker report distinguish the two surviving H0 assignments", () => {
    const premises: AssumptionId[] = [
      "inv_report",
      "inv_active",
      "chef_report",
      "chef_active",
      "ft_report",
      "butler8",
    ];
    expect(solveWith(premises, 14).count.value).toBe("2");
    const accepted = solveWith([...premises, "ut_report_n2"], 16);
    expect(accepted.count.value).toBe("1");
    expect(accepted.witnesses[0].roles[5]).toBe("Monk");
  });
  it("returns a complete N2 action witness that replays through the timeline oracle", () => {
    const premises: AssumptionId[] = [
      "inv_report",
      "inv_active",
      "chef_report",
      "chef_active",
      "ft_report",
      "butler8",
      "ut_report_n2",
      "ft_report_n2",
    ];
    const result = solveWith(premises);
    expect(result.status).toBe("sat");
    const witness = result.witnesses[0];
    expect(witness.impTargetN2).toBeDefined();
    const replay = replayTimeline({
      initialPlayers: Array.from({ length: 8 }, (_, index) => ({
        seat: index + 1,
        actualRole: witness.roles[index + 1],
      })),
      phases: [
        {
          kind: "night",
          actions: {
            cycle: 1,
            poisonerTarget: witness.poisonN1,
            butlerMasterSeat: 1,
          },
        },
        {
          kind: "day",
          events: [
            {
              kind: "nomination",
              nominator: 4,
              nominee: 5,
              votes: [1, 2, 4, 7, 8],
            },
          ],
        },
        {
          kind: "night",
          actions: {
            cycle: 2,
            impTarget: witness.impTargetN2,
            butlerMasterSeat: 1,
            ...(witness.poisonN2 != null
              ? { poisonerTarget: witness.poisonN2 }
              : {}),
            ...(witness.monkGuardN2 != null
              ? { monkTarget: witness.monkGuardN2 }
              : {}),
          },
        },
      ],
    });
    expect(replay.status).toBe("ok");
    if (replay.status !== "ok") throw new Error(replay.reason);
    const n2 = replay.traces[2] as NightTrace;
    expect(n2.deaths).toEqual([2]);
    expect(n2.undertakerInfo?.seenRole).toBe("Monk");
  });
  it("uses the recorded D1 execution seat rather than a fixed fixture seat", () => {
    let changed = { ...fixture, events: fixture.events.slice(0, 8) };
    for (const line of [
      "1 nom 4 @D1",
      "vote 4 = 1,2,3,5,6 @D1",
      "exec 4 @D1",
      "4 dead @D1",
      "2 dead @N2",
      "close deaths @N2",
    ])
      changed = commitDrafts(changed, line, parseEntry(line));
    const result = solve(changed.events, [], changed.events.length);
    expect(result.status).toBe("sat");
    expect(result.count.value).toBe("18");
    expect(
      classify(result, { kind: "actual_role", seat: 4, role: "Imp" })
        .classification,
    ).toBe("impossible");
  });
  it("treats a closed N2 with no deaths as a valid zero-death observation", () => {
    const beforeNight = { ...fixture, events: fixture.events.slice(0, 12) };
    const noDeaths = commitDrafts(
      beforeNight,
      "close deaths @N2",
      parseEntry("close deaths @N2"),
    );
    const result = solve(noDeaths.events, [], noDeaths.events.length);
    expect(result.status).toBe("sat");
    expect(result.count.value).toBe("18");
    expect(
      result.witnesses.every((witness) => witness.roles[5] !== "Imp"),
    ).toBe(true);
  });
  it("retains a legal Imp self-kill with Poisoner succession", () => {
    let changed = { ...fixture, events: fixture.events.slice(0, 12) };
    for (const line of ["7 dead @N2", "close deaths @N2"])
      changed = commitDrafts(changed, line, parseEntry(line));
    const result = solve(changed.events, [], changed.events.length);
    const selfKill = result.witnesses.find(
      (witness) => witness.roles[7] === "Imp" && witness.impTargetN2 === 7,
    );
    expect(selfKill).toBeDefined();
    const poisonerSeat = Number(
      Object.entries(selfKill!.roles).find(
        ([, role]) => role === "Poisoner",
      )?.[0],
    );
    expect(selfKill?.impSuccessorN2).toBe(poisonerSeat);
    expect(selfKill?.poisonedAtInfoN2).toBeNull();
  });
  it("keeps a healthy N2 Fortune Teller YES for a newly succeeded Imp", () => {
    let changed = { ...fixture, events: fixture.events.slice(0, 12) };
    for (const line of ["8 dead @N2", "close deaths @N2", "3 ft 4/7 yes @N2"])
      changed = commitDrafts(changed, line, parseEntry(line));
    const result = solve(
      changed.events,
      ["ft_report_n2"],
      changed.events.length,
    );
    const succeeded = result.witnesses.find(
      (witness) =>
        witness.roles[4] === "Poisoner" &&
        witness.roles[5] === "Monk" &&
        witness.roles[7] === "Butler" &&
        witness.roles[8] === "Imp" &&
        witness.redHerring === 1 &&
        witness.impSuccessorN2 === 4,
    );
    expect(succeeded).toBeDefined();
    expect(succeeded?.poisonedAtInfoN2).toBeNull();
  });
  it("rejects an accepted N2 Undertaker report when that player died before acting", () => {
    let changed = { ...fixture, events: fixture.events.slice(0, 12) };
    for (const line of ["6 dead @N2", "close deaths @N2", "6 ut monk @N2"])
      changed = commitDrafts(changed, line, parseEntry(line));
    const result = solve(
      changed.events,
      ["ut_report_n2"],
      changed.events.length,
    );
    expect(result.status).toBe("unsat");
  });
  it("marks two recorded N2 deaths unsupported in the bounded H0 night", () => {
    let changed = { ...fixture, events: fixture.events.slice(0, 12) };
    for (const line of ["2 dead @N2", "3 dead @N2", "close deaths @N2"])
      changed = commitDrafts(changed, line, parseEntry(line));
    const result = solve(changed.events, [], changed.events.length);
    expect(result.status).toBe("unsupported");
    expect(result.count.kind).toBe("not_computed");
  });
  it("returns a genuine counterexample after removing a critical assumption", () => {
    const restricted = solveWith([
      "inv_report",
      "inv_active",
      "chef_report",
      "chef_active",
      "ft_report",
      "butler8",
    ]);
    expect(
      classify(restricted, { kind: "actual_role", seat: 7, role: "Imp" })
        .classification,
    ).toBe("necessary");
    const relaxed = solveWith([
      "inv_report",
      "inv_active",
      "chef_report",
      "chef_active",
      "ft_report",
    ]);
    const answer = classify(relaxed, {
      kind: "actual_role",
      seat: 7,
      role: "Imp",
    });
    expect(answer.classification).toBe("contingent");
    expect(answer.no?.roles[7]).not.toBe("Imp");
  });
});

describe("entry and event boundary", () => {
  it("splits one report into a role claim and an information claim", () => {
    const drafts = parseEntry("3 ft 7/8 no @N1");
    expect(drafts).toHaveLength(2);
    expect(drafts.every((d) => d.payload.kind === "claim")).toBe(true);
    expect(drafts[0].payload).toMatchObject({
      claimKind: "role",
      role: "Fortune Teller",
    });
    expect(drafts[1].payload).toMatchObject({
      claimKind: "ability_report",
      value: false,
      targets: [7, 8],
    });
  });
  it("requires a unique nomination before accepting a vote record", () => {
    const withoutNomination = retractEvent(
      fixture,
      fixture.events.find((e) => e.payload.kind === "nomination")!.id,
    );
    expect(() =>
      commitDrafts(
        withoutNomination,
        "vote 5 = 1,2 @D1",
        parseEntry("vote 5 = 1,2 @D1"),
      ),
    ).toThrow("投票必须关联");
  });
  it("retracts recording errors without erasing event history", () => {
    const target = fixture.events.find(
      (e) =>
        e.payload.kind === "claim" && e.payload.claimKind === "ability_report",
    )!;
    const next = retractEvent(fixture, target.id);
    expect(next.events).toHaveLength(fixture.events.length + 1);
    expect(activeEvents(next.events).some((e) => e.id === target.id)).toBe(
      false,
    );
  });
  it("accepts a player nominating themselves", () => {
    expect(parseEntry("4 nom 4 @D1")[0].payload).toEqual({
      kind: "nomination",
      nominator: 4,
      nominee: 4,
    });
  });
  it("rejects silent time and seat guesses", () => {
    expect(() => parseEntry("3 ft 7/8 no")).toThrow("明确时间");
    expect(() => parseEntry("9 ft 7/8 no @N1")).toThrow("座位");
    expect(() => parseEntry("3 mystery @D1")).toThrow("未知角色");
  });
});
