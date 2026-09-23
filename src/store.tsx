// ============================================================
// OPTIBLOCK — Global store
// - Every slice reads from the CSV-driven seed (src/data/seed.ts)
// - Adds pipeline state for the visible Pipeline HUD
// - Adds controller + live-event + re-optimization actions
// - Adds `entered` flag for the Home landing page
// ============================================================

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useRef,
  useEffect,
  useMemo,
} from "react";
import type {
  Role,
  Page,
  LiveTrain,
  BlockStatus,
  PipelineStage,
  PipelineStep,
  AIPrediction,
  FeasibleWindow,
  OptimizedBlockPlan,
  LiveEvent,
} from "./types";
import {
  LIVE_TRAINS,
  BLOCK_REQUESTS,
  BLOCK_REQUESTS_BY_ID,
  FEASIBLE_WINDOWS_BY_REQUEST,
  OPTIMIZED_PLANS_BY_REQUEST,
  LIVE_EVENTS_UI,
  ANCHOR_CHAIN,
  ANCHOR_BLOCK_REQUEST_ID,
} from "./data/seed";

// ============================================================
// Types
// ============================================================

export interface AuditEvent {
  id: string;
  timestamp: string;
  action: string;
  actor: string;
  details: string;
  type: "INFO" | "ACTION" | "AI" | "ALERT" | "APPROVAL";
}

export interface AppState {
  // Navigation
  role: Role;
  page: Page;
  entered: boolean;
  selectedSection: string | null;
  selectedAsset: string | null;
  selectedBlock: string | null;

  // Demo
  demoStep: number;
  demoMode: boolean;

  // Data (populated from CSV via seed)
  liveTrains: LiveTrain[];
  blockStatuses: Record<string, BlockStatus>;
  liveEvents: LiveEvent[];

  // Pipeline
  pipelineStage: PipelineStage;
  pipelineHistory: PipelineStep[];
  activeBlockRequestId: string | null;

  // Anchor scenario mirrors
  activePrediction: AIPrediction | null;
  activeFeasibleWindows: FeasibleWindow[];
  activeOptimizedPlans: OptimizedBlockPlan[];

  // Demo flags
  trainDelayActive: boolean;
  reoptimized: boolean;
  blockApproved: boolean;

  // Audit
  auditEvents: AuditEvent[];

  // Toast
  toast: {
    message: string;
    type: "success" | "info" | "warning" | "error";
  } | null;

  // Setters
  setRole: (r: Role) => void;
  setPage: (p: Page) => void;
  setEntered: (v: boolean) => void;
  setSelectedSection: (s: string | null) => void;
  setSelectedAsset: (a: string | null) => void;
  setSelectedBlock: (b: string | null) => void;
  setDemoStep: (n: number) => void;
  setDemoMode: (v: boolean) => void;

  // Pipeline controls
  setPipelineStage: (stage: PipelineStage) => void;
  pushPipelineStep: (step: PipelineStep) => void;
  resetPipeline: () => void;
  advancePipeline: (
    stage: PipelineStage,
    recordId?: string,
    summary?: string
  ) => void;

  // Data actions
  updateBlockStatus: (id: string, status: BlockStatus) => void;
  addAuditEvent: (e: Omit<AuditEvent, "id">) => void;
  triggerLiveEvent: (eventId: string) => void;

  // Demo actions
  triggerTrainDelay: () => void;
  triggerReoptimize: () => void;
  approvePlan: (planId: string) => void;
  modifyPlan: (planId: string, newStart: string, newEnd: string) => void;
  rejectPlan: (planId: string, reason: string) => void;
  resetDemo: () => void;

  // Toast
  showToast: (
    message: string,
    type?: "success" | "info" | "warning" | "error"
  ) => void;
}

const Ctx = createContext<AppState | null>(null);

// ============================================================
// Initial pipeline step list — 8 stages
// ============================================================

