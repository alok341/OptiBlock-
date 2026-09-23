// ============================================================
// Adapter — bdms_block_requests.csv + feasible_block_windows.csv
//          + optimized_block_plans.csv → UI BlockRequest + linkage
// ============================================================

import {
  BDMS_BLOCK_REQUESTS,
  type BdmsBlockRequestRow,
} from "../raw/bdmsBlockRequests";
import {
  FEASIBLE_BLOCK_WINDOWS,
  type FeasibleBlockWindowRow,
} from "../raw/feasibleBlockWindows";
import {
  OPTIMIZED_BLOCK_PLANS,
  type OptimizedBlockPlanRow,
} from "../raw/optimizedBlockPlans";
import type {
  BlockRequest,
  BlockStatus,
  Department,
  FeasibleWindow,
  OptimizedBlockPlan,
  AIPrediction,
} from "../../types";
import { AI_PREDICTIONS } from "../raw/aiPredictions";
import { MAINTENANCE_TASKS_BY_ID } from "./tasks";

// ---------- Normalization ----------

function normalizeDepartment(raw: string): Department {
  const v = raw.trim().toUpperCase();
  if (v === "S&T" || v === "ST" || v === "SIGNAL") return "ST";
  if (v === "TRACTION" || v === "OHE") return "TRACTION";
  return "ENGINEERING";
}

function normalizeBlockStatus(raw: string): BlockStatus {
  const v = raw.trim().toLowerCase();
  if (v === "approved")   return "APPROVED";
  if (v === "requested")  return "REQUESTED";
  if (v === "pending")    return "UNDER_REVIEW";
  if (v === "cancelled")  return "CANCELLED";
  if (v === "completed")  return "COMPLETED";
  if (v === "rejected")   return "REJECTED";
  if (v === "modified")   return "MODIFIED";
  if (v === "recommended")return "RECOMMENDED";
  return "REQUESTED";
}

/** Split "YYYY-MM-DD HH:MM" → { date, time } */
function splitDatetime(dt: string): { date: string; time: string } {
  const [date, time] = dt.split(" ");
  return { date: date ?? "", time: time ?? "00:00" };
}

/** Priority score heuristic from urgency + AI predictions on the section. */
function computePriority(
  row: BdmsBlockRequestRow,
  aiBySection: Record<string, AIPrediction>
): number {
  const urgency = row.urgency.toLowerCase();
  let base = 50;
  if (urgency === "emergency") base = 85;
  else if (urgency === "urgent") base = 70;
  else base = 45;

  // Bump by top AI priority_score for this section if available.
  const ai = aiBySection[row.section_id];
  if (ai) base = Math.max(base, Math.round((base + ai.priorityScore) / 2));
  return Math.min(100, base);
}

// ---------- Feasible windows ----------

export const FEASIBLE_WINDOWS: FeasibleWindow[] = FEASIBLE_BLOCK_WINDOWS.map(
  (r: FeasibleBlockWindowRow): FeasibleWindow => ({
    windowId: r.window_id,
    blockRequestId: r.block_request_id,
    sectionId: r.section_id,
    windowStart: r.window_start,
    windowEnd: r.window_end,
    durationMin: r.duration_min,
    conflictCount: r.conflict_count,
    conflictReason: r.conflict_reason,
    feasible: r.feasible.toLowerCase() === "yes",
    constraintStatus:
      r.constraint_status === "Feasible"
        ? "Feasible"
        : r.constraint_status === "Rejected"
        ? "Rejected"
        : "Needs Review",
  })
);

export const FEASIBLE_WINDOWS_BY_REQUEST: Record<string, FeasibleWindow[]> = (() => {
  const m: Record<string, FeasibleWindow[]> = {};
  for (const w of FEASIBLE_WINDOWS) {
    (m[w.blockRequestId] ??= []).push(w);
  }
  return m;
})();

// ---------- Optimized plans ----------

function normalizePriorityLevel(raw: string): OptimizedBlockPlan["priority"] {
  const v = raw.trim().toLowerCase();
  if (v === "critical") return "Critical";
  if (v === "high") return "High";
  if (v === "medium") return "Medium";
  return "Low";
}

export const OPTIMIZED_PLANS: OptimizedBlockPlan[] = OPTIMIZED_BLOCK_PLANS.map(
  (r: OptimizedBlockPlanRow): OptimizedBlockPlan => ({
    planId: r.plan_id,
    blockRequestId: r.block_request_id,
    windowId: r.window_id,
    sectionId: r.section_id,
    assetId: r.asset_id,
    department: normalizeDepartment(r.department),
    workType: r.work_type,
    startTime: r.start_time,
    endTime: r.end_time,
    duration: r.duration,
    priority: normalizePriorityLevel(r.priority),
    trainDelay: r.train_delay,
    conflictCount: r.conflict_count,
    assetDowntime: r.asset_downtime,
    status: r.status as OptimizedBlockPlan["status"],
    reason: r.reason,
  })
);

