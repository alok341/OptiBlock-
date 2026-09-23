// ============================================================
// Maintenance Intelligence
// Priority queue + AI scores + asset health + recommendation
// All data flows from maintenance_tasks.csv + ai_predictions.csv
// ============================================================

import { useState } from "react";
import { useApp } from "../store";
import {
  MAINTENANCE_TASKS,
  ENRICHED_ASSETS,
  AI_BY_ASSET,
  tasksBySection,
  ANCHOR_ASSET_ID,
  ANCHOR_SECTION_ID,
} from "../data/seed";
import type { TaskStatus } from "../types";

type Filter = "ALL" | "CRITICAL" | "HIGH" | "MEDIUM" | "OVERDUE";

const STATUS_CHIP: Record<TaskStatus, string> = {
  OVERDUE: "chip-red",
  DUE_SOON: "chip-orange",
  SCHEDULED: "chip-gray",
  IN_PROGRESS: "chip-blue",
  COMPLETED: "chip-green",
  BLOCKED: "chip-red",
};

const DEPT_COLORS: Record<string, string> = {
  ENGINEERING: "#1769AA",
  ST: "#6B3FA0",
  TRACTION: "#16827A",
};

const DEPT_CHIPS: Record<string, string> = {
  ENGINEERING: "chip-blue",
  ST: "chip-purple",
  TRACTION: "chip-teal",
};

