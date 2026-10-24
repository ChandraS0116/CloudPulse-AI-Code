import React, { useState, useEffect } from 'react';
import { 
  Radio, 
  Flame, 
  Clock, 
  Activity, 
  AlertTriangle, 
  CheckCircle2, 
  Filter, 
  ArrowUpRight, 
  ChevronRight,
  TrendingUp,
  Cpu,
  Layers,
  Sparkles,
  X,
  BellRing,
  ShieldCheck,
  Zap,
  RefreshCw,
  Eye,
  Camera,
  MapPin
} from 'lucide-react';
import { incidentStore } from '../services/incidentStore';
import { Incident, Hotspot, LiveActivityEvent, IncidentStatus } from '../types';
import { VizagMap } from '../components/map/VizagMap';
import { DashboardVisionView } from '../components/investigation/DashboardVisionView';
import { ActiveTab } from '../components/layout/AppShell';
import { AgentMeshFlow } from '../components/agents/AgentMeshFlow';

interface CommandCenterViewProps {
  onNavigate: (tab: ActiveTab) => void;
  onOpenIncidentDetail: (incident: Incident) => void;
}

export const CommandCenterView: React.FC<CommandCenterViewProps> = ({ 
  onNavigate, 
  onOpenIncidentDetail 
}) => {
  const [incidents, setIncidents] = useState<Incident[]>(incidentStore.getIncidents());
  const [hotspots, setHotspots] = useState<Hotspot[]>(incidentStore.getHotspots());
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(incidentStore.getSelectedIncident());
  const [liveActivity, setLiveActivity] = useState<LiveActivityEvent[]>(incidentStore.getLiveActivity());
  const [newlyArrivedId, setNewlyArrivedId] = useState<string | null>(incidentStore.getNewlyArrivedIncidentId());
  const [bannerDismissed, setBannerDismissed] = useState<boolean>(false);
  const [dashboardDisplayMode, setDashboardDisplayMode] = useState<'MAP' | 'VISION' | 'SPLIT'>('MAP');

  useEffect(() => {
    const unsubscribe = incidentStore.subscribe(() => {
      const updatedIncidents = incidentStore.getIncidents();
      setIncidents(updatedIncidents);
      setHotspots(incidentStore.getHotspots());
      setSelectedIncident(incidentStore.getSelectedIncident());
      setLiveActivity(incidentStore.getLiveActivity());

      const latestArrival = incidentStore.getNewlyArrivedIncidentId();
      if (latestArrival && latestArrival !== newlyArrivedId) {
        setNewlyArrivedId(latestArrival);
        setBannerDismissed(false);
      }
    });
    return unsubscribe;
  }, [newlyArrivedId]);

  const handleSelectIncident = (inc: Incident) => {
    setSelectedIncident(inc);
    incidentStore.setSelectedIncident(inc);
  };

  const handleQuickStatusTransition = (incident: Incident, nextStatus: IncidentStatus) => {
    incidentStore.updateIncidentStatus(incident.id, nextStatus);
  };

  // Sort queue: P1 critical first, then P2, P3, P4
  const priorityRank: Record<string, number> = { 'P1': 1, 'P2': 2, 'P3': 3, 'P4': 4 };
  const sortedQueue = [...incidents].sort((a, b) => (priorityRank[a.priority] || 9) - (priorityRank[b.priority] || 9));

  // Compute total duplicates merged across all incidents
  const totalDuplicatesMerged = incidents.reduce((acc, curr) => acc + (curr.duplicateCount || 0), 0);

  const newlyArrivedIncident = newlyArrivedId ? incidents.find(i => i.id === newlyArrivedId) : null;

  return (
    <div className="h-full flex flex-col p-5 sm:p-7 space-y-4 overflow-y-auto font-sans bg-slate-50">
      
      {/* COMMAND CENTER HEADER STRIP */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-300">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-600">Visakhapatnam Operations Grid</span>
            <span className="text-slate-300">•</span>
            <span className="text-xs font-medium text-slate-500">GVMC Jurisdiction</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 mt-0.5">
            Municipal Command Operations
          </h1>
          <p className="text-sm text-slate-500 leading-relaxed mt-0.5">
            Real-time urban telemetry, spatial risk heatmaps, and autonomous agent DAG workforce orchestration.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <div className="px-3.5 py-1.5 rounded-xl bg-white border border-slate-300 flex items-center gap-2 text-slate-900 font-extrabold shadow-xs text-[11px] uppercase tracking-wider">
            <ShieldCheck className="w-4 h-4 text-blue-600" />
            <span>[AUTONOMOUS TRIAGE & DISPATCH ACTIVE]</span>
          </div>
        </div>
      </div>

      {/* NEW INCIDENT INGESTION BANNER */}
      {newlyArrivedIncident && !bannerDismissed && (
        <div className="p-4 rounded-xl bg-blue-50/60 border border-blue-300 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-slate-900 animate-fadeIn">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white flex-shrink-0 shadow-sm">
              <BellRing className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2 text-xs">
                <span className="font-extrabold uppercase tracking-wider text-slate-900 text-[11px]">[NEW INCIDENT INGESTED]</span>
                <span className="text-blue-700 font-mono font-bold">#{newlyArrivedIncident.id}</span>
                <span className={`text-[10px] px-2 py-0.5 rounded font-extrabold uppercase tracking-wider ${
                  newlyArrivedIncident.priority === 'P1' 
                    ? 'bg-rose-50 text-rose-700 border border-rose-300' 
                    : 'bg-amber-50 text-amber-700 border border-amber-300'
                }`}>
                  [{newlyArrivedIncident.priority} • {newlyArrivedIncident.severity}]
                </span>
              </div>
              <p className="text-xs text-slate-600 font-medium mt-0.5">
                {newlyArrivedIncident.category} at {newlyArrivedIncident.locality} ({newlyArrivedIncident.ward || 'GVMC'}). Dispatched to {newlyArrivedIncident.assignedTeam || 'Maintenance Unit'}.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs self-end sm:self-center">
            <button
              onClick={() => {
                handleSelectIncident(newlyArrivedIncident);
                onOpenIncidentDetail(newlyArrivedIncident);
              }}
              className="px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-[11px] uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
            >
              <span>[INSPECT WORKFLOW]</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={() => {
                setBannerDismissed(true);
                incidentStore.clearNewlyArrivedIncidentId();
              }}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-800 hover:bg-slate-200/60 transition-all cursor-pointer"
              title="Dismiss alert"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* KPI STRIP WITH VIBRANT COLOR ACCENTS ON CRISP WHITE CARDS */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {/* KPI 1: TOTAL ACTIVE INCIDENTS */}
        <div className="p-4 rounded-xl bg-white border border-slate-300 flex items-center justify-between shadow-sm transition-all duration-200 hover:border-blue-600 hover:bg-blue-50/40">
          <div>
            <div className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500">Active Reports</div>
            <div className="text-2xl font-black tracking-tight text-slate-900 mt-1">{incidents.length}</div>
            <div className="text-[11px] text-blue-600 font-semibold mt-0.5">GVMC Operational Zone</div>
          </div>
          <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 shadow-xs">
            <Radio className="w-4 h-4" />
          </div>
        </div>

        {/* KPI 2: CRITICAL HAZARDS */}
        <div className="p-4 rounded-xl bg-white border border-slate-300 flex items-center justify-between shadow-sm transition-all duration-200 hover:border-rose-600 hover:bg-rose-50/40">
          <div>
            <div className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500">Critical (P1) Hazards</div>
            <div className="text-2xl font-black tracking-tight text-rose-600 mt-1">
              {incidents.filter(i => i.priority === 'P1').length}
            </div>
            <div className="text-[11px] text-rose-600 font-semibold mt-0.5">High kinetic risk</div>
          </div>
          <div className="w-9 h-9 rounded-xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600 shadow-xs">
            <AlertTriangle className="w-4 h-4" />
          </div>
        </div>

        {/* KPI 3: DUPLICATES CONSOLIDATED */}
        <div className="p-4 rounded-xl bg-white border border-slate-300 flex items-center justify-between shadow-sm transition-all duration-200 hover:border-blue-600 hover:bg-blue-50/40">
          <div>
            <div className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500">Reports Merged</div>
            <div className="text-2xl font-black tracking-tight text-slate-900 mt-1">{totalDuplicatesMerged}</div>
            <div className="text-[11px] text-blue-600 font-semibold mt-0.5">Within 50m radius</div>
          </div>
          <div className="w-9 h-9 rounded-xl bg-slate-100 border border-slate-300 flex items-center justify-center text-slate-700 shadow-xs">
            <Layers className="w-4 h-4" />
          </div>
        </div>

        {/* KPI 4: AVG RESOLUTION SLA */}
        <div className="p-4 rounded-xl bg-white border border-slate-300 flex items-center justify-between shadow-sm transition-all duration-200 hover:border-emerald-600 hover:bg-emerald-50/40">
          <div>
            <div className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500">Target Resolution</div>
            <div className="text-2xl font-black tracking-tight text-emerald-600 mt-1">14.2h</div>
            <div className="text-[11px] text-emerald-600 font-semibold mt-0.5">98.4% within SLA</div>
          </div>
          <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 shadow-xs">
            <Clock className="w-4 h-4" />
          </div>
        </div>

        {/* KPI 5: ACTIVE HOTSPOTS */}
        <div className="p-4 rounded-xl bg-white border border-slate-300 flex items-center justify-between col-span-2 sm:col-span-1 shadow-sm transition-all duration-200 hover:border-amber-600 hover:bg-amber-50/40">
          <div>
            <div className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500">Spatial Hotspots</div>
            <div className="text-2xl font-black tracking-tight text-amber-600 mt-1">{hotspots.length}</div>
            <div className="text-[11px] text-amber-600 font-semibold mt-0.5">Clusters monitored</div>
          </div>
          <div className="w-9 h-9 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 shadow-xs">
            <Flame className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* MAIN DUAL LAYOUT: VIZAG MAP / VISION LAB (LEFT 8 COLS) + PRIORITY QUEUE (RIGHT 4 COLS) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 flex-1 min-h-[540px]">
        <div className="lg:col-span-8 flex flex-col h-full rounded-xl overflow-hidden bg-white border border-slate-300 shadow-sm">
          
          {/* DASHBOARD DISPLAY MODE SWITCHER */}
          <div className="flex items-center justify-between px-3.5 py-2 bg-slate-50 border-b border-slate-300 text-xs">
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setDashboardDisplayMode('MAP')}
                className={`px-3 py-1.5 rounded-lg font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer ${
                  dashboardDisplayMode === 'MAP'
                    ? 'bg-blue-600 text-white shadow-2xs'
                    : 'text-slate-700 hover:bg-slate-200'
                }`}
              >
                <MapPin className="w-3.5 h-3.5" />
                <span>GIS Map View</span>
              </button>

              <button
                onClick={() => setDashboardDisplayMode('VISION')}
                className={`px-3 py-1.5 rounded-lg font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer ${
                  dashboardDisplayMode === 'VISION'
                    ? 'bg-blue-600 text-white shadow-2xs'
                    : 'text-slate-700 hover:bg-slate-200'
                }`}
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Vision &amp; Defect Lab</span>
              </button>

              <button
                onClick={() => setDashboardDisplayMode('SPLIT')}
                className={`px-3 py-1.5 rounded-lg font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer ${
                  dashboardDisplayMode === 'SPLIT'
                    ? 'bg-blue-600 text-white shadow-2xs'
                    : 'text-slate-700 hover:bg-slate-200'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Split: Map + Vision</span>
              </button>
            </div>

            <div className="hidden sm:flex items-center gap-2 text-slate-500 font-mono text-[11px]">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>LIVE SENSOR STREAM</span>
            </div>
          </div>

          {/* MAIN VIEW CONTAINER */}
          <div className="flex-1 flex flex-col min-h-0 relative">
            {dashboardDisplayMode === 'MAP' && (
              <VizagMap
                incidents={incidents}
                hotspots={hotspots}
                selectedIncident={selectedIncident}
                newlyArrivedIncidentId={newlyArrivedId}
                onSelectIncident={handleSelectIncident}
                onOpenDetailModal={onOpenIncidentDetail}
              />
            )}

            {dashboardDisplayMode === 'VISION' && (
              <DashboardVisionView
                selectedIncident={selectedIncident}
                onOpenDetailModal={onOpenIncidentDetail}
              />
            )}

            {dashboardDisplayMode === 'SPLIT' && (
              <div className="grid grid-cols-1 md:grid-cols-2 h-full gap-1 p-1 bg-slate-200">
                <div className="h-full rounded-lg overflow-hidden border border-slate-300">
                  <VizagMap
                    incidents={incidents}
                    hotspots={hotspots}
                    selectedIncident={selectedIncident}
                    newlyArrivedIncidentId={newlyArrivedId}
                    onSelectIncident={handleSelectIncident}
                    onOpenDetailModal={onOpenIncidentDetail}
                  />
                </div>
                <div className="h-full rounded-lg overflow-hidden border border-slate-300">
                  <DashboardVisionView
                    selectedIncident={selectedIncident}
                    onOpenDetailModal={onOpenIncidentDetail}
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* PRIORITY QUEUE & DISPATCH CONTROLS (4 COLS) */}
        <div className="lg:col-span-4 flex flex-col h-full rounded-xl bg-white border border-slate-300 p-4 space-y-3 shadow-sm">
          <div className="flex items-center justify-between pb-2.5 border-b border-slate-300">
            <div>
              <h2 className="text-xs font-black text-slate-900 tracking-tight uppercase">[ACTIVE INCIDENT QUEUE]</h2>
              <span className="text-[11px] text-slate-500 font-medium">{sortedQueue.length} items ranked by priority</span>
            </div>
            <span className="text-[10px] px-2.5 py-0.5 rounded font-extrabold uppercase tracking-wider bg-blue-50 text-blue-700 border border-blue-300">
              [LIVE QUEUE]
            </span>
          </div>

          <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 max-h-[490px]">
            {sortedQueue.map((incident) => {
              const isSelected = selectedIncident?.id === incident.id;
              const isP1 = incident.priority === 'P1';
              const isP2 = incident.priority === 'P2';

              return (
                <div
                  key={incident.id}
                  onClick={() => handleSelectIncident(incident)}
                  className={`p-3.5 rounded-xl border cursor-pointer transition-all space-y-2 bg-white ${
                    isSelected
                      ? 'border-blue-600 ring-2 ring-blue-500/80 shadow-md bg-blue-50/20'
                      : isP1
                      ? 'border-slate-300 hover:border-rose-600 hover:bg-rose-50/20 shadow-xs'
                      : isP2
                      ? 'border-slate-300 hover:border-amber-600 hover:bg-amber-50/20 shadow-xs'
                      : 'border-slate-300 hover:border-blue-600 hover:bg-blue-50/30 shadow-xs'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded uppercase tracking-wider ${
                        isP1 ? 'bg-rose-50 text-rose-700 border border-rose-300' : 
                        incident.priority === 'P2' ? 'bg-amber-50 text-amber-800 border border-amber-300' :
                        'bg-blue-50 text-blue-800 border border-blue-300'
                      }`}>
                        [{incident.priority}]
                      </span>
                      <span className="text-xs font-mono font-bold text-slate-900">#{incident.id}</span>
                      {incident.duplicateCount > 0 && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 border border-slate-300 text-slate-700 font-extrabold font-mono">
                          +{incident.duplicateCount} MERGED
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] text-blue-700 font-bold font-mono">
                      {(incident.confidence * 100).toFixed(0)}% CONF
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xs font-bold text-slate-900">{incident.category}</div>
                      <div className="text-[11px] text-slate-500 font-medium">{incident.locality} ({incident.ward || 'GVMC'})</div>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onOpenIncidentDetail(incident);
                      }}
                      className="p-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 transition-colors cursor-pointer border border-slate-300"
                      title="Inspect workflow trace"
                    >
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* QUICK STATUS TRANSITION BUTTONS */}
                  <div className="pt-2 border-t border-slate-300 flex items-center justify-between text-xs">
                    <span className="text-[11px] text-slate-500 font-medium">
                      Status: <span className="text-emerald-700 font-extrabold font-mono uppercase">[{incident.status}]</span>
                    </span>

                    <div className="flex items-center gap-1.5">
                      {incident.status === 'ASSIGNED' && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleQuickStatusTransition(incident, 'IN_PROGRESS');
                          }}
                          className="px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-extrabold uppercase tracking-wider transition-all cursor-pointer shadow-xs"
                        >
                          [Dispatch Crew]
                        </button>
                      )}

                      {incident.status === 'IN_PROGRESS' && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleQuickStatusTransition(incident, 'RESOLVED');
                          }}
                          className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-extrabold uppercase tracking-wider transition-all cursor-pointer shadow-xs"
                        >
                          [Mark Resolved]
                        </button>
                      )}

                      {incident.status === 'RESOLVED' && (
                        <span className="text-emerald-700 font-extrabold flex items-center gap-1 text-[11px] uppercase tracking-wider font-mono">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span>[RESOLVED]</span>
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <button
            onClick={() => onNavigate('incidents')}
            className="w-full py-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-900 border border-slate-300 text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
          >
            <span>View All {incidents.length} Incident Records</span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
          </button>
        </div>
      </div>

      {/* PURE & SIMPLE AI AGENT WORKFORCE MESH FLOW */}
      <AgentMeshFlow
        selectedIncident={selectedIncident || incidents[0]}
        onNavigateToFullWorkflow={() => onNavigate('agents')}
        onOpenIncidentDetail={onOpenIncidentDetail}
      />

      {/* CHRONOLOGICAL ACTIVITY LOG (BOTTOM STRIP) */}
      <div className="p-3.5 rounded-xl bg-white border border-slate-300 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
        <div className="flex items-center gap-2 text-xs font-extrabold text-slate-900 flex-shrink-0 uppercase tracking-wider">
          <Activity className="w-4 h-4 text-blue-600" />
          <span>[ACTIVITY STREAM]:</span>
        </div>

        <div className="flex-1 flex items-center gap-2.5 overflow-x-auto text-xs py-0.5">
          {liveActivity.slice(0, 4).map((event) => (
            <div key={event.id} className="flex items-center gap-2 whitespace-nowrap bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-300 shadow-2xs">
              <span className="text-[11px] text-slate-500 font-mono font-medium">{event.timeDisplay}</span>
              <span className="text-blue-700 font-extrabold">[{event.agent}]:</span>
              <span className="text-slate-800 font-medium">{event.message}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
