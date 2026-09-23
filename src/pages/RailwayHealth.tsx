// ============================================================
// Railway Health
// Network health overview driven entirely by:
//   - tms_track_assets.csv
//   - smms_signalling_assets.csv
//   - tdms_traction_assets.csv
//   - ai_predictions.csv
//   - maintenance_tasks.csv
// ============================================================

import { useMemo, useState } from "react";
import { useApp } from "../store";
import {
  SECTIONS,
  ENRICHED_ASSETS,
  AI_BY_ASSET,
  sectionHealth,
  tasksBySection,
  ANCHOR_ASSET_ID,
  ANCHOR_SECTION_ID,
} from "../data/seed";
import type { Asset, Department } from "../types";

// ---------- Helpers ----------

const HEALTH_COLOR = (h: number) =>
  h >= 90 ? "#3F8F45" : h >= 75 ? "#1769AA" : h >= 60 ? "#D97706" : "#D9534F";

const HEALTH_LABEL = (h: number) =>
  h >= 90
    ? "Excellent"
    : h >= 75
    ? "Healthy"
    : h >= 60
    ? "Attention"
    : "Critical";

const DEPT_COLORS: Record<Department, string> = {
  ENGINEERING: "#1769AA",
  ST: "#6B3FA0",
  TRACTION: "#16827A",
};

type DeptFilter = "ALL" | Department;

// ---------- Main page ----------

