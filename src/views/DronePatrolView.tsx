import React, { useState, useEffect } from 'react';
import { 
  Radio, 
  MapPin, 
  Play, 
  Pause, 
  RotateCcw, 
  ShieldCheck, 
  AlertTriangle, 
  Camera, 
  Sparkles, 
  Eye, 
  Navigation, 
  Activity, 
  Layers, 
  ChevronRight, 
  CheckCircle2, 
  Wrench,
  BatteryCharging,
  Maximize2,
  Cpu,
  Flame,
  Moon,
  Crosshair,
  ArrowUpRight,
  Compass,
  Check
} from 'lucide-react';
import { incidentStore } from '../services/incidentStore';
import { DronePatrolRoute, DroneDetection } from '../types';
import { ActiveTab } from '../components/layout/AppShell';
import { initialDroneRoutes, initialDroneDetections } from '../services/mock/enterpriseData';
import { DroneMap } from '../components/map/DroneMap';

interface DronePatrolViewProps {
  onNavigate?: (tab: ActiveTab) => void;
}

type CameraSensorMode = 'OPTICAL' | 'THERMAL' | 'NEURAL_BBOX' | 'NIGHT_VISION';

export const DronePatrolView: React.FC<DronePatrolViewProps> = ({ onNavigate }) => {
  const storeRoutes = incidentStore.getDroneRoutes();
  const [routes, setRoutes] = useState<DronePatrolRoute[]>(
    storeRoutes && storeRoutes.length > 0 ? storeRoutes : initialDroneRoutes
  );
  const storeDetections = incidentStore.getDroneDetections();
  const [detections, setDetections] = useState<DroneDetection[]>(
    storeDetections && storeDetections.length > 0 ? storeDetections : initialDroneDetections
  );

  const [selectedRouteId, setSelectedRouteId] = useState<string>('DP-01');
  const [isFlightActive, setIsFlightActive] = useState<boolean>(true);
  const [currentWaypointIdx, setCurrentWaypointIdx] = useState<number>(0);
  const [hudScanLine, setHudScanLine] = useState<number>(20);
  const [cameraMode, setCameraMode] = useState<CameraSensorMode>('NEURAL_BBOX');
  const [snapshotFlash, setSnapshotFlash] = useState<boolean>(false);
  const [dispatchedWoNotification, setDispatchedWoNotification] = useState<{ id: string; title: string } | null>(null);
  const [droneDisplayMode, setDroneDisplayMode] = useState<'SPLIT' | 'CAMERA' | 'MAP'>('MAP');

  // Fallback-safe active route selection
  const safeRoutes = routes && routes.length > 0 ? routes : initialDroneRoutes;
  const activeRoute: DronePatrolRoute = 
    safeRoutes.find(r => r.id === selectedRouteId) || safeRoutes[0] || initialDroneRoutes[0];

  const waypoints = activeRoute?.waypoints && activeRoute.waypoints.length > 0
    ? activeRoute.waypoints
    : [
        { lat: 17.7142, lng: 83.3234, name: 'INS Kursura Museum' },
        { lat: 17.7380, lng: 83.3510, name: 'Tenneti Park Overlook' },
        { lat: 17.7650, lng: 83.3720, name: 'Bay Cliff Viewpoint' },
        { lat: 17.7850, lng: 83.3850, name: 'Rushikonda Beach' }
      ];

  const currentWaypoint = waypoints[currentWaypointIdx % waypoints.length] || waypoints[0];

  useEffect(() => {
    const unsubscribe = incidentStore.subscribe(() => {
      const updatedRoutes = incidentStore.getDroneRoutes();
      const updatedDetections = incidentStore.getDroneDetections();
      if (updatedRoutes && updatedRoutes.length > 0) setRoutes(updatedRoutes);
      if (updatedDetections && updatedDetections.length > 0) setDetections(updatedDetections);
    });
    return unsubscribe;
  }, []);

  // Simulated flight progression timer
  useEffect(() => {
    if (!isFlightActive) return;
    const interval = setInterval(() => {
      setCurrentWaypointIdx(prev => (prev + 1) % waypoints.length);
      setHudScanLine(prev => (prev + 18) % 100);
    }, 4000);
    return () => clearInterval(interval);
  }, [isFlightActive, waypoints.length]);

  // Capture High-Res Snapshot
  const handleCaptureSnapshot = () => {
    setSnapshotFlash(true);
    setTimeout(() => setSnapshotFlash(false), 300);

    const newDetection: DroneDetection = {
      id: `DET-DRN-${Math.floor(920 + Math.random() * 80)}`,
      timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      routeId: activeRoute.id,
      lat: currentWaypoint.lat + (Math.random() - 0.5) * 0.002,
      lng: currentWaypoint.lng + (Math.random() - 0.5) * 0.002,
      defectType: 'Alligator Cracking & Pothole Void',
      severity: 'CRITICAL',
      estimatedAreaSqM: 1.85,
      confidence: 0.974,
      snapshot: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=600&auto=format&fit=crop&q=80',
      ircStandardCode: 'IRC:82-2015 Class 3 (Severe Fatigue)',
      locality: `${currentWaypoint.name} Sector`
    };

    setDetections(prev => [newDetection, ...prev]);
  };

  // Create work order from drone detection
  const handleDispatchFromDetection = (detection: DroneDetection) => {
    const wo = incidentStore.createWorkOrder({
      title: `Drone Detected: ${detection.defectType} — ${detection.locality}`,
      category: detection.defectType.toLowerCase().includes('pothole') ? 'Pothole' : 'Damaged Road',
      priority: detection.severity === 'CRITICAL' ? 'P1' : 'P2',
      address: `${detection.locality}, Visakhapatnam`,
      beforeImage: detection.snapshot,
      totalEstimatedCost: Math.round(detection.estimatedAreaSqM * 2800) + 15000,
      boqItems: [
        { item: 'Cold Milling & Asphalt Extraction', quantity: Math.round(detection.estimatedAreaSqM * 10) / 10, unit: 'sq.m', rate: 650, totalCost: Math.round(detection.estimatedAreaSqM * 650) },
        { item: 'Bituminous Concrete VG-30 Heavy Base', quantity: 2.5, unit: 'MT', rate: 7500, totalCost: 18750 },
        { item: 'Compaction Roller & Edge Sealant', quantity: 2, unit: 'hours', rate: 2200, totalCost: 4400 }
      ]
    });

    setDispatchedWoNotification({
      id: wo.id,
      title: wo.title
    });

    setTimeout(() => {
      setDispatchedWoNotification(null);
    }, 7000);
  };

  const totalPatrolKm = safeRoutes.reduce((sum, r) => sum + r.totalDistanceKm, 0).toFixed(1);
  const totalDetections = safeRoutes.reduce((sum, r) => sum + r.detectionsCount, 0);

  return (
    <div className="min-h-full p-4 sm:p-7 space-y-6 font-sans bg-slate-50 text-slate-900 select-none">
      
      {/* 1. PAGE HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-300">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500">Autonomous Aerial Surveillance Unit</span>
            <span className="text-slate-300">•</span>
            <span className="text-xs font-bold text-blue-700">GVMC Drone Fleet v3.2</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 mt-1">
            Drone Aerial Patrol & Pavement Vision Lab
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 leading-relaxed mt-0.5">
            Automated aerial flight paths, 4K multi-spectral optical defect classification, and IRC:82-2015 Pavement Condition Index (PCI) analytics.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={handleCaptureSnapshot}
            className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-100 border border-slate-300 text-slate-800 text-xs font-bold flex items-center gap-2 shadow-xs transition-all cursor-pointer"
            title="Trigger High-Res Optical Frame Capture"
          >
            <Camera className="w-4 h-4 text-blue-600" />
            <span>Capture 4K Frame</span>
          </button>

          <button
            onClick={() => setIsFlightActive(!isFlightActive)}
            className={`px-4 py-2 rounded-xl font-bold text-xs flex items-center gap-2 transition-all cursor-pointer shadow-md ${
              isFlightActive 
                ? 'bg-amber-600 hover:bg-amber-700 text-white shadow-amber-500/25'
                : 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/25'
            }`}
          >
            {isFlightActive ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            <span>{isFlightActive ? 'Pause Mission' : 'Resume Flight'}</span>
          </button>
        </div>
      </div>

      {/* DISPATCH NOTIFICATION BANNER */}
      {dispatchedWoNotification && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-300 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-slate-900 animate-fadeIn">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-600 flex items-center justify-center text-white flex-shrink-0 shadow-sm">
              <Check className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 text-xs">
                <span className="font-extrabold uppercase tracking-wider text-emerald-800 text-[11px]">[WORK ORDER DISPATCHED]</span>
                <span className="text-emerald-900 font-mono font-bold">{dispatchedWoNotification.id}</span>
              </div>
              <p className="text-xs text-slate-700 font-medium mt-0.5">
                {dispatchedWoNotification.title} has been logged and assigned to the rapid-response fleet.
              </p>
            </div>
          </div>

          {onNavigate && (
            <button
              onClick={() => onNavigate('work-orders')}
              className="px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-xs whitespace-nowrap"
            >
              <span>View in Work Orders</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      )}

      {/* 2. METRIC STRIP */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="p-4 rounded-2xl bg-white border border-slate-300 shadow-xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Active Drones</span>
            <Radio className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-black text-slate-900 font-mono">4 Drones</div>
          <div className="text-[11px] text-slate-500">Fleet: 2 Airborne • 1 Analyzing • 1 Standby</div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-300 shadow-xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Corridor Coverage</span>
            <Navigation className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-emerald-700 font-mono">{totalPatrolKm} km</div>
          <div className="text-[11px] text-slate-500">Across Beach Road &amp; NH16 Corridors</div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-300 shadow-xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Pavement Index (PCI)</span>
            <Activity className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-2xl font-black text-indigo-700 font-mono">{activeRoute.pavementConditionIndex || 78.4} / 100</div>
          <div className="text-[11px] text-slate-500">IRC:82-2015 Rating: <span className="font-bold text-emerald-700">Satisfactory</span></div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-300 shadow-xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">AI Detections Logged</span>
            <Eye className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-black text-amber-700 font-mono">{detections.length || totalDetections}</div>
          <div className="text-[11px] text-slate-500">Potholes, Cracks, Edge Drop-offs</div>
        </div>
      </div>

      {/* 3. INTERACTIVE DRONE COCKPIT & LIVE HUD SIMULATION */}
      <div className="p-5 rounded-3xl bg-white border border-slate-300 shadow-xl space-y-4">
        
        {/* CORRIDOR SELECTOR & SENSOR MODE TABS */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-slate-200">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
            <span className="text-xs font-bold text-slate-500 mr-1 whitespace-nowrap">Flight Corridor:</span>
            {safeRoutes.map(r => (
              <button
                key={r.id}
                onClick={() => {
                  setSelectedRouteId(r.id);
                  setCurrentWaypointIdx(0);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  selectedRouteId === r.id
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                {r.name.split('—')[0]}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* DISPLAY VIEW SWITCHER (MAP / CAMERA / SPLIT) */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs">
              <span className="text-[10px] font-bold uppercase text-slate-500 px-2">View:</span>
              <button
                onClick={() => setDroneDisplayMode('MAP')}
                className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition-all cursor-pointer flex items-center gap-1 ${
                  droneDisplayMode === 'MAP' ? 'bg-blue-600 text-white shadow-2xs' : 'text-slate-700 hover:bg-slate-200'
                }`}
              >
                <MapPin className="w-3 h-3" />
                <span>Clear Map</span>
              </button>
              <button
                onClick={() => setDroneDisplayMode('CAMERA')}
                className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition-all cursor-pointer flex items-center gap-1 ${
                  droneDisplayMode === 'CAMERA' ? 'bg-blue-600 text-white shadow-2xs' : 'text-slate-700 hover:bg-slate-200'
                }`}
              >
                <Eye className="w-3 h-3" />
                <span>4K Camera</span>
              </button>
              <button
                onClick={() => setDroneDisplayMode('SPLIT')}
                className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition-all cursor-pointer flex items-center gap-1 ${
                  droneDisplayMode === 'SPLIT' ? 'bg-blue-600 text-white shadow-2xs' : 'text-slate-700 hover:bg-slate-200'
                }`}
              >
                <Layers className="w-3 h-3" />
                <span>Split (Both)</span>
              </button>
            </div>

            {/* SENSOR SWITCHER */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs">
              <span className="text-[10px] font-bold uppercase text-slate-500 px-2">Sensor:</span>
              <button
                onClick={() => setCameraMode('NEURAL_BBOX')}
                className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition-all cursor-pointer ${
                  cameraMode === 'NEURAL_BBOX' ? 'bg-blue-600 text-white shadow-2xs' : 'text-slate-700 hover:bg-slate-200'
                }`}
              >
                Neural BBox
              </button>
              <button
                onClick={() => setCameraMode('OPTICAL')}
                className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition-all cursor-pointer ${
                  cameraMode === 'OPTICAL' ? 'bg-blue-600 text-white shadow-2xs' : 'text-slate-700 hover:bg-slate-200'
                }`}
              >
                4K RGB
              </button>
              <button
                onClick={() => setCameraMode('THERMAL')}
                className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition-all cursor-pointer ${
                  cameraMode === 'THERMAL' ? 'bg-orange-600 text-white shadow-2xs' : 'text-slate-700 hover:bg-slate-200'
                }`}
              >
                FLIR Thermal
              </button>
              <button
                onClick={() => setCameraMode('NIGHT_VISION')}
                className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition-all cursor-pointer ${
                  cameraMode === 'NIGHT_VISION' ? 'bg-emerald-700 text-white shadow-2xs' : 'text-slate-700 hover:bg-slate-200'
                }`}
              >
                Night IR
              </button>
            </div>
          </div>
        </div>

        {/* COCKPIT WORKSPACE (DUAL SPLIT) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
          
          {/* LEFT 7 COLS: INTERACTIVE MAP / 4K OPTICAL HUD / SPLIT VIEW */}
          <div className="lg:col-span-7 flex flex-col gap-3 min-h-[440px]">
            {/* 1. CLEAR MAP ONLY MODE */}
            {droneDisplayMode === 'MAP' && (
              <div className="h-[460px] rounded-2xl overflow-hidden border border-slate-300 shadow-xl">
                <DroneMap
                  route={activeRoute}
                  currentWaypointIdx={currentWaypointIdx}
                  onSelectWaypoint={setCurrentWaypointIdx}
                />
              </div>
            )}

            {/* 2. 4K OPTICAL CAMERA HUD ONLY MODE */}
            {droneDisplayMode === 'CAMERA' && (
              <div className={`rounded-2xl overflow-hidden border border-slate-400 relative flex flex-col justify-between min-h-[460px] shadow-2xl transition-all ${
                cameraMode === 'THERMAL' 
                  ? 'bg-gradient-to-br from-purple-950 via-slate-900 to-amber-950' :
                cameraMode === 'NIGHT_VISION'
                  ? 'bg-gradient-to-b from-emerald-950 via-black to-emerald-950' :
                  'bg-slate-950'
              }`}>
                {snapshotFlash && (
                  <div className="absolute inset-0 bg-white z-50 animate-ping opacity-90 pointer-events-none" />
                )}

                <div className="p-3 bg-black/75 backdrop-blur-md flex items-center justify-between text-white font-mono text-[11px] z-20 border-b border-white/10">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
                    <span className="font-bold text-red-400">REC 4K // 60 FPS</span>
                    <span className="text-slate-500">|</span>
                    <span className="text-slate-300 font-bold">{activeRoute.corridor.split('(')[0]}</span>
                  </div>
                  <div className="flex items-center gap-3 text-slate-300">
                    <span className="text-emerald-400 font-bold">ALT: {activeRoute.altitudeMeters || 45}m</span>
                    <span className="text-sky-300 font-bold">SPD: {activeRoute.maxSpeedKmph || 42} km/h</span>
                    <span className="text-amber-400 font-bold">HDOP: 0.6m</span>
                  </div>
                </div>

                <div className="relative flex-1 flex items-center justify-center p-4 overflow-hidden">
                  <div className={`w-full h-full rounded-xl relative overflow-hidden flex items-center justify-center border border-white/10 ${
                    cameraMode === 'THERMAL' ? 'filter hue-rotate-90 saturate-200 contrast-125' :
                    cameraMode === 'NIGHT_VISION' ? 'filter brightness-125 contrast-150 saturate-150' : ''
                  }`}>
                    <svg className="w-full h-full" viewBox="0 0 600 360" preserveAspectRatio="none">
                      <defs>
                        <linearGradient id="roadGrad1" x1="0%" y1="0%" x2="100%" y2="0%">
                          <stop offset="0%" stopColor="#1e293b" />
                          <stop offset="50%" stopColor="#0f172a" />
                          <stop offset="100%" stopColor="#1e293b" />
                        </linearGradient>
                        <pattern id="grid1" width="30" height="30" patternUnits="userSpaceOnUse">
                          <path d="M 30 0 L 0 0 0 30" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
                        </pattern>
                      </defs>
                      <rect width="600" height="360" fill="#0f172a" />
                      <rect width="600" height="360" fill="url(#grid1)" />
                      <path d="M 50 360 Q 300 180 550 0" fill="none" stroke="url(#roadGrad1)" strokeWidth="110" strokeLinecap="round" />
                      <path d="M 50 360 Q 300 180 550 0" fill="none" stroke="#ffffff" strokeWidth="4" strokeDasharray="14,14" />
                      <ellipse cx="320" cy="180" rx="36" ry="24" fill="#090d16" stroke="#ef4444" strokeWidth="2.5" />
                      <circle cx="320" cy="180" r="14" fill="#ef4444" opacity="0.3" />
                      <path d="M 300 175 L 260 160 M 345 185 L 390 195 M 330 195 L 340 220" stroke="#ef4444" strokeWidth="2" strokeDasharray="3,3" />
                      {cameraMode === 'THERMAL' && (
                        <ellipse cx="320" cy="180" rx="60" ry="40" fill="rgba(239, 68, 68, 0.4)" filter="blur(6px)" />
                      )}
                    </svg>

                    <div 
                      className={`absolute left-0 right-0 h-0.5 shadow-lg pointer-events-none transition-all duration-300 ${
                        cameraMode === 'NIGHT_VISION' ? 'bg-emerald-400 shadow-emerald-500/80' :
                        cameraMode === 'THERMAL' ? 'bg-orange-400 shadow-orange-500/80' :
                        'bg-blue-400 shadow-blue-500/80'
                      }`}
                      style={{ top: `${hudScanLine}%` }}
                    />

                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div className="w-56 h-56 border border-white/20 rounded-full flex items-center justify-center relative">
                        <div className="w-2 h-2 bg-blue-400 rounded-full animate-ping" />
                        <Crosshair className="w-8 h-8 text-blue-400/70" />
                        <span className="absolute top-1 text-[9px] font-mono text-white/50">N 042°</span>
                        <span className="absolute bottom-1 text-[9px] font-mono text-white/50">S 222°</span>
                      </div>
                    </div>

                    {(cameraMode === 'NEURAL_BBOX' || cameraMode === 'OPTICAL') && (
                      <div className="absolute top-[40%] left-[45%] -translate-x-1/2 -translate-y-1/2 p-2 border-2 border-red-500 rounded bg-red-950/40 backdrop-blur-xs text-white font-mono pointer-events-none shadow-lg animate-pulse">
                        <div className="text-[10px] font-extrabold text-red-400 flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3 text-red-400" />
                          <span>DEFECT #DRN-941: SEVERE CAVITY</span>
                        </div>
                        <div className="text-[9px] text-white space-y-0.5 mt-0.5">
                          <div>AREA: 2.42 m² | DEPTH: 6.8 cm</div>
                          <div className="text-emerald-400 font-bold">CONFIDENCE: 98.4% F1</div>
                          <div className="text-yellow-300">PRIORITY: P1 EMERGENCY DISPATCH</div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="p-3 bg-black/75 backdrop-blur-md flex flex-wrap items-center justify-between text-white font-mono text-[10px] z-20 border-t border-white/10 gap-2">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-blue-500" />
                    <span className="text-blue-300 font-bold">CURRENT WAYPOINT: {currentWaypoint.name}</span>
                    <span className="text-slate-400">({currentWaypoint.lat.toFixed(4)}, {currentWaypoint.lng.toFixed(4)})</span>
                  </div>
                  <div className="flex items-center gap-3 text-emerald-400 font-bold">
                    <span>BATTERY: {activeRoute.batteryPercent || 88}%</span>
                    <span>•</span>
                    <span>MODE: {cameraMode}</span>
                  </div>
                </div>
              </div>
            )}

            {/* 3. SPLIT SCREEN: TOP 4K CAMERA + BOTTOM CLEAR MAP */}
            {droneDisplayMode === 'SPLIT' && (
              <div className="flex flex-col gap-3">
                {/* 4K CAMERA HUD COMPACT */}
                <div className={`rounded-2xl overflow-hidden border border-slate-400 relative flex flex-col justify-between min-h-[250px] max-h-[280px] shadow-lg transition-all ${
                  cameraMode === 'THERMAL' 
                    ? 'bg-gradient-to-br from-purple-950 via-slate-900 to-amber-950' :
                  cameraMode === 'NIGHT_VISION'
                    ? 'bg-gradient-to-b from-emerald-950 via-black to-emerald-950' :
                    'bg-slate-950'
                }`}>
                  <div className="p-2.5 bg-black/75 backdrop-blur-md flex items-center justify-between text-white font-mono text-[10px] z-20 border-b border-white/10">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                      <span className="font-bold text-red-400">4K OPTICAL FEED</span>
                      <span className="text-slate-500">|</span>
                      <span className="text-slate-300">{currentWaypoint.name}</span>
                    </div>
                    <span className="text-emerald-400 font-bold">ALT: {activeRoute.altitudeMeters || 45}m</span>
                  </div>

                  <div className="relative flex-1 flex items-center justify-center p-2 overflow-hidden">
                    <svg className="w-full h-full" viewBox="0 0 600 240" preserveAspectRatio="none">
                      <rect width="600" height="240" fill="#0f172a" />
                      <path d="M 50 240 Q 300 120 550 0" fill="none" stroke="#1e293b" strokeWidth="80" strokeLinecap="round" />
                      <path d="M 50 240 Q 300 120 550 0" fill="none" stroke="#ffffff" strokeWidth="3" strokeDasharray="10,10" />
                      <ellipse cx="320" cy="120" rx="28" ry="18" fill="#090d16" stroke="#ef4444" strokeWidth="2" />
                      <circle cx="320" cy="120" r="10" fill="#ef4444" opacity="0.3" />
                    </svg>

                    <div 
                      className="absolute left-0 right-0 h-0.5 bg-blue-400 shadow-md pointer-events-none transition-all duration-300"
                      style={{ top: `${hudScanLine}%` }}
                    />

                    {(cameraMode === 'NEURAL_BBOX' || cameraMode === 'OPTICAL') && (
                      <div className="absolute top-[40%] left-[45%] -translate-x-1/2 -translate-y-1/2 p-1.5 border border-red-500 rounded bg-red-950/40 backdrop-blur-xs text-white font-mono pointer-events-none text-[9px]">
                        <span className="text-red-400 font-bold">POTHOLE #DRN-941 (98.4%)</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* CLEAR LEAFLET MAP VIEW */}
                <div className="h-[280px] rounded-2xl overflow-hidden border border-slate-300 shadow-md">
                  <DroneMap
                    route={activeRoute}
                    currentWaypointIdx={currentWaypointIdx}
                    onSelectWaypoint={setCurrentWaypointIdx}
                  />
                </div>
              </div>
            )}
          </div>

          {/* RIGHT 5 COLS: FLIGHT PATH & WAYPOINTS */}
          <div className="lg:col-span-5 p-4 rounded-2xl bg-slate-50 border border-slate-300 flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                <div className="flex items-center gap-1.5 font-bold text-xs text-slate-900">
                  <Navigation className="w-4 h-4 text-blue-600" />
                  <span>Autonomous Flight Waypoints</span>
                </div>
                <span className="text-[10px] font-mono font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                  Target {currentWaypointIdx + 1} of {waypoints.length}
                </span>
              </div>

              {/* WAYPOINTS STACK (CLICKABLE TO DIRECT DRONE) */}
              <div className="space-y-2">
                {waypoints.map((wp, wIdx) => {
                  const isCurrent = wIdx === currentWaypointIdx;
                  const isPassed = wIdx < currentWaypointIdx;
                  return (
                    <button
                      key={wIdx}
                      onClick={() => setCurrentWaypointIdx(wIdx)}
                      className={`w-full p-2.5 rounded-xl border text-xs transition-all flex items-center justify-between text-left cursor-pointer ${
                        isCurrent 
                          ? 'bg-blue-50 border-blue-500 ring-2 ring-blue-300 shadow-xs' 
                          : isPassed
                          ? 'bg-white border-slate-200 text-slate-500 hover:bg-slate-100'
                          : 'bg-white border-slate-300 text-slate-800 hover:bg-slate-100'
                      }`}
                      title={`Click to steer drone camera toward ${wp.name}`}
                    >
                      <div className="flex items-center gap-2">
                        <span className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-[10px] ${
                          isCurrent ? 'bg-blue-600 text-white animate-pulse' :
                          isPassed ? 'bg-emerald-100 text-emerald-800' :
                          'bg-slate-100 text-slate-700'
                        }`}>
                          {wIdx + 1}
                        </span>
                        <div>
                          <div className={`font-bold ${isCurrent ? 'text-blue-900' : ''}`}>{wp.name}</div>
                          {isCurrent && <div className="text-[10px] text-blue-600 font-semibold">[TARGET LOCK ACQUIRED]</div>}
                        </div>
                      </div>
                      <span className="font-mono text-[10px] text-slate-400">
                        {wp.lat.toFixed(4)}, {wp.lng.toFixed(4)}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* PCI SCORE & PAVEMENT HEALTH BREAKDOWN */}
            <div className="p-3.5 rounded-xl bg-white border border-slate-300 space-y-2 text-xs shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-600 uppercase">Corridor PCI Index (IRC:82-2015)</span>
                <span className="font-mono font-black text-blue-700">{activeRoute.pavementConditionIndex || 78.4} / 100</span>
              </div>
              
              <div className="w-full h-2.5 rounded-full bg-slate-100 overflow-hidden">
                <div 
                  className="h-full rounded-full bg-gradient-to-r from-emerald-500 via-amber-500 to-blue-600 transition-all duration-500"
                  style={{ width: `${activeRoute.pavementConditionIndex || 78.4}%` }}
                />
              </div>

              <div className="grid grid-cols-3 gap-2 pt-1 text-center font-mono text-[10px]">
                <div className="p-1 rounded bg-slate-50 border border-slate-200">
                  <div className="text-slate-400">FATIGUE</div>
                  <div className="font-bold text-slate-800">12% Minor</div>
                </div>
                <div className="p-1 rounded bg-slate-50 border border-slate-200">
                  <div className="text-slate-400">RAVELING</div>
                  <div className="font-bold text-slate-800">6% Low</div>
                </div>
                <div className="p-1 rounded bg-slate-50 border border-slate-200">
                  <div className="text-slate-400">GRADE</div>
                  <div className="font-bold text-emerald-700">Satisfactory</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 4. REAL-TIME AI DETECTIONS FEED (WITH INSTANT WORK ORDER DISPATCH) */}
      <div className="p-5 rounded-3xl bg-white border border-slate-300 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Camera className="w-5 h-5 text-blue-600" />
            <div>
              <h2 className="text-sm font-extrabold uppercase tracking-wider text-slate-900">
                Automated Optical Defect Detections Stream
              </h2>
              <p className="text-xs text-slate-500">Live defects flagged by neural vision models conforming to IRC:82-2015 guidelines.</p>
            </div>
          </div>
          <span className="px-2.5 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-bold font-mono">
            {detections.length} Identified
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {detections.slice(0, 3).map(det => (
            <div 
              key={det.id}
              className="p-3.5 rounded-2xl bg-white border border-slate-300 hover:border-blue-400 transition-all shadow-xs space-y-2.5 flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="rounded-xl overflow-hidden border border-slate-200 h-36 relative bg-slate-900">
                  <img 
                    src={det.snapshot} 
                    alt={det.defectType} 
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-black/70 backdrop-blur-md text-white font-mono text-[9px] font-bold">
                    {det.id}
                  </div>
                  <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded bg-blue-600 text-white font-bold text-[9px]">
                    {(det.confidence * 100).toFixed(1)}% CONFIDENCE
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between">
                    <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded uppercase ${
                      det.severity === 'CRITICAL' ? 'bg-red-50 text-red-700 border border-red-200' :
                      det.severity === 'HIGH' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                      'bg-blue-50 text-blue-700 border border-blue-200'
                    }`}>
                      {det.severity}
                    </span>
                    <span className="text-[11px] text-slate-400 font-mono">{det.timestamp}</span>
                  </div>
                  <h3 className="text-xs font-bold text-slate-900 mt-1">{det.defectType}</h3>
                  <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                    <MapPin className="w-3 h-3 text-slate-400" />
                    <span>{det.locality}</span>
                  </div>
                </div>

                <div className="p-2 rounded-xl bg-slate-50 border border-slate-200 text-[11px] space-y-0.5 text-slate-600">
                  <div>Defect Area: <strong className="text-slate-900 font-mono">{det.estimatedAreaSqM} m²</strong></div>
                  <div>Standard: <strong className="text-blue-700 font-mono text-[10px]">{det.ircStandardCode}</strong></div>
                </div>
              </div>

              <button
                onClick={() => handleDispatchFromDetection(det)}
                className="w-full py-2 rounded-xl bg-slate-900 hover:bg-black text-white font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-xs transition-colors"
              >
                <Wrench className="w-3.5 h-3.5" />
                <span>Issue GVMC Work Order</span>
              </button>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
