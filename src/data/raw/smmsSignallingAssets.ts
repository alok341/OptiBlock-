// ============================================================
// Raw module — smms_signalling_assets.csv
// Preserved exact CSV column names (snake_case)
// ============================================================

export interface SmmsSignallingAssetRow {
  signal_id: string;
  section_id: string;
  signal_type: string;
  condition: string;
  fault_type: string;
  health_score: number;
  maintenance_type: string;
  estimated_duration_min: number;
  criticality: string;
}

export const SMMS_SIGNALLING_ASSETS: SmmsSignallingAssetRow[] = [
  { signal_id: "SIG-201", section_id: "SEC-109", signal_type: "Shunt",   condition: "Faulty",   fault_type: "Signal communication fault",     health_score: 6,   maintenance_type: "Routine",    estimated_duration_min: 86,  criticality: "High"     },
  { signal_id: "SIG-202", section_id: "SEC-110", signal_type: "Distant", condition: "Faulty",   fault_type: "Aspect indication fault",        health_score: 70,  maintenance_type: "Routine",    estimated_duration_min: 56,  criticality: "Critical" },
  { signal_id: "SIG-203", section_id: "SEC-108", signal_type: "Distant", condition: "Healthy",  fault_type: "None",                           health_score: 70,  maintenance_type: "Routine",    estimated_duration_min: 90,  criticality: "Critical" },
  { signal_id: "SIG-204", section_id: "SEC-102", signal_type: "Starter", condition: "Healthy",  fault_type: "None",                           health_score: 63,  maintenance_type: "Urgent",     estimated_duration_min: 57,  criticality: "High"     },
  { signal_id: "SIG-205", section_id: "SEC-107", signal_type: "Starter", condition: "Faulty",   fault_type: "Aspect indication fault",        health_score: 49,  maintenance_type: "Routine",    estimated_duration_min: 96,  criticality: "Medium"   },
  { signal_id: "SIG-206", section_id: "SEC-102", signal_type: "Home",    condition: "Healthy",  fault_type: "None",                           health_score: 36,  maintenance_type: "Urgent",     estimated_duration_min: 58,  criticality: "Critical" },
  { signal_id: "SIG-207", section_id: "SEC-103", signal_type: "Shunt",   condition: "Healthy",  fault_type: "None",                           health_score: 58,  maintenance_type: "Corrective", estimated_duration_min: 44,  criticality: "Medium"   },
  { signal_id: "SIG-208", section_id: "SEC-110", signal_type: "Shunt",   condition: "Healthy",  fault_type: "None",                           health_score: 90,  maintenance_type: "Corrective", estimated_duration_min: 69,  criticality: "Medium"   },
  { signal_id: "SIG-209", section_id: "SEC-108", signal_type: "Home",    condition: "Critical", fault_type: "Interlocking interface fault",   health_score: 56,  maintenance_type: "Routine",    estimated_duration_min: 87,  criticality: "Critical" },
  { signal_id: "SIG-210", section_id: "SEC-101", signal_type: "Home",    condition: "Degraded", fault_type: "Communication intermittent",     health_score: 60,  maintenance_type: "Corrective", estimated_duration_min: 63,  criticality: "Critical" },
  { signal_id: "SIG-211", section_id: "SEC-102", signal_type: "Home",    condition: "Faulty",   fault_type: "Track circuit interface fault",  health_score: 79,  maintenance_type: "Routine",    estimated_duration_min: 50,  criticality: "High"     },
  { signal_id: "SIG-212", section_id: "SEC-104", signal_type: "Shunt",   condition: "Degraded", fault_type: "Communication intermittent",     health_score: 21,  maintenance_type: "Urgent",     estimated_duration_min: 58,  criticality: "Low"      },
  { signal_id: "SIG-213", section_id: "SEC-101", signal_type: "Distant", condition: "Healthy",  fault_type: "None",                           health_score: 55,  maintenance_type: "Routine",    estimated_duration_min: 51,  criticality: "Critical" },
  { signal_id: "SIG-214", section_id: "SEC-110", signal_type: "Home",    condition: "Degraded", fault_type: "Lamp degradation",               health_score: 78,  maintenance_type: "Corrective", estimated_duration_min: 99,  criticality: "Medium"   },
  { signal_id: "SIG-215", section_id: "SEC-108", signal_type: "Distant", condition: "Faulty",   fault_type: "Aspect indication fault",        health_score: 58,  maintenance_type: "Corrective", estimated_duration_min: 105, criticality: "Low"      },
  { signal_id: "SIG-216", section_id: "SEC-108", signal_type: "Distant", condition: "Faulty",   fault_type: "Aspect indication fault",        health_score: 75,  maintenance_type: "Corrective", estimated_duration_min: 101, criticality: "Critical" },
  { signal_id: "SIG-217", section_id: "SEC-105", signal_type: "Shunt",   condition: "Degraded", fault_type: "Communication intermittent",     health_score: 13,  maintenance_type: "Routine",    estimated_duration_min: 68,  criticality: "High"     },
  { signal_id: "SIG-218", section_id: "SEC-110", signal_type: "Distant", condition: "Healthy",  fault_type: "None",                           health_score: 1,   maintenance_type: "Urgent",     estimated_duration_min: 107, criticality: "Low"      },
  { signal_id: "SIG-219", section_id: "SEC-110", signal_type: "Starter", condition: "Degraded", fault_type: "Communication intermittent",     health_score: 81,  maintenance_type: "Routine",    estimated_duration_min: 99,  criticality: "High"     },
  { signal_id: "SIG-220", section_id: "SEC-103", signal_type: "Home",    condition: "Degraded", fault_type: "Lamp degradation",               health_score: 74,  maintenance_type: "Corrective", estimated_duration_min: 113, criticality: "Medium"   },
  { signal_id: "SIG-221", section_id: "SEC-102", signal_type: "Starter", condition: "Faulty",   fault_type: "Signal communication fault",     health_score: 25,  maintenance_type: "Routine",    estimated_duration_min: 120, criticality: "High"     },
  { signal_id: "SIG-222", section_id: "SEC-109", signal_type: "Shunt",   condition: "Degraded", fault_type: "Communication intermittent",     health_score: 37,  maintenance_type: "Urgent",     estimated_duration_min: 63,  criticality: "Low"      },
  { signal_id: "SIG-223", section_id: "SEC-108", signal_type: "Distant", condition: "Critical", fault_type: "Interlocking interface fault",   health_score: 11,  maintenance_type: "Corrective", estimated_duration_min: 21,  criticality: "High"     },
  { signal_id: "SIG-224", section_id: "SEC-109", signal_type: "Shunt",   condition: "Healthy",  fault_type: "None",                           health_score: 81,  maintenance_type: "Corrective", estimated_duration_min: 33,  criticality: "Medium"   },
  { signal_id: "SIG-225", section_id: "SEC-108", signal_type: "Home",    condition: "Healthy",  fault_type: "None",                           health_score: 81,  maintenance_type: "Corrective", estimated_duration_min: 109, criticality: "High"     },
  { signal_id: "SIG-226", section_id: "SEC-107", signal_type: "Shunt",   condition: "Healthy",  fault_type: "None",                           health_score: 14,  maintenance_type: "Routine",    estimated_duration_min: 50,  criticality: "Medium"   },
  { signal_id: "SIG-227", section_id: "SEC-107", signal_type: "Shunt",   condition: "Degraded", fault_type: "Communication intermittent",     health_score: 83,  maintenance_type: "Routine",    estimated_duration_min: 82,  criticality: "Critical" },
  { signal_id: "SIG-228", section_id: "SEC-105", signal_type: "Shunt",   condition: "Healthy",  fault_type: "None",                           health_score: 30,  maintenance_type: "Corrective", estimated_duration_min: 32,  criticality: "High"     },
  { signal_id: "SIG-229", section_id: "SEC-109", signal_type: "Distant", condition: "Faulty",   fault_type: "Aspect indication fault",        health_score: 24,  maintenance_type: "Routine",    estimated_duration_min: 78,  criticality: "Low"      },
  { signal_id: "SIG-230", section_id: "SEC-104", signal_type: "Starter", condition: "Degraded", fault_type: "Lamp degradation",               health_score: 16,  maintenance_type: "Urgent",     estimated_duration_min: 46,  criticality: "Low"      },
  { signal_id: "SIG-231", section_id: "SEC-109", signal_type: "Starter", condition: "Healthy",  fault_type: "None",                           health_score: 100, maintenance_type: "Urgent",     estimated_duration_min: 20,  criticality: "High"     },
  { signal_id: "SIG-232", section_id: "SEC-103", signal_type: "Home",    condition: "Critical", fault_type: "Signal failure",                 health_score: 16,  maintenance_type: "Routine",    estimated_duration_min: 65,  criticality: "Medium"   },
  { signal_id: "SIG-233", section_id: "SEC-110", signal_type: "Starter", condition: "Healthy",  fault_type: "None",                           health_score: 94,  maintenance_type: "Corrective", estimated_duration_min: 87,  criticality: "Low"      },
  { signal_id: "SIG-234", section_id: "SEC-102", signal_type: "Shunt",   condition: "Degraded", fault_type: "Communication intermittent",     health_score: 64,  maintenance_type: "Routine",    estimated_duration_min: 98,  criticality: "Low"      },
  { signal_id: "SIG-235", section_id: "SEC-109", signal_type: "Shunt",   condition: "Healthy",  fault_type: "None",                           health_score: 54,  maintenance_type: "Urgent",     estimated_duration_min: 33,  criticality: "Critical" },
  { signal_id: "SIG-236", section_id: "SEC-108", signal_type: "Home",    condition: "Healthy",  fault_type: "None",                           health_score: 16,  maintenance_type: "Corrective", estimated_duration_min: 99,  criticality: "High"     },
  { signal_id: "SIG-237", section_id: "SEC-107", signal_type: "Home",    condition: "Critical", fault_type: "Interlocking interface fault",   health_score: 89,  maintenance_type: "Routine",    estimated_duration_min: 103, criticality: "Medium"   },
  { signal_id: "SIG-238", section_id: "SEC-107", signal_type: "Shunt",   condition: "Degraded", fault_type: "Lamp degradation",               health_score: 51,  maintenance_type: "Corrective", estimated_duration_min: 113, criticality: "Low"      },
  { signal_id: "SIG-239", section_id: "SEC-106", signal_type: "Shunt",   condition: "Healthy",  fault_type: "None",                           health_score: 8,   maintenance_type: "Routine",    estimated_duration_min: 30,  criticality: "Low"      },
  { signal_id: "SIG-240", section_id: "SEC-107", signal_type: "Distant", condition: "Healthy",  fault_type: "None",                           health_score: 85,  maintenance_type: "Routine",    estimated_duration_min: 72,  criticality: "High"     },
  { signal_id: "SIG-241", section_id: "SEC-107", signal_type: "Distant", condition: "Faulty",   fault_type: "Track circuit interface fault",  health_score: 13,  maintenance_type: "Urgent",     estimated_duration_min: 84,  criticality: "Medium"   },
  { signal_id: "SIG-242", section_id: "SEC-103", signal_type: "Distant", condition: "Degraded", fault_type: "Lamp degradation",               health_score: 14,  maintenance_type: "Corrective", estimated_duration_min: 93,  criticality: "Medium"   },
  { signal_id: "SIG-243", section_id: "SEC-107", signal_type: "Home",    condition: "Faulty",   fault_type: "Signal communication fault",     health_score: 23,  maintenance_type: "Corrective", estimated_duration_min: 109, criticality: "High"     },
  { signal_id: "SIG-244", section_id: "SEC-106", signal_type: "Home",    condition: "Healthy",  fault_type: "None",                           health_score: 18,  maintenance_type: "Urgent",     estimated_duration_min: 101, criticality: "Low"      },
  { signal_id: "SIG-245", section_id: "SEC-102", signal_type: "Shunt",   condition: "Degraded", fault_type: "Lamp degradation",               health_score: 43,  maintenance_type: "Routine",    estimated_duration_min: 67,  criticality: "High"     },
  { signal_id: "SIG-246", section_id: "SEC-106", signal_type: "Starter", condition: "Faulty",   fault_type: "Aspect indication fault",        health_score: 96,  maintenance_type: "Urgent",     estimated_duration_min: 26,  criticality: "Low"      },
  { signal_id: "SIG-247", section_id: "SEC-105", signal_type: "Shunt",   condition: "Healthy",  fault_type: "None",                           health_score: 34,  maintenance_type: "Routine",    estimated_duration_min: 116, criticality: "Low"      },
  { signal_id: "SIG-248", section_id: "SEC-106", signal_type: "Distant", condition: "Healthy",  fault_type: "None",                           health_score: 5,   maintenance_type: "Routine",    estimated_duration_min: 70,  criticality: "Low"      },
  { signal_id: "SIG-249", section_id: "SEC-101", signal_type: "Distant", condition: "Healthy",  fault_type: "None",                           health_score: 41,  maintenance_type: "Routine",    estimated_duration_min: 20,  criticality: "Critical" },
  { signal_id: "SIG-250", section_id: "SEC-107", signal_type: "Distant", condition: "Healthy",  fault_type: "None",                           health_score: 9,   maintenance_type: "Corrective", estimated_duration_min: 114, criticality: "Low"      },
  { signal_id: "SIG-251", section_id: "SEC-107", signal_type: "Shunt",   condition: "Healthy",  fault_type: "None",                           health_score: 90,  maintenance_type: "Urgent",     estimated_duration_min: 73,  criticality: "High"     },
  { signal_id: "SIG-252", section_id: "SEC-102", signal_type: "Distant", condition: "Healthy",  fault_type: "None",                           health_score: 11,  maintenance_type: "Corrective", estimated_duration_min: 33,  criticality: "Medium"   },
  { signal_id: "SIG-253", section_id: "SEC-107", signal_type: "Distant", condition: "Degraded", fault_type: "Lamp degradation",               health_score: 28,  maintenance_type: "Corrective", estimated_duration_min: 119, criticality: "Medium"   },
  { signal_id: "SIG-254", section_id: "SEC-102", signal_type: "Distant", condition: "Degraded", fault_type: "Lamp degradation",               health_score: 44,  maintenance_type: "Urgent",     estimated_duration_min: 102, criticality: "Medium"   },
  { signal_id: "SIG-255", section_id: "SEC-104", signal_type: "Starter", condition: "Healthy",  fault_type: "None",                           health_score: 97,  maintenance_type: "Urgent",     estimated_duration_min: 29,  criticality: "Medium"   },
  { signal_id: "SIG-256", section_id: "SEC-108", signal_type: "Distant", condition: "Degraded", fault_type: "Communication intermittent",     health_score: 19,  maintenance_type: "Corrective", estimated_duration_min: 28,  criticality: "Critical" },
  { signal_id: "SIG-257", section_id: "SEC-108", signal_type: "Distant", condition: "Degraded", fault_type: "Communication intermittent",     health_score: 64,  maintenance_type: "Routine",    estimated_duration_min: 59,  criticality: "Critical" },
  { signal_id: "SIG-258", section_id: "SEC-108", signal_type: "Home",    condition: "Healthy",  fault_type: "None",                           health_score: 78,  maintenance_type: "Urgent",     estimated_duration_min: 84,  criticality: "Critical" },
  { signal_id: "SIG-259", section_id: "SEC-108", signal_type: "Distant", condition: "Degraded", fault_type: "Lamp degradation",               health_score: 77,  maintenance_type: "Corrective", estimated_duration_min: 84,  criticality: "Medium"   },
  { signal_id: "SIG-260", section_id: "SEC-101", signal_type: "Starter", condition: "Degraded", fault_type: "Communication intermittent",     health_score: 5,   maintenance_type: "Routine",    estimated_duration_min: 110, criticality: "Critical" },
];