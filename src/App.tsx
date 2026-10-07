import { useEffect, useRef, useState } from "react";
import { GitBranch, List, Users, X } from "lucide-react";
import { Grimoire } from "./components/Grimoire";
import { StandardWorkbench } from "./components/StandardWorkbench";
import {
  createStandardWorkspace,
  loadStandardWorkspace,
  saveStandardWorkspace,
  type StandardWorkspace,
} from "./core/standardWorkspace";
import {
  EntryBar,
  PlayerDetail,
  PlayerRail,
  ReasoningPanel,
  Timeline,
  TopBar,
} from "./components/Workbench";
import {
  AssumptionId,
  EventDraft,
  EventEnvelope,
  WorkspaceData,
} from "./core/model";
import { Query } from "./core/solver";
import { useResult } from "./core/useResult";
import {
  commitDrafts,
  createBranch,
  createFixture,
  loadWorkspace,
  retractEvent,
  saveWorkspace,
  validateImport,
} from "./core/workspace";
import "./styles.css";

export default function App() {
  const [data, setData] = useState<WorkspaceData>(createFixture);
  const [standardData, setStandardData] = useState<StandardWorkspace>(() =>
    createStandardWorkspace(8),
  );
  const [standardLoaded, setStandardLoaded] = useState(false);
  const [offlineReady, setOfflineReady] = useState(false);
  const [standardSaved, setStandardSaved] = useState("正在载入本地记录");
  const [surface, setSurface] = useState<"h0" | "standard" | "grimoire">(() => {
    try {
      const last = localStorage.getItem("clocktower-surface-v2");
      return last === "standard" || last === "h0" ? last : "grimoire";
    } catch {
      return "grimoire";
    }
  });
  const [loaded, setLoaded] = useState(false);
  const [saved, setSaved] = useState("正在载入本地记录");
  const [error, setError] = useState("");
  const [mode, setMode] = useState<"reason" | "player">("reason");
  const [mobilePane, setMobilePane] = useState<
    "players" | "reason" | "timeline"
  >("reason");
  const [selectedEvent, setSelectedEvent] = useState<EventEnvelope | null>(
    null,
  );
  const [query, setQuery] = useState<Query>({
    kind: "actual_role",
    seat: 7,
    role: "Imp",
  });
  const [ranQuery, setRanQuery] = useState<Query>({
    kind: "actual_role",
    seat: 7,
    role: "Imp",
  });
  const saveQueue = useRef(Promise.resolve());
  const standardSaveQueue = useRef(Promise.resolve());
  const standardSaveVersion = useRef(0);
  const {
    branch,
    result,
    essential,
    pending,
    error: solverError,
  } = useResult(data, ranQuery);

  useEffect(() => {
    if (!import.meta.env.PROD || !("serviceWorker" in navigator)) return;
    let alive = true;
    void navigator.serviceWorker.ready.then(() => {
      if (alive) setOfflineReady(true);
    });
    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    let alive = true;
    loadWorkspace()
      .then((workspace) => {
        if (!alive) return;
        if (workspace) setData(validateImport(workspace));
        setSaved("本地已保存");
        setLoaded(true);
      })
      .catch(() => {
        if (alive) {
          setSaved("本地存储不可用");
          setLoaded(true);
        }
      });
    return () => {
      alive = false;
    };
  }, []);
  useEffect(() => {
    if (!loaded || saved === "本地存储不可用") return;
    setSaved("正在保存");
    saveQueue.current = saveQueue.current
      .then(() => saveWorkspace(data))
      .then(() => setSaved("本地已保存"))
      .catch(() => setSaved("本地存储不可用"));
  }, [data, loaded]);

  useEffect(() => {
    try {
      localStorage.setItem("clocktower-surface-v2", surface);
    } catch {
      // IndexedDB still stores both workspaces when localStorage is unavailable.
    }
  }, [surface]);
  useEffect(() => {
    let alive = true;
    loadStandardWorkspace()
      .then((workspace) => {
        if (!alive) return;
        if (workspace) setStandardData(workspace);
        setStandardSaved("本地已保存");
        setStandardLoaded(true);
      })
      .catch(() => {
        if (alive) {
          setStandardSaved("本地存储不可用");
          setStandardLoaded(true);
        }
      });
    return () => {
      alive = false;
    };
  }, []);
  useEffect(() => {
    if (!standardLoaded || standardSaved === "本地存储不可用") return;
    setStandardSaved("正在保存");
    const version = standardSaveVersion.current;
    standardSaveQueue.current = standardSaveQueue.current
      .then(() => saveStandardWorkspace(standardData))
      .then(() => {
        if (version === standardSaveVersion.current)
          setStandardSaved("本地已保存");
      })
      .catch(() => {
        if (version === standardSaveVersion.current)
          setStandardSaved("本地存储不可用");
      });
  }, [standardData, standardLoaded]);

  const commit = (text: string, drafts: EventDraft[]) => {
    const next = commitDrafts(data, text, drafts);
    setData(next);
    setMode("reason");
    setMobilePane("reason");
  };
  const toggle = (id: AssumptionId) =>
    setData((previous) => ({
      ...previous,
      branches: previous.branches.map((b) =>
        b.id === previous.activeBranchId
          ? {
              ...b,
              assumptions: b.assumptions.includes(id)
                ? b.assumptions.filter((x) => x !== id)
                : [...b.assumptions, id],
            }
          : b,
      ),
    }));
  const rebase = () =>
    setData((previous) => ({
      ...previous,
      branches: previous.branches.map((b) =>
        b.id === previous.activeBranchId
          ? { ...b, baseRevision: previous.events.length }
          : b,
      ),
    }));
  const newBranch = () => {
    const name = window.prompt(
      "新分支名称",
      `分支 ${data.branches.length + 1}`,
    );
    if (name !== null) {
      setData((previous) => createBranch(previous, name));
      setMode("reason");
    }
  };
  const exportData = () => {
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `clocktower-${data.gameId}-r${data.events.length}.json`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };
  const importData = async (file: File) => {
    try {
      const parsed = validateImport(JSON.parse(await file.text()));
      setData(parsed);
      setSelectedEvent(null);
      setError("");
    } catch (e) {
      setError((e as Error).message);
    }
  };
  const reset = () => {
    if (window.confirm("重置为设计包中的八人示例？当前工作区记录会被替换。")) {
      setData(createFixture());
      setSelectedEvent(null);
      setMode("reason");
    }
  };
  const retract = (id: string) => {
    if (!window.confirm("将追加一条撤回误录事件，保留原始记录历史。继续吗？"))
      return;
    try {
      const next = retractEvent(data, id);
      setData(next);
      setSelectedEvent(null);
    } catch (e) {
      setError((e as Error).message);
    }
  };

  if (surface === "grimoire") {
    return standardLoaded ? (
      <Grimoire
        workspace={standardData}
        saved={standardSaved}
        onAdvanced={() => setSurface("standard")}
        onChange={(next) => {
          standardSaveVersion.current++;
          setStandardSaved("正在保存");
          setStandardData(next);
        }}
      />
    ) : (
      <div className="app-shell">
        <p role="status">正在载入魔典…</p>
      </div>
    );
  }

  if (surface === "standard") {
    return standardLoaded ? (
      <StandardWorkbench
        workspace={standardData}
        onChange={(next) => {
          standardSaveVersion.current++;
          setStandardSaved("正在保存");
          setStandardData(next);
        }}
        onBack={() => setSurface("grimoire")}
        onExample={() => setSurface("h0")}
        saved={standardSaved}
        offlineReady={offlineReady}
      />
    ) : (
      <div className="app-shell">
        <SolverStatus pending error={null} />
      </div>
    );
  }

  return (
    <div className="app-shell">
      <TopBar
        data={data}
        branch={branch}
        saved={saved}
        onSelectBranch={(id) => {
          setData((previous) => ({ ...previous, activeBranchId: id }));
          setMode("reason");
        }}
        onNewBranch={newBranch}
        onExport={exportData}
        onImport={importData}
        onReset={reset}
        onOpenStandard={() => setSurface("standard")}
      />
      {error && (
        <div className="global-error" role="alert">
          {error}
          <button onClick={() => setError("")} aria-label="关闭错误">
            <X size={16} />
          </button>
        </div>
      )}
      <div className="workspace">
        <div className={`left-column mobile-${mobilePane}`}>
          <PlayerRail
            data={data}
            revision={branch.baseRevision}
            selectedSeat={data.selectedSeat}
            onSelect={(seat) => {
              setData((previous) => ({ ...previous, selectedSeat: seat }));
              setMode("player");
              setMobilePane("reason");
            }}
          />
        </div>
        <main className={`main-column mobile-${mobilePane}`}>
          <EntryBar onCommit={commit} />
          <div className="main-content">
            {mode === "player" ? (
              <>
                <button
                  className="back-to-reason"
                  onClick={() => setMode("reason")}
                >
                  ← 返回条件推理
                </button>
                {result ? (
                  <PlayerDetail
                    data={data}
                    revision={branch.baseRevision}
                    seat={data.selectedSeat}
                    result={result}
                  />
                ) : (
                  <SolverStatus pending={pending} error={solverError} />
                )}
              </>
            ) : result ? (
              <ReasoningPanel
                data={data}
                branch={branch}
                result={result}
                essential={essential}
                query={query}
                setQuery={setQuery}
                ranQuery={ranQuery}
                setRanQuery={setRanQuery}
                onToggle={toggle}
                onRebase={rebase}
                onSetupDraftChange={(setupDraft) =>
                  setData((previous) => ({ ...previous, setupDraft }))
                }
              />
            ) : (
              <SolverStatus pending={pending} error={solverError} />
            )}
          </div>
        </main>
        <div className={`right-column mobile-${mobilePane}`}>
          <Timeline
            data={data}
            revision={branch.baseRevision}
            selectedEvent={selectedEvent}
            onSelectEvent={setSelectedEvent}
            onRetract={retract}
          />
        </div>
      </div>
      <nav className="mobile-nav" aria-label="移动端导航">
        <button
          className={mobilePane === "players" ? "active" : ""}
          onClick={() => setMobilePane("players")}
        >
          <Users size={19} />
          玩家
        </button>
        <button
          className={mobilePane === "reason" ? "active" : ""}
          onClick={() => setMobilePane("reason")}
        >
          <GitBranch size={19} />
          推理
        </button>
        <button
          className={mobilePane === "timeline" ? "active" : ""}
          onClick={() => setMobilePane("timeline")}
        >
          <List size={19} />
          时间线
        </button>
      </nav>
      <footer className="app-footer">
        <span>
          钟楼推理台 · 开发试用版 · 本地优先 · 所有结论仅在明确前提下成立
        </span>
        <span>设计包八人限定案例 · 无概率输出</span>
      </footer>
    </div>
  );
}

function SolverStatus({
  pending,
  error,
}: {
  pending: boolean;
  error: string | null;
}) {
  return (
    <section className="solver-status" role="status">
      <h1>{pending ? "正在分析当前分支" : "推理暂不可用"}</h1>
      <p>{error ?? "记录已保存，正在等待独立推理线程返回结果。"}</p>
    </section>
  );
}
