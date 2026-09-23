// ============================================================
// Adapter — maintenance_tasks.csv → UI MaintenanceTask model
// Merges AI priority (from ai_predictions) when available.
// ============================================================

import { MAINTENANCE_TASKS as RAW_TASKS, type MaintenanceTaskRow } from "../raw/maintenanceTasks";
import { AI_PREDICTIONS } from "../raw/aiPredictions";
import type { MaintenanceTask, Department, TaskStatus } from "../../types";

// ---------- Normalization maps ----------

/** CSV "Engineering" / "S&T" / "Traction" → UI Department */
function normalizeDepartment(raw: string): Department {
  const v = raw.trim().toUpperCase();
  if (v === "S&T" || v === "ST" || v === "SIGNAL") return "ST";
  if (v === "TRACTION" || v === "OHE") return "TRACTION";
  return "ENGINEERING";
}

/** CSV Priority ("Critical"/"High"/"Medium"/"Low") → numeric score (0-100) */
function priorityToScore(raw: string): number {
  const v = raw.trim().toLowerCase();
  if (v === "critical") return 90;
  if (v === "high") return 75;
  if (v === "medium") return 55;
  return 35;
}

/** CSV Status → UI TaskStatus */
function normalizeStatus(raw: string): TaskStatus {
  const v = raw.trim().toLowerCase().replace(" ", "_");
  if (v === "overdue") return "OVERDUE";
  if (v === "in_progress") return "IN_PROGRESS";
  if (v === "scheduled") return "SCHEDULED";
  if (v === "completed") return "COMPLETED";
  if (v === "blocked") return "BLOCKED";
  return "SCHEDULED";
}

// ---------- AI priority lookup ----------

const AI_PRIORITY_BY_ASSET: Record<string, { score: number; level: string }> = (() => {
  const map: Record<string, { score: number; level: string }> = {};
  for (const p of AI_PREDICTIONS) {
    map[p.asset_id] = { score: p.priority_score, level: p.priority_level };
  }
  return map;
})();

// ---------- Adapter ----------

function toMaintenanceTask(row: MaintenanceTaskRow): MaintenanceTask {
  const ai = AI_PRIORITY_BY_ASSET[row.asset_id];
  const baseScore = priorityToScore(row.priority);
  const priority = ai ? ai.score : baseScore;

  // Risk is best-effort: base score + criticality bump when no AI match.
  const risk = ai ? 100 - priority : Math.min(99, baseScore + 10);

  // Overdue days not present in CSV; derive from status.
  const overdueDays = normalizeStatus(row.status) === "OVERDUE" ? 7 : undefined;

  return {
    id: row.task_id,
    assetId: row.asset_id,
    section: row.section_id,
    department: normalizeDepartment(row.department),
    workType: row.work_type,
    priority,
    risk,
    duration: row.duration_min,
    crewRequired: "—",
    equipmentRequired: "—",
    deadline: row.due_date,
    status: normalizeStatus(row.status),
    compatibility: [],
    reason: row.reason,
    overdueDays,
  };
}

export const MAINTENANCE_TASKS: MaintenanceTask[] = RAW_TASKS.map(toMaintenanceTask);

export const MAINTENANCE_TASKS_BY_ID: Record<string, MaintenanceTask> = Object.fromEntries(
  MAINTENANCE_TASKS.map((t) => [t.id, t])
);

export function tasksBySection(sectionId: string): MaintenanceTask[] {
  return MAINTENANCE_TASKS.filter((t) => t.section === sectionId);
}

export function tasksByAsset(assetId: string): MaintenanceTask[] {
  return MAINTENANCE_TASKS.filter((t) => t.assetId === assetId);
}

export function tasksByDepartment(dept: Department): MaintenanceTask[] {
  return MAINTENANCE_TASKS.filter((t) => t.department === dept);
}

/**
 * Sorted priority queue — used by Maintenance page and Overview "What Needs Attention".
 */
export function topPriorityTasks(limit = 20): MaintenanceTask[] {
  return [...MAINTENANCE_TASKS]
    .sort((a, b) => b.priority - a.priority)
    .slice(0, limit);
}