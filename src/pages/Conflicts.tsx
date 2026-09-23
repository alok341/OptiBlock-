// ============================================================
// Conflicts & Constraints
// Every conflict card is derived from a REJECTED row in
// feasible_block_windows.csv (feasible = "No").
// Constraints panel reads from operational_constraints.csv.
// ============================================================

import { useState } from "react";
import { useApp } from "../store";
import {
  FEASIBLE_WINDOWS,
  BLOCK_REQUESTS_BY_ID,
  CONSTRAINTS,
  constraintsForSection,
} from "../data/seed";
import type { FeasibleWindow } from "../types";

// ---------- Conflict card — derived from a rejected window ----------

function ConflictCard({
  window: w,
  resolved,
  onResolve,
}: {
  window: FeasibleWindow;
  resolved: boolean;
  onResolve: () => void;
}) {
  const request = BLOCK_REQUESTS_BY_ID[w.blockRequestId];
  const reason = w.conflictReason;
  const isTrainConflict = reason.toLowerCase().includes("train");
  const isCorridor = reason.toLowerCase().includes("corridor");

  // Pull train number from reason string when present
  const trainMatch = reason.match(/Train\s+(\d+)/);
  const trainNo = trainMatch?.[1];

  // Colour by conflict kind
  const accent = isTrainConflict
    ? "#D9534F"
    : isCorridor
    ? "#1769AA"
    : "#D97706";

  return (
    <div
      className="card p-4 hover-lift"
      style={{
        borderLeft: `3px solid ${resolved ? "#3F8F45" : accent}`,
        opacity: resolved ? 0.75 : 1,
      }}
    >
      <div className="flex items-start justify-between mb-2">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span
              className="font-bold text-xs mono"
              style={{ color: accent }}
            >
              {isTrainConflict
                ? "TRAIN × BLOCK"
                : isCorridor
                ? "CORRIDOR"
                : "CONSTRAINT"}
            </span>
            <span
              className={`chip ${
                resolved ? "chip-green" : "chip-red"
              }`}
              style={{ fontSize: 9 }}
            >
              {resolved ? "RESOLVED" : "ACTIVE"}
            </span>
          </div>
          <p
            className="font-semibold text-xs"
            style={{ color: "var(--navy)" }}
          >
            {w.sectionId} · {w.windowId}
          </p>
        </div>
        <span
          className="mono text-xs"
          style={{ color: "var(--text-secondary)" }}
        >
          {w.blockRequestId}
        </span>
      </div>

      <p
        className="text-xs mb-2"
        style={{ color: "var(--text-primary)" }}
      >
        Requested block{" "}
        <strong>{request?.id ?? w.blockRequestId}</strong> on{" "}
        {w.sectionId} — {reason}
      </p>

      <div className="flex gap-1 mb-1 flex-wrap">
        <span style={{ color: "var(--text-secondary)", fontSize: 10 }}>
          Blocks:
        </span>
        <span className="chip chip-purple" style={{ fontSize: 9 }}>
          {w.blockRequestId}
        </span>
      </div>
      {trainNo && (
        <div className="flex gap-1 mb-2 flex-wrap">
          <span style={{ color: "var(--text-secondary)", fontSize: 10 }}>
            Trains:
          </span>
          <span className="chip chip-orange" style={{ fontSize: 9 }}>
            {trainNo}
          </span>
        </div>
      )}

      <div className="grid grid-cols-3 gap-2 mb-3 mt-2">
        <div className="rounded p-2" style={{ background: "#F8FAFC" }}>
          <p style={{ color: "var(--text-secondary)", fontSize: 9 }}>
            Requested
          </p>
          <p className="text-xs font-semibold mono">
            {w.windowStart.split(" ")[1]}–
            {w.windowEnd.split(" ")[1]}
          </p>
        </div>
        <div className="rounded p-2" style={{ background: "#F8FAFC" }}>
          <p style={{ color: "var(--text-secondary)", fontSize: 9 }}>
            Conflicts
          </p>
          <p
            className="text-xs font-semibold"
            style={{ color: "#D9534F" }}
          >
            {w.conflictCount}
          </p>
        </div>
        <div className="rounded p-2" style={{ background: "#F8FAFC" }}>
          <p style={{ color: "var(--text-secondary)", fontSize: 9 }}>
            Status
          </p>
          <p className="text-xs font-semibold">{w.constraintStatus}</p>
        </div>
      </div>

      {!resolved && (
        <div className="flex gap-2">
          <button
            onClick={onResolve}
            className="flex-1 text-xs py-1.5 rounded font-semibold"
            style={{ background: "#3F8F45", color: "white" }}
          >
            Mark Resolved
          </button>
        </div>
      )}
    </div>
  );
}

// ---------- Main page ----------

