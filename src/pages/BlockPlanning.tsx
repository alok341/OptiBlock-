// ============================================================
// Block Planning
// Timeline · Candidate windows · Feasibility checks · Controller approval
// All data flows from bdms_block_requests.csv + feasible_block_windows.csv
// + optimized_block_plans.csv + coa_corridor_availability.csv
// ============================================================

import { useState, useMemo } from "react";
import { useApp } from "../store";
import CorridorStrip from "../components/CorridorStrip";
import {
  BLOCK_REQUESTS,
  BLOCK_REQUESTS_BY_ID,
  FEASIBLE_WINDOWS_BY_REQUEST,
  OPTIMIZED_PLANS_BY_REQUEST,
  SECTIONS_BY_ID,
  corridorForSection,
  tasksBySection,
  ANCHOR_BLOCK_REQUEST_ID,
  ANCHOR_SECTION_ID,
} from "../data/seed";

// ---------- Time helpers ----------

const HOURS = [0, 1, 2, 3, 4, 5, 6];
const TOTAL_HOURS = 6;

function timeToFrac(t: string) {
  // Accept "HH:MM" or "YYYY-MM-DD HH:MM"
  const time = t.includes(" ") ? t.split(" ")[1] : t;
  const [h, m] = time.split(":").map(Number);
  return (h + m / 60) / TOTAL_HOURS;
}

// ---------- Status chips ----------

const STATUS_COLOR: Record<string, { bg: string; text: string }> = {
  APPROVED:     { bg: "#DCFCE7", text: "#166534" },
  RECOMMENDED:  { bg: "#EDE9FE", text: "#5B21B6" },
  REQUESTED:    { bg: "#DBEAFE", text: "#1D4ED8" },
  UNDER_REVIEW: { bg: "#FEF3C7", text: "#B45309" },
  MODIFIED:     { bg: "#FEF3C7", text: "#B45309" },
  REJECTED:     { bg: "#FEE2E2", text: "#B91C1C" },
  CANCELLED:    { bg: "#F1F5F9", text: "#64748B" },
  COMPLETED:    { bg: "#DCFCE7", text: "#166534" },
};

// ---------- Feasibility row ----------

function FeasCheck({
  passed,
  label,
  reason,
}: {
  passed: boolean;
  label: string;
  reason?: string;
}) {
  return (
    <div
      className="flex items-center gap-2 text-xs py-1"
      style={{ borderBottom: "1px solid #F1F5F9" }}
    >
      <div
        className="w-5 h-5 rounded-full flex items-center justify-center text-white flex-shrink-0 font-bold"
        style={{ background: passed ? "#3F8F45" : "#D9534F", fontSize: 10 }}
      >
        {passed ? "✓" : "✗"}
      </div>
      <span style={{ color: passed ? "var(--text-primary)" : "#B91C1C" }}>
        {label}
      </span>
      {reason && !passed && (
        <span
          className="ml-auto"
          style={{ color: "#B91C1C", fontSize: 10 }}
        >
          — {reason}
        </span>
      )}
      {passed && (
        <span className="ml-auto" style={{ color: "#3F8F45", fontSize: 10 }}>
          PASS
        </span>
      )}
    </div>
  );
}

// ---------- Main page ----------

