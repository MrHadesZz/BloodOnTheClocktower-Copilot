import { describe, expect, it } from "vitest";
import { queryInitialSetup, queryObservedTimeline } from "./symbolicSetup";
import {
  addStandardHypothesis,
  commitStandardEntry,
  createStandardBranch,
  createStandardWorkspace,
  prepareStandardObservedQuery,
  prepareStandardSetupQuery,
  publicTranscript,
  retractStandardEvent,
  toggleStandardHypothesis,
  validateStandardWorkspace,
  visibleStandardEvents,
} from "./standardWorkspace";

const adopted = (workspace: ReturnType<typeof createStandardWorkspace>) =>
  toggleStandardHypothesis(
    workspace,
    workspace.hypotheses[workspace.hypotheses.length - 1].id,
  );

describe("standard workspace and perspective boundary", () => {
  it("keeps private source text and assumptions out of a public transcript", () => {
    let workspace = createStandardWorkspace(10, 3);
    workspace = commitStandardEntry(workspace, "3 emp 2 @N1");
    workspace = commitStandardEntry(workspace, "4 nom 4 @D1", "public");
    workspace = adopted(
      addStandardHypothesis(workspace, {
        kind: "actual_role",
        seat: 3,
        role: "Empath",
      }),
    );
    expect(visibleStandardEvents(workspace, 3)).toHaveLength(3);
    expect(visibleStandardEvents(workspace, 4)).toHaveLength(1);
    const shared = publicTranscript(workspace);
    const content = JSON.stringify(shared);
    expect(content).toContain("4 nom 4");
    expect(content).not.toContain("3 emp 2");
    expect(content).not.toContain("actual_role");
    expect(shared.events.every((event) => event.visibility === "public")).toBe(
      true,
    );
  });

  it("requires separate adoption of a report and its active ability", async () => {
    let workspace = createStandardWorkspace(7);
    workspace = commitStandardEntry(workspace, "1 inv 2/3 poisoner @N1");
    const report = workspace.events[1];
    const raw = prepareStandardSetupQuery(workspace);
    expect(raw.status).toBe("ready");
    if (raw.status !== "ready") throw new Error(raw.reason);
    expect(raw.input.reports).toEqual([]);
    expect((await queryInitialSetup(raw.input)).classification).toBe(
      "contingent",
    );

    workspace = adopted(
      addStandardHypothesis(workspace, {
        kind: "report_accurate",
        eventId: report.id,
      }),
    );
    workspace = adopted(
      addStandardHypothesis(workspace, {
        kind: "ability_active",
        eventId: report.id,
      }),
    );
    const prepared = prepareStandardSetupQuery(workspace);
    expect(prepared.status).toBe("ready");
    if (prepared.status !== "ready") throw new Error(prepared.reason);
    expect(prepared.input.reports).toEqual([
      {
        kind: "pair_role",
        ability: "Investigator",
        speaker: 1,
        targets: [2, 3],
        seenRole: "Poisoner",
        acceptedMessage: true,
        abilityActive: true,
      },
    ]);
    expect(prepared.sourceIds).toEqual([report.id]);
    workspace.query = { seat: 1, role: "Investigator" };
    const withQuery = prepareStandardSetupQuery(workspace);
    if (withQuery.status !== "ready") throw new Error(withQuery.reason);
    expect((await queryInitialSetup(withQuery.input)).classification).toBe(
      "necessary",
    );
  });

  it("projects a seen token without asserting the player's actual character", async () => {
    let workspace = createStandardWorkspace(8, 1);
    workspace = adopted(
      addStandardHypothesis(workspace, {
        kind: "seen_token",
        seat: 1,
        shownRole: "Investigator",
      }),
    );
    workspace = { ...workspace, query: { seat: 1, role: "Drunk" } };
    const prepared = prepareStandardSetupQuery(workspace);
    expect(prepared.status).toBe("ready");
    if (prepared.status !== "ready") throw new Error(prepared.reason);
    expect(prepared.input.tokenFacts).toEqual([
      { seat: 1, shownRole: "Investigator" },
    ]);
    const answer = await queryInitialSetup(prepared.input);
    expect(answer.classification).toBe("contingent");
    expect(answer.yes?.shownTokens[0]).toBe("Investigator");
    expect(answer.no?.roles[0]).toBe("Investigator");
  });

  it("does not read a later private report through an older branch revision", () => {
    let workspace = createStandardWorkspace(9);
    workspace = createStandardBranch(workspace, "旧修订");
    const oldId = workspace.activeBranchId;
    workspace = { ...workspace, activeBranchId: workspace.branches[0].id };
    workspace = commitStandardEntry(workspace, "1 chef 0 @N1");
    const reportId = workspace.events[1].id;
    workspace = { ...workspace, activeBranchId: oldId };
    workspace = adopted(
      addStandardHypothesis(workspace, {
        kind: "report_accurate",
        eventId: reportId,
      }),
    );
    const prepared = prepareStandardSetupQuery(workspace);
    expect(prepared.status).toBe("unsupported");
    if (prepared.status === "unsupported")
      expect(prepared.reason).toContain("当前修订或私密视角");
  });

  it("preserves an append-only retraction and blocks unsupported day facts", () => {
    let workspace = createStandardWorkspace(8);
    workspace = commitStandardEntry(workspace, "4 nom 4 @D1", "public");
    const recordedId = workspace.events[0].id;
    expect(prepareStandardSetupQuery(workspace).status).toBe("unsupported");
    workspace = retractStandardEvent(workspace, recordedId);
    expect(workspace.events).toHaveLength(2);
    expect(visibleStandardEvents(workspace, 1)).toEqual([]);
    expect(prepareStandardSetupQuery(workspace).status).toBe("ready");
    expect(validateStandardWorkspace(structuredClone(workspace))).toEqual(
      workspace,
    );
  });

  it("uses only closed day and night observations to infer hidden actions", async () => {
    let workspace = createStandardWorkspace(7);
    for (const [seat, role] of [
      [1, "Imp"],
      [2, "Spy"],
      [3, "Investigator"],
      [4, "Chef"],
      [5, "Empath"],
      [6, "Slayer"],
    ] as const) {
      workspace = adopted(
        addStandardHypothesis(workspace, {
          kind: "actual_role",
          seat,
          role,
        }),
      );
    }
    workspace = { ...workspace, query: { seat: 7, role: "Soldier" } };
    workspace = commitStandardEntry(workspace, "close actions @D1", "public");
    expect(prepareStandardObservedQuery(workspace).status).toBe("unsupported");
    workspace = commitStandardEntry(workspace, "close deaths @D1", "public");
    workspace = commitStandardEntry(workspace, "7 dead @N2", "public");
    expect(prepareStandardObservedQuery(workspace).status).toBe("unsupported");
    workspace = commitStandardEntry(workspace, "close deaths @N2", "public");
    const prepared = prepareStandardObservedQuery(workspace);
    expect(prepared.status).toBe("ready");
    if (prepared.status !== "ready") throw new Error(prepared.reason);
    expect(prepared.input.phases).toHaveLength(3);
    expect(prepared.sourceIds).toHaveLength(4);
    expect((await queryObservedTimeline(prepared.input)).classification).toBe(
      "impossible",
    );
  });

  it("records an observed victory without treating an unrecorded one as fact", () => {
    let workspace = createStandardWorkspace(8);
    workspace = commitStandardEntry(workspace, "close actions @D1", "public");
    workspace = commitStandardEntry(workspace, "close deaths @D1", "public");
    let prepared = prepareStandardObservedQuery(workspace);
    if (prepared.status !== "ready") throw new Error(prepared.reason);
    expect(prepared.input.phases[1]).not.toHaveProperty("winner");
    workspace = commitStandardEntry(workspace, "win evil @D1", "public");
    prepared = prepareStandardObservedQuery(workspace);
    if (prepared.status !== "ready") throw new Error(prepared.reason);
    expect(prepared.input.phases[1]).toMatchObject({ winner: "evil" });
  });

  it("accepts a closed nomination with no vote for possible Virgin execution", () => {
    let workspace = createStandardWorkspace(8);
    workspace = commitStandardEntry(workspace, "1 nom 2 @D1", "public");
    workspace = commitStandardEntry(workspace, "exec 1 @D1", "public");
    workspace = commitStandardEntry(workspace, "1 dead @D1", "public");
    workspace = commitStandardEntry(workspace, "close actions @D1", "public");
    workspace = commitStandardEntry(workspace, "close deaths @D1", "public");
    const prepared = prepareStandardObservedQuery(workspace);
    expect(prepared.status).toBe("ready");
    if (prepared.status !== "ready") throw new Error(prepared.reason);
    expect(prepared.input.phases[1]).toMatchObject({
      kind: "day",
      events: [{ kind: "nomination", votes: [] }],
      deaths: [1],
      executedSeat: 1,
    });
  });

  it("binds later role reports to the current closed night", () => {
    let workspace = createStandardWorkspace(8);
    workspace = commitStandardEntry(workspace, "close actions @D1", "public");
    workspace = commitStandardEntry(workspace, "close deaths @D1", "public");
    workspace = commitStandardEntry(workspace, "close deaths @N2", "public");
    workspace = commitStandardEntry(workspace, "6 ut spy @N2");
    const undertakerId = workspace.events.at(-1)!.id;
    workspace = commitStandardEntry(workspace, "3 rk 4 chef @N2");
    const ravenkeeperId = workspace.events.at(-1)!.id;
    for (const eventId of [undertakerId, ravenkeeperId]) {
      workspace = adopted(
        addStandardHypothesis(workspace, {
          kind: "report_accurate",
          eventId,
        }),
      );
      workspace = adopted(
        addStandardHypothesis(workspace, {
          kind: "ability_active",
          eventId,
        }),
      );
    }
    const prepared = prepareStandardObservedQuery(workspace);
    expect(prepared.status).toBe("ready");
    if (prepared.status !== "ready") throw new Error(prepared.reason);
    expect(prepared.input.laterReports).toEqual([
      {
        kind: "undertaker",
        cycle: 2,
        speaker: 6,
        seenRole: "Spy",
        acceptedMessage: true,
        abilityActive: true,
      },
      {
        kind: "ravenkeeper",
        cycle: 2,
        speaker: 3,
        target: 4,
        seenRole: "Chef",
        acceptedMessage: true,
        abilityActive: true,
      },
    ]);
    expect(prepared.sourceIds).toContain(undertakerId);
    expect(prepared.sourceIds).toContain(ravenkeeperId);
  });

  it.each([2, 3])(
    "keeps an accepted N%i report usable after closing the following day",
    (cycle) => {
      let workspace = createStandardWorkspace(8);
      for (let day = 1; day < cycle; day++) {
        workspace = commitStandardEntry(workspace, `close actions @D${day}`);
        workspace = commitStandardEntry(workspace, `close deaths @D${day}`);
        workspace = commitStandardEntry(workspace, `close deaths @N${day + 1}`);
      }
      workspace = commitStandardEntry(workspace, `3 emp 0 @N${cycle}`);
      const eventId = workspace.events.at(-1)!.id;
      for (const kind of ["report_accurate", "ability_active"] as const) {
        workspace = adopted(
          addStandardHypothesis(workspace, { kind, eventId }),
        );
      }
      const atNight = prepareStandardObservedQuery(workspace);
      if (atNight.status !== "ready") throw new Error(atNight.reason);

      workspace = commitStandardEntry(workspace, `close actions @D${cycle}`);
      workspace = commitStandardEntry(workspace, `close deaths @D${cycle}`);
      const atDay = prepareStandardObservedQuery(workspace);
      expect(atDay.status).toBe("ready");
      if (atDay.status !== "ready") throw new Error(atDay.reason);
      expect(atDay.input.phases.at(-1)).toMatchObject({ kind: "day", cycle });
      expect(atDay.input.laterReports).toEqual(atNight.input.laterReports);
      expect(atDay.input.laterReports).toEqual([
        {
          kind: "empath",
          cycle,
          speaker: 3,
          count: 0,
          acceptedMessage: true,
          abilityActive: true,
        },
      ]);
      expect(atDay.sourceIds).toContain(eventId);
    },
  );

  it("rejects an accepted report from a night beyond the closed timeline", () => {
    let workspace = createStandardWorkspace(8);
    for (const line of [
      "close actions @D1",
      "close deaths @D1",
      "close deaths @N2",
      "close actions @D2",
      "close deaths @D2",
      "3 emp 0 @N3",
    ]) {
      workspace = commitStandardEntry(workspace, line);
    }
    const eventId = workspace.events.at(-1)!.id;
    for (const kind of ["report_accurate", "ability_active"] as const) {
      workspace = adopted(addStandardHypothesis(workspace, { kind, eventId }));
    }
    const prepared = prepareStandardObservedQuery(workspace);
    expect(prepared).toMatchObject({
      status: "unsupported",
      reason: "N3报告所在夜晚尚未封闭。",
    });
  });

  it("still requires explicit night closure before accepting a later report", () => {
    let workspace = createStandardWorkspace(8);
    for (const line of [
      "close actions @D1",
      "close deaths @D1",
      "close actions @D2",
      "close deaths @D2",
      "3 emp 0 @N2",
    ]) {
      workspace = commitStandardEntry(workspace, line);
    }
    const eventId = workspace.events.at(-1)!.id;
    for (const kind of ["report_accurate", "ability_active"] as const) {
      workspace = adopted(addStandardHypothesis(workspace, { kind, eventId }));
    }
    const prepared = prepareStandardObservedQuery(workspace);
    expect(prepared.status).toBe("unsupported");
    if (prepared.status === "unsupported")
      expect(prepared.reason).toContain("close deaths @N2");
  });

  it("requires a closed phase before querying a current role", () => {
    let workspace = createStandardWorkspace(8);
    workspace = {
      ...workspace,
      query: { seat: 1, role: "Imp", stage: "current" },
    };
    expect(prepareStandardSetupQuery(workspace).status).toBe("unsupported");
    workspace = commitStandardEntry(workspace, "close actions @D1", "public");
    workspace = commitStandardEntry(workspace, "close deaths @D1", "public");
    const prepared = prepareStandardObservedQuery(workspace);
    expect(prepared.status).toBe("ready");
    if (prepared.status !== "ready") throw new Error(prepared.reason);
    expect(prepared.input.currentQuery).toEqual({ seat: 1, role: "Imp" });
  });

  it("does not treat two accepted same-night Empath numbers as separate abilities", () => {
    let workspace = createStandardWorkspace(8);
    workspace = commitStandardEntry(workspace, "close actions @D1", "public");
    workspace = commitStandardEntry(workspace, "close deaths @D1", "public");
    workspace = commitStandardEntry(workspace, "close deaths @N2", "public");
    for (const value of [0, 1]) {
      workspace = commitStandardEntry(workspace, `3 emp ${value} @N2`);
      const eventId = workspace.events.at(-1)!.id;
      workspace = adopted(
        addStandardHypothesis(workspace, {
          kind: "report_accurate",
          eventId,
        }),
      );
      workspace = adopted(
        addStandardHypothesis(workspace, {
          kind: "ability_active",
          eventId,
        }),
      );
    }
    const prepared = prepareStandardObservedQuery(workspace);
    expect(prepared.status).toBe("unsupported");
    if (prepared.status === "unsupported")
      expect(prepared.reason).toContain("只能采纳一次");
  });

  it("rejects damaged standard imports before rendering or solving", () => {
    const base = commitStandardEntry(
      createStandardWorkspace(8),
      "1 chef 0 @N1",
    );
    expect(validateStandardWorkspace(structuredClone(base))).toEqual(base);
    const missingBranch = structuredClone(base);
    delete (
      missingBranch.branches[0] as Partial<(typeof base.branches)[number]>
    ).assumptionIds;
    expect(() => validateStandardWorkspace(missingBranch)).toThrow("分支");
    const badPayload = structuredClone(base);
    badPayload.events[1].payload = { kind: "death", seat: 99 };
    expect(() => validateStandardWorkspace(badPayload)).toThrow("事件载荷");
    const leaked = structuredClone(base);
    delete (leaked.events[0] as { ownerSeat?: number }).ownerSeat;
    expect(() => validateStandardWorkspace(leaked)).toThrow("事件无效");
    const mixedPerspective = structuredClone(base);
    mixedPerspective.events[0].ownerSeat = 2;
    expect(() => validateStandardWorkspace(mixedPerspective)).toThrow(
      "事件无效",
    );
  });
});
