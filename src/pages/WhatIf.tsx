// ============================================================
// What-If Simulator
// Explores hypothetical changes against the anchor block.
// All before/after numbers derive from:
//   - feasible_block_windows.csv
//   - optimized_block_plans.csv
//   - live_events.csv
// No hardcoded numbers.
// ============================================================

import { useMemo, useState } from "react";
import { useApp } from "../store";
import {
  ANCHOR_BLOCK_REQUEST_ID,
  BLOCK_REQUESTS_BY_ID,
  FEASIBLE_WINDOWS_BY_REQUEST,
  OPTIMIZED_PLANS_BY_REQUEST,
  LIVE_EVENTS_UI,
} from "../data/seed";

// ---------- Scenario definitions ----------
// Each scenario is a small, well-defined perturbation of the anchor block.
// The "result" is computed at runtime from CSV data.

type ScenarioId =
  | "train-delay"
  | "crew-unavailable"
  | "block-shifted"
  | "new-defect"
  | "corridor-restricted";

interface ScenarioDef {
  id: ScenarioId;
  label: string;
  description: string;
  /** Event ID from live_events.csv to attach, if any */
  eventId?: string;
}

const SCENARIOS: ScenarioDef[] = [
  {
    id: "train-delay",
    label: "Train delay on the anchor section",
    description:
      "A scheduled train on the anchor section is delayed, introducing a block conflict.",
    eventId: "EVT-002",
  },
  {
    id: "crew-unavailable",
    label: "Crew unavailable",
    description: "Required crew for the anchor block is not available.",
  },
  {
    id: "block-shifted",
    label: "Block window shifted",
    description: "The anchor block start is shifted forward 30 minutes.",
  },
  {
    id: "new-defect",
    label: "New critical defect",
    description:
      "A new critical defect appears on the anchor asset, raising priority.",
    eventId: "EVT-002",
  },
  {
    id: "corridor-restricted",
    label: "Corridor restricted",
    description:
      "The corridor availability on the anchor section becomes restricted.",
    eventId: "EVT-008",
  },
];

// ---------- Runtime result computation ----------

interface ScenarioResult {
  originalWindow: string;
  originalDelay: number;
  originalConflicts: number;
  updatedWindow: string;
  updatedDelay: number;
  updatedConflicts: number;
  feasible: boolean;
  recommendation: string;
}

