// ============================================================
// PipelineHUD — Visible 8-stage pipeline for the demo
// Shows: Data → AI → Constraint → Coordination → Optimize
//        → Controller → Live Event → Re-optimize
// Each stage lights up and displays the actual record flowing through it.
// ============================================================

import { useApp } from "../store";
import type { PipelineStage, PipelineStep } from "../types";

// ---------- Stage metadata ----------

const STAGE_META: Record<
  PipelineStage,
  { label: string; short: string; color: string; icon: string }
> = {
  IDLE:        { label: "Idle",               short: "IDLE",   color: "#94A3B8", icon: "○" },
  INGEST:      { label: "Data Ingest",        short: "DATA",   color: "#1769AA", icon: "◱" },
  AI:          { label: "AI Predict",         short: "AI",     color: "#6B3FA0", icon: "◈" },
  CONSTRAINT:  { label: "Constraint Check",   short: "CONSTR", color: "#D97706", icon: "⊟" },
  COORDINATION:{ label: "Coordination",       short: "COORD",  color: "#16827A", icon: "⇌" },
  OPTIMIZE:    { label: "OR-Tools Optimize",  short: "OPT",    color: "#3F8F45", icon: "★" },
  CONTROLLER:  { label: "Controller Review",  short: "COA",    color: "#17324D", icon: "◉" },
  LIVE:        { label: "Live Event",         short: "LIVE",   color: "#D9534F", icon: "⚠" },
  REOPTIMIZE:  { label: "Re-optimize",        short: "REOPT",  color: "#6B3FA0", icon: "↻" },
};

const ORDER: PipelineStage[] = [
  "INGEST",
  "AI",
  "CONSTRAINT",
  "COORDINATION",
  "OPTIMIZE",
  "CONTROLLER",
  "LIVE",
  "REOPTIMIZE",
];

// ---------- Sub-components ----------

function StageNode({ step, active }: { step: PipelineStep; active: boolean }) {
  const meta = STAGE_META[step.stage];
  const done = step.status === "DONE";
  const running = step.status === "RUNNING";

  const bg = done ? meta.color : running ? meta.color : "#F1F5F9";
  const fg = done || running ? "white" : "#94A3B8";
  const border = running ? `2px solid ${meta.color}` : "1px solid #E2E8F0";

  return (
    <div
      className="flex flex-col items-center flex-shrink-0 relative"
      style={{ width: 96 }}
    >
      {running && (
        <span
          className="absolute -top-1 -right-1 w-2 h-2 rounded-full pulse-dot"
          style={{ background: meta.color }}
        />
      )}
      <div
        className="w-9 h-9 rounded-full flex items-center justify-center font-bold transition-all"
        style={{
          background: bg,
          color: fg,
          border,
          fontSize: 14,
        }}
      >
        {done ? "✓" : meta.icon}
      </div>
      <p
        className="mt-1 font-bold tracking-wide text-center leading-tight"
        style={{
          color: done || running ? meta.color : "#94A3B8",
          fontSize: 9,
        }}
      >
        {meta.short}
      </p>
    </div>
  );
}

function Connector({ fromDone, color }: { fromDone: boolean; color: string }) {
  return (
    <div
      className="flex-shrink-0 self-start"
      style={{
        width: 22,
        height: 2,
        marginTop: 17,
        background: fromDone ? color : "#E2E8F0",
        transition: "background 300ms",
      }}
    />
  );
}

// ---------- Main component ----------

export default function PipelineHUD() {
  const { pipelineStage, pipelineHistory, demoMode } = useApp();

  // Hide HUD when not in demo mode and pipeline is idle
  if (!demoMode && pipelineStage === "IDLE") return null;

  const currentIdx = ORDER.indexOf(pipelineStage);

  return (
    <div
      className="flex-shrink-0 px-4 py-2 border-b"
      style={{
        background: "#FFFFFF",
        borderColor: "#E2E8F0",
      }}
    >
      {/* Stage rail */}
      <div className="flex items-center justify-between" style={{ maxWidth: 1100 }}>
        <div className="flex items-center">
          {ORDER.map((stage, i) => {
            const step =
              pipelineHistory.find((s) => s.stage === stage) ?? {
                stage,
                label: STAGE_META[stage].label,
                status: "PENDING" as const,
              };
            const active = pipelineStage === stage;
            return (
              <div key={stage} className="flex items-center">
                <StageNode step={step} active={active} />
                {i < ORDER.length - 1 && (
                  <Connector
                    fromDone={i < currentIdx}
                    color={STAGE_META[stage].color}
                  />
                )}
              </div>
            );
          })}
        </div>

        {/* Active summary */}
        {pipelineStage !== "IDLE" && (
          <div
            className="ml-4 rounded px-3 py-1.5 flex-shrink-0"
            style={{
              background: `${STAGE_META[pipelineStage].color}15`,
              border: `1px solid ${STAGE_META[pipelineStage].color}40`,
              maxWidth: 380,
            }}
          >
            <p
              className="font-bold"
              style={{
                color: STAGE_META[pipelineStage].color,
                fontSize: 9,
                letterSpacing: "0.06em",
              }}
            >
              {STAGE_META[pipelineStage].label.toUpperCase()}
            </p>
            <p
              className="mono truncate"
              style={{
                color: STAGE_META[pipelineStage].color,
                fontSize: 10,
              }}
            >
              {pipelineHistory.find((s) => s.stage === pipelineStage)
                ?.summary ??
                pipelineHistory.find((s) => s.stage === pipelineStage)
                  ?.recordId ??
                "Running…"}
            </p>
          </div>
        )}
      </div>

      {/* Record tape — shows the last 3 records flowing through */}
      {pipelineHistory.some((s) => s.recordId) && (
        <div className="flex gap-2 mt-2 overflow-x-auto">
          {pipelineHistory
            .filter((s) => s.recordId)
            .slice(-4)
            .map((s) => (
              <span
                key={s.stage + (s.recordId ?? "")}
                className="chip flex-shrink-0"
                style={{
                  background: `${STAGE_META[s.stage].color}12`,
                  color: STAGE_META[s.stage].color,
                  border: `1px solid ${STAGE_META[s.stage].color}40`,
                  fontSize: 9,
                }}
              >
                {STAGE_META[s.stage].short} · {s.recordId}
              </span>
            ))}
        </div>
      )}
    </div>
  );
}