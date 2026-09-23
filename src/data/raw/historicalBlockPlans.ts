// ============================================================
// Raw module — historical_block_plans.csv
// Preserved exact CSV column names (snake_case)
// ============================================================

export interface HistoricalBlockPlanRow {
  plan_id: string;
  plan_date: string;
  section_id: string;
  department_scope: string;
  planned_duration_min: number;
  train_delay_min: number;
  conflict_count: number;
  execution_status: string;
  completion_pct: number;
}

export const HISTORICAL_BLOCK_PLANS: HistoricalBlockPlanRow[] = [
  { plan_id: "HP-1001", plan_date: "2026-08-18", section_id: "SEC-110", department_scope: "S&T",              planned_duration_min: 197, train_delay_min: 7,  conflict_count: 2, execution_status: "Completed", completion_pct: 82 },
  { plan_id: "HP-1002", plan_date: "2026-08-06", section_id: "SEC-108", department_scope: "S&T",              planned_duration_min: 173, train_delay_min: 19, conflict_count: 4, execution_status: "Cancelled", completion_pct: 71 },
  { plan_id: "HP-1003", plan_date: "2026-08-25", section_id: "SEC-108", department_scope: "Multi-department", planned_duration_min: 80,  train_delay_min: 5,  conflict_count: 2, execution_status: "Completed", completion_pct: 62 },
  { plan_id: "HP-1004", plan_date: "2026-08-27", section_id: "SEC-101", department_scope: "Traction",         planned_duration_min: 150, train_delay_min: 7,  conflict_count: 2, execution_status: "Completed", completion_pct: 64 },
  { plan_id: "HP-1005", plan_date: "2026-08-12", section_id: "SEC-108", department_scope: "Multi-department", planned_duration_min: 221, train_delay_min: 10, conflict_count: 4, execution_status: "Completed", completion_pct: 87 },
  { plan_id: "HP-1006", plan_date: "2026-08-26", section_id: "SEC-101", department_scope: "Multi-department", planned_duration_min: 229, train_delay_min: 10, conflict_count: 4, execution_status: "Completed", completion_pct: 93 },
  { plan_id: "HP-1007", plan_date: "2026-08-07", section_id: "SEC-108", department_scope: "Multi-department", planned_duration_min: 55,  train_delay_min: 7,  conflict_count: 4, execution_status: "Completed", completion_pct: 95 },
  { plan_id: "HP-1008", plan_date: "2026-08-25", section_id: "SEC-109", department_scope: "Engineering",      planned_duration_min: 93,  train_delay_min: 9,  conflict_count: 4, execution_status: "Modified",  completion_pct: 79 },
  { plan_id: "HP-1009", plan_date: "2026-08-19", section_id: "SEC-108", department_scope: "S&T",              planned_duration_min: 153, train_delay_min: 9,  conflict_count: 1, execution_status: "Completed", completion_pct: 89 },
  { plan_id: "HP-1010", plan_date: "2026-09-11", section_id: "SEC-108", department_scope: "Engineering",      planned_duration_min: 229, train_delay_min: 16, conflict_count: 1, execution_status: "Completed", completion_pct: 97 },
  { plan_id: "HP-1011", plan_date: "2026-09-14", section_id: "SEC-109", department_scope: "S&T",              planned_duration_min: 145, train_delay_min: 13, conflict_count: 3, execution_status: "Modified",  completion_pct: 61 },
  { plan_id: "HP-1012", plan_date: "2026-08-12", section_id: "SEC-108", department_scope: "S&T",              planned_duration_min: 161, train_delay_min: 2,  conflict_count: 3, execution_status: "Cancelled", completion_pct: 70 },
  { plan_id: "HP-1013", plan_date: "2026-09-15", section_id: "SEC-102", department_scope: "Engineering",      planned_duration_min: 74,  train_delay_min: 22, conflict_count: 4, execution_status: "Cancelled", completion_pct: 65 },
  { plan_id: "HP-1014", plan_date: "2026-09-03", section_id: "SEC-107", department_scope: "S&T",              planned_duration_min: 141, train_delay_min: 17, conflict_count: 4, execution_status: "Completed", completion_pct: 70 },
  { plan_id: "HP-1015", plan_date: "2026-08-22", section_id: "SEC-110", department_scope: "S&T",              planned_duration_min: 86,  train_delay_min: 4,  conflict_count: 2, execution_status: "Completed", completion_pct: 86 },
  { plan_id: "HP-1016", plan_date: "2026-08-20", section_id: "SEC-105", department_scope: "Multi-department", planned_duration_min: 118, train_delay_min: 20, conflict_count: 2, execution_status: "Completed", completion_pct: 68 },
  { plan_id: "HP-1017", plan_date: "2026-08-13", section_id: "SEC-101", department_scope: "Traction",         planned_duration_min: 48,  train_delay_min: 14, conflict_count: 4, execution_status: "Modified",  completion_pct: 94 },
  { plan_id: "HP-1018", plan_date: "2026-08-01", section_id: "SEC-110", department_scope: "Multi-department", planned_duration_min: 105, train_delay_min: 6,  conflict_count: 4, execution_status: "Modified",  completion_pct: 86 },
  { plan_id: "HP-1019", plan_date: "2026-08-29", section_id: "SEC-102", department_scope: "Engineering",      planned_duration_min: 107, train_delay_min: 17, conflict_count: 3, execution_status: "Completed", completion_pct: 63 },
  { plan_id: "HP-1020", plan_date: "2026-08-12", section_id: "SEC-103", department_scope: "Engineering",      planned_duration_min: 212, train_delay_min: 11, conflict_count: 1, execution_status: "Completed", completion_pct: 62 },
  { plan_id: "HP-1021", plan_date: "2026-09-12", section_id: "SEC-110", department_scope: "Traction",         planned_duration_min: 129, train_delay_min: 2,  conflict_count: 1, execution_status: "Completed", completion_pct: 86 },
  { plan_id: "HP-1022", plan_date: "2026-08-12", section_id: "SEC-103", department_scope: "Traction",         planned_duration_min: 201, train_delay_min: 21, conflict_count: 2, execution_status: "Modified",  completion_pct: 97 },
  { plan_id: "HP-1023", plan_date: "2026-08-24", section_id: "SEC-101", department_scope: "Engineering",      planned_duration_min: 121, train_delay_min: 10, conflict_count: 3, execution_status: "Modified",  completion_pct: 64 },
  { plan_id: "HP-1024", plan_date: "2026-08-28", section_id: "SEC-109", department_scope: "Engineering",      planned_duration_min: 119, train_delay_min: 15, conflict_count: 2, execution_status: "Completed", completion_pct: 77 },
  { plan_id: "HP-1025", plan_date: "2026-08-22", section_id: "SEC-109", department_scope: "Multi-department", planned_duration_min: 179, train_delay_min: 6,  conflict_count: 2, execution_status: "Completed", completion_pct: 66 },
  { plan_id: "HP-1026", plan_date: "2026-09-06", section_id: "SEC-109", department_scope: "Engineering",      planned_duration_min: 168, train_delay_min: 23, conflict_count: 3, execution_status: "Modified",  completion_pct: 98 },
  { plan_id: "HP-1027", plan_date: "2026-08-21", section_id: "SEC-105", department_scope: "Traction",         planned_duration_min: 78,  train_delay_min: 19, conflict_count: 4, execution_status: "Modified",  completion_pct: 91 },
  { plan_id: "HP-1028", plan_date: "2026-08-12", section_id: "SEC-110", department_scope: "S&T",              planned_duration_min: 226, train_delay_min: 9,  conflict_count: 2, execution_status: "Completed", completion_pct: 67 },
  { plan_id: "HP-1029", plan_date: "2026-08-02", section_id: "SEC-108", department_scope: "Engineering",      planned_duration_min: 233, train_delay_min: 6,  conflict_count: 4, execution_status: "Modified",  completion_pct: 62 },
  { plan_id: "HP-1030", plan_date: "2026-08-22", section_id: "SEC-106", department_scope: "S&T",              planned_duration_min: 47,  train_delay_min: 20, conflict_count: 2, execution_status: "Cancelled", completion_pct: 76 },
  { plan_id: "HP-1031", plan_date: "2026-08-05", section_id: "SEC-105", department_scope: "Traction",         planned_duration_min: 174, train_delay_min: 17, conflict_count: 3, execution_status: "Completed", completion_pct: 67 },
  { plan_id: "HP-1032", plan_date: "2026-09-13", section_id: "SEC-106", department_scope: "Traction",         planned_duration_min: 146, train_delay_min: 23, conflict_count: 1, execution_status: "Completed", completion_pct: 72 },
  { plan_id: "HP-1033", plan_date: "2026-08-22", section_id: "SEC-106", department_scope: "Multi-department", planned_duration_min: 166, train_delay_min: 25, conflict_count: 1, execution_status: "Completed", completion_pct: 90 },
  { plan_id: "HP-1034", plan_date: "2026-08-10", section_id: "SEC-108", department_scope: "Traction",         planned_duration_min: 163, train_delay_min: 25, conflict_count: 4, execution_status: "Completed", completion_pct: 93 },
  { plan_id: "HP-1035", plan_date: "2026-08-20", section_id: "SEC-110", department_scope: "Traction",         planned_duration_min: 187, train_delay_min: 17, conflict_count: 1, execution_status: "Completed", completion_pct: 96 },
  { plan_id: "HP-1036", plan_date: "2026-09-13", section_id: "SEC-106", department_scope: "Traction",         planned_duration_min: 61,  train_delay_min: 4,  conflict_count: 3, execution_status: "Completed", completion_pct: 81 },
  { plan_id: "HP-1037", plan_date: "2026-08-25", section_id: "SEC-109", department_scope: "S&T",              planned_duration_min: 191, train_delay_min: 19, conflict_count: 4, execution_status: "Completed", completion_pct: 98 },
  { plan_id: "HP-1038", plan_date: "2026-08-08", section_id: "SEC-105", department_scope: "Traction",         planned_duration_min: 226, train_delay_min: 1,  conflict_count: 3, execution_status: "Modified",  completion_pct: 65 },
  { plan_id: "HP-1039", plan_date: "2026-09-01", section_id: "SEC-104", department_scope: "Traction",         planned_duration_min: 160, train_delay_min: 9,  conflict_count: 2, execution_status: "Cancelled", completion_pct: 71 },
  { plan_id: "HP-1040", plan_date: "2026-08-08", section_id: "SEC-106", department_scope: "Engineering",      planned_duration_min: 96,  train_delay_min: 2,  conflict_count: 4, execution_status: "Completed", completion_pct: 90 },
  { plan_id: "HP-1041", plan_date: "2026-09-02", section_id: "SEC-103", department_scope: "S&T",              planned_duration_min: 132, train_delay_min: 15, conflict_count: 3, execution_status: "Cancelled", completion_pct: 69 },
  { plan_id: "HP-1042", plan_date: "2026-08-07", section_id: "SEC-109", department_scope: "S&T",              planned_duration_min: 97,  train_delay_min: 23, conflict_count: 1, execution_status: "Modified",  completion_pct: 84 },
  { plan_id: "HP-1043", plan_date: "2026-09-15", section_id: "SEC-109", department_scope: "Engineering",      planned_duration_min: 46,  train_delay_min: 9,  conflict_count: 1, execution_status: "Completed", completion_pct: 81 },
  { plan_id: "HP-1044", plan_date: "2026-08-30", section_id: "SEC-101", department_scope: "Engineering",      planned_duration_min: 178, train_delay_min: 24, conflict_count: 3, execution_status: "Completed", completion_pct: 96 },
  { plan_id: "HP-1045", plan_date: "2026-08-20", section_id: "SEC-104", department_scope: "Traction",         planned_duration_min: 96,  train_delay_min: 6,  conflict_count: 3, execution_status: "Cancelled", completion_pct: 94 },
  { plan_id: "HP-1046", plan_date: "2026-08-21", section_id: "SEC-108", department_scope: "Engineering",      planned_duration_min: 114, train_delay_min: 4,  conflict_count: 2, execution_status: "Cancelled", completion_pct: 67 },
  { plan_id: "HP-1047", plan_date: "2026-08-01", section_id: "SEC-110", department_scope: "Engineering",      planned_duration_min: 97,  train_delay_min: 17, conflict_count: 3, execution_status: "Cancelled", completion_pct: 77 },
  { plan_id: "HP-1048", plan_date: "2026-08-10", section_id: "SEC-105", department_scope: "S&T",              planned_duration_min: 88,  train_delay_min: 2,  conflict_count: 3, execution_status: "Cancelled", completion_pct: 94 },
  { plan_id: "HP-1049", plan_date: "2026-08-29", section_id: "SEC-101", department_scope: "S&T",              planned_duration_min: 52,  train_delay_min: 15, conflict_count: 1, execution_status: "Completed", completion_pct: 84 },
  { plan_id: "HP-1050", plan_date: "2026-08-04", section_id: "SEC-102", department_scope: "Multi-department", planned_duration_min: 145, train_delay_min: 5,  conflict_count: 4, execution_status: "Cancelled", completion_pct: 79 },
  { plan_id: "HP-1051", plan_date: "2026-08-22", section_id: "SEC-104", department_scope: "Engineering",      planned_duration_min: 238, train_delay_min: 24, conflict_count: 4, execution_status: "Completed", completion_pct: 65 },
  { plan_id: "HP-1052", plan_date: "2026-09-14", section_id: "SEC-108", department_scope: "Engineering",      planned_duration_min: 161, train_delay_min: 9,  conflict_count: 4, execution_status: "Modified",  completion_pct: 74 },
  { plan_id: "HP-1053", plan_date: "2026-08-15", section_id: "SEC-103", department_scope: "Traction",         planned_duration_min: 138, train_delay_min: 12, conflict_count: 2, execution_status: "Cancelled", completion_pct: 80 },
  { plan_id: "HP-1054", plan_date: "2026-08-30", section_id: "SEC-108", department_scope: "Engineering",      planned_duration_min: 61,  train_delay_min: 15, conflict_count: 1, execution_status: "Cancelled", completion_pct: 90 },
  { plan_id: "HP-1055", plan_date: "2026-08-30", section_id: "SEC-103", department_scope: "Traction",         planned_duration_min: 134, train_delay_min: 19, conflict_count: 2, execution_status: "Completed", completion_pct: 85 },
  { plan_id: "HP-1056", plan_date: "2026-09-15", section_id: "SEC-102", department_scope: "Traction",         planned_duration_min: 187, train_delay_min: 20, conflict_count: 1, execution_status: "Cancelled", completion_pct: 94 },
  { plan_id: "HP-1057", plan_date: "2026-08-30", section_id: "SEC-107", department_scope: "Multi-department", planned_duration_min: 106, train_delay_min: 19, conflict_count: 2, execution_status: "Completed", completion_pct: 90 },
  { plan_id: "HP-1058", plan_date: "2026-08-25", section_id: "SEC-102", department_scope: "Traction",         planned_duration_min: 98,  train_delay_min: 22, conflict_count: 4, execution_status: "Modified",  completion_pct: 96 },
  { plan_id: "HP-1059", plan_date: "2026-08-22", section_id: "SEC-109", department_scope: "S&T",              planned_duration_min: 89,  train_delay_min: 21, conflict_count: 1, execution_status: "Modified",  completion_pct: 67 },
  { plan_id: "HP-1060", plan_date: "2026-09-07", section_id: "SEC-110", department_scope: "Multi-department", planned_duration_min: 128, train_delay_min: 17, conflict_count: 1, execution_status: "Modified",  completion_pct: 71 },
  { plan_id: "HP-1061", plan_date: "2026-08-20", section_id: "SEC-107", department_scope: "Engineering",      planned_duration_min: 198, train_delay_min: 3,  conflict_count: 4, execution_status: "Cancelled", completion_pct: 91 },
  { plan_id: "HP-1062", plan_date: "2026-09-11", section_id: "SEC-101", department_scope: "Engineering",      planned_duration_min: 100, train_delay_min: 4,  conflict_count: 1, execution_status: "Completed", completion_pct: 69 },
  { plan_id: "HP-1063", plan_date: "2026-08-29", section_id: "SEC-109", department_scope: "Traction",         planned_duration_min: 144, train_delay_min: 19, conflict_count: 4, execution_status: "Completed", completion_pct: 73 },
  { plan_id: "HP-1064", plan_date: "2026-09-13", section_id: "SEC-106", department_scope: "Traction",         planned_duration_min: 190, train_delay_min: 25, conflict_count: 3, execution_status: "Modified",  completion_pct: 82 },
  { plan_id: "HP-1065", plan_date: "2026-08-06", section_id: "SEC-110", department_scope: "Engineering",      planned_duration_min: 201, train_delay_min: 16, conflict_count: 4, execution_status: "Completed", completion_pct: 78 },
  { plan_id: "HP-1066", plan_date: "2026-08-04", section_id: "SEC-106", department_scope: "Engineering",      planned_duration_min: 45,  train_delay_min: 22, conflict_count: 3, execution_status: "Completed", completion_pct: 78 },
  { plan_id: "HP-1067", plan_date: "2026-08-02", section_id: "SEC-104", department_scope: "Multi-department", planned_duration_min: 224, train_delay_min: 18, conflict_count: 4, execution_status: "Cancelled", completion_pct: 84 },
  { plan_id: "HP-1068", plan_date: "2026-08-26", section_id: "SEC-107", department_scope: "Multi-department", planned_duration_min: 184, train_delay_min: 6,  conflict_count: 2, execution_status: "Modified",  completion_pct: 68 },
  { plan_id: "HP-1069", plan_date: "2026-08-13", section_id: "SEC-109", department_scope: "Multi-department", planned_duration_min: 137, train_delay_min: 13, conflict_count: 2, execution_status: "Cancelled", completion_pct: 68 },
  { plan_id: "HP-1070", plan_date: "2026-08-09", section_id: "SEC-101", department_scope: "Engineering",      planned_duration_min: 210, train_delay_min: 0,  conflict_count: 2, execution_status: "Modified",  completion_pct: 87 },
  { plan_id: "HP-1071", plan_date: "2026-08-09", section_id: "SEC-102", department_scope: "S&T",              planned_duration_min: 209, train_delay_min: 25, conflict_count: 4, execution_status: "Modified",  completion_pct: 98 },
  { plan_id: "HP-1072", plan_date: "2026-08-28", section_id: "SEC-110", department_scope: "S&T",              planned_duration_min: 161, train_delay_min: 16, conflict_count: 4, execution_status: "Modified",  completion_pct: 84 },
  { plan_id: "HP-1073", plan_date: "2026-08-23", section_id: "SEC-104", department_scope: "S&T",              planned_duration_min: 153, train_delay_min: 19, conflict_count: 1, execution_status: "Modified",  completion_pct: 75 },
  { plan_id: "HP-1074", plan_date: "2026-09-15", section_id: "SEC-109", department_scope: "Traction",         planned_duration_min: 150, train_delay_min: 17, conflict_count: 3, execution_status: "Completed", completion_pct: 62 },
  { plan_id: "HP-1075", plan_date: "2026-09-06", section_id: "SEC-108", department_scope: "Traction",         planned_duration_min: 73,  train_delay_min: 18, conflict_count: 4, execution_status: "Completed", completion_pct: 69 },
  { plan_id: "HP-1076", plan_date: "2026-09-03", section_id: "SEC-105", department_scope: "Multi-department", planned_duration_min: 177, train_delay_min: 2,  conflict_count: 1, execution_status: "Completed", completion_pct: 90 },
  { plan_id: "HP-1077", plan_date: "2026-09-10", section_id: "SEC-102", department_scope: "Traction",         planned_duration_min: 201, train_delay_min: 1,  conflict_count: 3, execution_status: "Completed", completion_pct: 90 },
  { plan_id: "HP-1078", plan_date: "2026-08-30", section_id: "SEC-109", department_scope: "Multi-department", planned_duration_min: 191, train_delay_min: 23, conflict_count: 3, execution_status: "Modified",  completion_pct: 82 },
  { plan_id: "HP-1079", plan_date: "2026-08-19", section_id: "SEC-105", department_scope: "S&T",              planned_duration_min: 54,  train_delay_min: 22, conflict_count: 3, execution_status: "Cancelled", completion_pct: 63 },
  { plan_id: "HP-1080", plan_date: "2026-09-10", section_id: "SEC-108", department_scope: "S&T",              planned_duration_min: 191, train_delay_min: 1,  conflict_count: 3, execution_status: "Completed", completion_pct: 78 },
];