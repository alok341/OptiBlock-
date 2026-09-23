// ============================================================
// DemoMode — 12-step guided demo, redesigned to make the
// pipeline visible.
// Launcher removed — demo can only be started from the TopBar toggle.
// Bottom-right step-list panel removed — only the top banner remains.
// ============================================================

import { useApp } from "../store";
import type { Page } from "../types";

interface DemoStep {
  step: number;
  title: string;
  desc: string;
  detail: string;
  page: Page;
  pipelineStage:
    | "INGEST"
    | "AI"
    | "CONSTRAINT"
    | "COORDINATION"
    | "OPTIMIZE"
    | "CONTROLLER"
    | "LIVE"
    | "REOPTIMIZE";
  pipelineRecordId: string;
  pipelineSummary: string;
  action?:
    | "selectSection"
    | "selectAsset"
    | "approve"
    | "triggerLiveEvent"
    | "reoptimize";
  actionArg?: string;
}

const DEMO_STEPS: DemoStep[] = [
  {
    step: 1,
    title: "Data Ingest",
    desc: "17 CSVs loaded into unified store",
    detail:
      "TMS · SMMS · TDMS · BDMS · COA · Timetable · Live Movement · Goods Forecast · Crews · Constraints · Network · Historical · AI · Feasible · Optimized · Live Events.",
    page: "architecture",
    pipelineStage: "INGEST",
    pipelineRecordId: "17 CSVs",
    pipelineSummary: "~1,315 records normalized into unified store",
  },
  {
    step: 2,
    title: "AI Predicts Risk",
    desc: "TRK-104 flagged Critical · Priority 94",
    detail:
      "AI risk model scores TRK-104 (SEC-102): risk 87, health 42, priority 94, confidence 91%. Predicted failure: Yes.",
    page: "maintenance",
    pipelineStage: "AI",
    pipelineRecordId: "PRED-9001",
    pipelineSummary: "TRK-104 · Risk 87 · Priority 94 · Critical",
    action: "selectAsset",
    actionArg: "TRK-104",
  },
  {
    step: 3,
    title: "Block Request Received",
    desc: "BLK-541 · SEC-102 · Engineering · Emergency",
    detail:
      "Emergency isolation requested on SEC-102 from 05:00–07:30 (150 min) with purpose Isolation.",
    page: "block-planning",
    pipelineStage: "CONSTRAINT",
    pipelineRecordId: "BLK-541",
    pipelineSummary: "SEC-102 · Engineering · 05:00–07:30 · Emergency",
    action: "selectSection",
    actionArg: "SEC-102",
  },
  {
    step: 4,
    title: "Constraint Check Rejects",
    desc: "Requested window conflicts with Train 11110",
    detail:
      "FW-2065 REJECTED — Train 11110 scheduled on SEC-102 at 07:00–07:05 falls inside the requested 05:00–07:30 block.",
    page: "block-planning",
    pipelineStage: "CONSTRAINT",
    pipelineRecordId: "FW-2065",
    pipelineSummary: "REJECTED · Train 11110 conflict at 07:00",
  },
  {
    step: 5,
    title: "Feasible Window Found",
    desc: "FW-2066 · 00:30–04:30 · Available",
    detail:
      "Alternate window falls inside COA Available slot (00:30–04:30) with zero train conflicts and corridor available.",
    page: "block-planning",
    pipelineStage: "CONSTRAINT",
    pipelineRecordId: "FW-2066",
    pipelineSummary: "FEASIBLE · 00:30–04:30 · 240 min",
  },
  {
    step: 6,
    title: "Cross-Department Coordination",
    desc: "Engineering + S&T on SEC-102",
    detail:
      "S&T asset SIG-206 (Critical, communication failure) shares SEC-102. Both tasks can be coordinated into one block under the compatibility matrix (Engineering ↔ S&T = compatible).",
    page: "coordination",
    pipelineStage: "COORDINATION",
    pipelineRecordId: "SEC-102",
    pipelineSummary: "Engineering + S&T · 2 tasks · 1 block",
  },
  {
    step: 7,
    title: "OR-Tools Optimizes",
    desc: "OPT-3035 selected · delay 0 · utilization 100%",
    detail:
      "CP-SAT optimizer selects OPT-3035: SEC-102, TRK-104, Engineering, 00:30–04:30, priority Critical, train delay 0, conflicts 0.",
    page: "block-planning",
    pipelineStage: "OPTIMIZE",
    pipelineRecordId: "OPT-3035",
    pipelineSummary: "OPT-3035 · 00:30–04:30 · 0 delay · 0 conflicts",
  },
  {
    step: 8,
    title: "Controller Review",
    desc: "COA reviews AI recommendation",
    detail:
      "Controller sees the recommended plan with WHY explanation (risk 87, priority 94, feasible window, coordinated work). Actions: Approve / Modify / Reject / Replan.",
    page: "overview",
    pipelineStage: "CONTROLLER",
    pipelineRecordId: "OPT-3035",
    pipelineSummary: "Awaiting controller decision",
  },
  {
    step: 9,
    title: "Controller Approves",
    desc: "Block BLK-541 approved · audit event recorded",
    detail:
      "Controller approves OPT-3035. Crews notified, audit trail updated, plan moves to APPROVED status.",
    page: "overview",
    pipelineStage: "CONTROLLER",
    pipelineRecordId: "OPT-3035",
    pipelineSummary: "APPROVED · audit recorded · crews notified",
    action: "approve",
    actionArg: "OPT-3035",
  },
  {
    step: 10,
    title: "Live Event Arrives",
    desc: "EVT-002 · New Critical Defect on TRK-104",
    detail:
      "Live feed: new critical rail crack detected on TRK-104 during inspection (SEC-102, severity Critical). Impact assessment triggered.",
    page: "live-operations",
    pipelineStage: "LIVE",
    pipelineRecordId: "EVT-002",
    pipelineSummary: "EVT-002 · New Critical Defect · TRK-104",
    action: "triggerLiveEvent",
    actionArg: "EVT-002",
  },
  {
    step: 11,
    title: "Re-optimization Runs",
    desc: "Recalculate → Re-run OR-Tools",
    detail:
      "Feasible windows recalculated for SEC-102. Optimizer re-runs. Updated plan submitted for controller review.",
    page: "live-operations",
    pipelineStage: "REOPTIMIZE",
    pipelineRecordId: "OPT-3035+",
    pipelineSummary: "Recalculating · Re-running optimizer",
    action: "reoptimize",
  },
  {
    step: 12,
    title: "Updated Plan Ready",
    desc: "Awaiting controller review",
    detail:
      "Updated block plan generated. Full audit trail maintained. Controller reviews and decides next action.",
    page: "overview",
    pipelineStage: "REOPTIMIZE",
    pipelineRecordId: "OPT-3035+",
    pipelineSummary: "UPDATED · awaiting controller review",
  },
];

