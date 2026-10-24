import React, { useState, useEffect, useRef } from 'react';
import { 
  Cpu, 
  Layers, 
  Play, 
  RotateCcw, 
  CheckCircle2, 
  Clock, 
  Zap, 
  ArrowRight, 
  ShieldCheck, 
  ExternalLink,
  ChevronRight,
  Info,
  Terminal,
  Activity,
  AlertTriangle,
  Radio,
  Sparkles
} from 'lucide-react';
import { 
  AgentWorkflowDef, 
  WorkflowStep, 
  buildRealIncidentWorkflow, 
  getAllWorkflowDefinitions,
  pavementPatrolWorkflowDef,
  emergencyHazardWorkflowDef,
  duplicateMergingWorkflowDef,
  workOrderSlaWorkflowDef
} from '../../services/agentWorkflows';
import { AgentNodeCard } from './AgentNodeCard';
import { StepInspectorModal } from './StepInspectorModal';
import { AgentMeshFlow } from './AgentMeshFlow';
import { incidentStore } from '../../services/incidentStore';
import { Incident } from '../../types';

interface AgentWorkflowVisualizerProps {
  variant?: 'compact' | 'full';
  onNavigateToFullWorkflow?: () => void;
  onOpenIncidentDetail?: (incident: Incident) => void;
}

