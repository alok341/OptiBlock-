// ============================================================
// Overview — Control Office dashboard
// 3-column layout: WHAT / WHERE / WHAT SHOULD WE DO
// Wired to CSV-driven seed + pipeline state from the store.
// ============================================================

import { useState } from "react";
import { useApp } from "../store";
import RailwayMap from "../components/RailwayMap";
import CorridorStrip from "../components/CorridorStrip";
import {
  SECTIONS_BY_ID,
  ENRICHED_ASSETS,
  MAINTENANCE_TASKS,
  BLOCK_REQUESTS_BY_ID,
  AI_BY_ASSET,
  sectionHealth,
  sectionRisk,
  topPriorityTasks,
  activeEvents,
  ANCHOR_BLOCK_REQUEST_ID,
  ANCHOR_ASSET_ID,
  ANCHOR_SECTION_ID,
} from "../data/seed";

// ---------- Role-specific KPI strips ----------

const ROLE_KPIS: Record<string, { label: string; value: string; sub: string; color: string }[]> = {
  COA: [
    { label: "Asset Availability", value: "94.2%", sub: "Fleet-wide", color: "#3F8F45" },
    { label: "High Priority Tasks", value: "6", sub: "Need attention", color: "#D97706" },
    { label: "Upcoming Blocks", value: "8", sub: "Next 24h", color: "#1769AA" },
    { label: "Active Events", value: "2", sub: "Detected", color: "#D9534F" },
    { label: "Expected Delay", value: "3.8 min", sub: "Avg per block", color: "#6B3FA0" },
    { label: "Critical Assets", value: "7", sub: "Across corridor", color: "#D9534F" },
  ],
  ENGINEERING: [
    { label: "Critical Track Assets", value: "4", sub: "Need maintenance", color: "#D9534F" },
    { label: "High Priority", value: "5", sub: "Engineering tasks", color: "#D97706" },
    { label: "Overdue Tasks", value: "3", sub: "Past deadline", color: "#D9534F" },
    { label: "Recommended Blocks", value: "4", sub: "AI suggested", color: "#6B3FA0" },
    { label: "Crews Available", value: "8", sub: "Tonight", color: "#3F8F45" },
    { label: "Blocks Approved", value: "3", sub: "This week", color: "#3F8F45" },
  ],
  ST: [
    { label: "Critical Signals", value: "3", sub: "Need attention", color: "#D9534F" },
    { label: "Open Defects", value: "7", sub: "S&T assets", color: "#D97706" },
    { label: "High Priority", value: "4", sub: "S&T tasks", color: "#D97706" },
    { label: "Recommended Blocks", value: "3", sub: "AI suggested", color: "#6B3FA0" },
    { label: "Crews Available", value: "5", sub: "Tonight", color: "#3F8F45" },
    { label: "Blocks Approved", value: "2", sub: "This week", color: "#3F8F45" },
  ],
  TRACTION: [
    { label: "Critical OHE Assets", value: "2", sub: "Need maintenance", color: "#D9534F" },
    { label: "Open Defects", value: "5", sub: "Traction assets", color: "#D97706" },
    { label: "High Priority", value: "3", sub: "Traction tasks", color: "#D97706" },
    { label: "Recommended Blocks", value: "2", sub: "AI suggested", color: "#6B3FA0" },
    { label: "Crews Available", value: "4", sub: "Tonight", color: "#3F8F45" },
    { label: "Blocks Approved", value: "1", sub: "This week", color: "#3F8F45" },
  ],
  ADMIN: [
    { label: "Active Users", value: "12", sub: "All roles", color: "#1769AA" },
    { label: "System Status", value: "OK", sub: "All services healthy", color: "#3F8F45" },
    { label: "Data Sources", value: "17", sub: "CSV datasets", color: "#6B3FA0" },
    { label: "Pending Config", value: "2", sub: "Awaiting review", color: "#D97706" },
    { label: "Audit Events", value: "16", sub: "Last hour", color: "#1769AA" },
    { label: "Blocks Today", value: "8", sub: "Across corridor", color: "#17324D" },
  ],
};

