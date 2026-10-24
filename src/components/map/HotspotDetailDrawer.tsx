import React from 'react';
import { Flame, X, ArrowRight, Sparkles } from 'lucide-react';
import { Hotspot, Incident } from '../../types';

interface HotspotDetailDrawerProps {
  hotspot: Hotspot;
  incidents: Incident[];
  onClose: () => void;
  onSelectIncident: (incident: Incident) => void;
  onOpenDetailModal: (incident: Incident) => void;
}

export const HotspotDetailDrawer: React.FC<HotspotDetailDrawerProps> = ({
  hotspot,
  incidents,
  onClose,
  onSelectIncident,
  onOpenDetailModal
}) => {
  const clusterIncidents = incidents.filter(i => 
    hotspot.incidentIds.includes(i.id) || i.locality.toLowerCase().includes(hotspot.locality.toLowerCase())
  );

  const criticalCount = clusterIncidents.filter(i => i.severity === 'CRITICAL').length;
  const highCount = clusterIncidents.filter(i => i.severity === 'HIGH').length;
  const mediumCount = clusterIncidents.filter(i => i.severity === 'MEDIUM').length;
  const lowCount = clusterIncidents.filter(i => i.severity === 'LOW').length;
  const total = clusterIncidents.length || 1;

  return (
    <div className="absolute top-4 right-4 z-40 max-w-md w-full p-5 rounded-2xl bg-dark-900/95 border border-white/[0.1] backdrop-blur-xl shadow-2xl space-y-4 animate-fadeIn text-slate-100 font-sans">
      {/* HEADER */}
      <div className="flex items-start justify-between gap-3 pb-3 border-b border-white/[0.06]">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
            <Flame className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-medium text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20">
                Hotspot Cluster
              </span>
              <span className="text-[11px] font-mono text-slate-400">{hotspot.id}</span>
            </div>
            <h3 className="text-sm font-semibold text-white mt-0.5">{hotspot.name}</h3>
          </div>
        </div>

        <button
          onClick={onClose}
          className="p-1 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-slate-400 hover:text-white transition-all cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* METRICS GRID */}
      <div className="grid grid-cols-3 gap-2 p-2.5 rounded-xl bg-dark-950/60 border border-white/[0.04] text-xs">
        <div>
          <div className="text-[10px] text-slate-500">Density</div>
          <div className="text-white font-semibold font-mono">{hotspot.incidentCount} reports</div>
          <div className="text-[10px] text-slate-400 font-mono">{hotspot.radiusMeters}m radius</div>
        </div>
        <div>
          <div className="text-[10px] text-slate-500">Velocity</div>
          <div className="text-amber-400 font-semibold font-mono">{hotspot.growthRate}</div>
          <div className="text-[10px] text-slate-400">Past 48h</div>
        </div>
        <div>
          <div className="text-[10px] text-slate-500">Confidence</div>
          <div className="text-white font-semibold font-mono">{(hotspot.confidence * 100).toFixed(0)}%</div>
          <div className="text-[10px] text-slate-400">Spatial index</div>
        </div>
      </div>

      {/* SEVERITY DISTRIBUTION BAR */}
      <div className="space-y-1.5 text-xs">
        <div className="flex items-center justify-between text-[11px] text-slate-400">
          <span>Cluster Breakdown</span>
          <span className="text-red-700 font-bold">{criticalCount} Critical</span>
        </div>
        <div className="h-2 w-full rounded-full overflow-hidden flex bg-dark-950">
          <div style={{ width: `${(criticalCount / total) * 100}%` }} className="bg-rose-500 h-full" title="Critical" />
          <div style={{ width: `${(highCount / total) * 100}%` }} className="bg-amber-500 h-full" title="High" />
          <div style={{ width: `${(mediumCount / total) * 100}%` }} className="bg-blue-500 h-full" title="Medium" />
          <div style={{ width: `${(lowCount / total) * 100}%` }} className="bg-emerald-500 h-full" title="Low" />
        </div>
      </div>

      {/* RECOMMENDED ACTION */}
      <div className="p-3 rounded-xl bg-dark-950/60 border border-white/[0.04] space-y-1 text-xs">
        <div className="text-slate-400 font-medium text-[11px] flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-blue-400" />
          <span>Recommended Mitigation</span>
        </div>
        <p className="text-slate-300 text-[11px] leading-relaxed">
          {hotspot.recommendedAction}
        </p>
      </div>

      {/* CORRELATED REPORTS LIST */}
      <div className="space-y-1.5">
        <div className="text-[11px] text-slate-400 font-medium flex items-center justify-between">
          <span>Correlated Reports ({clusterIncidents.length})</span>
          <span className="text-[10px] text-slate-500">Select to focus</span>
        </div>

        <div className="space-y-1 max-h-36 overflow-y-auto pr-1 text-xs">
          {clusterIncidents.map(inc => (
            <div
              key={inc.id}
              onClick={() => onSelectIncident(inc)}
              className="p-2 rounded-lg bg-dark-950/50 hover:bg-dark-950 border border-white/[0.04] hover:border-white/[0.08] cursor-pointer flex items-center justify-between transition-all"
            >
              <div className="flex items-center gap-2">
                <span className={`w-1.5 h-1.5 rounded-full ${
                  inc.severity === 'CRITICAL' ? 'bg-rose-400' :
                  inc.severity === 'HIGH' ? 'bg-amber-400' :
                  inc.severity === 'MEDIUM' ? 'bg-blue-400' : 'bg-emerald-400'
                }`} />
                <span className="font-mono text-white font-medium">{inc.id}</span>
                <span className="text-slate-400 text-[11px]">{inc.category}</span>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onOpenDetailModal(inc);
                }}
                className="text-slate-400 hover:text-white p-1"
                title="Inspect trace"
              >
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
