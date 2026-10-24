import React, { useState } from 'react';
import { Incident, Hotspot } from '../../types';
import { 
  Navigation, 
  ZoomIn, 
  ZoomOut, 
  Flame, 
  AlertTriangle, 
  CheckCircle2, 
  ChevronRight, 
  MapPin,
  Compass
} from 'lucide-react';
import { HotspotDetailDrawer } from './HotspotDetailDrawer';

interface IncidentMapCanvasProps {
  incidents: Incident[];
  hotspots: Hotspot[];
  selectedIncident: Incident | null;
  newlyArrivedIncidentId?: string | null;
  onSelectIncident: (incident: Incident) => void;
  onOpenDetailModal: (incident: Incident) => void;
}

export const IncidentMapCanvas: React.FC<IncidentMapCanvasProps> = ({
  incidents,
  hotspots,
  selectedIncident,
  newlyArrivedIncidentId,
  onSelectIncident,
  onOpenDetailModal
}) => {
  const [zoomLevel, setZoomLevel] = useState(1);
  const [activeFilter, setActiveFilter] = useState<string>('ALL');
  const [showHotspotOverlay, setShowHotspotOverlay] = useState(true);
  const [selectedHotspot, setSelectedHotspot] = useState<Hotspot | null>(null);

  // Visakhapatnam operational corridor projection
  const minLat = 17.65;
  const maxLat = 17.85;
  const minLng = 83.18;
  const maxLng = 83.42;

  const project = (lat: number, lng: number) => {
    const x = ((lng - minLng) / (maxLng - minLng)) * 100;
    const y = 100 - ((lat - minLat) / (maxLat - minLat)) * 100;
    return { x: Math.max(6, Math.min(94, x)), y: Math.max(6, Math.min(94, y)) };
  };

  const filteredIncidents = incidents.filter(inc => {
    if (activeFilter === 'ALL') return true;
    if (activeFilter === 'CRITICAL') return inc.severity === 'CRITICAL';
    if (activeFilter === 'POTHOLE') return inc.category === 'Pothole';
    if (activeFilter === 'WATER') return inc.category === 'Water Leakage';
    return true;
  });

  return (
    <div className="relative w-full h-full min-h-[520px] rounded-2xl overflow-hidden glass-panel bg-[#0b0e15] select-none font-sans">
      {/* TOP CONTROLS & FILTER BAR */}
      <div className="absolute top-3.5 left-3.5 z-20 flex flex-wrap items-center gap-2">
        <div className="px-3 py-1.5 rounded-xl bg-dark-900/90 border border-white/[0.08] backdrop-blur-md flex items-center gap-2 text-xs text-slate-300 shadow-md">
          <span className="w-2 h-2 rounded-full bg-blue-500" />
          <span className="font-semibold text-white">Visakhapatnam Grid</span>
          <span className="text-[11px] text-slate-400 font-mono">17.72° N, 83.30° E</span>
        </div>

        {/* CATEGORY FILTER PILLS */}
        <div className="flex items-center gap-1 p-1 rounded-xl bg-dark-900/90 border border-white/[0.08] backdrop-blur-md text-xs shadow-md">
          {(['ALL', 'CRITICAL', 'POTHOLE', 'WATER'] as const).map(f => (
            <button
              key={f}
              onClick={() => setActiveFilter(f)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all cursor-pointer ${
                activeFilter === f 
                  ? 'bg-white/[0.12] text-white font-semibold' 
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {f === 'ALL' ? 'All' : f === 'CRITICAL' ? 'Critical (P1)' : f === 'POTHOLE' ? 'Potholes' : 'Water'}
            </button>
          ))}
        </div>

        {/* HOTSPOT TOGGLE */}
        <button
          onClick={() => setShowHotspotOverlay(!showHotspotOverlay)}
          className={`px-2.5 py-1.5 rounded-xl text-xs flex items-center gap-1.5 transition-all backdrop-blur-md shadow-md cursor-pointer ${
            showHotspotOverlay
              ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
              : 'bg-dark-900/90 text-slate-400 border border-white/[0.08]'
          }`}
        >
          <Flame className="w-3.5 h-3.5 text-amber-400" />
          <span className="text-[11px] font-medium">Hotspots</span>
        </button>
      </div>

      {/* ZOOM CONTROLS */}
      <div className="absolute top-16 right-3.5 z-20 flex flex-col gap-1">
        <button
          onClick={() => setZoomLevel(prev => Math.min(prev + 0.2, 1.8))}
          className="p-2 rounded-lg bg-dark-900/90 hover:bg-dark-850 text-slate-300 hover:text-white border border-white/[0.08] backdrop-blur-md shadow-md transition-all cursor-pointer"
          title="Zoom In"
        >
          <ZoomIn className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={() => setZoomLevel(prev => Math.max(prev - 0.2, 0.8))}
          className="p-2 rounded-lg bg-dark-900/90 hover:bg-dark-850 text-slate-300 hover:text-white border border-white/[0.08] backdrop-blur-md shadow-md transition-all cursor-pointer"
          title="Zoom Out"
        >
          <ZoomOut className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* MAP CANVAS VIEWPORT */}
      <div 
        className="w-full h-full relative transition-transform duration-300 ease-out"
        style={{ transform: `scale(${zoomLevel})`, transformOrigin: 'center center' }}
      >
        {/* SVG BACKGROUND CARTOGRAPHY & VISAKHAPATNAM ARTERIES */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="radarGrid" width="48" height="48" patternUnits="userSpaceOnUse">
              <path d="M 48 0 L 0 0 0 48" fill="none" stroke="rgba(255, 255, 255, 0.025)" strokeWidth="1" />
            </pattern>
            <linearGradient id="bayGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#0b1329" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#080e1e" stopOpacity="0.9" />
            </linearGradient>
          </defs>

          {/* Grid background */}
          <rect width="100%" height="100%" fill="url(#radarGrid)" />

          {/* Bay of Bengal Sea Area */}
          <path 
            d="M 60,0 Q 75,35 68,60 T 52,100 L 100,100 L 100,0 Z" 
            fill="url(#bayGradient)" 
          />
          <path 
            d="M 60,0 Q 75,35 68,60 T 52,100" 
            fill="none" 
            stroke="#1e3a8a" 
            strokeWidth="1.5" 
            strokeDasharray="4,4" 
            opacity="0.5" 
          />
          <text x="78%" y="85%" fill="#3b82f6" fontSize="11" fontFamily="sans-serif" fontWeight="500" opacity="0.3">
            Bay of Bengal
          </text>

          {/* NH-16 Major Arterial Highway */}
          <path 
            d="M 12,90 Q 32,65 52,38 T 78,5" 
            fill="none" 
            stroke="#334155" 
            strokeWidth="3.5" 
            opacity="0.6" 
          />
          <text x="24%" y="70%" fill="#64748b" fontSize="9" fontFamily="sans-serif" transform="rotate(-40 24 70)" opacity="0.8">
            NH-16 Highway
          </text>

          {/* Beach Road Promenade */}
          <path 
            d="M 48,72 Q 62,48 64,28 T 62,8" 
            fill="none" 
            stroke="#2563eb" 
            strokeWidth="2.5" 
            opacity="0.5" 
          />
          <text x="64%" y="42%" fill="#60a5fa" fontSize="9" fontFamily="sans-serif" transform="rotate(-65 64 42)" opacity="0.6">
            Beach Road
          </text>

          {/* Arterial Connecting Roads */}
          <path d="M 42,60 L 58,54" fill="none" stroke="#1e293b" strokeWidth="2" opacity="0.6" />
          <path d="M 50,45 L 62,40" fill="none" stroke="#1e293b" strokeWidth="2" opacity="0.6" />
          <path d="M 36,75 L 48,72" fill="none" stroke="#1e293b" strokeWidth="2" opacity="0.6" />

          {/* NEIGHBORHOOD LABELS (Clean, elegant sans typography) */}
          <text x="64%" y="36%" fill="#94a3b8" fontSize="11" fontFamily="sans-serif" fontWeight="600">MVP Colony</text>
          <text x="14%" y="82%" fill="#94a3b8" fontSize="11" fontFamily="sans-serif" fontWeight="600">Gajuwaka</text>
          <text x="44%" y="54%" fill="#94a3b8" fontSize="11" fontFamily="sans-serif" fontWeight="600">Dwaraka Nagar</text>
          <text x="68%" y="15%" fill="#94a3b8" fontSize="11" fontFamily="sans-serif" fontWeight="600">Madhurawada</text>
          <text x="48%" y="45%" fill="#64748b" fontSize="10" fontFamily="sans-serif">Seethammadhara</text>
          <text x="70%" y="26%" fill="#60a5fa" fontSize="10" fontFamily="sans-serif">Rushikonda</text>
          <text x="50%" y="67%" fill="#60a5fa" fontSize="10" fontFamily="sans-serif">RK Beach</text>
          <text x="40%" y="62%" fill="#64748b" fontSize="10" fontFamily="sans-serif">Siripuram</text>
        </svg>

        {/* HOTSPOT RADAR CLUSTERS (TRANSLUCENT RINGS) */}
        {showHotspotOverlay && hotspots.map(hotspot => {
          const pt = project(hotspot.latitude, hotspot.longitude);
          return (
            <div
              key={hotspot.id}
              onClick={() => setSelectedHotspot(hotspot)}
              className="absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer pointer-events-auto group z-20"
              style={{ left: `${pt.x}%`, top: `${pt.y}%` }}
            >
              <div className="relative flex items-center justify-center">
                <div className="w-24 h-24 rounded-full border border-amber-500/25 bg-amber-500/5 group-hover:scale-105 transition-transform" />
                <div className="absolute w-12 h-12 rounded-full border border-amber-500/30 bg-amber-500/10" />
                <div className="absolute text-[10px] font-medium text-amber-300 bg-dark-900/90 px-2 py-0.5 rounded-full border border-amber-500/30 whitespace-nowrap shadow-md flex items-center gap-1">
                  <Flame className="w-3 h-3 text-amber-400" />
                  <span>{hotspot.name.split(' ')[0]} ({hotspot.incidentCount})</span>
                </div>
              </div>
            </div>
          );
        })}

        {/* INCIDENT PINS */}
        {filteredIncidents.map(incident => {
          const pt = project(incident.latitude, incident.longitude);
          const isSelected = selectedIncident?.id === incident.id;
          const isNewlyArrived = incident.id === newlyArrivedIncidentId;
          const isCritical = incident.severity === 'CRITICAL';
          const isHigh = incident.severity === 'HIGH';

          return (
            <div
              key={incident.id}
              onClick={() => onSelectIncident(incident)}
              className="absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer z-30 transition-transform hover:scale-110"
              style={{ left: `${pt.x}%`, top: `${pt.y}%` }}
            >
              <div className="relative group">
                {/* Gentle pulse ring for new arrival */}
                {isNewlyArrived && (
                  <span className="absolute -inset-2 rounded-full bg-blue-500/30 animate-ping pointer-events-none" />
                )}

                {/* Main pin body */}
                <div className={`w-7 h-7 rounded-full flex items-center justify-center shadow-lg transition-all border ${
                  isSelected
                    ? 'bg-blue-600 text-white border-white scale-110 shadow-blue-500/40 ring-2 ring-blue-400'
                    : isCritical
                    ? 'bg-rose-600 text-white border-rose-400/80 shadow-rose-900/40'
                    : isHigh
                    ? 'bg-amber-600 text-white border-amber-400/80 shadow-amber-900/40'
                    : 'bg-slate-700 text-white border-slate-500'
                }`}>
                  <MapPin className="w-3.5 h-3.5" />
                </div>

                {/* Duplicate Badge indicator on pin */}
                {incident.duplicateCount > 0 && (
                  <span className="absolute -top-1 -right-1 px-1 py-0.2 rounded-full bg-blue-500 text-white font-sans text-[9px] font-bold shadow-sm">
                    +{incident.duplicateCount}
                  </span>
                )}

                {/* Hover Tooltip */}
                <div className="absolute left-1/2 -translate-x-1/2 bottom-8 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none bg-dark-900/95 border border-white/[0.1] px-2.5 py-1.5 rounded-lg text-xs text-white whitespace-nowrap shadow-xl z-40 space-y-0.5">
                  <div className="font-semibold text-white flex items-center gap-1.5">
                    <span>{incident.category}</span>
                    <span className="text-slate-400 font-normal">#{incident.id}</span>
                  </div>
                  <div className="text-[11px] text-slate-300">{incident.locality} • {incident.priority}</div>
                  {incident.duplicateCount > 0 && (
                    <div className="text-[10px] text-blue-300 font-medium">
                      {incident.duplicateCount} duplicate reports merged
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* FLOATING INCIDENT PREVIEW CARD (BOTTOM LEFT) */}
      {selectedIncident && (
        <div className="absolute bottom-4 left-4 z-40 max-w-sm w-full p-4 rounded-xl bg-dark-900/95 border border-white/[0.1] backdrop-blur-xl shadow-xl space-y-3 animate-fadeIn">
          <div className="flex items-start justify-between gap-2">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-white">{selectedIncident.category}</span>
                <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                  selectedIncident.severity === 'CRITICAL' ? 'bg-red-100 text-red-900 border border-red-300' : 
                  selectedIncident.severity === 'HIGH' ? 'bg-amber-100 text-amber-900 border border-amber-300' :
                  'bg-blue-100 text-blue-900 border border-blue-300'
                }`}>
                  {selectedIncident.priority} • {selectedIncident.severity}
                </span>
                {selectedIncident.duplicateCount > 0 && (
                  <span className="text-[10px] bg-white/[0.08] text-slate-300 px-1.5 py-0.2 rounded font-medium">
                    +{selectedIncident.duplicateCount} merged
                  </span>
                )}
              </div>
              <div className="text-xs text-slate-400 mt-0.5">{selectedIncident.locality} ({selectedIncident.ward || 'GVMC'})</div>
            </div>

            <div className="w-12 h-12 rounded-lg overflow-hidden border border-white/[0.08] flex-shrink-0 bg-dark-950">
              <img src={selectedIncident.image} alt="Thumbnail" className="w-full h-full object-cover" />
            </div>
          </div>

          <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">
            {selectedIncident.description}
          </p>

          <div className="grid grid-cols-2 gap-2 p-2 rounded-lg bg-dark-950/60 border border-white/[0.04] text-xs">
            <div>
              <span className="text-slate-400 text-[11px] block">Nearby:</span>
              <span className="text-slate-200 font-medium">{selectedIncident.nearbyCount} in corridor</span>
            </div>
            <div>
              <span className="text-slate-400 text-[11px] block">Status:</span>
              <span className="text-emerald-400 font-medium">{selectedIncident.status}</span>
            </div>
          </div>

          <div className="pt-1 flex items-center justify-between border-t border-white/[0.05] text-xs">
            <span className="text-slate-400 text-[11px]">{(selectedIncident.confidence * 100).toFixed(0)}% confidence</span>
            <button
              onClick={() => onOpenDetailModal(selectedIncident)}
              className="text-blue-400 hover:text-white font-medium flex items-center gap-1 cursor-pointer"
            >
              <span>Inspect Workflow</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* HOTSPOT DETAIL DRAWER */}
      {selectedHotspot && (
        <HotspotDetailDrawer
          hotspot={selectedHotspot}
          incidents={incidents}
          onClose={() => setSelectedHotspot(null)}
          onSelectIncident={(inc) => {
            onSelectIncident(inc);
            setSelectedHotspot(null);
          }}
          onOpenDetailModal={onOpenDetailModal}
        />
      )}

      {/* REFINED MAP LEGEND (BOTTOM RIGHT) */}
      <div className="absolute bottom-4 right-4 z-20 p-2.5 rounded-xl bg-dark-900/90 border border-white/[0.08] backdrop-blur-md text-xs space-y-1 text-slate-300 hidden sm:block shadow-md">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-rose-500" />
          <span className="text-[11px]">Critical (P1)</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-amber-500" />
          <span className="text-[11px]">High (P2)</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-slate-400" />
          <span className="text-[11px]">Medium / Low</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full border border-amber-400 bg-amber-500/20" />
          <span className="text-[11px]">Cluster Zone</span>
        </div>
      </div>
    </div>
  );
};
