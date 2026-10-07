import type { Role, GameTime, EventPayload } from "../src/core/model";
import {
  createStandardWorkspace,
  commitStandardDrafts,
  addStandardHypothesis,
  toggleStandardHypothesis,
  prepareStandardObservedQuery,
  type StandardWorkspace,
} from "../src/core/standardWorkspace";
import { closeStandardPhase } from "../src/core/standardHistory";
import type { ObservedQueryInput } from "../src/core/symbolicSetup";

export interface BenchmarkFixture {
  id: string;
  playerCount: number;
  density: "sparse" | "medium" | "dense";
  nights: number;
  roles: Role[];
  workspace: StandardWorkspace;
  input: ObservedQueryInput;
}

/** Synthetic, known legal histories; density counts adopted reports, not UI text. */
export function benchmarkFixtures(timeoutMs = 2000): BenchmarkFixture[] {
  const fixtures: BenchmarkFixture[] = [];
  for (const playerCount of [10, 12, 15]) {
    const roles: Role[] = [
      "Empath",
      "Chef",
      "Fortune Teller",
      "Undertaker",
      "Slayer",
      "Washerwoman",
      "Monk",
      ...(playerCount === 15 ? (["Virgin", "Soldier"] as Role[]) : []),
      ...(playerCount >= 12 ? (["Butler", "Recluse"] as Role[]) : []),
      "Spy",
      "Scarlet Woman",
      ...(playerCount === 15 ? (["Poisoner"] as Role[]) : []),
      "Imp",
    ];
    for (const density of ["sparse", "medium", "dense"] as const) {
      for (const nights of [2, 3]) {
        let w = createStandardWorkspace(playerCount);
        const id = `${playerCount}p-${density}-N${nights}`;
        w = {
          ...w,
          title: `V1 基准 ${id}`,
          query: { seat: playerCount, role: "Imp", stage: "initial" },
          recordingTime: { phase: "night", cycle: nights },
        };
        const adopt = (draft: Parameters<typeof addStandardHypothesis>[1]) => {
          w = addStandardHypothesis(w, draft);
          w = toggleStandardHypothesis(w, w.hypotheses.at(-1)!.id);
        };
        // Hold identity-fact density constant between medium/dense to isolate reports.
        if (density !== "sparse") {
          for (const [position, role] of roles.entries()) {
            if (position >= 6) continue;
            adopt({ kind: "actual_role", seat: position + 1, role });
          }
          if (roles.includes("Poisoner"))
            adopt({
              kind: "night_one_poison",
              poisonerSeat: roles.indexOf("Poisoner") + 1,
              targetSeat: 7,
            });
        }
        const record = (
          time: GameTime,
          payload: EventPayload,
          accept = false,
        ) => {
          w = commitStandardDrafts(
            w,
            "synthetic V1 benchmark",
            [
              {
                occurredAt: time,
                payload,
                label: "基准记录",
                sourceSpan: [0, 22],
              },
            ],
            "public",
          );
          if (accept) {
            const eventId = w.events.at(-1)!.id;
            adopt({ kind: "report_accurate", eventId });
            adopt({ kind: "ability_active", eventId });
          }
        };
        for (let cycle = 1; cycle <= nights; cycle++) {
          const time = { phase: "night", cycle } as const;
          if (cycle > 1)
            record(time, { kind: "death", seat: cycle === 2 ? 2 : 5 });
          if (density !== "sparse") {
            record(
              time,
              {
                kind: "claim",
                claimKind: "ability_report",
                role: "Empath",
                speaker: 1,
                value: 1,
              },
              true,
            );
            if (density === "dense") {
              record(
                time,
                {
                  kind: "claim",
                  claimKind: "ability_report",
                  role: "Fortune Teller",
                  speaker: 3,
                  targets: [playerCount - 1, playerCount],
                  value: true,
                },
                true,
              );
              if (cycle === 1) {
                record(
                  time,
                  {
                    kind: "claim",
                    claimKind: "ability_report",
                    role: "Chef",
                    speaker: 2,
                    value: playerCount === 15 ? 3 : 2,
                  },
                  true,
                );
                record(
                  time,
                  {
                    kind: "claim",
                    claimKind: "ability_report",
                    role: "Washerwoman",
                    speaker: 6,
                    targets: [1, 2],
                    value: "Empath",
                  },
                  true,
                );
              }
              if (cycle === 2)
                record(
                  time,
                  {
                    kind: "claim",
                    claimKind: "ability_report",
                    role: "Undertaker",
                    speaker: 4,
                    value: "Washerwoman",
                  },
                  true,
                );
            }
          }
          w = closeStandardPhase(w, time, true);
          if (cycle === nights) break;
          const day = { phase: "day", cycle } as const;
          if (cycle === 1) {
            record(day, { kind: "nomination", nominator: 1, nominee: 6 });
            record(day, {
              kind: "vote",
              nominee: 6,
              voters: Array.from(
                { length: Math.ceil(playerCount / 2) },
                (_, i) => i + 1,
              ),
            });
            record(day, { kind: "execution", seat: 6 });
            record(day, { kind: "death", seat: 6 });
          }
          w = closeStandardPhase(w, day, true);
        }
        const prepared = prepareStandardObservedQuery(w);
        if (prepared.status !== "ready")
          throw new Error(`${id}: ${prepared.reason}`);
        fixtures.push({
          id,
          playerCount,
          density,
          nights,
          roles,
          workspace: w,
          input: {
            ...prepared.input,
            timeoutMs,
            maxWorlds: 1000,
            maxHistories: 10000,
          },
        });
      }
    }
  }
  return fixtures;
}

export function summarize(
  samples: Array<{
    elapsedMs: number;
    classification: string;
    unknownReason?: string;
    error?: string;
  }>,
) {
  const times = samples.map((s) => s.elapsedMs).sort((a, b) => a - b);
  const percentile = (q: number) =>
    times[Math.max(0, Math.ceil(q * times.length) - 1)];
  return {
    samples: samples.length,
    p50Ms: percentile(0.5),
    p95Ms: percentile(0.95),
    unknownRate:
      samples.filter((s) => s.classification === "unknown").length /
      samples.length,
    errors: samples.filter((s) => s.error).length,
  };
}
