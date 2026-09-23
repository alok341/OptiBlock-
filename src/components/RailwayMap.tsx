import { useRef } from "react";
import { useApp } from "../store";
import {
  SECTIONS,
  ASSETS,
  MAINTENANCE_TASKS,
  BLOCK_REQUESTS,
  sectionHealth,
} from "../data/seed";
import SectionDetail from "./SectionDetail";
import type { LiveTrain } from "../types";

// ============================================================
// Station layout for the Kalyan–CSMT corridor with branches.
// Positions are hand-tuned so the 10 sections fit visually.
// ============================================================

const STATIONS: Record<string, { x: number; y: number; label: string }> = {
  Kalyan:      { x: 60,  y: 180, label: "Kalyan" },
  Dombivli:    { x: 175, y: 165, label: "Dombivli" },
  Thane:       { x: 300, y: 145, label: "Thane" },
  Mulund:      { x: 430, y: 135, label: "Mulund" },
  Kurla:       { x: 560, y: 130, label: "Kurla" },
  Sion:        { x: 690, y: 135, label: "Sion" },
  Dadar:       { x: 810, y: 150, label: "Dadar" },
  CSMT:        { x: 900, y: 175, label: "CSMT" },
  // Branch: SEC-108 Kalyan–Shahad
  Shahad:      { x: 60,  y: 270, label: "Shahad" },
  // Branch: SEC-109 Thane–Airoli
  Airoli:      { x: 300, y: 280, label: "Airoli" },
  // Branch: SEC-110 Kurla–Vidyavihar
  Vidyavihar:  { x: 560, y: 260, label: "Vidyavihar" },
};

/** Map section → from/to stations for the SVG. */
const SECTION_ENDPOINTS: Record<string, { from: string; to: string }> = {
  "SEC-101": { from: "Kalyan",    to: "Dombivli" },
  "SEC-102": { from: "Dombivli",  to: "Thane" },
  "SEC-103": { from: "Thane",     to: "Mulund" },
  "SEC-104": { from: "Mulund",    to: "Kurla" },
  "SEC-105": { from: "Kurla",     to: "Sion" },
  "SEC-106": { from: "Sion",      to: "Dadar" },
  "SEC-107": { from: "Dadar",     to: "CSMT" },
  "SEC-108": { from: "Kalyan",    to: "Shahad" },
  "SEC-109": { from: "Thane",     to: "Airoli" },
  "SEC-110": { from: "Kurla",     to: "Vidyavihar" },
};

function lerpPoint(
  a: { x: number; y: number },
  b: { x: number; y: number },
  t: number
) {
  return { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t };
}

function getTrainPos(train: LiveTrain) {
  const endpoints = SECTION_ENDPOINTS[train.section];
  if (!endpoints) return null;
  const from = STATIONS[endpoints.from];
  const to = STATIONS[endpoints.to];
  if (!from || !to) return null;
  const p = train.direction === "DOWN" ? 1 - train.position : train.position;
  return lerpPoint(from, to, Math.max(0.08, Math.min(0.92, p)));
}

const HEALTH_COLOR = (h: number) =>
  h >= 90 ? "#3F8F45" : h >= 75 ? "#1769AA" : h >= 60 ? "#D97706" : "#D9534F";

interface Props {
  compact?: boolean;
  showDetail?: boolean;
}

