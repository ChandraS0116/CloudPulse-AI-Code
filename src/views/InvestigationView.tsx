import React, { useState, useEffect, useRef } from 'react';
import { 
  Radio, 
  Terminal, 
  CheckCircle2, 
  Cpu, 
  Eye, 
  MapPin, 
  ShieldCheck, 
  Layers, 
  Activity,
  AlertTriangle,
  Sparkles
} from 'lucide-react';
import { AgentName, Incident, IncidentCategory } from '../types';
import { agentOrchestrator, WorkflowProgress } from '../services/agents/agentOrchestrator';
import { IntelligenceResultModal } from '../components/investigation/IntelligenceResultModal';
import { ActiveTab } from '../components/layout/AppShell';

interface InvestigationViewProps {
  payload: {
    image: string;
    latitude: number;
    longitude: number;
    locality: string;
    description: string;
    categoryHint?: IncidentCategory;
  };
  onNavigate: (tab: ActiveTab) => void;
  onFinished: (incident: Incident) => void;
}

export const InvestigationView: React.FC<InvestigationViewProps> = ({ 
  payload, 
  onNavigate, 
  onFinished 
}) => {
  const [progress, setProgress] = useState<WorkflowProgress>({
    activeAgent: 'Orchestrator',
    agentStates: {
      'Orchestrator': 'RUNNING',
      'Vision Agent': 'WAITING',
      'Geo Agent': 'WAITING',
      'Triage Agent': 'WAITING',
      'Correlation Agent': 'WAITING',
      'Decision Agent': 'WAITING',
      'Monitoring Agent': 'WAITING',
    },
    latencies: {
      'Orchestrator': 0,
      'Vision Agent': 0,
      'Geo Agent': 0,
      'Triage Agent': 0,
      'Correlation Agent': 0,
      'Decision Agent': 0,
      'Monitoring Agent': 0,
    },
    logs: [
      `[${new Date().toLocaleTimeString()}] [ORCHESTRATOR] 7-agent operational pipeline initialized.`
    ],
    partialResults: {},
    isCompleted: false,
  });

  const [showResultModal, setShowResultModal] = useState(false);
  const terminalBottomRef = useRef<HTMLDivElement>(null);

  // Auto-scroll terminal log
  useEffect(() => {
    terminalBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [progress.logs]);

  // Run the autonomous agent orchestrator upon mounting
  useEffect(() => {
    let isMounted = true;
    agentOrchestrator.runAutonomousInvestigation(payload, (newProgress) => {
      if (isMounted) {
        setProgress(newProgress);
        if (newProgress.isCompleted && newProgress.incident) {
          onFinished(newProgress.incident);
          setTimeout(() => {
            setShowResultModal(true);
          }, 600);
        }
      }
    });

    return () => {
      isMounted = false;
    };
  }, []);

  const agents: { name: AgentName; label: string; icon: React.ComponentType<{ className?: string }>; description: string }[] = [
    { name: 'Orchestrator', label: '1. Orchestrator', icon: Cpu, description: 'Workflow coordinator & state manager' },
    { name: 'Vision Agent', label: '2. Vision Agent', icon: Eye, description: 'ViT defect classification & spatial sizing' },
    { name: 'Geo Agent', label: '3. Geo Agent', icon: MapPin, description: 'Vizag operational zone geofence ray-casting' },
    { name: 'Triage Agent', label: '4. Triage Agent', icon: AlertTriangle, description: 'Traffic density & kinetic risk P1-P4' },
    { name: 'Correlation Agent', label: '5. Correlation Agent', icon: Layers, description: 'Spatial duplicate check (<50m) & hotspots' },
    { name: 'Decision Agent', label: '6. Decision Agent', icon: ShieldCheck, description: 'Consensus rationale & SLA target' },
    { name: 'Monitoring Agent', label: '7. Monitoring Agent', icon: Activity, description: 'Municipal work order dispatch & event broadcast' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6 font-sans">
      {/* HEADER BAR */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-white/[0.07]">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-400">
            <Radio className="w-4 h-4 text-blue-400" />
            <span>Autonomous Pipeline Execution</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white mt-1">
            Multi-Agent Incident Evaluation
          </h1>
          <p className="text-xs text-slate-400 font-mono mt-0.5">
            Locality: {payload.locality} • Coordinates: ({payload.latitude.toFixed(4)}, {payload.longitude.toFixed(4)})
          </p>
        </div>

        <div className="flex items-center gap-2.5 text-xs">
          <div className="px-3 py-1.5 rounded-lg bg-dark-900 border border-white/[0.08] text-slate-300 flex items-center gap-2">
            <span className="text-slate-400">Status:</span>
            <span className={progress.isCompleted ? 'text-emerald-400 font-medium' : 'text-blue-400 font-medium'}>
              {progress.isCompleted ? 'Completed (Dispatched)' : 'Evaluating Pipeline...'}
            </span>
          </div>

          <div className="px-3 py-1.5 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-300 font-medium flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-blue-400" />
            <span>Autonomous Pipeline Active</span>
          </div>
        </div>
      </div>

      {/* MAIN TWO-COLUMN SPLIT */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT COLUMN: EVIDENCE & LIVE TERMINAL LOGS (6 COLS) */}
        <div className="lg:col-span-6 space-y-4">
          {/* EVIDENCE PREVIEW */}
          <div className="p-4 rounded-2xl glass-panel border border-white/[0.07] space-y-3">
            <div className="text-xs font-semibold text-slate-400 flex items-center justify-between">
              <span>Citizen Evidence Payload</span>
              <span className="font-mono text-slate-500 text-[11px]">2048×1536</span>
            </div>
            <div className="w-full h-48 rounded-xl overflow-hidden border border-white/[0.08] bg-dark-950 flex items-center justify-center">
              <img src={payload.image} alt="Defect input" className="w-full h-full object-cover" />
            </div>
            <p className="text-xs text-slate-300 italic">{payload.description}</p>
          </div>

          {/* REALTIME SYSTEM CONSOLE / TERMINAL */}
          <div className="rounded-2xl glass-panel border border-white/[0.07] overflow-hidden flex flex-col h-[320px]">
            <div className="px-4 py-2.5 bg-dark-900/80 border-b border-white/[0.05] flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-300">
                <Terminal className="w-3.5 h-3.5 text-blue-400" />
                <span>Agent Execution Stream</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <span className="text-[11px] text-slate-400">Context Bus Active</span>
              </div>
            </div>

            <div className="flex-1 p-4 overflow-y-auto font-mono text-xs space-y-1.5 bg-[#090b10]">
              {progress.logs.map((log, idx) => (
                <div key={idx} className="text-slate-300 leading-relaxed break-all">
                  <span className="text-slate-500 mr-1.5">›</span>
                  {log}
                </div>
              ))}
              <div ref={terminalBottomRef} />
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: 7-AGENT DAG STATUS CARDS (6 COLS) */}
        <div className="lg:col-span-6 space-y-3">
          <div className="p-5 rounded-2xl glass-panel border border-white/[0.07] space-y-3">
            <div className="text-xs font-semibold text-slate-400 flex items-center justify-between pb-2 border-b border-white/[0.05]">
              <span>7-Agent Pipeline Progress</span>
              <span className="text-slate-500 text-[11px]">Sequential & Parallel Execution</span>
            </div>

            <div className="space-y-2">
              {agents.map((agent) => {
                const Icon = agent.icon;
                const state = progress.agentStates[agent.name];
                const latency = progress.latencies[agent.name];

                return (
                  <div
                    key={agent.name}
                    className={`p-3 rounded-xl border transition-all ${
                      state === 'RUNNING'
                        ? 'bg-blue-500/[0.07] border-blue-500/30'
                        : state === 'COMPLETED'
                        ? 'bg-dark-900/60 border-white/[0.06]'
                        : 'bg-dark-950/40 border-white/[0.04] opacity-50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                          state === 'RUNNING'
                            ? 'bg-blue-500/20 text-blue-300'
                            : state === 'COMPLETED'
                            ? 'bg-emerald-500/15 text-emerald-400'
                            : 'bg-white/[0.04] text-slate-500'
                        }`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="text-xs font-medium text-white flex items-center gap-2">
                            <span>{agent.label}</span>
                            {state === 'RUNNING' && (
                              <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                            )}
                          </div>
                          <div className="text-[11px] text-slate-400">
                            {agent.description}
                          </div>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className={`text-[10px] font-medium px-2 py-0.5 rounded ${
                          state === 'RUNNING'
                            ? 'bg-blue-500/15 text-blue-300'
                            : state === 'COMPLETED'
                            ? 'bg-emerald-500/10 text-emerald-400'
                            : 'bg-white/[0.04] text-slate-500'
                        }`}>
                          {state}
                        </span>
                        {latency > 0 && (
                          <div className="text-[10px] font-mono text-slate-400 mt-0.5">
                            {(latency / 1000).toFixed(2)}s
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* INTELLIGENCE RESULT MODAL DIALOG */}
      {showResultModal && progress.incident && (
        <IntelligenceResultModal
          incident={progress.incident}
          onClose={() => setShowResultModal(false)}
          onGoToCommandCenter={() => {
            setShowResultModal(false);
            onNavigate('command-center');
          }}
          onGoToAgents={() => {
            setShowResultModal(false);
            onNavigate('agents');
          }}
        />
      )}
    </div>
  );
};