export default function Maintenance() {
  const { role, setSelectedAsset, setSelectedSection } = useApp();
  const [filter, setFilter] = useState<Filter>("ALL");
  const [selectedTask, setSelectedTask] = useState<string | null>(null);

  const deptFilter =
    role === "ENGINEERING"
      ? "ENGINEERING"
      : role === "ST"
      ? "ST"
      : role === "TRACTION"
      ? "TRACTION"
      : null;

  const tasks = MAINTENANCE_TASKS.filter((t) => {
    if (deptFilter && t.department !== deptFilter) return false;
    if (filter === "OVERDUE") return t.status === "OVERDUE";
    if (filter === "CRITICAL") return t.priority >= 85;
    if (filter === "HIGH") return t.priority >= 70 && t.priority < 85;
    if (filter === "MEDIUM") return t.priority >= 50 && t.priority < 70;
    return true;
  }).sort((a, b) => b.priority - a.priority);

  // KPIs derived from real data
  const totalTasks = MAINTENANCE_TASKS.length;
  const criticalAssets = ENRICHED_ASSETS.filter(
    (a) =>
      a.criticality === "CRITICAL" ||
      (a.criticality === "HIGH" && a.health < 70) ||
      a.defectStatus === "CRITICAL"
  ).length;
  const highPriority = MAINTENANCE_TASKS.filter((t) => t.priority >= 70).length;
  const overdue = MAINTENANCE_TASKS.filter((t) => t.status === "OVERDUE").length;
  const avgRisk = Math.round(
    ENRICHED_ASSETS.reduce((s, a) => s + (a.ai?.riskScore ?? a.risk), 0) /
      Math.max(1, ENRICHED_ASSETS.length)
  );

  const kpis = [
    { label: "Critical Assets", value: criticalAssets, color: "#D9534F" },
    { label: "High Priority Tasks", value: highPriority, color: "#D97706" },
    { label: "Overdue", value: overdue, color: "#D9534F" },
    { label: "Avg AI Risk", value: `${avgRisk}%`, color: "#6B3FA0" },
  ];

  const detail = selectedTask
    ? MAINTENANCE_TASKS.find((t) => t.id === selectedTask)
    : null;
  const detailAsset = detail
    ? ENRICHED_ASSETS.find((a) => a.id === detail.assetId)
    : null;
  const detailAi = detail ? AI_BY_ASSET[detail.assetId] : undefined;

  return (
    <div className="flex gap-4 h-full overflow-hidden p-4">
      {/* Main panel */}
      <div className="flex flex-col gap-3 flex-1 min-w-0 overflow-y-auto">
        {/* Header */}
        <div>
          <h1 className="text-lg font-bold" style={{ color: "var(--navy)" }}>
            Maintenance Intelligence
          </h1>
          <p
            className="text-xs"
            style={{ color: "var(--text-secondary)" }}
          >
            AI-assisted priority scoring · Risk-aware maintenance planning ·{" "}
            {totalTasks} tasks from maintenance_tasks.csv
          </p>
        </div>

        {/* KPIs */}
        <div className="flex gap-3">
          {kpis.map((k) => (
            <div key={k.label} className="card p-3 flex-1">
              <p
                className="text-xs"
                style={{ color: "var(--text-secondary)" }}
              >
                {k.label}
              </p>
              <p className="font-bold text-2xl" style={{ color: k.color }}>
                {k.value}
              </p>
            </div>
          ))}
        </div>

        {/* AI stance */}
        <div
          className="rounded-md p-3"
          style={{ background: "#EDE9FE", border: "1px solid #C4B5FD" }}
        >
          <p
            className="text-xs font-bold mb-1"
            style={{ color: "#6B3FA0" }}
          >
            AI TELLS US WHAT IS IMPORTANT. CONSTRAINTS TELL US WHAT IS POSSIBLE.
            OPTIMIZATION FINDS THE BEST FEASIBLE PLAN.
          </p>
          <p className="text-xs" style={{ color: "#5B21B6" }}>
            Priority scores consider: asset health · failure risk · defect
            severity · criticality · overdue duration · safety impact · train
            impact. Scores come from ai_predictions.csv.
          </p>
        </div>

        {/* Filters */}
        <div className="flex gap-2 flex-wrap">
          {(["ALL", "CRITICAL", "HIGH", "MEDIUM", "OVERDUE"] as Filter[]).map(
            (f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className="px-3 py-1.5 rounded text-xs font-semibold transition-colors"
                style={{
                  background: filter === f ? "var(--navy)" : "#F1F5F9",
                  color: filter === f ? "white" : "var(--text-secondary)",
                }}
              >
                {f}
                {f === "OVERDUE" && (
                  <span
                    className="ml-1 chip chip-red"
                    style={{ fontSize: 9 }}
                  >
                    {overdue}
                  </span>
                )}
              </button>
            )
          )}
          <span
            className="ml-auto text-xs self-center"
            style={{ color: "var(--text-secondary)" }}
          >
            {tasks.length} tasks
          </span>
        </div>

        {/* Task cards */}
        <div className="grid gap-2">
          {tasks.map((task) => {
            const asset = ENRICHED_ASSETS.find((a) => a.id === task.assetId);
            const ai = AI_BY_ASSET[task.assetId];
            const active = selectedTask === task.id;
            const isAnchor = task.assetId === ANCHOR_ASSET_ID;

            return (
              <div
                key={task.id}
                className="card p-3 cursor-pointer hover-lift transition-all"
                style={{
                  borderLeft: active
                    ? `3px solid ${DEPT_COLORS[task.department]}`
                    : "3px solid transparent",
                  background: isAnchor ? "#FFF5F5" : undefined,
                }}
                onClick={() => {
                  setSelectedTask(active ? null : task.id);
                  setSelectedAsset(task.assetId);
                  setSelectedSection(task.section);
                }}
              >
                <div className="flex items-start gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span
                        className="font-bold text-sm"
                        style={{ color: "var(--navy)" }}
                      >
                        {task.assetId}
                      </span>
                      <span
                        className={`chip ${DEPT_CHIPS[task.department]}`}
                        style={{ fontSize: 9 }}
                      >
                        {task.department === "ST"
                          ? "S&T"
                          : task.department}
                      </span>
                      <span
                        className={`chip ${STATUS_CHIP[task.status]}`}
                        style={{ fontSize: 9 }}
                      >
                        {task.status.replace("_", " ")}
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
                      className="text-xs font-medium"
                      style={{ color: "var(--text-primary)" }}
                    >
                      {task.workType}
                    </p>
                    <p
                      className="text-xs"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      {task.id} · {task.section} · {asset?.type ?? "—"} ·{" "}
                      {task.duration} min
                    </p>
                    {task.overdueDays && (
                      <p
                        className="text-xs font-semibold mt-0.5"
                        style={{ color: "var(--crit-red)" }}
                      >
                        Overdue {task.overdueDays} days
                      </p>
                    )}
                  </div>

                  <div className="text-right flex-shrink-0">
                    <div
                      className="text-2xl font-bold leading-none"
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
                      AI priority
                    </div>
                    {asset && (
                      <div
                        className="mt-1"
                        style={{
                          color: "var(--text-secondary)",
                          fontSize: 9,
                        }}
                      >
                        Health {asset.health} · Risk{" "}
                        {ai?.riskScore ?? asset.risk}%
                      </div>
                    )}
                  </div>
                </div>

                <div className="priority-bar mt-2">
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

                {active && (
                  <div
                    className="mt-2 pt-2"
                    style={{ borderTop: "1px solid var(--border)" }}
                  >
                    <p className="text-xs" style={{ color: "#6B3FA0" }}>
                      <span className="font-semibold">Reason:</span>{" "}
                      {task.reason}.{" "}
                      {ai?.predictedFailure
                        ? `AI predicts failure risk at ${ai.riskScore}%.`
                        : `AI risk ${ai?.riskScore ?? asset?.risk ?? "—"}%.`}
                    </p>
                    <div className="flex gap-2 mt-2 flex-wrap">
                      <span className="chip chip-gray" style={{ fontSize: 9 }}>
                        Deadline: {task.deadline}
                      </span>
                      <span className="chip chip-gray" style={{ fontSize: 9 }}>
                        Section: {task.section}
                      </span>
                      {ai && (
                        <span
                          className="chip chip-purple"
                          style={{ fontSize: 9 }}
                        >
                          Confidence:{" "}
                          {Math.round(ai.predictionConfidence * 100)}%
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Detail side panel */}
      {detail && detailAsset && (
        <div className="w-72 flex-shrink-0 overflow-y-auto">
          <div className="card p-4 slide-in sticky top-0">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="font-bold" style={{ color: "var(--navy)" }}>
                  {detail.assetId}
                </p>
                <p
                  className="text-xs"
                  style={{ color: "var(--text-secondary)" }}
                >
                  {detail.id} · {detail.workType}
                </p>
              </div>
              <button
                onClick={() => setSelectedTask(null)}
                style={{ color: "var(--text-secondary)" }}
              >
                ×
              </button>
            </div>

            {/* Asset status */}
            <div className="rounded p-3 mb-3" style={{ background: "#F8FAFC" }}>
              <p
                className="font-semibold text-xs mb-2"
                style={{ color: "var(--navy)" }}
              >
                ASSET STATUS
              </p>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <p
                    style={{ color: "var(--text-secondary)", fontSize: 10 }}
                  >
                    Health
                  </p>
                  <p
                    className="font-bold"
                    style={{
                      color:
                        detailAsset.health < 65
                          ? "#D9534F"
                          : detailAsset.health < 80
                          ? "#D97706"
                          : "#3F8F45",
                    }}
                  >
                    {detailAsset.health} / 100
                  </p>
                </div>
                <div>
                  <p
                    style={{ color: "var(--text-secondary)", fontSize: 10 }}
                  >
                    Failure Risk
                  </p>
                  <p className="font-bold" style={{ color: "#D9534F" }}>
                    {detailAi?.riskScore ?? detailAsset.risk}%
                  </p>
                </div>
                <div>
                  <p
                    style={{ color: "var(--text-secondary)", fontSize: 10 }}
                  >
                    Criticality
                  </p>
                  <span
                    className={`chip chip-${
                      detailAsset.criticality === "CRITICAL"
                        ? "red"
                        : detailAsset.criticality === "HIGH"
                        ? "orange"
                        : "gray"
                    }`}
                    style={{ fontSize: 9 }}
                  >
                    {detailAsset.criticality}
                  </span>
                </div>
                <div>
                  <p
                    style={{ color: "var(--text-secondary)", fontSize: 10 }}
                  >
                    Defect
                  </p>
                  <span
                    className={`chip chip-${
                      detailAsset.defectStatus === "CRITICAL"
                        ? "red"
                        : detailAsset.defectStatus === "MODERATE"
                        ? "orange"
                        : detailAsset.defectStatus === "NONE"
                        ? "green"
                        : "gray"
                    }`}
                    style={{ fontSize: 9 }}
                  >
                    {detailAsset.defectStatus}
                  </span>
                </div>
              </div>
              {detail.overdueDays && (
                <div
                  className="mt-2 rounded px-2 py-1"
                  style={{ background: "#FEE2E2" }}
                >
                  <p
                    className="text-xs font-semibold"
                    style={{ color: "#B91C1C" }}
                  >
                    Overdue: {detail.overdueDays} days
                  </p>
                </div>
              )}
            </div>

            {/* Priority breakdown */}
            <div className="mb-3">
              <div className="flex items-center justify-between mb-2">
                <p
                  className="font-semibold text-xs"
                  style={{ color: "var(--navy)" }}
                >
                  MAINTENANCE PRIORITY
                </p>
                <p
                  className="font-bold text-xl"
                  style={{
                    color: detail.priority >= 85 ? "#D9534F" : "#D97706",
                  }}
                >
                  {detail.priority} / 100
                </p>
              </div>
              <p className="text-xs mb-2" style={{ color: "#6B3FA0" }}>
                Score: {detailAi?.priorityScore ?? detail.priority} · Level:{" "}
                {detailAi?.priorityLevel ?? "—"} · Confidence:{" "}
                {detailAi
                  ? `${Math.round(detailAi.predictionConfidence * 100)}%`
                  : "—"}
              </p>

              {[
                {
                  label: "Asset Health",
                  fill: 100 - detailAsset.health,
                  color: "#D97706",
                },
                {
                  label: "Defect Severity",
                  fill:
                    detailAsset.defectStatus === "CRITICAL"
                      ? 92
                      : detailAsset.defectStatus === "MODERATE"
                      ? 60
                      : 20,
                  color: "#D9534F",
                },
                {
                  label: "Criticality",
                  fill:
                    detailAsset.criticality === "CRITICAL"
                      ? 100
                      : detailAsset.criticality === "HIGH"
                      ? 80
                      : 50,
                  color: "#D97706",
                },
                {
                  label: "Predicted Failure",
                  fill: detailAi?.predictedFailure ? 92 : 20,
                  color: detailAi?.predictedFailure ? "#D9534F" : "#3F8F45",
                },
                {
                  label: "AI Risk Score",
                  fill: detailAi?.riskScore ?? detail.risk,
                  color: "#D9534F",
                },
              ].map((f) => (
                <div key={f.label} className="mb-2">
                  <div className="flex justify-between text-xs mb-0.5">
                    <span style={{ color: "var(--text-secondary)" }}>
                      {f.label}
                    </span>
                    <span className="mono" style={{ color: f.color }}>
                      {f.fill}%
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

            {/* Defect detail */}
            {detailAsset.defectSeverity !== "None" && (
              <div
                className="rounded p-2 mb-3"
                style={{ background: "#FEF3C7" }}
              >
                <p
                  className="text-xs font-semibold"
                  style={{ color: "#B45309" }}
                >
                  Defect: {detailAsset.defectSeverity}
                </p>
                <p
                  className="text-xs mt-0.5"
                  style={{ color: "#92400E" }}
                >
                  Deadline: {detail.deadline}
                </p>
              </div>
            )}

            {/* Recommendation */}
            <div className="rounded p-2.5" style={{ background: "#EDE9FE" }}>
              <p
                className="text-xs font-semibold mb-1"
                style={{ color: "#5B21B6" }}
              >
                AI Recommendation
              </p>
              <p className="text-xs" style={{ color: "#6B3FA0" }}>
                {detailAi?.predictedFailure
                  ? `Failure predicted (${detailAi.priorityLevel}). Schedule within next feasible window on ${detail.section}.`
                  : `Schedule within next suitable low-traffic window on ${detail.section}.`}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}