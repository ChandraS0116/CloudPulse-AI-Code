# CloudPulse AI — Visakhapatnam Civic Infrastructure Intelligence Platform

> **Agentic AI • 7-Agent Orchestration • Computer Vision • Geospatial Polygon Intelligence • Cloud Realtime • Municipal Action**

CloudPulse AI is an Agentic AI platform designed specifically for the urban sectors of **Visakhapatnam (Vizag), Andhra Pradesh**, transforming citizen defect reports into prioritized, verified municipal interventions.

---

## 🚀 1-Click Showcase Demo Flow

The core end-to-end demonstration connects citizen reporting to municipal command operations:

```
📱 CITIZEN MOBILE APP (PWA / Simulator)
   └── Captures photo (Pothole on Beach Road, Water burst in Gajuwaka)
   └── Validates GPS against CloudPulse Vizag Operational Zone Polygon
   └── Submits report
         │
         ▼ (Near Real-Time Broadcast / Supabase Channel)
☁️ 7-AGENT AI SWARM ORCHESTRATOR
   ├── 1. Orchestrator: Initializes execution DAG
   ├── 2. Vision Agent: Segments defect cavity & depth
   ├── 3. Geo Agent: Ray-casting operational zone check & GVMC ward resolution
   ├── 4. Triage Agent: Traffic density fusion & P1-P4 kinetic hazard score
   ├── 5. Correlation Agent: <50m duplicate detection (merges reports) & 800m hotspot clustering
   ├── 6. Decision Agent: Synthesizes multi-agent consensus & SLA window
   └── 7. Monitoring Agent: Dispatches municipal work order (MNT-*) & lifecycle tracker
         │
         ▼ (Near Real-Time Synchronized Event Bus)
💻 VIZAG COMMAND CENTER
   ├── "NEW INCIDENT DETECTED" animated arrival banner
   ├── Pulsating coordinate pin on Live GIS Map
   ├── Real-time KPI counter increment
   ├── Automated re-ranking in Priority Queue
   ├── Live Activity Feed audit log
   ├── Hotspot radar cluster recalculation
   └── Click to inspect complete 7-agent trace & execute status transitions
```

---

## 🛠️ How to Run CloudPulse AI

### 1. Frontend (Command Center + Citizen Mobile App)

In your terminal:
```bash
npm run dev
```
Open **http://localhost:5173** (or the port Vite prints in your console).

### 2. Optional: Side-by-Side Mobile Simulator
Click the **"📱 Citizen Phone Simulator"** button in the top navigation bar to open the live citizen phone right beside the Command Center on a single display! Submit a pothole on the phone frame and immediately watch the Command Center on the left react in near-real-time with:
- The pulsing banner `"NEW INCIDENT DETECTED"`
- Pulsating pin on the map
- KPI counters incrementing
- Duplicate merging if reported near an existing issue (<50m)
- Instant lifecycle progression syncing back to the citizen's "My Reports" tab

### 3. Optional: FastAPI Backend (Python)

If you wish to run the Python LangGraph backend:
```bash
cd backend
python -m pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```
Interactive API Swagger docs available at **http://localhost:8000/docs**.

---

## 🗺️ Dual Map Cartography Engine

The Command Center provides a seamless map provider toggle in the top-right corner of the map:

1. **CloudPulse Vector Radar (Default)**:
   - High-performance, zero-latency vector cartography designed specifically for the Visakhapatnam urban corridor (MVP Colony, Gajuwaka, Dwaraka Nagar, Siripuram, RK Beach Promenade, Rushikonda IT Hill, Madhurawada).
   - Works 100% offline out-of-the-box without any required API keys.
   - Interactive hotspot circles, pulsing pins on new arrivals, and duplicate count badges.

2. **Real Google Maps JavaScript API**:
   - Displays real roads, road names, POIs, satellite hybrid layer, and live places search.
   - Configure your API key in `.env.local`:
     ```bash
     VITE_GOOGLE_MAPS_API_KEY=your_google_maps_platform_api_key
     ```
   - If unconfigured, switching to Google Maps renders a clean setup state with configuration guidance.

---

## ☁️ Realtime Sync & Data Persistence

1. **Cross-Device Cloud Sync (Supabase Realtime)**:
   - Provide `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in `.env.local` to sync across different laptops and mobile phones in near real-time.
   - Run `supabase/schema.sql` in your Supabase SQL Editor to set up all tables, RLS, and realtime publications.

2. **Local Zero-Config Fallback (LocalStorage + BroadcastChannel)**:
   - Works immediately out-of-the-box.
   - Changes in one browser tab or window instantly propagate to other open tabs via `BroadcastChannel('cloudpulse_vizag_sync')`.
   - Data persists across browser refreshes via localStorage.

---

## 🤖 7-Agent Swarm Specification & Honest AI Labeling

All agent executions are explicitly labeled:
- **`AI MODE: DEMO — DETERMINISTIC`**: Transparently identifies deterministic heuristic inference for showcase evaluation without simulating non-existent neural endpoints.
- **`AI MODE: LIVE`**: Dynamically active when `VITE_AI_PROVIDER_API_KEY` is configured.

| Agent | Core Responsibility | Key Telemetry Outputs |
|---|---|---|
| **1. Orchestrator** | Coordinates DAG state machine & lifecycle | Dispatched parallel branches, DAG execution timing |
| **2. Vision Agent** | Computer vision defect segmentation | Cavity depth, confidence score, bounding box |
| **3. Geo Agent** | Ray-casting Vizag operational zone polygon | In-zone check, ward assignment, nearest transit node |
| **4. Triage Agent** | Kinetic hazard assessment & traffic weighting | P1–P4 priority, accident probability, exposure factor |
| **5. Correlation Agent** | Spatial deduplication (<50m) & hotspot clustering | Duplicate consolidation, cluster velocity (+34% in 48h) |
| **6. Decision Agent** | Multi-agent consensus & human-readable rationale | Action recommendation, resolution SLA window |
| **7. Monitoring Agent** | Municipal work order & lifecycle status dispatch | Case ID (`MNT-*`), department routing, push alerts |

---

## 📍 Visakhapatnam Operational Context

- **Operational Zone Polygon**: Ray-casting point-in-polygon boundary spanning Kurmannapalem/Gajuwaka/Duvvada in the south, through Port, Jagadamba, RK Beach, Waltair, Siripuram, MVP Colony, Rushikonda, Madhurawada, up to Bheemili.
- **Municipal Departments**:
  - GVMC Road Maintenance Wing
  - GVMC Water Supply & Drainage
  - GVMC Solid Waste Management
  - APEPDCL Electrical Infrastructure
- **Arterials**: NH-16 National Highway, Beach Road Coastal Highway, VIP Road, Waltair Main Road.
