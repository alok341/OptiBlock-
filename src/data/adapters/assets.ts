// ============================================================
// Adapter — TMS / SMMS / TDMS raw rows → unified UI Asset model
// Merges three source systems into one normalized Asset collection.
// ============================================================

import { TMS_TRACK_ASSETS, type TmsTrackAssetRow } from "../raw/tmsTrackAssets";
import { SMMS_SIGNALLING_ASSETS, type SmmsSignallingAssetRow } from "../raw/smmsSignallingAssets";
import { TDMS_TRACTION_ASSETS, type TdmsTractionAssetRow } from "../raw/tdmsTractionAssets";
import type {
  Asset,
  Department,
  Criticality,
  DefectStatus,
  AssetStatus,
} from "../../types";

// ---------- Shared helpers ----------

/** Convert CSV "Critical" / "HIGH" / "high" → UI "CRITICAL" / "HIGH" */
function normalizeCriticality(raw: string): Criticality {
  const v = raw.trim().toUpperCase();
  if (v === "CRITICAL") return "CRITICAL";
  if (v === "HIGH") return "HIGH";
  if (v === "MEDIUM") return "MEDIUM";
  return "LOW";
}

/** CSV condition (Good/Fair/Poor/Critical or Healthy/Degraded/Faulty) → UI AssetStatus */
function mapConditionToStatus(condition: string): AssetStatus {
  const v = condition.trim().toLowerCase();
  if (v === "critical") return "CRITICAL";
  if (v === "poor" || v === "degraded" || v === "faulty") return "DEGRADED";
  return "OPERATIONAL";
}

/** Numeric severity (TMS/TDMS 1-12) → UI DefectStatus bucket */
function severityToDefectStatus(sev: number): DefectStatus {
  if (sev >= 10) return "CRITICAL";
  if (sev >= 5) return "MODERATE";
  if (sev >= 1) return "MINOR";
  return "NONE";
}

/** SMMS uses health_score (0–100). Convert to defect bucket. */
function signalHealthToDefectStatus(health: number, condition: string): DefectStatus {
  if (condition.toLowerCase() === "healthy") return "NONE";
  if (health < 25) return "CRITICAL";
  if (health < 60) return "MODERATE";
  return "MINOR";
}

/**
 * Risk score: high when condition is bad, severity is high, load is high, health low.
 * Kept deterministic and explainable for the prototype.
 */
function computeRisk(condition: string, severity: number, loadPct: number): number {
  const c = condition.toLowerCase();
  let base = 20;
  if (c === "fair") base = 40;
  if (c === "poor" || c === "degraded") base = 60;
  if (c === "faulty") base = 70;
  if (c === "critical") base = 85;
  // severity up to 12 → up to +12
  const sevAdj = Math.min(12, severity);
  // load up to 100 → up to +15
  const loadAdj = Math.round((loadPct / 100) * 15);
  return Math.min(99, base + sevAdj + loadAdj);
}

// ---------- TMS (Track) ----------

function tmsToAsset(row: TmsTrackAssetRow): Asset {
  const defectStatus = severityToDefectStatus(row.defect_severity);
  const risk = computeRisk(row.condition, row.defect_severity, row.usage_load_pct);
  const health = Math.max(0, 100 - risk);

  return {
    id: row.asset_id,
    section: row.section_id,
    department: "ENGINEERING",
    type: "Track",
    location: row.asset_location,
    health,
    risk,
    criticality: normalizeCriticality(row.criticality),
    defectStatus,
    defectSeverity: row.defect_type,
    lastMaintenance: "—",
    nextDue: "—",
    maintenanceFrequency: row.maintenance_type,
    usageLoad: `${row.usage_load_pct}%`,
    status: mapConditionToStatus(row.condition),
    priority: undefined,
  };
}

// ---------- SMMS (Signalling) ----------

function smmsToAsset(row: SmmsSignallingAssetRow): Asset {
  const defectStatus = signalHealthToDefectStatus(row.health_score, row.condition);
  const risk = 100 - row.health_score;

  return {
    id: row.signal_id,
    section: row.section_id,
    department: "ST",
    type: row.signal_type,
    location: row.section_id,
    health: row.health_score,
    risk,
    criticality: normalizeCriticality(row.criticality),
    defectStatus,
    defectSeverity: row.fault_type,
    lastMaintenance: "—",
    nextDue: "—",
    maintenanceFrequency: row.maintenance_type,
    usageLoad: "—",
    status: mapConditionToStatus(row.condition),
    priority: undefined,
  };
}

// ---------- TDMS (Traction) ----------

function tdmsToAsset(row: TdmsTractionAssetRow): Asset {
  const defectStatus = severityToDefectStatus(row.defect_severity);
  const risk = computeRisk(row.condition, row.defect_severity, row.load_pct);
  const health = Math.max(0, 100 - risk);

  return {
    id: row.traction_asset_id,
    section: row.section_id,
    department: "TRACTION",
    type: row.component_type,
    location: row.section_id,
    health,
    risk,
    criticality: normalizeCriticality(row.criticality),
    defectStatus,
    defectSeverity: row.defect_type,
    lastMaintenance: "—",
    nextDue: "—",
    maintenanceFrequency: "—",
    usageLoad: `${row.load_pct}%`,
    status: mapConditionToStatus(row.condition),
    priority: undefined,
  };
}

// ---------- Merged Asset collection ----------

export const ASSETS: Asset[] = [
  ...TMS_TRACK_ASSETS.map(tmsToAsset),
  ...SMMS_SIGNALLING_ASSETS.map(smmsToAsset),
  ...TDMS_TRACTION_ASSETS.map(tdmsToAsset),
];

export const ASSETS_BY_ID: Record<string, Asset> = Object.fromEntries(
  ASSETS.map((a) => [a.id, a])
);

export function assetsBySection(sectionId: string): Asset[] {
  return ASSETS.filter((a) => a.section === sectionId);
}

export function assetsByDepartment(dept: Department): Asset[] {
  return ASSETS.filter((a) => a.department === dept);
}

/**
 * Average health for a section — used by CorridorStrip and RailwayMap.
 * Returns 100 for empty sections (matches existing UI behaviour).
 */
export function sectionHealth(sectionId: string): number {
  const list = assetsBySection(sectionId);
  if (!list.length) return 100;
  return Math.round(list.reduce((s, a) => s + a.health, 0) / list.length);
}

/** Count assets that warrant attention on a section. */
export function sectionCriticalCount(sectionId: string): number {
  return assetsBySection(sectionId).filter(
    (a) => a.health < 60 || a.criticality === "CRITICAL" || a.defectStatus === "CRITICAL"
  ).length;
}