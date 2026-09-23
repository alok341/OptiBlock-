import { useApp } from "../store";

const ROLE_LABELS: Record<string, string> = {
  COA: "COA / Control Office",
  ENGINEERING: "Engineering",
  ST: "S&T",
  TRACTION: "Traction",
  ADMIN: "Admin",
};

const PAGE_LABELS: Record<string, string> = {
  overview: "Control Office — Overview",
  maintenance: "Maintenance Intelligence",
  "block-planning": "Block Planning",
  "live-operations": "Live Operations",
  "railway-health": "Railway Health",
  coordination: "Coordinated Maintenance",
  conflicts: "Conflicts & Constraints",
  "what-if": "What-If Simulator",
  reports: "Reports & Analytics",
  architecture: "System Architecture",
};

const STAGE_LABELS: Record<string, { label: string; color: string }> = {
  IDLE: { label: "IDLE", color: "#94A3B8" },
  INGEST: { label: "INGEST", color: "#1769AA" },
  AI: { label: "AI", color: "#6B3FA0" },
  CONSTRAINT: { label: "CONSTRAINT", color: "#D97706" },
  COORDINATION: { label: "COORDINATION", color: "#16827A" },
  OPTIMIZE: { label: "OPTIMIZE", color: "#3F8F45" },
  CONTROLLER: { label: "CONTROLLER", color: "#17324D" },
  LIVE: { label: "LIVE", color: "#D9534F" },
  REOPTIMIZE: { label: "REOPTIMIZE", color: "#6B3FA0" },
};

function liveDate() {
  return new Date().toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default function TopBar() {
  const {
    page,
    setPage,
    role,
    demoMode,
    setDemoMode,
    setDemoStep,
    trainDelayActive,
    toast,
    pipelineStage,
    resetPipeline,
    advancePipeline,
  } = useApp();

  const stage = STAGE_LABELS[pipelineStage] ?? STAGE_LABELS.IDLE;

  return (
    <header
      style={{
        background: "#fff",
        borderBottom: "1px solid #E2E8F0",
        height: 52,
      }}
      className="flex items-center px-5 gap-4 flex-shrink-0 relative z-20"
    >
      <div className="flex items-center gap-2 flex-1">
        <span
          className="font-bold text-sm tracking-wide"
          style={{ color: "var(--navy)" }}
        >
          OPTIBLOCK
        </span>
        <span
          style={{ color: "var(--text-secondary)" }}
          className="text-xs"
        >
          ·
        </span>
        <span
          style={{ color: "var(--text-secondary)" }}
          className="text-xs"
        >
          Mumbai — Central Railway Prototype
        </span>
        <span
          style={{ color: "var(--text-secondary)" }}
          className="text-xs"
        >
          ·
        </span>
        <span
          className="text-xs font-semibold"
          style={{ color: "var(--text-primary)" }}
        >
          {PAGE_LABELS[page] || page}
        </span>
      </div>

      <div className="flex items-center gap-3">
        <span
          className="text-xs"
          style={{ color: "var(--text-secondary)" }}
        >
          {liveDate()}
        </span>

        <div
          className="flex items-center gap-1.5 px-2.5 py-1 rounded"
          style={{ background: "#CCFBF1" }}
        >
          <span
            className="pulse-dot w-1.5 h-1.5"
            style={{ background: "#16827A" }}
          />
          <span
            className="text-xs font-semibold"
            style={{ color: "#0F766E" }}
          >
            SIMULATED LIVE
          </span>
        </div>

        {/* Pipeline stage indicator */}
        {pipelineStage !== "IDLE" && (
          <div
            className="flex items-center gap-1.5 px-2.5 py-1 rounded"
            style={{
              background: `${stage.color}15`,
              border: `1px solid ${stage.color}40`,
            }}
          >
            <span
              className="w-1.5 h-1.5 rounded-full"
              style={{ background: stage.color }}
            />
            <span
              className="text-xs font-bold tracking-wide"
              style={{ color: stage.color }}
            >
              {stage.label}
            </span>
          </div>
        )}

        {trainDelayActive && (
          <div
            className="flex items-center gap-1.5 px-2.5 py-1 rounded animate-pulse"
            style={{ background: "#FEF3C7" }}
          >
            <span
              className="text-xs font-semibold"
              style={{ color: "#B45309" }}
            >
              ⚠ EVT ACTIVE
            </span>
          </div>
        )}

        <button
          onClick={() => {
            if (!demoMode) {
              resetPipeline();
              setDemoStep(0);
              setPage("architecture");
              setDemoMode(true);
              setTimeout(() => {
                advancePipeline(
                  "INGEST",
                  "17 CSVs",
                  "~1,315 records normalized into unified store"
                );
              }, 100);
            } else {
              setDemoMode(false);
            }
          }}
          className="flex items-center gap-1.5 px-3 py-1 rounded text-xs font-semibold transition-colors"
          style={{
            background: demoMode ? "#6B3FA0" : "#EDE9FE",
            color: demoMode ? "#fff" : "#6B3FA0",
          }}
        >
          {demoMode ? "▶ DEMO ACTIVE" : "▶ DEMO MODE"}
        </button>

        <div
          className="flex items-center gap-1.5 px-2.5 py-1 rounded"
          style={{ background: "#F1F5F9" }}
        >
          <span
            className="text-xs font-medium"
            style={{ color: "var(--navy)" }}
          >
            {ROLE_LABELS[role]}
          </span>
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <div
          className="absolute top-14 right-5 px-4 py-2.5 rounded shadow-lg text-sm font-medium z-50 fade-in"
          style={{
            background:
              toast.type === "success"
                ? "#DCFCE7"
                : toast.type === "warning"
                ? "#FEF3C7"
                : toast.type === "error"
                ? "#FEE2E2"
                : "#DBEAFE",
            color:
              toast.type === "success"
                ? "#166534"
                : toast.type === "warning"
                ? "#B45309"
                : toast.type === "error"
                ? "#B91C1C"
                : "#1D4ED8",
            border: `1px solid ${
              toast.type === "success"
                ? "#86EFAC"
                : toast.type === "warning"
                ? "#FCD34D"
                : toast.type === "error"
                ? "#FCA5A5"
                : "#93C5FD"
            }`,
          }}
        >
          {toast.message}
        </div>
      )}
    </header>
  );
}