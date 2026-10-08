import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  queryZ3Conflict,
  queryZ3Claims,
  queryZ3ClaimConditions,
  queryZ3FactHistory,
} from "./z3Client";
import { createStandardWorkspace } from "./standardWorkspace";
import type { ConflictAnalysis } from "./conflict";
import type { FactHistoryAnalysis } from "./factHistory";

class FakeWorker {
  static instances: FakeWorker[] = [];
  requestId = "";
  request?: { requestId: string; kind?: string; options?: unknown };
  onmessage?: (event: { data: unknown }) => void;
  onerror?: (event: { message: string; preventDefault: () => void }) => void;
  terminate = vi.fn();
  constructor() {
    FakeWorker.instances.push(this);
  }
  postMessage(request: {
    requestId: string;
    kind?: string;
    options?: unknown;
  }) {
    this.request = request;
    this.requestId = request.requestId;
  }
  progress(value: unknown) {
    this.onmessage?.({ data: { requestId: this.requestId, progress: value } });
  }
  error(message = "Uncaught [object ErrorEvent]") {
    const preventDefault = vi.fn();
    this.onerror?.({ message, preventDefault });
    return preventDefault;
  }
  result(value: unknown) {
    this.onmessage?.({ data: { requestId: this.requestId, result: value } });
  }
}
const confirmed: ConflictAnalysis = {
  status: "partial",
  assumptionIds: ["a", "b"],
  checks: 3,
  rulesetHash: "test-v1",
  deletionWitnesses: [],
};

describe("bounded recovery from a worker error without evidence", () => {
  it("restarts once and accepts only the replacement worker's result", async () => {
    const pending = queryZ3FactHistory(createStandardWorkspace(7));
    const first = FakeWorker.instances[0];
    expect(first.error()).toHaveBeenCalledOnce();
    const second = FakeWorker.instances[1];
    expect(first.terminate).toHaveBeenCalledOnce();
    expect(second.request).toEqual(first.request);
    const answer = { status: "compatible", checks: 1 };
    second.result(answer);
    expect(await pending).toEqual(answer);
    expect(second.terminate).toHaveBeenCalledOnce();
    expect(vi.getTimerCount()).toBe(0);
  });
  it("stops after the second worker fails", async () => {
    const pending = queryZ3FactHistory(createStandardWorkspace(7));
    const rejected = expect(pending).rejects.toThrow("second failure");
    FakeWorker.instances[0].error();
    FakeWorker.instances[1].error("second failure");
    await rejected;
    expect(FakeWorker.instances).toHaveLength(2);
    expect(
      FakeWorker.instances.every(
        (worker) => worker.terminate.mock.calls.length === 1,
      ),
    ).toBe(true);
    expect(vi.getTimerCount()).toBe(0);
  });
  it("does not rerun a request which has already emitted evidence", async () => {
    const onProgress = vi.fn();
    const pending = queryZ3FactHistory(
      createStandardWorkspace(7),
      {},
      undefined,
      onProgress,
    );
    const rejected = expect(pending).rejects.toThrow("failed after proof");
    const proof = { status: "partial", boundary: { phase: "night", cycle: 2 } };
    FakeWorker.instances[0].progress(proof);
    FakeWorker.instances[0].error("failed after proof");
    await rejected;
    expect(FakeWorker.instances).toHaveLength(1);
    expect(onProgress).toHaveBeenCalledExactlyOnceWith(proof);
  });
  it("cancels the replacement worker and ignores subsequent old-worker errors", async () => {
    const controller = new AbortController();
    const pending = queryZ3FactHistory(
      createStandardWorkspace(7),
      {},
      controller.signal,
    );
    const rejected = expect(pending).rejects.toMatchObject({
      name: "AbortError",
    });
    const first = FakeWorker.instances[0];
    first.error();
    controller.abort();
    first.error("late error");
    await rejected;
    expect(FakeWorker.instances).toHaveLength(2);
    expect(FakeWorker.instances[1].terminate).toHaveBeenCalledOnce();
    expect(vi.getTimerCount()).toBe(0);
  });
  it("does not extend the original deadline when the runtime is replaced", async () => {
    const pending = queryZ3FactHistory(createStandardWorkspace(7), {
      budgetMs: 1,
    });
    const rejected = expect(pending).rejects.toThrow("结果未知");
    await vi.advanceTimersByTimeAsync(1000);
    FakeWorker.instances[0].error();
    await vi.advanceTimersByTimeAsync(4001);
    await rejected;
    expect(FakeWorker.instances[1].terminate).toHaveBeenCalledOnce();
    expect(vi.getTimerCount()).toBe(0);
  });
  it("ignores old progress and results even though both attempts share the request id", async () => {
    const onProgress = vi.fn();
    const pending = queryZ3FactHistory(
      createStandardWorkspace(7),
      {},
      undefined,
      onProgress,
    );
    const first = FakeWorker.instances[0];
    first.error();
    first.progress({ status: "located", boundary: { phase: "day", cycle: 1 } });
    first.result({ status: "located" });
    expect(onProgress).not.toHaveBeenCalled();
    const answer = { status: "unknown", checks: 1 };
    FakeWorker.instances[1].result(answer);
    expect(await pending).toEqual(answer);
  });
  it("cleans the timer and listener if worker construction is rejected by the platform", async () => {
    vi.stubGlobal(
      "Worker",
      class {
        constructor() {
          throw new Error("construction denied");
        }
      },
    );
    await expect(
      queryZ3FactHistory(createStandardWorkspace(7)),
    ).rejects.toThrow("construction denied");
    expect(vi.getTimerCount()).toBe(0);
  });
});

