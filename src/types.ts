// ============================================================
// OPTIBLOCK — Extended Domain Types
// All existing types preserved. New types appended for CSV mapping.
// ============================================================

// ---------- EXISTING (unchanged) ----------
export type Role = "COA" | "ENGINEERING" | "ST" | "TRACTION" | "ADMIN";

export type Page =
  | "overview"
  | "maintenance"
  | "block-planning"
  | "live-operations"
  | "railway-health"
  | "coordination"
  | "conflicts"
  | "what-if"
  | "reports"
  | "architecture";

export type Department = "ENGINEERING" | "ST" | "TRACTION";
export type Criticality = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
export type AssetStatus = "OPERATIONAL" | "DEGRADED" | "CRITICAL" | "UNDER_MAINTENANCE";
export type DefectStatus = "NONE" | "MINOR" | "MODERATE" | "CRITICAL";

export type TaskStatus =
  | "OVERDUE"
  | "DUE_SOON"
  | "SCHEDULED"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "BLOCKED";

export type BlockStatus =
  | "REQUESTED"
  | "UNDER_REVIEW"
  | "RECOMMENDED"
  | "APPROVED"
  | "MODIFIED"
  | "REJECTED"
  | "CANCELLED"
  | "COMPLETED";

export type TrainType = "SUBURBAN" | "EXPRESS" | "MAIL" | "PASSENGER" | "GOODS";
export type TrainStatus = "ON_TIME" | "DELAYED" | "CANCELLED" | "ARRIVED";

export interface Asset {
  id: string;
  section: string;
  department: Department;
  type: string;
  location: string;
  health: number;
  risk: number;
  criticality: Criticality;
  defectStatus: DefectStatus;
  defectSeverity: string;
  lastMaintenance: string;
  nextDue: string;
  maintenanceFrequency: string;
  usageLoad: string;
  status: AssetStatus;
  overdueDays?: number;
  priority?: number;
}

export interface MaintenanceTask {
  id: string;
  assetId: string;
  section: string;
  department: Department;
  workType: string;
  priority: number;
  risk: number;
  duration: number;
  crewRequired: string;
  equipmentRequired: string;
  deadline: string;
  status: TaskStatus;
  compatibility: string[];
  reason: string;
  overdueDays?: number;
}

export interface BlockRequest {
  id: string;
  section: string;
  departments: Department[];
  taskIds: string[];
  requestedStart: string;
  requestedEnd: string;
  duration: number;
  priority: number;
  reason: string;
  status: BlockStatus;
  conflicts: number;
  crew: string[];
  equipment: string[];
  trainImpact: number;
  utilization: number;
}

export interface Train {
  number: string;
  name: string;
  type: TrainType;
  section: string;
  direction: "UP" | "DOWN";
  scheduledArrival: string;
  scheduledDeparture: string;
  delay: number;
  status: TrainStatus;
  currentPosition: number;
  speed: number;
}

export interface Crew {
  id: string;
  department: Department;
  skills: string[];
  availableFrom: string;
  availableUntil: string;
  currentTask: string | null;
  status: "AVAILABLE" | "BUSY" | "UNAVAILABLE";
}

export interface Conflict {
  id: string;
  type: "TRAIN_BLOCK" | "RESOURCE" | "CORRIDOR" | "DEPARTMENT";
  section: string;
  severity: "CRITICAL" | "WARNING" | "RESOLVED";
  description: string;
  affectedBlocks: string[];
  affectedTrains: string[];
  suggested: string;
  status: "ACTIVE" | "RESOLVED";
}

export interface AuditEvent {
  id: string;
  timestamp: string;
  action: string;
  actor: string;
  details: string;
  type: "INFO" | "ACTION" | "AI" | "ALERT" | "APPROVAL";
}

export interface LiveTrain {
  number: string;
  name: string;
  type: TrainType;
  section: string;
  direction: "UP" | "DOWN";
  delay: number;
  speed: number;
  status: TrainStatus;
  position: number;
}

