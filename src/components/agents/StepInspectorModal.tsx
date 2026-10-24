import React, { useState } from 'react';
import { 
  X, 
  Copy, 
  Check, 
  Cpu, 
  Eye, 
  MapPin, 
  AlertTriangle, 
  Layers, 
  ShieldCheck, 
  Activity, 
  Clock, 
  Sparkles, 
  ShieldAlert,
  Info,
  Terminal,
  Code
} from 'lucide-react';
import { WorkflowStep, ProviderType } from '../../services/agentWorkflows';
import { AgentName, AIMode } from '../../types';

interface StepInspectorModalProps {
  step: WorkflowStep | null;
  aiMode: AIMode | 'SIMULATION';
  relatedIncidentId?: string;
  onClose: () => void;
}

export const StepInspectorModal: React.FC<StepInspectorModalProps> = ({
  step,
  aiMode,
  relatedIncidentId,
  onClose
}) => {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'details' | 'json'>('details');

  if (!step) return null;

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

  const Icon = getAgentIcon(step.agentName);

  const fullPayload = {
    stepId: step.id,
    stepNumber: step.stepNumber,
    agent: step.agentName,
    role: step.role,
    phase: step.phase,
    purpose: step.purpose,
    status: step.status,
    startedAt: step.startedAt,
    completedAt: step.completedAt,
    durationMs: step.durationMs,
    confidence: step.confidence,
    aiMode: aiMode,
    providerType: step.providerType,
    modelTech: step.modelTech,
    relatedIncidentId: relatedIncidentId || 'CP-1042',
    inputs: step.inputs,
    processingLogic: step.processingLogic,
    outputs: step.outputs,
    keyDecision: step.keyDecision,
    telemetryLog: step.telemetryLog
  };

  const handleCopyJson = () => {
    navigator.clipboard.writeText(JSON.stringify(fullPayload, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-fadeIn font-sans">
      <div 
        className="bg-white rounded-2xl border border-slate-300 shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-scaleUp"
        onClick={(e) => e.stopPropagation()}
      >
        {/* MODAL HEADER */}
        <div className="p-5 border-b border-slate-300 flex items-start justify-between gap-4 bg-slate-50/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-700 shadow-xs">
              <Icon className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-black text-slate-900">
                  Step {step.stepNumber}: {step.agentName}
                </h3>
                <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full border ${
                  step.status === 'COMPLETED' ? 'bg-emerald-50 text-emerald-700 border-emerald-300' :
                  step.status === 'RUNNING' ? 'bg-blue-50 text-blue-700 border-blue-300' :
                  'bg-slate-100 text-slate-600 border-slate-300'
                }`}>
                  [{step.status}]
                </span>
              </div>
              <div className="text-xs text-slate-500 font-medium mt-0.5">
                {step.role} • Phase: <span className="text-slate-800 font-semibold">{step.phase}</span>
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-800 hover:bg-slate-200/60 transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* HONEST PROVENANCE BANNER (RULE 12) */}
        <div className="px-5 py-2.5 bg-blue-50/60 border-b border-slate-300 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-slate-700 font-medium">
            <Info className="w-4 h-4 text-blue-600 flex-shrink-0" />
            <span>
              AI Mode: <strong className="text-slate-900">{aiMode === 'LIVE_AI' ? 'LIVE AI' : aiMode === 'SIMULATION' ? 'SIMULATION MODE' : 'DEMO — DETERMINISTIC'}</strong>
            </span>
            <span className="text-slate-300">•</span>
            <span className="text-slate-500 font-mono text-[11px]">{step.modelTech}</span>
          </div>

          <span className={`text-[10px] px-2 py-0.5 rounded font-extrabold uppercase tracking-wider border ${
            step.providerType === 'REAL_PERSISTED' ? 'bg-emerald-100 text-emerald-800 border-emerald-300' :
            step.providerType === 'DEMO_ALGORITHM' ? 'bg-blue-100 text-blue-800 border-blue-300' :
            'bg-slate-200 text-slate-700 border-slate-300'
          }`}>
            [{step.providerType.replace('_', ' ')}]
          </span>
        </div>

        {/* TAB TOGGLE: DETAILS vs JSON */}
        <div className="px-5 pt-3 border-b border-slate-100 flex items-center gap-4 text-xs font-bold text-slate-500">
          <button
            onClick={() => setActiveTab('details')}
            className={`pb-2.5 transition-all cursor-pointer border-b-2 ${
              activeTab === 'details' 
                ? 'border-blue-600 text-blue-700' 
                : 'border-transparent hover:text-slate-800'
            }`}
          >
            Step Intelligence Details
          </button>
          <button
            onClick={() => setActiveTab('json')}
            className={`pb-2.5 transition-all cursor-pointer border-b-2 flex items-center gap-1.5 ${
              activeTab === 'json' 
                ? 'border-blue-600 text-blue-700' 
                : 'border-transparent hover:text-slate-800'
            }`}
          >
            <Code className="w-3.5 h-3.5" />
            <span>Raw JSON Event Payload</span>
          </button>
        </div>

        {/* MODAL BODY */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1 text-xs text-slate-700">
          {activeTab === 'details' ? (
            <>
              {/* PURPOSE */}
              <div>
                <h4 className="font-bold text-slate-900 mb-1 uppercase tracking-wider text-[11px]">[OPERATIONAL PURPOSE]</h4>
                <p className="text-slate-600 leading-relaxed font-medium bg-slate-50 p-3 rounded-xl border border-slate-300">
                  {step.purpose}
                </p>
              </div>

              {/* TIMING & CONFIDENCE METRICS */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-300">
                  <div className="text-[10px] text-slate-500 font-extrabold uppercase tracking-wider">[EXEC TIME]</div>
                  <div className="text-sm font-bold font-mono text-slate-900 mt-0.5">{step.durationMs} ms</div>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-300">
                  <div className="text-[10px] text-slate-500 font-extrabold uppercase tracking-wider">[CONFIDENCE]</div>
                  <div className="text-sm font-bold font-mono text-blue-700 mt-0.5">
                    {step.confidence !== undefined ? `${(step.confidence * 100).toFixed(1)}%` : '100%'}
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-300">
                  <div className="text-[10px] text-slate-500 font-extrabold uppercase tracking-wider">[STARTED]</div>
                  <div className="text-xs font-bold font-mono text-slate-700 mt-1">{step.startedAt || 'T+0.00s'}</div>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-300">
                  <div className="text-[10px] text-slate-500 font-extrabold uppercase tracking-wider">[COMPLETED]</div>
                  <div className="text-xs font-bold font-mono text-slate-700 mt-1">{step.completedAt || `T+${(step.durationMs / 1000).toFixed(2)}s`}</div>
                </div>
              </div>

              {/* PROCESSING LOGIC */}
              <div>
                <h4 className="font-bold text-slate-900 mb-1 uppercase tracking-wider text-[11px]">[PROCESSING LOGIC & HEURISTICS]</h4>
                <p className="text-slate-700 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-300">
                  {step.processingLogic}
                </p>
              </div>

              {/* INPUT vs OUTPUT DUAL CARDS */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-300 space-y-2">
                  <div className="flex items-center justify-between font-bold text-slate-900 border-b border-slate-300 pb-1.5">
                    <span className="text-[11px] uppercase tracking-wider font-extrabold">[INPUT TELEMETRY]</span>
                    <span className="text-[10px] text-slate-500 font-mono">{step.inputLabel}</span>
                  </div>
                  <pre className="text-[11px] font-mono text-[#38bdf8] bg-[#0f172a] p-2.5 rounded-lg border border-[#334155] overflow-x-auto whitespace-pre-wrap">
                    {JSON.stringify(step.inputs, null, 2)}
                  </pre>
                </div>

                <div className="p-3.5 rounded-xl bg-blue-50/50 border border-blue-200 space-y-2">
                  <div className="flex items-center justify-between font-bold text-slate-900 border-b border-blue-200 pb-1.5">
                    <span className="text-[11px] uppercase tracking-wider font-extrabold text-blue-900">[SYNTHESIZED OUTPUT]</span>
                    <span className="text-[10px] text-blue-700 font-mono">{step.outputLabel}</span>
                  </div>
                  <pre className="text-[11px] font-mono text-[#38bdf8] bg-[#0f172a] p-2.5 rounded-lg border border-[#334155] overflow-x-auto whitespace-pre-wrap">
                    {JSON.stringify(step.outputs, null, 2)}
                  </pre>
                </div>
              </div>

              {/* KEY DECISION CALLOUT */}
              <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-900">
                <div className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-800">[KEY DECISION RATIONALE]</div>
                <div className="font-semibold text-xs mt-1 leading-relaxed">
                  {step.keyDecision}
                </div>
              </div>
            </>
          ) : (
            <div className="relative">
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-300">
                <span className="text-slate-500 font-mono text-[11px]">[JSON EVENT PAYLOAD SPECIFICATION]</span>
                <button
                  onClick={handleCopyJson}
                  className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs border border-slate-300"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied' : 'Copy JSON'}</span>
                </button>
              </div>
              <pre className="bg-[#0f172a] text-[#38bdf8] border border-[#334155] p-4 rounded-xl text-[11px] font-mono overflow-x-auto max-h-[380px] shadow-inner">
                {JSON.stringify(fullPayload, null, 2)}
              </pre>
            </div>
          )}
        </div>

        {/* MODAL FOOTER */}
        <div className="p-4 border-t border-slate-300 bg-slate-50 flex items-center justify-between text-xs">
          <div className="text-slate-500">
            Linked Incident: <strong className="text-slate-900 font-mono">#{relatedIncidentId || 'CP-1042'}</strong>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold transition-all cursor-pointer shadow-xs"
          >
            Close Inspector
          </button>
        </div>
      </div>
    </div>
  );
};