export const AgentWorkflowVisualizer: React.FC<AgentWorkflowVisualizerProps> = ({
  variant = 'full',
  onNavigateToFullWorkflow,
  onOpenIncidentDetail
}) => {
  // Pull live incidents from store
  const [incidents, setIncidents] = useState<Incident[]>(incidentStore.getIncidents());
  const [selectedIncident, setSelectedIncident] = useState<Incident>(
    incidentStore.getSelectedIncident() || incidentStore.getIncidents()[0]
  );

  // Active workflow selection
  const [activeWorkflowId, setActiveWorkflowId] = useState<string>('citizen-triage');
  const [selectedStep, setSelectedStep] = useState<WorkflowStep | null>(null);

  // Simulation execution state
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [currentExecutingStepIndex, setCurrentExecutingStepIndex] = useState<number>(-1);
  const [simulatedSteps, setSimulatedSteps] = useState<WorkflowStep[]>([]);
  const [simulatedLogs, setSimulatedLogs] = useState<{ time: string; agent: string; message: string }[]>([]);
  const [isSimulationCompleted, setIsSimulationCompleted] = useState<boolean>(false);

  // Auto-scroll telemetry log
  const logTerminalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const unsub = incidentStore.subscribe(() => {
      const all = incidentStore.getIncidents();
      setIncidents(all);
      const sel = incidentStore.getSelectedIncident();
      if (sel) {
        setSelectedIncident(sel);
      }
    });
    return unsub;
  }, []);

  // Compute all available workflow definitions dynamically based on selected incident
  const allWorkflows = getAllWorkflowDefinitions(selectedIncident);
  const currentWorkflowDef = allWorkflows.find(w => w.id === activeWorkflowId) || allWorkflows[0];

  // Initialize steps when workflow changes or incident changes
  useEffect(() => {
    if (!isSimulating) {
      setSimulatedSteps(currentWorkflowDef.steps);
      setSimulatedLogs(currentWorkflowDef.liveLogs);
      setIsSimulationCompleted(false);
      setCurrentExecutingStepIndex(-1);
    }
  }, [activeWorkflowId, selectedIncident, isSimulating]);

  // Scroll to bottom of terminal log when new log appears
  useEffect(() => {
    logTerminalRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [simulatedLogs]);

  // --------------------------------------------------------------------------
  // INTERACTIVE ASYNC SIMULATION RUNNER (RULE 8)
  // --------------------------------------------------------------------------
  const runSimulation = async () => {
    if (isSimulating) return;

    setIsSimulating(true);
    setIsSimulationCompleted(false);
    setSimulatedLogs([]);

    // Initialize all steps to IDLE
    const initialSteps: WorkflowStep[] = currentWorkflowDef.steps.map(step => ({
      ...step,
      status: 'IDLE',
      durationMs: 0
    }));
    setSimulatedSteps(initialSteps);

    const startTime = performance.now();
    const newLogs: { time: string; agent: string; message: string }[] = [];

    // Step through each agent sequentially
    for (let i = 0; i < currentWorkflowDef.steps.length; i++) {
      setCurrentExecutingStepIndex(i);

      // Set current step to RUNNING
      setSimulatedSteps(prev => prev.map((s, idx) => 
        idx === i ? { ...s, status: 'RUNNING' } : s
      ));

      const stepRef = currentWorkflowDef.steps[i];
      const elapsed = ((performance.now() - startTime) / 1000).toFixed(3);
      const logEntry = {
        time: `00:0${elapsed}`,
        agent: stepRef.agentName.toUpperCase().replace(' AGENT', ''),
        message: stepRef.telemetryLog
      };
      newLogs.push(logEntry);
      setSimulatedLogs([...newLogs]);

      // Execution delay (350ms to 650ms for realistic non-blocking visualization)
      await new Promise(r => setTimeout(r, 450));

      // Mark step COMPLETED with target duration
      setSimulatedSteps(prev => prev.map((s, idx) => 
        idx === i ? { 
          ...s, 
          status: 'COMPLETED',
          durationMs: stepRef.durationMs
        } : s
      ));
    }

    setCurrentExecutingStepIndex(-1);
    setIsSimulating(false);
    setIsSimulationCompleted(true);
  };

  const handleResetSimulation = () => {
    setIsSimulating(false);
    setIsSimulationCompleted(false);
    setCurrentExecutingStepIndex(-1);
    setSimulatedSteps(currentWorkflowDef.steps);
    setSimulatedLogs(currentWorkflowDef.liveLogs);
  };

  // --------------------------------------------------------------------------
  // COMPACT VARIANT (FOR COMMAND CENTER DASHBOARD)
  // --------------------------------------------------------------------------
  if (variant === 'compact') {
    return (
      <AgentMeshFlow
        selectedIncident={selectedIncident}
        onNavigateToFullWorkflow={onNavigateToFullWorkflow}
        onOpenIncidentDetail={onOpenIncidentDetail}
      />
    );
  }

  // --------------------------------------------------------------------------
  // FULL STUDIO VARIANT (FOR AI AGENT WORKFORCE PAGE - RULE 11)
  // --------------------------------------------------------------------------
  const isPrimaryReal = currentWorkflowDef.isRealIncident;

  return (
    <div className="space-y-6 font-sans">
      {/* 1. TOP CONTROLS & WORKFLOW SELECTOR TABS (RULE 2 & 9) */}
      <div className="p-4 rounded-xl border border-slate-300 bg-white space-y-4 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-3 border-b border-slate-300">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">
                [MULTI-WORKFLOW ARCHITECTURE STUDIO]
              </span>
              <span className="text-slate-300">•</span>
              <span className={`text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded border ${
                isPrimaryReal 
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-300' 
                  : 'bg-amber-50 text-amber-800 border-amber-300'
              }`}>
                [{currentWorkflowDef.badge}]
              </span>
            </div>
            <h2 className="text-xl font-black text-slate-900 tracking-tight mt-0.5">
              {currentWorkflowDef.name}
            </h2>
            <p className="text-sm text-slate-500 max-w-3xl mt-0.5 leading-relaxed">
              {currentWorkflowDef.objective}
            </p>
          </div>

          {/* SIMULATION ACTION BUTTONS */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={runSimulation}
              disabled={isSimulating}
              className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-extrabold uppercase tracking-wider text-[11px] flex items-center gap-2 transition-all cursor-pointer shadow-sm disabled:opacity-50"
            >
              <Play className={`w-3.5 h-3.5 ${isSimulating ? 'animate-spin' : ''}`} />
              <span>{isSimulating ? '[Executing Simulation...]' : '[Run Simulation]'}</span>
            </button>

            <button
              onClick={handleResetSimulation}
              disabled={isSimulating}
              className="p-2 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-600 hover:text-slate-900 border border-slate-300 transition-all cursor-pointer shadow-2xs"
              title="Reset state"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* WORKFLOW SWITCHER PILL TABS */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {allWorkflows.map((wf) => {
            const isSelected = wf.id === activeWorkflowId;
            return (
              <button
                key={wf.id}
                onClick={() => {
                  setActiveWorkflowId(wf.id);
                  handleResetSimulation();
                }}
                className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 border ${
                  isSelected
                    ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                    : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-300 shadow-2xs'
                }`}
              >
                <span>{wf.shortName}</span>
                <span className={`text-[9px] px-1.5 py-0.5 rounded font-extrabold uppercase font-mono ${
                  isSelected 
                    ? 'bg-white/20 text-white' 
                    : wf.isRealIncident 
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-300' 
                    : 'bg-slate-100 text-slate-700 border border-slate-300'
                }`}>
                  {wf.isRealIncident ? '[REAL EVENT]' : '[SIMULATION]'}
                </span>
              </button>
            );
          })}
        </div>

        {/* INCIDENT SWITCHER (ONLY FOR CITIZEN-TRIAGE PRIMARY WORKFLOW - RULE 1) */}
        {isPrimaryReal && (
          <div className="p-3 rounded-xl bg-blue-50/60 border border-blue-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 text-slate-700">
              <Info className="w-4 h-4 text-blue-600 flex-shrink-0" />
              <span>
                Inspecting real persisted agent trace for incident:
              </span>
            </div>

            <div className="flex items-center gap-2">
              <select
                value={selectedIncident.id}
                onChange={(e) => {
                  const target = incidents.find(i => i.id === e.target.value);
                  if (target) {
                    setSelectedIncident(target);
                    incidentStore.setSelectedIncident(target);
                  }
                }}
                className="px-3 py-1.5 rounded-lg bg-white border border-slate-300 text-slate-900 font-bold text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none cursor-pointer shadow-2xs"
              >
                {incidents.map((inc) => (
                  <option key={inc.id} value={inc.id}>
                    #{inc.id} — {inc.category} ({inc.locality} • Priority {inc.priority})
                  </option>
                ))}
              </select>

              {onOpenIncidentDetail && (
                <button
                  onClick={() => onOpenIncidentDetail(selectedIncident)}
                  className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs flex items-center gap-1 transition-all cursor-pointer shadow-2xs"
                >
                  <span>View Ticket</span>
                  <ExternalLink className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* 2. WORKFLOW METRICS STRIP (RULE 7) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="p-3.5 rounded-xl border border-slate-300 bg-white shadow-sm">
          <div className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500">
            {isPrimaryReal ? '[TOTAL EXECUTIONS]' : '[SIMULATION PASSES]'}
          </div>
          <div className="text-xl font-black text-slate-900 mt-1">
            {isPrimaryReal ? incidents.length * 7 : 42}
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">7 agents per run</div>
        </div>

        <div className="p-3.5 rounded-xl border border-slate-300 bg-white shadow-sm">
          <div className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500">[SUCCESS RATE]</div>
          <div className="text-xl font-black text-emerald-600 mt-1">100.0%</div>
          <div className="text-[10px] text-emerald-600 mt-0.5">0 step failures</div>
        </div>

        <div className="p-3.5 rounded-xl border border-slate-300 bg-white shadow-sm">
          <div className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500">[AVERAGE LATENCY]</div>
          <div className="text-xl font-black text-blue-600 font-mono mt-1">
            {currentWorkflowDef.typicalLatency.split(' ')[0]}
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">End-to-end DAG</div>
        </div>

        <div className="p-3.5 rounded-xl border border-slate-300 bg-white shadow-sm">
          <div className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500">[ACTIVE UNITS]</div>
          <div className="text-xl font-black text-slate-900 mt-1">7 Agents</div>
          <div className="text-[10px] text-slate-500 mt-0.5">Fully operational</div>
        </div>

        <div className="p-3.5 rounded-xl border border-slate-300 bg-white shadow-sm">
          <div className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500">[TARGET SLA]</div>
          <div className="text-sm font-black text-slate-900 mt-1.5 truncate">
            {currentWorkflowDef.targetSla.split('(')[0]}
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">Municipal standard</div>
        </div>

        <div className="p-3.5 rounded-xl border border-slate-300 bg-white shadow-sm">
          <div className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500">[AI MODE]</div>
          <div className="text-xs font-black text-slate-900 mt-1.5 truncate">
            {currentWorkflowDef.aiMode === 'LIVE_AI' ? '[LIVE AI]' : currentWorkflowDef.aiMode === 'SIMULATION' ? '[SIMULATED]' : '[DEMO]'}
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">
            {isPrimaryReal ? 'Deterministic AI' : 'Simulation Engine'}
          </div>
        </div>
      </div>

      {/* 3. VISUAL DAG CANVAS (RULE 3 & 4) */}
      <div className="p-6 rounded-xl border border-slate-300 bg-white space-y-4 shadow-sm">
        <div className="flex items-center justify-between pb-3 border-b border-slate-300">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-blue-600" />
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-900">
              [INTERACTIVE EXECUTION DAG CANVAS]
            </h3>
            <span className="text-slate-500 text-xs">• Click any node to inspect full intelligence payload</span>
          </div>

          {isSimulationCompleted && (
            <span className="text-[10px] font-extrabold uppercase tracking-wider px-3 py-1 rounded bg-emerald-50 text-emerald-800 border border-emerald-300 flex items-center gap-1.5 animate-fadeIn">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>[WORKFLOW COMPLETE]</span>
            </span>
          )}
        </div>

        {/* WORKFLOW NODES WITH CONNECTING FLOW ARROWS */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-3 relative py-2">
          {simulatedSteps.map((step, idx) => (
            <div key={step.id} className="relative flex flex-col">
              <AgentNodeCard
                step={step}
                isActive={currentExecutingStepIndex === idx}
                isSelected={selectedStep?.id === step.id}
                onClick={() => setSelectedStep(step)}
              />

              {/* Connecting animated arrow for desktop (hidden on last node) */}
              {idx < simulatedSteps.length - 1 && (
                <div className="hidden xl:flex absolute -right-2.5 top-1/2 -translate-y-1/2 z-20 pointer-events-none">
                  <div className="w-4 h-4 rounded-full bg-slate-100 border border-slate-300 flex items-center justify-center text-slate-500 shadow-2xs">
                    <ArrowRight className="w-2.5 h-2.5" />
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* 4. LIVE TELEMETRY STREAM CONSOLE (RULE 6 - INVERTED CONSOLE EXCEPTION) */}
      <div className="p-4 rounded-xl bg-[#0f172a] border border-[#334155] text-[#38bdf8] font-mono space-y-2.5 shadow-md">
        <div className="flex items-center justify-between text-xs pb-2 border-b border-[#334155]">
          <div className="flex items-center gap-2 font-mono font-bold text-slate-200">
            <Terminal className="w-4 h-4 text-blue-400" />
            <span className="text-[11px] uppercase tracking-wider">[TELEMETRY EVENT STREAM]</span>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          </div>
          <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">
            {isPrimaryReal ? '[PERSISTED AGENT EVENT STORE]' : '[SIMULATION TELEMETRY STREAM]'}
          </span>
        </div>

        <div className="font-mono text-xs space-y-1.5 max-h-36 overflow-y-auto pr-2">
          {simulatedLogs.map((log, index) => (
            <div key={index} className="flex items-start gap-3 py-0.5 border-b border-[#334155]/60 last:border-0">
              <span className="text-slate-400 font-medium text-[11px] select-none">{log.time}</span>
              <span className="text-[#38bdf8] font-bold text-[11px] w-28 truncate">{log.agent}</span>
              <span className="text-slate-200 flex-1">{log.message}</span>
            </div>
          ))}
          <div ref={logTerminalRef} />
        </div>
      </div>

      {/* 5. WORKFLOW COMPARISON MATRIX (RULE 9) */}
      <div className="p-5 rounded-xl border border-slate-300 bg-white space-y-3 shadow-sm">
        <div className="flex items-center justify-between pb-2 border-b border-slate-300">
          <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">
            [MUNICIPAL AI WORKFORCE OPERATIONAL COMPARISON]
          </h3>
          <span className="text-[11px] text-slate-500 font-medium">[5 Registered Enterprise Workflows]</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-300 text-[11px] font-extrabold uppercase tracking-wider text-slate-700 bg-slate-100/90">
                <th className="py-2.5 px-3">Workflow Name</th>
                <th className="py-2.5 px-3">Category</th>
                <th className="py-2.5 px-3">Trigger Source</th>
                <th className="py-2.5 px-3">Target SLA</th>
                <th className="py-2.5 px-3">Typical Latency</th>
                <th className="py-2.5 px-3">Operational Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 font-medium text-slate-700">
              {allWorkflows.map((wf) => {
                const isCurrent = wf.id === activeWorkflowId;
                return (
                  <tr 
                    key={wf.id}
                    onClick={() => {
                      setActiveWorkflowId(wf.id);
                      handleResetSimulation();
                    }}
                    className={`hover:bg-blue-50/30 cursor-pointer transition-colors ${
                      isCurrent ? 'bg-blue-50/50 font-semibold' : ''
                    }`}
                  >
                    <td className="py-2.5 px-3 font-bold text-slate-900 flex items-center gap-2">
                      <span className={`w-1.5 h-1.5 rounded-full ${isCurrent ? 'bg-blue-600' : 'bg-slate-400'}`} />
                      <span>{wf.name}</span>
                    </td>
                    <td className="py-2.5 px-3 text-slate-600">{wf.category}</td>
                    <td className="py-2.5 px-3 text-slate-500 max-w-xs truncate">{wf.trigger}</td>
                    <td className="py-2.5 px-3 text-slate-900 font-bold">{wf.targetSla}</td>
                    <td className="py-2.5 px-3 font-mono text-slate-700">{wf.typicalLatency}</td>
                    <td className="py-2.5 px-3">
                      <span className={`text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded border ${
                        wf.isRealIncident 
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-300' 
                          : 'bg-amber-50 text-amber-800 border-amber-300'
                      }`}>
                        {wf.isRealIncident ? '[Active Production]' : '[Simulation Mode]'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* STEP INSPECTOR MODAL */}
      {selectedStep && (
        <StepInspectorModal
          step={selectedStep}
          aiMode={currentWorkflowDef.aiMode}
          relatedIncidentId={isPrimaryReal ? selectedIncident.id : 'SIM-001'}
          onClose={() => setSelectedStep(null)}
        />
      )}
    </div>
  );
};