export const OPTIMIZED_PLANS_BY_REQUEST: Record<string, OptimizedBlockPlan[]> = (() => {
  const m: Record<string, OptimizedBlockPlan[]> = {};
  for (const p of OPTIMIZED_PLANS) {
    (m[p.blockRequestId] ??= []).push(p);
  }
  return m;
})();

// ---------- Block requests (the master entity) ----------

/** Top AI priority per section — used to derive block priority. */
const AI_BY_SECTION: Record<string, AIPrediction> = (() => {
  const m: Record<string, AIPrediction> = {};
  for (const p of AI_PREDICTIONS) {
    const existing = m[p.section_id];
    if (!existing || p.priority_score > existing.priorityScore) {
      m[p.section_id] = {
        predictionId: p.prediction_id,
        assetId: p.asset_id,
        assetType: p.asset_type as AIPrediction["assetType"],
        sectionId: p.section_id,
        riskScore: p.risk_score,
        healthScore: p.health_score,
        priorityScore: p.priority_score,
        priorityLevel: p.priority_level as AIPrediction["priorityLevel"],
        predictedFailure: p.predicted_failure === "Yes",
        predictionConfidence: p.prediction_confidence,
        predictionTimestamp: p.prediction_timestamp,
      };
    }
  }
  return m;
})();

function toBlockRequest(row: BdmsBlockRequestRow): BlockRequest {
  const requestStart = splitDatetime(row.requested_start);
  const requestEnd = splitDatetime(row.requested_end);
  const dept = normalizeDepartment(row.requesting_department);

  // Links to feasible windows + optimized plans
  const windows = FEASIBLE_WINDOWS_BY_REQUEST[row.block_request_id] ?? [];
  const plans = OPTIMIZED_PLANS_BY_REQUEST[row.block_request_id] ?? [];

  // Asset is taken from the first optimized plan if available, else unknown.
  const primaryPlan = plans[0];
  const assetId = primaryPlan?.assetId ?? "—";

  // Task IDs: attempt to find the maintenance task with matching asset/section.
  const taskIds: string[] = [];
  if (assetId !== "—") {
    for (const t of Object.values(MAINTENANCE_TASKS_BY_ID)) {
      if (t.assetId === assetId && t.section === row.section_id) taskIds.push(t.id);
    }
  }

  const feasibleWindowCount = windows.filter((w) => w.feasible).length;
  const conflictCount = windows.filter((w) => !w.feasible).length;
  const utilization =
    feasibleWindowCount > 0
      ? Math.round(
          (feasibleWindowCount / Math.max(1, windows.length)) * 100
        )
      : 0;

  // Best window drives the "requested" fields used by existing UI.
  const bestWindow = windows.find((w) => w.feasible);

  return {
    id: row.block_request_id,
    section: row.section_id,
    departments: [dept],
    taskIds,
    requestedStart: bestWindow
      ? splitDatetime(bestWindow.windowStart).time
      : requestStart.time,
    requestedEnd: bestWindow
      ? splitDatetime(bestWindow.windowEnd).time
      : requestEnd.time,
    duration: row.duration_min,
    priority: computePriority(row, AI_BY_SECTION),
    reason: `${row.purpose} — ${row.urgency}`,
    status: normalizeBlockStatus(row.status),
    conflicts: conflictCount,
    crew: [],
    equipment: [],
    trainImpact: primaryPlan?.trainDelay ?? 0,
    utilization,
  };
}

export const BLOCK_REQUESTS: BlockRequest[] = BDMS_BLOCK_REQUESTS.map(toBlockRequest);

export const BLOCK_REQUESTS_BY_ID: Record<string, BlockRequest> = Object.fromEntries(
  BLOCK_REQUESTS.map((b) => [b.id, b])
);

export function blocksBySection(sectionId: string): BlockRequest[] {
  return BLOCK_REQUESTS.filter((b) => b.section === sectionId);
}

export function blocksByStatus(status: BlockStatus): BlockRequest[] {
  return BLOCK_REQUESTS.filter((b) => b.status === status);
}

/** Requests that still need controller action. */
export function pendingBlockRequests(): BlockRequest[] {
  return BLOCK_REQUESTS.filter(
    (b) => b.status === "REQUESTED" || b.status === "UNDER_REVIEW"
  );
}

/** Requests with an optimized plan awaiting approval. */
export function recommendedBlockRequests(): BlockRequest[] {
  return BLOCK_REQUESTS.filter((b) => b.status === "RECOMMENDED");
}

/** Convenience: the anchor demo request. */
export const ANCHOR_BLOCK_REQUEST_ID = "BLK-541";

export function getAnchorBlockChain() {
  const request = BLOCK_REQUESTS_BY_ID[ANCHOR_BLOCK_REQUEST_ID];
  const windows = FEASIBLE_WINDOWS_BY_REQUEST[ANCHOR_BLOCK_REQUEST_ID] ?? [];
  const plans = OPTIMIZED_PLANS_BY_REQUEST[ANCHOR_BLOCK_REQUEST_ID] ?? [];
  return { request, windows, plans };
}