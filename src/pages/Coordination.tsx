// ============================================================
// Coordinated Maintenance
// Cross-department block consolidation on the anchor section
// Data sources:
//   - maintenance_tasks.csv     (tasks grouped by department)
//   - resources_crews.csv       (crew availability)
//   - optimized_block_plans.csv (existing coordinated plans)
//   - bdms_block_requests.csv   (block requests per section)
// ============================================================

import { useMemo, useState } from "react";
import { useApp } from "../store";
import {
  MAINTENANCE_TASKS,
  CREWS,
  tasksBySection,
  crewsByDepartment,
  OPTIMIZED_PLANS_BY_REQUEST,
  ANCHOR_SECTION_ID,
  ANCHOR_ASSET_ID,
} from "../data/seed";
import type { Department } from "../types";

// ---------- Compatibility matrix (fixed rule set) ----------
//
// These are stated safety/operational rules from the problem statement
// and the operational_constraints.csv. They are NOT invented.

const COMPAT_MATRIX: Record<
  Department,
  Record<Department, { status: "YES" | "CONDITIONAL" | "NO"; reason: string }>
> = {
  ENGINEERING: {
    ENGINEERING: {
      status: "YES",
      reason: "Same department — coordinated by default",
    },
    ST: {
      status: "YES",
      reason: "Compatible when same section and no safety zone conflict",
    },
    TRACTION: {
      status: "CONDITIONAL",
      reason: "Requires additional safety / OHE isolation checks",
    },
  },
  ST: {
    ENGINEERING: {
      status: "YES",
      reason: "Compatible when same section and no safety zone conflict",
    },
    ST: { status: "YES", reason: "Same department" },
    TRACTION: {
      status: "NO",
      reason:
        "Signal and OHE work cannot run concurrently on same section without specialist safety officer",
    },
  },
  TRACTION: {
    ENGINEERING: {
      status: "CONDITIONAL",
      reason: "Requires OHE isolation and Engineering safety clearance",
    },
    ST: {
      status: "NO",
      reason:
        "OHE and signal work concurrent — requires additional safety approval",
    },
    TRACTION: { status: "YES", reason: "Same department" },
  },
};

const COMPAT_CHIP: Record<string, string> = {
  YES: "chip-green",
  CONDITIONAL: "chip-orange",
  NO: "chip-red",
};

const DEPT_COLORS: Record<Department, string> = {
  ENGINEERING: "#1769AA",
  ST: "#6B3FA0",
  TRACTION: "#16827A",
};

// ---------- Main page ----------

