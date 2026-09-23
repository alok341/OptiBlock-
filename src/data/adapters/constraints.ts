// ============================================================
// Adapter — operational_constraints.csv
//          + coa_corridor_availability.csv
//          + historical_block_plans.csv
// → unified constraints / corridor / history helpers.
// ============================================================

import {
  OPERATIONAL_CONSTRAINTS,
  type OperationalConstraintRow,
} from "../raw/operationalConstraints";
import {
  COA_CORRIDOR_AVAILABILITY,
  type CoaCorridorAvailabilityRow,
} from "../raw/coaCorridorAvailability";
import {
  HISTORICAL_BLOCK_PLANS,
  type HistoricalBlockPlanRow,
} from "../raw/historicalBlockPlans";
import type {
  OperationalConstraint,
  CorridorSlot,
  HistoricalBlockPlan,
} from "../../types";

// ---------- Operational constraints ----------

function toConstraint(row: OperationalConstraintRow): OperationalConstraint {
  return {
    constraintId: row.constraint_id,
    constraintType: row.constraint_type as OperationalConstraint["constraintType"],
    ruleDescription: row.rule_description,
    severity: row.severity as OperationalConstraint["severity"],
    sectionId: row.section_id,
    status: row.status as OperationalConstraint["status"],
  };
}

export const CONSTRAINTS: OperationalConstraint[] =
  OPERATIONAL_CONSTRAINTS.map(toConstraint);

export function constraintsForSection(sectionId: string): OperationalConstraint[] {
  return CONSTRAINTS.filter((c) => c.sectionId === sectionId);
}

/** Unique constraint types present in the dataset. */
export function constraintTypes(): string[] {
  return Array.from(new Set(CONSTRAINTS.map((c) => c.constraintType)));
}

// ---------- Corridor availability (COA) ----------

function toSlot(row: CoaCorridorAvailabilityRow): CorridorSlot {
  return {
    coaId: row.coa_id,
    sectionId: row.section_id,
    date: row.date,
    startTime: row.start_time,
    endTime: row.end_time,
    availability: row.availability as CorridorSlot["availability"],
    reason: row.reason,
    trafficLevel: row.traffic_level as CorridorSlot["trafficLevel"],
  };
}

export const CORRIDOR_SLOTS: CorridorSlot[] =
  COA_CORRIDOR_AVAILABILITY.map(toSlot);

export function corridorForSection(
  sectionId: string,
  date?: string
): CorridorSlot[] {
  return CORRIDOR_SLOTS.filter(
    (s) => s.sectionId === sectionId && (!date || s.date === date)
  );
}

/** Availability summary for a section on a given date. */
export interface CorridorSummary {
  sectionId: string;
  date: string;
  available: number;
  restricted: number;
  blocked: number;
  slots: CorridorSlot[];
}

export function corridorSummary(
  sectionId: string,
  date: string
): CorridorSummary {
  const slots = corridorForSection(sectionId, date);
  return {
    sectionId,
    date,
    available: slots.filter((s) => s.availability === "Available").length,
    restricted: slots.filter((s) => s.availability === "Restricted").length,
    blocked: slots.filter((s) => s.availability === "Blocked").length,
    slots,
  };
}

/** All dates present in COA for a section (ordered). */
export function corridorDates(sectionId: string): string[] {
  return Array.from(
    new Set(corridorForSection(sectionId).map((s) => s.date))
  ).sort();
}

/** Is a given time window inside an "Available" COA slot? */
export function isWindowAvailable(
  sectionId: string,
  date: string,
  start: string,
  end: string
): boolean {
  return corridorForSection(sectionId, date).some(
    (s) =>
      s.availability === "Available" &&
      s.startTime <= start &&
      s.endTime >= end
  );
}

// ---------- Historical block plans ----------

function toHistory(row: HistoricalBlockPlanRow): HistoricalBlockPlan {
  return {
    planId: row.plan_id,
    planDate: row.plan_date,
    sectionId: row.section_id,
    departmentScope: row.department_scope as HistoricalBlockPlan["departmentScope"],
    plannedDurationMin: row.planned_duration_min,
    trainDelayMin: row.train_delay_min,
    conflictCount: row.conflict_count,
    executionStatus: row.execution_status as HistoricalBlockPlan["executionStatus"],
    completionPct: row.completion_pct,
  };
}

export const HISTORICAL_PLANS: HistoricalBlockPlan[] =
  HISTORICAL_BLOCK_PLANS.map(toHistory);

export function historyForSection(sectionId: string): HistoricalBlockPlan[] {
  return HISTORICAL_PLANS.filter((p) => p.sectionId === sectionId);
}

/** Aggregate KPIs across the whole historical dataset. */
export interface HistoryKpis {
  totalPlans: number;
  completed: number;
  cancelled: number;
  modified: number;
  avgCompletionPct: number;
  avgTrainDelayMin: number;
  avgConflictCount: number;
}

export function historyKpis(): HistoryKpis {
  const total = HISTORICAL_PLANS.length;
  const completed = HISTORICAL_PLANS.filter((p) => p.executionStatus === "Completed").length;
  const cancelled = HISTORICAL_PLANS.filter((p) => p.executionStatus === "Cancelled").length;
  const modified  = HISTORICAL_PLANS.filter((p) => p.executionStatus === "Modified").length;
  const avgCompletion =
    HISTORICAL_PLANS.reduce((s, p) => s + p.completionPct, 0) / Math.max(1, total);
  const avgDelay =
    HISTORICAL_PLANS.reduce((s, p) => s + p.trainDelayMin, 0) / Math.max(1, total);
  const avgConf =
    HISTORICAL_PLANS.reduce((s, p) => s + p.conflictCount, 0) / Math.max(1, total);

  return {
    totalPlans: total,
    completed,
    cancelled,
    modified,
    avgCompletionPct: Math.round(avgCompletion),
    avgTrainDelayMin: Math.round(avgDelay * 10) / 10,
    avgConflictCount: Math.round(avgConf * 10) / 10,
  };
}

/** Total cancelled blocks — used by Reports & Architecture. */
export function cancelledPlans(): HistoricalBlockPlan[] {
  return HISTORICAL_PLANS.filter((p) => p.executionStatus === "Cancelled");
}