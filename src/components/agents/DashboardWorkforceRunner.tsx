import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, 
  RotateCcw, 
  CheckCircle2, 
  Clock, 
  Cpu, 
  Eye, 
  MapPin, 
  AlertTriangle, 
  Layers, 
  ShieldCheck, 
  Activity, 
  Terminal, 
  ChevronRight, 
  Sparkles, 
  ArrowRight,
  Zap,
  Info,
  ExternalLink,
  ShieldAlert
} from 'lucide-react';
import { Incident, AgentName } from '../../types';
import { 
  WorkflowStep, 
  AgentWorkflowDef, 
  buildRealIncidentWorkflow,
  getAllWorkflowDefinitions 
} from '../../services/agentWorkflows';
import { incidentStore } from '../../services/incidentStore';

interface DashboardWorkforceRunnerProps {
  selectedIncident?: Incident | null;
  onNavigateToFullWorkflow?: () => void;
  onOpenIncidentDetail?: (incident: Incident) => void;
}

export const DashboardWorkforceRunner: React.FC<DashboardWorkforceRunnerProps> = ({
  selectedIncident: propIncident,
  onNavigateToFullWorkflow,
  onOpenIncidentDetail
}) => {
  const [incidents, setIncidents] = useState<Incident[]>(incidentStore.getIncidents());
  const [activeIncident, setActiveIncident] = useState<Incident>(
    propIncident || incidentStore.getSelectedIncident() || incidentStore.getIncidents()[0]
  );

  // Keep in sync with store or props
  useEffect(() => {
    if (propIncident) {
      setActiveIncident(propIncident);
    }
  }, [propIncident]);

  useEffect(() => {
    const unsub = incidentStore.subscribe(() => {
      const all = incidentStore.getIncidents();
      setIncidents(all);
      const sel = incidentStore.getSelectedIncident();
      if (sel && !propIncident) {
        setActiveIncident(sel);
      }
    });
    return unsub;
  }, [propIncident]);

  // Scenarios for quick-testing
  const scenarios = [
    { id: 'current', label: `Incident #${activeIncident?.id || 'Active'}`, desc: `${activeIncident?.category} • ${activeIncident?.locality}` },
    { id: 'pothole', label: 'P1 Critical Crater', desc: 'RK Beach Road • 87cm Cavity' },
    { id: 'water', label: 'P2 Pipeline Rupture', desc: 'Gajuwaka Belt • 180 PSI' },
    { id: 'streetlight', label: 'P3 Dark Corridor', desc: 'Siripuram Junction • 8 Lamps' }
  ];
  const [selectedScenarioId, setSelectedScenarioId] = useState<string>('current');

  // Build workflow definition for the active context
  const currentWorkflowDef = buildRealIncidentWorkflow(activeIncident);

  // Runner state
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(-1);
  const [focusedStepIndex, setFocusedStepIndex] = useState<number>(0);
  const [steps, setSteps] = useState<WorkflowStep[]>(currentWorkflowDef.steps);
  const [logs, setLogs] = useState<{ time: string; agent: string; message: string }[]>(currentWorkflowDef.liveLogs);

  const terminalEndRef = useRef<HTMLDivElement>(null);

  // Sync steps when active incident changes (if not actively running)
  useEffect(() => {
    if (!isSimulating) {
      const updated = buildRealIncidentWorkflow(activeIncident);
      setSteps(updated.steps);
      setLogs(updated.liveLogs);
      setIsCompleted(false);
      setCurrentStepIndex(-1);
      setFocusedStepIndex(0);
    }
  }, [activeIncident, isSimulating]);

  // Auto-scroll terminal
  useEffect(() => {
    if (isSimulating && terminalEndRef.current) {
      terminalEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs, isSimulating]);

  // Agent Theme Helper
  const getAgentMeta = (name: AgentName) => {
    switch (name) {
      case 'Orchestrator':
        return { short: 'Ingest', icon: Cpu, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200', ring: 'ring-blue-500' };
      case 'Vision Agent':
        return { short: 'Vision AI', icon: Eye, color: 'text-cyan-600', bg: 'bg-cyan-50', border: 'border-cyan-200', ring: 'ring-cyan-500' };
      case 'Geo Agent':
        return { short: 'Geocode', icon: MapPin, color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200', ring: 'ring-emerald-500' };
      case 'Triage Agent':
        return { short: 'Triage SLA', icon: AlertTriangle, color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200', ring: 'ring-amber-500' };
      case 'Correlation Agent':
        return { short: 'Dedupe', icon: Layers, color: 'text-indigo-600', bg: 'bg-indigo-50', border: 'border-indigo-200', ring: 'ring-indigo-500' };
      case 'Decision Agent':
        return { short: 'Dispatch', icon: ShieldCheck, color: 'text-purple-600', bg: 'bg-purple-50', border: 'border-purple-200', ring: 'ring-purple-500' };
      case 'Monitoring Agent':
        return { short: 'Monitor', icon: Activity, color: 'text-teal-600', bg: 'bg-teal-50', border: 'border-teal-200', ring: 'ring-teal-500' };
      default:
        return { short: name, icon: Activity, color: 'text-slate-600', bg: 'bg-slate-50', border: 'border-slate-300', ring: 'ring-slate-500' };
    }
  };

  // --------------------------------------------------------------------------
  // RUN PIPELINE (SIMPLE, ROBUST, NON-CLUMSY)
  // --------------------------------------------------------------------------
  const handleRunPipeline = async () => {
    if (isSimulating) return;

    setIsSimulating(true);
    setIsCompleted(false);
    setLogs([]);

    // Initialize all steps to IDLE
    const initialSteps = currentWorkflowDef.steps.map(s => ({
      ...s,
      status: 'WAITING' as const,
      durationMs: 0
    }));
    setSteps(initialSteps);

    const startTime = performance.now();
    const newLogs: { time: string; agent: string; message: string }[] = [];

    for (let i = 0; i < currentWorkflowDef.steps.length; i++) {
      setCurrentStepIndex(i);
      setFocusedStepIndex(i);

      // Set current step to RUNNING
      setSteps(prev => prev.map((s, idx) => 
        idx === i ? { ...s, status: 'RUNNING' } : s
      ));

      const stepRef = currentWorkflowDef.steps[i];
      const elapsed = ((performance.now() - startTime) / 1000).toFixed(2);
      const logEntry = {
        time: `00:0${elapsed}`,
        agent: stepRef.agentName.toUpperCase().replace(' AGENT', ''),
        message: stepRef.telemetryLog
      };
      newLogs.push(logEntry);
      setLogs([...newLogs]);

      // Delay for realistic, satisfying visual execution
      await new Promise(r => setTimeout(r, 480));

      // Mark step completed
      setSteps(prev => prev.map((s, idx) => 
        idx === i ? { 
          ...s, 
          status: 'COMPLETED', 
          durationMs: stepRef.durationMs 
        } : s
      ));
    }

    setCurrentStepIndex(currentWorkflowDef.steps.length);
    setIsSimulating(false);
    setIsCompleted(true);
  };

  // --------------------------------------------------------------------------
  // RESET PIPELINE
  // --------------------------------------------------------------------------
  const handleReset = () => {
    setIsSimulating(false);
    setIsCompleted(false);
    setCurrentStepIndex(-1);
    setFocusedStepIndex(0);
    setSteps(currentWorkflowDef.steps);
    setLogs(currentWorkflowDef.liveLogs);
  };

  // Scenario Selection Handler
  const handleSelectScenario = (scId: string) => {
    setSelectedScenarioId(scId);
    if (scId === 'current') {
      const live = propIncident || incidentStore.getSelectedIncident() || incidents[0];
      setActiveIncident(live);
    } else if (scId === 'pothole') {
      const match = incidents.find(i => i.category === 'Pothole') || incidents[0];
      setActiveIncident(match);
    } else if (scId === 'water') {
      const match = incidents.find(i => i.category === 'Water Leakage') || incidents[1] || incidents[0];
      setActiveIncident(match);
    } else if (scId === 'streetlight') {
      const match = incidents.find(i => i.category === 'Broken Streetlight') || incidents[2] || incidents[0];
      setActiveIncident(match);
    }
  };

  const focusedStep = steps[focusedStepIndex] || steps[0];
  const focusedMeta = getAgentMeta(focusedStep.agentName);
  const FocusedIcon = focusedMeta.icon;

  // Calculate completed count
  const completedCount = steps.filter(s => s.status === 'COMPLETED').length;
  const progressPercent = isCompleted ? 100 : Math.round((completedCount / steps.length) * 100);

  return (
    <div className="p-5 sm:p-6 rounded-xl border border-slate-300 shadow-sm bg-white space-y-5 font-sans">
      
      {/* 1. TOP HEADER & PROMINENT RUN CONTROLS */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-300">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-blue-50 border border-blue-200/80 flex items-center justify-center text-blue-600 shadow-xs">
              <Sparkles className="w-4 h-4 text-blue-600" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black tracking-tight text-slate-900">
                  AI Agent Workforce
                </h2>
                <span className={`text-[11px] px-2.5 py-0.5 rounded-full font-bold border ${
                  isSimulating 
                    ? 'bg-amber-50 text-amber-700 border-amber-300 animate-pulse' 
                    : isCompleted 
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-300' 
                    : 'bg-blue-50 text-blue-700 border-blue-300'
                }`}>
                  {isSimulating 
                    ? `[STATUS: EXECUTING AGENT ${Math.min(currentStepIndex + 1, 7)} OF 7]` 
                    : isCompleted 
                    ? '[STATUS: PIPELINE VERIFIED 100%]' 
                    : '[STATUS: 7 AGENTS SYNCHRONIZED]'}
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Target: Incident <strong className="text-slate-900 font-mono font-bold">#{activeIncident.id}</strong> ({activeIncident.category} at {activeIncident.locality})
              </p>
            </div>
          </div>
        </div>

        {/* PRIMARY RUNNER ACTIONS */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Quick Scenario Selector */}
          <div className="flex items-center p-1 bg-slate-100/80 rounded-xl border border-slate-300 text-xs">
            {scenarios.map((sc) => (
              <button
                key={sc.id}
                disabled={isSimulating}
                onClick={() => handleSelectScenario(sc.id)}
                className={`px-2.5 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
                  selectedScenarioId === sc.id
                    ? 'bg-white text-slate-900 shadow-xs border border-slate-300'
                    : 'text-slate-600 hover:text-slate-900'
                } ${isSimulating ? 'opacity-50 cursor-not-allowed' : ''}`}
                title={sc.desc}
              >
                {sc.label}
              </button>
            ))}
          </div>

          {/* RESET BUTTON */}
          <button
            onClick={handleReset}
            disabled={isSimulating}
            className="p-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-600 hover:text-slate-900 transition-all cursor-pointer shadow-xs disabled:opacity-40 disabled:cursor-not-allowed"
            title="Reset Pipeline"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          {/* RUN AI WORKFORCE BUTTON (PROMINENT & SIMPLE) */}
          <button
            onClick={handleRunPipeline}
            disabled={isSimulating}
            className={`px-4 py-2 rounded-xl text-xs font-black tracking-wide flex items-center gap-2 transition-all cursor-pointer shadow-sm ${
              isSimulating
                ? 'bg-blue-500 text-white cursor-wait'
                : isCompleted
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-500/20'
                : 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/20'
            }`}
          >
            {isSimulating ? (
              <>
                <span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                <span>Running Pipeline...</span>
              </>
            ) : isCompleted ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-white" />
                <span>Re-Run AI Pipeline</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-white" />
                <span>Run AI Pipeline</span>
              </>
            )}
          </button>

          {/* STUDIO LINK */}
          {onNavigateToFullWorkflow && (
            <button
              onClick={onNavigateToFullWorkflow}
              className="px-3 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 hover:text-slate-900 border border-slate-300 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
              title="Open full 5-workflow studio"
            >
              <span>Full Studio</span>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            </button>
          )}
        </div>
      </div>

      {/* 2. OVERALL PIPELINE PROGRESS TRACK */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 font-semibold text-slate-700">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500">Pipeline Execution:</span>
            <span className="font-mono text-slate-900 font-bold">{progressPercent}%</span>
            <span className="text-slate-500 text-[11px]">({completedCount} of 7 agents completed)</span>
          </div>
          <div className="text-[11px] text-slate-500 font-mono">
            {isCompleted ? '[TOTAL LATENCY: 2.34s]' : isSimulating ? '[PROCESSING IN REAL-TIME...]' : '[STATUS: READY FOR EXECUTION]'}
          </div>
        </div>
        <div className="w-full h-1.5 rounded-full bg-slate-100 overflow-hidden border border-slate-300">
          <div 
            className="h-full bg-gradient-to-r from-blue-600 via-indigo-600 to-emerald-500 transition-all duration-300 rounded-full"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* 3. CLEAN HORIZONTAL PIPELINE FLOW (7 AGENTS CONNECTED) */}
      <div className="relative pt-1 pb-1">
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5">
          {steps.map((step, idx) => {
            const meta = getAgentMeta(step.agentName);
            const Icon = meta.icon;
            const isStepRunning = step.status === 'RUNNING';
            const isStepDone = step.status === 'COMPLETED';
            const isStepFocused = focusedStepIndex === idx;

            return (
              <div
                key={step.id}
                onClick={() => setFocusedStepIndex(idx)}
                className={`relative p-3 rounded-xl border transition-all cursor-pointer text-left flex flex-col justify-between min-h-[96px] ${
                  isStepRunning
                    ? `border-blue-600 bg-blue-50/50 shadow-md ring-2 ring-blue-500 animate-pulse`
                    : isStepDone
                    ? isStepFocused
                      ? `border-emerald-600 bg-emerald-50/20 ring-2 ring-emerald-500 shadow-sm`
                      : `border-slate-300 hover:border-blue-600 hover:bg-blue-50/40 bg-white shadow-xs`
                    : isStepFocused
                    ? `border-blue-600 bg-blue-50/30 ring-2 ring-blue-400 shadow-xs`
                    : `border-slate-300 bg-slate-50/70 hover:border-slate-400 opacity-90 hover:opacity-100 shadow-xs`
                }`}
              >
                {/* TOP ROW: ICON + STEP NUMBER & STATUS */}
                <div className="flex items-center justify-between gap-1.5">
                  <div className="flex items-center gap-1.5">
                    <span className={`w-7 h-7 rounded-lg flex items-center justify-center ${meta.bg} ${meta.color} border ${meta.border} shadow-2xs`}>
                      <Icon className="w-3.5 h-3.5" />
                    </span>
                    <span className="text-[10px] font-mono font-extrabold text-slate-500">
                      0{idx + 1}
                    </span>
                  </div>

                  {/* STATUS BADGE */}
                  {isStepRunning ? (
                    <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-300 animate-pulse">
                      [RUNNING]
                    </span>
                  ) : isStepDone ? (
                    <span className="text-[10px] font-mono font-extrabold px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-300 flex items-center gap-1">
                      <CheckCircle2 className="w-2.5 h-2.5 text-emerald-600" />
                      <span>{step.durationMs || 42}ms</span>
                    </span>
                  ) : (
                    <span className="text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-slate-100 text-slate-500 border border-slate-300">
                      [READY]
                    </span>
                  )}
                </div>

                {/* BOTTOM ROW: AGENT SHORT TITLE & SUBTITLE */}
                <div className="mt-2">
                  <div className="text-xs font-extrabold text-slate-900 tracking-tight truncate">
                    {meta.short}
                  </div>
                  <div className="text-[10px] text-slate-500 font-medium truncate">
                    {step.agentName}
                  </div>
                </div>

                {/* ACTIVE FOCUS INDICATOR DOT */}
                {isStepFocused && (
                  <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-blue-600 shadow-xs" />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. EXECUTION CONSOLE: AGENT DECISION FOCUS (LEFT) + LIVE LOG STREAM (RIGHT) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5 pt-1">
        
        {/* LEFT COLUMN: FOCUSED AGENT DECISION (7 COLS) */}
        <div className="lg:col-span-7 p-4 rounded-xl border border-slate-300 bg-white flex flex-col justify-between space-y-3 shadow-xs">
          <div className="flex items-center justify-between pb-2.5 border-b border-slate-300">
            <div className="flex items-center gap-2.5">
              <span className={`p-1.5 rounded-lg ${focusedMeta.bg} ${focusedMeta.color} border ${focusedMeta.border}`}>
                <FocusedIcon className="w-4 h-4" />
              </span>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black text-slate-900">{focusedStep.agentName}</span>
                  <span className="text-[10px] px-2 py-0.5 rounded font-extrabold uppercase tracking-wider bg-slate-100 text-slate-700 border border-slate-300">
                    [STEP 0{focusedStepIndex + 1}: {focusedStep.phase}]
                  </span>
                </div>
                <div className="text-[11px] text-slate-500 font-medium">{focusedStep.role}</div>
              </div>
            </div>

            {onOpenIncidentDetail && (
              <button
                onClick={() => onOpenIncidentDetail(activeIncident)}
                className="text-[11px] font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 cursor-pointer transition-colors"
                title="Inspect full agent payload"
              >
                <span>[INSPECT TRACE]</span>
                <ExternalLink className="w-3 h-3" />
              </button>
            )}
          </div>

          {/* WHAT THIS AGENT DECIDED (PLAIN ENGLISH & CLEAR) */}
          <div className="space-y-1">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500">[AUTONOMOUS FINDING / ACTION]</span>
            <p className="text-xs sm:text-sm font-semibold text-slate-900 leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-300 shadow-2xs">
              "{focusedStep.keyDecision || focusedStep.telemetryLog}"
            </p>
          </div>

          {/* INPUT & OUTPUT TAGS */}
          <div className="grid grid-cols-2 gap-2 text-xs pt-1">
            <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-300">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 block">[TELEMETRY INPUT]</span>
              <span className="font-bold text-slate-900 text-[11px] truncate block mt-0.5">
                {focusedStep.inputLabel}
              </span>
            </div>
            <div className="p-2.5 rounded-lg bg-emerald-50/50 border border-emerald-200">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-700 block">[SYNTHESIZED OUTPUT]</span>
              <span className="font-bold text-emerald-800 text-[11px] truncate block mt-0.5">
                {focusedStep.outputLabel}
              </span>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: LIVE MONOSPACE TERMINAL / TELEMETRY LOG (5 COLS - INVERTED CONSOLE EXCEPTION) */}
        <div className="lg:col-span-5 p-4 rounded-xl border border-[#334155] bg-[#0f172a] text-[#38bdf8] flex flex-col justify-between shadow-sm font-mono">
          <div className="flex items-center justify-between pb-2 border-b border-[#334155] text-xs">
            <div className="flex items-center gap-2">
              <Terminal className="w-3.5 h-3.5 text-blue-400" />
              <span className="font-mono font-bold text-slate-200 text-[11px] uppercase tracking-wider">[WORKFORCE LIVE LOG STREAM]</span>
            </div>
            <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>[BUS ACTIVE]</span>
            </span>
          </div>

          {/* LOG STREAM */}
          <div className="py-2 space-y-1.5 font-mono text-[10px] overflow-y-auto max-h-[140px] pr-1 scrollbar-thin text-slate-300">
            {logs.length === 0 ? (
              <div className="text-slate-400 italic text-[11px] py-4 text-center">
                Press "Run AI Pipeline" to execute the 7-agent DAG...
              </div>
            ) : (
              logs.map((l, i) => (
                <div key={i} className="flex items-start gap-1.5 leading-tight">
                  <span className="text-slate-400 font-semibold">{l.time}</span>
                  <span className="text-[#38bdf8] font-bold">{l.agent}:</span>
                  <span className="text-slate-200">{l.message}</span>
                </div>
              ))
            )}
            <div ref={terminalEndRef} />
          </div>

          <div className="pt-2 border-t border-[#334155] flex items-center justify-between text-[10px] text-slate-400 font-mono">
            <span>GVMC Autonomous Bus</span>
            <span>[{logs.length} EVENTS PROCESSED]</span>
          </div>
        </div>
      </div>

      {/* 5. SUCCESS CONFIRMATION FOOTER (WHEN COMPLETED) */}
      {isCompleted && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-300 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 text-xs text-emerald-900 animate-fadeIn shadow-xs">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center flex-shrink-0">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <div>
              <span className="font-extrabold uppercase tracking-wider text-emerald-950 text-[11px] block">
                [AUTONOMOUS WORKFORCE PIPELINE VERIFIED & COMPLETE]
              </span>
              <span className="font-medium text-emerald-800 text-xs">
                Incident #{activeIncident.id} classified as {activeIncident.priority} {activeIncident.category}, geocoded to {activeIncident.locality}, and assigned to {activeIncident.assignedTeam || 'Maintenance Unit 3'}.
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-center flex-shrink-0">
            <button
              onClick={handleRunPipeline}
              className="px-3 py-1.5 rounded-lg bg-white border border-emerald-300 text-emerald-800 font-extrabold hover:bg-emerald-100 transition-colors cursor-pointer text-[11px] uppercase tracking-wider"
            >
              [Re-Run Test]
            </button>
            {onOpenIncidentDetail && (
              <button
                onClick={() => onOpenIncidentDetail(activeIncident)}
                className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white font-extrabold hover:bg-emerald-700 transition-colors cursor-pointer text-[11px] uppercase tracking-wider shadow-xs"
              >
                [View Full Dossier]
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