// ---------- WHY panel ----------

function WhyPanel({ onClose }: { onClose: () => void }) {
  const { activePrediction, activeFeasibleWindows, activeOptimizedPlans } = useApp();
  const section = SECTIONS_BY_ID[ANCHOR_SECTION_ID];
  const plan = activeOptimizedPlans[0];
  const feasibleWindow = activeFeasibleWindows.find((w) => w.feasible);

  return (
    <div
      className="rounded-md p-4 slide-in"
      style={{ background: "#F5F3FF", border: "1px solid #C4B5FD" }}
    >
      <div className="flex items-center justify-between mb-3">
        <div>
          <p className="font-bold text-sm" style={{ color: "#5B21B6" }}>
            WHY THIS WINDOW?
          </p>
          <p className="text-xs" style={{ color: "#6B3FA0" }}>
            {ANCHOR_BLOCK_REQUEST_ID} · {ANCHOR_SECTION_ID}{" "}
            {section ? `(${section.from}–${section.to})` : ""} · Priority{" "}
            {activePrediction?.priorityScore ?? "—"} / 100
          </p>
        </div>
        <button
          onClick={onClose}
          className="text-lg"
          style={{ color: "#6B3FA0" }}
        >
          ×
        </button>
      </div>

      <div className="space-y-2 mb-3">
        {[
          {
            label: "Asset Health",
            raw: `${activePrediction?.healthScore ?? "—"} / 100`,
            fill: 100 - (activePrediction?.healthScore ?? 0),
            color: "#D97706",
          },
          {
            label: "Failure Risk",
            raw: `${activePrediction?.riskScore ?? "—"}%`,
            fill: activePrediction?.riskScore ?? 0,
            color: "#D9534F",
          },
          {
            label: "Criticality",
            raw: activePrediction?.priorityLevel ?? "—",
            fill: activePrediction?.priorityScore ?? 0,
            color: "#D97706",
          },
          {
            label: "Predicted Failure",
            raw: activePrediction?.predictedFailure ? "YES" : "NO",
            fill: activePrediction?.predictedFailure ? 90 : 20,
            color: activePrediction?.predictedFailure ? "#D9534F" : "#3F8F45",
          },
          {
            label: "Feasible Window",
            raw: feasibleWindow
              ? `${feasibleWindow.windowStart.split(" ")[1]}–${feasibleWindow.windowEnd.split(" ")[1]}`
              : "—",
            fill: feasibleWindow ? 90 : 20,
            color: "#3F8F45",
          },
          {
            label: "Train Impact",
            raw: plan ? `${plan.trainDelay} min` : "—",
            fill: plan && plan.trainDelay === 0 ? 20 : 70,
            color: plan && plan.trainDelay === 0 ? "#3F8F45" : "#D97706",
          },
          {
            label: "Compatible Work",
            raw: plan ? plan.department : "—",
            fill: 80,
            color: "#1769AA",
          },
          {
            label: "Conflicts",
            raw: `${plan?.conflictCount ?? 0}`,
            fill: plan && plan.conflictCount === 0 ? 10 : 60,
            color: plan && plan.conflictCount === 0 ? "#3F8F45" : "#D9534F",
          },
        ].map((f) => (
          <div key={f.label}>
            <div className="flex justify-between text-xs mb-0.5">
              <span style={{ color: "#6B3FA0" }}>{f.label}</span>
              <span className="font-bold" style={{ color: f.color }}>
                {f.raw}
              </span>
            </div>
            <div className="priority-bar">
              <div
                className="priority-fill"
                style={{ width: `${f.fill}%`, background: f.color }}
              />
            </div>
          </div>
        ))}
      </div>

      <div className="rounded px-3 py-2" style={{ background: "#EDE9FE" }}>
        <p
          className="text-xs leading-relaxed"
          style={{ color: "#5B21B6" }}
        >
          <strong>AI recommends this window because</strong>{" "}
          {activePrediction
            ? `${ANCHOR_ASSET_ID} has ${activePrediction.predictedFailure ? "an elevated" : "a"} failure risk (${activePrediction.riskScore}%), and the requested window can be served during an available corridor slot with zero train conflicts, maximising block utilisation.`
            : "the selected block can be executed with minimal operational impact."}
        </p>
      </div>

      <div className="flex justify-end mt-2">
        <span className="chip chip-purple" style={{ fontSize: 9 }}>
          DEMO AI RECOMMENDATION — Prototype Simulation
        </span>
      </div>
    </div>
  );
}

