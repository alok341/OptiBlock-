// ============================================================
// Live Operations
// Live train feed · Event simulation · Impact · Re-optimization
// Data sources:
//   - live_train_movement.csv  (liveTrainMovement)
//   - live_events.csv          (liveEvents)
//   - train_timetable.csv      (scheduled reference)
// ============================================================

import { useState } from "react";
import { useApp } from "../store";
import RailwayMap from "../components/RailwayMap";
import {
  LIVE_EVENTS_UI,
  BLOCK_REQUESTS,
  SECTIONS_BY_ID,
} from "../data/seed";
import type { LiveEvent } from "../types";

// ---------- Re-optimization step list ----------

const REOPT_STEPS = [
  "Impact assessment",
  "Recalculating feasible windows",
  "Checking constraints",
  "Running OR-Tools optimization",
  "Generating updated plan",
];

// ---------- Event type color map ----------

const EVENT_COLOR: Record<string, { bg: string; text: string }> = {
  "Train Delay":            { bg: "#FEF3C7", text: "#B45309" },
  "New Critical Defect":    { bg: "#FEE2E2", text: "#B91C1C" },
  "Block Cancelled":        { bg: "#F1F5F9", text: "#475569" },
  "Corridor Unavailable":   { bg: "#DBEAFE", text: "#1D4ED8" },
  "Updated Train Movement": { bg: "#F0FDF4", text: "#166534" },
};

const SEVERITY_COLOR: Record<string, string> = {
  Critical: "#D9534F",
  High: "#D97706",
  Medium: "#1769AA",
  Low: "#3F8F45",
};

// ---------- Main page ----------

