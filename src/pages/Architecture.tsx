// ============================================================
// System Architecture
// Production design vs current prototype · CSV → UI mapping
// Row counts pulled from the actual seed (17 CSVs).
// ============================================================

import {
  SECTIONS,
  ASSETS,
  MAINTENANCE_TASKS,
  BLOCK_REQUESTS,
  FEASIBLE_WINDOWS,
  OPTIMIZED_PLANS,
  LIVE_TRAINS,
  CREWS,
  CONSTRAINTS,
  LIVE_EVENTS_UI,
  GOODS_FORECAST,
  HISTORICAL_PLANS,
  AI_PREDICTIONS_UI,
} from "../data/seed";

// ---------- Layer definitions ----------

interface Layer {
  label: string;
  color: string;
  items: string[];
}

const LAYERS: Layer[] = [
  {
    label: "DATA SOURCES",
    color: "#1769AA",
    items: [
      "TMS — Track Management",
      "SMMS — Signalling",
      "TDMS — Traction",
      "BDMS — Block Requests",
      "COA — Corridor Availability",
      "Train Timetable",
      "Live Train Movement",
      "Goods Forecast",
      "Resources / Crews",
      "Operational Constraints",
      "Railway Sections",
      "Historical Plans",
    ],
  },
  {
    label: "DATA INGESTION & VALIDATION",
    color: "#16827A",
    items: [
      "Schema mapping",
      "Normalization",
      "ID reconciliation",
      "Duplicate removal",
      "Timestamp sync",
    ],
  },
  {
    label: "UNIFIED RAILWAY DATA PLATFORM",
    color: "#17324D",
    items: [
      "PostgreSQL + PostGIS (production)",
      "Redis cache layer",
      "Prototype: in-memory seed",
    ],
  },
  {
    label: "INTELLIGENCE LAYER",
    color: "#6B3FA0",
    items: [
      "Risk prediction (per asset)",
      "Asset health scoring",
      "Priority scoring engine",
      "Train delay estimation",
    ],
  },
  {
    label: "CONSTRAINT & FEASIBILITY ENGINE",
    color: "#D97706",
    items: [
      "Train occupancy",
      "Crew availability",
      "Corridor availability",
      "Block conflicts",
      "Department compatibility",
    ],
  },
  {
    label: "CROSS-DEPARTMENT COORDINATION",
    color: "#16827A",
    items: [
      "Engineering ↔ S&T",
      "Engineering ↔ Traction (conditional)",
      "S&T ↔ Traction safety check",
    ],
  },
  {
    label: "OPTIMIZATION — OR-Tools CP-SAT",
    color: "#3F8F45",
    items: [
      "Minimize train delays",
      "Maximize block utilization",
      "Coordinate compatible work",
      "Respect hard constraints",
    ],
  },
  {
    label: "OPTIMIZED BLOCK PLAN",
    color: "#17324D",
    items: [
      "Section-wise block schedule",
      "Coordinated tasks",
      "Expected impact metrics",
      "Controller-ready outputs",
    ],
  },
  {
    label: "COA / CONTROLLER REVIEW",
    color: "#1769AA",
    items: [
      "Approve / Modify / Reject / Replan",
      "Full audit trail",
      "WHY explanations",
      "Override authority",
    ],
  },
  {
    label: "LIVE RE-OPTIMIZATION",
    color: "#D9534F",
    items: [
      "Event detection",
      "Impact assessment",
      "Constraint recalculation",
      "Updated plan generation",
    ],
  },
];

// ---------- CSV → UI mapping table ----------

interface CsvRow {
  stage: string;
  file: string;
  count: number;
  purpose: string;
}

