import React, { useState } from 'react';
import { 
  Flame, 
  MapPin, 
  TrendingUp, 
  AlertTriangle, 
  ShieldAlert, 
  CheckCircle2, 
  ArrowRight,
  Clock,
  Layers,
  Sparkles
} from 'lucide-react';
import { incidentStore } from '../services/incidentStore';
import { Hotspot, Incident } from '../types';
import { ActiveTab } from '../components/layout/AppShell';

interface HotspotIntelligenceViewProps {
  onNavigate: (tab: ActiveTab) => void;
  onOpenIncidentDetail: (incident: Incident) => void;
}

export const HotspotIntelligenceView: React.FC<HotspotIntelligenceViewProps> = ({ 
  onNavigate,
  onOpenIncidentDetail 
}) => {
  const [hotspots] = useState<Hotspot[]>(incidentStore.getHotspots());
  const [selectedHotspot, setSelectedHotspot] = useState<Hotspot>(hotspots[0]);
  const incidents = incidentStore.getIncidents();

  // Incidents belonging to the selected hotspot
  const clusterIncidents = incidents.filter(i => 
    selectedHotspot.incidentIds.includes(i.id) || i.locality === selectedHotspot.locality
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8 font-sans bg-slate-50">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-300">
        <div>
          <div className="flex items-center gap-2 text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
            <Flame className="w-4 h-4 text-amber-600" />
            <span>[SPATIAL CLUSTERING INTELLIGENCE]</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 mt-1">
            Infrastructure Hotspot Intelligence
          </h1>
          <p className="text-sm text-slate-500 max-w-2xl leading-relaxed mt-1">
            Proactive identification of recurring road and utility failures using spatial-temporal density analysis across Visakhapatnam.
          </p>
        </div>

        <div className="px-3.5 py-1.5 rounded-lg bg-amber-50 border border-amber-300 text-xs text-amber-800 font-extrabold uppercase tracking-wider flex items-center gap-2 shadow-xs">
          <span className="w-2 h-2 rounded-full bg-amber-500" />
          <span>[{hotspots.length} ACTIVE HOTSPOT CLUSTERS]</span>
        </div>
      </div>

      {/* TOP SUMMARY STATS WITH RICH ACCENT COLORS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl border border-slate-300 space-y-1 shadow-sm bg-white transition-all hover:border-blue-600 hover:bg-blue-50/20">
          <div className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500">[TOTAL CLUSTERED INCIDENTS]</div>
          <div className="text-2xl font-black text-slate-900 font-mono">
            {hotspots.reduce((acc, h) => acc + h.incidentCount, 0)}
          </div>
          <div className="text-xs text-blue-600 font-semibold">Across 3 municipal sectors</div>
        </div>

        <div className="p-4 rounded-xl border border-slate-300 space-y-1 shadow-sm bg-white transition-all hover:border-amber-600 hover:bg-amber-50/20">
          <div className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500">[HIGHEST VELOCITY SECTOR]</div>
          <div className="text-2xl font-black text-amber-600">MVP Colony (+34%)</div>
          <div className="text-xs text-slate-500">7 reports within 800m / 48 hrs</div>
        </div>

        <div className="p-4 rounded-xl border border-slate-300 space-y-1 shadow-sm bg-white transition-all hover:border-emerald-600 hover:bg-emerald-50/20">
          <div className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500">[PROACTIVE MITIGATION RATE]</div>
          <div className="text-2xl font-black text-emerald-600">100%</div>
          <div className="text-xs text-slate-500">All clusters assigned to GVMC teams</div>
        </div>
      </div>

      {/* MAIN SPLIT: HOTSPOT LIST (LEFT 5 COLS) + DETAIL ANALYSIS (RIGHT 7 COLS) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* RANKING TABLE (5 COLS) */}
        <div className="lg:col-span-5 space-y-3">
          <div className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">
            [IDENTIFIED CLUSTERS]
          </div>

          <div className="space-y-2.5">
            {hotspots.map((h, idx) => {
              const isSelected = selectedHotspot.id === h.id;
              return (
                <div
                  key={h.id}
                  onClick={() => setSelectedHotspot(h)}
                  className={`p-4 rounded-xl border cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-blue-50/40 border-blue-600 shadow-md ring-2 ring-blue-500/80'
                      : 'bg-white border-slate-300 hover:border-slate-400 hover:bg-slate-50 shadow-xs'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <span className="text-xs font-mono font-extrabold px-2 py-0.5 rounded bg-slate-100 text-slate-800 border border-slate-300">
                        #{idx + 1}
                      </span>
                      <span className="text-xs font-black text-slate-900">{h.name}</span>
                    </div>
                    <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-rose-50 text-rose-700 border border-rose-300">
                      [{h.severity}]
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 mt-3 pt-2.5 border-t border-slate-300 text-xs text-slate-600">
                    <div>
                      <div className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Reports</div>
                      <div className="text-slate-900 font-bold font-mono">{h.incidentCount}</div>
                    </div>
                    <div>
                      <div className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Radius</div>
                      <div className="text-slate-900 font-bold font-mono">{h.radiusMeters}m</div>
                    </div>
                    <div>
                      <div className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Trend</div>
                      <div className="text-amber-700 font-bold font-mono">{h.growthRate}</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* SELECTED HOTSPOT DEEP DIVE (7 COLS) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="p-6 rounded-xl border border-slate-300 bg-white space-y-5 shadow-sm">
            <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-300">
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-300">
                  [CLUSTER DETAIL • {selectedHotspot.id}]
                </span>
                <h2 className="text-lg font-black text-slate-900 mt-2">{selectedHotspot.name}</h2>
                <p className="text-xs text-slate-500 font-mono mt-0.5">
                  Center: {selectedHotspot.locality} ({selectedHotspot.latitude.toFixed(4)}, {selectedHotspot.longitude.toFixed(4)})
                </p>
              </div>

              <div className="text-right">
                <div className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">[CONFIDENCE]</div>
                <div className="text-xl font-black font-mono text-slate-900 mt-0.5">
                  {(selectedHotspot.confidence * 100).toFixed(0)}%
                </div>
              </div>
            </div>

            {/* RECOMMENDATION */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-300 space-y-2 shadow-2xs">
              <div className="flex items-center gap-2 text-[11px] font-extrabold uppercase tracking-wider text-slate-900">
                <Sparkles className="w-4 h-4 text-blue-600" />
                <span>[RECOMMENDED MUNICIPAL ACTION]</span>
              </div>
              <p className="text-xs text-slate-800 leading-relaxed font-sans">
                {selectedHotspot.recommendedAction}
              </p>
            </div>

            {/* CLUSTER SEVERITY DISTRIBUTION */}
            <div className="space-y-2">
              <div className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500">[SEVERITY BREAKDOWN]</div>
              <div className="h-2.5 w-full rounded-full overflow-hidden flex bg-slate-100 border border-slate-300">
                <div className="bg-rose-500 h-full w-[65%]" title="Critical P1 (65%)" />
                <div className="bg-amber-500 h-full w-[25%]" title="High P2 (25%)" />
                <div className="bg-blue-500 h-full w-[10%]" title="Medium P3 (10%)" />
              </div>
              <div className="flex items-center justify-between text-xs pt-1">
                <span className="text-rose-700 font-bold">[Critical 65%]</span>
                <span className="text-amber-700 font-bold">[High 25%]</span>
                <span className="text-blue-700 font-bold">[Medium 10%]</span>
              </div>
            </div>

            {/* CORRELATED INCIDENTS */}
            <div className="space-y-2.5 pt-2">
              <div className="text-xs font-semibold text-slate-500 flex items-center justify-between">
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-900">[ASSOCIATED INCIDENTS ({clusterIncidents.length})]</span>
                <span className="text-slate-500 font-mono text-[11px]">Within {selectedHotspot.radiusMeters}m radius</span>
              </div>

              <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
                {clusterIncidents.map(inc => (
                  <div
                    key={inc.id}
                    onClick={() => onOpenIncidentDetail(inc)}
                    className="p-2.5 rounded-lg bg-slate-50 hover:bg-blue-50/30 border border-slate-300 hover:border-blue-600 cursor-pointer flex items-center justify-between transition-all shadow-2xs"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg overflow-hidden border border-slate-300 flex-shrink-0 bg-white">
                        <img src={inc.image} alt={inc.category} className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                          <span className="font-mono">#{inc.id}</span>
                          <span className="text-slate-400">•</span>
                          <span>{inc.category}</span>
                        </div>
                        <div className="text-[11px] text-slate-500 truncate max-w-xs">{inc.address}</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2.5">
                      <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded font-mono ${
                        inc.priority === 'P1' ? 'bg-rose-50 text-rose-700 border border-rose-300' : 'bg-amber-50 text-amber-700 border border-amber-300'
                      }`}>
                        [{inc.priority}]
                      </span>
                      <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
