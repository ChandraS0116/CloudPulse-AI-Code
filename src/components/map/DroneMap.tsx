import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { DronePatrolRoute } from '../../types';
import { Layers, Crosshair, Navigation, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';

interface DroneMapProps {
  route: DronePatrolRoute;
  currentWaypointIdx: number;
  onSelectWaypoint: (idx: number) => void;
}

export const DroneMap: React.FC<DroneMapProps> = ({
  route,
  currentWaypointIdx,
  onSelectWaypoint
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const polylineRef = useRef<L.Polyline | null>(null);
  const markersRef = useRef<L.Marker[]>([]);
  const droneMarkerRef = useRef<L.Marker | null>(null);
  const radarCircleRef = useRef<L.Circle | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);

  const [mapType, setMapType] = useState<'streets' | 'satellite'>('streets');

  const waypoints = route?.waypoints && route.waypoints.length > 0 
    ? route.waypoints 
    : [
        { lat: 17.7142, lng: 83.3234, name: 'INS Kursura Museum' },
        { lat: 17.7380, lng: 83.3510, name: 'Tenneti Park Overlook' },
        { lat: 17.7650, lng: 83.3720, name: 'Bay Cliff Viewpoint' },
        { lat: 17.7850, lng: 83.3850, name: 'Rushikonda Beach' }
      ];

  const currentWp = waypoints[currentWaypointIdx % waypoints.length] || waypoints[0];

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [currentWp.lat, currentWp.lng],
        zoom: 14,
        zoomControl: false,
        attributionControl: false
      });

      const tileUrl = mapType === 'satellite'
        ? 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
        : 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png';

      tileLayerRef.current = L.tileLayer(tileUrl, { maxZoom: 19 }).addTo(map);
      mapInstanceRef.current = map;
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update Tile Layer on mapType change
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    if (tileLayerRef.current) {
      mapInstanceRef.current.removeLayer(tileLayerRef.current);
    }
    const tileUrl = mapType === 'satellite'
      ? 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
      : 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png';

    tileLayerRef.current = L.tileLayer(tileUrl, { maxZoom: 19 }).addTo(mapInstanceRef.current);
  }, [mapType]);

  // Update Route Polyline and Waypoint Markers
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Clear previous markers
    markersRef.current.forEach(m => map.removeLayer(m));
    markersRef.current = [];
    if (polylineRef.current) map.removeLayer(polylineRef.current);
    if (droneMarkerRef.current) map.removeLayer(droneMarkerRef.current);
    if (radarCircleRef.current) map.removeLayer(radarCircleRef.current);

    const latlngs: [number, number][] = waypoints.map(w => [w.lat, w.lng]);

    // Draw flight route polyline
    polylineRef.current = L.polyline(latlngs, {
      color: '#2563eb',
      weight: 4,
      opacity: 0.85,
      dashArray: '8, 8',
      lineCap: 'round'
    }).addTo(map);

    // Add Waypoint markers
    waypoints.forEach((wp, idx) => {
      const isCurrent = idx === (currentWaypointIdx % waypoints.length);
      const iconHtml = `
        <div style="
          width: 28px;
          height: 28px;
          border-radius: 50%;
          background-color: ${isCurrent ? '#2563eb' : '#ffffff'};
          border: 2px solid ${isCurrent ? '#ffffff' : '#64748b'};
          color: ${isCurrent ? '#ffffff' : '#0f172a'};
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 800;
          font-size: 11px;
          box-shadow: 0 4px 6px -1px rgba(0,0,0,0.3);
          cursor: pointer;
        ">
          ${idx + 1}
        </div>
      `;

      const customIcon = L.divIcon({
        html: iconHtml,
        className: 'custom-wp-pin',
        iconSize: [28, 28],
        iconAnchor: [14, 14]
      });

      const marker = L.marker([wp.lat, wp.lng], { icon: customIcon })
        .addTo(map)
        .bindTooltip(`<b>${wp.name}</b><br/><span style="color:#64748b;font-size:10px;">Waypoint ${idx + 1}</span>`, {
          direction: 'top',
          offset: [0, -10]
        })
        .on('click', () => onSelectWaypoint(idx));

      markersRef.current.push(marker);
    });

    // Add Pulsing Drone Icon at current waypoint
    const droneHtml = `
      <div style="position: relative; width: 36px; height: 36px; display: flex; align-items: center; justify-content: center;">
        <div style="position: absolute; width: 36px; height: 36px; border-radius: 50%; background-color: rgba(37, 99, 235, 0.35); animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
        <div style="width: 26px; height: 26px; border-radius: 50%; background: #0f172a; border: 2px solid #38bdf8; display: flex; align-items: center; justify-content: center; box-shadow: 0 0 12px rgba(56, 189, 248, 0.8);">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <polygon points="12 2 19 21 12 17 5 21 12 2"></polygon>
          </svg>
        </div>
      </div>
    `;

    const droneIcon = L.divIcon({
      html: droneHtml,
      className: 'drone-live-pin',
      iconSize: [36, 36],
      iconAnchor: [18, 18]
    });

    droneMarkerRef.current = L.marker([currentWp.lat, currentWp.lng], { icon: droneIcon, zIndexOffset: 1000 }).addTo(map);

    // Radar scan radius
    radarCircleRef.current = L.circle([currentWp.lat, currentWp.lng], {
      radius: 400,
      color: '#38bdf8',
      weight: 1.5,
      opacity: 0.5,
      fillColor: '#2563eb',
      fillOpacity: 0.08
    }).addTo(map);

    // Smoothly pan map to follow drone
    map.panTo([currentWp.lat, currentWp.lng], { animate: true, duration: 1 });
  }, [route, currentWaypointIdx, waypoints, currentWp]);

  const handleRecenter = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setView([currentWp.lat, currentWp.lng], 15, { animate: true });
    }
  };

  const handleZoom = (delta: number) => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setZoom(mapInstanceRef.current.getZoom() + delta);
    }
  };

  return (
    <div className="relative w-full h-full min-h-[380px] rounded-2xl overflow-hidden border border-slate-300 shadow-inner bg-slate-100 flex flex-col">
      {/* MAP CONTROLS OVERLAY */}
      <div className="absolute top-3 left-3 z-[400] flex items-center gap-2 bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-300 shadow-sm text-xs font-bold text-slate-800">
        <Navigation className="w-3.5 h-3.5 text-blue-600" />
        <span>{route.name.split('—')[0]}</span>
        <span className="text-slate-300">•</span>
        <span className="text-blue-700 font-mono text-[11px]">{currentWp.name}</span>
      </div>

      <div className="absolute top-3 right-3 z-[400] flex items-center gap-1.5">
        {/* SATELLITE / STREET TOGGLE */}
        <button
          onClick={() => setMapType(mapType === 'streets' ? 'satellite' : 'streets')}
          className="px-2.5 py-1.5 rounded-xl bg-white/95 backdrop-blur-md border border-slate-300 shadow-sm text-xs font-bold text-slate-800 hover:bg-slate-50 transition-all flex items-center gap-1.5 cursor-pointer"
        >
          <Layers className="w-3.5 h-3.5 text-blue-600" />
          <span>{mapType === 'streets' ? 'Satellite Map' : 'Road Map'}</span>
        </button>

        {/* RECENTER BUTTON */}
        <button
          onClick={handleRecenter}
          className="p-1.5 rounded-xl bg-white/95 backdrop-blur-md border border-slate-300 shadow-sm text-slate-700 hover:text-blue-600 hover:bg-slate-50 transition-all cursor-pointer"
          title="Recenter on Drone Position"
        >
          <Crosshair className="w-4 h-4" />
        </button>

        {/* ZOOM IN / OUT */}
        <div className="flex flex-col bg-white/95 backdrop-blur-md border border-slate-300 rounded-xl shadow-sm overflow-hidden">
          <button
            onClick={() => handleZoom(1)}
            className="p-1.5 text-slate-700 hover:text-slate-900 hover:bg-slate-100 border-b border-slate-200 cursor-pointer"
            title="Zoom In"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => handleZoom(-1)}
            className="p-1.5 text-slate-700 hover:text-slate-900 hover:bg-slate-100 cursor-pointer"
            title="Zoom Out"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* LEAFLET CONTAINER */}
      <div ref={mapContainerRef} className="w-full h-full flex-1 z-0" />

      {/* MAP FOOTER TELEMETRY */}
      <div className="absolute bottom-2 left-3 right-3 z-[400] bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-300 shadow-sm flex items-center justify-between text-xs font-mono">
        <div className="flex items-center gap-2 text-slate-700">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>GPS FIX: {currentWp.lat.toFixed(4)}° N, {currentWp.lng.toFixed(4)}° E</span>
        </div>
        <span className="text-slate-500 text-[10px]">GVMC MUNICIPAL AIRSPACE APPROVED</span>
      </div>
    </div>
  );
};
