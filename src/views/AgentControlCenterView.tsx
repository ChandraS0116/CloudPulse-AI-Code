import React, { useState } from 'react';
import { 
  Cpu, 
  Eye, 
  AlertTriangle, 
  MapPin, 
  ShieldCheck, 
  CheckCircle2, 
  Activity, 
  Play, 
  Check, 
  Layers,
  Network,
  Sparkles,
  ArrowRight,
  Shield,
  Zap,
  Info,
  X
} from 'lucide-react';
import { incidentStore } from '../services/incidentStore';
import { AgentMetric, AgentName, Incident } from '../types';
import { AgentWorkflowVisualizer } from '../components/agents/AgentWorkflowVisualizer';
import { AgentMeshFlow } from '../components/agents/AgentMeshFlow';

interface AgentControlCenterViewProps {
  onOpenIncidentDetail?: (incident: Incident) => void;
}

export const AgentControlCenterView: React.FC<AgentControlCenterViewProps> = ({
  onOpenIncidentDetail
}) => {
  const [agents] = useState<AgentMetric[]>(incidentStore.getAgentMetrics());
  const [testingAgent, setTestingAgent] = useState<string | null>(null);
  const [probeResult, setProbeResult] = useState<string | null>(null);
  const [activeDiagnosedAgent, setActiveDiagnosedAgent] = useState<AgentName>('Vision Agent');

  const handleTestAgent = async (agent: AgentMetric) => {
    setTestingAgent(agent.id);
    setActiveDiagnosedAgent(agent.name);
    setProbeResult(null);

    // Simulate diagnostic probe execution
    await new Promise(resolve => setTimeout(resolve, 600));
    setProbeResult(`Diagnostic health check for [${agent.name}] passed: 100% operational, average latency ${agent.avgLatencyMs}ms.`);
    setTestingAgent(null);
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

  const getAgentColor = (name: AgentName) => {
    switch (name) {
      case 'Orchestrator': return { bg: 'bg-blue-50', text: 'text-blue-600', border: 'border-blue-200' };
      case 'Vision Agent': return { bg: 'bg-cyan-50', text: 'text-cyan-600', border: 'border-cyan-200' };
      case 'Geo Agent': return { bg: 'bg-emerald-50', text: 'text-emerald-600', border: 'border-emerald-200' };
      case 'Triage Agent': return { bg: 'bg-amber-50', text: 'text-amber-600', border: 'border-amber-200' };
      case 'Correlation Agent': return { bg: 'bg-indigo-50', text: 'text-indigo-600', border: 'border-indigo-200' };
      case 'Decision Agent': return { bg: 'bg-purple-50', text: 'text-purple-600', border: 'border-purple-200' };
      case 'Monitoring Agent': return { bg: 'bg-teal-50', text: 'text-teal-600', border: 'border-teal-200' };
      default: return { bg: 'bg-slate-50', text: 'text-slate-600', border: 'border-slate-300' };
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8 font-sans bg-slate-50">
      {/* 1. PAGE HEADER (HIGH-CONTRAST LIGHT THEME) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-300">
        <div>
          <div className="flex items-center gap-2 text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">
            <Network className="w-4 h-4 text-blue-600" />
            <span>Autonomous Municipal Intelligence</span>
            <span className="text-slate-300">•</span>
            <span className="text-slate-600 font-semibold">Greater Visakhapatnam</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 mt-1">
            AI Agent Workforce & Workflow Studio
          </h1>
          <p className="text-sm text-slate-500 max-w-2xl leading-relaxed mt-1">
            Visual orchestration topology, live execution DAGs, real-time agent telemetry, and diagnostic health telemetry across the 7 specialized municipal units.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs">
          <div className="px-3 py-1.5 rounded-lg bg-blue-50 border border-blue-300 text-blue-800 font-extrabold uppercase tracking-wider text-[11px] flex items-center gap-2 shadow-xs">
            <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
            <span>[AUTONOMOUS PIPELINE: ACTIVE]</span>
          </div>

          <div className="px-3 py-1.5 rounded-lg bg-emerald-50 border border-emerald-300 text-emerald-800 font-extrabold uppercase tracking-wider text-[11px] flex items-center gap-2 shadow-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>[7 UNITS OPERATIONAL]</span>
          </div>
        </div>
      </div>

      {/* 2. COMPREHENSIVE WORKFLOW VISUALIZER STUDIO */}
      <AgentWorkflowVisualizer 
        variant="full"
        onOpenIncidentDetail={onOpenIncidentDetail}
      />

      {/* 2.5 INTERACTIVE AGENT MESH FLOW (DIAGNOSTIC VISUALIZER) */}
      <div className="space-y-2">
        <div className="flex items-center justify-between pb-1">
          <div>
            <h3 className="text-sm font-black text-slate-900 tracking-tight uppercase">
              [LIVE AGENT DIAGNOSTIC MESH TOPOLOGY]
            </h3>
            <p className="text-xs text-slate-500">
              Active diagnostic data flow and inter-agent mesh signals across the 7 autonomous units
            </p>
          </div>
        </div>

        <AgentMeshFlow 
          initialAgentName={activeDiagnosedAgent}
          onOpenIncidentDetail={onOpenIncidentDetail}
        />
      </div>

      {/* 3. DIAGNOSTIC RESULT BANNER */}
      {probeResult && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-300 text-xs text-emerald-900 flex items-center justify-between shadow-xs animate-fadeIn">
          <div className="flex items-center gap-2 font-medium">
            <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span>{probeResult}</span>
          </div>
          <button onClick={() => setProbeResult(null)} className="p-1 text-slate-400 hover:text-slate-800 cursor-pointer">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* 4. 7 AGENT CAPABILITY CARDS SECTION */}
      <div className="space-y-4 pt-2">
        <div className="flex items-center justify-between pb-2 border-b border-slate-300">
          <div>
            <h3 className="text-sm font-black text-slate-900 tracking-tight uppercase">
              [SPECIALIZED AGENT UNIT REGISTRY]
            </h3>
            <p className="text-xs text-slate-500">
              Individual unit telemetry, throughput counters, and diagnostic probes
            </p>
          </div>
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-700 bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-300">
            [7 ACTIVE UNITS]
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {agents.map((agent) => {
            const Icon = getAgentIcon(agent.name);
            const color = getAgentColor(agent.name);
            const isTesting = testingAgent === agent.id;

            return (
              <div
                key={agent.id}
                className="p-5 rounded-xl border border-slate-300 hover:border-blue-600 hover:bg-blue-50/20 hover:shadow-md transition-all space-y-4 flex flex-col justify-between bg-white shadow-sm"
              >
                <div className="space-y-3.5">
                  {/* CARD HEADER */}
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl ${color.bg} ${color.text} border ${color.border} flex items-center justify-center shadow-2xs`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-slate-900">{agent.name}</h3>
                        <div className="text-[11px] text-slate-500 font-medium">{agent.role}</div>
                      </div>
                    </div>

                    <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-300 text-[10px] font-extrabold uppercase tracking-wider flex items-center gap-1.5 font-mono">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      [{agent.status}]
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed font-medium">
                    {agent.description}
                  </p>

                  {/* METRICS ROW (HIGH CONTRAST) */}
                  <div className="grid grid-cols-3 gap-2 p-2.5 rounded-lg bg-slate-50 border border-slate-300 text-xs">
                    <div>
                      <div className="text-[10px] text-slate-500 font-extrabold uppercase tracking-wider">[PROCESSED]</div>
                      <div className="text-slate-900 font-bold font-mono mt-0.5">{agent.tasksProcessed}</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-slate-500 font-extrabold uppercase tracking-wider">[SUCCESS]</div>
                      <div className="text-emerald-700 font-bold font-mono mt-0.5">{agent.successRate}%</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-slate-500 font-extrabold uppercase tracking-wider">[LATENCY]</div>
                      <div className="text-blue-700 font-bold font-mono mt-0.5">{(agent.avgLatencyMs / 1000).toFixed(2)}s</div>
                    </div>
                  </div>

                  {/* CURRENT TASK */}
                  <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-300 text-xs">
                    <span className="text-[10px] text-slate-500 font-extrabold uppercase tracking-wider block">[ACTIVE TASK]</span>
                    <span className="text-slate-900 font-bold text-[11px] block mt-0.5">{agent.currentTask}</span>
                  </div>

                  {/* CAPABILITIES */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {agent.capabilities.map((cap, i) => (
                      <span key={i} className="text-[10px] px-2 py-0.5 rounded bg-white text-slate-700 border border-slate-300 font-semibold font-mono">
                        {cap}
                      </span>
                    ))}
                  </div>
                </div>

                {/* ACTION TRIGGER */}
                <div className="pt-3 border-t border-slate-300">
                  <button
                    onClick={() => handleTestAgent(agent)}
                    disabled={isTesting}
                    className="w-full py-2 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-800 border border-slate-300 text-[11px] font-extrabold uppercase tracking-wider flex items-center justify-center gap-2 transition-all disabled:opacity-50 cursor-pointer shadow-2xs"
                  >
                    <Play className={`w-3.5 h-3.5 ${isTesting ? 'animate-spin text-blue-600' : 'text-slate-600'}`} />
                    <span>{isTesting ? '[Running Probe...]' : '[Run Health Diagnostic]'}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