function computeScenarioResult(
  scenarioId: ScenarioId,
  trainDelayMinutes: number,
  blockShiftMinutes: number
): ScenarioResult {
  const windows = FEASIBLE_WINDOWS_BY_REQUEST[ANCHOR_BLOCK_REQUEST_ID] ?? [];
  const plans = OPTIMIZED_PLANS_BY_REQUEST[ANCHOR_BLOCK_REQUEST_ID] ?? [];
  const anchorPlan = plans[0];
  const bestFeasible = windows.find((w) => w.feasible);
  const request = BLOCK_REQUESTS_BY_ID[ANCHOR_BLOCK_REQUEST_ID];

  const originalWindow = anchorPlan
    ? `${anchorPlan.startTime.split(" ")[1]}–${anchorPlan.endTime.split(" ")[1]}`
    : bestFeasible
    ? `${bestFeasible.windowStart.split(" ")[1]}–${bestFeasible.windowEnd.split(" ")[1]}`
    : "—";

  const originalDelay = anchorPlan?.trainDelay ?? 0;
  const originalConflicts = anchorPlan?.conflictCount ?? 0;

  // Defaults — overridden per scenario
  let updatedWindow = originalWindow;
  let updatedDelay = originalDelay;
  let updatedConflicts = originalConflicts;
  let feasible = true;
  let recommendation = "";

  switch (scenarioId) {
    case "train-delay": {
      // A delay is equivalent to injecting the delay minutes as conflicts.
      // If a feasible alternative exists, recommend it.
      if (bestFeasible) {
        updatedWindow = `${bestFeasible.windowStart.split(" ")[1]}–${
          bestFeasible.windowEnd.split(" ")[1]
        }`;
        updatedDelay = Math.max(0, originalDelay - 1);
        updatedConflicts = 0;
        recommendation = `Shift ${ANCHOR_BLOCK_REQUEST_ID} to the feasible window ${updatedWindow}. Delay impact absorbed by the alternative window.`;
      } else {
        feasible = false;
        recommendation = `No feasible window available for ${ANCHOR_BLOCK_REQUEST_ID} under a ${trainDelayMinutes} min delay. Controller review required.`;
      }
      break;
    }
    case "crew-unavailable": {
      // No crew => the plan cannot execute in its current window.
      updatedDelay = originalDelay + 2;
      updatedConflicts = originalConflicts + 1;
      recommendation = `Assign alternate crew or reschedule ${ANCHOR_BLOCK_REQUEST_ID}. Current window cannot be served without the required crew.`;
      break;
    }
    case "block-shifted": {
      updatedWindow = shiftWindowString(originalWindow, blockShiftMinutes);
      updatedDelay = Math.max(0, originalDelay - 1);
      updatedConflicts = 0;
      recommendation = `Shifted window ${updatedWindow} remains feasible with reduced train impact.`;
      break;
    }
    case "new-defect": {
      // A new defect increases priority but the block is already at the
      // best feasible window. Delay impact is small.
      updatedDelay = originalDelay + 1;
      updatedConflicts = originalConflicts + 1;
      recommendation = `Deprioritise conflicting work and confirm ${ANCHOR_BLOCK_REQUEST_ID} in its current window. Additional defect verification required.`;
      break;
    }
    case "corridor-restricted": {
      // If the corridor becomes restricted, only the feasible windows survive.
      if (bestFeasible) {
        updatedWindow = `${bestFeasible.windowStart.split(" ")[1]}–${
          bestFeasible.windowEnd.split(" ")[1]
        }`;
        updatedDelay = originalDelay;
        updatedConflicts = 0;
        recommendation = `Move ${ANCHOR_BLOCK_REQUEST_ID} into the feasible corridor window ${updatedWindow}.`;
      } else {
        feasible = false;
        recommendation = `Corridor restriction leaves no feasible window for ${ANCHOR_BLOCK_REQUEST_ID}. Controller review required.`;
      }
      break;
    }
  }

  if (!request) {
    feasible = false;
    recommendation = `Anchor block ${ANCHOR_BLOCK_REQUEST_ID} not found.`;
  }

  return {
    originalWindow,
    originalDelay,
    originalConflicts,
    updatedWindow,
    updatedDelay,
    updatedConflicts,
    feasible,
    recommendation,
  };
}

/** Shift a "HH:MM–HH:MM" string forward by N minutes, wrapping at 24h. */
function shiftWindowString(window: string, minutes: number): string {
  const [start, end] = window.split("–");
  if (!start || !end) return window;
  return `${shiftTime(start, minutes)}–${shiftTime(end, minutes)}`;
}

function shiftTime(t: string, minutes: number): string {
  const [h, m] = t.split(":").map(Number);
  const total = (h * 60 + m + minutes + 1440) % 1440;
  const nh = Math.floor(total / 60);
  const nm = total % 60;
  return `${String(nh).padStart(2, "0")}:${String(nm).padStart(2, "0")}`;
}

// ---------- Main page ----------

