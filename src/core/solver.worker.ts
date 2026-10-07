/// <reference lib="webworker" />
import { analyze } from "./analysis";
import type { AssumptionId, EventEnvelope } from "./model";
import type { Query } from "./solver";

interface Request {
  requestId: string;
  events: EventEnvelope[];
  assumptions: AssumptionId[];
  revision: number;
  query: Query;
}

self.onmessage = (event: MessageEvent<Request>) => {
  const { requestId, events, assumptions, revision, query } = event.data;
  try {
    self.postMessage({
      requestId,
      analysis: analyze(events, assumptions, revision, query),
    });
  } catch (error) {
    self.postMessage({
      requestId,
      error: error instanceof Error ? error.message : String(error),
    });
  }
};