export default function RailwayHealth() {
  const { setSelectedAsset } = useApp();
  const [selectedAssetId, setSelectedAssetId] = useState<string | null>(null);
  const [deptFilter, setDeptFilter] = useState<DeptFilter>("ALL");
  const [sectionFilter, setSectionFilter] = useState<string>("ALL");

  const filtered = useMemo(
    () =>
      ENRICHED_ASSETS.filter((a) => {
        if (deptFilter !== "ALL" && a.department !== deptFilter) return false;
        if (sectionFilter !== "ALL" && a.section !== sectionFilter) return false;
        return true;
      }),
    [deptFilter, sectionFilter]
  );

  // Distribution computed from ALL assets (not filtered)
  const distribution = useMemo(() => {
    const total = ENRICHED_ASSETS.length;
    return {
      excellent: ENRICHED_ASSETS.filter((a) => a.health >= 90).length,
      healthy: ENRICHED_ASSETS.filter(
        (a) => a.health >= 75 && a.health < 90
      ).length,
      attention: ENRICHED_ASSETS.filter(
        (a) => a.health >= 60 && a.health < 75
      ).length,
      critical: ENRICHED_ASSETS.filter((a) => a.health < 60).length,
      total,
    };
  }, []);

  const selectedAsset: Asset | undefined = selectedAssetId
    ? ENRICHED_ASSETS.find((a) => a.id === selectedAssetId)
    : undefined;
  const selectedAi = selectedAssetId
    ? AI_BY_ASSET[selectedAssetId]
    : undefined;

  return (
    <div className="flex gap-4 h-full overflow-hidden p-4">
      {/* Main panel */}
      <div className="flex flex-col gap-3 flex-1 min-w-0 overflow-y-auto">
        <div>
          <h1 className="text-lg font-bold" style={{ color: "var(--navy)" }}>
            Railway Health
          </h1>
          <p className="text-xs" style={{ color: "var(--text-secondary)" }}>
            {distribution.total} assets across {SECTIONS.length} sections ·
            Health scores derived from TMS · SMMS · TDMS · AI risk from
            ai_predictions.csv
          </p>
        </div>

        {/* Health distribution */}
        <div className="card p-4">
          <p
            className="font-semibold text-xs mb-3 uppercase tracking-wider"
            style={{ color: "var(--navy)" }}
          >
            Asset Health Distribution
          </p>
          <div className="grid grid-cols-4 gap-3 mb-4">
            {[
              {
                label: "Excellent",
                value: distribution.excellent,
                range: "90–100",
                color: "#3F8F45",
              },
              {
                label: "Healthy",
                value: distribution.healthy,
                range: "75–89",
                color: "#1769AA",
              },
              {
                label: "Attention",
                value: distribution.attention,
                range: "60–74",
                color: "#D97706",
              },
              {
                label: "Critical",
                value: distribution.critical,
                range: "<60",
                color: "#D9534F",
              },
            ].map((d) => (
              <div
                key={d.label}
                className="text-center rounded-md p-3"
                style={{
                  background: `${d.color}12`,
                  border: `1px solid ${d.color}40`,
                }}
              >
                <p className="text-3xl font-bold" style={{ color: d.color }}>
                  {d.value}
                </p>
                <p
                  className="text-xs font-semibold"
                  style={{ color: d.color }}
                >
                  {d.label}
                </p>
                <p style={{ color: "var(--text-secondary)", fontSize: 10 }}>
                  {d.range}
                </p>
              </div>
            ))}
          </div>

          <div className="flex h-4 rounded overflow-hidden">
            {[
              {
                w: (distribution.excellent / distribution.total) * 100,
                c: "#3F8F45",
              },
              {
                w: (distribution.healthy / distribution.total) * 100,
                c: "#1769AA",
              },
              {
                w: (distribution.attention / distribution.total) * 100,
                c: "#D97706",
              },
              {
                w: (distribution.critical / distribution.total) * 100,
                c: "#D9534F",
              },
            ].map((seg, i) => (
              <div
                key={i}
                style={{ width: `${seg.w}%`, background: seg.c }}
              />
            ))}
          </div>
          <p
            className="text-right text-xs mt-1"
            style={{ color: "var(--text-secondary)" }}
          >
            {distribution.total} total assets
          </p>
        </div>

        {/* Section health overview */}
        <div className="card p-4">
          <p
            className="font-semibold text-xs mb-3 uppercase tracking-wider"
            style={{ color: "var(--navy)" }}
          >
            Section Health Overview
          </p>
          <div
            className="grid gap-2"
            style={{ gridTemplateColumns: "repeat(5, 1fr)" }}
          >
            {SECTIONS.map((sec) => {
              const avgHealth = sectionHealth(sec.id);
              const secTasks = tasksBySection(sec.id);
              const criticalTasks = secTasks.filter(
                (t) => t.priority >= 85
              ).length;
              const hc = HEALTH_COLOR(avgHealth);
              const active = sectionFilter === sec.id;

              return (
                <button
                  key={sec.id}
                  onClick={() =>
                    setSectionFilter(active ? "ALL" : sec.id)
                  }
                  className="rounded-md p-2 text-center transition-all hover-lift"
                  style={{
                    border: `2px solid ${active ? hc : `${hc}30`}`,
                    background: `${hc}10`,
                  }}
                >
                  <p
                    className="font-bold text-xs mono"
                    style={{ color: hc }}
                  >
                    {sec.id}
                  </p>
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center mx-auto my-1 text-white font-bold"
                    style={{ background: hc, fontSize: 10 }}
                  >
                    {avgHealth}
                  </div>
                  <p
                    style={{ color: "var(--text-secondary)", fontSize: 9 }}
                  >
                    {sec.from.slice(0, 5)}
                  </p>
                  <p
                    style={{ color: "var(--text-secondary)", fontSize: 9 }}
                  >
                    {sec.to.slice(0, 5)}
                  </p>
                  {criticalTasks > 0 && (
                    <span
                      className="chip chip-red mt-1"
                      style={{ fontSize: 8 }}
                    >
                      {criticalTasks}!
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-2 flex-wrap">
          {(
            ["ALL", "ENGINEERING", "ST", "TRACTION"] as DeptFilter[]
          ).map((d) => (
            <button
              key={d}
              onClick={() => setDeptFilter(d)}
              className="px-3 py-1.5 rounded text-xs font-semibold"
              style={{
                background: deptFilter === d ? "var(--navy)" : "#F1F5F9",
                color:
                  deptFilter === d ? "white" : "var(--text-secondary)",
              }}
            >
              {d === "ST" ? "S&T" : d}
            </button>
          ))}
          {(deptFilter !== "ALL" || sectionFilter !== "ALL") && (
            <button
              onClick={() => {
                setDeptFilter("ALL");
                setSectionFilter("ALL");
              }}
              className="px-3 py-1.5 rounded text-xs"
              style={{ color: "var(--text-secondary)" }}
            >
              Clear filters
            </button>
          )}
          <span
            className="ml-auto text-xs self-center"
            style={{ color: "var(--text-secondary)" }}
          >
            {filtered.length} assets
          </span>
        </div>

        {/* Asset grid */}
        <div
          className="grid gap-2"
          style={{
            gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
          }}
        >
          {filtered.slice(0, 60).map((asset) => {
            const hc = HEALTH_COLOR(asset.health);
            const active = selectedAssetId === asset.id;
            const isAnchor = asset.id === ANCHOR_ASSET_ID;
            const ai = AI_BY_ASSET[asset.id];

            return (
              <div
                key={asset.id}
                className="card p-3 cursor-pointer hover-lift transition-all"
                style={{
                  borderLeft: `3px solid ${hc}`,
                  outline: active
                    ? `2px solid ${DEPT_COLORS[asset.department]}`
                    : "none",
                  background: isAnchor ? "#FFF5F5" : undefined,
                }}
                onClick={() => {
                  const next = active ? null : asset.id;
                  setSelectedAssetId(next);
                  if (next) setSelectedAsset(next);
                }}
              >
                <div className="flex items-start justify-between mb-1">
                  <div className="min-w-0">
                    <div className="flex items-center gap-1">
                      <p
                        className="font-bold text-xs"
                        style={{ color: "var(--navy)" }}
                      >
                        {asset.id}
                      </p>
                      {isAnchor && (
                        <span
                          className="chip chip-red"
                          style={{ fontSize: 8 }}
                        >
                          DEMO
                        </span>
                      )}
                    </div>
                    <p
                      style={{ color: "var(--text-secondary)", fontSize: 10 }}
                    >
                      {asset.type}
                    </p>
                    <p
                      style={{ color: "var(--text-secondary)", fontSize: 10 }}
                    >
                      {asset.section}
                    </p>
                  </div>
                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0"
                    style={{ background: hc, fontSize: 11 }}
                  >
                    {asset.health}
                  </div>
                </div>

                <div className="flex gap-1 flex-wrap mt-1">
                  <span
                    className="chip"
                    style={{
                      background: `${DEPT_COLORS[asset.department]}15`,
                      color: DEPT_COLORS[asset.department],
                      fontSize: 8,
                    }}
                  >
                    {asset.department === "ST" ? "S&T" : asset.department}
                  </span>
                  {asset.defectStatus !== "NONE" && (
                    <span
                      className={`chip chip-${
                        asset.defectStatus === "CRITICAL" ? "red" : "orange"
                      }`}
                      style={{ fontSize: 8 }}
                    >
                      {asset.defectStatus}
                    </span>
                  )}
                </div>

                <div className="priority-bar mt-2">
                  <div
                    className="priority-fill"
                    style={{ width: `${asset.health}%`, background: hc }}
                  />
                </div>

                <div
                  className="flex justify-between mt-1"
                  style={{ fontSize: 9, color: "var(--text-secondary)" }}
                >
                  <span>
                    Risk:{" "}
                    <strong
                      style={{
                        color:
                          (ai?.riskScore ?? asset.risk) > 60
                            ? "#D9534F"
                            : "inherit",
                      }}
                    >
                      {ai?.riskScore ?? asset.risk}%
                    </strong>
                  </span>
                  <span style={{ color: hc }}>
                    {HEALTH_LABEL(asset.health)}
                  </span>
                </div>
              </div>
            );
          })}
          {filtered.length > 60 && (
            <p
              className="col-span-full text-center text-xs py-2"
              style={{ color: "var(--text-secondary)" }}
            >
              Showing 60 of {filtered.length} assets — refine filters to see
              more.
            </p>
          )}
        </div>
      </div>

      {/* Side panel */}
      {selectedAsset && (
        <div className="w-72 flex-shrink-0 overflow-y-auto">
          <div className="card p-4 slide-in sticky top-0">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p
                  className="font-bold text-base"
                  style={{ color: "var(--navy)" }}
                >
                  {selectedAsset.id}
                </p>
                <p
                  className="text-xs"
                  style={{ color: "var(--text-secondary)" }}
                >
                  {selectedAsset.type} · {selectedAsset.section}
                </p>
              </div>
              <button
                onClick={() => setSelectedAssetId(null)}
                style={{ color: "var(--text-secondary)" }}
              >
                ×
              </button>
            </div>

            {/* Health ring */}
            <div className="flex items-center gap-4 mb-4">
              <div className="relative w-20 h-20 flex-shrink-0">
                <svg viewBox="0 0 80 80" className="w-full h-full -rotate-90">
                  <circle
                    cx="40"
                    cy="40"
                    r="32"
                    fill="none"
                    stroke="#E2E8F0"
                    strokeWidth="8"
                  />
                  <circle
                    cx="40"
                    cy="40"
                    r="32"
                    fill="none"
                    stroke={HEALTH_COLOR(selectedAsset.health)}
                    strokeWidth="8"
                    strokeDasharray={`${selectedAsset.health * 2.01} 201`}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span
                    className="font-bold text-base"
                    style={{ color: HEALTH_COLOR(selectedAsset.health) }}
                  >
                    {selectedAsset.health}
                  </span>
                </div>
              </div>
              <div>
                <p
                  className="font-semibold"
                  style={{ color: HEALTH_COLOR(selectedAsset.health) }}
                >
                  {HEALTH_LABEL(selectedAsset.health)}
                </p>
                <p
                  className="text-xs"
                  style={{ color: "var(--text-secondary)" }}
                >
                  Failure Risk:{" "}
                  <strong style={{ color: "#D9534F" }}>
                    {selectedAi?.riskScore ?? selectedAsset.risk}%
                  </strong>
                </p>
                <span
                  className={`chip chip-${
                    selectedAsset.criticality === "CRITICAL"
                      ? "red"
                      : selectedAsset.criticality === "HIGH"
                      ? "orange"
                      : "gray"
                  } mt-1`}
                >
                  {selectedAsset.criticality}
                </span>
              </div>
            </div>

            <div className="space-y-2 mb-3">
              {[
                { label: "Section", value: selectedAsset.section },
                {
                  label: "Department",
                  value:
                    selectedAsset.department === "ST"
                      ? "S&T"
                      : selectedAsset.department,
                },
                { label: "Usage Load", value: selectedAsset.usageLoad },
                {
                  label: "Maintenance Type",
                  value: selectedAsset.maintenanceFrequency,
                },
                { label: "Status", value: selectedAsset.status },
              ].map((f) => (
                <div
                  key={f.label}
                  className="flex justify-between text-xs"
                >
                  <span style={{ color: "var(--text-secondary)" }}>
                    {f.label}
                  </span>
                  <span className="font-medium">{f.value}</span>
                </div>
              ))}
            </div>

            {/* AI prediction block */}
            {selectedAi && (
              <div
                className="rounded p-2 mb-3"
                style={{ background: "#EDE9FE" }}
              >
                <p
                  className="text-xs font-semibold mb-1"
                  style={{ color: "#5B21B6" }}
                >
                  AI PREDICTION
                </p>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <p style={{ color: "#6B3FA0", fontSize: 10 }}>
                      Priority Score
                    </p>
                    <p
                      className="font-bold"
                      style={{ color: "#5B21B6" }}
                    >
                      {selectedAi.priorityScore}
                    </p>
                  </div>
                  <div>
                    <p style={{ color: "#6B3FA0", fontSize: 10 }}>
                      Priority Level
                    </p>
                    <p
                      className="font-bold"
                      style={{ color: "#5B21B6" }}
                    >
                      {selectedAi.priorityLevel}
                    </p>
                  </div>
                  <div>
                    <p style={{ color: "#6B3FA0", fontSize: 10 }}>
                      Prediction
                    </p>
                    <p
                      className="font-bold"
                      style={{
                        color: selectedAi.predictedFailure
                          ? "#D9534F"
                          : "#3F8F45",
                      }}
                    >
                      {selectedAi.predictedFailure ? "FAILURE" : "STABLE"}
                    </p>
                  </div>
                  <div>
                    <p style={{ color: "#6B3FA0", fontSize: 10 }}>
                      Confidence
                    </p>
                    <p
                      className="font-bold"
                      style={{ color: "#5B21B6" }}
                    >
                      {Math.round(selectedAi.predictionConfidence * 100)}%
                    </p>
                  </div>
                </div>
              </div>
            )}

            {selectedAsset.defectStatus !== "NONE" && (
              <div
                className="rounded p-2 mb-3"
                style={{ background: "#FEF3C7" }}
              >
                <p
                  className="text-xs font-semibold"
                  style={{ color: "#B45309" }}
                >
                  Defect: {selectedAsset.defectSeverity}
                </p>
                {selectedAsset.overdueDays && (
                  <p
                    className="text-xs font-bold mt-1"
                    style={{ color: "#D9534F" }}
                  >
                    Overdue: {selectedAsset.overdueDays} days
                  </p>
                )}
              </div>
            )}

            <div
              className="rounded p-2.5"
              style={{ background: "#EDE9FE" }}
            >
              <p
                className="text-xs font-semibold mb-1"
                style={{ color: "#5B21B6" }}
              >
                AI Recommendation
              </p>
              <p className="text-xs" style={{ color: "#6B3FA0" }}>
                {selectedAi?.predictedFailure
                  ? `Failure predicted (${selectedAi.priorityLevel}). Schedule within next feasible window on ${selectedAsset.section}.`
                  : selectedAsset.health < 65
                  ? "Schedule urgent maintenance within next low-traffic window. Failure risk elevated."
                  : "Asset within acceptable parameters. Continue scheduled maintenance."}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}