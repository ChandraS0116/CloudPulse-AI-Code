import React, { useState } from 'react';
import { 
  Eye, 
  Camera, 
  AlertTriangle, 
  ShieldCheck, 
  MapPin, 
  Maximize2, 
  Crosshair, 
  Layers, 
  Sparkles, 
  Wrench, 
  ArrowUpRight,
  Flame,
  CheckCircle2
} from 'lucide-react';
import { Incident } from '../../types';
import { sampleImages } from '../../services/mock/seedData';
import { repairVerificationImages } from '../../services/mock/enterpriseData';

interface DashboardVisionViewProps {
  selectedIncident: Incident | null;
  onOpenDetailModal: (incident: Incident) => void;
}

type VisionFilterMode = 'AI_BBOX' | 'OPTICAL_RGB' | 'THERMAL_HEATMAP' | 'EDGE_CONTOUR';

export const DashboardVisionView: React.FC<DashboardVisionViewProps> = ({
  selectedIncident,
  onOpenDetailModal
}) => {
  const [filterMode, setFilterMode] = useState<VisionFilterMode>('AI_BBOX');
  const [activePresetImage, setActivePresetImage] = useState<string | null>(null);

  const displayIncident = selectedIncident || {
    id: 'CP-1042',
    category: 'Pothole',
    severity: 'CRITICAL',
    priority: 'P1',
    locality: 'MVP Colony (Sector 4)',
    address: 'Sector 4, Main Double Road, near AS Raja Grounds',
    confidence: 0.984,
    image: sampleImages.potholeMVP,
    status: 'ASSIGNED',
    assignedTeam: 'GVMC Rapid Road Unit 2',
    detectedVisualFeatures: ['Deep Asphalt Void', 'Surface Aggregate Loss', 'Sub-base Moisture Risk']
  } as Incident;

  const currentImage = activePresetImage || displayIncident.image || sampleImages.potholeMVP;

  // Preset inspection galleries from real Vizag incidents
  const visualGallery = [
    { id: '1', title: 'Pothole (MVP Colony)', img: sampleImages.potholeMVP, cat: 'Pothole', conf: '98.4%' },
    { id: '2', title: 'Water Main Burst (Gajuwaka)', img: sampleImages.waterLeakGajuwaka, cat: 'Water Leakage', conf: '97.1%' },
    { id: '3', title: 'Garbage Dump (Dwaraka Nagar)', img: sampleImages.garbageDwaraka, cat: 'Garbage', conf: '99.2%' },
    { id: '4', title: 'Damaged Road (Seethammadhara)', img: sampleImages.damagedRoadSeethammadhara, cat: 'Damaged Road', conf: '94.6%' },
    { id: '5', title: 'Drone 4K Aerial (Beach Road)', img: repairVerificationImages.droneAerialInspection, cat: 'Drone Aerial', conf: '96.2%' }
  ];

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-900 text-white rounded-xl overflow-hidden relative select-none">
      
      {/* 1. VISION TOOLBAR */}
      <div className="p-3 bg-slate-950/90 backdrop-blur-md border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs z-20">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="font-extrabold uppercase tracking-wider text-slate-300">[LIVE VISION DEFECT LAB]</span>
          <span className="text-slate-600">•</span>
          <span className="font-mono text-blue-400 font-bold">#{displayIncident.id}</span>
          <span className="text-slate-400 font-medium">({displayIncident.category})</span>
        </div>

        {/* FILTER MODES */}
        <div className="flex items-center gap-1 bg-slate-900 p-0.5 rounded-xl border border-slate-800">
          <button
            onClick={() => setFilterMode('AI_BBOX')}
            className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition-all cursor-pointer ${
              filterMode === 'AI_BBOX' ? 'bg-blue-600 text-white shadow-2xs' : 'text-slate-400 hover:text-white'
            }`}
          >
            AI Bounding Box
          </button>
          <button
            onClick={() => setFilterMode('OPTICAL_RGB')}
            className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition-all cursor-pointer ${
              filterMode === 'OPTICAL_RGB' ? 'bg-blue-600 text-white shadow-2xs' : 'text-slate-400 hover:text-white'
            }`}
          >
            Optical RGB
          </button>
          <button
            onClick={() => setFilterMode('THERMAL_HEATMAP')}
            className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition-all cursor-pointer ${
              filterMode === 'THERMAL_HEATMAP' ? 'bg-orange-600 text-white shadow-2xs' : 'text-slate-400 hover:text-white'
            }`}
          >
            Thermal IR
          </button>
          <button
            onClick={() => setFilterMode('EDGE_CONTOUR')}
            className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition-all cursor-pointer ${
              filterMode === 'EDGE_CONTOUR' ? 'bg-emerald-600 text-white shadow-2xs' : 'text-slate-400 hover:text-white'
            }`}
          >
            Edge Contour
          </button>
        </div>
      </div>

      {/* 2. MAIN OPTICAL CANVAS */}
      <div className="relative flex-1 flex items-center justify-center p-4 overflow-hidden bg-slate-950">
        
        {/* OPTICAL IMAGE WITH FILTER */}
        <div className={`relative w-full h-full max-h-[380px] rounded-xl overflow-hidden border border-slate-800 flex items-center justify-center bg-black ${
          filterMode === 'THERMAL_HEATMAP' ? 'filter hue-rotate-90 saturate-200 contrast-125' :
          filterMode === 'EDGE_CONTOUR' ? 'filter invert contrast-200 grayscale' : ''
        }`}>
          <img 
            src={currentImage} 
            alt={displayIncident.category} 
            className="w-full h-full object-cover"
          />

          {/* AI BOUNDING BOX OVERLAY */}
          {filterMode === 'AI_BBOX' && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none p-6">
              <div className="w-64 h-48 border-2 border-red-500 rounded-lg relative bg-red-950/20 backdrop-blur-[1px] animate-pulse">
                {/* CORNER ACCENTS */}
                <div className="absolute -top-1 -left-1 w-3 h-3 border-t-2 border-l-2 border-red-400" />
                <div className="absolute -top-1 -right-1 w-3 h-3 border-t-2 border-r-2 border-red-400" />
                <div className="absolute -bottom-1 -left-1 w-3 h-3 border-b-2 border-l-2 border-red-400" />
                <div className="absolute -bottom-1 -right-1 w-3 h-3 border-b-2 border-r-2 border-red-400" />

                {/* LABEL */}
                <div className="absolute -top-7 left-0 bg-red-600 text-white text-[10px] font-bold px-2 py-0.5 rounded flex items-center gap-1 font-mono shadow-md">
                  <AlertTriangle className="w-3 h-3" />
                  <span>{displayIncident.category.toUpperCase()} // {(displayIncident.confidence * 100).toFixed(1)}%</span>
                </div>

                {/* DIMENSIONS */}
                <div className="absolute bottom-1 right-1 bg-black/80 px-2 py-0.5 rounded text-[9px] font-mono text-emerald-400 font-bold">
                  AREA: 1.84m² | DEPTH: 6.2cm
                </div>
              </div>
            </div>
          )}

          {/* CROSSHAIR RETICLE */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-40">
            <Crosshair className="w-32 h-32 text-blue-400/50" />
          </div>
        </div>

        {/* FLOATING TELEMETRY CARD */}
        <div className="absolute bottom-6 left-6 p-3 rounded-xl bg-slate-950/85 backdrop-blur-md border border-slate-700/80 text-xs font-mono space-y-1 z-20 max-w-xs shadow-xl">
          <div className="flex items-center gap-2 text-blue-400 font-bold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>NEURAL VISION METRICS</span>
          </div>
          <div className="text-slate-300 text-[11px]">
            Locality: <span className="font-bold text-white">{displayIncident.locality}</span>
          </div>
          <div className="text-slate-300 text-[11px]">
            Confidence: <span className="font-bold text-emerald-400">{(displayIncident.confidence * 100).toFixed(1)}% F1</span>
          </div>
          <div className="text-slate-300 text-[11px]">
            Severity: <span className="font-bold text-rose-400">[{displayIncident.priority} • {displayIncident.severity}]</span>
          </div>
          <div className="pt-1 flex items-center gap-2">
            <button
              onClick={() => onOpenDetailModal(displayIncident)}
              className="px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-bold flex items-center gap-1 cursor-pointer transition-colors"
            >
              <span>Inspect AI Trace</span>
              <ArrowUpRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>

      {/* 3. MULTI-CAMERA INCIDENT PREVIEW THUMBNAILS (BOTTOM GALLERY) */}
      <div className="p-3 bg-slate-950 border-t border-slate-800 flex items-center gap-2.5 overflow-x-auto z-20">
        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 flex-shrink-0">
          Camera Feeds:
        </span>
        {visualGallery.map(item => (
          <button
            key={item.id}
            onClick={() => setActivePresetImage(item.img)}
            className={`flex items-center gap-2 p-1.5 rounded-xl border text-xs transition-all cursor-pointer flex-shrink-0 ${
              currentImage === item.img
                ? 'bg-blue-900/60 border-blue-400 ring-1 ring-blue-400'
                : 'bg-slate-900 border-slate-800 hover:border-slate-700 text-slate-300'
            }`}
          >
            <img src={item.img} alt={item.title} className="w-8 h-8 rounded-lg object-cover" />
            <div className="text-left">
              <div className="font-bold text-[11px] truncate max-w-[130px]">{item.title}</div>
              <div className="text-[9px] text-emerald-400 font-mono">{item.conf} Match</div>
            </div>
          </button>
        ))}
      </div>

    </div>
  );
};
