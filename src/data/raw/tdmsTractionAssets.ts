// ============================================================
// Raw module — tdms_traction_assets.csv
// Preserved exact CSV column names (snake_case)
// ============================================================

export interface TdmsTractionAssetRow {
  traction_asset_id: string;
  section_id: string;
  component_type: string;
  condition: string;
  defect_type: string;
  load_pct: number;
  defect_severity: number;
  estimated_duration_min: number;
  criticality: string;
}

export const TDMS_TRACTION_ASSETS: TdmsTractionAssetRow[] = [
  { traction_asset_id: "OHE-301", section_id: "SEC-108", component_type: "Section Insulator", condition: "Fair", defect_type: "Insulator wear",           load_pct: 69, defect_severity: 7,  estimated_duration_min: 116, criticality: "Low"      },
  { traction_asset_id: "OHE-302", section_id: "SEC-106", component_type: "Section Insulator", condition: "Good", defect_type: "None",                     load_pct: 52, defect_severity: 10, estimated_duration_min: 68,  criticality: "High"     },
  { traction_asset_id: "OHE-303", section_id: "SEC-102", component_type: "Feeder",            condition: "Fair", defect_type: "Insulator wear",           load_pct: 36, defect_severity: 10, estimated_duration_min: 51,  criticality: "High"     },
  { traction_asset_id: "OHE-304", section_id: "SEC-109", component_type: "Feeder",            condition: "Good", defect_type: "None",                     load_pct: 85, defect_severity: 6,  estimated_duration_min: 34,  criticality: "High"     },
  { traction_asset_id: "OHE-305", section_id: "SEC-105", component_type: "Isolator",          condition: "Good", defect_type: "None",                     load_pct: 48, defect_severity: 3,  estimated_duration_min: 69,  criticality: "Low"      },
  { traction_asset_id: "OHE-306", section_id: "SEC-105", component_type: "Section Insulator", condition: "Poor", defect_type: "Insulator deterioration",  load_pct: 99, defect_severity: 3,  estimated_duration_min: 126, criticality: "Medium"   },
  { traction_asset_id: "OHE-307", section_id: "SEC-103", component_type: "Catenary",          condition: "Good", defect_type: "None",                     load_pct: 72, defect_severity: 6,  estimated_duration_min: 90,  criticality: "Critical" },
  { traction_asset_id: "OHE-308", section_id: "SEC-110", component_type: "Section Insulator", condition: "Good", defect_type: "None",                     load_pct: 80, defect_severity: 4,  estimated_duration_min: 124, criticality: "Critical" },
  { traction_asset_id: "OHE-309", section_id: "SEC-108", component_type: "Isolator",          condition: "Poor", defect_type: "Insulator deterioration",  load_pct: 45, defect_severity: 10, estimated_duration_min: 65,  criticality: "High"     },
  { traction_asset_id: "OHE-310", section_id: "SEC-101", component_type: "Catenary",          condition: "Fair", defect_type: "Minor contact wear",       load_pct: 56, defect_severity: 2,  estimated_duration_min: 71,  criticality: "High"     },
  { traction_asset_id: "OHE-311", section_id: "SEC-108", component_type: "Isolator",          condition: "Poor", defect_type: "Pantograph contact issue", load_pct: 77, defect_severity: 6,  estimated_duration_min: 36,  criticality: "Critical" },
  { traction_asset_id: "OHE-312", section_id: "SEC-101", component_type: "Catenary",          condition: "Good", defect_type: "None",                     load_pct: 67, defect_severity: 4,  estimated_duration_min: 37,  criticality: "High"     },
  { traction_asset_id: "OHE-313", section_id: "SEC-102", component_type: "Catenary",          condition: "Poor", defect_type: "OHE component wear",       load_pct: 56, defect_severity: 8,  estimated_duration_min: 65,  criticality: "Critical" },
  { traction_asset_id: "OHE-314", section_id: "SEC-108", component_type: "Isolator",          condition: "Fair", defect_type: "Insulator wear",           load_pct: 39, defect_severity: 9,  estimated_duration_min: 165, criticality: "Critical" },
  { traction_asset_id: "OHE-315", section_id: "SEC-102", component_type: "Catenary",          condition: "Poor", defect_type: "Pantograph contact issue", load_pct: 50, defect_severity: 7,  estimated_duration_min: 147, criticality: "Low"      },
  { traction_asset_id: "OHE-316", section_id: "SEC-102", component_type: "Isolator",          condition: "Poor", defect_type: "Insulator deterioration",  load_pct: 38, defect_severity: 5,  estimated_duration_min: 139, criticality: "Low"      },
  { traction_asset_id: "OHE-317", section_id: "SEC-110", component_type: "Section Insulator", condition: "Good", defect_type: "None",                     load_pct: 28, defect_severity: 9,  estimated_duration_min: 169, criticality: "Low"      },
  { traction_asset_id: "OHE-318", section_id: "SEC-107", component_type: "Section Insulator", condition: "Poor", defect_type: "Insulator deterioration",  load_pct: 52, defect_severity: 1,  estimated_duration_min: 121, criticality: "Low"      },
  { traction_asset_id: "OHE-319", section_id: "SEC-106", component_type: "Isolator",          condition: "Good", defect_type: "None",                     load_pct: 25, defect_severity: 6,  estimated_duration_min: 169, criticality: "High"     },
  { traction_asset_id: "OHE-320", section_id: "SEC-103", component_type: "Isolator",          condition: "Poor", defect_type: "Insulator deterioration",  load_pct: 37, defect_severity: 2,  estimated_duration_min: 147, criticality: "Low"      },
  { traction_asset_id: "OHE-321", section_id: "SEC-105", component_type: "Section Insulator", condition: "Good", defect_type: "None",                     load_pct: 85, defect_severity: 7,  estimated_duration_min: 169, criticality: "Critical" },
  { traction_asset_id: "OHE-322", section_id: "SEC-105", component_type: "Catenary",          condition: "Good", defect_type: "None",                     load_pct: 62, defect_severity: 5,  estimated_duration_min: 61,  criticality: "High"     },
  { traction_asset_id: "OHE-323", section_id: "SEC-107", component_type: "Isolator",          condition: "Poor", defect_type: "Pantograph contact issue", load_pct: 83, defect_severity: 8,  estimated_duration_min: 124, criticality: "High"     },
  { traction_asset_id: "OHE-324", section_id: "SEC-102", component_type: "Section Insulator", condition: "Fair", defect_type: "Insulator wear",           load_pct: 61, defect_severity: 2,  estimated_duration_min: 50,  criticality: "High"     },
  { traction_asset_id: "OHE-325", section_id: "SEC-105", component_type: "Section Insulator", condition: "Good", defect_type: "None",                     load_pct: 77, defect_severity: 1,  estimated_duration_min: 120, criticality: "Critical" },
  { traction_asset_id: "OHE-326", section_id: "SEC-105", component_type: "Section Insulator", condition: "Fair", defect_type: "Insulator wear",           load_pct: 85, defect_severity: 3,  estimated_duration_min: 37,  criticality: "Medium"   },
  { traction_asset_id: "OHE-327", section_id: "SEC-110", component_type: "Catenary",          condition: "Fair", defect_type: "Minor contact wear",       load_pct: 50, defect_severity: 6,  estimated_duration_min: 122, criticality: "Critical" },
  { traction_asset_id: "OHE-328", section_id: "SEC-110", component_type: "Section Insulator", condition: "Good", defect_type: "None",                     load_pct: 67, defect_severity: 8,  estimated_duration_min: 49,  criticality: "Medium"   },
  { traction_asset_id: "OHE-329", section_id: "SEC-109", component_type: "Isolator",          condition: "Good", defect_type: "None",                     load_pct: 34, defect_severity: 1,  estimated_duration_min: 77,  criticality: "Critical" },
  { traction_asset_id: "OHE-330", section_id: "SEC-109", component_type: "Feeder",            condition: "Good", defect_type: "None",                     load_pct: 47, defect_severity: 10, estimated_duration_min: 103, criticality: "Critical" },
  { traction_asset_id: "OHE-331", section_id: "SEC-104", component_type: "Feeder",            condition: "Good", defect_type: "None",                     load_pct: 31, defect_severity: 6,  estimated_duration_min: 118, criticality: "Low"      },
  { traction_asset_id: "OHE-332", section_id: "SEC-109", component_type: "Section Insulator", condition: "Fair", defect_type: "Minor contact wear",       load_pct: 85, defect_severity: 4,  estimated_duration_min: 61,  criticality: "Medium"   },
  { traction_asset_id: "OHE-333", section_id: "SEC-103", component_type: "Section Insulator", condition: "Good", defect_type: "None",                     load_pct: 79, defect_severity: 9,  estimated_duration_min: 63,  criticality: "Low"      },
  { traction_asset_id: "OHE-334", section_id: "SEC-102", component_type: "Feeder",            condition: "Good", defect_type: "None",                     load_pct: 93, defect_severity: 2,  estimated_duration_min: 62,  criticality: "High"     },
  { traction_asset_id: "OHE-335", section_id: "SEC-102", component_type: "Isolator",          condition: "Fair", defect_type: "Minor contact wear",       load_pct: 75, defect_severity: 9,  estimated_duration_min: 44,  criticality: "Low"      },
  { traction_asset_id: "OHE-336", section_id: "SEC-109", component_type: "Isolator",          condition: "Good", defect_type: "None",                     load_pct: 64, defect_severity: 9,  estimated_duration_min: 102, criticality: "Low"      },
  { traction_asset_id: "OHE-337", section_id: "SEC-105", component_type: "Catenary",          condition: "Good", defect_type: "None",                     load_pct: 84, defect_severity: 3,  estimated_duration_min: 178, criticality: "Medium"   },
  { traction_asset_id: "OHE-338", section_id: "SEC-103", component_type: "Catenary",          condition: "Fair", defect_type: "Minor contact wear",       load_pct: 30, defect_severity: 1,  estimated_duration_min: 177, criticality: "High"     },
  { traction_asset_id: "OHE-339", section_id: "SEC-104", component_type: "Feeder",            condition: "Poor", defect_type: "Insulator deterioration",  load_pct: 100, defect_severity: 9, estimated_duration_min: 104, criticality: "High"     },
  { traction_asset_id: "OHE-340", section_id: "SEC-108", component_type: "Catenary",          condition: "Good", defect_type: "None",                     load_pct: 27, defect_severity: 3,  estimated_duration_min: 142, criticality: "Critical" },
  { traction_asset_id: "OHE-341", section_id: "SEC-108", component_type: "Section Insulator", condition: "Fair", defect_type: "Minor contact wear",       load_pct: 60, defect_severity: 6,  estimated_duration_min: 132, criticality: "Medium"   },
  { traction_asset_id: "OHE-342", section_id: "SEC-106", component_type: "Feeder",            condition: "Fair", defect_type: "Insulator wear",           load_pct: 35, defect_severity: 5,  estimated_duration_min: 145, criticality: "Medium"   },
  { traction_asset_id: "OHE-343", section_id: "SEC-103", component_type: "Isolator",          condition: "Good", defect_type: "None",                     load_pct: 40, defect_severity: 6,  estimated_duration_min: 177, criticality: "High"     },
  { traction_asset_id: "OHE-344", section_id: "SEC-104", component_type: "Feeder",            condition: "Poor", defect_type: "Insulator deterioration",  load_pct: 59, defect_severity: 8,  estimated_duration_min: 35,  criticality: "Low"      },
  { traction_asset_id: "OHE-345", section_id: "SEC-107", component_type: "Catenary",          condition: "Fair", defect_type: "Insulator wear",           load_pct: 26, defect_severity: 5,  estimated_duration_min: 156, criticality: "Critical" },
  { traction_asset_id: "OHE-346", section_id: "SEC-105", component_type: "Section Insulator", condition: "Fair", defect_type: "Insulator wear",           load_pct: 66, defect_severity: 7,  estimated_duration_min: 123, criticality: "Low"      },
  { traction_asset_id: "OHE-347", section_id: "SEC-107", component_type: "Catenary",          condition: "Good", defect_type: "None",                     load_pct: 69, defect_severity: 9,  estimated_duration_min: 145, criticality: "High"     },
  { traction_asset_id: "OHE-348", section_id: "SEC-110", component_type: "Feeder",            condition: "Fair", defect_type: "Insulator wear",           load_pct: 67, defect_severity: 6,  estimated_duration_min: 172, criticality: "High"     },
  { traction_asset_id: "OHE-349", section_id: "SEC-103", component_type: "Catenary",          condition: "Good", defect_type: "None",                     load_pct: 24, defect_severity: 3,  estimated_duration_min: 115, criticality: "Critical" },
  { traction_asset_id: "OHE-350", section_id: "SEC-109", component_type: "Isolator",          condition: "Fair", defect_type: "Insulator wear",           load_pct: 70, defect_severity: 10, estimated_duration_min: 106, criticality: "High"     },
];