import React, { useState } from 'react';
import { Incident, Hotspot } from '../../types';
import { VizagLeafletMap } from './VizagLeafletMap';
import { IncidentMapCanvas } from './IncidentMapCanvas';
import { Map, Layers } from 'lucide-react';

interface VizagMapProps {
  incidents: Incident[];
  hotspots: Hotspot[];
  selectedIncident: Incident | null;
  newlyArrivedIncidentId?: string | null;
  onSelectIncident: (incident: Incident) => void;
  onOpenDetailModal: (incident: Incident) => void;
}

export const VizagMap: React.FC<VizagMapProps> = ({
  incidents,
  hotspots,
  selectedIncident,
  newlyArrivedIncidentId,
  onSelectIncident,
  onOpenDetailModal
}) => {
  const [engine, setEngine] = useState<'real_vizag' | 'vector_grid'>('real_vizag');

  return (
    <div className="relative w-full h-full min-h-[540px] flex flex-col font-sans">
      {/* FLOATING ENGINE SWITCHER */}
      <div className="absolute top-4 right-4 z-30 flex items-center gap-1 p-1 rounded-2xl bg-white/95 border border-slate-300 backdrop-blur-xl shadow-md text-xs">
        <button
          onClick={() => setEngine('real_vizag')}
          className={`px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
            engine === 'real_vizag'
              ? 'bg-blue-50 text-blue-800 border border-blue-200/80 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
          title="Full Real Visakhapatnam Map (Roads, Houses, Grounds & Beaches)"
        >
          <Map className="w-3.5 h-3.5 text-blue-600" />
          <span>Visakhapatnam Real Map</span>
        </button>

        <button
          onClick={() => setEngine('vector_grid')}
          className={`px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
            engine === 'vector_grid'
              ? 'bg-blue-50 text-blue-800 border border-blue-200/80 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
          title="Vector Schematic Corridor Grid"
        >
          <Layers className="w-3.5 h-3.5 text-slate-500" />
          <span>Vector Grid</span>
        </button>
      </div>

      {/* MAP VIEWPORT */}
      <div className="w-full h-full flex-1">
        {engine === 'real_vizag' ? (
          <VizagLeafletMap
            incidents={incidents}
            hotspots={hotspots}
            selectedIncident={selectedIncident}
            newlyArrivedIncidentId={newlyArrivedIncidentId}
            onSelectIncident={onSelectIncident}
            onOpenDetailModal={onOpenDetailModal}
          />
        ) : (
          <IncidentMapCanvas
            incidents={incidents}
            hotspots={hotspots}
            selectedIncident={selectedIncident}
            newlyArrivedIncidentId={newlyArrivedIncidentId}
            onSelectIncident={onSelectIncident}
            onOpenDetailModal={onOpenDetailModal}
          />
        )}
      </div>
    </div>
  );
};
