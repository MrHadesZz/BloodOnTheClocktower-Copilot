import type { AssumptionId, EventEnvelope } from "./model";
import {
  classify,
  solve,
  type Query,
  type SolverResult,
  type Witness,
} from "./solver";

export interface EssentialPremise {
  id: AssumptionId;
  witness: Witness;
}

export interface Analysis {
  result: SolverResult;
  essential: EssentialPremise[];
}

/** This pure function is shared by the Worker and small regression tests. */
export function analyze(
  events: EventEnvelope[],
  assumptions: AssumptionId[],
  revision: number,
  query: Query,
): Analysis {
  const result = solve(events, assumptions, revision);
  if (
    result.status !== "sat" ||
    classify(result, query).classification !== "necessary"
  ) {
    return { result, essential: [] };
  }
  const essential = assumptions.flatMap((id) => {
    const relaxed = solve(
      events,
      assumptions.filter((item) => item !== id),
      revision,
    );
    const witness = classify(relaxed, query).no;
    return witness ? [{ id, witness }] : [];
  });
  return { result, essential };
}
