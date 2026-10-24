import React, { useState } from 'react';
import { 
  X, 
  Cpu, 
  Eye, 
  AlertTriangle, 
  MapPin, 
  ShieldCheck, 
  CheckCircle2, 
  ChevronDown, 
  ChevronRight, 
  Clock, 
  FileCheck, 
  Layers, 
  Activity,
  ArrowRight
} from 'lucide-react';
import { Incident, AgentExecution, AgentName } from '../types';

interface IncidentDetailModalProps {
  incident: Incident;
  onClose: () => void;
}

export const IncidentDetailModal: React.FC<IncidentDetailModalProps> = ({ incident, onClose }) => {
  const [expandedAgentId, setExpandedAgentId] = useState<string | null>(
    incident.agentTrace.length > 0 ? incident.agentTrace[0].id : null
  );

  const toggleExpand = (id: string) => {
    setExpandedAgentId(prev => prev === id ? null : id);
  };

  const getAgentIcon = (name: AgentName) => {
    switch (name) {
      case 'Orchestrator': return Cpu;
      case 'Vision Agent': return Eye;
      case 'Geo Agent': return MapPin;
      case 'Triage Agent': return AlertTriangle;
      case 'Correlation Agent': return Layers;
      case 'Decision Agent': return ShieldCheck;
      case 'Monitoring Agent': return Activity;
      default: return Activity;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn font-sans">
      <div className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-xl border border-slate-300 p-6 sm:p-7 space-y-6 text-slate-900 bg-white shadow-2xl">
        {/* CLOSE BUTTON */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-lg bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-600 hover:text-slate-900 transition-all cursor-pointer shadow-2xs"
        >
          <X className="w-5 h-5" />
        </button>

        {/* HEADER PILLS */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="px-2.5 py-1 rounded-lg bg-slate-100 border border-slate-300 text-slate-900 font-bold font-mono">
            #{incident.id}
          </span>
          <span className={`px-2.5 py-1 rounded-lg font-extrabold uppercase tracking-wider border ${
            incident.priority === 'P1' ? 'bg-rose-50 text-rose-700 border-rose-300' : 
            incident.priority === 'P2' ? 'bg-amber-50 text-amber-800 border-amber-300' :
            'bg-blue-50 text-blue-800 border-blue-300'
          }`}>
            [{incident.priority} • {incident.severity}]
          </span>
          <span className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-300 font-extrabold uppercase tracking-wider font-mono">
            [STATUS: {incident.status}]
          </span>
          <span className="px-2.5 py-1 rounded-lg bg-slate-100 border border-slate-300 text-slate-700 font-medium">
            {incident.aiMode === 'LIVE_AI' ? '[Live AI]' : '[Deterministic Workflow]'}
          </span>
          {incident.caseId && (
            <span className="px-2.5 py-1 rounded-lg bg-blue-50 border border-blue-200 text-blue-800 font-bold font-mono">
              [WORK ORDER #{incident.caseId}]
            </span>
          )}
        </div>

        {/* OVERVIEW SECTION */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-300">
          <div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">
              {incident.category}
            </h2>
            <p className="text-sm text-slate-500 leading-relaxed mt-1">
              {incident.address} • {incident.ward || 'GVMC'} ({incident.latitude.toFixed(4)}, {incident.longitude.toFixed(4)})
            </p>
          </div>

          <div className="flex items-center gap-5 text-xs">
            <div>
              <div className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">[CONFIDENCE]</div>
              <div className="text-lg font-black text-slate-900">{(incident.confidence * 100).toFixed(0)}%</div>
            </div>
            <div>
              <div className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">[RESOLUTION SLA]</div>
              <div className="text-lg font-black text-blue-600">{incident.targetResolutionHours || 24} Hours</div>
            </div>
          </div>
        </div>

        {/* DUPLICATE CONSOLIDATION CARD IF ANY */}
        {incident.duplicateCount > 0 && (
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-300 space-y-2 text-xs shadow-2xs">
            <div className="flex items-center justify-between text-slate-800 font-bold">
              <span className="flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-blue-600" />
                <span>[CONSOLIDATED REPORTS: {incident.duplicateCount} CITIZEN SUBMISSIONS]</span>
              </span>
              <span className="text-[11px] text-slate-500 font-mono">Within 50m radius</span>
            </div>
            <div className="space-y-1.5">
              {incident.duplicates?.map((dup) => (
                <div key={dup.id} className="p-2 rounded-lg bg-white border border-slate-300 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-slate-900 font-bold">{dup.reporterName}</span>: <span className="text-slate-700">"{dup.notes || 'Corroborating issue'}"</span>
                  </div>
                  <span className="text-blue-700 font-mono text-[11px] font-bold">+{dup.distanceMeters || 0}m away</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* EVIDENCE PHOTO & ACTION SUMMARY */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
          <div className="md:col-span-5 space-y-2">
            <div className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">[VISUAL EVIDENCE]</div>
            <div className="aspect-[16/10] rounded-xl overflow-hidden border border-slate-300 bg-slate-100 shadow-xs">
              <img src={incident.image} alt={incident.category} className="w-full h-full object-cover" />
            </div>
            <p className="text-xs text-slate-600 italic pt-1">{incident.description}</p>
          </div>

          <div className="md:col-span-7 space-y-3">
            {/* RECOMMENDED ACTION */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-300 space-y-1.5 shadow-2xs">
              <div className="text-xs font-black uppercase tracking-wider text-blue-800 flex items-center gap-2">
                <FileCheck className="w-4 h-4 text-blue-600" />
                <span>[RECOMMENDED OPERATIONAL ACTION]</span>
              </div>
              <p className="text-xs text-slate-900 leading-relaxed font-sans">{incident.recommendedAction}</p>
              {incident.assignedTeam && (
                <div className="text-[11px] text-slate-600 pt-1 font-medium border-t border-slate-300 mt-2">
                  Dispatched Team: <span className="text-slate-900 font-bold">{incident.assignedTeam}</span> ({incident.department || 'GVMC'})
                </div>
              )}
            </div>

            {/* CONSENSUS RATIONALE */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-300 space-y-1.5 shadow-2xs">
              <div className="text-xs font-black uppercase tracking-wider text-slate-800 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-slate-600" />
                <span>[CONSENSUS RATIONALE]</span>
              </div>
              <p className="text-xs text-slate-800 leading-relaxed font-sans">{incident.rationale}</p>
            </div>
          </div>
        </div>

        {/* 7-AGENT EXECUTION TRACE ACCORDION */}
        <div className="space-y-3 pt-2 border-t border-slate-300">
          <div className="flex items-center justify-between">
            <div className="text-xs font-black uppercase tracking-wider text-slate-900 flex items-center gap-2">
              <Activity className="w-4 h-4 text-blue-600" />
              <span>[EXECUTION TRACE & TELEMETRY ({incident.agentTrace.length} NODES)]</span>
            </div>
            <span className="text-[11px] text-slate-500 font-medium">Click to inspect payload</span>
          </div>

          <div className="space-y-2">
            {incident.agentTrace.map((trace) => {
              const isExpanded = expandedAgentId === trace.id;
              const Icon = getAgentIcon(trace.agentName);

              return (
                <div 
                  key={trace.id}
                  className={`rounded-xl border transition-all ${
                    isExpanded ? 'bg-white border-blue-600 shadow-sm ring-1 ring-blue-400' : 'bg-white border-slate-300 hover:border-slate-400 shadow-2xs'
                  }`}
                >
                  <div 
                    onClick={() => toggleExpand(trace.id)}
                    className="p-3 flex items-center justify-between cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600">
                        <Icon className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-900 flex items-center gap-2">
                          <span>{trace.agentName}</span>
                          <span className="text-[10px] text-emerald-800 bg-emerald-50 px-1.5 py-0.2 rounded font-extrabold uppercase tracking-wider border border-emerald-300 font-mono">
                            [{trace.status}]
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-500 mt-0.5">
                          Duration: {(trace.latencyMs / 1000).toFixed(2)}s • Completed
                        </div>
                      </div>
                    </div>

                    <button className="text-slate-400 hover:text-slate-900">
                      {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                    </button>
                  </div>

                  {/* EXPANDABLE PAYLOAD (THE INVERTED CONSOLE EXCEPTION FOR RAW TELEMETRY DATA) */}
                  {isExpanded && (
                    <div className="px-3.5 pb-3.5 pt-2 border-t border-slate-300 space-y-3 text-xs bg-slate-50 rounded-b-xl">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="p-3 rounded-lg bg-[#0f172a] border border-[#334155] shadow-xs">
                          <div className="text-[10px] text-slate-400 uppercase font-extrabold tracking-wider mb-1 font-mono">[INPUT PARAMETERS]</div>
                          <pre className="text-[11px] text-[#38bdf8] overflow-x-auto font-mono">
                            {JSON.stringify(trace.input, null, 2)}
                          </pre>
                        </div>
                        <div className="p-3 rounded-lg bg-[#0f172a] border border-[#334155] shadow-xs">
                          <div className="text-[10px] text-slate-400 uppercase font-extrabold tracking-wider mb-1 font-mono">[OUTPUT RESULTS]</div>
                          <pre className="text-[11px] text-emerald-400 overflow-x-auto font-mono">
                            {JSON.stringify(trace.output, null, 2)}
                          </pre>
                        </div>
                      </div>

                      {trace.telemetryLogs.length > 0 && (
                        <div className="p-3 rounded-lg bg-[#0f172a] border border-[#334155] space-y-1 shadow-xs font-mono">
                          <div className="text-[10px] text-slate-400 uppercase font-extrabold tracking-wider">[CHRONOLOGICAL LOGS]</div>
                          {trace.telemetryLogs.map((log, idx) => (
                            <div key={idx} className="text-[11px] text-slate-200 flex items-center gap-1.5">
                              <span className="text-[#38bdf8]">›</span>
                              <span>{log}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* MODAL FOOTER */}
        <div className="flex items-center justify-end pt-2 border-t border-slate-300">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 text-xs font-bold uppercase tracking-wider cursor-pointer transition-all shadow-xs"
          >
            [Close Dossier]
          </button>
        </div>
      </div>
    </div>
  );
};