export interface CandidateWindow {
  start: string;
  end: string;
  trainImpact: number;
  conflicts: number;
  utilization: number;
  isBest: boolean;
  feasible: boolean;
  reason?: string;
}

export interface ScenarioConfig {
  trainDelayMinutes: number;
  selectedTrain: string;
  blockStartOverride?: string;
  maintenancePriority: number;
  crewAvailability: boolean;
  corridorAvailability: boolean;
}

// ============================================================
// NEW — CSV-driven types (Phase 1 additions)
// ============================================================

/** Source system identifiers (matches brief §5) */
export type DataSource =
  | "TMS"
  | "SMMS"
  | "TDMS"
  | "BDMS"
  | "COA"
  | "TT"      // Train Timetable
  | "LTM"     // Live Train Movement
  | "GTF"     // Goods Train Forecast
  | "RES"     // Resources/Crews
  | "OPS"     // Operational Constraints
  | "NET"     // Railway Sections
  | "HIST"    // Historical Block Plans
  | "AI"      // AI Predictions
  | "FW"      // Feasible Windows
  | "OPT"     // Optimized Plans
  | "EVT";    // Live Events

/** 5 pipeline stages visible in the Demo HUD */
export type PipelineStage =
  | "IDLE"
  | "INGEST"       // 1. Data loaded from sources
  | "AI"           // 2. Risk & priority prediction
  | "CONSTRAINT"   // 3. Feasibility check
  | "COORDINATION" // 4. Cross-department match
  | "OPTIMIZE"     // 5. OR-Tools selection
  | "CONTROLLER"   // 6. Human decision
  | "LIVE"         // 7. Live event arrives
  | "REOPTIMIZE";  // 8. Impact → recalc → new plan

export interface PipelineStep {
  stage: PipelineStage;
  label: string;
  status: "PENDING" | "RUNNING" | "DONE" | "BLOCKED";
  /** Optional ID of the record currently flowing through this stage */
  recordId?: string;
  /** Human-readable summary shown in the HUD */
  summary?: string;
  /** ms timestamp when this stage last ran */
  ts?: number;
}

/** Row from ai_predictions.csv */
export interface AIPrediction {
  predictionId: string;       // PRED-9001
  assetId: string;            // TRK-104
  assetType: "Track" | "Signal" | "Traction";
  sectionId: string;          // SEC-102
  riskScore: number;          // 0–100
  healthScore: number;        // 0–100
  priorityScore: number;      // 0–100
  priorityLevel: "Low" | "Medium" | "High" | "Critical";
  predictedFailure: boolean;
  predictionConfidence: number; // 0–1
  predictionTimestamp: string;
}

/** Row from feasible_block_windows.csv */
export interface FeasibleWindow {
  windowId: string;           // FW-2065
  blockRequestId: string;     // BLK-541
  sectionId: string;          // SEC-102
  windowStart: string;        // ISO datetime
  windowEnd: string;
  durationMin: number;
  conflictCount: number;
  conflictReason: string;     // "None" if feasible
  feasible: boolean;
  constraintStatus: "Feasible" | "Rejected" | "Needs Review";
}

/** Row from optimized_block_plans.csv */
export interface OptimizedBlockPlan {
  planId: string;             // OPT-3035
  blockRequestId: string;     // BLK-541
  windowId: string;           // FW-2066
  sectionId: string;          // SEC-102
  assetId: string;            // TRK-104
  department: Department;
  workType: string;
  startTime: string;
  endTime: string;
  duration: number;
  priority: "Low" | "Medium" | "High" | "Critical";
  trainDelay: number;         // minutes
  conflictCount: number;
  assetDowntime: number;      // minutes
  status: "Recommended" | "Approved" | "Modified" | "Rejected" | "Completed";
  reason: string;
}

