import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { Incident, Hotspot } from '../../types';
import { 
  Layers, 
  Compass, 
  MapPin, 
  Search, 
  Crosshair, 
  Sparkles, 
  Sun,
  Satellite,
  Plus,
  Minus,
  Navigation,
  ExternalLink,
  RotateCcw,
  RotateCw,
  X,
  Eye,
  ShieldCheck,
  Maximize2,
  Minimize2
} from 'lucide-react';

interface VizagLeafletMapProps {
  incidents: Incident[];
  hotspots: Hotspot[];
  selectedIncident: Incident | null;
  newlyArrivedIncidentId?: string | null;
  onSelectIncident: (incident: Incident) => void;
  onOpenDetailModal: (incident: Incident) => void;
}

type MapLayerType = 'streets' | 'satellite' | 'voyager';

// Famous Visakhapatnam Key Locations (Beaches, Grounds, Roads, Houses, Landmarks)
const VIZAG_LANDMARKS = [
  { name: 'RK Beach Promenade', type: 'Beach', tag: 'BEACH', coords: [17.7142, 83.3235] as [number, number], zoom: 16 },
  { name: 'Rushikonda Beach', type: 'Beach', tag: 'BEACH', coords: [17.7816, 83.3853] as [number, number], zoom: 16 },
  { name: 'MVP Colony (Sector 4)', type: 'Residential', tag: 'RESIDENTIAL', coords: [17.7424, 83.3356] as [number, number], zoom: 16 },
  { name: 'ACA-VDCA Cricket Stadium', type: 'Grounds', tag: 'SPORTS', coords: [17.8042, 83.3551] as [number, number], zoom: 16 },
  { name: 'AU Campus & Grounds', type: 'Grounds', tag: 'CAMPUS', coords: [17.7289, 83.3218] as [number, number], zoom: 16 },
  { name: 'Dwaraka Nagar (RTC Hub)', type: 'Commercial', tag: 'TRANSIT', coords: [17.7265, 83.3072] as [number, number], zoom: 16 },
  { name: 'Gajuwaka Industrial Corridor', type: 'Industrial', tag: 'INDUSTRIAL', coords: [17.6905, 83.2095] as [number, number], zoom: 15 },
  { name: 'Kailasagiri Hill Viewpoint', type: 'Landmark', tag: 'HILL', coords: [17.7485, 83.3423] as [number, number], zoom: 16 },
  { name: 'Port & Dolphin\'s Nose', type: 'Harbor', tag: 'HARBOR', coords: [17.6833, 83.2833] as [number, number], zoom: 15 }
];

// Street View Panorama Locations for Visakhapatnam
interface StreetViewData {
  name: string;
  road: string;
  lat: number;
  lng: number;
  imageUrl: string;
  defectLabel: string;
  riskTier: string;
  sla: string;
  ward: string;
}

const VIZAG_STREET_VIEWS: Record<string, StreetViewData> = {
  'rk-beach': {
    name: 'RK Beach Promenade',
    road: 'Beach Road Promenade, Pandurangapuram',
    lat: 17.7142,
    lng: 83.3235,
    imageUrl: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=1600&q=85',
    defectLabel: 'P1 Critical Crater (87cm x 9.2cm)',
    riskTier: 'P1 Critical Kinetic Hazard',
    sla: '4.0 Hours SLA',
    ward: 'Ward 18 (Beach Zone)'
  },
  'mvp-colony': {
    name: 'MVP Colony Sector 4',
    road: 'Main Double Road near AS Raja Grounds',
    lat: 17.7424,
    lng: 83.3356,
    imageUrl: 'https://images.unsplash.com/photo-1590674899484-d5640e854abe?auto=format&fit=crop&w=1600&q=85',
    defectLabel: 'P1 Subgrade Cavity & Pothole',
    riskTier: 'P1 Traffic Diversion Risk',
    sla: '6.0 Hours SLA',
    ward: 'Ward 12 (Zone 2)'
  },
  'gajuwaka': {
    name: 'Gajuwaka Industrial Belt',
    road: 'Kanithi Road, Industrial Transit Corridor',
    lat: 17.6905,
    lng: 83.2095,
    imageUrl: 'https://images.unsplash.com/photo-1584824486509-112e4181ff6b?auto=format&fit=crop&w=1600&q=85',
    defectLabel: 'P2 High Water Main Rupture (180 PSI)',
    riskTier: 'P2 Infrastructure Disruption',
    sla: '8.0 Hours SLA',
    ward: 'Ward 64 (Industrial)'
  },
  'dwaraka-nagar': {
    name: 'Dwaraka Nagar Hub',
    road: 'RTC Complex Corridor, Diamond Park Road',
    lat: 17.7265,
    lng: 83.3072,
    imageUrl: 'https://images.unsplash.com/photo-1605600659908-0ef719419d41?auto=format&fit=crop&w=1600&q=85',
    defectLabel: 'P3 Commercial Waste Cluster Overflow',
    riskTier: 'P3 Pedestrian Path Obstruction',
    sla: '16.0 Hours SLA',
    ward: 'Ward 26'
  },
  'rushikonda': {
    name: 'Rushikonda Beach Drive',
    road: 'Bheemili Coastal Highway Avenue',
    lat: 17.7816,
    lng: 83.3853,
    imageUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1600&q=85',
    defectLabel: 'P2 Coastal Road Sedimentation Barrier',
    riskTier: 'P2 Tourist Corridor Hazard',
    sla: '12.0 Hours SLA',
    ward: 'Ward 04'
  }
};

