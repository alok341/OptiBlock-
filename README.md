# OptiBlock — AI-Assisted Railway Block Planning

Smart India Hackathon 2026 · Problem Statement 26027 · Ministry of Railways

OptiBlock is an AI-assisted, constraint-aware decision-support system for coordinated railway maintenance block planning. It helps plan maintenance windows for railway sections across Engineering, S&T, and Traction departments while respecting train movements, corridor availability, and operational constraints.

The controller remains the final authority — OptiBlock supports the decision, it does not replace it.

---

## The Problem

Railway maintenance requires dedicated time windows — called **blocks** — during which a section is made available for maintenance work. Planning these blocks is difficult because:

- Different departments often need the same section at the same time
- Requested windows frequently conflict with train schedules
- Corridor availability and crew resources add more constraints
- A single operational change can invalidate an existing plan

Today, this planning is fragmented across departments and mostly manual.

---

## The Solution

OptiBlock brings all the inputs into one workflow and produces feasible, optimized block windows.
Railway Data
↓
AI Risk & Priority Scoring
↓
Constraint Validation
↓
Cross-Department Coordination
↓
OR-Tools Optimization
↓
Controller Review
↓
Live Event → Re-Optimization

text

Each stage is visible in the app through a pipeline indicator that lights up as the plan moves forward.

---

## How It Works — One Complete Cycle

The prototype demonstrates a full end-to-end scenario:

1. **Data ingestion** — 17 datasets covering assets, tasks, trains, corridors, crews, and live events are loaded into a unified view
2. **AI prediction** — track asset TRK-104 on section SEC-102 is flagged with high risk and high priority
3. **Block request** — an emergency request (BLK-541) comes in for that section
4. **Constraint check** — the requested window conflicts with a scheduled train and is rejected
5. **Feasible window** — an alternative window with zero conflicts is identified
6. **Coordination** — a compatible S&T task on the same section is matched
7. **Optimization** — the optimizer schedules one combined block with zero delay
8. **Controller review** — the recommended plan is sent to the Control Office
9. **Approval** — the controller approves it, recorded in the audit trail
10. **Live event** — a new critical defect appears on the same asset
11. **Re-optimization** — the system recalculates constraints and re-runs
12. **Updated plan** — a revised plan is submitted back to the controller

The controller keeps final authority at every step.

---

## Key Capabilities

- **AI-assisted prioritization** — risk, health, and priority scores per asset
- **Constraint-aware planning** — hard operational rules are checked before optimization
- **Cross-department coordination** — Engineering, S&T, and Traction work can be combined when compatible
- **Optimized block scheduling** — minimizes train delays and maximizes block utilization
- **Human-in-the-loop** — Approve / Modify / Reject / Replan actions for the controller
- **Live re-optimization** — adapts when operational conditions change
- **Full audit trail** — every decision is recorded
- **Explainability** — each recommendation includes a "WHY?" breakdown

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React · TypeScript · Vite |
| Styling | Tailwind CSS |
| Charts | Recharts |
| Maps | Custom SVG |
| Data | 17 synthetic CSV datasets |

Production stack planned: Spring Boot · PostgreSQL + PostGIS · Redis · Python + FastAPI · Google OR-Tools CP-SAT · Apache Kafka · Docker.

---

## Datasets

The prototype uses 17 synthetic CSV datasets — 13 source datasets (assets, tasks, blocks, corridor availability, trains, crews, constraints, history, network) and 4 derived output datasets (AI predictions, feasible windows, optimized plans, live events).

All records are internally consistent through shared identifiers (`section_id`, `asset_id`, `block_request_id`, `train_no`), so any asset, block, conflict, or plan can be traced end to end.

---

## Running the Project

```bash
npm install
npm run dev
Open http://localhost:8443.

How to Explore
Pick a role on the landing page — Control Office, Engineering, S&T, Traction, or Admin

Navigate through the sidebar — Overview, Maintenance, Block Planning, Live Operations, Railway Health, Coordination, Conflicts, What-If, Reports, Architecture

Click Demo Mode in the top bar to see a 12-step guided walkthrough of the complete pipeline

The demo automatically advances through the pipeline, selects the relevant asset and section, approves the recommended plan, fires a live event, and runs re-optimization.

What This Prototype Is
A working demonstration of the full planning pipeline

Driven entirely by structured CSV data

Built around one traceable end-to-end scenario

What This Prototype Is Not
Not connected to any real Indian Railways system

Not a production ML model — predictions are simulated

Not a full digital twin — a simplified network model for decision support

Not autonomous — the controller retains final authority at every step

All data is synthetic and created for demonstration purposes only.

Team GatiShakti
Smart India Hackathon 2026
Problem Statement 26027 — Ministry of Railways