describe("history diagnosis worker lifecycle", () => {
  const progress: FactHistoryAnalysis = {
    status: "partial",
    revision: 8,
    assumptionIds: [],
    checks: 2,
    complete: false,
    boundary: { phase: "day", cycle: 2 },
    sourceIds: ["execution"],
    steps: [
      {
        time: { phase: "day", cycle: 2 },
        status: "conflict",
        sourceIds: ["execution"],
      },
    ],
  };
  it("retains verified prefix evidence on external deadline without certifying the earliest boundary", async () => {
    const pending = queryZ3FactHistory(createStandardWorkspace(7), {
      budgetMs: 1,
    });
    const worker = FakeWorker.instances[0];
    worker.progress(progress);
    await vi.advanceTimersByTimeAsync(5001);
    const result = await pending;
    expect(result.status).toBe("partial");
    expect(result.boundary).toEqual(progress.boundary);
    expect(result.sourceIds).toEqual(progress.sourceIds);
    expect(result.complete).toBe(false);
    expect(worker.terminate).toHaveBeenCalledOnce();
    expect(vi.getTimerCount()).toBe(0);
  });
  it("cancels the worker, immediately forwards evidence, and ignores late progress", async () => {
    const controller = new AbortController();
    const onProgress = vi.fn();
    const pending = queryZ3FactHistory(
      createStandardWorkspace(7),
      { includeAssumptions: false },
      controller.signal,
      onProgress,
    );
    const worker = FakeWorker.instances[0];
    expect(worker.request?.kind).toBe("fact_history");
    expect(worker.request?.options).toEqual({ includeAssumptions: false });
    worker.progress(progress);
    expect(onProgress).toHaveBeenCalledWith(progress);
    controller.abort();
    await expect(pending).rejects.toMatchObject({ name: "AbortError" });
    worker.progress({ ...progress, complete: true });
    expect(onProgress).toHaveBeenCalledOnce();
    expect(worker.terminate).toHaveBeenCalledOnce();
    expect(vi.getTimerCount()).toBe(0);
  });
  it("returns unknown if initialization ends without confirmed progress", async () => {
    const pending = queryZ3FactHistory(createStandardWorkspace(7), {
      budgetMs: 1,
    });
    const rejection = expect(pending).rejects.toThrow("结果未知");
    await vi.advanceTimersByTimeAsync(5001);
    await rejection;
    expect(FakeWorker.instances[0].terminate).toHaveBeenCalledOnce();
  });
});