export default function LiveOperations() {
  const {
    liveTrains,
    liveEvents,
    pipelineStage,
    activeFeasibleWindows,
    activeOptimizedPlans,
    activeBlockRequestId,
    triggerLiveEvent,
    triggerReoptimize,
    reoptimized,
    auditEvents,
    showToast,
  } = useApp();

  const [reoptRunning, setReoptRunning] = useState(false);
  const [reoptStep, setReoptStep] = useState(-1);
  const [simulateEventId, setSimulateEventId] = useState<string>("EVT-002");
  const [showImpact, setShowImpact] = useState(false);

  const delayed = liveTrains.filter((t) => t.delay > 0);
  const onTime = liveTrains.filter((t) => t.delay === 0);
  const activeEvents = liveEvents.filter((e) => e.status === "Active");

  const selectedEvent = LIVE_EVENTS_UI.find(
    (e) => e.eventId === simulateEventId
  );

  // Derive impact numbers from the anchor block + selected event
  const anchorPlan = activeOptimizedPlans[0];
  const anchorFeasible = activeFeasibleWindows.find((w) => w.feasible);

  // ---------- Handlers ----------

  function handleSimulate() {
    if (!selectedEvent) return;
    triggerLiveEvent(selectedEvent.eventId);
    setShowImpact(true);
  }

  async function handleReoptimize() {
    if (reoptRunning) return;
    setReoptRunning(true);
    for (let i = 0; i < REOPT_STEPS.length; i++) {
      setReoptStep(i);
      await new Promise((r) => setTimeout(r, 800));
    }
    triggerReoptimize();
    setReoptRunning(false);
    setReoptStep(REOPT_STEPS.length);
  }

  return (
    <div className="flex flex-col gap-4 h-full overflow-y-auto p-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1
            className="text-lg font-bold"
            style={{ color: "var(--navy)" }}
          >
            Live Operations
          </h1>
          <div className="flex items-center gap-2 mt-0.5">
            <span
              className="pulse-dot w-2 h-2"
              style={{ background: "var(--live-teal)" }}
            />
            <span
              className="text-xs font-semibold"
              style={{ color: "var(--live-teal)" }}
            >
              SIMULATED LIVE FEED
            </span>
            <span
              className="text-xs"
              style={{ color: "var(--text-secondary)" }}
            >
              · from live_train_movement.csv ({liveTrains.length} trains)
            </span>
            {pipelineStage !== "IDLE" && (
              <span className="chip chip-purple" style={{ fontSize: 9 }}>
                PIPELINE: {pipelineStage}
              </span>
            )}
          </div>
        </div>
        <div className="flex gap-3">
          {[
            {
              label: "Active Trains",
              value: liveTrains.length,
              color: "#3F8F45",
            },
            {
              label: "Delayed",
              value: delayed.length,
              color: "#D97706",
            },
            {
              label: "Active Blocks",
              value: BLOCK_REQUESTS.filter(
                (b) => b.status === "APPROVED"
              ).length,
              color: "#6B3FA0",
            },
            {
              label: "Active Events",
              value: activeEvents.length,
              color: "#D9534F",
            },
          ].map((k) => (
            <div key={k.label} className="card px-3 py-2 text-center">
              <p
                className="font-bold text-lg leading-none"
                style={{ color: k.color }}
              >
                {k.value}
              </p>
              <p
                style={{ color: "var(--text-secondary)", fontSize: 10 }}
              >
                {k.label}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div
        className="grid gap-4"
        style={{ gridTemplateColumns: "2fr 1fr" }}
      >
        {/* LEFT: Map + trains */}
        <div className="flex flex-col gap-3">
          <div className="card p-3">
            <RailwayMap compact />
          </div>

          {/* Train status */}
          <div className="card p-3">
            <p
              className="font-semibold text-xs mb-2 uppercase tracking-wider"
              style={{ color: "var(--navy)" }}
            >
              Live Train Status ({liveTrains.length})
            </p>
            <div className="max-h-52 overflow-y-auto space-y-1">
              {liveTrains.slice(0, 25).map((train) => {
                const isDelayed = train.delay > 0;
                const section = SECTIONS_BY_ID[train.section];
                return (
                  <div
                    key={train.number + train.section}
                    className="flex items-center gap-3 px-3 py-2 rounded"
                    style={{
                      background: isDelayed ? "#FEF9C3" : "#F8FAFC",
                      border: `1px solid ${
                        isDelayed ? "#FCD34D" : "var(--border)"
                      }`,
                    }}
                  >
                    <div
                      className="w-8 h-5 rounded text-white text-xs flex items-center justify-center font-bold flex-shrink-0"
                      style={{
                        background: isDelayed ? "#D97706" : "#3F8F45",
                        fontSize: 9,
                      }}
                    >
                      {train.type[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold">
                        {train.number}{" "}
                        <span
                          style={{
                            color: "var(--text-secondary)",
                            fontWeight: 400,
                          }}
                        >
                          {train.name}
                        </span>
                      </p>
                      <p
                        style={{
                          color: "var(--text-secondary)",
                          fontSize: 10,
                        }}
                      >
                        {train.section}
                        {section ? ` · ${section.from}–${section.to}` : ""} ·{" "}
                        {train.direction} · {train.speed} kmph
                      </p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      {isDelayed ? (
                        <span className="chip chip-orange">
                          +{train.delay} min
                        </span>
                      ) : (
                        <span className="chip chip-green">ON TIME</span>
                      )}
                    </div>
                  </div>
                );
              })}
              {liveTrains.length > 25 && (
                <p
                  style={{ color: "var(--text-secondary)", fontSize: 10 }}
                  className="text-center py-1"
                >
                  +{liveTrains.length - 25} more trains in feed
                </p>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT: Simulate + Impact + Feed */}
        <div className="flex flex-col gap-3">
          {/* Simulate event */}
          <div className="card p-4">
            <p
              className="font-semibold text-sm mb-3"
              style={{ color: "var(--navy)" }}
            >
              Simulate Live Event
            </p>
            <select
              value={simulateEventId}
              onChange={(e) => setSimulateEventId(e.target.value)}
              className="w-full text-xs rounded px-2 py-2 mb-3 border"
              style={{ borderColor: "var(--border)" }}
            >
              {LIVE_EVENTS_UI.slice(0, 15).map((e) => (
                <option key={e.eventId} value={e.eventId}>
                  {e.eventId} · {e.eventType} · {e.sectionId}
                </option>
              ))}
            </select>

            {selectedEvent && (
              <div
                className="rounded p-2 mb-3 text-xs"
                style={{ background: "#F8FAFC" }}
              >
                <p>
                  <strong>Event:</strong> {selectedEvent.eventType}
                </p>
                <p>
                  <strong>Section:</strong> {selectedEvent.sectionId}
                </p>
                {selectedEvent.trainNo && (
                  <p>
                    <strong>Train:</strong> {selectedEvent.trainNo}
                  </p>
                )}
                {selectedEvent.assetId && (
                  <p>
                    <strong>Asset:</strong> {selectedEvent.assetId}
                  </p>
                )}
                <p>
                  <strong>Severity:</strong>{" "}
                  <span
                    style={{
                      color: SEVERITY_COLOR[selectedEvent.severity],
                      fontWeight: 600,
                    }}
                  >
                    {selectedEvent.severity}
                  </span>
                </p>
                <p className="mt-1" style={{ color: "var(--text-secondary)" }}>
                  {selectedEvent.description}
                </p>
              </div>
            )}

            <button
              onClick={handleSimulate}
              disabled={selectedEvent?.status === "Active"}
              className="w-full py-2.5 rounded font-semibold text-sm transition-colors"
              style={{
                background:
                  selectedEvent?.status === "Active"
                    ? "#94A3B8"
                    : "#D97706",
                color: "white",
              }}
            >
              {selectedEvent?.status === "Active"
                ? "Event Already Active"
                : "TRIGGER EVENT"}
            </button>
          </div>

          {/* Impact assessment */}
          {showImpact && (
            <div
              className="card p-4 slide-in"
              style={{ border: "2px solid #D97706" }}
            >
              <p
                className="font-bold text-sm mb-2"
                style={{ color: "#B45309" }}
              >
                IMPACT ASSESSMENT
              </p>

              <div className="space-y-1 text-xs mb-3">
                <div className="flex justify-between">
                  <span style={{ color: "var(--text-secondary)" }}>
                    Event
                  </span>
                  <span className="font-semibold">
                    {selectedEvent?.eventType}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span style={{ color: "var(--text-secondary)" }}>
                    Section
                  </span>
                  <span className="font-semibold">
                    {selectedEvent?.sectionId}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span style={{ color: "var(--text-secondary)" }}>
                    Affected Block
                  </span>
                  <span
                    className="font-semibold"
                    style={{ color: "#D9534F" }}
                  >
                    {activeBlockRequestId ?? "—"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span style={{ color: "var(--text-secondary)" }}>
                    Current Window
                  </span>
                  <span className="font-semibold mono">
                    {anchorPlan
                      ? `${anchorPlan.startTime.split(" ")[1]}–${
                          anchorPlan.endTime.split(" ")[1]
                        }`
                      : "—"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span style={{ color: "var(--text-secondary)" }}>
                    Feasible Alternative
                  </span>
                  <span
                    className="font-semibold mono"
                    style={{ color: "#166534" }}
                  >
                    {anchorFeasible
                      ? `${anchorFeasible.windowStart.split(" ")[1]}–${
                          anchorFeasible.windowEnd.split(" ")[1]
                        }`
                      : "—"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span style={{ color: "var(--text-secondary)" }}>
                    Conflict
                  </span>
                  <span className="chip chip-red" style={{ fontSize: 9 }}>
                    DETECTED
                  </span>
                </div>
              </div>

              {!reoptimized && !reoptRunning && (
                <button
                  onClick={handleReoptimize}
                  className="w-full py-2.5 rounded font-semibold text-sm"
                  style={{ background: "#6B3FA0", color: "white" }}
                >
                  RUN RE-OPTIMIZATION
                </button>
              )}

              {reoptRunning && (
                <div className="space-y-2">
                  {REOPT_STEPS.map((step, i) => (
                    <div
                      key={step}
                      className="flex items-center gap-2 text-xs"
                    >
                      {i < reoptStep ? (
                        <span
                          className="w-4 h-4 rounded-full flex items-center justify-center text-white flex-shrink-0"
                          style={{ background: "#3F8F45", fontSize: 9 }}
                        >
                          ✓
                        </span>
                      ) : i === reoptStep ? (
                        <span
                          className="pulse-dot w-4 h-4 rounded-full flex-shrink-0"
                          style={{ background: "#D97706" }}
                        />
                      ) : (
                        <span
                          className="w-4 h-4 rounded-full flex-shrink-0"
                          style={{ background: "#E2E8F0" }}
                        />
                      )}
                      <span
                        style={{
                          color:
                            i <= reoptStep
                              ? "var(--text-primary)"
                              : "var(--text-secondary)",
                        }}
                      >
                        {step}
                      </span>
                      {i < reoptStep && (
                        <span
                          className="ml-auto"
                          style={{ color: "#3F8F45", fontSize: 9 }}
                        >
                          ✓ DONE
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {reoptimized && (
                <div>
                  <div
                    className="rounded p-2 mb-2"
                    style={{ background: "#DCFCE7" }}
                  >
                    <p
                      className="text-xs font-bold mb-2"
                      style={{ color: "#166534" }}
                    >
                      UPDATED PLAN READY
                    </p>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div
                        className="rounded p-2"
                        style={{ background: "#FEE2E2" }}
                      >
                        <p
                          className="font-semibold"
                          style={{ color: "#B91C1C" }}
                        >
                          ORIGINAL
                        </p>
                        <p>
                          {anchorPlan
                            ? `${anchorPlan.startTime.split(" ")[1]}–${
                                anchorPlan.endTime.split(" ")[1]
                              }`
                            : "—"}
                        </p>
                        <p>Delay: {anchorPlan?.trainDelay ?? 0} min</p>
                        <p>Conflicts: {anchorPlan?.conflictCount ?? 0}</p>
                      </div>
                      <div
                        className="rounded p-2"
                        style={{ background: "#DCFCE7" }}
                      >
                        <p
                          className="font-semibold"
                          style={{ color: "#166534" }}
                        >
                          UPDATED
                        </p>
                        <p className="font-bold mono">
                          {anchorFeasible
                            ? `${anchorFeasible.windowStart.split(" ")[1]}–${
                                anchorFeasible.windowEnd.split(" ")[1]
                              }`
                            : "—"}
                        </p>
                        <p>Delay: 0 min</p>
                        <p>Conflicts: 0</p>
                      </div>
                    </div>
                  </div>
                  <span className="chip chip-green w-full text-center block">
                    Controller Review Pending
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Event feed */}
          <div className="card p-3 flex-1">
            <p
              className="font-semibold text-xs mb-2 uppercase tracking-wider"
              style={{ color: "var(--navy)" }}
            >
              Event Feed ({liveEvents.length})
            </p>
            <div className="space-y-2 max-h-72 overflow-y-auto">
              {liveEvents.slice(0, 20).map((ev: LiveEvent) => {
                const colors =
                  EVENT_COLOR[ev.eventType] ?? EVENT_COLOR["Train Delay"];
                return (
                  <div
                    key={ev.eventId}
                    className="flex gap-2 py-1.5 px-2 rounded"
                    style={{
                      background: ev.status === "Active" ? colors.bg : "#F8FAFC",
                      border: `1px solid ${
                        ev.status === "Active" ? colors.text + "40" : "#E2E8F0"
                      }`,
                    }}
                  >
                    <div className="flex-shrink-0">
                      <span
                        className="mono text-xs"
                        style={{
                          color: "var(--text-secondary)",
                          fontSize: 10,
                        }}
                      >
                        {ev.timestamp.split(" ")[1]}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p
                        className="text-xs font-medium"
                        style={{
                          color:
                            ev.status === "Active"
                              ? colors.text
                              : "var(--text-secondary)",
                        }}
                      >
                        {ev.eventId} · {ev.eventType}
                      </p>
                      <p
                        style={{
                          color: "var(--text-secondary)",
                          fontSize: 10,
                        }}
                      >
                        {ev.sectionId}
                        {ev.trainNo ? ` · ${ev.trainNo}` : ""}
                        {ev.assetId ? ` · ${ev.assetId}` : ""}
                      </p>
                    </div>
                    <div className="flex-shrink-0">
                      <span
                        className="chip chip-gray"
                        style={{ fontSize: 8 }}
                      >
                        {ev.status}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Audit trail (from store) */}
          {auditEvents.length > 0 && (
            <div className="card p-3">
              <p
                className="font-semibold text-xs mb-2 uppercase tracking-wider"
                style={{ color: "var(--navy)" }}
              >
                Audit Trail
              </p>
              <div className="space-y-1.5 max-h-40 overflow-y-auto">
                {auditEvents.slice(0, 8).map((ev) => (
                  <div key={ev.id} className="flex gap-2 text-xs">
                    <span
                      className="mono flex-shrink-0"
                      style={{
                        color: "var(--text-secondary)",
                        fontSize: 10,
                      }}
                    >
                      {ev.timestamp}
                    </span>
                    <div>
                      <p
                        style={{
                          color:
                            ev.type === "ALERT"
                              ? "#B45309"
                              : ev.type === "AI"
                              ? "#6B3FA0"
                              : ev.type === "APPROVAL"
                              ? "#166534"
                              : "var(--text-primary)",
                        }}
                      >
                        {ev.action}
                      </p>
                      <p
                        style={{
                          color: "var(--text-secondary)",
                          fontSize: 10,
                        }}
                      >
                        {ev.actor}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}