export default function DemoMode() {
  const {
    demoStep,
    setDemoStep,
    demoMode,
    setDemoMode,
    setPage,
    setSelectedSection,
    setSelectedAsset,
    advancePipeline,
    approvePlan,
    triggerLiveEvent,
    triggerReoptimize,
    resetPipeline,
  } = useApp();

  function execute(idx: number) {
    if (idx < 0 || idx >= DEMO_STEPS.length) return;
    const step = DEMO_STEPS[idx];
    setDemoStep(idx);
    setPage(step.page);

    advancePipeline(
      step.pipelineStage,
      step.pipelineRecordId,
      step.pipelineSummary
    );

    switch (step.action) {
      case "selectSection":
        if (step.actionArg) setSelectedSection(step.actionArg);
        break;
      case "selectAsset":
        if (step.actionArg) setSelectedAsset(step.actionArg);
        break;
      case "approve":
        if (step.actionArg) approvePlan(step.actionArg);
        break;
      case "triggerLiveEvent":
        if (step.actionArg) triggerLiveEvent(step.actionArg);
        break;
      case "reoptimize":
        setTimeout(() => triggerReoptimize(), 1200);
        break;
    }
  }

  if (!demoMode) return null;

  const currentStep = DEMO_STEPS[demoStep];

  return (
    <div
      className="fixed top-14 left-1/2 -translate-x-1/2 z-50 rounded-lg shadow-xl"
      style={{
        background: "var(--navy)",
        border: "1px solid rgba(107,63,160,0.6)",
        minWidth: 480,
        maxWidth: 660,
      }}
    >
      <div className="flex items-start gap-3 px-4 py-3">
        <div
          className="flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm"
          style={{ background: "#6B3FA0", color: "white" }}
        >
          {demoStep + 1}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-white font-bold text-sm">{currentStep.title}</p>
          <p className="text-white/70 text-xs">{currentStep.desc}</p>
          <p className="text-white/50 text-xs mt-0.5 leading-tight">
            {currentStep.detail}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {demoStep > 0 && (
            <button
              onClick={() => execute(demoStep - 1)}
              className="text-white/60 hover:text-white text-xs px-2 py-1 rounded"
              style={{ background: "rgba(255,255,255,0.08)" }}
            >
              ← Back
            </button>
          )}
          {demoStep < DEMO_STEPS.length - 1 ? (
            <button
              onClick={() => execute(demoStep + 1)}
              className="text-white text-xs px-3 py-1 rounded font-semibold"
              style={{ background: "#6B3FA0" }}
            >
              Next Step →
            </button>
          ) : (
            <button
              onClick={() => {
                setDemoMode(false);
                resetPipeline();
              }}
              className="text-white text-xs px-3 py-1 rounded font-semibold"
              style={{ background: "#3F8F45" }}
            >
              Finish Demo
            </button>
          )}
        </div>
      </div>

      <div
        className="h-1 w-full"
        style={{ background: "rgba(255,255,255,0.1)" }}
      >
        <div
          className="h-full transition-all"
          style={{
            width: `${((demoStep + 1) / DEMO_STEPS.length) * 100}%`,
            background: "#6B3FA0",
          }}
        />
      </div>
    </div>
  );
}