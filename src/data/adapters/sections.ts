// ============================================================
// Adapter — railway_sections.csv → UI section model
// Also derives station sequence for the SVG railway map.
// ============================================================

import { RAILWAY_SECTIONS, type RailwaySectionRow } from "../raw/railwaySections";
import type { RailwaySectionRaw, DataSource } from "../../types";

export interface UISection {
  id: string;              // "SEC-108"
  from: string;            // "Kalyan"
  to: string;              // "Shahad"
  length: number;          // derived: constant 5 km (CSV has no length)
  trackConfiguration: string;
  trafficType: string;
  capacityTrainsPerHour: number;
  source: DataSource;      // "NET"
}

/**
 * The 17 CSVs do not provide km length. We assign a stable demo value
 * so the UI can show "X km" without lying about source data.
 */
const DEFAULT_SECTION_LENGTH_KM = 5;

function toUISection(row: RailwaySectionRow): UISection {
  return {
    id: row.section_id,
    from: row.from_station,
    to: row.to_station,
    length: DEFAULT_SECTION_LENGTH_KM,
    trackConfiguration: row.track_configuration,
    trafficType: row.traffic_type,
    capacityTrainsPerHour: row.capacity_trains_per_hour,
    source: "NET",
  };
}

export const SECTIONS: UISection[] = RAILWAY_SECTIONS.map(toUISection);

export const SECTIONS_BY_ID: Record<string, UISection> = Object.fromEntries(
  SECTIONS.map((s) => [s.id, s])
);

/**
 * Derive the station sequence for the SVG map. We compute the unique
 * ordered sequence of stations by walking sections in order, assuming
 * the CSV order is roughly the operational sequence.
 *
 * CSV order: SEC-101 → SEC-110 is Kalyan → ... → CSMT plus branch lines.
 * Because the corridor has branches (SEC-108 Kalyan–Shahad, SEC-109 Thane–Airoli,
 * SEC-110 Kurla–Vidyavihar), we cannot assume a single linear chain.
 * We therefore expose the individual station pairs and let the map component
 * lay them out.
 */
export interface StationEdge {
  sectionId: string;
  from: string;
  to: string;
}

export const STATION_EDGES: StationEdge[] = SECTIONS.map((s) => ({
  sectionId: s.id,
  from: s.from,
  to: s.to,
}));

/**
 * Unique stations in CSV order of first appearance.
 * Useful for building a map legend without depending on a rigid chain.
 */
export const UNIQUE_STATIONS: string[] = (() => {
  const seen = new Set<string>();
  const ordered: string[] = [];
  for (const s of SECTIONS) {
    if (!seen.has(s.from)) { seen.add(s.from); ordered.push(s.from); }
    if (!seen.has(s.to))   { seen.add(s.to);   ordered.push(s.to); }
  }
  return ordered;
})();

/** Raw pass-through in case a caller needs the exact CSV shape. */
export const RAW_SECTIONS: RailwaySectionRaw[] = RAILWAY_SECTIONS.map((r) => ({
  sectionId: r.section_id,
  fromStation: r.from_station,
  toStation: r.to_station,
  trackConfiguration: r.track_configuration as RailwaySectionRaw["trackConfiguration"],
  trafficType: r.traffic_type as RailwaySectionRaw["trafficType"],
  capacityTrainsPerHour: r.capacity_trains_per_hour,
}));