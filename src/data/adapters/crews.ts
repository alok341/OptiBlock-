// ============================================================
// Adapter — resources_crews.csv → UI Crew model
// ============================================================

import {
  RESOURCES_CREWS,
  type ResourceCrewRow,
} from "../raw/resourcesCrews";
import type { Crew, Department } from "../../types";

// ---------- Normalization ----------

function normalizeDepartment(raw: string): Department {
  const v = raw.trim().toUpperCase();
  if (v === "S&T" || v === "ST" || v === "SIGNAL") return "ST";
  if (v === "TRACTION" || v === "OHE") return "TRACTION";
  return "ENGINEERING";
}

function normalizeStatus(
  raw: string
): Crew["status"] {
  const v = raw.trim().toLowerCase();
  if (v === "available") return "AVAILABLE";
  if (v === "standby")   return "AVAILABLE";   // standby = on-call, treat as available
  if (v === "assigned")  return "BUSY";
  return "UNAVAILABLE";
}

/** Derive shift → availability window. Night shift wins the demo window. */
function shiftWindow(shift: string): { from: string; until: string } {
  const v = shift.trim().toLowerCase();
  if (v === "night") return { from: "00:30", until: "04:30" };
  if (v === "day")   return { from: "10:00", until: "16:00" };
  // rotational / other → default night window
  return { from: "00:30", until: "04:30" };
}

// ---------- Adapter ----------

function toCrew(row: ResourceCrewRow): Crew {
  const dept = normalizeDepartment(row.department);
  const win = shiftWindow(row.shift);

  return {
    id: row.crew_id,
    department: dept,
    skills: [row.crew_type, row.skill_level],
    availableFrom: win.from,
    availableUntil: win.until,
    currentTask: null,
    status: normalizeStatus(row.availability_status),
  };
}

export const CREWS: Crew[] = RESOURCES_CREWS.map(toCrew);

export const CREWS_BY_ID: Record<string, Crew> = Object.fromEntries(
  CREWS.map((c) => [c.id, c])
);

export function crewsByDepartment(dept: Department): Crew[] {
  return CREWS.filter((c) => c.department === dept);
}

export function availableCrews(): Crew[] {
  return CREWS.filter((c) => c.status === "AVAILABLE");
}

/**
 * Select the best-fit crew for a task: same department, AVAILABLE, prefer higher skill.
 * Skill priority: Senior > Certified > Basic.
 */
export function pickCrewForDepartment(dept: Department): Crew | undefined {
  const skillRank: Record<string, number> = { Senior: 3, Certified: 2, Basic: 1 };
  return crewsByDepartment(dept)
    .filter((c) => c.status === "AVAILABLE")
    .sort((a, b) => {
      const sa = skillRank[a.skills[1] ?? "Basic"] ?? 1;
      const sb = skillRank[b.skills[1] ?? "Basic"] ?? 1;
      return sb - sa;
    })[0];
}

/** Total crew count summary per department — used by Admin / Reports. */
export function crewSummary(): Record<Department, { total: number; available: number; busy: number }> {
  const out: Record<Department, { total: number; available: number; busy: number }> = {
    ENGINEERING: { total: 0, available: 0, busy: 0 },
    ST: { total: 0, available: 0, busy: 0 },
    TRACTION: { total: 0, available: 0, busy: 0 },
  };
  for (const c of CREWS) {
    out[c.department].total += 1;
    if (c.status === "AVAILABLE") out[c.department].available += 1;
    else if (c.status === "BUSY") out[c.department].busy += 1;
  }
  return out;
}