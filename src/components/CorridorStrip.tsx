import { useApp } from "../store";
import {
  SECTIONS,
  sectionHealth,
  tasksBySection,
  blocksBySection,
} from "../data/seed";

const HEALTH_COLOR = (h: number) =>
  h >= 90 ? "#3F8F45" : h >= 75 ? "#1769AA" : h >= 60 ? "#D97706" : "#D9534F";

/**
 * CorridorStrip — horizontal strip showing all 10 railway sections
 * with health colour, overdue tasks, and active blocks.
 * Click any section to select it globally.
 */
export default function CorridorStrip() {
  const { selectedSection, setSelectedSection } = useApp();

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-px overflow-x-auto">
        {SECTIONS.map((sec, i) => {
          const health = sectionHealth(sec.id);
          const active = selectedSection === sec.id;
          const tasks = tasksBySection(sec.id);
          const overdueCount = tasks.filter((t) => t.status === "OVERDUE").length;
          const blocks = blocksBySection(sec.id).filter((b) =>
            ["APPROVED", "RECOMMENDED"].includes(b.status)
          ).length;
          const hColor = HEALTH_COLOR(health);

          return (
            <div key={sec.id} className="flex items-center">
              {/* Node on left */}
              <button
                onClick={() => setSelectedSection(active ? null : sec.id)}
                className="flex flex-col items-center gap-0.5 group transition-all"
                style={{ minWidth: 72 }}
              >
                <div
                  className="w-3 h-3 rounded-full border-2 border-white shadow-sm transition-transform group-hover:scale-125"
                  style={{ background: active ? "#1769AA" : hColor }}
                />
                <span
                  className="text-xs font-semibold text-center leading-tight"
                  style={{
                    color: active ? "var(--infra-blue)" : "var(--text-primary)",
                    fontSize: 10,
                  }}
                >
                  {i === 0 ? sec.from : ""}
                </span>
              </button>

              {/* Section track */}
              <button
                onClick={() => setSelectedSection(active ? null : sec.id)}
                className="flex flex-col items-center gap-0.5 relative group"
                style={{ minWidth: 80 }}
              >
                <div
                  className="h-2 w-full rounded-sm relative flex items-center justify-center transition-all"
                  style={{
                    background: active
                      ? "#1769AA"
                      : health < 65
                      ? "#D9534F22"
                      : "#E2E8F0",
                    border: active
                      ? "1px solid #1769AA"
                      : `1px solid ${hColor}40`,
                    outline: active ? "2px solid #1769AA40" : "none",
                  }}
                >
                  {overdueCount > 0 && (
                    <span
                      className="absolute -top-2 text-xs font-bold"
                      style={{ color: "#D97706", fontSize: 9 }}
                    >
                      ▲{overdueCount}
                    </span>
                  )}
                </div>
                <span
                  className="text-center font-medium"
                  style={{
                    color: active ? "#1769AA" : "var(--text-secondary)",
                    fontSize: 9,
                    lineHeight: 1.2,
                  }}
                >
                  {sec.id}
                  <br />
                  <span style={{ color: hColor }}>{health}%</span>
                </span>

                {/* Hover tooltip */}
                <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 w-52 card p-2 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-30">
                  <p
                    className="font-semibold text-xs"
                    style={{ color: "var(--navy)" }}
                  >
                    {sec.id}: {sec.from}–{sec.to}
                  </p>
                  <p
                    className="text-xs mt-1"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    Health: <span style={{ color: hColor }}>{health}%</span>
                  </p>
                  <p
                    className="text-xs"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    Tasks: {tasks.length} · Overdue: {overdueCount}
                  </p>
                  <p
                    className="text-xs"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    Active Blocks: {blocks}
                  </p>
                  <p
                    className="text-xs mt-1"
                    style={{ color: "var(--text-secondary)", fontSize: 9 }}
                  >
                    {sec.trackConfiguration} · {sec.capacityTrainsPerHour} tph
                  </p>
                </div>
              </button>

              {/* Final station after last section */}
              {i === SECTIONS.length - 1 && (
                <button
                  onClick={() => setSelectedSection(null)}
                  className="flex flex-col items-center gap-0.5"
                  style={{ minWidth: 72 }}
                >
                  <div
                    className="w-3 h-3 rounded-full border-2 border-white shadow-sm"
                    style={{ background: hColor }}
                  />
                  <span
                    className="text-xs font-semibold text-center"
                    style={{ color: "var(--text-primary)", fontSize: 10 }}
                  >
                    {sec.to}
                  </span>
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 mt-1">
        <div className="flex items-center gap-1">
          <div
            className="w-2 h-2 rounded-full"
            style={{ background: "#3F8F45" }}
          />
          <span style={{ color: "var(--text-secondary)", fontSize: 10 }}>
            Healthy ≥90
          </span>
        </div>
        <div className="flex items-center gap-1">
          <div
            className="w-2 h-2 rounded-full"
            style={{ background: "#1769AA" }}
          />
          <span style={{ color: "var(--text-secondary)", fontSize: 10 }}>
            Good 75–89
          </span>
        </div>
        <div className="flex items-center gap-1">
          <div
            className="w-2 h-2 rounded-full"
            style={{ background: "#D97706" }}
          />
          <span style={{ color: "var(--text-secondary)", fontSize: 10 }}>
            Attention 60–74
          </span>
        </div>
        <div className="flex items-center gap-1">
          <div
            className="w-2 h-2 rounded-full"
            style={{ background: "#D9534F" }}
          />
          <span style={{ color: "var(--text-secondary)", fontSize: 10 }}>
            Critical &lt;60
          </span>
        </div>
        <div className="flex items-center gap-1">
          <span style={{ color: "#D97706", fontSize: 10 }}>▲</span>
          <span style={{ color: "var(--text-secondary)", fontSize: 10 }}>
            Overdue tasks
          </span>
        </div>
        {selectedSection && (
          <button
            onClick={() => setSelectedSection(null)}
            className="ml-auto text-xs"
            style={{ color: "var(--infra-blue)" }}
          >
            Clear selection ×
          </button>
        )}
      </div>
    </div>
  );
}