beforeEach(() => {
  vi.useFakeTimers();
  FakeWorker.instances = [];
  vi.stubGlobal("Worker", FakeWorker);
  vi.stubGlobal("crossOriginIsolated", true);
  vi.stubGlobal("__Z3_ENGINE_VERSION__", "test");
});
afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

describe("conflict worker deadline and cancellation", () => {
  it("retains confirmed partial evidence when an in-flight solver exceeds its deadline", async () => {
    const result = queryZ3Conflict(createStandardWorkspace(7), { budgetMs: 1 });
    const worker = FakeWorker.instances[0];
    worker.progress(confirmed);
    await vi.advanceTimersByTimeAsync(5001);
    const answer = await result;
    expect(answer.status).toBe("partial");
    expect(answer.assumptionIds).toEqual(["a", "b"]);
    expect(answer.reason).toContain("时间预算");
    expect(worker.terminate).toHaveBeenCalledOnce();
    expect(vi.getTimerCount()).toBe(0);
  });
  it("does not fabricate conflict evidence if initialization or the baseline times out", async () => {
    const result = queryZ3Conflict(createStandardWorkspace(7), { budgetMs: 1 });
    const rejection = expect(result).rejects.toThrow("结果未知");
    await vi.advanceTimersByTimeAsync(5001);
    await rejection;
    expect(FakeWorker.instances[0].terminate).toHaveBeenCalledOnce();
  });
  it("cancels and terminates the worker even after receiving partial progress", async () => {
    const controller = new AbortController();
    const result = queryZ3Conflict(
      createStandardWorkspace(7),
      {},
      controller.signal,
    );
    FakeWorker.instances[0].progress(confirmed);
    controller.abort();
    await expect(result).rejects.toMatchObject({ name: "AbortError" });
    expect(FakeWorker.instances[0].terminate).toHaveBeenCalledOnce();
    expect(vi.getTimerCount()).toBe(0);
  });
});

describe("claim analysis worker deadline and cancellation", () => {
  it("retains verified claim trials on timeout without claiming the analysis is complete", async () => {
    const pending = queryZ3Claims(createStandardWorkspace(7), { budgetMs: 1 });
    const progress = {
      status: "conflict",
      revision: 2,
      groups: [],
      coreSeats: [1, 2],
      coreMinimal: false,
      complete: false,
      checks: 3,
      trials: [{ seat: 1, status: "compatible" }],
      repairs: [
        {
          seats: [1, 2],
          minimal: false,
          witness: { roles: [], shownTokens: [], registrations: [] },
        },
      ],
      repairSearchComplete: false,
    };
    FakeWorker.instances[0].progress(progress);
    await vi.advanceTimersByTimeAsync(5001);
    const answer = await pending;
    expect(answer.status).toBe("conflict");
    expect(answer.coreSeats).toEqual([1, 2]);
    expect(answer.trials).toEqual(progress.trials);
    expect(answer.repairs).toEqual(progress.repairs);
    expect(answer.repairSearchComplete).toBe(false);
    expect(answer.complete).toBe(false);
    expect(FakeWorker.instances[0].terminate).toHaveBeenCalledOnce();
  });
  it("does not fabricate suspects when initialization or baseline times out", async () => {
    const pending = queryZ3Claims(createStandardWorkspace(7), { budgetMs: 1 });
    const rejection = expect(pending).rejects.toThrow("结果未知");
    await vi.advanceTimersByTimeAsync(5001);
    await rejection;
    expect(FakeWorker.instances[0].terminate).toHaveBeenCalledOnce();
  });
  it("terminates the analysis worker when its panel is cancelled or closed", async () => {
    const controller = new AbortController();
    const pending = queryZ3Claims(
      createStandardWorkspace(7),
      {},
      controller.signal,
    );
    controller.abort();
    await expect(pending).rejects.toMatchObject({ name: "AbortError" });
    expect(FakeWorker.instances[0].terminate).toHaveBeenCalledOnce();
    expect(vi.getTimerCount()).toBe(0);
  });
});