const CSV_ROWS: CsvRow[] = [
  {
    stage: "Ingest",
    file: "railway_sections.csv",
    count: SECTIONS.length,
    purpose: "Network + corridor topology",
  },
  {
    stage: "Ingest",
    file: "tms_track_assets.csv + smms_signalling_assets.csv + tdms_traction_assets.csv",
    count: ASSETS.length,
    purpose: "Unified asset registry",
  },
  {
    stage: "Ingest",
    file: "maintenance_tasks.csv",
    count: MAINTENANCE_TASKS.length,
    purpose: "Maintenance work orders",
  },
  {
    stage: "Ingest",
    file: "bdms_block_requests.csv",
    count: BLOCK_REQUESTS.length,
    purpose: "Block requests",
  },
  {
    stage: "Ingest",
    file: "train_timetable.csv",
    count: 120,
    purpose: "Scheduled train movements",
  },
  {
    stage: "Ingest",
    file: "live_train_movement.csv",
    count: LIVE_TRAINS.length,
    purpose: "Live train positions + delays",
  },
  {
    stage: "Ingest",
    file: "goods_train_forecast.csv",
    count: GOODS_FORECAST.length,
    purpose: "Expected goods movements",
  },
  {
    stage: "Ingest",
    file: "coa_corridor_availability.csv",
    count: 280,
    purpose: "Corridor availability windows",
  },
  {
    stage: "Ingest",
    file: "resources_crews.csv",
    count: CREWS.length,
    purpose: "Crew resources",
  },
  {
    stage: "Ingest",
    file: "operational_constraints.csv",
    count: CONSTRAINTS.length,
    purpose: "Hard rule set",
  },
  {
    stage: "Ingest",
    file: "historical_block_plans.csv",
    count: HISTORICAL_PLANS.length,
    purpose: "Prior block execution history",
  },
  {
    stage: "AI",
    file: "ai_predictions.csv",
    count: AI_PREDICTIONS_UI.length,
    purpose: "Risk / health / priority scores",
  },
  {
    stage: "Constraint",
    file: "feasible_block_windows.csv",
    count: FEASIBLE_WINDOWS.length,
    purpose: "Feasible & rejected windows",
  },
  {
    stage: "Optimize",
    file: "optimized_block_plans.csv",
    count: OPTIMIZED_PLANS.length,
    purpose: "OR-Tools optimized plans",
  },
  {
    stage: "Live",
    file: "live_events.csv",
    count: LIVE_EVENTS_UI.length,
    purpose: "Live operational events",
  },
];

// ---------- Stage → CSV mapping (pipeline HUD) ----------

const PIPELINE_CSV_MAP: { stage: string; color: string; reads: string }[] = [
  {
    stage: "INGEST",
    color: "#1769AA",
    reads:
      "railway_sections · tms_track_assets · smms_signalling_assets · tdms_traction_assets · maintenance_tasks · bdms_block_requests · train_timetable · live_train_movement · goods_train_forecast · coa_corridor_availability · resources_crews · operational_constraints · historical_block_plans",
  },
  {
    stage: "AI",
    color: "#6B3FA0",
    reads: "ai_predictions.csv",
  },
  {
    stage: "CONSTRAINT",
    color: "#D97706",
    reads: "feasible_block_windows.csv · coa_corridor_availability.csv",
  },
  {
    stage: "COORDINATION",
    color: "#16827A",
    reads: "maintenance_tasks.csv · resources_crews.csv",
  },
  {
    stage: "OPTIMIZE",
    color: "#3F8F45",
    reads: "optimized_block_plans.csv",
  },
  {
    stage: "CONTROLLER",
    color: "#17324D",
    reads: "optimized_block_plans.csv + user action",
  },
  {
    stage: "LIVE",
    color: "#D9534F",
    reads: "live_events.csv · live_train_movement.csv",
  },
  {
    stage: "REOPTIMIZE",
    color: "#6B3FA0",
    reads: "feasible_block_windows.csv (re-run) · optimized_block_plans.csv (re-run)",
  },
];

// ---------- Main page ----------

