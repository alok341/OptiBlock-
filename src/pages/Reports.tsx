// ============================================================
// Reports & Analytics
// KPIs + charts + historical execution table
// All numbers derived from historical_block_plans.csv (80 rows)
// ============================================================

import { useMemo, useState } from "react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  HISTORICAL_PLANS,
  historyKpis,
  cancelledPlans,
  SECTIONS,
} from "../data/seed";

type Period = "WEEKLY" | "MONTHLY";

// ---------- Derivation helpers ----------

/** Group history rows by section, returning avg completion + delay. */
function groupBySection() {
  const map: Record<
    string,
    { section: string; count: number; completion: number; delay: number; conflict: number }
  > = {};
  for (const p of HISTORICAL_PLANS) {
    if (!map[p.sectionId]) {
      map[p.sectionId] = {
        section: p.sectionId,
        count: 0,
        completion: 0,
        delay: 0,
        conflict: 0,
      };
    }
    const m = map[p.sectionId];
    m.count += 1;
    m.completion += p.completionPct;
    m.delay += p.trainDelayMin;
    m.conflict += p.conflictCount;
  }
  return Object.values(map).map((m) => ({
    label: m.section,
    section: m.section,
    plans: m.count,
    completion: Math.round(m.completion / m.count),
    delay: Math.round((m.delay / m.count) * 10) / 10,
    conflicts: Math.round((m.conflict / m.count) * 10) / 10,
  }));
}

/** Group history rows into weekly buckets by ISO-ish plan_date. */
function groupByWeek() {
  // historical_block_plans.csv spans Aug 2026 and Sep 2026.
  // We bucket into 4 weeks: Aug W1-W4 and Sep W1-W2.
  const bucketLabel = (date: string) => {
    const [, month, day] = date.split("-").map(Number);
    const week = Math.floor((day - 1) / 7) + 1;
    return `${month === 8 ? "Aug" : "Sep"} W${week}`;
  };
  const map: Record<
    string,
    { label: string; plans: number; completion: number; delay: number; conflicts: number }
  > = {};
  for (const p of HISTORICAL_PLANS) {
    const label = bucketLabel(p.planDate);
    if (!map[label]) {
      map[label] = {
        label,
        plans: 0,
        completion: 0,
        delay: 0,
        conflicts: 0,
      };
    }
    const m = map[label];
    m.plans += 1;
    m.completion += p.completionPct;
    m.delay += p.trainDelayMin;
    m.conflicts += p.conflictCount;
  }
  return Object.values(map).map((m) => ({
    label: m.label,
    plans: m.plans,
    completion: Math.round(m.completion / m.plans),
    delay: Math.round((m.delay / m.plans) * 10) / 10,
    conflicts: Math.round((m.conflicts / m.plans) * 10) / 10,
  }));
}

/** Group history rows by execution status. */
function groupByStatus() {
  const statuses: Record<string, number> = {};
  for (const p of HISTORICAL_PLANS) {
    statuses[p.executionStatus] = (statuses[p.executionStatus] ?? 0) + 1;
  }
  return statuses;
}

/** Recent 12 executed plans for the table. */
function recentPlans(limit = 12) {
  return [...HISTORICAL_PLANS]
    .sort((a, b) => (a.planDate < b.planDate ? 1 : -1))
    .slice(0, limit);
}

// ---------- Main page ----------

