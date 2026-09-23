import { useApp } from "../store";
import {
  SECTIONS_BY_ID,
  assetsBySection,
  tasksBySection,
  blocksBySection,
  FEASIBLE_WINDOWS_BY_REQUEST,
  OPTIMIZED_PLANS_BY_REQUEST,
  trafficIntensity,
} from "../data/seed";

const HEALTH_COLOR = (h: number) =>
  h >= 90 ? "#3F8F45" : h >= 75 ? "#1769AA" : h >= 60 ? "#D97706" : "#D9534F";

const TRAFFIC_COLOR: Record<string, string> = {
  "VERY LOW": "#3F8F45",
  LOW: "#1769AA",
  MEDIUM: "#D97706",
  HIGH: "#D9534F",
};

export default function SectionDetail() {
  const {
    selectedSection,
    setSelectedSection,
    setSelectedAsset,
    blockStatuses,
    updateBlockStatus,
    addAuditEvent,
    showToast,
    activeBlockRequestId,
  } = useApp();

  if (!selectedSection) return null;
  const section = SECTIONS_BY_ID[selectedSection];
  if (!section) return null;

  const assets = assetsBySection(selectedSection);
  const tasks = tasksBySection(selectedSection);
  const blocks = blocksBySection(selectedSection);
  const traffic = trafficIntensity(selectedSection);
  const avgHealth = assets.length
    ? Math.round(assets.reduce((s, a) => s + a.health, 0) / assets.length)
    : 100;
  const activeTrains = 2;

  // Anchor block chain for this section
  const anchorBlocks = blocks.filter(
    (b) => b.id === activeBlockRequestId
  );
  const anchorBlock = anchorBlocks[0];
  const anchorWindows = anchorBlock
    ? FEASIBLE_WINDOWS_BY_REQUEST[anchorBlock.id] ?? []
    : [];
  const anchorPlans = anchorBlock
    ? OPTIMIZED_PLANS_BY_REQUEST[anchorBlock.id] ?? []
    : [];

  function handleApproveBlock(blockId: string) {
    updateBlockStatus(blockId, "APPROVED");
    addAuditEvent({
      timestamp: new Date().toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
      }),
      action: `Block ${blockId} approved from section detail`,
      actor: "COA USER",
      details: `Block ${blockId} approved via ${selectedSection} detail panel.`,
      type: "APPROVAL",
    });
    showToast(`Block ${blockId} approved`, "success");
  }

  return (
    <div
      className="absolute top-2 right-2 z-20 rounded-lg overflow-hidden slide-in"
      style={{
        width: 320,
        background: "#fff",
        border: "1px solid #E2E8F0",
        boxShadow: "0 8px 32px rgba(23,50,77,0.18)",
      }}
    >
      {/* Header */}
      <div
        className="px-4 py-3 flex items-center justify-between"
        style={{ background: "var(--navy)" }}
      >
        <div>
          <p className="font-bold text-white text-sm">
            {selectedSection} — {section.from}–{section.to}
          </p>
          <p className="text-white/60 text-xs">
            {section.trackConfiguration} · {section.capacityTrainsPerHour} tph · {section.trafficType}
          </p>
        </div>
        <button
          onClick={() => setSelectedSection(null)}
          className="text-white/60 hover:text-white text-lg leading-none"
        >
          ×
        </button>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-3 gap-px" style={{ background: "var(--border)" }}>
        {[
          {
            label: "Asset Health",
            value: `${avgHealth}%`,
            color: HEALTH_COLOR(avgHealth),
          },
          { label: "Active Trains", value: activeTrains, color: "#1769AA" },
          {
            label: "Tasks",
            value: tasks.length,
            color: tasks.some((t) => t.status === "OVERDUE") ? "#D9534F" : "#64748B",
          },
        ].map((s) => (
          <div key={s.label} className="bg-white py-2.5 text-center">
            <p className="font-bold text-base" style={{ color: s.color }}>
              {s.value}
            </p>
            <p style={{ color: "var(--text-secondary)", fontSize: 9 }}>
              {s.label}
            </p>
          </div>
        ))}
      </div>

      <div className="overflow-y-auto" style={{ maxHeight: 420 }}>
        {/* Traffic intensity */}
        <div
          className="px-3 py-2.5 border-b"
          style={{ borderColor: "var(--border)" }}
        >
          <p
            className="text-xs font-semibold mb-2 uppercase tracking-wider"
            style={{ color: "var(--navy)" }}
          >
            Traffic Intensity
          </p>
          <div className="flex items-center justify-between text-xs">
            <span style={{ color: "var(--text-secondary)" }}>
              Current window
            </span>
            <span
              className="font-semibold"
              style={{ color: TRAFFIC_COLOR[traffic] }}
            >
              {traffic}
            </span>
          </div>
        </div>

        {/* Assets */}
        {assets.length > 0 && (
          <div
            className="px-3 py-2.5 border-b"
            style={{ borderColor: "var(--border)" }}
          >
            <p
              className="text-xs font-semibold mb-2 uppercase tracking-wider"
              style={{ color: "var(--navy)" }}
            >
              Assets ({assets.length})
            </p>
            <div className="space-y-1.5">
              {assets.slice(0, 5).map((a) => (
                <button
                  key={a.id}
                  className="w-full flex items-center gap-2 text-left hover:bg-slate-50 rounded px-1 py-0.5 transition-colors"
                  onClick={() => setSelectedAsset(a.id)}
                >
                  <div
                    className="w-7 h-7 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0"
                    style={{ background: HEALTH_COLOR(a.health), fontSize: 9 }}
                  >
                    {a.health}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold">{a.id}</p>
                    <p style={{ color: "var(--text-secondary)", fontSize: 9 }}>
                      {a.type}
                    </p>
                  </div>
                  {a.defectStatus !== "NONE" && (
                    <span
                      className={`chip chip-${
                        a.defectStatus === "CRITICAL" ? "red" : "orange"
                      }`}
                      style={{ fontSize: 8 }}
                    >
                      {a.defectStatus}
                    </span>
                  )}
                </button>
              ))}
              {assets.length > 5 && (
                <p style={{ color: "var(--text-secondary)", fontSize: 10 }}>
                  +{assets.length - 5} more
                </p>
              )}
            </div>
          </div>
        )}

        {/* Maintenance tasks */}
        {tasks.length > 0 && (
          <div
            className="px-3 py-2.5 border-b"
            style={{ borderColor: "var(--border)" }}
          >
            <p
              className="text-xs font-semibold mb-2 uppercase tracking-wider"
              style={{ color: "var(--navy)" }}
            >
              Maintenance Tasks ({tasks.length})
            </p>
            <div className="space-y-1">
              {tasks.slice(0, 6).map((t) => (
                <div key={t.id} className="flex items-center gap-2 text-xs">
                  <span
                    className={`chip chip-${
                      t.status === "OVERDUE"
                        ? "red"
                        : t.status === "DUE_SOON"
                        ? "orange"
                        : "gray"
                    }`}
                    style={{ fontSize: 8 }}
                  >
                    {t.status.replace("_", " ")}
                  </span>
                  <span className="font-medium">{t.id}</span>
                  <span style={{ color: "var(--text-secondary)" }}>
                    {t.workType.slice(0, 22)}…
                  </span>
                  <span
                    className="ml-auto font-semibold"
                    style={{ color: t.priority >= 80 ? "#D9534F" : "#D97706" }}
                  >
                    P{t.priority}
                  </span>
                </div>
              ))}
              {tasks.length > 6 && (
                <p style={{ color: "var(--text-secondary)", fontSize: 10 }}>
                  +{tasks.length - 6} more
                </p>
              )}
            </div>
          </div>
        )}

        {/* Anchor block chain — feasible windows */}
        {anchorWindows.length > 0 && (
          <div
            className="px-3 py-2.5 border-b"
            style={{ borderColor: "var(--border)" }}
          >
            <p
              className="text-xs font-semibold mb-2 uppercase tracking-wider"
              style={{ color: "var(--navy)" }}
            >
              Feasible Windows ({anchorWindows.length})
            </p>
            <div className="space-y-1">
              {anchorWindows.map((w) => (
                <div
                  key={w.windowId}
                  className="flex items-center justify-between text-xs rounded px-2 py-1"
                  style={{
                    background: w.feasible ? "#F0FDF4" : "#FEF2F2",
                    border: `1px solid ${w.feasible ? "#86EFAC" : "#FCA5A5"}`,
                  }}
                >
                  <div className="flex flex-col">
                    <span className="font-mono font-semibold">
                      {w.windowStart.split(" ")[1]}–{w.windowEnd.split(" ")[1]}
                    </span>
                    <span style={{ color: "var(--text-secondary)", fontSize: 9 }}>
                      {w.windowId}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    {w.feasible ? (
                      <span className="chip chip-green" style={{ fontSize: 8 }}>
                        FEASIBLE
                      </span>
                    ) : (
                      <span className="chip chip-red" style={{ fontSize: 8 }}>
                        REJECTED
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Anchor block chain — optimized plans */}
        {anchorPlans.length > 0 && (
          <div
            className="px-3 py-2.5 border-b"
            style={{ borderColor: "var(--border)" }}
          >
            <p
              className="text-xs font-semibold mb-2 uppercase tracking-wider"
              style={{ color: "var(--navy)" }}
            >
              Optimized Plans ({anchorPlans.length})
            </p>
            <div className="space-y-1.5">
              {anchorPlans.map((p) => (
                <div
                  key={p.planId}
                  className="rounded p-2"
                  style={{ background: "#F5F3FF", border: "1px solid #DDD6FE" }}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-xs mono" style={{ color: "#5B21B6" }}>
                      {p.planId}
                    </span>
                    <span className="chip chip-purple" style={{ fontSize: 8 }}>
                      {p.priority}
                    </span>
                  </div>
                  <p className="text-xs" style={{ color: "#6B3FA0" }}>
                    {p.assetId} · {p.department === "ST" ? "S&T" : p.department}
                  </p>
                  <p className="text-xs" style={{ color: "var(--text-secondary)" }}>
                    {p.startTime.split(" ")[1]}–{p.endTime.split(" ")[1]} · {p.duration} min
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Block requests on this section */}
        {blocks.length > 0 && (
          <div className="px-3 py-2.5">
            <p
              className="text-xs font-semibold mb-2 uppercase tracking-wider"
              style={{ color: "var(--navy)" }}
            >
              Block Requests ({blocks.length})
            </p>
            <div className="space-y-2">
              {blocks.slice(0, 4).map((b) => {
                const status = blockStatuses[b.id] || b.status;
                return (
                  <div
                    key={b.id}
                    className="rounded p-2"
                    style={{
                      background: "#F8FAFC",
                      border: "1px solid var(--border)",
                    }}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-xs mono">{b.id}</span>
                      <span
                        className="chip"
                        style={{
                          background:
                            status === "APPROVED"
                              ? "#DCFCE7"
                              : status === "RECOMMENDED"
                              ? "#EDE9FE"
                              : status === "UNDER_REVIEW"
                              ? "#FEF3C7"
                              : "#F1F5F9",
                          color:
                            status === "APPROVED"
                              ? "#166534"
                              : status === "RECOMMENDED"
                              ? "#5B21B6"
                              : status === "UNDER_REVIEW"
                              ? "#B45309"
                              : "#475569",
                          fontSize: 8,
                        }}
                      >
                        {status}
                      </span>
                    </div>
                    <p
                      className="text-xs"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      {b.requestedStart}–{b.requestedEnd} · {b.departments.join("+")}
                    </p>
                    {status === "RECOMMENDED" && b.id === activeBlockRequestId && (
                      <button
                        onClick={() => handleApproveBlock(b.id)}
                        className="w-full mt-1.5 py-1 rounded text-xs font-semibold"
                        style={{ background: "#3F8F45", color: "white" }}
                      >
                        APPROVE {b.id}
                      </button>
                    )}
                  </div>
                );
              })}
              {blocks.length > 4 && (
                <p style={{ color: "var(--text-secondary)", fontSize: 10 }}>
                  +{blocks.length - 4} more
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}