export default function Coordination() {
  const {
    selectedSection,
    addAuditEvent,
    showToast,
    activeBlockRequestId,
  } = useApp();

  // Default working section is the anchor
  const section = selectedSection || ANCHOR_SECTION_ID;

  // Tasks on this section, grouped by department
  const sectionTasks = useMemo(() => tasksBySection(section), [section]);

  const engTasks = sectionTasks.filter((t) => t.department === "ENGINEERING");
  const stTasks = sectionTasks.filter((t) => t.department === "ST");
  const tracTasks = sectionTasks.filter((t) => t.department === "TRACTION");

  // Selection
  const [selectedTasks, setSelectedTasks] = useState<string[]>(() => {
    // Default: pick the highest-priority Eng + S&T tasks on the section
    const eng = engTasks.sort((a, b) => b.priority - a.priority)[0];
    const st = stTasks.sort((a, b) => b.priority - a.priority)[0];
    return [eng?.id, st?.id].filter(Boolean) as string[];
  });

  const toggleTask = (id: string) => {
    setSelectedTasks((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const selectedDetails = selectedTasks
    .map((id) => MAINTENANCE_TASKS.find((t) => t.id === id))
    .filter(Boolean) as typeof MAINTENANCE_TASKS;

  const departments = Array.from(
    new Set(selectedDetails.map((t) => t.department))
  );

  const compat =
    departments.length === 0
      ? { status: "YES" as const, reason: "No tasks selected" }
      : departments.length === 1
      ? { status: "YES" as const, reason: "Single department" }
      : COMPAT_MATRIX[departments[0]][departments[1]];

  const totalDuration = selectedDetails.length
    ? Math.max(...selectedDetails.map((t) => t.duration))
    : 0;

  const combinedPriority = selectedDetails.length
    ? Math.max(...selectedDetails.map((t) => t.priority))
    : 0;

  // Crews relevant to selected departments
  const relevantCrews = departments.flatMap((d) =>
    crewsByDepartment(d).slice(0, 4)
  );

  // Existing optimized plans for this section — show as reference
  const plansForRequest = activeBlockRequestId
    ? OPTIMIZED_PLANS_BY_REQUEST[activeBlockRequestId] ?? []
    : [];

  function handleCoordinate() {
    addAuditEvent({
      timestamp: new Date().toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
      }),
      action: "Coordinated block submitted",
      actor: "COORDINATION ENGINE",
      details: `Tasks: ${selectedTasks.join(
        ", "
      )} coordinated into single block for ${section}.`,
      type: "AI",
    });
    showToast(
      `Coordinated block submitted for ${section} — ${selectedTasks.length} tasks`,
      "success"
    );
  }

  return (
    <div className="flex flex-col gap-4 h-full overflow-y-auto p-4">
      {/* Header */}
      <div>
        <h1
          className="text-lg font-bold"
          style={{ color: "var(--navy)" }}
        >
          Coordinated Maintenance
        </h1>
        <p className="text-xs" style={{ color: "var(--text-secondary)" }}>
          Cross-department block consolidation · Compatibility assessment ·
          Crew coordination · Section:{" "}
          <span className="mono font-semibold">{section}</span>
        </p>
      </div>

      {/* Compatibility matrix */}
      <div className="card p-4">
        <p
          className="font-semibold text-sm mb-3"
          style={{ color: "var(--navy)" }}
        >
          Department Compatibility Matrix
        </p>
        <div
          className="grid"
          style={{ gridTemplateColumns: "100px 1fr 1fr 1fr" }}
        >
          <div />
          {(["ENGINEERING", "ST", "TRACTION"] as Department[]).map((d) => (
            <div key={d} className="text-center p-2">
              <p
                className="text-xs font-bold"
                style={{ color: "var(--navy)" }}
              >
                {d === "ST" ? "S&T" : d}
              </p>
            </div>
          ))}
          {(["ENGINEERING", "ST", "TRACTION"] as Department[]).map((row) => (
            <div key={row} className="contents">
              <div className="flex items-center">
                <p
                  className="text-xs font-bold"
                  style={{ color: "var(--navy)" }}
                >
                  {row === "ST" ? "S&T" : row}
                </p>
              </div>
              {(["ENGINEERING", "ST", "TRACTION"] as Department[]).map(
                (col) => {
                  const c = COMPAT_MATRIX[row][col];
                  return (
                    <div key={col} className="p-2 text-center">
                      <span className={`chip ${COMPAT_CHIP[c.status]}`}>
                        {c.status === "YES"
                          ? "✓ Compatible"
                          : c.status === "CONDITIONAL"
                          ? "△ Conditional"
                          : "✕ Not Feasible"}
                      </span>
                      <p
                        style={{
                          color: "var(--text-secondary)",
                          fontSize: 9,
                          marginTop: 2,
                        }}
                      >
                        {c.reason.slice(0, 40)}…
                      </p>
                    </div>
                  );
                }
              )}
            </div>
          ))}
        </div>
      </div>

      <div
        className="grid gap-4"
        style={{ gridTemplateColumns: "1fr 1fr" }}
      >
        {/* Left: Available tasks */}
        <div className="card p-4">
          <p
            className="font-semibold text-sm mb-3"
            style={{ color: "var(--navy)" }}
          >
            Section {section} — Available Tasks ({sectionTasks.length})
          </p>
          <p
            className="text-xs mb-3"
            style={{ color: "var(--text-secondary)" }}
          >
            Select tasks to coordinate into a single block
          </p>

          {sectionTasks.length === 0 ? (
            <p
              className="text-xs"
              style={{ color: "var(--text-secondary)" }}
            >
              No maintenance tasks registered on this section.
            </p>
          ) : (
            (["ENGINEERING", "ST", "TRACTION"] as Department[]).map((dept) => {
              const deptTasks = sectionTasks.filter(
                (t) => t.department === dept
              );
              if (deptTasks.length === 0) return null;
              const deptColor = DEPT_COLORS[dept];
              return (
                <div key={dept} className="mb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div
                      className="w-2 h-4 rounded-sm"
                      style={{ background: deptColor }}
                    />
                    <p
                      className="text-xs font-bold"
                      style={{ color: deptColor }}
                    >
                      {dept === "ST" ? "S&T" : dept} ({deptTasks.length})
                    </p>
                  </div>
                  <div className="space-y-1.5">
                    {deptTasks.slice(0, 8).map((task) => {
                      const sel = selectedTasks.includes(task.id);
                      return (
                        <div
                          key={task.id}
                          className="flex items-center gap-2 p-2 rounded cursor-pointer transition-all"
                          style={{
                            background: sel ? `${deptColor}15` : "#F8FAFC",
                            border: `1px solid ${
                              sel ? deptColor : "var(--border)"
                            }`,
                          }}
                          onClick={() => toggleTask(task.id)}
                        >
                          <div
                            className="w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0"
                            style={{
                              borderColor: deptColor,
                              background: sel ? deptColor : "transparent",
                            }}
                          >
                            {sel && (
                              <span className="text-white text-xs">✓</span>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-semibold">
                              {task.id} · {task.assetId}
                            </p>
                            <p
                              style={{
                                color: "var(--text-secondary)",
                                fontSize: 9,
                              }}
                            >
                              {task.workType.slice(0, 34)} · {task.duration} min
                            </p>
                          </div>
                          {task.status === "OVERDUE" && (
                            <span
                              className="chip chip-red"
                              style={{ fontSize: 8 }}
                            >
                              OVR
                            </span>
                          )}
                          <span
                            className="font-bold text-xs"
                            style={{
                              color:
                                task.priority >= 80
                                  ? "#D9534F"
                                  : "#D97706",
                            }}
                          >
                            P{task.priority}
                          </span>
                        </div>
                      );
                    })}
                    {deptTasks.length > 8 && (
                      <p
                        style={{
                          color: "var(--text-secondary)",
                          fontSize: 10,
                        }}
                      >
                        +{deptTasks.length - 8} more
                      </p>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Right: Assessment + result */}
        <div className="flex flex-col gap-3">
          {/* Selected tasks */}
          <div className="card p-4">
            <p
              className="font-semibold text-sm mb-3"
              style={{ color: "var(--navy)" }}
            >
              Selected Tasks ({selectedDetails.length})
            </p>
            {selectedDetails.length === 0 ? (
              <p
                className="text-xs"
                style={{ color: "var(--text-secondary)" }}
              >
                Select tasks from the left panel to coordinate.
              </p>
            ) : (
              <div className="space-y-2">
                {selectedDetails.map((task) => {
                  const deptColor = DEPT_COLORS[task.department];
                  return (
                    <div
                      key={task.id}
                      className="flex items-center gap-2 p-2 rounded"
                      style={{ background: `${deptColor}12` }}
                    >
                      <div
                        className="w-1 h-8 rounded-full flex-shrink-0"
                        style={{ background: deptColor }}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold">
                          {task.id} · {task.assetId}
                        </p>
                        <p className="text-xs" style={{ color: deptColor }}>
                          {task.department === "ST"
                            ? "S&T"
                            : task.department}
                        </p>
                        <p
                          style={{
                            color: "var(--text-secondary)",
                            fontSize: 9,
                          }}
                        >
                          {task.duration} min · {task.workType.slice(0, 30)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p
                          className="font-bold text-sm"
                          style={{ color: deptColor }}
                        >
                          {task.priority}
                        </p>
                        <p
                          style={{
                            color: "var(--text-secondary)",
                            fontSize: 9,
                          }}
                        >
                          priority
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Compatibility result */}
          {selectedDetails.length >= 2 && (
            <div className="card p-4 slide-in">
              <p
                className="font-semibold text-sm mb-3"
                style={{ color: "var(--navy)" }}
              >
                Coordination Assessment
              </p>

              <div className="flex items-center gap-2 mb-3">
                <span
                  className={`chip ${
                    COMPAT_CHIP[compat?.status || "NO"]
                  }`}
                >
                  {compat?.status === "YES"
                    ? "✓ COMPATIBLE"
                    : compat?.status === "CONDITIONAL"
                    ? "△ CONDITIONAL"
                    : "✕ NOT FEASIBLE"}
                </span>
                <p
                  className="text-xs"
                  style={{ color: "var(--text-secondary)" }}
                >
                  {compat?.reason}
                </p>
              </div>

              {compat?.status !== "NO" && (
                <>
                  <div className="grid grid-cols-2 gap-2 mb-3">
                    <div
                      className="rounded p-2"
                      style={{ background: "#F8FAFC" }}
                    >
                      <p
                        style={{
                          color: "var(--text-secondary)",
                          fontSize: 10,
                        }}
                      >
                        Combined Duration
                      </p>
                      <p className="font-bold">{totalDuration} min</p>
                    </div>
                    <div
                      className="rounded p-2"
                      style={{ background: "#F8FAFC" }}
                    >
                      <p
                        style={{
                          color: "var(--text-secondary)",
                          fontSize: 10,
                        }}
                      >
                        Departments
                      </p>
                      <p className="font-bold">{departments.length}</p>
                    </div>
                    <div
                      className="rounded p-2"
                      style={{ background: "#F8FAFC" }}
                    >
                      <p
                        style={{
                          color: "var(--text-secondary)",
                          fontSize: 10,
                        }}
                      >
                        Tasks
                      </p>
                      <p className="font-bold">{selectedDetails.length}</p>
                    </div>
                    <div
                      className="rounded p-2"
                      style={{ background: "#F8FAFC" }}
                    >
                      <p
                        style={{
                          color: "var(--text-secondary)",
                          fontSize: 10,
                        }}
                      >
                        Max Priority
                      </p>
                      <p
                        className="font-bold"
                        style={{ color: "#D9534F" }}
                      >
                        {combinedPriority}
                      </p>
                    </div>
                  </div>

                  <div
                    className="rounded-md p-3 mb-3"
                    style={{ background: "#EDE9FE" }}
                  >
                    <p
                      className="font-bold text-xs mb-1"
                      style={{ color: "#5B21B6" }}
                    >
                      RECOMMENDED COORDINATED BLOCK
                    </p>
                    <p className="text-xs" style={{ color: "#6B3FA0" }}>
                      {departments
                        .map((d) => (d === "ST" ? "S&T" : d))
                        .join(" + ")}{" "}
                      · {section}
                    </p>
                    <p className="text-xs" style={{ color: "#5B21B6" }}>
                      {selectedDetails.length} activities consolidated into 1
                      block
                    </p>
                  </div>

                  <button
                    onClick={handleCoordinate}
                    className="w-full py-2.5 rounded font-semibold text-sm"
                    style={{ background: "#6B3FA0", color: "white" }}
                  >
                    SUBMIT COORDINATED BLOCK
                  </button>
                </>
              )}

              {compat?.status === "NO" && (
                <div
                  className="rounded p-2"
                  style={{ background: "#FEE2E2" }}
                >
                  <p className="text-xs" style={{ color: "#B91C1C" }}>
                    These departments cannot be coordinated in the same block
                    on {section} without specialist safety officer and
                    additional approvals. Consider separate blocks.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Crew availability */}
          <div className="card p-4">
            <p
              className="font-semibold text-xs mb-2 uppercase tracking-wider"
              style={{ color: "var(--navy)" }}
            >
              Crew Availability ({relevantCrews.length})
            </p>
            {relevantCrews.length === 0 ? (
              <p
                className="text-xs"
                style={{ color: "var(--text-secondary)" }}
              >
                No crews for selected departments.
              </p>
            ) : (
              <div className="space-y-1.5">
                {relevantCrews.map((crew) => (
                  <div
                    key={crew.id}
                    className="flex items-center gap-2 text-xs"
                  >
                    <div
                      className="w-2 h-2 rounded-full"
                      style={{
                        background:
                          crew.status === "AVAILABLE"
                            ? "#3F8F45"
                            : crew.status === "BUSY"
                            ? "#D97706"
                            : "#D9534F",
                      }}
                    />
                    <span className="font-mono">{crew.id}</span>
                    <span style={{ color: "var(--text-secondary)" }}>
                      {crew.department === "ST" ? "S&T" : crew.department}
                    </span>
                    <span
                      className="ml-auto"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      {crew.availableFrom}–{crew.availableUntil}
                    </span>
                    <span
                      className={`chip chip-${
                        crew.status === "AVAILABLE"
                          ? "green"
                          : crew.status === "BUSY"
                          ? "orange"
                          : "gray"
                      }`}
                      style={{ fontSize: 8 }}
                    >
                      {crew.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Existing optimized plans on this section */}
          {plansForRequest.length > 0 && (
            <div className="card p-4">
              <p
                className="font-semibold text-xs mb-2 uppercase tracking-wider"
                style={{ color: "var(--navy)" }}
              >
                Existing Optimized Plans ({plansForRequest.length})
              </p>
              <div className="space-y-1.5">
                {plansForRequest.map((p) => (
                  <div
                    key={p.planId}
                    className="rounded p-2 text-xs"
                    style={{
                      background: "#F5F3FF",
                      border: "1px solid #DDD6FE",
                    }}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span
                        className="font-bold mono"
                        style={{ color: "#5B21B6" }}
                      >
                        {p.planId}
                      </span>
                      <span
                        className="chip chip-purple"
                        style={{ fontSize: 8 }}
                      >
                        {p.priority}
                      </span>
                    </div>
                    <p style={{ color: "#6B3FA0" }}>
                      {p.assetId} ·{" "}
                      {p.department === "ST" ? "S&T" : p.department}
                    </p>
                    <p style={{ color: "var(--text-secondary)" }}>
                      {p.startTime.split(" ")[1]}–{p.endTime.split(" ")[1]} ·{" "}
                      {p.duration} min
                    </p>
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