export default function Reports() {
  const [period, setPeriod] = useState<Period>("WEEKLY");

  const kpis = useMemo(() => historyKpis(), []);
  const bySection = useMemo(groupBySection, []);
  const byWeek = useMemo(groupByWeek, []);
  const byStatus = useMemo(groupByStatus, []);
  const recent = useMemo(() => recentPlans(12), []);

  const completionRate = kpis.avgCompletionPct;
  const cancelRate = Math.round(
    (kpis.cancelled / Math.max(1, kpis.totalPlans)) * 100
  );
  const successRate = Math.round(
    (kpis.completed / Math.max(1, kpis.totalPlans)) * 100
  );

  const chartData = period === "WEEKLY" ? byWeek : bySection;
  const xKey = period === "WEEKLY" ? "label" : "section";

  return (
    <div className="flex flex-col gap-4 h-full overflow-y-auto p-4">
      <div className="flex items-center justify-between">
        <div>
          <h1
            className="text-lg font-bold"
            style={{ color: "var(--navy)" }}
          >
            Reports & Analytics
          </h1>
          <p className="text-xs" style={{ color: "var(--text-secondary)" }}>
            Derived from historical_block_plans.csv ·{" "}
            {kpis.totalPlans} past plans across {SECTIONS.length} sections
          </p>
        </div>
        <div className="flex gap-1">
          {(["WEEKLY", "MONTHLY"] as Period[]).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className="px-3 py-1.5 rounded text-xs font-semibold"
              style={{
                background: period === p ? "var(--navy)" : "#F1F5F9",
                color:
                  period === p ? "white" : "var(--text-secondary)",
              }}
            >
              {p === "WEEKLY" ? "By Week" : "By Section"}
            </button>
          ))}
        </div>
      </div>

      {/* KPI strip */}
      <div
        className="grid gap-3"
        style={{ gridTemplateColumns: "repeat(6, 1fr)" }}
      >
        {[
          {
            label: "Total Plans",
            value: kpis.totalPlans.toString(),
            sub: "historical",
            color: "#1769AA",
          },
          {
            label: "Completed",
            value: kpis.completed.toString(),
            sub: `${successRate}% success`,
            color: "#3F8F45",
          },
          {
            label: "Cancelled",
            value: kpis.cancelled.toString(),
            sub: `${cancelRate}% cancel rate`,
            color: "#D9534F",
          },
          {
            label: "Modified",
            value: kpis.modified.toString(),
            sub: "in-flight",
            color: "#D97706",
          },
          {
            label: "Avg Completion",
            value: `${completionRate}%`,
            sub: "per plan",
            color: "#6B3FA0",
          },
          {
            label: "Avg Train Delay",
            value: `${kpis.avgTrainDelayMin} min`,
            sub: `${kpis.avgConflictCount} conflicts avg`,
            color: "#16827A",
          },
        ].map((k) => (
          <div key={k.label} className="card p-3">
            <p
              style={{ color: "var(--text-secondary)", fontSize: 10 }}
            >
              {k.label}
            </p>
            <p
              className="font-bold text-xl mt-0.5"
              style={{ color: k.color }}
            >
              {k.value}
            </p>
            <p
              style={{ color: "var(--text-secondary)", fontSize: 10 }}
            >
              {k.sub}
            </p>
          </div>
        ))}
      </div>

      {/* Charts row */}
      <div
        className="grid gap-4"
        style={{ gridTemplateColumns: "1fr 1fr" }}
      >
        {/* Block count */}
        <div className="card p-4">
          <p
            className="font-semibold text-sm mb-3"
            style={{ color: "var(--navy)" }}
          >
            {period === "WEEKLY"
              ? "Plans per Week"
              : "Plans per Section"}
          </p>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
              <XAxis dataKey={xKey} tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip
                contentStyle={{
                  fontSize: 11,
                  border: "1px solid #E2E8F0",
                  borderRadius: 4,
                }}
              />
              <Bar
                dataKey="plans"
                fill="#1769AA"
                radius={[2, 2, 0, 0]}
                name="Plans"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Avg delay trend */}
        <div className="card p-4">
          <p
            className="font-semibold text-sm mb-3"
            style={{ color: "var(--navy)" }}
          >
            Avg Train Delay (min) by {period === "WEEKLY" ? "Week" : "Section"}
          </p>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
              <XAxis dataKey={xKey} tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip
                contentStyle={{
                  fontSize: 11,
                  border: "1px solid #E2E8F0",
                  borderRadius: 4,
                }}
              />
              <Line
                type="monotone"
                dataKey="delay"
                stroke="#D9534F"
                strokeWidth={2}
                dot={{ r: 3 }}
                name="Delay (min)"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Completion rate */}
        <div className="card p-4">
          <p
            className="font-semibold text-sm mb-3"
            style={{ color: "var(--navy)" }}
          >
            Avg Completion Rate (%)
          </p>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
              <XAxis dataKey={xKey} tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} domain={[0, 100]} />
              <Tooltip
                contentStyle={{
                  fontSize: 11,
                  border: "1px solid #E2E8F0",
                  borderRadius: 4,
                }}
              formatter={(v) => [`${v}%`, "Completion"]}
              />
              <Line
                type="monotone"
                dataKey="completion"
                stroke="#3F8F45"
                strokeWidth={2}
                dot={{ r: 3 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Conflicts vs completion */}
        <div className="card p-4">
          <p
            className="font-semibold text-sm mb-3"
            style={{ color: "var(--navy)" }}
          >
            Avg Conflicts per Plan
          </p>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
              <XAxis dataKey={xKey} tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip
                contentStyle={{
                  fontSize: 11,
                  border: "1px solid #E2E8F0",
                  borderRadius: 4,
                }}
              />
              <Bar
                dataKey="conflicts"
                fill="#D97706"
                radius={[2, 2, 0, 0]}
                name="Avg conflicts"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Execution status breakdown */}
      <div className="card p-4">
        <p
          className="font-semibold text-sm mb-3"
          style={{ color: "var(--navy)" }}
        >
          Execution Status Breakdown
        </p>
        <div className="grid grid-cols-3 gap-3">
          {Object.entries(byStatus).map(([status, count]) => {
            const color =
              status === "Completed"
                ? "#3F8F45"
                : status === "Modified"
                ? "#D97706"
                : "#D9534F";
            return (
              <div
                key={status}
                className="rounded-md p-3 text-center"
                style={{
                  background: `${color}12`,
                  border: `1px solid ${color}40`,
                }}
              >
                <p
                  className="text-2xl font-bold"
                  style={{ color }}
                >
                  {count}
                </p>
                <p
                  className="text-xs font-semibold"
                  style={{ color }}
                >
                  {status}
                </p>
                <p
                  style={{ color: "var(--text-secondary)", fontSize: 10 }}
                >
                  {Math.round(
                    (count / Math.max(1, kpis.totalPlans)) * 100
                  )}
                  % of all plans
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent executions table */}
      <div className="card p-4">
        <p
          className="font-semibold text-sm mb-3"
          style={{ color: "var(--navy)" }}
        >
          Recent Historical Plans
          <span
            className="ml-2 chip chip-purple"
            style={{ fontSize: 9 }}
          >
            source: historical_block_plans.csv
          </span>
        </p>

        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr style={{ borderBottom: "1px solid var(--border)" }}>
                {[
                  "Plan ID",
                  "Date",
                  "Section",
                  "Scope",
                  "Duration",
                  "Delay",
                  "Conflicts",
                  "Status",
                  "Completion",
                ].map((h) => (
                  <th
                    key={h}
                    className="text-left py-2 pr-4 font-semibold"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {recent.map((p) => (
                <tr
                  key={p.planId}
                  style={{ borderBottom: "1px solid #F1F5F9" }}
                >
                  <td className="py-2 pr-4 font-semibold mono">
                    {p.planId}
                  </td>
                  <td className="py-2 pr-4">{p.planDate}</td>
                  <td className="py-2 pr-4 mono">{p.sectionId}</td>
                  <td className="py-2 pr-4">{p.departmentScope}</td>
                  <td className="py-2 pr-4">{p.plannedDurationMin} min</td>
                  <td
                    className="py-2 pr-4"
                    style={{
                      color:
                        p.trainDelayMin > 15 ? "#D9534F" : "#D97706",
                    }}
                  >
                    {p.trainDelayMin} min
                  </td>
                  <td className="py-2 pr-4">{p.conflictCount}</td>
                  <td className="py-2 pr-4">
                    <span
                      className={`chip chip-${
                        p.executionStatus === "Completed"
                          ? "green"
                          : p.executionStatus === "Modified"
                          ? "orange"
                          : "red"
                      }`}
                      style={{ fontSize: 9 }}
                    >
                      {p.executionStatus}
                    </span>
                  </td>
                  <td className="py-2 pr-4">
                    <div className="flex items-center gap-2">
                      <div className="priority-bar flex-1 min-w-20">
                        <div
                          className="priority-fill"
                          style={{
                            width: `${p.completionPct}%`,
                            background:
                              p.completionPct >= 85
                                ? "#3F8F45"
                                : p.completionPct >= 70
                                ? "#D97706"
                                : "#D9534F",
                          }}
                        />
                      </div>
                      <span className="mono">{p.completionPct}%</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ML feedback loop note */}
      <div className="card p-4">
        <p
          className="font-semibold text-sm mb-2"
          style={{ color: "var(--navy)" }}
        >
          Controlled ML Feedback Loop
        </p>
        <p className="text-xs" style={{ color: "var(--text-secondary)" }}>
          Completed maintenance data → Actual execution data → Historical
          dataset → Controlled model retraining → Improved future predictions.
          This is <strong>not autonomous self-learning</strong>.
        </p>
        <p className="text-xs mt-2" style={{ color: "var(--text-secondary)" }}>
          Current prototype uses {kpis.totalPlans} historical plans from{" "}
          <span className="mono">historical_block_plans.csv</span> to
          illustrate the pipeline. {cancelledPlans().length} of those plans
          were cancelled — a signal for future priority re-weighting.
        </p>
      </div>
    </div>
  );
}