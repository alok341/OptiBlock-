// ============================================================
// Adapter — ai_predictions.csv → UI AIPrediction model
// + section-level risk lookups + priority helpers.
// ============================================================

import { AI_PREDICTIONS, type AIPredictionRow } from "../raw/aiPredictions";
import type { AIPrediction, Asset } from "../../types";
import { ASSETS_BY_ID } from "./assets";

// ---------- Normalization ----------

function normalizeAssetType(raw: string): AIPrediction["assetType"] {
  const v = raw.trim().toLowerCase();
  if (v === "signal") return "Signal";
  if (v === "traction") return "Traction";
  return "Track";
}

function normalizePriorityLevel(raw: string): AIPrediction["priorityLevel"] {
  const v = raw.trim().toLowerCase();
  if (v === "critical") return "Critical";
  if (v === "high") return "High";
  if (v === "medium") return "Medium";
  return "Low";
}

// ---------- Adapter ----------

function toPrediction(row: AIPredictionRow): AIPrediction {
  return {
    predictionId: row.prediction_id,
    assetId: row.asset_id,
    assetType: normalizeAssetType(row.asset_type),
    sectionId: row.section_id,
    riskScore: row.risk_score,
    healthScore: row.health_score,
    priorityScore: row.priority_score,
    priorityLevel: normalizePriorityLevel(row.priority_level),
    predictedFailure: row.predicted_failure.trim().toLowerCase() === "yes",
    predictionConfidence: row.prediction_confidence,
    predictionTimestamp: row.prediction_timestamp,
  };
}

export const AI_PREDICTIONS_UI: AIPrediction[] = AI_PREDICTIONS.map(toPrediction);

export const AI_BY_ASSET: Record<string, AIPrediction> = Object.fromEntries(
  AI_PREDICTIONS_UI.map((p) => [p.assetId, p])
);

// ---------- Section-level rollups ----------

/**
 * Highest-priority prediction for a section. Used by CorridorStrip / RailwayMap
 * and the Overview "Where?" panel.
 */
export function topPredictionForSection(
  sectionId: string
): AIPrediction | undefined {
  return AI_PREDICTIONS_UI.filter((p) => p.sectionId === sectionId).sort(
    (a, b) => b.priorityScore - a.priorityScore
  )[0];
}

/** All predictions for a section. */
export function predictionsForSection(sectionId: string): AIPrediction[] {
  return AI_PREDICTIONS_UI.filter((p) => p.sectionId === sectionId);
}

/** Average risk for a section (0–100). */
export function sectionRisk(sectionId: string): number {
  const list = predictionsForSection(sectionId);
  if (!list.length) return 0;
  return Math.round(list.reduce((s, p) => s + p.riskScore, 0) / list.length);
}

/** Highest risk_score across all sections — used for Admin / system health. */
export function highestRisk(): AIPrediction | undefined {
  return [...AI_PREDICTIONS_UI].sort((a, b) => b.riskScore - a.riskScore)[0];
}

/** Assets where the AI has flagged predicted failure. */
export function predictedFailures(): AIPrediction[] {
  return AI_PREDICTIONS_UI.filter((p) => p.predictedFailure);
}

// ---------- Enriched asset view ----------

export interface EnrichedAsset extends Asset {
  ai?: AIPrediction;
}

/**
 * Merge AI predictions into assets for the RailwayHealth and Maintenance pages.
 */
export const ENRICHED_ASSETS: EnrichedAsset[] = Object.values(ASSETS_BY_ID).map(
  (a) => ({ ...a, ai: AI_BY_ASSET[a.id] })
);

export function enrichAsset(assetId: string): EnrichedAsset | undefined {
  const a = ASSETS_BY_ID[assetId];
  if (!a) return undefined;
  return { ...a, ai: AI_BY_ASSET[assetId] };
}

/**
 * Sort helper — assets by AI priority, falling back to intrinsic priority.
 */
export function sortAssetsByPriority(list: EnrichedAsset[]): EnrichedAsset[] {
  return [...list].sort((a, b) => {
    const pa = a.ai?.priorityScore ?? a.priority ?? 0;
    const pb = b.ai?.priorityScore ?? b.priority ?? 0;
    return pb - pa;
  });
}

// ---------- Anchor demo helpers ----------

/** The single AI prediction that anchors the demo narrative. */
export const ANCHOR_PREDICTION = AI_PREDICTIONS_UI.find(
  (p) => p.assetId === "TRK-104"
);

/** Section that the anchor prediction belongs to. */
export const ANCHOR_SECTION_ID = ANCHOR_PREDICTION?.sectionId ?? "SEC-102";

/** Anchor asset. */
export const ANCHOR_ASSET_ID = ANCHOR_PREDICTION?.assetId ?? "TRK-104";