export default function Architecture() {
  return (
    <div className="flex flex-col gap-4 h-full overflow-y-auto p-4">
      <div>
        <h1 className="text-lg font-bold" style={{ color: "var(--navy)" }}>
          System Architecture
        </h1>
        <p className="text-xs" style={{ color: "var(--text-secondary)" }}>
          Production design vs prototype · CSV → UI mapping · pipeline stage
          data sources
        </p>
      </div>

      <div
        className="grid gap-4"
        style={{ gridTemplateColumns: "2fr 1fr" }}
      >
        {/* Architecture flow */}
        <div className="card p-5">
          <p
            className="font-semibold text-sm mb-4"
            style={{ color: "var(--navy)" }}
          >
            Production Architecture Flow
          </p>
          <div className="flex flex-col items-center gap-0">
            {LAYERS.map((layer, i) => (
              <div
                key={layer.label}
                className="w-full flex flex-col items-center"
              >
                <div
                  className="w-full rounded-md p-3"
                  style={{
                    background: `${layer.color}15`,
                    border: `1px solid ${layer.color}40`,
                  }}
                >
                  <p
                    className="font-bold text-xs mb-1"
                    style={{ color: layer.color }}
                  >
                    {layer.label}
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {layer.items.map((item) => (
                      <span
                        key={item}
                        className="chip chip-gray"
                        style={{ fontSize: 9 }}
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
                {i < LAYERS.length - 1 && (
                  <div className="flex flex-col items-center py-1">
                    <div
                      className="w-px h-4"
                      style={{ background: "#CBD5E1" }}
                    />
                    <span style={{ color: "#94A3B8", fontSize: 12 }}>
                      ↓
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Right column */}
        <div className="flex flex-col gap-3">
          {/* Prototype */}
          <div className="card p-4">
            <p
              className="font-semibold text-sm mb-3"
              style={{ color: "var(--navy)" }}
            >
              Current Prototype
            </p>
            <div className="space-y-1">
              {[
                "React + TypeScript frontend",
                "Tailwind CSS v4 styling",
                "17 synthetic CSV datasets",
                "CSV-driven adapters",
                "Simulated live feed",
                "Rule-based constraint engine",
                "Prototype optimizer stub",
                "No external connections",
                "No real railway data",
              ].map((item) => (
                <div
                  key={item}
                  className="flex items-center gap-2 text-xs"
                >
                  <span
                    className="w-3 h-3 rounded-full flex items-center justify-center text-white flex-shrink-0"
                    style={{ background: "#1769AA", fontSize: 8 }}
                  >
                    ✓
                  </span>
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Production */}
          <div className="card p-4">
            <p
              className="font-semibold text-sm mb-3"
              style={{ color: "var(--navy)" }}
            >
              Future Production System
            </p>
            <div className="space-y-1">
              {[
                ["React frontend", "#3F8F45"],
                ["Spring Boot API backend", "#1769AA"],
                ["PostgreSQL + PostGIS", "#1769AA"],
                ["Python / FastAPI ML service", "#6B3FA0"],
                ["Constraint & feasibility engine", "#6B3FA0"],
                ["Google OR-Tools CP-SAT", "#3F8F45"],
                ["Kafka event streaming", "#16827A"],
                ["Authorized railway data APIs", "#D97706"],
                ["Redis caching layer", "#16827A"],
              ].map(([item, color]) => (
                <div
                  key={item}
                  className="flex items-center gap-2 text-xs"
                >
                  <span
                    className="w-3 h-3 rounded-full flex-shrink-0"
                    style={{
                      background: `${color}30`,
                      border: `1px solid ${color}`,
                    }}
                  />
                  <span style={{ color: "var(--text-secondary)" }}>
                    {item}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Notice */}
          <div
            className="card p-4"
            style={{ border: "1px solid #FCD34D" }}
          >
            <p
              className="font-semibold text-xs mb-2"
              style={{ color: "#B45309" }}
            >
              ⚠ Important Notice
            </p>
            <p className="text-xs" style={{ color: "var(--text-secondary)" }}>
              This is a frontend prototype built for SIH 2026 demonstration. It
              uses synthetic CSV data and does not connect to any real railway
              systems.
            </p>
            <p
              className="text-xs mt-2"
              style={{ color: "var(--text-secondary)" }}
            >
              Live operational integration requires authorized access to TMS,
              SMMS, TDMS, BDMS, and COA through Railway Board approved data
              interfaces.
            </p>
          </div>

          {/* Team */}
          <div className="card p-4">
            <p
              className="font-semibold text-xs mb-2"
              style={{ color: "var(--navy)" }}
            >
              Team GatiShakti
            </p>
            <p className="text-xs" style={{ color: "var(--text-secondary)" }}>
              Smart India Hackathon 2026
            </p>
            <p className="text-xs" style={{ color: "var(--text-secondary)" }}>
              Problem Statement: 26027
            </p>
            <p className="text-xs" style={{ color: "var(--text-secondary)" }}>
              Ministry of Railways
            </p>
            <p
              className="text-xs font-semibold mt-2"
              style={{ color: "#6B3FA0" }}
            >
              OPTIBLOCK — AI-Powered Automatic Block Planning
            </p>
          </div>
        </div>
      </div>

      {/* Pipeline stage → CSV mapping */}
      <div className="card p-4">
        <p
          className="font-semibold text-sm mb-3"
          style={{ color: "var(--navy)" }}
        >
          Pipeline Stage → Data Source Map
        </p>
        <div className="space-y-2">
          {PIPELINE_CSV_MAP.map((row) => (
            <div
              key={row.stage}
              className="flex items-center gap-3 text-xs"
            >
              <div
                className="font-bold tracking-wide flex-shrink-0"
                style={{
                  color: row.color,
                  width: 100,
                  fontSize: 10,
                }}
              >
                {row.stage}
              </div>
              <div
                className="h-2 w-2 rounded-full flex-shrink-0"
                style={{ background: row.color }}
              />
              <p
                className="mono flex-1"
                style={{ color: "var(--text-secondary)", fontSize: 10 }}
              >
                {row.reads}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* CSV → UI row count table */}
      <div className="card p-4">
        <p
          className="font-semibold text-sm mb-3"
          style={{ color: "var(--navy)" }}
        >
          CSV Sources Loaded Into the Prototype
        </p>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr style={{ borderBottom: "1px solid var(--border)" }}>
                {["Stage", "CSV File", "Records", "Purpose"].map((h) => (
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
              {CSV_ROWS.map((r) => (
                <tr
                  key={r.file}
                  style={{ borderBottom: "1px solid #F1F5F9" }}
                >
                  <td className="py-1.5 pr-4">
                    <span
                      className="chip chip-gray"
                      style={{ fontSize: 9 }}
                    >
                      {r.stage}
                    </span>
                  </td>
                  <td
                    className="py-1.5 pr-4 mono"
                    style={{ fontSize: 10 }}
                  >
                    {r.file}
                  </td>
                  <td
                    className="py-1.5 pr-4 mono font-semibold"
                    style={{ color: "#1769AA" }}
                  >
                    {r.count}
                  </td>
                  <td
                    className="py-1.5 pr-4"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    {r.purpose}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p
          className="text-xs mt-3"
          style={{ color: "var(--text-secondary)" }}
        >
          Total source datasets: <strong>13</strong> · Derived/output datasets:{" "}
          <strong>4</strong> · Combined: <strong>17</strong> · All loaded into
          the in-memory unified seed on startup.
        </p>
      </div>

      {/* Demo narrative summary */}
      <div className="card p-4">
        <p
          className="font-semibold text-sm mb-3"
          style={{ color: "var(--navy)" }}
        >
          Demo Narrative — Full Chain
        </p>
        <div className="grid gap-2 text-xs" style={{ gridTemplateColumns: "repeat(4, 1fr)" }}>
          {[
            { label: "1. Ingest", value: "17 CSV files" },
            { label: "2. AI", value: "PRED-9001 · TRK-104" },
            { label: "3. Request", value: "BLK-541 · SEC-102" },
            { label: "4. Constraint", value: "FW-2065 rejected" },
            { label: "5. Feasible", value: "FW-2066 accepted" },
            { label: "6. Coordination", value: "Engineering + S&T" },
            { label: "7. Optimize", value: "OPT-3035 selected" },
            { label: "8. Controller", value: "Approve / Modify" },
            { label: "9. Live Event", value: "EVT-002 defect" },
            { label: "10. Re-optimize", value: "Recalc + rerun" },
            { label: "11. Updated Plan", value: "Submitted to COA" },
            { label: "12. Sign-off", value: "Controller decides" },
          ].map((s) => (
            <div
              key={s.label}
              className="rounded p-2"
              style={{
                background: "#F8FAFC",
                border: "1px solid #E2E8F0",
              }}
            >
              <p
                className="font-semibold"
                style={{ color: "var(--navy)", fontSize: 10 }}
              >
                {s.label}
              </p>
              <p
                className="mono"
                style={{
                  color: "var(--text-secondary)",
                  fontSize: 10,
                }}
              >
                {s.value}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}