export default function Conflicts() {
  const { showToast, addAuditEvent } = useApp();
  const [filter, setFilter] = useState<
    "ALL" | "TRAIN" | "CORRIDOR" | "RESOLVED"
  >("ALL");
  const [resolvedIds, setResolvedIds] = useState<string[]>([]);

  // All rejected feasible windows are conflicts
  const allConflicts = FEASIBLE_WINDOWS.filter((w) => !w.feasible);

  const filtered = allConflicts.filter((w) => {
    const isResolved = resolvedIds.includes(w.windowId);
    if (filter === "RESOLVED") return isResolved;
    if (filter === "TRAIN")
      return (
        !isResolved && w.conflictReason.toLowerCase().includes("train")
      );
    if (filter === "CORRIDOR")
      return (
        !isResolved && w.conflictReason.toLowerCase().includes("corridor")
      );
    return true;
  });

  const kpis = [
    {
      label: "Active Conflicts",
      value: allConflicts.filter(
        (w) => !resolvedIds.includes(w.windowId)
      ).length,
      color: "#D9534F",
    },
    {
      label: "Train Conflicts",
      value: allConflicts.filter((w) =>
        w.conflictReason.toLowerCase().includes("train")
      ).length,
      color: "#D97706",
    },
    {
      label: "Corridor Conflicts",
      value: allConflicts.filter((w) =>
        w.conflictReason.toLowerCase().includes("corridor")
      ).length,
      color: "#1769AA",
    },
    {
      label: "Constraints Loaded",
      value: CONSTRAINTS.length,
      color: "#6B3FA0",
    },
  ];

  function handleResolve(w: FeasibleWindow) {
    setResolvedIds((prev) => [...prev, w.windowId]);
    addAuditEvent({
      timestamp: new Date().toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
      }),
      action: `Conflict ${w.windowId} resolved`,
      actor: "COA USER",
      details: `Resolved: ${w.conflictReason.slice(0, 60)}`,
      type: "ACTION",
    });
    showToast(`Conflict ${w.windowId} marked as resolved`, "success");
  }

  return (
    <div className="flex flex-col gap-4 h-full overflow-y-auto p-4">
      <div>
        <h1 className="text-lg font-bold" style={{ color: "var(--navy)" }}>
          Conflicts & Constraints
        </h1>
        <p className="text-xs" style={{ color: "var(--text-secondary)" }}>
          Derived from{" "}
          <span className="mono">
            feasible_block_windows.csv
          </span>{" "}
          where feasible = No · Constraints from{" "}
          <span className="mono">operational_constraints.csv</span>
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

      {/* Constraints strip */}
      <div className="card p-4">
        <p
          className="font-semibold text-sm mb-3"
          style={{ color: "var(--navy)" }}
        >
          Operational Constraints (Hard rules)
        </p>
        <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto">
          {CONSTRAINTS.slice(0, 12).map((c) => (
            <div
              key={c.constraintId}
              className="flex items-center gap-2 text-xs p-1.5 rounded"
              style={{ background: "#F8FAFC" }}
            >
              <span
                className="w-2 h-2 rounded-full flex-shrink-0"
                style={{
                  background:
                    c.status === "Active" ? "#3F8F45" : "#D97706",
                }}
              />
              <span className="font-mono font-semibold">
                {c.constraintId}
              </span>
              <span
                style={{ color: "var(--text-secondary)" }}
                className="truncate"
              >
                {c.constraintType}
              </span>
              <span
                className="ml-auto chip chip-gray"
                style={{ fontSize: 8 }}
              >
                {c.sectionId}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Filter chips */}
      <div className="flex gap-2">
        {(["ALL", "TRAIN", "CORRIDOR", "RESOLVED"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className="px-3 py-1.5 rounded text-xs font-semibold"
            style={{
              background: filter === f ? "var(--navy)" : "#F1F5F9",
              color:
                filter === f ? "white" : "var(--text-secondary)",
            }}
          >
            {f}
          </button>
        ))}
        <span
          className="ml-auto text-xs self-center"
          style={{ color: "var(--text-secondary)" }}
        >
          {filtered.length} conflicts
        </span>
      </div>

      {/* Conflict cards */}
      <div
        className="grid gap-3"
        style={{
          gridTemplateColumns: "repeat(auto-fill, minmax(380px, 1fr))",
        }}
      >
        {filtered.map((w) => (
          <ConflictCard
            key={w.windowId}
            window={w}
            resolved={resolvedIds.includes(w.windowId)}
            onResolve={() => handleResolve(w)}
          />
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16">
          <p className="text-lg font-bold" style={{ color: "#3F8F45" }}>
            ✓ No conflicts in this category
          </p>
          <p
            className="text-sm mt-2"
            style={{ color: "var(--text-secondary)" }}
          >
            All detected conflicts have been resolved.
          </p>
        </div>
      )}
    </div>
  );
}