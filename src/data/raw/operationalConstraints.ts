// ============================================================
// Raw module — operational_constraints.csv
// Preserved exact CSV column names (snake_case)
// ============================================================

export interface OperationalConstraintRow {
  constraint_id: string;
  constraint_type: string;
  rule_description: string;
  severity: string;
  section_id: string;
  status: string;
}

export const OPERATIONAL_CONSTRAINTS: OperationalConstraintRow[] = [
  { constraint_id: "CNS-901", constraint_type: "Minimum Duration",       rule_description: "Maintenance duration cannot be shortened below required duration", severity: "Hard", section_id: "SEC-108", status: "Active" },
  { constraint_id: "CNS-902", constraint_type: "Corridor Availability",  rule_description: "Block must fall inside permitted corridor window",                severity: "Hard", section_id: "SEC-103", status: "Active" },
  { constraint_id: "CNS-903", constraint_type: "Minimum Duration",       rule_description: "Maintenance duration cannot be shortened below required duration", severity: "Hard", section_id: "SEC-106", status: "Active" },
  { constraint_id: "CNS-904", constraint_type: "Corridor Availability",  rule_description: "Block must fall inside permitted corridor window",                severity: "Hard", section_id: "SEC-105", status: "Active" },
  { constraint_id: "CNS-905", constraint_type: "Work Dependency",        rule_description: "Dependent tasks must follow predecessor task",                    severity: "Hard", section_id: "SEC-105", status: "Active" },
  { constraint_id: "CNS-906", constraint_type: "Corridor Availability",  rule_description: "Block must fall inside permitted corridor window",                severity: "Hard", section_id: "SEC-105", status: "Active" },
  { constraint_id: "CNS-907", constraint_type: "Regulatory Restriction", rule_description: "Restricted periods cannot be used",                              severity: "Hard", section_id: "SEC-101", status: "Review" },
  { constraint_id: "CNS-908", constraint_type: "Minimum Duration",       rule_description: "Maintenance duration cannot be shortened below required duration", severity: "Hard", section_id: "SEC-104", status: "Active" },
  { constraint_id: "CNS-909", constraint_type: "Minimum Duration",       rule_description: "Maintenance duration cannot be shortened below required duration", severity: "Hard", section_id: "SEC-107", status: "Review" },
  { constraint_id: "CNS-910", constraint_type: "Section Occupancy",      rule_description: "Section must be clear before block start",                        severity: "Hard", section_id: "SEC-102", status: "Review" },
  { constraint_id: "CNS-911", constraint_type: "Crew Availability",      rule_description: "Required qualified crew must be available",                       severity: "Hard", section_id: "SEC-109", status: "Review" },
  { constraint_id: "CNS-912", constraint_type: "Work Dependency",        rule_description: "Dependent tasks must follow predecessor task",                    severity: "Hard", section_id: "SEC-104", status: "Active" },
  { constraint_id: "CNS-913", constraint_type: "Section Occupancy",      rule_description: "Section must be clear before block start",                        severity: "Hard", section_id: "SEC-110", status: "Active" },
  { constraint_id: "CNS-914", constraint_type: "Crew Availability",      rule_description: "Required qualified crew must be available",                       severity: "Hard", section_id: "SEC-105", status: "Review" },
  { constraint_id: "CNS-915", constraint_type: "Minimum Duration",       rule_description: "Maintenance duration cannot be shortened below required duration", severity: "Hard", section_id: "SEC-108", status: "Review" },
  { constraint_id: "CNS-916", constraint_type: "Section Occupancy",      rule_description: "Section must be clear before block start",                        severity: "Hard", section_id: "SEC-104", status: "Review" },
  { constraint_id: "CNS-917", constraint_type: "Section Occupancy",      rule_description: "Section must be clear before block start",                        severity: "Hard", section_id: "SEC-110", status: "Review" },
  { constraint_id: "CNS-918", constraint_type: "Corridor Availability",  rule_description: "Block must fall inside permitted corridor window",                severity: "Hard", section_id: "SEC-104", status: "Active" },
  { constraint_id: "CNS-919", constraint_type: "Minimum Duration",       rule_description: "Maintenance duration cannot be shortened below required duration", severity: "Hard", section_id: "SEC-109", status: "Active" },
  { constraint_id: "CNS-920", constraint_type: "Crew Availability",      rule_description: "Required qualified crew must be available",                       severity: "Hard", section_id: "SEC-103", status: "Review" },
  { constraint_id: "CNS-921", constraint_type: "Work Dependency",        rule_description: "Dependent tasks must follow predecessor task",                    severity: "Hard", section_id: "SEC-103", status: "Active" },
  { constraint_id: "CNS-922", constraint_type: "Safety Rule",            rule_description: "No block during protected movement window",                       severity: "Hard", section_id: "SEC-109", status: "Review" },
  { constraint_id: "CNS-923", constraint_type: "Corridor Availability",  rule_description: "Block must fall inside permitted corridor window",                severity: "Hard", section_id: "SEC-102", status: "Active" },
  { constraint_id: "CNS-924", constraint_type: "Minimum Duration",       rule_description: "Maintenance duration cannot be shortened below required duration", severity: "Hard", section_id: "SEC-103", status: "Review" },
  { constraint_id: "CNS-925", constraint_type: "Safety Rule",            rule_description: "No block during protected movement window",                       severity: "Hard", section_id: "SEC-106", status: "Active" },
  { constraint_id: "CNS-926", constraint_type: "Crew Availability",      rule_description: "Required qualified crew must be available",                       severity: "Hard", section_id: "SEC-105", status: "Active" },
  { constraint_id: "CNS-927", constraint_type: "Corridor Availability",  rule_description: "Block must fall inside permitted corridor window",                severity: "Hard", section_id: "SEC-105", status: "Active" },
  { constraint_id: "CNS-928", constraint_type: "Regulatory Restriction", rule_description: "Restricted periods cannot be used",                              severity: "Hard", section_id: "SEC-104", status: "Active" },
  { constraint_id: "CNS-929", constraint_type: "Section Occupancy",      rule_description: "Section must be clear before block start",                        severity: "Hard", section_id: "SEC-103", status: "Active" },
  { constraint_id: "CNS-930", constraint_type: "Regulatory Restriction", rule_description: "Restricted periods cannot be used",                              severity: "Hard", section_id: "SEC-110", status: "Review" },
];