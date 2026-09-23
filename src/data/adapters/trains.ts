// ============================================================
// Adapter — train_timetable.csv + live_train_movement.csv
//          + goods_train_forecast.csv → UI Train / LiveTrain / GoodsForecast
// ============================================================

import {
  TRAIN_TIMETABLE,
  type TrainTimetableRow,
} from "../raw/trainTimetable";
import {
  LIVE_TRAIN_MOVEMENT,
  type LiveTrainMovementRow,
} from "../raw/liveTrainMovement";
import {
  GOODS_TRAIN_FORECAST,
  type GoodsTrainForecastRow,
} from "../raw/goodsTrainForecast";
import type {
  Train,
  TrainType,
  TrainStatus,
  LiveTrain,
  GoodsForecast,
} from "../../types";

// ---------- Normalization ----------

function normalizeTrainType(raw: string): TrainType {
  const v = raw.trim().toLowerCase();
  if (v === "express")   return "EXPRESS";
  if (v === "mail")      return "MAIL";
  if (v === "goods")     return "GOODS";
  if (v === "passenger") return "PASSENGER";
  return "SUBURBAN";
}

function normalizeDirection(raw: string): "UP" | "DOWN" {
  return raw.trim().toLowerCase() === "up" ? "UP" : "DOWN";
}

/** Derive a friendly name from the section + type since CSV has no train names. */
const TRAIN_NAME_BY_TYPE: Record<TrainType, string> = {
  EXPRESS:  "Express",
  MAIL:     "Mail",
  GOODS:    "Goods",
  PASSENGER:"Passenger",
  SUBURBAN: "Local",
};

function trainName(type: TrainType, from: string, to: string): string {
  return `${TRAIN_NAME_BY_TYPE[type]} · ${from}–${to}`;
}

// ---------- Train (scheduled) ----------

function toTrain(row: TrainTimetableRow): Train {
  const type = normalizeTrainType(row.train_type);
  return {
    number: row.train_no,
    name: trainName(type, row.from_station, row.to_station),
    type,
    section: row.section_id,
    direction: normalizeDirection(row.direction),
    scheduledArrival: row.scheduled_arrival,
    scheduledDeparture: row.scheduled_departure,
    delay: 0,
    status: "ON_TIME",
    currentPosition: 0.5,
    speed: 0,
  };
}

export const TRAINS: Train[] = TRAIN_TIMETABLE.map(toTrain);

export const TRAINS_BY_NO: Record<string, Train[]> = (() => {
  // A train number can appear on multiple dates/sections; group as list.
  const m: Record<string, Train[]> = {};
  for (const t of TRAINS) (m[t.number] ??= []).push(t);
  return m;
})();

// ---------- Live train movement ----------

function statusFromMovement(raw: string, delay: number): TrainStatus {
  const v = raw.trim().toLowerCase();
  if (v === "delayed") return "DELAYED";
  if (v === "cancelled") return "CANCELLED";
  if (delay > 0) return "DELAYED";
  return "ON_TIME";
}

/** Fake a position from last_update time for the SVG map animation. */
function positionFromRow(_row: LiveTrainMovementRow): number {
  // Deterministic hash so positions stay stable across renders.
  const h = _row.train_no.split("").reduce((s, c) => s + c.charCodeAt(0), 0);
  return (h % 100) / 100;
}

function toLiveTrain(row: LiveTrainMovementRow): LiveTrain {
  const delay = row.delay_min;
  const type = normalizeTrainType(
    // fall back: derive from speed/status? We keep SUBURBAN default.
    // The timetable has the authoritative type; this is a best-effort.
    "Suburban"
  );
  return {
    number: row.train_no,
    name: `Train ${row.train_no}`,
    type,
    section: row.section_id,
    direction: normalizeDirection(row.direction),
    delay,
    speed: row.speed_kmph,
    status: statusFromMovement(row.movement_status, delay),
    position: positionFromRow(row),
  };
}

export const LIVE_TRAINS: LiveTrain[] = LIVE_TRAIN_MOVEMENT.map(toLiveTrain);

export const LIVE_TRAINS_BY_SECTION: Record<string, LiveTrain[]> = (() => {
  const m: Record<string, LiveTrain[]> = {};
  for (const t of LIVE_TRAINS) (m[t.section] ??= []).push(t);
  return m;
})();

/** Trains with nonzero delay. */
export function delayedTrains(): LiveTrain[] {
  return LIVE_TRAINS.filter((t) => t.delay > 0);
}

// ---------- Goods train forecast ----------

function normalizeTrafficLevel(raw: string): GoodsForecast["forecastTrafficLevel"] {
  const v = raw.trim().toLowerCase();
  if (v === "high") return "High";
  if (v === "medium") return "Medium";
  return "Low";
}

function normalizeConfidence(raw: string): GoodsForecast["confidenceStatus"] {
  return raw.trim().toLowerCase() === "confirmed" ? "Confirmed" : "Forecast";
}

export const GOODS_FORECAST: GoodsForecast[] = GOODS_TRAIN_FORECAST.map(
  (r: GoodsTrainForecastRow): GoodsForecast => ({
    forecastId: r.forecast_id,
    date: r.date,
    sectionId: r.section_id,
    expectedGoodsTrains: r.expected_goods_trains,
    forecastTrafficLevel: normalizeTrafficLevel(r.forecast_traffic_level),
    forecastWindow: r.forecast_window,
    confidenceStatus: normalizeConfidence(r.confidence_status),
  })
);

export function goodsForecastBySection(sectionId: string): GoodsForecast[] {
  return GOODS_FORECAST.filter((g) => g.sectionId === sectionId);
}

/**
 * Traffic intensity for a section: combines timetable density + goods forecast.
 * Returns "VERY LOW" | "LOW" | "MEDIUM" | "HIGH".
 */
export function trafficIntensity(
  sectionId: string
): "VERY LOW" | "LOW" | "MEDIUM" | "HIGH" {
  const scheduled = TRAINS.filter((t) => t.section === sectionId).length;
  const goods = goodsForecastBySection(sectionId).reduce(
    (s, g) => s + g.expectedGoodsTrains,
    0
  );
  const total = scheduled + goods;
  if (total <= 4) return "VERY LOW";
  if (total <= 8) return "LOW";
  if (total <= 14) return "MEDIUM";
  return "HIGH";
}

/**
 * Find conflicts between a proposed window (HH:MM–HH:MM on a given date)
 * and the timetable. Uses string-time comparison (safe within a single day).
 *
 * Returns list of train_no conflicts.
 */
export function findTrainConflicts(
  sectionId: string,
  windowStart: string,
  windowEnd: string
): Train[] {
  return TRAINS.filter((t) => {
    if (t.section !== sectionId) return false;
    const a = t.scheduledArrival;
    const d = t.scheduledDeparture;
    // Overlap: max(start, a) < min(end, d)
    return !(windowEnd <= a || windowStart >= d);
  });
}