const INITIAL_PIPELINE: PipelineStep[] = [
  { stage: "INGEST",       label: "Data Ingest",       status: "PENDING" },
  { stage: "AI",           label: "AI Predict",        status: "PENDING" },
  { stage: "CONSTRAINT",   label: "Constraint Check",  status: "PENDING" },
  { stage: "COORDINATION", label: "Coordination",      status: "PENDING" },
  { stage: "OPTIMIZE",     label: "OR-Tools Optimize", status: "PENDING" },
  { stage: "CONTROLLER",   label: "Controller Review", status: "PENDING" },
  { stage: "LIVE",         label: "Live Event",        status: "PENDING" },
  { stage: "REOPTIMIZE",   label: "Re-optimize",       status: "PENDING" },
];

// ============================================================
// Provider
// ============================================================

export function AppProvider({ children }: { children: React.ReactNode }) {
  // Navigation
  const [role, setRole] = useState<Role>("COA");
  const [page, setPage] = useState<Page>("overview");
  const [entered, setEntered] = useState(false);
  const [selectedSection, setSelectedSection] = useState<string | null>(null);
  const [selectedAsset, setSelectedAsset] = useState<string | null>(null);
  const [selectedBlock, setSelectedBlock] = useState<string | null>(
    ANCHOR_BLOCK_REQUEST_ID
  );

  // Demo
  const [demoStep, setDemoStep] = useState(0);
  const [demoMode, setDemoMode] = useState(false);

  // Data
  const [liveTrains, setLiveTrains] = useState<LiveTrain[]>(LIVE_TRAINS);
  const [blockStatuses, setBlockStatuses] = useState<
    Record<string, BlockStatus>
  >(() => {
    const m: Record<string, BlockStatus> = {};
    BLOCK_REQUESTS.forEach((b) => {
      m[b.id] = b.status;
    });
    return m;
  });
  const [liveEvents, setLiveEvents] = useState<LiveEvent[]>(LIVE_EVENTS_UI);

  // Pipeline
  const [pipelineStage, setPipelineStage] = useState<PipelineStage>("IDLE");
  const [pipelineHistory, setPipelineHistory] =
    useState<PipelineStep[]>(INITIAL_PIPELINE);
  const [activeBlockRequestId, setActiveBlockRequestId] = useState<
    string | null
  >(ANCHOR_BLOCK_REQUEST_ID);

  // Anchor mirrors
  const [activePrediction, setActivePrediction] = useState<AIPrediction | null>(
    ANCHOR_CHAIN.prediction ?? null
  );
  const [activeFeasibleWindows, setActiveFeasibleWindows] = useState<
    FeasibleWindow[]
  >(ANCHOR_CHAIN.blockChain.windows ?? []);
  const [activeOptimizedPlans, setActiveOptimizedPlans] = useState<
    OptimizedBlockPlan[]
  >(ANCHOR_CHAIN.blockChain.plans ?? []);

  // Demo flags
  const [trainDelayActive, setTrainDelayActive] = useState(false);
  const [reoptimized, setReoptimized] = useState(false);
  const [blockApproved, setBlockApproved] = useState(false);

  // Audit
  const [auditEvents, setAuditEvents] = useState<AuditEvent[]>([]);

  // Toast
  const [toast, setToast] = useState<AppState["toast"]>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Live train animation
  const frameRef = useRef<ReturnType<typeof setInterval> | null>(null);
  useEffect(() => {
    frameRef.current = setInterval(() => {
      setLiveTrains((prev) =>
        prev.map((t) => ({
          ...t,
          position:
            (t.position + (t.direction === "UP" ? 0.008 : -0.008) + 1) % 1,
        }))
      );
    }, 3000);
    return () => {
      if (frameRef.current) clearInterval(frameRef.current);
    };
  }, []);

  // ============================================================
  // Helpers
  // ============================================================

  const stamp = () =>
    new Date().toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
    });

  const addAuditEvent = useCallback((e: Omit<AuditEvent, "id">) => {
    const id = `AE-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    setAuditEvents((prev) => [{ ...e, id }, ...prev]);
  }, []);

  const updateBlockStatus = useCallback(
    (id: string, status: BlockStatus) => {
      setBlockStatuses((prev) => ({ ...prev, [id]: status }));
    },
    []
  );

  const showToast = useCallback(
    (
      message: string,
      type: "success" | "info" | "warning" | "error" = "info"
    ) => {
      setToast({ message, type });
      if (toastTimer.current) clearTimeout(toastTimer.current);
      toastTimer.current = setTimeout(() => setToast(null), 3500);
    },
    []
  );

  // ============================================================
  // Pipeline controls
  // ============================================================

  const pushPipelineStep = useCallback((step: PipelineStep) => {
    setPipelineHistory((prev) => {
      const next = [...prev];
      const idx = next.findIndex((s) => s.stage === step.stage);
      if (idx >= 0) {
        next[idx] = { ...next[idx], ...step, ts: Date.now() };
      } else {
        next.push({ ...step, ts: Date.now() });
      }
      return next;
    });
  }, []);

  const resetPipeline = useCallback(() => {
    setPipelineStage("IDLE");
    setPipelineHistory(INITIAL_PIPELINE.map((s) => ({ ...s })));
  }, []);

  const advancePipeline = useCallback(
    (stage: PipelineStage, recordId?: string, summary?: string) => {
      setPipelineStage(stage);
      setPipelineHistory((prev) => {
        const stageOrder: PipelineStage[] = [
          "INGEST",
          "AI",
          "CONSTRAINT",
          "COORDINATION",
          "OPTIMIZE",
          "CONTROLLER",
          "LIVE",
          "REOPTIMIZE",
        ];
        const idx = stageOrder.indexOf(stage);
        return prev.map((s) => {
          const sIdx = stageOrder.indexOf(s.stage);
          if (sIdx < idx) return { ...s, status: "DONE" };
          if (s.stage === stage)
            return {
              ...s,
              status: "RUNNING",
              recordId: recordId ?? s.recordId,
              summary: summary ?? s.summary,
              ts: Date.now(),
            };
          return s;
        });
      });
    },
    []
  );

  // ============================================================
  // Data actions
  // ============================================================

  const triggerLiveEvent = useCallback(
    (eventId: string) => {
      const ev = LIVE_EVENTS_UI.find((e) => e.eventId === eventId);
      if (!ev) {
        showToast(`Unknown event ${eventId}`, "error");
        return;
      }

      setLiveEvents((prev) =>
        prev.map((e) =>
          e.eventId === eventId ? { ...e, status: "Active" } : e
        )
      );

      if (ev.eventType === "Train Delay" && ev.trainNo) {
        setLiveTrains((prev) =>
          prev.map((t) =>
            t.number === ev.trainNo
              ? {
                  ...t,
                  delay: Math.max(t.delay, 8),
                  status: "DELAYED",
                }
              : t
          )
        );
        setTrainDelayActive(true);
      }

      addAuditEvent({
        timestamp: stamp(),
        action: `LIVE EVENT: ${ev.eventType} on ${ev.sectionId}`,
        actor: "LIVE FEED",
        details: ev.description,
        type: "ALERT",
      });

      advancePipeline(
        "LIVE",
        ev.eventId,
        `${ev.eventType} · ${ev.sectionId}${
          ev.trainNo ? ` · Train ${ev.trainNo}` : ""
        }`
      );

      showToast(
        `${ev.eventType} · ${ev.sectionId}${
          ev.trainNo ? ` · ${ev.trainNo}` : ""
        }`,
        ev.severity === "Critical" ? "error" : "warning"
      );
    },
    [addAuditEvent, advancePipeline, showToast]
  );

  // ============================================================
  // Demo actions
  // ============================================================

  const triggerTrainDelay = useCallback(() => {
    triggerLiveEvent("EVT-002");
  }, [triggerLiveEvent]);

  const triggerReoptimize = useCallback(() => {
    setReoptimized(true);
    updateBlockStatus(ANCHOR_BLOCK_REQUEST_ID, "MODIFIED");

    const freshWindows =
      FEASIBLE_WINDOWS_BY_REQUEST[ANCHOR_BLOCK_REQUEST_ID] ?? [];
    const freshPlans =
      OPTIMIZED_PLANS_BY_REQUEST[ANCHOR_BLOCK_REQUEST_ID] ?? [];
    const feasible = freshWindows.find((w) => w.feasible);

    setActiveFeasibleWindows(freshWindows);
    setActiveOptimizedPlans(freshPlans);

    addAuditEvent({
      timestamp: stamp(),
      action: "Re-optimization complete",
      actor: "AI ENGINE",
      details: feasible
        ? `Updated ${ANCHOR_BLOCK_REQUEST_ID}: ${feasible.windowStart} → ${feasible.windowEnd}. Feasible window selected.`
        : `No feasible window found for ${ANCHOR_BLOCK_REQUEST_ID}.`,
      type: "AI",
    });

    advancePipeline(
      "REOPTIMIZE",
      feasible?.windowId,
      feasible
        ? `Updated window · ${feasible.windowStart}–${feasible.windowEnd}`
        : "No feasible window"
    );

    showToast(
      feasible
        ? `Updated plan generated · ${feasible.windowStart}–${feasible.windowEnd}`
        : "No feasible window found",
      feasible ? "success" : "error"
    );
  }, [addAuditEvent, advancePipeline, showToast, updateBlockStatus]);

  const approvePlan = useCallback(
    (planId: string) => {
      const plan = activeOptimizedPlans.find((p) => p.planId === planId);
      if (!plan) {
        showToast(`Plan ${planId} not found`, "error");
        return;
      }
      updateBlockStatus(plan.blockRequestId, "APPROVED");
      setBlockApproved(true);
      addAuditEvent({
        timestamp: stamp(),
        action: `Block ${plan.blockRequestId} approved`,
        actor: "COA USER",
        details: `Approved plan ${planId} · ${plan.startTime}–${plan.endTime} · ${plan.department}.`,
        type: "APPROVAL",
      });
      advancePipeline(
        "CONTROLLER",
        planId,
        `Approved · ${plan.startTime}–${plan.endTime}`
      );
      showToast(`Block ${plan.blockRequestId} approved`, "success");
    },
    [
      activeOptimizedPlans,
      addAuditEvent,
      advancePipeline,
      showToast,
      updateBlockStatus,
    ]
  );

  const modifyPlan = useCallback(
    (planId: string, newStart: string, newEnd: string) => {
      const plan = activeOptimizedPlans.find((p) => p.planId === planId);
      if (!plan) {
        showToast(`Plan ${planId} not found`, "error");
        return;
      }
      updateBlockStatus(plan.blockRequestId, "MODIFIED");
      addAuditEvent({
        timestamp: stamp(),
        action: `Block ${plan.blockRequestId} modified`,
        actor: "COA USER",
        details: `Modified plan ${planId} to ${newStart}–${newEnd}.`,
        type: "ACTION",
      });
      advancePipeline(
        "CONTROLLER",
        planId,
        `Modified · ${newStart}–${newEnd}`
      );
      showToast(`Block ${plan.blockRequestId} modified`, "info");
    },
    [
      activeOptimizedPlans,
      addAuditEvent,
      advancePipeline,
      showToast,
      updateBlockStatus,
    ]
  );

  const rejectPlan = useCallback(
    (planId: string, reason: string) => {
      const plan = activeOptimizedPlans.find((p) => p.planId === planId);
      if (!plan) {
        showToast(`Plan ${planId} not found`, "error");
        return;
      }
      if (!reason.trim()) {
        showToast("Please provide a rejection reason", "error");
        return;
      }
      updateBlockStatus(plan.blockRequestId, "REJECTED");
      addAuditEvent({
        timestamp: stamp(),
        action: `Block ${plan.blockRequestId} rejected`,
        actor: "COA USER",
        details: `Rejected: ${reason}`,
        type: "ACTION",
      });
      advancePipeline("CONTROLLER", planId, `Rejected · ${reason}`);
      showToast(`Block ${plan.blockRequestId} rejected`, "warning");
    },
    [
      activeOptimizedPlans,
      addAuditEvent,
      advancePipeline,
      showToast,
      updateBlockStatus,
    ]
  );

  // ============================================================
  // Reset
  // ============================================================

  const resetDemo = useCallback(() => {
    setRole("COA");
    setPage("overview");
    setEntered(false);
    setSelectedSection(null);
    setSelectedAsset(null);
    setSelectedBlock(ANCHOR_BLOCK_REQUEST_ID);
    setDemoStep(0);
    setDemoMode(false);
    setTrainDelayActive(false);
    setReoptimized(false);
    setBlockApproved(false);
    setLiveTrains(LIVE_TRAINS);
    setLiveEvents(LIVE_EVENTS_UI);
    setBlockStatuses(() => {
      const m: Record<string, BlockStatus> = {};
      BLOCK_REQUESTS.forEach((b) => {
        m[b.id] = b.status;
      });
      return m;
    });
    setActivePrediction(ANCHOR_CHAIN.prediction ?? null);
    setActiveFeasibleWindows(ANCHOR_CHAIN.blockChain.windows ?? []);
    setActiveOptimizedPlans(ANCHOR_CHAIN.blockChain.plans ?? []);
    setActiveBlockRequestId(ANCHOR_BLOCK_REQUEST_ID);
    setAuditEvents([]);
    resetPipeline();
    showToast("Demo reset — returning to Home", "info");
  }, [resetPipeline, showToast]);

  // ============================================================
  // Exposed context value
  // ============================================================

  const value = useMemo<AppState>(
    () => ({
      role,
      page,
      entered,
      selectedSection,
      selectedAsset,
      selectedBlock,
      demoStep,
      demoMode,
      liveTrains,
      blockStatuses,
      liveEvents,
      pipelineStage,
      pipelineHistory,
      activeBlockRequestId,
      activePrediction,
      activeFeasibleWindows,
      activeOptimizedPlans,
      trainDelayActive,
      reoptimized,
      blockApproved,
      auditEvents,
      toast,

      setRole,
      setPage,
      setEntered,
      setSelectedSection,
      setSelectedAsset,
      setSelectedBlock,
      setDemoStep,
      setDemoMode,

      setPipelineStage,
      pushPipelineStep,
      resetPipeline,
      advancePipeline,

      updateBlockStatus,
      addAuditEvent,
      triggerLiveEvent,

      triggerTrainDelay,
      triggerReoptimize,
      approvePlan,
      modifyPlan,
      rejectPlan,
      resetDemo,

      showToast,
    }),
    [
      role,
      page,
      entered,
      selectedSection,
      selectedAsset,
      selectedBlock,
      demoStep,
      demoMode,
      liveTrains,
      blockStatuses,
      liveEvents,
      pipelineStage,
      pipelineHistory,
      activeBlockRequestId,
      activePrediction,
      activeFeasibleWindows,
      activeOptimizedPlans,
      trainDelayActive,
      reoptimized,
      blockApproved,
      auditEvents,
      toast,
      pushPipelineStep,
      resetPipeline,
      advancePipeline,
      updateBlockStatus,
      addAuditEvent,
      triggerLiveEvent,
      triggerTrainDelay,
      triggerReoptimize,
      approvePlan,
      modifyPlan,
      rejectPlan,
      resetDemo,
      showToast,
    ]
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

// ============================================================
// Hook
// ============================================================

export function useApp(): AppState {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useApp must be used inside AppProvider");
  return ctx;
}