export default function RailwayMap({ compact = false, showDetail = true }: Props) {
  const {
    selectedSection,
    setSelectedSection,
    selectedAsset,
    setSelectedAsset,
    liveTrains,
    trainDelayActive,
    activePrediction,
    activeBlockRequestId,
  } = useApp();

  const svgRef = useRef<SVGSVGElement>(null);
  const vH = compact ? 300 : 360;

  const hasBlock = (sectionId: string) =>
    BLOCK_REQUESTS.some(
      (b) => b.section === sectionId && ["APPROVED", "RECOMMENDED"].includes(b.status)
    );
  const hasOverdue = (sectionId: string) =>
    MAINTENANCE_TASKS.some((t) => t.section === sectionId && t.status === "OVERDUE");
  const hasCritical = (sectionId: string) =>
    ASSETS.some(
      (a) =>
        a.section === sectionId &&
        (a.health < 65 || a.criticality === "CRITICAL")
    );

  // Anchor asset: TRK-104 on SEC-102 (from ai_predictions.csv)
  const anchorAssetId = activePrediction?.assetId ?? "TRK-104";
  const anchorSectionId = activePrediction?.sectionId ?? "SEC-102";
  const anchorAsset = ASSETS.find((a) => a.id === anchorAssetId);

  return (
    <div className="relative w-full" style={{ height: vH }}>
      <svg
        ref={svgRef}
        width="100%"
        height="100%"
        viewBox={`0 0 960 ${vH}`}
        style={{ background: "#F7F9FC" }}
        className="rounded"
      >
        {/* Grid */}
        {Array.from({ length: 10 }).map((_, i) => (
          <line
            key={`h${i}`}
            x1={0}
            y1={i * 40}
            x2={960}
            y2={i * 40}
            stroke="#E2E8F0"
            strokeWidth={0.4}
          />
        ))}
        {Array.from({ length: 13 }).map((_, i) => (
          <line
            key={`v${i}`}
            x1={i * 80}
            y1={0}
            x2={i * 80}
            y2={vH}
            stroke="#E2E8F0"
            strokeWidth={0.4}
          />
        ))}

        {/* Section lines */}
        {SECTIONS.map((sec) => {
          const endpoints = SECTION_ENDPOINTS[sec.id];
          if (!endpoints) return null;
          const from = STATIONS[endpoints.from];
          const to = STATIONS[endpoints.to];
          if (!from || !to) return null;

          const active = selectedSection === sec.id;
          const health = sectionHealth(sec.id);
          const hc = HEALTH_COLOR(health);
          const block = hasBlock(sec.id);
          const overdue = hasOverdue(sec.id);
          const critical = hasCritical(sec.id);
          const mid = lerpPoint(from, to, 0.5);

          return (
            <g key={sec.id}>
              {/* Hit area */}
              <line
                x1={from.x}
                y1={from.y}
                x2={to.x}
                y2={to.y}
                stroke="transparent"
                strokeWidth={22}
                style={{ cursor: "pointer" }}
                onClick={() => setSelectedSection(active ? null : sec.id)}
              />

              {/* Base track */}
              <line
                x1={from.x}
                y1={from.y}
                x2={to.x}
                y2={to.y}
                stroke={active ? "#1769AA" : "#94A3B8"}
                strokeWidth={active ? 6 : 4}
                strokeLinecap="round"
              />

              {/* Health overlay */}
              {health < 80 && (
                <line
                  x1={from.x}
                  y1={from.y}
                  x2={to.x}
                  y2={to.y}
                  stroke={hc}
                  strokeWidth={2}
                  strokeDasharray={health < 70 ? "8 5" : "12 6"}
                  strokeOpacity={0.8}
                  style={{ pointerEvents: "none" }}
                />
              )}

              {/* Block marker */}
              {block && (
                <line
                  x1={lerpPoint(from, to, 0.25).x}
                  y1={lerpPoint(from, to, 0.25).y}
                  x2={lerpPoint(from, to, 0.75).x}
                  y2={lerpPoint(from, to, 0.75).y}
                  stroke="#6B3FA0"
                  strokeWidth={5}
                  strokeOpacity={0.5}
                  style={{ pointerEvents: "none" }}
                />
              )}

              {/* Section ID */}
              <text
                x={mid.x}
                y={mid.y + 20}
                textAnchor="middle"
                fontSize={9}
                fontFamily="JetBrains Mono, monospace"
                fontWeight="600"
                fill={active ? "#1769AA" : "#94A3B8"}
                style={{ pointerEvents: "none" }}
              >
                {sec.id}
              </text>

              {/* Overdue badge */}
              {overdue && (
                <text
                  x={mid.x}
                  y={mid.y - 12}
                  textAnchor="middle"
                  fontSize={11}
                  fill="#D97706"
                  style={{ pointerEvents: "none" }}
                >
                  ▲
                </text>
              )}

              {/* Critical badge */}
              {critical && !overdue && (
                <circle
                  cx={mid.x}
                  cy={mid.y - 12}
                  r={5}
                  fill="#D9534F"
                  opacity={0.8}
                  style={{ pointerEvents: "none" }}
                />
              )}

              {/* Active glow */}
              {active && (
                <line
                  x1={from.x}
                  y1={from.y}
                  x2={to.x}
                  y2={to.y}
                  stroke="#1769AA"
                  strokeWidth={12}
                  strokeOpacity={0.15}
                  style={{ pointerEvents: "none" }}
                />
              )}
            </g>
          );
        })}

        {/* Stations */}
        {Object.entries(STATIONS).map(([id, st]) => (
          <g key={id}>
            <line
              x1={st.x - 8}
              y1={st.y + 10}
              x2={st.x + 8}
              y2={st.y + 10}
              stroke="#CBD5E1"
              strokeWidth={3}
            />
            <circle
              cx={st.x}
              cy={st.y}
              r={10}
              fill="white"
              stroke="#17324D"
              strokeWidth={2.5}
            />
            <circle cx={st.x} cy={st.y} r={6} fill="#17324D" />
            <text
              x={st.x}
              y={st.y - 18}
              textAnchor="middle"
              fontSize={10}
              fontFamily="Inter, sans-serif"
              fontWeight="700"
              fill="#17324D"
            >
              {st.label}
            </text>
          </g>
        ))}

        {/* Anchor asset marker (TRK-104 on SEC-102) */}
        {anchorAsset && (() => {
          const endpoints = SECTION_ENDPOINTS[anchorSectionId];
          if (!endpoints) return null;
          const from = STATIONS[endpoints.from];
          const to = STATIONS[endpoints.to];
          if (!from || !to) return null;
          const pos = lerpPoint(from, to, 0.4);
          const isSelected = selectedAsset === anchorAsset.id;
          const isCritical = anchorAsset.criticality === "CRITICAL";

          return (
            <g
              style={{ cursor: "pointer" }}
              onClick={() =>
                setSelectedAsset(isSelected ? null : anchorAsset.id)
              }
            >
              {isSelected && (
                <circle
                  cx={pos.x}
                  cy={pos.y - 26}
                  r={14}
                  fill="#D9534F"
                  fillOpacity={0.2}
                />
              )}
              <circle
                cx={pos.x}
                cy={pos.y - 26}
                r={9}
                fill={isCritical ? "#D9534F" : "#D97706"}
                stroke="white"
                strokeWidth={2}
              />
              <text
                x={pos.x}
                y={pos.y - 22}
                textAnchor="middle"
                fontSize={10}
                fill="white"
                fontWeight="bold"
              >
                !
              </text>
              <text
                x={pos.x}
                y={pos.y - 11}
                textAnchor="middle"
                fontSize={8}
                fill="#D9534F"
                fontFamily="JetBrains Mono, monospace"
                fontWeight="700"
              >
                {anchorAsset.id}
              </text>
              <text
                x={pos.x}
                y={pos.y - 2}
                textAnchor="middle"
                fontSize={7}
                fill="#94A3B8"
                fontFamily="Inter"
              >
                P{anchorAsset.priority ?? "?"} · H{anchorAsset.health}
              </text>
            </g>
          );
        })()}

        {/* Anchor block marker */}
        {activeBlockRequestId && (() => {
          const endpoints = SECTION_ENDPOINTS[anchorSectionId];
          if (!endpoints) return null;
          const from = STATIONS[endpoints.from];
          const to = STATIONS[endpoints.to];
          if (!from || !to) return null;
          const pos = lerpPoint(from, to, 0.7);
          return (
            <g>
              <rect
                x={pos.x - 26}
                y={pos.y - 42}
                width={52}
                height={16}
                rx={3}
                fill="#6B3FA0"
                fillOpacity={0.15}
                stroke="#6B3FA0"
                strokeWidth={1}
              />
              <text
                x={pos.x}
                y={pos.y - 31}
                textAnchor="middle"
                fontSize={8}
                fill="#6B3FA0"
                fontFamily="JetBrains Mono, monospace"
                fontWeight="700"
              >
                {activeBlockRequestId}
              </text>
              <line
                x1={pos.x}
                y1={pos.y - 26}
                x2={pos.x}
                y2={pos.y - 10}
                stroke="#6B3FA0"
                strokeWidth={1}
                strokeDasharray="2 2"
              />
            </g>
          );
        })()}

        {/* Live trains */}
        {liveTrains.map((train) => {
          const pos = getTrainPos(train);
          if (!pos) return null;
          const isDelayed =
            train.delay > 0 || (trainDelayActive && train.status === "DELAYED");
          const color = isDelayed
            ? "#D97706"
            : train.type === "GOODS"
            ? "#64748B"
            : "#3F8F45";

          return (
            <g key={train.number}>
              <rect
                x={pos.x - 11}
                y={pos.y - 8}
                width={22}
                height={13}
                rx={2}
                fill={color}
                opacity={0.92}
              />
              <text
                x={pos.x}
                y={pos.y + 1}
                textAnchor="middle"
                fontSize={6}
                fill="white"
                fontFamily="JetBrains Mono, monospace"
                fontWeight="600"
              >
                {train.number.slice(-4)}
              </text>
              {isDelayed && (
                <>
                  <rect
                    x={pos.x - 14}
                    y={pos.y - 22}
                    width={28}
                    height={12}
                    rx={2}
                    fill="#FEF3C7"
                    stroke="#F59E0B"
                    strokeWidth={0.5}
                  />
                  <text
                    x={pos.x}
                    y={pos.y - 13}
                    textAnchor="middle"
                    fontSize={7}
                    fill="#B45309"
                    fontFamily="JetBrains Mono, monospace"
                    fontWeight="700"
                  >
                    +{train.delay}m
                  </text>
                </>
              )}
            </g>
          );
        })}

        {/* Legend */}
        {!compact && (
          <g transform={`translate(14, ${vH - 52})`}>
            <rect
              x={0}
              y={0}
              width={420}
              height={48}
              rx={4}
              fill="white"
              fillOpacity={0.9}
              stroke="#E2E8F0"
              strokeWidth={0.5}
            />
            <circle cx={12} cy={14} r={5} fill="#3F8F45" />
            <text x={21} y={18} fontSize={8} fill="#374151" fontFamily="Inter">
              Train (on time)
            </text>
            <circle cx={90} cy={14} r={5} fill="#D97706" />
            <text x={99} y={18} fontSize={8} fill="#374151" fontFamily="Inter">
              Train (delayed)
            </text>
            <rect
              x={160}
              y={9}
              width={18}
              height={10}
              rx={2}
              fill="#6B3FA0"
              fillOpacity={0.3}
              stroke="#6B3FA0"
              strokeWidth={0.8}
            />
            <text x={182} y={18} fontSize={8} fill="#374151" fontFamily="Inter">
              Block
            </text>
            <circle cx={218} cy={14} r={5} fill="#D9534F" />
            <text x={227} y={18} fontSize={8} fill="#374151" fontFamily="Inter">
              Critical
            </text>
            <text x={268} y={17} fontSize={10} fill="#D97706">
              ▲
            </text>
            <text x={278} y={18} fontSize={8} fill="#374151" fontFamily="Inter">
              Overdue
            </text>

            <text
              x={4}
              y={34}
              fontSize={7}
              fill="#94A3B8"
              fontFamily="Inter"
            >
              PROTOTYPE SIMULATION — Kalyan–CSMT Corridor · Click any section or asset
            </text>
          </g>
        )}
      </svg>

      {showDetail && selectedSection && <SectionDetail />}

      {/* Selected asset quick view (other than anchor) */}
      {selectedAsset &&
        selectedAsset !== anchorAssetId &&
        (() => {
          const asset = ASSETS.find((a) => a.id === selectedAsset);
          if (!asset) return null;
          return (
            <div className="absolute top-2 left-2 card p-3 w-56 shadow-lg slide-in z-10">
              <div className="flex items-center justify-between mb-1.5">
                <span
                  className="font-bold text-xs"
                  style={{ color: "var(--navy)" }}
                >
                  {asset.id}
                </span>
                <button
                  onClick={() => setSelectedAsset(null)}
                  style={{ color: "var(--text-secondary)", fontSize: 14 }}
                >
                  ×
                </button>
              </div>
              <p className="text-xs" style={{ color: "var(--text-secondary)" }}>
                {asset.type} · {asset.section}
              </p>
              <div className="flex gap-2 mt-1.5">
                <div>
                  <p style={{ fontSize: 9, color: "var(--text-secondary)" }}>
                    Health
                  </p>
                  <p
                    className="font-bold"
                    style={{ color: HEALTH_COLOR(asset.health) }}
                  >
                    {asset.health}
                  </p>
                </div>
                <div>
                  <p style={{ fontSize: 9, color: "var(--text-secondary)" }}>
                    Risk
                  </p>
                  <p className="font-bold" style={{ color: "#D9534F" }}>
                    {asset.risk}%
                  </p>
                </div>
                <div>
                  <p style={{ fontSize: 9, color: "var(--text-secondary)" }}>
                    Dept
                  </p>
                  <span
                    className="chip chip-gray"
                    style={{ fontSize: 8 }}
                  >
                    {asset.department === "ST" ? "S&T" : asset.department}
                  </span>
                </div>
              </div>
            </div>
          );
        })()}
    </div>
  );
}