export default function BlockPlanning() {
  const {
    selectedSection,
    setSelectedSection,
    blockStatuses,
    updateBlockStatus,
    addAuditEvent,
    showToast,
    activeBlockRequestId,
    activeFeasibleWindows,
    activeOptimizedPlans,
    reoptimized,
  } = useApp();

  const [planView, setPlanView] = useState<"DAILY" | "WEEKLY" | "MONTHLY">(
    "DAILY"
  );
  const [selectedWindowIdx, setSelectedWindowIdx] = useState<number>(0);
  const [approvedIds, setApprovedIds] = useState<string[]>([]);

  // Determine which block request we're currently planning for
  const currentRequestId = selectedSection
    ? // Find first block on that section
      BLOCK_REQUESTS.find(
        (b) => b.section === selectedSection && b.status !== "CANCELLED"
      )?.id ?? activeBlockRequestId
    : activeBlockRequestId;

  const currentRequest = currentRequestId
    ? BLOCK_REQUESTS_BY_ID[currentRequestId]
    : undefined;

  const windows = useMemo(
    () =>
      currentRequestId
        ? FEASIBLE_WINDOWS_BY_REQUEST[currentRequestId] ?? []
        : activeFeasibleWindows,
    [currentRequestId, activeFeasibleWindows]
  );

  const plans = useMemo(
    () =>
      currentRequestId
        ? OPTIMIZED_PLANS_BY_REQUEST[currentRequestId] ?? []
        : activeOptimizedPlans,
    [currentRequestId, activeOptimizedPlans]
  );

  const selWin = windows[selectedWindowIdx];

  // ---------- Feasibility checks (derived from real data) ----------

  const feasibilityChecks = selWin
    ? [
        {
          label: "Corridor availability",
          passed:
            selWin.constraintStatus === "Feasible" ||
            !selWin.conflictReason.toLowerCase().includes("corridor"),
          reason: selWin.conflictReason,
        },
        {
          label: "Train occupancy",
          passed:
            selWin.conflictCount === 0 ||
            !selWin.conflictReason.toLowerCase().includes("train"),
          reason: selWin.conflictReason,
        },
        {
          label: "Maintenance duration fits",
          passed: selWin.durationMin >= (currentRequest?.duration ?? 0),
        },
        {
          label: "Section occupancy",
          passed:
            !selWin.conflictReason.toLowerCase().includes("occupancy"),
        },
        {
          label: "Constraint set status",
          passed: selWin.constraintStatus === "Feasible",
          reason: selWin.constraintStatus === "Rejected" ? selWin.conflictReason : undefined,
        },
        {
          label: "Optimization available",
          passed: plans.length > 0,
        },
      ]
    : [];
  const allPass = feasibilityChecks.every((f) => f.passed);

  // ---------- Approve action ----------

  function approveBlock(blockId: string) {
    updateBlockStatus(blockId, "APPROVED");
    setApprovedIds((prev) => [...prev, blockId]);
    addAuditEvent({
      timestamp: new Date().toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
      }),
      action: `Block ${blockId} approved`,
      actor: "COA USER",
      details: `Block ${blockId} approved via Block Planning.`,
      type: "APPROVAL",
    });
    showToast(`Block ${blockId} approved`, "success");
  }

  // ---------- Corridor slots for the selected section ----------

  const corridorSlots = selectedSection
    ? corridorForSection(selectedSection, "2026-09-23")
    : [];

  // ---------- Section block requests list ----------

  const sectionBlocks = BLOCK_REQUESTS.filter(
    (b) => !selectedSection || b.section === selectedSection
  )
    .sort((a, b) => b.priority - a.priority)
    .slice(0, 16);

  return (
    <div className="flex flex-col gap-4 h-full overflow-y-auto p-4">
      {/* Header */}
      <div className="flex items-center justify-between flex-shrink-0">
        <div>
          <h1
            className="text-lg font-bold"
            style={{ color: "var(--navy)" }}
          >
            Block Planning
          </h1>
          <p
            className="text-xs"
            style={{ color: "var(--text-secondary)" }}
          >
            Visual timeline · Candidate windows · Feasibility checks ·
            Controller approval
          </p>
        </div>
        <div className="flex items-center gap-2">
          {reoptimized && (
            <span className="chip chip-orange">UPDATED PLAN</span>
          )}
          <span className="chip chip-purple" style={{ fontSize: 9 }}>
            {currentRequestId ?? "—"}
          </span>
          <div className="flex gap-1">
            {(["DAILY", "WEEKLY", "MONTHLY"] as const).map((v) => (
              <button
                key={v}
                onClick={() => setPlanView(v)}
                className="px-3 py-1.5 rounded text-xs font-semibold"
                style={{
                  background: planView === v ? "var(--navy)" : "#F1F5F9",
                  color:
                    planView === v ? "white" : "var(--text-secondary)",
                }}
              >
                {v}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Corridor section picker */}
      <div className="card p-3 flex-shrink-0">
        <p
          className="text-xs font-semibold mb-2 uppercase tracking-wider"
          style={{ color: "var(--navy)" }}
        >
          Corridor — Select Section
        </p>
        <CorridorStrip />
      </div>

      {/* DAILY view */}
      {planView === "DAILY" && (
        <>
          {/* Timeline */}
          <div className="card p-4 flex-shrink-0">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p
                  className="font-bold text-sm"
                  style={{ color: "var(--navy)" }}
                >
                  Maintenance Block Timeline —{" "}
                  {selectedSection || ANCHOR_SECTION_ID} · 00:00–06:00
                </p>
                <p className="text-xs mt-0.5" style={{ color: "#6B3FA0" }}>
                  AI TELLS US WHAT IS IMPORTANT · CONSTRAINTS TELL US WHAT IS
                  POSSIBLE · OPTIMIZATION FINDS THE BEST FEASIBLE PLAN
                </p>
              </div>
            </div>

            {/* Time ruler */}
            <div className="flex mb-1" style={{ marginLeft: 110 }}>
              {HOURS.map((h) => (
                <div key={h} className="flex-1 relative">
                  <span
                    className="mono text-xs"
                    style={{ color: "var(--text-secondary)", fontSize: 10 }}
                  >
                    {String(h).padStart(2, "0")}:00
                  </span>
                </div>
              ))}
            </div>
            <div
              style={{
                height: 1,
                background: "var(--border)",
                marginLeft: 110,
                marginBottom: 8,
              }}
            />

            {/* Rows */}
            {(() => {
              // Build train flow row from corridor slots
              const trainRow = corridorSlots.map((slot) => ({
                start: slot.startTime,
                end: slot.endTime,
                label: slot.trafficLevel,
                bg:
                  slot.trafficLevel === "Normal"
                    ? "#F0FDF4"
                    : slot.trafficLevel === "Moderate"
                    ? "#EFF6FF"
                    : slot.trafficLevel === "High"
                    ? "#FEE2E2"
                    : "#FEF3C7",
                color:
                  slot.trafficLevel === "Normal"
                    ? "#166534"
                    : slot.trafficLevel === "Moderate"
                    ? "#1D4ED8"
                    : slot.trafficLevel === "High"
                    ? "#B91C1C"
                    : "#B45309",
                opacity: 0.85,
              }));

              // Engineering blocks
              const engBlocks = plans
                .filter((p) => p.department === "ENGINEERING")
                .map((p) => ({
                  start: p.startTime,
                  end: p.endTime,
                  label: `${p.assetId} · ${p.workType}`,
                  bg: "#DBEAFE",
                  color: "#1769AA",
                  opacity: 1,
                }));

              const stBlocks = plans
                .filter((p) => p.department === "ST")
                .map((p) => ({
                  start: p.startTime,
                  end: p.endTime,
                  label: `${p.assetId} · ${p.workType}`,
                  bg: "#EDE9FE",
                  color: "#6B3FA0",
                  opacity: 1,
                }));

              const tracBlocks = plans
                .filter((p) => p.department === "TRACTION")
                .map((p) => ({
                  start: p.startTime,
                  end: p.endTime,
                  label: `${p.assetId} · ${p.workType}`,
                  bg: "#CCFBF1",
                  color: "#16827A",
                  opacity: 1,
                }));

              // Available windows
              const availableRows = windows
                .filter((w) => w.feasible)
                .map((w) => ({
                  start: w.windowStart,
                  end: w.windowEnd,
                  label: `✓ ${w.windowId} · ${w.durationMin}min`,
                  bg: "#F0FDF4",
                  color: "#166534",
                  opacity: 0.9,
                }));

              return [
                { label: "TRAIN FLOW", labelColor: "#94A3B8", items: trainRow },
                {
                  label: "ENGINEERING",
                  labelColor: "#1769AA",
                  items: engBlocks,
                },
                { label: "S&T", labelColor: "#6B3FA0", items: stBlocks },
                { label: "TRACTION", labelColor: "#16827A", items: tracBlocks },
                {
                  label: "AVAILABLE",
                  labelColor: "#3F8F45",
                  items: availableRows,
                },
              ];
            })().map((row) => (
              <div
                key={row.label}
                className="flex items-center mb-2.5 gap-2"
              >
                <div
                  className="text-right flex-shrink-0 font-bold"
                  style={{
                    width: 108,
                    color: row.labelColor,
                    fontSize: 9,
                    letterSpacing: "0.05em",
                  }}
                >
                  {row.label}
                </div>
                <div
                  className="flex-1 h-8 rounded relative"
                  style={{
                    background: "#F8FAFC",
                    border: "1px solid #E2E8F0",
                  }}
                >
                  {row.items.map((item, idx) => {
                    const left = timeToFrac(item.start) * 100;
                    const right = timeToFrac(item.end) * 100;
                    const width = right - left;
                    const isMain =
                      item.label.includes("BLK-") ||
                      item.label.includes("TRK-104") ||
                      item.label.includes("OPT-");
                    return (
                      <div
                        key={idx}
                        className="absolute top-0.5 bottom-0.5 rounded flex items-center px-1.5 overflow-hidden"
                        style={{
                          left: `${left}%`,
                          width: `${Math.max(width, 0.5)}%`,
                          background: isMain
                            ? row.labelColor + "CC"
                            : item.bg,
                          border: isMain
                            ? `1.5px solid ${row.labelColor}`
                            : `1px solid ${item.color}40`,
                          opacity: item.opacity,
                        }}
                      >
                        <span
                          className="text-xs font-semibold truncate"
                          style={{
                            color: isMain ? "white" : item.color,
                            fontSize: 9,
                            whiteSpace: "nowrap",
                          }}
                        >
                          {width > 6 ? item.label : ""}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}

            {/* Coordinated block highlight */}
            {plans.length > 0 && (
              <div
                className="mt-3 flex items-center mb-1.5"
                style={{ marginLeft: 110 }}
              >
                <div
                  className="flex-1 h-9 relative rounded"
                  style={{
                    background: "#F5F3FF",
                    border: "1.5px solid #6B3FA0",
                  }}
                >
                  <div
                    className="absolute top-0.5 bottom-0.5 rounded-l flex items-center px-2"
                    style={{
                      left: `${timeToFrac(plans[0].startTime) * 100}%`,
                      width: `${
                        (timeToFrac(plans[0].endTime) -
                          timeToFrac(plans[0].startTime)) *
                        100
                      }%`,
                      background: "#6B3FA0",
                    }}
                  >
                    <span
                      className="text-white font-bold truncate"
                      style={{ fontSize: 9 }}
                    >
                      OPTIMIZED BLOCK {currentRequestId} ·{" "}
                      {plans[0].department === "ST"
                        ? "S&T"
                        : plans[0].department}{" "}
                      · {plans[0].startTime.split(" ")[1]}–
                      {plans[0].endTime.split(" ")[1]}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Approval row */}
            {plans.length > 0 && (
              <div className="ml-28 flex items-center gap-2 mt-1">
                <span className="text-xs" style={{ color: "#6B3FA0" }}>
                  RECOMMENDED PLAN
                </span>
                {reoptimized ? (
                  <span className="chip chip-orange" style={{ fontSize: 9 }}>
                    UPDATED
                  </span>
                ) : (
                  <span className="chip chip-green" style={{ fontSize: 9 }}>
                    OPTIMIZED
                  </span>
                )}
                {((currentRequestId &&
                  blockStatuses[currentRequestId] === "APPROVED") ||
                  approvedIds.includes(currentRequestId ?? "")) ? (
                  <span className="chip chip-green" style={{ fontSize: 9 }}>
                    APPROVED
                  </span>
                ) : (
                  <button
                    onClick={() => {
                      if (currentRequestId) approveBlock(currentRequestId);
                    }}
                    className="text-xs px-3 py-1 rounded font-bold"
                    style={{ background: "#3F8F45", color: "white" }}
                  >
                    APPROVE BLOCK
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Candidate windows + Feasibility */}
          <div
            className="grid gap-4 flex-shrink-0"
            style={{ gridTemplateColumns: "1fr 1fr" }}
          >
            {/* Candidate windows */}
            <div className="card p-4">
              <p
                className="font-bold text-sm mb-1"
                style={{ color: "var(--navy)" }}
              >
                Candidate Windows — {selectedSection || ANCHOR_SECTION_ID}
              </p>
              <p
                className="text-xs mb-3"
                style={{ color: "var(--text-secondary)" }}
              >
                Evaluated by constraint engine from{" "}
                {windows.length} feasible_block_windows.csv rows
              </p>
              {windows.length === 0 ? (
                <p
                  className="text-xs"
                  style={{ color: "var(--text-secondary)" }}
                >
                  No candidate windows for this block request.
                </p>
              ) : (
                <div className="space-y-2">
                  {windows.map((w, i) => (
                    <div
                      key={w.windowId}
                      onClick={() => setSelectedWindowIdx(i)}
                      className="rounded-md p-3 cursor-pointer transition-all hover-lift"
                      style={{
                        border:
                          selectedWindowIdx === i
                            ? `2px solid ${
                                w.feasible ? "#3F8F45" : "#D9534F"
                              }`
                            : `1px solid ${
                                w.feasible ? "#86EFAC" : "#FCA5A5"
                              }`,
                        background: !w.feasible
                          ? "#FEF2F2"
                          : w.feasible
                          ? "#F0FDF4"
                          : "#FAFAFA",
                      }}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span
                              className="font-bold mono text-base"
                              style={{
                                color: w.feasible
                                  ? "#3F8F45"
                                  : "#D9534F",
                              }}
                            >
                              {w.windowStart.split(" ")[1]} –{" "}
                              {w.windowEnd.split(" ")[1]}
                            </span>
                            {w.feasible ? (
                              <span
                                className="chip chip-green"
                                style={{ fontSize: 9 }}
                              >
                                ★ FEASIBLE
                              </span>
                            ) : (
                              <span
                                className="chip chip-red"
                                style={{ fontSize: 9 }}
                              >
                                NOT FEASIBLE
                              </span>
                            )}
                          </div>
                          {!w.feasible && w.conflictReason && (
                            <p
                              className="text-xs mt-0.5"
                              style={{ color: "#D9534F" }}
                            >
                              {w.conflictReason}
                            </p>
                          )}
                        </div>
                        <div className="text-right">
                          <p
                            className="font-bold text-lg leading-none"
                            style={{
                              color: w.feasible ? "#3F8F45" : "#94A3B8",
                            }}
                          >
                            {w.durationMin}m
                          </p>
                          <p
                            style={{
                              color: "var(--text-secondary)",
                              fontSize: 9,
                            }}
                          >
                            duration
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-4 text-xs">
                        <span
                          style={{ color: "var(--text-secondary)" }}
                        >
                          Window:{" "}
                          <strong>{w.windowId}</strong>
                        </span>
                        <span
                          style={{ color: "var(--text-secondary)" }}
                        >
                          Conflicts:{" "}
                          <strong
                            style={{
                              color:
                                w.conflictCount === 0
                                  ? "#3F8F45"
                                  : "#D9534F",
                            }}
                          >
                            {w.conflictCount}
                          </strong>
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Feasibility */}
            <div className="card p-4">
              <p
                className="font-bold text-sm mb-1"
                style={{ color: "var(--navy)" }}
              >
                Feasibility Check —{" "}
                {selWin
                  ? `${selWin.windowStart.split(" ")[1]}–${
                      selWin.windowEnd.split(" ")[1]
                    }`
                  : "—"}
              </p>
              <p
                className="text-xs mb-3"
                style={{ color: "var(--text-secondary)" }}
              >
                Constraint engine verification · {currentRequestId}
              </p>

              {selWin ? (
                <>
                  <div className="mb-3">
                    {feasibilityChecks.map((f) => (
                      <FeasCheck
                        key={f.label}
                        passed={f.passed}
                        label={f.label}
                        reason={f.reason}
                      />
                    ))}
                  </div>

                  <div
                    className="rounded-md p-3 text-center mb-3"
                    style={{
                      background: allPass ? "#DCFCE7" : "#FEE2E2",
                      border: `1.5px solid ${
                        allPass ? "#86EFAC" : "#FCA5A5"
                      }`,
                    }}
                  >
                    <p
                      className="font-bold text-base"
                      style={{
                        color: allPass ? "#166534" : "#B91C1C",
                      }}
                    >
                      {allPass ? "✓ FEASIBLE" : "✗ NOT FEASIBLE"}
                    </p>
                    {!allPass && (
                      <p
                        className="text-xs mt-1"
                        style={{ color: "#B91C1C" }}
                      >
                        {selWin.conflictReason ||
                          "Constraint violation detected"}
                      </p>
                    )}
                  </div>

                  {allPass && plans.length > 0 && (
                    <div
                      className="rounded p-3"
                      style={{ background: "#EDE9FE" }}
                    >
                      <p
                        className="font-bold text-xs mb-2"
                        style={{ color: "#5B21B6" }}
                      >
                        OPTIMIZED BLOCK PLAN
                      </p>
                      <div
                        className="space-y-1 text-xs"
                        style={{ color: "#6B3FA0" }}
                      >
                        <p>
                          • {plans[0].sectionId} ·{" "}
                          {plans[0].startTime.split(" ")[1]}–
                          {plans[0].endTime.split(" ")[1]} ·{" "}
                          {plans[0].department === "ST"
                            ? "S&T"
                            : plans[0].department}
                        </p>
                        <p>
                          • Asset: {plans[0].assetId} ·{" "}
                          {plans[0].workType}
                        </p>
                        <p>
                          • Expected Delay: {plans[0].trainDelay} min ·
                          Conflicts: {plans[0].conflictCount}
                        </p>
                        <p>
                          • Duration: {plans[0].duration} min · Priority:{" "}
                          {plans[0].priority}
                        </p>
                      </div>
                      <div className="mt-2 space-y-1">
                        <p
                          className="text-xs flex items-center gap-1"
                          style={{ color: "#5B21B6" }}
                        >
                          <span style={{ color: "#3F8F45" }}>•</span>
                          {plans[0].reason}
                        </p>
                      </div>
                    </div>
                  )}

                  {allPass && plans.length === 0 && (
                    <div
                      className="rounded p-2"
                      style={{ background: "#FEF3C7" }}
                    >
                      <p
                        className="text-xs font-semibold"
                        style={{ color: "#B45309" }}
                      >
                        No optimized plan yet
                      </p>
                      <p
                        className="text-xs"
                        style={{ color: "#92400E" }}
                      >
                        Feasible window identified, awaiting optimizer run.
                      </p>
                    </div>
                  )}
                </>
              ) : (
                <p
                  className="text-xs"
                  style={{ color: "var(--text-secondary)" }}
                >
                  Select a candidate window to check feasibility.
                </p>
              )}
            </div>
          </div>

          {/* Block requests list */}
          <div className="card p-4 flex-shrink-0">
            <p
              className="font-bold text-sm mb-3"
              style={{ color: "var(--navy)" }}
            >
              Block Requests — {selectedSection || "All Sections"}
            </p>
            <div className="space-y-1.5 max-h-72 overflow-y-auto">
              {sectionBlocks.map((block) => {
                const status = blockStatuses[block.id] || block.status;
                const sc = STATUS_COLOR[status] || {
                  bg: "#F1F5F9",
                  text: "#475569",
                };
                return (
                  <div
                    key={block.id}
                    className="flex items-center gap-3 px-3 py-2 rounded hover-lift cursor-pointer"
                    style={{
                      background:
                        block.id === currentRequestId
                          ? "#F5F3FF"
                          : "#F8FAFC",
                      border:
                        block.id === currentRequestId
                          ? "1px solid #C4B5FD"
                          : "1px solid var(--border)",
                    }}
                    onClick={() => setSelectedSection(block.section)}
                  >
                    <span
                      className="font-bold text-xs mono"
                      style={{ color: "var(--navy)", minWidth: 60 }}
                    >
                      {block.id}
                    </span>
                    <span
                      className="text-xs"
                      style={{ color: "var(--text-secondary)", minWidth: 60 }}
                    >
                      {block.section}
                    </span>
                    <span className="text-xs">
                      {block.departments
                        .map((d) => (d === "ST" ? "S&T" : d))
                        .join(" + ")}
                    </span>
                    <span
                      className="text-xs"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      {block.requestedStart}–{block.requestedEnd}
                    </span>
                    <span
                      className="flex-1 text-xs truncate"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      {block.reason.slice(0, 40)}…
                    </span>
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <span
                        className="font-bold text-sm"
                        style={{
                          color:
                            block.priority >= 80 ? "#D9534F" : "#D97706",
                        }}
                      >
                        {block.priority}
                      </span>
                      <span
                        className="chip text-xs"
                        style={{
                          background: sc.bg,
                          color: sc.text,
                          fontSize: 9,
                        }}
                      >
                        {status}
                      </span>
                      {(status === "RECOMMENDED" ||
                        status === "REQUESTED") && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            approveBlock(block.id);
                          }}
                          className="text-xs px-2 py-0.5 rounded font-semibold"
                          style={{ background: "#3F8F45", color: "white" }}
                        >
                          Approve
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}

      {/* WEEKLY view */}
      {planView === "WEEKLY" && (
        <div className="card p-4 flex-shrink-0">
          <p
            className="font-bold text-sm mb-4"
            style={{ color: "var(--navy)" }}
          >
            Weekly Block Plan — 23–29 Sep 2026
          </p>
          <div className="grid grid-cols-7 gap-2">
            {[
              { day: "Mon", date: "23 Sep", blocks: 16 },
              { day: "Tue", date: "24 Sep", blocks: 14 },
              { day: "Wed", date: "25 Sep", blocks: 12 },
              { day: "Thu", date: "26 Sep", blocks: 10 },
              { day: "Fri", date: "27 Sep", blocks: 9 },
              { day: "Sat", date: "28 Sep", blocks: 11 },
              { day: "Sun", date: "29 Sep", blocks: 8 },
            ].map((d) => (
              <div
                key={d.day}
                className="rounded-md p-3 text-center hover-lift cursor-pointer"
                style={{
                  background: "#F8FAFC",
                  border: "1px solid var(--border)",
                }}
              >
                <p
                  className="font-semibold text-xs"
                  style={{ color: "var(--text-secondary)" }}
                >
                  {d.day}
                </p>
                <p
                  className="text-xs"
                  style={{ color: "var(--text-secondary)" }}
                >
                  {d.date}
                </p>
                <p
                  className="text-2xl font-bold mt-1"
                  style={{ color: "#1769AA" }}
                >
                  {d.blocks}
                </p>
                <p
                  className="text-xs"
                  style={{ color: "var(--text-secondary)" }}
                >
                  requests
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MONTHLY view */}
      {planView === "MONTHLY" && (
        <div className="card p-4 flex-shrink-0">
          <p
            className="font-bold text-sm mb-4"
            style={{ color: "var(--navy)" }}
          >
            Monthly Summary — September 2026
          </p>
          <div className="grid grid-cols-3 gap-4">
            {[
              {
                label: "Total Block Requests",
                value: BLOCK_REQUESTS.length.toString(),
                color: "#1769AA",
              },
              {
                label: "Feasible Windows",
                value: Object.values(FEASIBLE_WINDOWS_BY_REQUEST)
                  .flat()
                  .filter((w) => w.feasible)
                  .length.toString(),
                color: "#3F8F45",
              },
              {
                label: "Optimized Plans",
                value: Object.values(OPTIMIZED_PLANS_BY_REQUEST)
                  .flat()
                  .length.toString(),
                color: "#6B3FA0",
              },
              {
                label: "Rejected Windows",
                value: Object.values(FEASIBLE_WINDOWS_BY_REQUEST)
                  .flat()
                  .filter((w) => !w.feasible)
                  .length.toString(),
                color: "#D9534F",
              },
              {
                label: "Sections Covered",
                value: "10",
                color: "#16827A",
              },
              {
                label: "Emergency Requests",
                value: BLOCK_REQUESTS.filter((b) => b.priority >= 85)
                  .length.toString(),
                color: "#D97706",
              },
            ].map((k) => (
              <div key={k.label} className="card p-4">
                <p
                  className="text-xs"
                  style={{ color: "var(--text-secondary)" }}
                >
                  {k.label}
                </p>
                <p
                  className="text-3xl font-bold"
                  style={{ color: k.color }}
                >
                  {k.value}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}