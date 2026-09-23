import { useApp } from "../store";
import type { Page, Role } from "../types";

const NAV: { id: Page; label: string; icon: string }[] = [
  { id: "overview", label: "Overview", icon: "⊞" },
  { id: "maintenance", label: "Maintenance", icon: "⚙" },
  { id: "block-planning", label: "Block Planning", icon: "▦" },
  { id: "live-operations", label: "Live Operations", icon: "◉" },
  { id: "railway-health", label: "Railway Health", icon: "♡" },
  { id: "coordination", label: "Coordination", icon: "⇌" },
  { id: "conflicts", label: "Conflicts", icon: "△" },
  { id: "what-if", label: "What-If", icon: "≈" },
  { id: "reports", label: "Reports", icon: "⊟" },
  { id: "architecture", label: "Architecture", icon: "⊕" },
];

const ROLES: { id: Role; label: string; color: string }[] = [
  { id: "COA", label: "COA / Control Office", color: "#17324D" },
  { id: "ENGINEERING", label: "Engineering", color: "#1769AA" },
  { id: "ST", label: "S&T", color: "#6B3FA0" },
  { id: "TRACTION", label: "Traction", color: "#16827A" },
  { id: "ADMIN", label: "Admin", color: "#64748B" },
];

export default function Sidebar() {
  const {
    page,
    setPage,
    role,
    setRole,
    resetDemo,
    liveEvents,
    pipelineStage,
    demoMode,
  } = useApp();

  const activeEvents = liveEvents.filter((e) => e.status === "Active").length;

  return (
    <aside
      style={{ background: "var(--navy)", width: 220, minHeight: "100vh" }}
      className="flex flex-col flex-shrink-0 select-none"
    >
      {/* Brand */}
      <div className="px-5 py-5 border-b border-white/10">
        <div className="flex items-center gap-2 mb-1">
          <div
            style={{ background: "#1769AA" }}
            className="w-6 h-6 rounded flex items-center justify-center"
          >
            <span className="text-white text-xs font-bold">R</span>
          </div>
          <span className="text-white font-bold text-sm tracking-wide">
            OPTIBLOCK
          </span>
        </div>
        <p className="text-white/40 text-xs">AI-Assisted Block Planning</p>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-3">
        {NAV.map((item) => {
          const active = page === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setPage(item.id)}
              className="w-full flex items-center gap-3 px-5 py-2.5 text-left transition-colors"
              style={{
                background: active ? "rgba(23,105,170,0.35)" : "transparent",
                color: active ? "#fff" : "rgba(255,255,255,0.55)",
                borderLeft: active ? "2px solid #1769AA" : "2px solid transparent",
              }}
            >
              <span className="text-base w-4 text-center">{item.icon}</span>
              <span className="text-xs font-medium tracking-wide">
                {item.label}
              </span>
              {item.id === "live-operations" && (
                <span
                  className="ml-auto w-2 h-2 rounded-full pulse-dot"
                  style={{ background: "#16827A" }}
                />
              )}
              {item.id === "conflicts" && activeEvents > 0 && (
                <span
                  className="ml-auto text-xs font-bold"
                  style={{ color: "#D9534F" }}
                >
                  {activeEvents}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Pipeline status pill (only in demo mode) */}
      {demoMode && pipelineStage !== "IDLE" && (
        <div className="px-4 py-2 border-t border-white/10">
          <p className="text-white/40 text-xs mb-1 uppercase tracking-wider">
            Pipeline
          </p>
          <div
            className="rounded px-2 py-1.5"
            style={{ background: "rgba(107,63,160,0.35)" }}
          >
            <p className="text-white text-xs font-bold">{pipelineStage}</p>
          </div>
        </div>
      )}

      {/* Role switcher */}
      <div className="border-t border-white/10 px-4 py-4">
        <p className="text-white/40 text-xs mb-2 uppercase tracking-wider">
          Role
        </p>
        <select
          value={role}
          onChange={(e) => setRole(e.target.value as Role)}
          className="w-full text-xs rounded px-2 py-1.5 outline-none cursor-pointer"
          style={{
            background: "rgba(255,255,255,0.08)",
            color: "#fff",
            border: "1px solid rgba(255,255,255,0.15)",
          }}
        >
          {ROLES.map((r) => (
            <option
              key={r.id}
              value={r.id}
              style={{ background: "#17324D" }}
            >
              {r.label}
            </option>
          ))}
        </select>
      </div>

      {/* Reset */}
      <div className="px-4 pb-5">
        <button
          onClick={resetDemo}
          className="w-full text-xs py-2 rounded font-semibold transition-colors"
          style={{
            background: "rgba(217,83,79,0.2)",
            color: "#f87171",
            border: "1px solid rgba(217,83,79,0.3)",
          }}
        >
          RESET DEMO
        </button>
        <p className="text-center text-white/25 text-xs mt-2">
          Smart India Hackathon 2026
        </p>
      </div>
    </aside>
  );
}