// ---------- Main page ----------

export default function Overview() {
  const {
    role,
    setPage,
    setSelectedSection,
    setSelectedAsset,
    blockStatuses,
    approvePlan,
    modifyPlan,
    rejectPlan,
    reoptimized,
    activePrediction,
    activeFeasibleWindows,
    activeOptimizedPlans,
    liveEvents,
    pipelineStage,
  } = useApp();

  const [showWhy, setShowWhy] = useState(false);
  const [approveState, setApproveState] = useState<
    "idle" | "approved" | "rejected" | "modified"
  >("idle");
  const [modifyMode, setModifyMode] = useState(false);
  const [rejectMode, setRejectMode] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [modStart, setModStart] = useState("00:30");
  const [modEnd, setModEnd] = useState("04:30");

  const kpis = ROLE_KPIS[role] || ROLE_KPIS["COA"];
  const topTasks = topPriorityTasks(4);
  const anchorBlock = BLOCK_REQUESTS_BY_ID[ANCHOR_BLOCK_REQUEST_ID];
  const anchorBlockStatus =
    blockStatuses[ANCHOR_BLOCK_REQUEST_ID] ?? anchorBlock?.status ?? "RECOMMENDED";
  const anchorPlan = activeOptimizedPlans[0];
  const feasibleWindow = activeFeasibleWindows.find((w) => w.feasible);

  const blockWindow = reoptimized
    ? feasibleWindow
      ? `${feasibleWindow.windowStart.split(" ")[1]}–${feasibleWindow.windowEnd.split(" ")[1]}`
      : "—"
    : anchorPlan
    ? `${anchorPlan.startTime.split(" ")[1]}–${anchorPlan.endTime.split(" ")[1]}`
    : anchorBlock
    ? `${anchorBlock.requestedStart}–${anchorBlock.requestedEnd}`
    : "—";

  const blockDelay = anchorPlan ? `${anchorPlan.trainDelay} min` : "—";

  const activeEventFeed = liveEvents
    .filter((e) => e.status === "Active")
    .slice(0, 8);

  function doApprove() {
    if (!anchorPlan) return;
    approvePlan(anchorPlan.planId);
    setApproveState("approved");
  }

  function doModify() {
    if (!anchorPlan) return;
    modifyPlan(anchorPlan.planId, modStart, modEnd);
    setApproveState("modified");
    setModifyMode(false);
  }

  function doReject() {
    if (!anchorPlan) return;
    if (!rejectReason.trim()) return;
    rejectPlan(anchorPlan.planId, rejectReason);
    setApproveState("rejected");
    setRejectMode(false);
  }

  return (
    <div
      className="flex flex-col h-full overflow-hidden"
      style={{ background: "var(--bg)" }}
    >
      {/* Top: KPIs */}
      <div className="flex items-center gap-2 px-4 pt-3 pb-2 flex-shrink-0 overflow-x-auto">
        {kpis.map((k) => (
          <div
            key={k.label}
            className="card px-3 py-2 flex-shrink-0 min-w-28 hover-lift"
          >
            <p
              className="text-xs"
              style={{ color: "var(--text-secondary)", fontSize: 10 }}
            >
              {k.label}
            </p>
            <p
              className="font-bold text-lg leading-tight"
              style={{ color: k.color }}
            >
              {k.value}
            </p>
            <p style={{ color: "var(--text-secondary)", fontSize: 9 }}>
              {k.sub}
            </p>
          </div>
        ))}
        <div
          className="ml-auto flex-shrink-0 px-2 py-1.5 rounded"
          style={{ background: "#F0FDF4", border: "1px solid #86EFAC" }}
        >
          <p
            style={{ fontSize: 10, color: "#166534" }}
            className="font-semibold"
          >
            AI-ASSISTED DECISION SUPPORT
          </p>
          <p style={{ fontSize: 9, color: "#166534" }}>
            Controller review required · Prototype
          </p>
        </div>
      </div>

      {/* Corridor strip */}
      <div className="px-4 pb-2 flex-shrink-0">
        <div className="card px-3 py-2">
          <CorridorStrip />
        </div>
      </div>

      {/* Main 3-column layout */}
      <div className="flex flex-1 gap-3 px-4 pb-2 min-h-0 overflow-hidden">
        {/* LEFT: What Needs Attention */}
        <div className="w-64 flex-shrink-0 flex flex-col gap-2 overflow-y-auto">
          <div className="card p-3 flex-1">
            <div className="flex items-center gap-1.5 mb-3">
              <div
                className="w-1.5 h-4 rounded-full"
                style={{ background: "#D9534F" }}
              />
              <p
                className="font-bold text-xs uppercase tracking-wider"
                style={{ color: "var(--navy)" }}
              >
                What Needs Attention?
              </p>
            </div>

            <div className="space-y-2">
              {topTasks.map((task) => {
                const asset = ENRICHED_ASSETS.find(
                  (a) => a.id === task.assetId
                );
                const ai = AI_BY_ASSET[task.assetId];
                const isAnchor = task.assetId === ANCHOR_ASSET_ID;
                return (
                  <div
                    key={task.id}
                    className="rounded-md p-2.5 cursor-pointer group transition-all"
                    style={{
                      background: isAnchor ? "#FFF5F5" : "#F8FAFC",
                      border: `1px solid ${
                        isAnchor ? "#FCA5A5" : "var(--border)"
                      }`,
                    }}
                    onClick={() => {
                      setSelectedAsset(task.assetId);
                      setSelectedSection(task.section);
                    }}
                  >
                    <div className="flex items-start justify-between gap-1">
                      <div className="flex-1">
                        <div className="flex items-center gap-1.5 mb-0.5">
                          <span
                            className="font-bold text-xs group-hover:underline"
                            style={{ color: "var(--navy)" }}
                          >
                            {task.assetId}
                          </span>
                          {isAnchor && (
                            <span
                              className="chip chip-red"
                              style={{ fontSize: 8 }}
                            >
                              KEY DEMO
                            </span>
                          )}
                        </div>
                        <p
                          style={{
                            color: "var(--text-secondary)",
                            fontSize: 10,
                          }}
                          className="leading-tight"
                        >
                          {task.workType.slice(0, 30)}
                        </p>
                        <p
                          style={{
                            color: "var(--text-secondary)",
                            fontSize: 10,
                          }}
                        >
                          {task.section} · {asset?.type}
                        </p>
                        {task.overdueDays && (
                          <p
                            className="font-semibold"
                            style={{ color: "#D9534F", fontSize: 10 }}
                          >
                            Overdue {task.overdueDays}d
                          </p>
                        )}
                      </div>
                      <div className="text-right flex-shrink-0">
                        <div
                          className="font-bold text-xl leading-none"
                          style={{
                            color:
                              task.priority >= 85
                                ? "#D9534F"
                                : task.priority >= 70
                                ? "#D97706"
                                : "#1769AA",
                          }}
                        >
                          {task.priority}
                        </div>
                        <div
                          style={{
                            color: "var(--text-secondary)",
                            fontSize: 9,
                          }}
                        >
                          priority
                        </div>
                      </div>
                    </div>
                    <div className="priority-bar mt-1.5">
                      <div
                        className="priority-fill"
                        style={{
                          width: `${task.priority}%`,
                          background:
                            task.priority >= 85
                              ? "#D9534F"
                              : task.priority >= 70
                              ? "#D97706"
                              : "#1769AA",
                        }}
                      />
                    </div>
                    {isAnchor && ai && (
                      <p
                        className="text-xs mt-1.5 leading-tight"
                        style={{ color: "#D9534F", fontStyle: "italic" }}
                      >
                        Risk {ai.riskScore}% · Priority {ai.priorityScore} ·{" "}
                        {ai.priorityLevel}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>

            <button
              onClick={() => setPage("maintenance")}
              className="w-full text-xs py-1.5 mt-2 rounded font-medium"
              style={{ background: "#EFF6FF", color: "#1769AA" }}
            >
              View All {MAINTENANCE_TASKS.length} Tasks →
            </button>
          </div>
        </div>

        {/* CENTER: Where */}
        <div className="flex-1 min-w-0 flex flex-col gap-2 overflow-hidden">
          <div className="card p-3 flex-1 flex flex-col">
            <div className="flex items-center justify-between mb-2 flex-shrink-0">
              <div className="flex items-center gap-1.5">
                <div
                  className="w-1.5 h-4 rounded-full"
                  style={{ background: "#1769AA" }}
                />
                <p
                  className="font-bold text-xs uppercase tracking-wider"
                  style={{ color: "var(--navy)" }}
                >
                  Where?
                </p>
                <span
                  className="text-xs"
                  style={{ color: "var(--text-secondary)" }}
                >
                  · Click section or asset on map
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="chip chip-red" style={{ fontSize: 9 }}>
                  {ANCHOR_ASSET_ID} · {ANCHOR_SECTION_ID}
                </span>
                <span className="chip chip-purple" style={{ fontSize: 9 }}>
                  {ANCHOR_BLOCK_REQUEST_ID} · {anchorBlockStatus}
                </span>
              </div>
            </div>
            <div className="flex-1 min-h-0">
              <RailwayMap showDetail={true} />
            </div>
          </div>
        </div>

        {/* RIGHT: What Should We Do */}
        <div className="w-72 flex-shrink-0 flex flex-col gap-2 overflow-y-auto">
          <div className="card p-3 flex-1">
            <div className="flex items-center gap-1.5 mb-3">
              <div
                className="w-1.5 h-4 rounded-full"
                style={{ background: "#6B3FA0" }}
              />
              <p
                className="font-bold text-xs uppercase tracking-wider"
                style={{ color: "var(--navy)" }}
              >
                What Should We Do?
              </p>
            </div>

            {showWhy ? (
              <WhyPanel onClose={() => setShowWhy(false)} />
            ) : (
              <div className="space-y-3">
                {/* AI Recommendation */}
                <div
                  className="rounded-md p-3"
                  style={{ background: "#EDE9FE", border: "1px solid #C4B5FD" }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="chip chip-purple" style={{ fontSize: 9 }}>
                      AI RECOMMENDED BLOCK
                    </span>
                    <button
                      onClick={() => setShowWhy(true)}
                      className="text-xs px-2 py-0.5 rounded font-semibold transition-colors"
                      style={{ background: "#6B3FA0", color: "white" }}
                    >
                      WHY?
                    </button>
                  </div>

                  <div className="mb-2">
                    <p
                      className="font-bold text-2xl leading-none mono"
                      style={{ color: "#5B21B6" }}
                    >
                      {blockWindow}
                    </p>
                    <p
                      className="text-xs font-semibold mt-0.5"
                      style={{ color: "#6B3FA0" }}
                    >
                      {ANCHOR_SECTION_ID}
                      {SECTIONS_BY_ID[ANCHOR_SECTION_ID]
                        ? ` — ${SECTIONS_BY_ID[ANCHOR_SECTION_ID].from}–${SECTIONS_BY_ID[ANCHOR_SECTION_ID].to}`
                        : ""}
                    </p>
                    <p className="text-xs" style={{ color: "#5B21B6" }}>
                      {anchorPlan
                        ? `${anchorPlan.department === "ST" ? "S&T" : anchorPlan.department} · ${anchorPlan.workType}`
                        : "—"}
                    </p>
                    <p className="text-xs mt-0.5" style={{ color: "#6B3FA0" }}>
                      Block {ANCHOR_BLOCK_REQUEST_ID}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-1.5">
                    {[
                      {
                        l: "Priority",
                        v: `${activePrediction?.priorityScore ?? "—"} / 100`,
                        c: "#D9534F",
                      },
                      { l: "Train Impact", v: blockDelay, c: "#3F8F45" },
                      {
                        l: "Conflicts",
                        v: `${anchorPlan?.conflictCount ?? 0}`,
                        c: "#3F8F45",
                      },
                      {
                        l: "Utilization",
                        v: `${anchorBlock?.utilization ?? "—"}%`,
                        c: "#6B3FA0",
                      },
                    ].map((m) => (
                      <div
                        key={m.l}
                        className="rounded px-2 py-1.5"
                        style={{ background: "rgba(255,255,255,0.65)" }}
                      >
                        <p style={{ color: "#6B3FA0", fontSize: 9 }}>
                          {m.l}
                        </p>
                        <p
                          className="font-bold text-sm"
                          style={{ color: m.c }}
                        >
                          {m.v}
                        </p>
                      </div>
                    ))}
                  </div>

                  <div className="flex gap-1 mt-2 flex-wrap">
                    <span className="chip chip-green" style={{ fontSize: 9 }}>
                      FEASIBLE
                    </span>
                    <span
                      className="chip"
                      style={{
                        background:
                          anchorBlockStatus === "APPROVED"
                            ? "#DCFCE7"
                            : anchorBlockStatus === "MODIFIED"
                            ? "#FEF3C7"
                            : anchorBlockStatus === "REJECTED"
                            ? "#FEE2E2"
                            : "#EDE9FE",
                        color:
                          anchorBlockStatus === "APPROVED"
                            ? "#166534"
                            : anchorBlockStatus === "MODIFIED"
                            ? "#B45309"
                            : anchorBlockStatus === "REJECTED"
                            ? "#B91C1C"
                            : "#5B21B6",
                        fontSize: 9,
                      }}
                    >
                      {anchorBlockStatus}
                    </span>
                    {reoptimized && (
                      <span className="chip chip-orange" style={{ fontSize: 9 }}>
                        UPDATED PLAN
                      </span>
                    )}
                    {pipelineStage !== "IDLE" && (
                      <span
                        className="chip"
                        style={{
                          background: "#F1F5F9",
                          color: "#475569",
                          fontSize: 9,
                        }}
                      >
                        PIPELINE: {pipelineStage}
                      </span>
                    )}
                  </div>
                </div>

                {/* Coordinated tasks */}
                <div>
                  <p
                    className="font-semibold text-xs mb-1.5"
                    style={{ color: "var(--navy)" }}
                  >
                    Coordinated Tasks
                  </p>
                  <div className="space-y-1">
                    <div
                      className="flex items-center gap-2 rounded p-2 text-xs"
                      style={{ background: "#EFF6FF" }}
                    >
                      <span className="chip chip-blue" style={{ fontSize: 8 }}>
                        ENG
                      </span>
                      <span>
                        {ANCHOR_ASSET_ID} ·{" "}
                        {anchorPlan?.workType ?? "Maintenance"}
                      </span>
                      <span
                        className="ml-auto mono"
                        style={{ color: "var(--text-secondary)" }}
                      >
                        {anchorPlan?.duration ?? "—"} min
                      </span>
                    </div>
                    <div
                      className="flex items-center gap-2 rounded p-2 text-xs"
                      style={{ background: "#F5F3FF" }}
                    >
                      <span className="chip chip-purple" style={{ fontSize: 8 }}>
                        S&T
                      </span>
                      <span>Compatible S&T task on {ANCHOR_SECTION_ID}</span>
                      <span
                        className="ml-auto mono"
                        style={{ color: "var(--text-secondary)" }}
                      >
                        30 min
                      </span>
                    </div>
                    <div
                      className="text-center text-xs py-1.5 rounded font-semibold"
                      style={{ background: "#EDE9FE", color: "#6B3FA0" }}
                    >
                      2 activities → 1 coordinated block
                    </div>
                  </div>
                </div>

                {/* Controller actions */}
                <div>
                  <p
                    className="font-semibold text-xs mb-1.5"
                    style={{ color: "var(--navy)" }}
                  >
                    Controller Review
                  </p>

                  {approveState === "approved" ? (
                    <div
                      className="rounded-md p-3"
                      style={{
                        background: "#DCFCE7",
                        border: "1px solid #86EFAC",
                      }}
                    >
                      <p
                        className="font-bold text-xs"
                        style={{ color: "#166534" }}
                      >
                        ✓ Block {ANCHOR_BLOCK_REQUEST_ID} approved.
                      </p>
                      <p
                        className="text-xs mt-1"
                        style={{ color: "#166534" }}
                      >
                        Audit event recorded. Crews notified.
                      </p>
                    </div>
                  ) : approveState === "rejected" ? (
                    <div
                      className="rounded-md p-3"
                      style={{
                        background: "#FEE2E2",
                        border: "1px solid #FCA5A5",
                      }}
                    >
                      <p
                        className="font-bold text-xs"
                        style={{ color: "#B91C1C" }}
                      >
                        ✗ Block {ANCHOR_BLOCK_REQUEST_ID} rejected.
                      </p>
                      <p
                        className="text-xs mt-1"
                        style={{ color: "#B91C1C" }}
                      >
                        Reason: {rejectReason}
                      </p>
                    </div>
                  ) : approveState === "modified" ? (
                    <div
                      className="rounded-md p-3"
                      style={{
                        background: "#FEF3C7",
                        border: "1px solid #FCD34D",
                      }}
                    >
                      <p
                        className="font-bold text-xs"
                        style={{ color: "#B45309" }}
                      >
                        △ Block {ANCHOR_BLOCK_REQUEST_ID} modified to {modStart}–
                        {modEnd}.
                      </p>
                    </div>
                  ) : modifyMode ? (
                    <div className="card p-2.5 space-y-2">
                      <p className="text-xs font-semibold">Modify Block Window</p>
                      <div className="flex gap-2">
                        <div className="flex-1">
                          <p
                            style={{
                              fontSize: 9,
                              color: "var(--text-secondary)",
                            }}
                          >
                            Start
                          </p>
                          <input
                            type="time"
                            value={modStart}
                            onChange={(e) => setModStart(e.target.value)}
                            className="w-full border rounded px-1 py-1 text-xs"
                            style={{ borderColor: "var(--border)" }}
                          />
                        </div>
                        <div className="flex-1">
                          <p
                            style={{
                              fontSize: 9,
                              color: "var(--text-secondary)",
                            }}
                          >
                            End
                          </p>
                          <input
                            type="time"
                            value={modEnd}
                            onChange={(e) => setModEnd(e.target.value)}
                            className="w-full border rounded px-1 py-1 text-xs"
                            style={{ borderColor: "var(--border)" }}
                          />
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <button
                          onClick={doModify}
                          className="flex-1 py-1.5 rounded text-xs font-semibold"
                          style={{ background: "#1769AA", color: "white" }}
                        >
                          Confirm
                        </button>
                        <button
                          onClick={() => setModifyMode(false)}
                          className="py-1.5 px-2 rounded text-xs"
                          style={{ background: "#F1F5F9", color: "#64748B" }}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : rejectMode ? (
                    <div className="card p-2.5 space-y-2">
                      <p className="text-xs font-semibold">Rejection Reason</p>
                      <input
                        value={rejectReason}
                        onChange={(e) => setRejectReason(e.target.value)}
                        placeholder="Enter reason…"
                        className="w-full border rounded px-2 py-1 text-xs"
                        style={{ borderColor: "var(--border)" }}
                      />
                      <div className="flex gap-1">
                        <button
                          onClick={doReject}
                          className="flex-1 py-1.5 rounded text-xs font-semibold"
                          style={{ background: "#D9534F", color: "white" }}
                        >
                          Reject
                        </button>
                        <button
                          onClick={() => setRejectMode(false)}
                          className="py-1.5 px-2 rounded text-xs"
                          style={{ background: "#F1F5F9", color: "#64748B" }}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-1">
                      <button
                        onClick={doApprove}
                        className="py-2.5 rounded text-xs font-bold"
                        style={{ background: "#3F8F45", color: "white" }}
                      >
                        APPROVE
                      </button>
                      <button
                        onClick={() => setModifyMode(true)}
                        className="py-2.5 rounded text-xs font-bold"
                        style={{ background: "#1769AA", color: "white" }}
                      >
                        MODIFY
                      </button>
                      <button
                        onClick={() => setRejectMode(true)}
                        className="py-2.5 rounded text-xs font-bold"
                        style={{ background: "#FEE2E2", color: "#B91C1C" }}
                      >
                        REJECT
                      </button>
                      <button
                        onClick={() => {
                          setPage("block-planning");
                          setSelectedSection(ANCHOR_SECTION_ID);
                        }}
                        className="py-2.5 rounded text-xs font-bold"
                        style={{ background: "#F5F3FF", color: "#6B3FA0" }}
                      >
                        REPLAN
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom: What Changed */}
      <div className="px-4 pb-3 flex-shrink-0">
        <div className="card p-3">
          <div className="flex items-center gap-1.5 mb-2">
            <div
              className="w-1.5 h-4 rounded-full"
              style={{ background: "#16827A" }}
            />
            <p
              className="font-bold text-xs uppercase tracking-wider"
              style={{ color: "var(--navy)" }}
            >
              What Changed?
            </p>
            <span className="ml-2 chip chip-teal" style={{ fontSize: 9 }}>
              Live Event Feed
            </span>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {activeEventFeed.length === 0 ? (
              <p
                style={{ color: "var(--text-secondary)", fontSize: 11 }}
                className="py-2"
              >
                No active events. Trigger a live event from Live Operations.
              </p>
            ) : (
              activeEventFeed.map((ev) => (
                <div
                  key={ev.eventId}
                  className="flex-shrink-0 rounded px-3 py-2 min-w-44"
                  style={{
                    background:
                      ev.severity === "Critical"
                        ? "#FEE2E2"
                        : ev.severity === "High"
                        ? "#FEF9C3"
                        : "#F8FAFC",
                    border: `1px solid ${
                      ev.severity === "Critical"
                        ? "#FCA5A5"
                        : ev.severity === "High"
                        ? "#FDE68A"
                        : "#E2E8F0"
                    }`,
                  }}
                >
                  <p
                    className="mono text-xs font-semibold"
                    style={{ color: "var(--text-secondary)", fontSize: 10 }}
                  >
                    {ev.timestamp.split(" ")[1]} · {ev.eventId}
                  </p>
                  <p
                    className="text-xs font-medium leading-tight"
                    style={{
                      color:
                        ev.severity === "Critical"
                          ? "#B91C1C"
                          : ev.severity === "High"
                          ? "#B45309"
                          : "var(--text-primary)",
                    }}
                  >
                    {ev.eventType}
                  </p>
                  <p style={{ color: "var(--text-secondary)", fontSize: 9 }}>
                    {ev.sectionId}
                    {ev.trainNo ? ` · ${ev.trainNo}` : ""}
                    {ev.assetId ? ` · ${ev.assetId}` : ""}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}