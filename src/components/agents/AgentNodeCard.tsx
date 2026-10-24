import React from 'react';
import { 
  Cpu, 
  Eye, 
  MapPin, 
  AlertTriangle, 
  Layers, 
  ShieldCheck, 
  Activity, 
  ArrowRight,
  CheckCircle2,
  Clock,
  Zap,
  Sparkles,
  Info
} from 'lucide-react';
import { WorkflowStep, ProviderType } from '../../services/agentWorkflows';
import { AgentName } from '../../types';

interface AgentNodeCardProps {
  step: WorkflowStep;
  isActive?: boolean;
  isSelected?: boolean;
  compact?: boolean;
  onClick?: () => void;
}

export const AgentNodeCard: React.FC<AgentNodeCardProps> = ({
  step,
  isActive = false,
  isSelected = false,
  compact = false,
  onClick
}) => {
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

  const getAgentTheme = (name: AgentName) => {
    switch (name) {
      case 'Orchestrator':
        return { accent: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200' };
      case 'Vision Agent':
        return { accent: 'text-cyan-600', bg: 'bg-cyan-50', border: 'border-cyan-200' };
      case 'Geo Agent':
        return { accent: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200' };
      case 'Triage Agent':
        return { accent: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200' };
      case 'Correlation Agent':
        return { accent: 'text-indigo-600', bg: 'bg-indigo-50', border: 'border-indigo-200' };
      case 'Decision Agent':
        return { accent: 'text-purple-600', bg: 'bg-purple-50', border: 'border-purple-200' };
      case 'Monitoring Agent':
        return { accent: 'text-teal-600', bg: 'bg-teal-50', border: 'border-teal-200' };
      default:
        return { accent: 'text-slate-600', bg: 'bg-slate-50', border: 'border-slate-300' };
    }
  };

  const getProviderBadge = (type: ProviderType) => {
    switch (type) {
      case 'REAL_PERSISTED':
        return { label: '[REAL EVENT]', cls: 'bg-emerald-50 text-emerald-800 border-emerald-300' };
      case 'DEMO_ALGORITHM':
        return { label: '[DEMO ALGORITHM]', cls: 'bg-blue-50 text-blue-800 border-blue-300' };
      case 'SIMULATED':
        return { label: '[SIMULATED]', cls: 'bg-slate-100 text-slate-700 border-slate-300' };
      case 'PLANNED_PROVIDER':
        return { label: '[PLANNED PROVIDER]', cls: 'bg-purple-50 text-purple-800 border-purple-300' };
    }
  };

  const Icon = getAgentIcon(step.agentName);
  const theme = getAgentTheme(step.agentName);
  const provider = getProviderBadge(step.providerType);

  if (compact) {
    return (
      <div
        onClick={onClick}
        className={`p-2.5 rounded-xl border transition-all cursor-pointer bg-white text-left ${
          isSelected 
            ? 'ring-2 ring-blue-500 border-blue-300 shadow-sm' 
            : isActive 
            ? 'border-blue-400 bg-blue-50/40 shadow-xs' 
            : 'border-slate-300 hover:border-blue-600 shadow-xs'
        }`}
      >
        <div className="flex items-center justify-between gap-1.5 mb-1">
          <div className="flex items-center gap-1.5 min-w-0">
            <span className={`p-1 rounded-md ${theme.bg} ${theme.accent} border ${theme.border}`}>
              <Icon className="w-3 h-3" />
            </span>
            <span className="text-[11px] font-bold text-slate-900 truncate">
              {step.agentName}
            </span>
          </div>
          <span className={`text-[9px] font-mono px-1.5 py-0.2 rounded font-semibold ${
            step.status === 'COMPLETED' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
            step.status === 'RUNNING' ? 'bg-blue-50 text-blue-700 border border-blue-200 animate-pulse' :
            'bg-slate-100 text-slate-500'
          }`}>
            {step.status === 'COMPLETED' ? `${step.durationMs}ms` : step.status}
          </span>
        </div>
        <div className="text-[10px] text-slate-500 truncate font-medium">
          {step.inputLabel} → {step.outputLabel}
        </div>
      </div>
    );
  }

  return (
    <div
      onClick={onClick}
      className={`rounded-xl border transition-all cursor-pointer bg-white p-3.5 flex flex-col justify-between space-y-2.5 text-left relative ${
        isSelected
          ? 'ring-2 ring-blue-500 border-blue-300 shadow-md'
          : isActive
          ? 'ring-2 ring-blue-400/70 border-blue-300 bg-blue-50/30 shadow-sm'
          : 'border-slate-300 hover:border-blue-600 hover:shadow-sm'
      }`}
    >
      {/* TOP: AGENT IDENTITY & ROLE */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <div className={`p-1.5 rounded-lg ${theme.bg} ${theme.accent} border ${theme.border} flex-shrink-0`}>
            <Icon className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-black text-slate-900 truncate">
                {step.stepNumber}. {step.agentName}
              </span>
            </div>
            <div className="text-[11px] text-slate-500 font-medium truncate">
              {step.role}
            </div>
          </div>
        </div>

        {/* STATUS PILL */}
        <div className="flex flex-col items-end gap-1 flex-shrink-0">
          <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full flex items-center gap-1 border ${
            step.status === 'COMPLETED' 
              ? 'bg-emerald-50 text-emerald-700 border-emerald-300' 
              : step.status === 'RUNNING' 
              ? 'bg-blue-50 text-blue-700 border-blue-300 animate-pulse' 
              : step.status === 'FAILED'
              ? 'bg-rose-50 text-rose-700 border-rose-300'
              : 'bg-slate-100 text-slate-600 border-slate-300'
          }`}>
            <span className={`w-1.5 h-1.5 rounded-full ${
              step.status === 'COMPLETED' ? 'bg-emerald-500' :
              step.status === 'RUNNING' ? 'bg-blue-500' :
              step.status === 'FAILED' ? 'bg-rose-500' : 'bg-slate-400'
            }`} />
            <span>[{step.status}]</span>
          </span>
        </div>
      </div>

      {/* MIDDLE: METRICS (DURATION & CONFIDENCE) */}
      <div className="grid grid-cols-2 gap-2 py-1.5 px-2.5 rounded-lg bg-slate-50/90 border border-slate-300 text-[11px]">
        <div className="flex items-center gap-1.5 text-slate-700">
          <Clock className="w-3.5 h-3.5 text-slate-400" />
          <span className="font-mono font-bold">{step.durationMs} ms</span>
        </div>
        <div className="flex items-center justify-end gap-1 text-slate-700">
          <span className="text-slate-500 text-[10px] font-extrabold uppercase">[CONFIDENCE]</span>
          <span className="font-mono font-bold text-blue-700">
            {step.confidence !== undefined ? `${(step.confidence * 100).toFixed(1)}%` : '100%'}
          </span>
        </div>
      </div>

      {/* BOTTOM: INPUT → OUTPUT FLOW INDICATOR */}
      <div className="pt-1 border-t border-slate-100 flex items-center justify-between text-[10px] font-mono">
        <div className="flex items-center gap-1 text-slate-600 font-bold truncate max-w-[190px]">
          <span className="truncate">{step.inputLabel}</span>
          <ArrowRight className="w-2.5 h-2.5 text-slate-400 flex-shrink-0" />
          <span className="text-blue-700 truncate">{step.outputLabel}</span>
        </div>

        <span className={`text-[9px] px-1.5 py-0.2 rounded font-semibold border ${provider.cls}`}>
          {provider.label}
        </span>
      </div>
    </div>
  );
};
