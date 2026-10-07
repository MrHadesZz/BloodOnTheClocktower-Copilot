import {
  prepareStandardObservedQuery,
  prepareStandardSetupQuery,
  visibleStandardEvents,
  type StandardWorkspace,
} from "./standardWorkspace";
import type {
  ObservedQueryInput,
  SetupQueryInput,
  SetupQueryResult,
} from "./symbolicSetup";

export interface StandardSolvers {
  setup: (input: SetupQueryInput) => Promise<SetupQueryResult>;
  observed: (input: ObservedQueryInput) => Promise<SetupQueryResult>;
}

/** All query surfaces use the same revision, privacy and phase-closure boundary. */
export async function solveStandardWorkspace(
  workspace: StandardWorkspace,
  solvers: StandardSolvers,
  timeoutMs?: number,
) {
  const branch = workspace.branches.find(
    (b) => b.id === workspace.activeBranchId,
  );
  if (!branch) throw new Error("活动分支不存在。");
  const events = visibleStandardEvents(
    workspace,
    workspace.perspectiveSeat,
    branch.baseRevision,
  );
  const dynamic = events.some(
    (e) => !["claim", "retraction"].includes(e.payload.kind),
  );
  const phaseRolePremise = workspace.hypotheses.some(
    (h) => h.kind === "role_at_phase" && branch.assumptionIds.includes(h.id),
  );
  if (dynamic || phaseRolePremise) {
    const prepared = prepareStandardObservedQuery(workspace);
    if (prepared.status !== "ready") throw new Error(prepared.reason);
    const answer = await solvers.observed({
      ...prepared.input,
      ...(timeoutMs !== undefined ? { timeoutMs } : {}),
    });
    return {
      answer,
      sourceIds: prepared.sourceIds,
      revision: prepared.revision,
    };
  }
  const prepared = prepareStandardSetupQuery(workspace);
  if (prepared.status !== "ready") throw new Error(prepared.reason);
  const answer = await solvers.setup({
    ...prepared.input,
    ...(timeoutMs !== undefined ? { timeoutMs } : {}),
  });
  return { answer, sourceIds: prepared.sourceIds, revision: prepared.revision };
}