export const VizagLeafletMap: React.FC<VizagLeafletMapProps> = ({
  incidents,
  hotspots,
  selectedIncident,
  newlyArrivedIncidentId,
  onSelectIncident,
  onOpenDetailModal
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const markersLayerGroupRef = useRef<L.LayerGroup | null>(null);
  const hotspotsLayerGroupRef = useRef<L.LayerGroup | null>(null);
  const pegmanMarkerRef = useRef<L.Marker | null>(null);

  // Map state
  const [activeLayer, setActiveLayer] = useState<MapLayerType>('streets');
  const [searchQuery, setSearchQuery] = useState('');
  const [showLandmarkBar] = useState(true);
  const [mouseCoords, setMouseCoords] = useState<{ lat: number; lng: number }>({ lat: 17.732, lng: 83.320 });

  // Street View State
  const [streetViewOpen, setStreetViewOpen] = useState<boolean>(false);
  const [streetViewData, setStreetViewData] = useState<StreetViewData>(VIZAG_STREET_VIEWS['rk-beach']);
  const [cameraHeading, setCameraHeading] = useState<number>(135); // 0 to 360 degrees
  const [isStreetViewExpanded, setIsStreetViewExpanded] = useState<boolean>(false);

  // Initialize Map with Smooth & Accurate Handling
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    // Centered over Visakhapatnam City Center & Coastal Line
    const map = L.map(mapContainerRef.current, {
      center: [17.732, 83.320],
      zoom: 13.5,
      minZoom: 10,
      maxZoom: 19,
      zoomSnap: 0.25,
      zoomDelta: 0.5,
      wheelPxPerZoomLevel: 100,
      zoomControl: false, // Handled by custom on-map controls
      attributionControl: false,
      preferCanvas: true
    });

    // Broad operational boundaries so dragging feels smooth with zero clipping
    const vizagBounds = L.latLngBounds(
      [17.35, 82.80], // Southwest (Anakapalli / Steel Plant)
      [18.15, 83.70]  // Northeast (Bheemili / Anandapuram)
    );
    map.setMaxBounds(vizagBounds);

    // Track mouse coordinates for live precision HUD
    map.on('mousemove', (e: L.LeafletMouseEvent) => {
      setMouseCoords({
        lat: Number(e.latlng.lat.toFixed(4)),
        lng: Number(e.latlng.lng.toFixed(4))
      });
    });

    // Map click enables street view at that exact location if user clicks a road
    map.on('click', (e: L.LeafletMouseEvent) => {
      if (streetViewOpen) {
        setStreetViewData({
          name: 'Selected Visakhapatnam Road',
          road: `Street coordinate ${e.latlng.lat.toFixed(4)}° N, ${e.latlng.lng.toFixed(4)}° E`,
          lat: e.latlng.lat,
          lng: e.latlng.lng,
          imageUrl: VIZAG_STREET_VIEWS['rk-beach'].imageUrl,
          defectLabel: 'Inspected Street Pavement Segment',
          riskTier: 'Active Monitoring Zone',
          sla: 'Live Operational Check',
          ward: 'Greater Visakhapatnam (GVMC)'
        });
      }
    });

    // Add metric scale indicator for mathematical accuracy
    L.control.scale({ imperial: false, metric: true, position: 'bottomleft' }).addTo(map);

    mapInstanceRef.current = map;
    markersLayerGroupRef.current = L.layerGroup().addTo(map);
    hotspotsLayerGroupRef.current = L.layerGroup().addTo(map);

    // OpenStreetMap standard provides maximum accuracy for Indian roads, building footprints, and beach names
    const initialTileUrl = 'https://tile.openstreetmap.org/{z}/{x}/{y}.png';
    const tileLayer = L.tileLayer(initialTileUrl, {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map);

    tileLayerRef.current = tileLayer;

    setTimeout(() => {
      map.invalidateSize();
    }, 200);

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update Tile Layer Dynamically
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (tileLayerRef.current) {
      map.removeLayer(tileLayerRef.current);
    }

    let url = '';
    let maxZoom = 19;

    if (activeLayer === 'streets') {
      // OpenStreetMap: Most accurate road labels, house lanes, colonies, grounds, and beaches in Visakhapatnam
      url = 'https://tile.openstreetmap.org/{z}/{x}/{y}.png';
    } else if (activeLayer === 'satellite') {
      // Esri World Imagery: High-resolution satellite showing actual houses, roofs, beaches & grounds
      url = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';
      maxZoom = 19;
    } else {
      // CartoDB Voyager: Clean municipal layout
      url = 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png';
      maxZoom = 20;
    }

    const newTile = L.tileLayer(url, {
      subdomains: activeLayer === 'voyager' ? 'abcd' : '',
      maxZoom
    }).addTo(map);

    tileLayerRef.current = newTile;
  }, [activeLayer]);

  // Update Pegman Marker on Map when Street View is active
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (pegmanMarkerRef.current) {
      map.removeLayer(pegmanMarkerRef.current);
      pegmanMarkerRef.current = null;
    }

    if (streetViewOpen && streetViewData) {
      // Custom Pegman icon with rotating viewing cone
      const pegmanHtml = `
        <div style="position: relative; width: 44px; height: 44px; display: flex; items-center; justify-content: center;">
          <!-- Directional View Cone -->
          <div style="position: absolute; top: -14px; left: -14px; width: 72px; height: 72px; pointer-events: none; transform: rotate(${cameraHeading}deg); transition: transform 0.1s ease;">
            <svg viewBox="0 0 100 100" style="width: 100%; height: 100%;">
              <defs>
                <linearGradient id="coneGrad" x1="0" y1="1" x2="0" y2="0">
                  <stop offset="0%" stop-color="#2563eb" stop-opacity="0.5"/>
                  <stop offset="100%" stop-color="#38bdf8" stop-opacity="0"/>
                </linearGradient>
              </defs>
              <polygon points="50,50 15,0 85,0" fill="url(#coneGrad)"/>
            </svg>
          </div>
          <!-- Pegman Avatar -->
          <div style="width: 32px; height: 32px; border-radius: 50%; background: #2563eb; border: 2.5px solid #ffffff; box-shadow: 0 4px 12px rgba(37,99,235,0.4); display: flex; align-items: center; justify-content: center; color: white; font-size: 11px; font-weight: 800; font-family: monospace; position: relative; z-index: 10;">
            360°
          </div>
        </div>
      `;

      const pegmanIcon = L.divIcon({
        className: 'pegman-icon',
        html: pegmanHtml,
        iconSize: [44, 44],
        iconAnchor: [22, 22]
      });

      const marker = L.marker([streetViewData.lat, streetViewData.lng], {
        icon: pegmanIcon,
        zIndexOffset: 2000
      }).addTo(map);

      pegmanMarkerRef.current = marker;
    }
  }, [streetViewOpen, streetViewData, cameraHeading]);

  // Render Hotspots as Density Clusters
  useEffect(() => {
    const group = hotspotsLayerGroupRef.current;
    if (!group) return;

    group.clearLayers();

    hotspots.forEach(hotspot => {
      const isCritical = hotspot.severity === 'CRITICAL';
      const circleColor = isCritical ? '#e11d48' : '#d97706';

      const circle = L.circle([hotspot.latitude, hotspot.longitude], {
        radius: hotspot.radiusMeters,
        color: circleColor,
        weight: 2,
        opacity: 0.8,
        fillColor: circleColor,
        fillOpacity: 0.12,
        dashArray: '5, 5'
      });

      circle.bindTooltip(`
        <div style="font-family: inherit; font-size: 11px; padding: 2px 4px; font-weight: 600; color: #0f172a;">
          <strong>${hotspot.name}</strong><br/>
          <span style="color: ${circleColor};">${hotspot.incidentCount} clustered incidents • ${hotspot.radiusMeters}m radius</span>
        </div>
      `, { sticky: true });

      circle.addTo(group);
    });
  }, [hotspots]);

  // Render High-Accuracy Incident Markers
  useEffect(() => {
    const group = markersLayerGroupRef.current;
    const map = mapInstanceRef.current;
    if (!group || !map) return;

    group.clearLayers();

    incidents.forEach(incident => {
      const isSelected = selectedIncident?.id === incident.id;
      const isNew = newlyArrivedIncidentId === incident.id;

      let pinColor = '#2563eb';
      if (incident.priority === 'P1') pinColor = '#e11d48';
      else if (incident.priority === 'P2') pinColor = '#d97706';
      else if (incident.status === 'RESOLVED') pinColor = '#059669';

      const size = isSelected ? 40 : isNew ? 38 : 32;

      const pinHtml = `
        <div class="vizag-marker-pin ${isNew ? 'beacon-pulse' : ''}" style="width: ${size}px; height: ${size + 8}px; position: relative;">
          ${isSelected ? `
            <div style="position: absolute; top: -6px; left: -6px; width: ${size + 12}px; height: ${size + 12}px; border-radius: 50%; background: ${pinColor}30; animation: vizag-beacon 1.8s infinite ease-out;"></div>
          ` : ''}
          <svg width="${size}" height="${size + 8}" viewBox="0 0 36 44" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <filter id="shadow-${incident.id}" x="-20%" y="-10%" width="140%" height="130%">
                <feDropShadow dx="0" dy="2" stdDeviation="2" flood-color="#000" flood-opacity="0.25"/>
              </filter>
            </defs>
            <path d="M18 0 C8.06 0 0 8.06 0 18 C0 31.5 18 44 18 44 C18 44 36 31.5 36 18 C36 8.06 27.94 0 18 0 Z" 
                  fill="${pinColor}" 
                  stroke="#ffffff" 
                  stroke-width="${isSelected ? '3' : '2'}"
                  filter="url(#shadow-${incident.id})"/>
            <circle cx="18" cy="17" r="8" fill="#ffffff" />
            <circle cx="18" cy="17" r="4.5" fill="${pinColor}" />
          </svg>
          ${incident.duplicateCount > 0 ? `
            <div style="position: absolute; top: -4px; right: -4px; background: #0f172a; border: 1.5px solid #ffffff; color: #fff; font-size: 9px; font-weight: 800; border-radius: 999px; padding: 0 4px; line-height: 14px; font-family: monospace;">
              +${incident.duplicateCount}
            </div>
          ` : ''}
        </div>
      `;

      const customIcon = L.divIcon({
        className: 'vizag-leaflet-divicon',
        html: pinHtml,
        iconSize: [size, size + 8],
        iconAnchor: [size / 2, size + 8],
        popupAnchor: [0, -(size + 10)]
      });

      const marker = L.marker([incident.latitude, incident.longitude], {
        icon: customIcon,
        zIndexOffset: isSelected ? 1000 : isNew ? 900 : 100
      });

      // Custom Clean Popup with Street View Trigger
      const popupHtml = `
        <div style="width: 270px; font-family: 'Plus Jakarta Sans', sans-serif; padding: 14px; background: #ffffff;">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px;">
            <span style="font-family: monospace; font-weight: 700; font-size: 11px; color: #64748b;">${incident.id}</span>
            <span style="background: ${pinColor}15; color: ${pinColor}; border: 1px solid ${pinColor}30; font-size: 10px; font-weight: 700; padding: 2px 6px; border-radius: 6px;">
              ${incident.priority} • ${incident.severity}
            </span>
          </div>

          <div style="width: 100%; height: 110px; border-radius: 8px; overflow: hidden; margin-bottom: 10px; background: #f1f5f9; border: 1px solid rgba(0,0,0,0.08);">
            <img src="${incident.image}" alt="${incident.category}" style="width: 100%; height: 100%; object-fit: cover;" />
          </div>

          <div style="font-size: 14px; font-weight: 800; color: #0f172a; line-height: 1.2; margin-bottom: 3px;">
            ${incident.category}
          </div>
          <div style="font-size: 11px; color: #475569; margin-bottom: 10px; line-height: 1.3;">
            ${incident.address}
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 6px; margin-bottom: 10px;">
            <button id="streetview-btn-${incident.id}" style="background: #eff6ff; color: #1d4ed8; border: 1px solid #bfdbfe; border-radius: 8px; padding: 7px 10px; font-size: 11px; font-weight: 700; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 4px;">
              <span>Street View 360°</span>
            </button>
            <button id="inspect-btn-${incident.id}" style="background: #1d4ed8; color: #ffffff; border: none; border-radius: 8px; padding: 7px 10px; font-size: 11px; font-weight: 700; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 4px;">
              <span>[Trace Workflow]</span>
            </button>
          </div>
        </div>
      `;

      marker.bindPopup(popupHtml, {
        className: 'vizag-glass-popup',
        maxWidth: 300,
        closeButton: true
      });

      marker.on('click', () => {
        onSelectIncident(incident);
        map.flyTo([incident.latitude, incident.longitude], 16, { duration: 0.6 });
      });

      marker.on('popupopen', () => {
        const inspectBtn = document.getElementById(`inspect-btn-${incident.id}`);
        if (inspectBtn) inspectBtn.onclick = () => onOpenDetailModal(incident);

        const streetViewBtn = document.getElementById(`streetview-btn-${incident.id}`);
        if (streetViewBtn) {
          streetViewBtn.onclick = () => {
            handleOpenStreetViewForIncident(incident);
          };
        }
      });

      marker.addTo(group);
    });
  }, [incidents, selectedIncident, newlyArrivedIncidentId]);

  // Center on Selected Incident if changed externally
  useEffect(() => {
    if (!selectedIncident || !mapInstanceRef.current) return;
    mapInstanceRef.current.flyTo(
      [selectedIncident.latitude, selectedIncident.longitude],
      16,
      { duration: 0.7 }
    );
  }, [selectedIncident]);

  const handleOpenStreetViewForIncident = (incident: Incident) => {
    setStreetViewData({
      name: incident.locality,
      road: incident.address,
      lat: incident.latitude,
      lng: incident.longitude,
      imageUrl: incident.image || VIZAG_STREET_VIEWS['rk-beach'].imageUrl,
      defectLabel: `${incident.category} (${(incident.confidence * 100).toFixed(0)}% AI Confidence)`,
      riskTier: `${incident.priority} • ${incident.severity}`,
      sla: incident.targetResolutionHours ? `${incident.targetResolutionHours}h SLA` : 'Standard SLA',
      ward: incident.ward || 'GVMC Zone'
    });
    setStreetViewOpen(true);
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([incident.latitude, incident.longitude], 16, { duration: 0.6 });
    }
  };

  // Zoom Helpers for Smooth Map Handling
  const handleZoomIn = () => {
    if (!mapInstanceRef.current) return;
    mapInstanceRef.current.zoomIn(0.75, { animate: true });
  };

  const handleZoomOut = () => {
    if (!mapInstanceRef.current) return;
    mapInstanceRef.current.zoomOut(0.75, { animate: true });
  };

  const resetView = () => {
    if (!mapInstanceRef.current) return;
    mapInstanceRef.current.flyTo([17.732, 83.320], 13.5, { duration: 0.8 });
  };

  const flyToLandmark = (landmark: typeof VIZAG_LANDMARKS[0]) => {
    if (!mapInstanceRef.current) return;
    mapInstanceRef.current.flyTo(landmark.coords, landmark.zoom, { duration: 0.8 });
    
    // Automatically prepare street view data for this landmark
    const key = landmark.name.toLowerCase().includes('beach') ? 'rk-beach' :
                landmark.name.toLowerCase().includes('mvp') ? 'mvp-colony' :
                landmark.name.toLowerCase().includes('gajuwaka') ? 'gajuwaka' :
                landmark.name.toLowerCase().includes('dwaraka') ? 'dwaraka-nagar' : 'rushikonda';
    
    if (VIZAG_STREET_VIEWS[key]) {
      setStreetViewData(VIZAG_STREET_VIEWS[key]);
    }
  };

  // Search Filter Handler
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim() || !mapInstanceRef.current) return;

    const term = searchQuery.toLowerCase();
    
    const matchedLandmark = VIZAG_LANDMARKS.find(l => 
      l.name.toLowerCase().includes(term) || l.type.toLowerCase().includes(term)
    );

    if (matchedLandmark) {
      flyToLandmark(matchedLandmark);
      return;
    }

    const matchedIncident = incidents.find(i => 
      i.locality.toLowerCase().includes(term) ||
      i.address.toLowerCase().includes(term) ||
      i.category.toLowerCase().includes(term) ||
      i.id.toLowerCase().includes(term)
    );

    if (matchedIncident) {
      onSelectIncident(matchedIncident);
      mapInstanceRef.current.flyTo([matchedIncident.latitude, matchedIncident.longitude], 16, { duration: 0.8 });
    }
  };

  return (
    <div className="relative w-full h-full min-h-[540px] flex flex-col font-sans select-none overflow-hidden rounded-2xl border border-slate-300 shadow-md bg-white">
      {/* MAIN LEAFLET MAP CANVAS */}
      <div ref={mapContainerRef} className="w-full h-full flex-1 z-0 cursor-grab active:cursor-grabbing" />

      {/* TOP FLOATING SEARCH & CONTROLS STRIP */}
      <div className="absolute top-4 left-4 right-4 z-20 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 pointer-events-none">
        
        {/* SEARCH BAR (POINTER EVENTS ENABLED) */}
        <form 
          onSubmit={handleSearch}
          className="pointer-events-auto relative w-full sm:w-80 shadow-md"
        >
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search Beach, MVP, Stadium, Gajuwaka..."
            style={{ backgroundColor: '#ffffff', borderColor: '#cbd5e1', color: '#0f172a' }}
            className="w-full border rounded-xl pl-10 pr-3.5 py-2 text-xs font-medium placeholder:text-slate-400 shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 font-sans"
          />
        </form>

        {/* LAYER SELECTOR & STREET VIEW TOGGLE (POINTER EVENTS ENABLED) */}
        <div className="pointer-events-auto flex items-center gap-2 self-end sm:self-center">
          
          {/* STREET VIEW ACTIVATOR BUTTON */}
          <button
            onClick={() => setStreetViewOpen(!streetViewOpen)}
            style={streetViewOpen ? {
              backgroundColor: '#1d4ed8',
              color: '#ffffff',
              borderColor: '#1d4ed8'
            } : {
              backgroundColor: '#ffffff',
              color: '#0f172a',
              borderColor: '#cbd5e1'
            }}
            className="px-3.5 py-2 rounded-xl border text-xs font-bold flex items-center gap-2 shadow-md transition-all cursor-pointer hover:border-blue-500"
            title="Open Interactive Street View at active location"
          >
            <Compass className="w-3.5 h-3.5" />
            <span>{streetViewOpen ? 'Close Street View' : 'Street View 360°'}</span>
          </button>

          {/* ACCURATE MAP TILES SWITCHER */}
          <div 
            style={{ backgroundColor: '#ffffff', borderColor: '#cbd5e1' }}
            className="flex items-center p-1 rounded-xl border shadow-md text-xs font-bold"
          >
            <button
              onClick={() => setActiveLayer('streets')}
              style={activeLayer === 'streets' ? {
                backgroundColor: '#eff6ff',
                color: '#1d4ed8',
                borderColor: '#bfdbfe'
              } : {
                color: '#64748b'
              }}
              className="px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer"
              title="OpenStreetMap: Most accurate road network, house lanes & grounds"
            >
              <Sun className="w-3.5 h-3.5 text-amber-500" />
              <span className="hidden md:inline">Streets Atlas</span>
            </button>

            <button
              onClick={() => setActiveLayer('satellite')}
              style={activeLayer === 'satellite' ? {
                backgroundColor: '#eff6ff',
                color: '#1d4ed8',
                borderColor: '#bfdbfe'
              } : {
                color: '#64748b'
              }}
              className="px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer"
              title="Esri World Imagery: Real satellite photography of houses, grounds & ocean"
            >
              <Satellite className="w-3.5 h-3.5 text-emerald-600" />
              <span className="hidden md:inline">Satellite</span>
            </button>

            <button
              onClick={() => setActiveLayer('voyager')}
              style={activeLayer === 'voyager' ? {
                backgroundColor: '#eff6ff',
                color: '#1d4ed8',
                borderColor: '#bfdbfe'
              } : {
                color: '#64748b'
              }}
              className="px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer"
              title="Voyager: Clean daylight municipal zones"
            >
              <Compass className="w-3.5 h-3.5 text-blue-600" />
              <span className="hidden md:inline">Clean</span>
            </button>
          </div>
        </div>
      </div>

      {/* RIGHT SIDEBAR ON-MAP ZOOM & NAVIGATION CONTROLS */}
      <div className="absolute right-4 top-20 z-20 flex flex-col gap-2 pointer-events-auto">
        {/* ZOOM IN BUTTON */}
        <button
          onClick={handleZoomIn}
          className="w-9 h-9 rounded-xl bg-white hover:bg-slate-50 border border-slate-300 text-slate-800 shadow-md flex items-center justify-center transition-all cursor-pointer font-bold hover:text-blue-600"
          title="Zoom In (+)"
        >
          <Plus className="w-4 h-4" />
        </button>

        {/* ZOOM OUT BUTTON */}
        <button
          onClick={handleZoomOut}
          className="w-9 h-9 rounded-xl bg-white hover:bg-slate-50 border border-slate-300 text-slate-800 shadow-md flex items-center justify-center transition-all cursor-pointer font-bold hover:text-blue-600"
          title="Zoom Out (-)"
        >
          <Minus className="w-4 h-4" />
        </button>

        {/* RECENTER BUTTON */}
        <button
          onClick={resetView}
          className="w-9 h-9 rounded-xl bg-white hover:bg-slate-50 border border-slate-300 text-slate-800 shadow-md flex items-center justify-center transition-all cursor-pointer font-bold hover:text-blue-600"
          title="Recenter to Greater Visakhapatnam"
        >
          <Crosshair className="w-4 h-4" />
        </button>
      </div>

      {/* BOTTOM FLOATING VIZAG LANDMARKS BAR */}
      {showLandmarkBar && !streetViewOpen && (
        <div className="absolute bottom-4 left-4 right-4 z-20 pointer-events-none">
          <div 
            style={{ backgroundColor: '#ffffff', borderColor: '#cbd5e1' }}
            className="p-2 rounded-2xl border shadow-lg pointer-events-auto flex items-center justify-between gap-2 overflow-x-auto"
          >
            <div className="flex items-center gap-1.5 flex-nowrap pr-2">
              <span className="text-[11px] font-extrabold uppercase tracking-wider px-2 whitespace-nowrap text-slate-500 hidden lg:inline">
                [Vizag Landmarks]:
              </span>

              {VIZAG_LANDMARKS.map(lm => (
                <button
                  key={lm.name}
                  onClick={() => flyToLandmark(lm)}
                  className="px-2.5 py-1.5 rounded-lg bg-slate-50 hover:bg-blue-50 border border-slate-300 hover:border-blue-300 text-slate-800 hover:text-blue-900 text-xs font-semibold whitespace-nowrap flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs"
                  title={`Fly to ${lm.name} (${lm.type})`}
                >
                  <span className="text-[9px] font-extrabold font-mono uppercase px-1 py-0.5 rounded bg-blue-100 text-blue-700">[{lm.tag}]</span>
                  <span>{lm.name}</span>
                </button>
              ))}
            </div>

            <div className="text-[11px] font-mono text-slate-500 pr-2 hidden sm:block whitespace-nowrap border-l border-slate-300 pl-3">
              Lat: {mouseCoords.lat}° N, Lng: {mouseCoords.lng}° E
            </div>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* 360° INTERACTIVE STREET VIEW MODAL / DRAWER */}
      {/* ==================================================================== */}
      {streetViewOpen && streetViewData && (
        <div className={`absolute bottom-4 left-4 right-4 z-30 transition-all duration-300 ${
          isStreetViewExpanded ? 'top-16' : 'h-[360px]'
        } bg-white rounded-3xl border-2 border-blue-500/80 shadow-2xl overflow-hidden flex flex-col animate-fadeIn`}>
          
          {/* STREET VIEW TOP HUD */}
          <div className="bg-slate-900 text-white px-4 py-3 flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center font-bold text-white shadow-sm text-xs font-mono">
                360°
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-extrabold text-white">{streetViewData.name}</span>
                  <span className="text-[10px] px-2 py-0.5 rounded font-mono font-bold bg-blue-500/30 text-blue-200 border border-blue-400/40">
                    STREET VIEW 360°
                  </span>
                </div>
                <div className="text-[11px] text-slate-300 flex items-center gap-2">
                  <span>{streetViewData.road}</span>
                  <span className="text-slate-500">•</span>
                  <span className="font-mono text-emerald-400">{streetViewData.lat.toFixed(4)}° N, {streetViewData.lng.toFixed(4)}° E</span>
                  <span className="text-slate-500">•</span>
                  <span className="font-mono text-amber-300">Bearing: {cameraHeading}°</span>
                </div>
              </div>
            </div>

            {/* STREET VIEW ACTION BUTTONS */}
            <div className="flex items-center gap-2">
              {/* GOOGLE MAPS REAL STREET VIEW DIRECT LINK (NO API KEY NEEDED) */}
              <a
                href={`https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=${streetViewData.lat},${streetViewData.lng}&heading=${cameraHeading}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm"
                title="Launch Google Street View 360° Sphere at these exact coordinates"
              >
                <span>Google Street View</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>

              {/* EXPAND / SHRINK TOGGLE */}
              <button
                onClick={() => setIsStreetViewExpanded(!isStreetViewExpanded)}
                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-all cursor-pointer"
                title={isStreetViewExpanded ? 'Contract Street View' : 'Expand Street View Fullscreen'}
              >
                {isStreetViewExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </button>

              {/* CLOSE BUTTON */}
              <button
                onClick={() => setStreetViewOpen(false)}
                className="p-2 rounded-xl bg-white/10 hover:bg-rose-600 text-white transition-all cursor-pointer"
                title="Exit Street View"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* STREET VIEW PANORAMA CAMERA VIEWPORT */}
          <div className="flex-1 relative overflow-hidden bg-slate-950 flex items-center justify-center">
            
            {/* PANORAMIC ROAD IMAGE WITH SMOOTH COMPASS ROTATION */}
            <div 
              className="absolute inset-0 w-full h-full transition-transform duration-100 ease-out"
              style={{
                backgroundImage: `url(${streetViewData.imageUrl})`,
                backgroundSize: 'cover',
                backgroundPosition: `${((cameraHeading / 360) * 100)}% 50%`
              }}
            >
              {/* VIGNETTE GRADIENTS */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30 pointer-events-none" />
            </div>

            {/* AR DEFECT DETECTION OVERLAY ON PAVEMENT */}
            <div className="absolute bottom-16 left-1/2 -translate-x-1/2 z-10 pointer-events-none">
              <div className="p-3 rounded-2xl bg-black/75 backdrop-blur-md border-2 border-blue-400 text-white space-y-1 shadow-2xl animate-pulse">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                  <span className="text-xs font-black text-white">{streetViewData.defectLabel}</span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-red-600 text-white font-bold">
                    {streetViewData.riskTier}
                  </span>
                </div>
                <div className="text-[11px] text-slate-300 flex items-center gap-3">
                  <span>Municipal SLA: <strong className="text-white">{streetViewData.sla}</strong></span>
                  <span>Jurisdiction: <strong className="text-white">{streetViewData.ward}</strong></span>
                </div>
              </div>
            </div>

            {/* INTERACTIVE 360° CAMERA ROTATION CONTROLS */}
            <div className="absolute top-4 left-4 z-20 flex items-center gap-2 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-2xl border border-white/20 text-white text-xs font-bold">
              <button 
                onClick={() => setCameraHeading((prev) => (prev - 45 + 360) % 360)}
                className="p-1 rounded-lg hover:bg-white/20 cursor-pointer transition-colors"
                title="Rotate Left 45°"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
              
              <div className="flex items-center gap-1.5 px-2">
                <Navigation 
                  className="w-3.5 h-3.5 text-blue-400 transition-transform" 
                  style={{ transform: `rotate(${cameraHeading}deg)` }}
                />
                <span className="font-mono text-xs">{cameraHeading}°</span>
                <span className="text-[10px] text-slate-400">
                  {cameraHeading >= 315 || cameraHeading < 45 ? 'NORTH' :
                   cameraHeading >= 45 && cameraHeading < 135 ? 'EAST' :
                   cameraHeading >= 135 && cameraHeading < 225 ? 'SOUTH' : 'WEST'}
                </span>
              </div>

              <button 
                onClick={() => setCameraHeading((prev) => (prev + 45) % 360)}
                className="p-1 rounded-lg hover:bg-white/20 cursor-pointer transition-colors"
                title="Rotate Right 45°"
              >
                <RotateCw className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* HORIZONTAL 360° ROTATION SLIDER AT BOTTOM */}
            <div className="absolute bottom-3 left-6 right-6 z-20 flex items-center gap-4 bg-black/70 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/10 text-white text-xs">
              <span className="text-[11px] font-bold text-slate-300 whitespace-nowrap">Rotate 360° Camera:</span>
              <input 
                type="range"
                min="0"
                max="360"
                value={cameraHeading}
                onChange={(e) => setCameraHeading(Number(e.target.value))}
                className="flex-1 accent-blue-500 cursor-pointer"
              />
              <span className="text-[11px] font-mono text-blue-400 font-bold whitespace-nowrap">{cameraHeading}° Compass</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
