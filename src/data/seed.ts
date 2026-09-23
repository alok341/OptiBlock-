// ============================================================
// OPTIBLOCK — Unified seed
// Re-exports every adapter + provides convenience groupings
// that pages and components can import directly.
//
// RULE: nothing in this file contains hardcoded fake data.
// Everything flows from the 17 CSVs in /src/data/raw.
// ============================================================

// ---------- Sections / map ----------
export {
  SECTIONS,
  SECTIONS_BY_ID,
  STATION_EDGES,
  UNIQUE_STATIONS,
  RAW_SECTIONS,
} from "./adapters/sections";
export type { UISection, StationEdge } from "./adapters/sections";

// ---------- Assets ----------
export {
  ASSETS,
  ASSETS_BY_ID,
  assetsBySection,
  assetsByDepartment,
  sectionHealth,
  sectionCriticalCount,
} from "./adapters/assets";

// ---------- Maintenance tasks ----------
export {
  MAINTENANCE_TASKS,
  MAINTENANCE_TASKS_BY_ID,
  tasksBySection,
  tasksByAsset,
  tasksByDepartment,
  topPriorityTasks,
} from "./adapters/tasks";

// ---------- Blocks / windows / plans ----------
export {
  BLOCK_REQUESTS,
  BLOCK_REQUESTS_BY_ID,
  blocksBySection,
  blocksByStatus,
  pendingBlockRequests,
  recommendedBlockRequests,
  FEASIBLE_WINDOWS,
  FEASIBLE_WINDOWS_BY_REQUEST,
  OPTIMIZED_PLANS,
  OPTIMIZED_PLANS_BY_REQUEST,
  ANCHOR_BLOCK_REQUEST_ID,
  getAnchorBlockChain,
} from "./adapters/blocks";

// ---------- Trains / goods ----------
export {
  TRAINS,
  TRAINS_BY_NO,
  LIVE_TRAINS,
  LIVE_TRAINS_BY_SECTION,
  delayedTrains,
  GOODS_FORECAST,
  goodsForecastBySection,
  trafficIntensity,
  findTrainConflicts,
} from "./adapters/trains";

// ---------- Crews ----------
export {
  CREWS,
  CREWS_BY_ID,
  crewsByDepartment,
  availableCrews,
  pickCrewForDepartment,
  crewSummary,
} from "./adapters/crews";

// ---------- AI / intelligence ----------
export {
  AI_PREDICTIONS_UI,
  AI_BY_ASSET,
  topPredictionForSection,
  predictionsForSection,
  sectionRisk,
  highestRisk,
  predictedFailures,
  ENRICHED_ASSETS,
  enrichAsset,
  sortAssetsByPriority,
  ANCHOR_PREDICTION,
  ANCHOR_SECTION_ID,
  ANCHOR_ASSET_ID,
} from "./adapters/intelligence";
export type { EnrichedAsset } from "./adapters/intelligence";

// ---------- Constraints / corridor / history ----------
export {
  CONSTRAINTS,
  constraintsForSection,
  constraintTypes,
  CORRIDOR_SLOTS,
  corridorForSection,
  corridorSummary,
  corridorDates,
  isWindowAvailable,
  HISTORICAL_PLANS,
  historyForSection,
  historyKpis,
  cancelledPlans,
} from "./adapters/constraints";
export type { CorridorSummary, HistoryKpis } from "./adapters/constraints";

// ---------- Live events ----------
// (thin pass-through — the raw rows are already UI-shaped enough;
//  we expose them via a dedicated adapter for consistency.)

import { LIVE_EVENTS, type LiveEventRow } from "./raw/liveEvents";
import type { LiveEvent } from "../types";

function normalizeEventType(raw: string): LiveEvent["eventType"] {
  const v = raw.trim();
  if (v === "Train Delay")            return "Train Delay";
  if (v === "New Critical Defect")    return "New Critical Defect";
  if (v === "Block Cancelled")        return "Block Cancelled";
  if (v === "Corridor Unavailable")   return "Corridor Unavailable";
  if (v === "Updated Train Movement") return "Updated Train Movement";
  return "Updated Train Movement";
}

function normalizeEventSeverity(raw: string): LiveEvent["severity"] {
  const v = raw.trim().toLowerCase();
  if (v === "critical") return "Critical";
  if (v === "high")     return "High";
  if (v === "medium")   return "Medium";
  return "Low";
}

function normalizeEventStatus(raw: string): LiveEvent["status"] {
  const v = raw.trim().toLowerCase();
  if (v === "active")     return "Active";
  if (v === "resolved")   return "Resolved";
  return "Monitoring";
}

function toLiveEvent(r: LiveEventRow): LiveEvent {
  return {
    eventId: r.event_id,
    timestamp: r.timestamp,
    eventType: normalizeEventType(r.event_type),
    sectionId: r.section_id,
    trainNo: r.train_no || undefined,
    assetId: r.asset_id || undefined,
    severity: normalizeEventSeverity(r.severity),
    description: r.description,
    status: normalizeEventStatus(r.status),
  };
}

export const LIVE_EVENTS_UI: LiveEvent[] = LIVE_EVENTS.map(toLiveEvent);

export function eventsForSection(sectionId: string): LiveEvent[] {
  return LIVE_EVENTS_UI.filter((e) => e.sectionId === sectionId);
}

export function activeEvents(): LiveEvent[] {
  return LIVE_EVENTS_UI.filter((e) => e.status === "Active");
}

/** The single live event that anchors the demo narrative. */
export const ANCHOR_LIVE_EVENT = LIVE_EVENTS_UI.find(
  (e) => e.eventId === "EVT-002"
);

// ---------- Anchor demo chain ----------
// Re-exported as one call so DemoMode / Overview can pull everything in one go.
import { getAnchorBlockChain } from "./adapters/blocks";
import { ANCHOR_PREDICTION, ANCHOR_SECTION_ID, ANCHOR_ASSET_ID } from "./adapters/intelligence";

export const ANCHOR_CHAIN = {
  sectionId: ANCHOR_SECTION_ID,
  assetId: ANCHOR_ASSET_ID,
  prediction: ANCHOR_PREDICTION,
  blockChain: getAnchorBlockChain(),
  liveEvent: ANCHOR_LIVE_EVENT,
};