describe("claim analysis progressive evidence", () => {
  it("forwards verified progress immediately and ignores late events after cancellation", async () => {
    const controller = new AbortController();
    const onProgress = vi.fn();
    const pending = queryZ3Claims(
      createStandardWorkspace(7),
      { maxRepairs: 2 },
      controller.signal,
      onProgress,
    );
    const worker = FakeWorker.instances[0];
    expect(worker.request?.kind).toBe("claim_analysis");
    expect(worker.request?.options).toEqual({ maxRepairs: 2 });
    const progress = {
      status: "conflict",
      complete: false,
      repairs: [{ seats: [1, 3], minimal: false }],
    };
    worker.progress(progress);
    expect(onProgress).toHaveBeenCalledWith(progress);
    controller.abort();
    await expect(pending).rejects.toMatchObject({ name: "AbortError" });
    worker.progress({ ...progress, complete: true });
    expect(onProgress).toHaveBeenCalledOnce();
    expect(worker.terminate).toHaveBeenCalledOnce();
  });
});

describe("claim condition worker evidence", () => {
  const progress = {
    status: "conflict",
    revision: 2,
    seats: [1],
    conditions: [],
    coreIds: ["accurate", "active"],
    coreMinimal: false,
    complete: false,
    searchComplete: false,
    checks: 3,
    trials: [],
    explanations: [
      {
        relaxedIds: ["accurate"],
        minimal: false,
        witness: { roles: [], shownTokens: [], registrations: [] },
      },
    ],
  };
  it("retains verified explanations on deadline with an incomplete search", async () => {
    const pending = queryZ3ClaimConditions(createStandardWorkspace(7), [1], {
      budgetMs: 1,
    });
    const worker = FakeWorker.instances[0];
    expect(worker.request?.kind).toBe("claim_diagnosis");
    worker.progress(progress);
    await vi.advanceTimersByTimeAsync(5001);
    const answer = await pending;
    expect(answer.explanations).toEqual(progress.explanations);
    expect(answer.searchComplete).toBe(false);
    expect(answer.complete).toBe(false);
    expect(answer.reason).toContain("细查达到时间预算");
    expect(worker.terminate).toHaveBeenCalledOnce();
  });
  it("cancels diagnosis, forwards evidence immediately, and ignores late results", async () => {
    const controller = new AbortController();
    const onProgress = vi.fn();
    const pending = queryZ3ClaimConditions(
      createStandardWorkspace(7),
      [1],
      {},
      controller.signal,
      onProgress,
    );
    const worker = FakeWorker.instances[0];
    worker.progress(progress);
    expect(onProgress).toHaveBeenCalledWith(progress);
    controller.abort();
    await expect(pending).rejects.toMatchObject({ name: "AbortError" });
    worker.progress({ ...progress, complete: true });
    expect(onProgress).toHaveBeenCalledOnce();
    expect(worker.terminate).toHaveBeenCalledOnce();
    expect(vi.getTimerCount()).toBe(0);
  });
  it("returns unknown when initialization has no confirmed evidence", async () => {
    const pending = queryZ3ClaimConditions(createStandardWorkspace(7), [1], {
      budgetMs: 1,
    });
    const rejection = expect(pending).rejects.toThrow("结果未知");
    await vi.advanceTimersByTimeAsync(5001);
    await rejection;
    expect(FakeWorker.instances[0].terminate).toHaveBeenCalledOnce();
  });
});