/** Row from live_events.csv */
export interface LiveEvent {
  eventId: string;            // EVT-002
  timestamp: string;
  eventType:
    | "Train Delay"
    | "New Critical Defect"
    | "Block Cancelled"
    | "Corridor Unavailable"
    | "Updated Train Movement";
  sectionId: string;
  trainNo?: string;
  assetId?: string;
  severity: "Low" | "Medium" | "High" | "Critical";
  description: string;
  status: "Active" | "Resolved" | "Monitoring";
}

/** Corridor availability row (COA) */
export interface CorridorSlot {
  coaId: string;              // COA-SEC-108-1-1
  sectionId: string;
  date: string;               // 2026-09-23
  startTime: string;          // HH:MM
  endTime: string;
  availability: "Available" | "Restricted" | "Blocked";
  reason: string;
  trafficLevel: "Low" | "Moderate" | "Normal" | "High";
}

/** Goods train forecast row */
export interface GoodsForecast {
  forecastId: string;         // GF-701
  date: string;
  sectionId: string;
  expectedGoodsTrains: number;
  forecastTrafficLevel: "Low" | "Medium" | "High";
  forecastWindow: string;     // "12:00-16:00"
  confidenceStatus: "Confirmed" | "Forecast";
}

/** Operational constraint row */
export interface OperationalConstraint {
  constraintId: string;       // CNS-901
  constraintType:
    | "Minimum Duration"
    | "Corridor Availability"
    | "Work Dependency"
    | "Regulatory Restriction"
    | "Section Occupancy"
    | "Crew Availability"
    | "Safety Rule";
  ruleDescription: string;
  severity: "Hard" | "Soft";
  sectionId: string;
  status: "Active" | "Review";
}

/** Historical block plan row */
export interface HistoricalBlockPlan {
  planId: string;             // HP-1001
  planDate: string;
  sectionId: string;
  departmentScope: "Engineering" | "S&T" | "Traction" | "Multi-department";
  plannedDurationMin: number;
  trainDelayMin: number;
  conflictCount: number;
  executionStatus: "Completed" | "Modified" | "Cancelled";
  completionPct: number;
}

/** Raw railway section (from railway_sections.csv) */
export interface RailwaySectionRaw {
  sectionId: string;          // SEC-101
  fromStation: string;        // Kalyan
  toStation: string;          // Dombivli
  trackConfiguration: "Double" | "Quadruple";
  trafficType: "Passenger" | "Passenger+Freight";
  capacityTrainsPerHour: number;
}

/** Raw asset rows kept separate so adapters can map to unified Asset */
export interface TrackAssetRaw {
  assetId: string;            // TRK-104
  sectionId: string;          // SEC-102
  assetLocation: string;
  condition: "Good" | "Fair" | "Poor" | "Critical";
  defectType: string;
  defectSeverity: number;
  usageLoadPct: number;
  maintenanceType: "Routine" | "Corrective" | "Emergency";
  estimatedDurationMin: number;
  criticality: "Low" | "Medium" | "High" | "Critical";
}

export interface SignallingAssetRaw {
  signalId: string;           // SIG-209
  sectionId: string;
  signalType: "Home" | "Distant" | "Starter" | "Shunt";
  condition: "Healthy" | "Degraded" | "Faulty" | "Critical";
  faultType: string;
  healthScore: number;
  maintenanceType: "Routine" | "Urgent" | "Corrective";
  estimatedDurationMin: number;
  criticality: "Low" | "Medium" | "High" | "Critical";
}

export interface TractionAssetRaw {
  tractionAssetId: string;    // OHE-311
  sectionId: string;
  componentType: "Catenary" | "Feeder" | "Isolator" | "Section Insulator";
  condition: "Good" | "Fair" | "Poor";
  defectType: string;
  loadPct: number;
  defectSeverity: number;
  estimatedDurationMin: number;
  criticality: "Low" | "Medium" | "High" | "Critical";
}