import { AppProvider, useApp } from "./store";
import Sidebar from "./components/Sidebar";
import TopBar from "./components/TopBar";
import PipelineHUD from "./components/PipelineHUD";
import DemoMode from "./components/DemoMode";
import Overview from "./pages/Overview";
import Maintenance from "./pages/Maintenance";
import BlockPlanning from "./pages/BlockPlanning";
import LiveOperations from "./pages/LiveOperations";
import RailwayHealth from "./pages/RailwayHealth";
import Coordination from "./pages/Coordination";
import Conflicts from "./pages/Conflicts";
import WhatIf from "./pages/WhatIf";
import Reports from "./pages/Reports";
import Architecture from "./pages/Architecture";

function AppInner() {
  const { page } = useApp();

  const PAGE_MAP: Record<string, React.ReactNode> = {
    overview: <Overview />,
    maintenance: <Maintenance />,
    "block-planning": <BlockPlanning />,
    "live-operations": <LiveOperations />,
    "railway-health": <RailwayHealth />,
    coordination: <Coordination />,
    conflicts: <Conflicts />,
    "what-if": <WhatIf />,
    reports: <Reports />,
    architecture: <Architecture />,
  };

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: "var(--bg)" }}>
      <Sidebar />
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <TopBar />
        <PipelineHUD />
        <main className="flex-1 overflow-hidden" style={{ background: "var(--bg)" }}>
          {PAGE_MAP[page] || <Overview />}
        </main>
      </div>
      <DemoMode />
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppInner />
    </AppProvider>
  );
}