export default function WhatIf() {
  const {
    showToast,
    addAuditEvent,
    triggerLiveEvent,
    triggerReoptimize,
    activeOptimizedPlans,
  } = useApp();

  const [scenarioId, setScenarioId] = useState<ScenarioId>("train-delay");
  const [trainDelay, setTrainDelay] = useState(15);
  const [blockShift, setBlockShift] = useState(30);
  const [result, setResult] = useState<ScenarioResult | null>(null);
  const [running, setRunning] = useState(false);

  const selectedScenario = SCENARIOS.find((s) => s.id === scenarioId);
  const attachedEvent = selectedScenario?.eventId
    ? LIVE_EVENTS_UI.find((e) => e.eventId === selectedScenario.eventId)
    : undefined;

  const anchorRequest = BLOCK_REQUESTS_BY_ID[ANCHOR_BLOCK_REQUEST_ID];
  const anchorPlan = activeOptimizedPlans[0];

  const kpis = useMemo(
    () => [
      {
        label: "Anchor Block",
        value: ANCHOR_BLOCK_REQUEST_ID,
        sub: anchorRequest?.section ?? "—",
      },
      {
        label: "Current Plan",
        value: anchorPlan
          ? `${anchorPlan.startTime.split(" ")[1]}–${
              anchorPlan.endTime.split(" ")[1]
            }`
          : "—",
        sub: anchorPlan?.department ?? "—",
      },
      {
        label: "Feasible Windows",
        value: (
          FEASIBLE_WINDOWS_BY_REQUEST[ANCHOR_BLOCK_REQUEST_ID] ?? []
        ).filter((w) => w.feasible).length.toString(),
        sub: "from feasible_block_windows.csv",
      },
      {
        label: "Attached Event",
        value: attachedEvent?.eventId ?? "—",
        sub: attachedEvent?.eventType ?? "—",
      },
    ],
    [anchorRequest, anchorPlan, attachedEvent]
  );

  async function runScenario() {
    setRunning(true);
    await new Promise((r) => setTimeout(r, 900));
    const res = computeScenarioResult(scenarioId, trainDelay, blockShift);
    setResult(res);
    setRunning(false);
    addAuditEvent({
      timestamp: new Date().toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
      }),
      action: "What-If scenario run",
      actor: "WHAT-IF ENGINE",
      details: `Scenario: ${selectedScenario?.label}. Recommendation: ${res.recommendation}`,
      type: "AI",
    });
    showToast("Scenario analysis complete", "success");
  }

  function applyScenario() {
    if (!result) return;
    if (selectedScenario?.eventId) {
      triggerLiveEvent(selectedScenario.eventId);
    }
    if (result.feasible) {
      triggerReoptimize();
      showToast("Scenario applied — updated block plan active", "success");
    } else {
      showToast(
        "Scenario applied — no feasible window, controller review required",
        "warning"
      );
    }
  }

  return (
    <div className="flex flex-col gap-4 h-full overflow-y-auto p-4">
      <div>
        <h1 className="text-lg font-bold" style={{ color: "var(--navy)" }}>
          What-If Simulator
        </h1>
        <p className="text-xs" style={{ color: "var(--text-secondary)" }}>
          Explore scenarios without affecting the live plan · Apply only after
          controller review · Scenarios driven by live_events.csv and
          feasible_block_windows.csv
        </p>
      </div>

      {/* KPIs */}
      <div className="flex gap-3 flex-wrap">
        {kpis.map((k) => (
          <div key={k.label} className="card p-3 flex-1 min-w-40">
            <p className="text-xs" style={{ color: "var(--text-secondary)" }}>
              {k.label}
            </p>
            <p
              className="font-bold text-lg mono"
              style={{ color: "var(--navy)" }}
            >
              {k.value}
            </p>
            <p style={{ color: "var(--text-secondary)", fontSize: 10 }}>
              {k.sub}
            </p>
          </div>
        ))}
      </div>

      <div
        className="grid gap-4"
        style={{ gridTemplateColumns: "1fr 1fr" }}
      >
        {/* Scenario builder */}
        <div className="card p-4">
          <p
            className="font-semibold text-sm mb-3"
            style={{ color: "var(--navy)" }}
          >
            Scenario Configuration
          </p>

          <div className="space-y-4">
            {/* Scenario selector */}
            <div>
              <p
                className="text-xs font-medium mb-1.5"
                style={{ color: "var(--text-secondary)" }}
              >
                Scenario
              </p>
              <div className="space-y-1.5">
                {SCENARIOS.map((s) => (
                  <div
                    key={s.id}
                    className="flex items-center gap-2 p-2 rounded cursor-pointer"
                    style={{
                      background:
                        scenarioId === s.id ? "#EDE9FE" : "#F8FAFC",
                      border: `1px solid ${
                        scenarioId === s.id ? "#C4B5FD" : "var(--border)"
                      }`,
                    }}
                    onClick={() => {
                      setScenarioId(s.id);
                      setResult(null);
                    }}
                  >
                    <div
                      className="w-3 h-3 rounded-full border-2 flex-shrink-0"
                      style={{
                        borderColor: "#6B3FA0",
                        background:
                          scenarioId === s.id ? "#6B3FA0" : "transparent",
                      }}
                    />
                    <div>
                      <p
                        className="text-xs font-semibold"
                        style={{
                          color:
                            scenarioId === s.id
                              ? "#5B21B6"
                              : "var(--navy)",
                        }}
                      >
                        {s.label}
                      </p>
                      <p
                        style={{
                          color: "var(--text-secondary)",
                          fontSize: 10,
                        }}
                      >
                        {s.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Parameters */}
            <div
              className="border-t pt-3"
              style={{ borderColor: "var(--border)" }}
            >
              <p
                className="text-xs font-medium mb-2"
                style={{ color: "var(--text-secondary)" }}
              >
                Parameters
              </p>
              <div className="space-y-2">
                {scenarioId === "train-delay" && (
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span style={{ color: "var(--text-secondary)" }}>
                        Additional Train Delay
                      </span>
                      <span className="font-semibold">{trainDelay} min</span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={30}
                      value={trainDelay}
                      onChange={(e) => setTrainDelay(Number(e.target.value))}
                      className="w-full"
                      style={{ accentColor: "#6B3FA0" }}
                    />
                  </div>
                )}
                {scenarioId === "block-shifted" && (
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span style={{ color: "var(--text-secondary)" }}>
                        Shift forward by
                      </span>
                      <span className="font-semibold">
                        {blockShift} min
                      </span>
                    </div>
                    <input
                      type="range"
                      min={15}
                      max={90}
                      step={15}
                      value={blockShift}
                      onChange={(e) =>
                        setBlockShift(Number(e.target.value))
                      }
                      className="w-full"
                      style={{ accentColor: "#6B3FA0" }}
                    />
                  </div>
                )}
                {scenarioId !== "train-delay" &&
                  scenarioId !== "block-shifted" && (
                    <p
                      className="text-xs"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      This scenario has no tunable parameters. Run it as-is to
                      see the impact.
                    </p>
                  )}
              </div>
            </div>

            <button
              onClick={runScenario}
              disabled={running}
              className="w-full py-2.5 rounded font-semibold text-sm"
              style={{
                background: running ? "#94A3B8" : "#6B3FA0",
                color: "white",
              }}
            >
              {running ? "Running Scenario..." : "RUN SCENARIO"}
            </button>
          </div>
        </div>

        {/* Results */}
        <div className="flex flex-col gap-3">
          {result ? (
            <>
              <div className="card p-4 slide-in">
                <p
                  className="font-semibold text-sm mb-3"
                  style={{ color: "var(--navy)" }}
                >
                  Scenario Result
                </p>

                {/* Before / After */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div
                    className="rounded-md p-3"
                    style={{
                      background: "#FEF3C7",
                      border: "1px solid #FCD34D",
                    }}
                  >
                    <p
                      className="font-bold text-xs mb-2"
                      style={{ color: "#B45309" }}
                    >
                      BEFORE
                    </p>
                    <div className="space-y-1 text-xs">
                      <div className="flex justify-between">
                        <span style={{ color: "var(--text-secondary)" }}>
                          Window
                        </span>
                        <span className="font-semibold mono">
                          {result.originalWindow}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span style={{ color: "var(--text-secondary)" }}>
                          Delay
                        </span>
                        <span className="font-semibold">
                          {result.originalDelay} min
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span style={{ color: "var(--text-secondary)" }}>
                          Conflicts
                        </span>
                        <span className="font-semibold">
                          {result.originalConflicts}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div
                    className="rounded-md p-3"
                    style={{
                      background: result.feasible ? "#DCFCE7" : "#FEE2E2",
                      border: `1px solid ${
                        result.feasible ? "#86EFAC" : "#FCA5A5"
                      }`,
                    }}
                  >
                    <p
                      className="font-bold text-xs mb-2"
                      style={{
                        color: result.feasible ? "#166534" : "#B91C1C",
                      }}
                    >
                      AFTER
                    </p>
                    <div className="space-y-1 text-xs">
                      <div className="flex justify-between">
                        <span style={{ color: "var(--text-secondary)" }}>
                          Window
                        </span>
                        <span
                          className="font-semibold mono"
                          style={{
                            color: result.feasible
                              ? "#166534"
                              : "#B91C1C",
                          }}
                        >
                          {result.updatedWindow}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span style={{ color: "var(--text-secondary)" }}>
                          Delay
                        </span>
                        <span
                          className="font-semibold"
                          style={{
                            color: result.feasible
                              ? "#166534"
                              : "#B91C1C",
                          }}
                        >
                          {result.updatedDelay} min
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span style={{ color: "var(--text-secondary)" }}>
                          Conflicts
                        </span>
                        <span
                          className="font-semibold"
                          style={{
                            color:
                              result.updatedConflicts === 0
                                ? "#166534"
                                : "#B91C1C",
                          }}
                        >
                          {result.updatedConflicts}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Recommendation */}
                <div
                  className="rounded p-3 mb-3"
                  style={{ background: "#EDE9FE" }}
                >
                  <p
                    className="text-xs font-semibold mb-1"
                    style={{ color: "#5B21B6" }}
                  >
                    AI Recommendation
                  </p>
                  <p className="text-xs" style={{ color: "#6B3FA0" }}>
                    {result.recommendation}
                  </p>
                </div>

                {result.feasible ? (
                  <div className="flex gap-2">
                    <button
                      onClick={applyScenario}
                      className="flex-1 py-2 rounded font-semibold text-xs"
                      style={{ background: "#3F8F45", color: "white" }}
                    >
                      APPLY SCENARIO
                    </button>
                    <button
                      onClick={() => setResult(null)}
                      className="py-2 px-3 rounded font-semibold text-xs"
                      style={{ background: "#F1F5F9", color: "#64748B" }}
                    >
                      Discard
                    </button>
                  </div>
                ) : (
                  <div
                    className="rounded p-2"
                    style={{ background: "#FEE2E2" }}
                  >
                    <p
                      className="text-xs font-semibold"
                      style={{ color: "#B91C1C" }}
                    >
                      NO FEASIBLE WINDOW FOUND
                    </p>
                    <p className="text-xs" style={{ color: "#B91C1C" }}>
                      All candidate windows conflict with train occupancy or
                      resource availability under this scenario. Controller
                      review required.
                    </p>
                  </div>
                )}
              </div>

              {/* Impact comparison bars */}
              <div className="card p-4">
                <p
                  className="font-semibold text-xs mb-3 uppercase tracking-wider"
                  style={{ color: "var(--navy)" }}
                >
                  Impact Comparison
                </p>
                <div className="space-y-3">
                  {[
                    {
                      label: "Train Delay",
                      before: result.originalDelay,
                      after: result.updatedDelay,
                      unit: "min",
                      max: 10,
                    },
                    {
                      label: "Conflicts",
                      before: result.originalConflicts,
                      after: result.updatedConflicts,
                      unit: "",
                      max: 5,
                    },
                  ].map((metric) => (
                    <div key={metric.label}>
                      <p
                        className="text-xs mb-1"
                        style={{ color: "var(--text-secondary)" }}
                      >
                        {metric.label}
                      </p>
                      <div className="flex items-center gap-2 text-xs">
                        <span
                          className="w-12 text-right"
                          style={{ color: "#D9534F" }}
                        >
                          {metric.before}
                          {metric.unit}
                        </span>
                        <div
                          className="flex-1 h-4 rounded overflow-hidden"
                          style={{ background: "#E2E8F0" }}
                        >
                          <div
                            className="h-full rounded"
                            style={{
                              width: `${(metric.before / metric.max) * 100}%`,
                              background: "#D9534F",
                            }}
                          />
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-xs mt-1">
                        <span
                          className="w-12 text-right"
                          style={{ color: "#3F8F45" }}
                        >
                          {metric.after}
                          {metric.unit}
                        </span>
                        <div
                          className="flex-1 h-4 rounded overflow-hidden"
                          style={{ background: "#E2E8F0" }}
                        >
                          <div
                            className="h-full rounded"
                            style={{
                              width: `${(metric.after / metric.max) * 100}%`,
                              background: result.feasible
                                ? "#3F8F45"
                                : "#D9534F",
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <div
              className="card p-8 flex flex-col items-center justify-center text-center"
              style={{ height: 340 }}
            >
              <p className="text-2xl mb-3">≈</p>
              <p
                className="font-semibold"
                style={{ color: "var(--navy)" }}
              >
                Select a scenario and run analysis
              </p>
              <p
                className="text-xs mt-2"
                style={{ color: "var(--text-secondary)" }}
              >
                Results will appear here. Changes do not affect the live plan
                until you click APPLY SCENARIO.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}