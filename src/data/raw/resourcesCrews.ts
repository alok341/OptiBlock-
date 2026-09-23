// ============================================================
// Raw module — resources_crews.csv
// Preserved exact CSV column names (snake_case)
// ============================================================

export interface ResourceCrewRow {
  crew_id: string;
  department: string;
  crew_type: string;
  team_size: number;
  availability_status: string;
  shift: string;
  skill_level: string;
}

export const RESOURCES_CREWS: ResourceCrewRow[] = [
  { crew_id: "CREW-801", department: "Traction",    crew_type: "Track Team",       team_size: 12, availability_status: "Standby",   shift: "Night",      skill_level: "Basic"    },
  { crew_id: "CREW-802", department: "Traction",    crew_type: "Inspection Team",  team_size: 4,  availability_status: "Available", shift: "Night",      skill_level: "Certified" },
  { crew_id: "CREW-803", department: "S&T",         crew_type: "Inspection Team",  team_size: 4,  availability_status: "Available", shift: "Rotational", skill_level: "Senior"   },
  { crew_id: "CREW-804", department: "Traction",    crew_type: "Track Team",       team_size: 9,  availability_status: "Available", shift: "Night",      skill_level: "Senior"   },
  { crew_id: "CREW-805", department: "Engineering", crew_type: "OHE Team",         team_size: 11, availability_status: "Standby",   shift: "Day",        skill_level: "Certified" },
  { crew_id: "CREW-806", department: "Traction",    crew_type: "Signal Team",      team_size: 5,  availability_status: "Available", shift: "Rotational", skill_level: "Senior"   },
  { crew_id: "CREW-807", department: "S&T",         crew_type: "Inspection Team",  team_size: 12, availability_status: "Standby",   shift: "Rotational", skill_level: "Basic"    },
  { crew_id: "CREW-808", department: "Engineering", crew_type: "Inspection Team",  team_size: 7,  availability_status: "Assigned",  shift: "Day",        skill_level: "Basic"    },
  { crew_id: "CREW-809", department: "S&T",         crew_type: "Track Team",       team_size: 10, availability_status: "Standby",   shift: "Rotational", skill_level: "Basic"    },
  { crew_id: "CREW-810", department: "Traction",    crew_type: "Inspection Team",  team_size: 7,  availability_status: "Available", shift: "Night",      skill_level: "Senior"   },
  { crew_id: "CREW-811", department: "S&T",         crew_type: "Signal Team",      team_size: 5,  availability_status: "Assigned",  shift: "Rotational", skill_level: "Basic"    },
  { crew_id: "CREW-812", department: "S&T",         crew_type: "Inspection Team",  team_size: 12, availability_status: "Available", shift: "Rotational", skill_level: "Senior"   },
  { crew_id: "CREW-813", department: "Traction",    crew_type: "Signal Team",      team_size: 6,  availability_status: "Available", shift: "Night",      skill_level: "Certified" },
  { crew_id: "CREW-814", department: "S&T",         crew_type: "Track Team",       team_size: 4,  availability_status: "Standby",   shift: "Night",      skill_level: "Certified" },
  { crew_id: "CREW-815", department: "S&T",         crew_type: "OHE Team",         team_size: 6,  availability_status: "Assigned",  shift: "Night",      skill_level: "Senior"   },
  { crew_id: "CREW-816", department: "Traction",    crew_type: "Track Team",       team_size: 7,  availability_status: "Available", shift: "Night",      skill_level: "Senior"   },
  { crew_id: "CREW-817", department: "S&T",         crew_type: "Signal Team",      team_size: 10, availability_status: "Available", shift: "Day",        skill_level: "Basic"    },
  { crew_id: "CREW-818", department: "Traction",    crew_type: "OHE Team",         team_size: 5,  availability_status: "Standby",   shift: "Day",        skill_level: "Basic"    },
  { crew_id: "CREW-819", department: "Traction",    crew_type: "Track Team",       team_size: 6,  availability_status: "Standby",   shift: "Day",        skill_level: "Certified" },
  { crew_id: "CREW-820", department: "Engineering", crew_type: "OHE Team",         team_size: 4,  availability_status: "Assigned",  shift: "Night",      skill_level: "Certified" },
  { crew_id: "CREW-821", department: "Engineering", crew_type: "OHE Team",         team_size: 6,  availability_status: "Standby",   shift: "Rotational", skill_level: "Basic"    },
  { crew_id: "CREW-822", department: "Engineering", crew_type: "OHE Team",         team_size: 11, availability_status: "Assigned",  shift: "Rotational", skill_level: "Senior"   },
  { crew_id: "CREW-823", department: "Engineering", crew_type: "Track Team",       team_size: 9,  availability_status: "Standby",   shift: "Rotational", skill_level: "Senior"   },
  { crew_id: "CREW-824", department: "Engineering", crew_type: "OHE Team",         team_size: 5,  availability_status: "Available", shift: "Night",      skill_level: "Basic"    },
  { crew_id: "CREW-825", department: "Traction",    crew_type: "OHE Team",         team_size: 3,  availability_status: "Assigned",  shift: "Rotational", skill_level: "Basic"    },
  { crew_id: "CREW-826", department: "Engineering", crew_type: "Inspection Team",  team_size: 7,  availability_status: "Standby",   shift: "Rotational", skill_level: "Certified" },
  { crew_id: "CREW-827", department: "Engineering", crew_type: "Track Team",       team_size: 7,  availability_status: "Standby",   shift: "Night",      skill_level: "Basic"    },
  { crew_id: "CREW-828", department: "S&T",         crew_type: "Track Team",       team_size: 8,  availability_status: "Assigned",  shift: "Rotational", skill_level: "Senior"   },
  { crew_id: "CREW-829", department: "Engineering", crew_type: "Signal Team",      team_size: 6,  availability_status: "Standby",   shift: "Night",      skill_level: "Senior"   },
  { crew_id: "CREW-830", department: "Traction",    crew_type: "Track Team",       team_size: 3,  availability_status: "Available", shift: "Rotational", skill_level: "Certified" },
];