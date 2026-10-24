import React, { useEffect, useRef, useState, useCallback } from 'react';
import { 
  Navigation, 
  Layers, 
  ZoomIn, 
  ZoomOut, 
  Flame, 
  AlertTriangle, 
  CheckCircle2, 
  ChevronRight, 
  Eye, 
  Search, 
  Compass, 
  RotateCcw,
  Sparkles,
  MapPin,
  X
} from 'lucide-react';
import { Incident, Hotspot } from '../../types';
import { googleMapsLoader, GoogleMapsStatus } from '../../services/maps/googleMapsLoader';
import { darkMapStyles } from '../../services/maps/darkMapStyles';
import { GoogleMapSetupState } from './GoogleMapSetupState';
import { HotspotDetailDrawer } from './HotspotDetailDrawer';

interface GoogleMapContainerProps {
  incidents: Incident[];
  hotspots: Hotspot[];
  selectedIncident: Incident | null;
  onSelectIncident: (incident: Incident) => void;
  onOpenDetailModal: (incident: Incident) => void;
}

export const GoogleMapContainer: React.FC<GoogleMapContainerProps> = ({
  incidents,
  hotspots,
  selectedIncident,
  onSelectIncident,
  onOpenDetailModal
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const mapRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<google.maps.Marker[]>([]);
  const circlesRef = useRef<google.maps.Circle[]>([]);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);

  const [mapStatus, setMapStatus] = useState<GoogleMapsStatus>(googleMapsLoader.getStatus().status);
  const [errorMessage, setErrorMessage] = useState<string | undefined>(googleMapsLoader.getStatus().errorMessage);
  const [activeFilter, setActiveFilter] = useState<'ALL' | 'CRITICAL' | 'POTHOLE' | 'WATER'>('ALL');
  const [showHotspots, setShowHotspots] = useState<boolean>(true);
  const [mapType, setMapType] = useState<'roadmap' | 'hybrid'>('roadmap');
  const [selectedHotspot, setSelectedHotspot] = useState<Hotspot | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Default Center: Visakhapatnam Metro Grid
  const defaultCenter = { lat: 17.7265, lng: 83.3072 };

  // Helper: Get marker SVG based on severity and selection
  const getMarkerIcon = (incident: Incident, isSelected: boolean) => {
    let pinColor = '#3b82f6'; // Medium / default blue
    if (incident.severity === 'CRITICAL') pinColor = '#f43f5e'; // Rose
    else if (incident.severity === 'HIGH') pinColor = '#f59e0b'; // Amber
    else if (incident.severity === 'LOW') pinColor = '#10b981'; // Emerald

    const size = isSelected ? 40 : 32;
    const strokeColor = isSelected ? '#00f2fe' : '#ffffff';
    const strokeWidth = isSelected ? 3 : 1.5;

    const svg = `
      <svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size + 8}" viewBox="0 0 36 44">
        <defs>
          <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="2" stdDeviation="3" flood-color="${pinColor}" flood-opacity="0.6"/>
          </filter>
        </defs>
        <path d="M18 0 C8.06 0 0 8.06 0 18 C0 31.5 18 44 18 44 C18 44 36 31.5 36 18 C36 8.06 27.94 0 18 0 Z" 
              fill="${pinColor}" 
              stroke="${strokeColor}" 
              stroke-width="${strokeWidth}" 
              filter="url(#glow)"/>
        <circle cx="18" cy="17" r="7" fill="#090d16" />
        <circle cx="18" cy="17" r="4" fill="${isSelected ? '#38bdf8' : '#ffffff'}" />
      </svg>
    `;

    return {
      url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`,
      scaledSize: new google.maps.Size(size, size + 8),
      anchor: new google.maps.Point(size / 2, size + 8)
    };
  };

  // Initialize Google Map
  const initMap = useCallback(async () => {
    try {
      const google = await googleMapsLoader.load();
      if (!mapContainerRef.current) return;

      const mapOptions: google.maps.MapOptions = {
        center: defaultCenter,
        zoom: 12,
        styles: darkMapStyles,
        disableDefaultUI: true, // We provide sleek custom dark command-center controls
        mapTypeId: mapType,
        backgroundColor: '#090d16',
        gestureHandling: 'greedy'
      };

      const map = new google.maps.Map(mapContainerRef.current, mapOptions);
      mapRef.current = map;

      // Setup Places Autocomplete if available and input exists
      if (searchInputRef.current && google.maps.places) {
        try {
          const autocomplete = new google.maps.places.Autocomplete(searchInputRef.current, {
            bounds: new google.maps.LatLngBounds(
              new google.maps.LatLng(17.60, 83.10),
              new google.maps.LatLng(17.90, 83.45)
            ),
            strictBounds: false
          });

          autocomplete.addListener('place_changed', () => {
            const place = autocomplete.getPlace();
            if (place.geometry?.location) {
              map.panTo(place.geometry.location);
              map.setZoom(15);
            }
          });
          autocompleteRef.current = autocomplete;
        } catch (e) {
          console.warn('Places Autocomplete initialization notice:', e);
        }
      }

      setMapStatus('READY');
      setErrorMessage(undefined);
    } catch (err: any) {
      setMapStatus('ERROR');
      setErrorMessage(err?.message || 'Failed to initialize Google Maps.');
    }
  }, [mapType]);

  // Subscribe to loader changes
  useEffect(() => {
    const unsubscribe = googleMapsLoader.subscribe((result) => {
      setMapStatus(result.status);
      setErrorMessage(result.errorMessage);
    });

    if (googleMapsLoader.hasApiKey()) {
      initMap();
    } else {
      setMapStatus('UNCONFIGURED');
    }

    return () => {
      unsubscribe();
    };
  }, [initMap]);

  // Update Markers when incidents, filter, or selection changes
  useEffect(() => {
    if (mapStatus !== 'READY' || !mapRef.current) return;

    // Clear existing markers
    markersRef.current.forEach(m => m.setMap(null));
    markersRef.current = [];

    const filtered = incidents.filter(inc => {
      if (activeFilter === 'ALL') return true;
      if (activeFilter === 'CRITICAL') return inc.severity === 'CRITICAL';
      if (activeFilter === 'POTHOLE') return inc.category === 'Pothole';
      if (activeFilter === 'WATER') return inc.category === 'Water Leakage';
      return true;
    });

    filtered.forEach(incident => {
      const isSelected = selectedIncident?.id === incident.id;
      const marker = new google.maps.Marker({
        position: { lat: incident.latitude, lng: incident.longitude },
        map: mapRef.current!,
        title: `${incident.id} — ${incident.category} (${incident.severity})`,
        icon: getMarkerIcon(incident, isSelected),
        zIndex: isSelected ? 999 : incident.severity === 'CRITICAL' ? 100 : 10
      });

      marker.addListener('click', () => {
        onSelectIncident(incident);
        setSelectedHotspot(null);
        mapRef.current?.panTo({ lat: incident.latitude, lng: incident.longitude });
      });

      markersRef.current.push(marker);
    });
  }, [incidents, activeFilter, selectedIncident, mapStatus, onSelectIncident]);

  // Update Hotspot Circles
  useEffect(() => {
    if (mapStatus !== 'READY' || !mapRef.current) return;

    // Clear existing circles
    circlesRef.current.forEach(c => c.setMap(null));
    circlesRef.current = [];

    if (!showHotspots) return;

    hotspots.forEach(hotspot => {
      const circle = new google.maps.Circle({
        strokeColor: hotspot.severity === 'CRITICAL' ? '#f43f5e' : '#f59e0b',
        strokeOpacity: 0.75,
        strokeWeight: 2,
        fillColor: hotspot.severity === 'CRITICAL' ? '#f43f5e' : '#f59e0b',
        fillOpacity: 0.14,
        map: mapRef.current!,
        center: { lat: hotspot.latitude, lng: hotspot.longitude },
        radius: hotspot.radiusMeters,
        clickable: true,
        zIndex: 5
      });

      circle.addListener('click', () => {
        setSelectedHotspot(hotspot);
        mapRef.current?.panTo({ lat: hotspot.latitude, lng: hotspot.longitude });
      });

      circlesRef.current.push(circle);
    });
  }, [hotspots, showHotspots, mapStatus]);

  // Recenter to selected incident if changed externally
  useEffect(() => {
    if (selectedIncident && mapRef.current && mapStatus === 'READY') {
      mapRef.current.panTo({ lat: selectedIncident.latitude, lng: selectedIncident.longitude });
    }
  }, [selectedIncident, mapStatus]);

  // Location search submit handler
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim() || !mapRef.current || typeof google === 'undefined') return;

    // Quick match against local incidents and localities
    const matchedLocality = incidents.find(i => 
      i.locality.toLowerCase().includes(searchQuery.toLowerCase()) ||
      i.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
      i.id.toLowerCase() === searchQuery.toLowerCase()
    );

    if (matchedLocality) {
      mapRef.current.panTo({ lat: matchedLocality.latitude, lng: matchedLocality.longitude });
      mapRef.current.setZoom(15);
      onSelectIncident(matchedLocality);
      return;
    }

    // Geocoder fallback
    const geocoder = new google.maps.Geocoder();
    geocoder.geocode({ address: `${searchQuery}, Visakhapatnam, Andhra Pradesh, India` }, (results, status) => {
      if (status === 'OK' && results?.[0]?.geometry?.location && mapRef.current) {
        mapRef.current.panTo(results[0].geometry.location);
        mapRef.current.setZoom(14);
      }
    });
  };

  // Quick preset locality jumper
  const handleQuickLocalityJump = (lat: number, lng: number) => {
    if (mapRef.current) {
      mapRef.current.panTo({ lat, lng });
      mapRef.current.setZoom(15);
    }
  };

  // Switch Map Type
  const toggleMapType = () => {
    const nextType = mapType === 'roadmap' ? 'hybrid' : 'roadmap';
    setMapType(nextType);
    if (mapRef.current) {
      mapRef.current.setMapTypeId(nextType);
      if (nextType === 'roadmap') {
        mapRef.current.setOptions({ styles: darkMapStyles });
      } else {
        mapRef.current.setOptions({ styles: null });
      }
    }
  };

  // If unconfigured or errored, render the clean setup state
  if (mapStatus === 'UNCONFIGURED' || mapStatus === 'ERROR') {
    return (
      <GoogleMapSetupState
        isError={mapStatus === 'ERROR'}
        errorMessage={errorMessage}
        incidents={incidents}
        onRetry={() => {
          setMapStatus('LOADING');
          initMap();
        }}
      />
    );
  }

  return (
    <div className="relative w-full h-full min-h-[520px] rounded-2xl overflow-hidden glass-panel border border-white/10 bg-[#070b13] select-none">
      {/* SEARCH BAR & CONTROLS OVERLAY (TOP) */}
      <div className="absolute top-4 left-4 right-4 z-20 flex flex-wrap items-center justify-between gap-3 pointer-events-none">
        {/* LEFT GROUP: SEARCH & LOCALITY QUICK JUMP */}
        <div className="flex flex-wrap items-center gap-2 pointer-events-auto">
          {/* SEARCH FORM */}
          <form onSubmit={handleSearchSubmit} className="relative w-72 sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search Visakhapatnam address, place or sector..."
              className="w-full bg-dark-900/90 border border-white/15 rounded-xl pl-9 pr-8 py-2 text-xs text-white placeholder-slate-400 font-mono backdrop-blur-xl focus:outline-none focus:border-cyan-500/60 shadow-xl transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </form>

          {/* QUICK LOCALITY CHIPS */}
          <div className="hidden xl:flex items-center gap-1.5 p-1 rounded-xl bg-dark-900/80 border border-white/10 backdrop-blur-md text-[10px] font-mono">
            <button
              onClick={() => handleQuickLocalityJump(17.7424, 83.3356)}
              className="px-2 py-1 rounded-lg text-slate-300 hover:text-cyan-300 hover:bg-white/5 transition-colors"
            >
              MVP Colony
            </button>
            <button
              onClick={() => handleQuickLocalityJump(17.6905, 83.2095)}
              className="px-2 py-1 rounded-lg text-slate-300 hover:text-cyan-300 hover:bg-white/5 transition-colors"
            >
              Gajuwaka
            </button>
            <button
              onClick={() => handleQuickLocalityJump(17.7265, 83.3072)}
              className="px-2 py-1 rounded-lg text-slate-300 hover:text-cyan-300 hover:bg-white/5 transition-colors"
            >
              Dwaraka Nagar
            </button>
            <button
              onClick={() => handleQuickLocalityJump(17.8042, 83.3551)}
              className="px-2 py-1 rounded-lg text-slate-300 hover:text-cyan-300 hover:bg-white/5 transition-colors"
            >
              Madhurawada
            </button>
          </div>
        </div>

        {/* RIGHT GROUP: CATEGORY FILTERS & RADAR TOGGLE */}
        <div className="flex items-center gap-2 pointer-events-auto">
          {/* CATEGORY FILTER TOGGLES */}
          <div className="flex items-center gap-1 p-1 rounded-xl bg-dark-900/90 border border-white/10 backdrop-blur-md text-xs font-mono">
            {(['ALL', 'CRITICAL', 'POTHOLE', 'WATER'] as const).map(f => (
              <button
                key={f}
                onClick={() => setActiveFilter(f)}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all ${
                  activeFilter === f 
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm shadow-cyan-500/20' 
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {f}
              </button>
            ))}
          </div>

          {/* HOTSPOT OVERLAY TOGGLE */}
          <button
            onClick={() => setShowHotspots(!showHotspots)}
            className={`px-2.5 py-1.5 rounded-xl text-xs font-mono flex items-center gap-1.5 transition-all backdrop-blur-md shadow-lg ${
              showHotspots
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                : 'bg-dark-900/90 text-slate-400 border border-white/10'
            }`}
            title="Toggle AI Hotspot Cluster Radii"
          >
            <Flame className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-[10px] font-bold hidden sm:inline">HOTSPOT RADAR</span>
          </button>
        </div>
      </div>

      {/* MAP VIEWPORT DIV */}
      <div 
        ref={mapContainerRef} 
        className="w-full h-full min-h-[520px] bg-[#090d16]"
      />

      {/* CUSTOM FLOATING MAP CONTROLS (RIGHT SIDE) */}
      <div className="absolute top-20 right-4 z-20 flex flex-col gap-1.5 pointer-events-auto">
        {/* MAP TYPE TOGGLE */}
        <button
          onClick={toggleMapType}
          className="p-2.5 rounded-xl bg-dark-900/90 hover:bg-dark-850 text-slate-300 hover:text-cyan-300 border border-white/10 backdrop-blur-md shadow-xl transition-all"
          title={`Switch to ${mapType === 'roadmap' ? 'Satellite Hybrid' : 'Dark Vector'} Map`}
        >
          <Layers className="w-4 h-4" />
        </button>

        {/* RE-CENTER TO VISAKHAPATNAM */}
        <button
          onClick={() => {
            if (mapRef.current) {
              mapRef.current.panTo(defaultCenter);
              mapRef.current.setZoom(12);
            }
          }}
          className="p-2.5 rounded-xl bg-dark-900/90 hover:bg-dark-850 text-slate-300 hover:text-cyan-300 border border-white/10 backdrop-blur-md shadow-xl transition-all"
          title="Recenter to Visakhapatnam"
        >
          <RotateCcw className="w-4 h-4" />
        </button>

        {/* ZOOM IN */}
        <button
          onClick={() => {
            if (mapRef.current) {
              const currentZoom = mapRef.current.getZoom() || 12;
              mapRef.current.setZoom(currentZoom + 1);
            }
          }}
          className="p-2.5 rounded-xl bg-dark-900/90 hover:bg-dark-850 text-slate-300 hover:text-cyan-300 border border-white/10 backdrop-blur-md shadow-xl transition-all"
          title="Zoom In"
        >
          <ZoomIn className="w-4 h-4" />
        </button>

        {/* ZOOM OUT */}
        <button
          onClick={() => {
            if (mapRef.current) {
              const currentZoom = mapRef.current.getZoom() || 12;
              mapRef.current.setZoom(currentZoom - 1);
            }
          }}
          className="p-2.5 rounded-xl bg-dark-900/90 hover:bg-dark-850 text-slate-300 hover:text-cyan-300 border border-white/10 backdrop-blur-md shadow-xl transition-all"
          title="Zoom Out"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
      </div>

      {/* CLOUDPULSE BASE LAYER BADGE (TOP LEFT) */}
      <div className="absolute bottom-4 left-4 z-20 flex items-center gap-2 pointer-events-none">
        <div className="px-3 py-1 rounded-xl bg-dark-950/90 border border-white/10 backdrop-blur-md flex items-center gap-2 text-[10px] font-mono text-slate-300 shadow-xl">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
          <span className="font-bold text-white">REAL GOOGLE MAPS JAVASCRIPT API</span>
          <span className="text-slate-500">|</span>
          <span className="text-cyan-300">CLOUDPULSE INTELLIGENCE LAYER</span>
        </div>
      </div>

      {/* FLOATING SELECTED INCIDENT PANEL (BOTTOM LEFT) */}
      {selectedIncident && (
        <div className="absolute bottom-12 left-4 z-30 max-w-sm w-full p-4 rounded-2xl bg-dark-900/95 border border-cyan-500/40 backdrop-blur-xl shadow-2xl space-y-3 animate-fadeIn">
          <div className="flex items-start justify-between gap-2">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-white">{selectedIncident.id}</span>
                <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${
                  selectedIncident.severity === 'CRITICAL' ? 'bg-red-100 text-red-900 border border-red-300' : 
                  selectedIncident.severity === 'HIGH' ? 'bg-amber-100 text-amber-900 border border-amber-300' :
                  selectedIncident.severity === 'LOW' ? 'bg-emerald-100 text-emerald-900 border border-emerald-300' :
                  'bg-blue-100 text-blue-900 border border-blue-300'
                }`}>
                  {selectedIncident.priority} • {selectedIncident.severity}
                </span>
              </div>
              <div className="text-sm font-bold text-white mt-0.5">{selectedIncident.category}</div>
              <div className="text-[11px] text-slate-400 font-mono">{selectedIncident.locality}</div>
            </div>

            <div className="w-14 h-14 rounded-lg overflow-hidden border border-white/10 flex-shrink-0 bg-dark-950">
              <img src={selectedIncident.image} alt="Defect thumbnail" className="w-full h-full object-cover" />
            </div>
          </div>

          <p className="text-[11px] text-slate-300 line-clamp-2 leading-snug">
            {selectedIncident.description}
          </p>

          <div className="grid grid-cols-2 gap-2 p-2 rounded-lg bg-dark-950/70 border border-white/5 text-[10px] font-mono">
            <div>
              <span className="text-slate-400 block">Nearby Reports:</span>
              <span className="text-amber-400 font-bold">{selectedIncident.nearbyCount} in corridor</span>
            </div>
            <div>
              <span className="text-slate-400 block">Status:</span>
              <span className="text-emerald-400 font-bold">{selectedIncident.status}</span>
            </div>
          </div>

          <div className="pt-1 flex items-center justify-between border-t border-white/5 text-[11px] font-mono">
            <span className="text-cyan-400">AI Conf: {(selectedIncident.confidence * 100).toFixed(1)}%</span>
            <button
              onClick={() => onOpenDetailModal(selectedIncident)}
              className="text-cyan-300 hover:text-white font-bold flex items-center gap-1 hover:underline cursor-pointer"
            >
              <span>Inspect Agent Trace</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* HOTSPOT DETAIL DRAWER (IF CLICKED) */}
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

      {/* MAP LEGEND (BOTTOM RIGHT) */}
      <div className="absolute bottom-4 right-4 z-20 p-2.5 rounded-xl bg-dark-900/90 border border-white/10 backdrop-blur-md text-[10px] font-mono space-y-1 text-slate-300 hidden sm:block shadow-xl">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse" />
          <span>Critical P1 (Hazard)</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
          <span>High P2 (Intervention)</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
          <span>Medium P3 (Logistics)</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
          <span>Low P4 (Routine)</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full border border-amber-400 bg-amber-500/20" />
          <span>AI Hotspot Radar Cluster</span>
        </div>
      </div>
    </div>
  );
};
