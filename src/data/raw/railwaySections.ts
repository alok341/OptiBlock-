// ============================================================
// Raw module — railway_sections.csv
// Preserved exact CSV column names (snake_case)
// ============================================================

export interface RailwaySectionRow {
  section_id: string;
  from_station: string;
  to_station: string;
  track_configuration: string;
  traffic_type: string;
  capacity_trains_per_hour: number;
}

export const RAILWAY_SECTIONS: RailwaySectionRow[] = [
  { section_id: "SEC-101", from_station: "Kalyan",     to_station: "Dombivli",   track_configuration: "Double",    traffic_type: "Passenger+Freight", capacity_trains_per_hour: 120 },
  { section_id: "SEC-102", from_station: "Dombivli",   to_station: "Thane",      track_configuration: "Quadruple", traffic_type: "Passenger",         capacity_trains_per_hour: 130 },
  { section_id: "SEC-103", from_station: "Thane",      to_station: "Mulund",     track_configuration: "Quadruple", traffic_type: "Passenger+Freight", capacity_trains_per_hour: 125 },
  { section_id: "SEC-104", from_station: "Mulund",     to_station: "Kurla",      track_configuration: "Quadruple", traffic_type: "Passenger+Freight", capacity_trains_per_hour: 115 },
  { section_id: "SEC-105", from_station: "Kurla",      to_station: "Sion",       track_configuration: "Quadruple", traffic_type: "Passenger",         capacity_trains_per_hour: 110 },
  { section_id: "SEC-106", from_station: "Sion",       to_station: "Dadar",      track_configuration: "Quadruple", traffic_type: "Passenger",         capacity_trains_per_hour: 105 },
  { section_id: "SEC-107", from_station: "Dadar",      to_station: "CSMT",       track_configuration: "Quadruple", traffic_type: "Passenger",         capacity_trains_per_hour: 100 },
  { section_id: "SEC-108", from_station: "Kalyan",     to_station: "Shahad",     track_configuration: "Double",    traffic_type: "Passenger+Freight", capacity_trains_per_hour: 100 },
  { section_id: "SEC-109", from_station: "Thane",      to_station: "Airoli",     track_configuration: "Double",    traffic_type: "Passenger+Freight", capacity_trains_per_hour: 90  },
  { section_id: "SEC-110", from_station: "Kurla",      to_station: "Vidyavihar", track_configuration: "Quadruple", traffic_type: "Passenger",         capacity_trains_per_hour: 95  },
];