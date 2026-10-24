import React, { useState, useEffect } from 'react';
import { 
  Play, 
  CheckCircle2, 
  Cpu, 
  Eye, 
  MapPin, 
  AlertTriangle, 
  Layers, 
  ShieldCheck, 
  Activity, 
  Radio, 
  Network 
} from 'lucide-react';
import { AgentName, Incident } from '../../types';

interface AgentMeshFlowProps {
  selectedIncident?: Incident | null;
  onNavigateToFullWorkflow?: () => void;
  onOpenIncidentDetail?: (incident: Incident) => void;
  initialAgentName?: AgentName;
}

interface MeshNode {
  id: string;
  name: AgentName;
  short: string;
  role: string;
  x: number;
  y: number;
  color: string;
  bg: string;
  border: string;
  ring: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface MeshEdge {
  id: string;
  from: string;
  to: string;
  label: string;
  curved?: boolean;
}

export const AgentMeshFlow: React.FC<AgentMeshFlowProps> = ({
  selectedIncident,
  onNavigateToFullWorkflow,
  onOpenIncidentDetail,
  initialAgentName = 'Vision Agent'
}) => {
  const [selectedAgentName, setSelectedAgentName] = useState<AgentName>(initialAgentName);
  const [isDiagnosing, setIsDiagnosing] = useState<boolean>(false);
  const [autoCycle, setAutoCycle] = useState<boolean>(false);

  // Mesh Nodes Configuration (Arranged in a balanced, pure mesh topology)
  const nodes: MeshNode[] = [
    {
      id: 'orch',
      name: 'Orchestrator',
      short: 'Orchestrator',
      role: 'Master Pipeline Ingestion & Context Hub',
      x: 75,
      y: 130,
      color: '#2563eb',
      bg: '#eff6ff',
      border: '#93c5fd',
      ring: 'ring-blue-500',
      icon: Cpu
    },
    {
      id: 'vision',
      name: 'Vision Agent',
      short: 'Vision AI',
      role: 'Visual Defect Classifier & Sizing',
      x: 250,
      y: 45,
      color: '#0891b2',
      bg: '#ecfeff',
      border: '#67e8f9',
      ring: 'ring-cyan-500',
      icon: Eye
    },
    {
      id: 'geo',
      name: 'Geo Agent',
      short: 'Geo GIS',
      role: 'Polygon Geofence & Ward Verification',
      x: 250,
      y: 215,
      color: '#059669',
      bg: '#ecfdf5',
      border: '#6ee7b7',
      ring: 'ring-emerald-500',
      icon: MapPin
    },
    {
      id: 'triage',
      name: 'Triage Agent',
      short: 'Triage SLA',
      role: 'Kinetic Risk & Priority Tier Matrix',
      x: 440,
      y: 45,
      color: '#d97706',
      bg: '#fffbeb',
      border: '#fcd34d',
      ring: 'ring-amber-500',
      icon: AlertTriangle
    },
    {
      id: 'correlation',
      name: 'Correlation Agent',
      short: 'Correlation',
      role: 'Spatial Cluster & Deduplication Sentinel',
      x: 440,
      y: 215,
      color: '#4f46e5',
      bg: '#eef2ff',
      border: '#a5b4fc',
      ring: 'ring-indigo-500',
      icon: Layers
    },
    {
      id: 'decision',
      name: 'Decision Agent',
      short: 'Decision Hub',
      role: 'Resource Allocator & Work Order Dispatcher',
      x: 625,
      y: 130,
      color: '#7c3aed',
      bg: '#f5f3ff',
      border: '#c4b5fd',
      ring: 'ring-purple-500',
      icon: ShieldCheck
    },
    {
      id: 'monitoring',
      name: 'Monitoring Agent',
      short: 'Monitoring',
      role: 'Telemetry Audit & Citizen SLA Sentinel',
      x: 745,
      y: 130,
      color: '#0d9488',
      bg: '#f0fdfa',
      border: '#5eead4',
      ring: 'ring-teal-500',
      icon: Activity
    }
  ];

  // Mesh Interconnecting Edges
  const edges: MeshEdge[] = [
    { id: 'e-orch-vision', from: 'orch', to: 'vision', label: 'Image Binary' },
    { id: 'e-orch-geo', from: 'orch', to: 'geo', label: 'GPS Coords' },
    { id: 'e-orch-decision', from: 'orch', to: 'decision', label: 'Session State', curved: true },
    { id: 'e-vision-triage', from: 'vision', to: 'triage', label: 'Defect Class' },
    { id: 'e-vision-decision', from: 'vision', to: 'decision', label: 'Feature Vector' },
    { id: 'e-geo-correlation', from: 'geo', to: 'correlation', label: 'Boundary Ward' },
    { id: 'e-geo-decision', from: 'geo', to: 'decision', label: 'GIS Tag' },
    { id: 'e-triage-correlation', from: 'triage', to: 'correlation', label: 'Urgency Weight' },
    { id: 'e-triage-decision', from: 'triage', to: 'decision', label: 'Priority SLA' },
    { id: 'e-correlation-decision', from: 'correlation', to: 'decision', label: 'Dedupe Token' },
    { id: 'e-decision-monitoring', from: 'decision', to: 'monitoring', label: 'Work Order' },
    { id: 'e-monitoring-orch', from: 'monitoring', to: 'orch', label: 'Closed-Loop SLA', curved: true }
  ];

  // Specific diagnostic payload for each agent (Pure, clean, plain English)
  const incidentLocality = selectedIncident?.locality || 'MVP Colony, Visakhapatnam';
  const incidentCategory = selectedIncident?.category || 'Pothole';
  const incidentPriority = selectedIncident?.priority || 'P1';

  const diagnosticsData: Record<AgentName, {
    inboundSource: string;
    inboundData: string;
    internalAction: string;
    outboundTarget: string;
    outboundData: string;
    latency: string;
    accuracy: string;
    health: string;
    meshEdges: string[];
  }> = {
    'Orchestrator': {
      inboundSource: 'Citizen App Telemetry',
      inboundData: `Civic report packet (${incidentCategory} at ${incidentLocality})`,
      internalAction: 'Validates JSON schema, assigns execution context, and broadcasts DAG tasks to 4 parallel nodes.',
      outboundTarget: 'Vision, Geo & Decision Agents',
      outboundData: 'Execution tokens dispatched across real-time asynchronous event bus',
      latency: '24 ms',
      accuracy: '100%',
      health: 'Nominal (100%)',
      meshEdges: ['e-orch-vision', 'e-orch-geo', 'e-orch-decision', 'e-monitoring-orch']
    },
    'Vision Agent': {
      inboundSource: 'Orchestrator Node',
      inboundData: 'High-resolution photographic capture (JPEG 2048x1536)',
      internalAction: `Extracts pixel gradient contours; identified ${incidentCategory} (87cm diameter, 9.2cm cavity depth).`,
      outboundTarget: 'Triage & Decision Agents',
      outboundData: `Structural defect classification: ${incidentCategory} (94.2% confidence)`,
      latency: '38 ms',
      accuracy: '94.2%',
      health: 'Nominal (100%)',
      meshEdges: ['e-orch-vision', 'e-vision-triage', 'e-vision-decision']
    },
    'Geo Agent': {
      inboundSource: 'Orchestrator Node',
      inboundData: 'Raw GPS coordinates (Lat: 17.7424, Lon: 83.3356)',
      internalAction: `Ray-casting against Visakhapatnam operational polygon. Pinpointed to GVMC Ward 18 (${incidentLocality}).`,
      outboundTarget: 'Correlation & Decision Agents',
      outboundData: 'Municipal jurisdiction verified. Bound to GVMC Zone 3 Maintenance Cell.',
      latency: '18 ms',
      accuracy: '100%',
      health: 'Nominal (100%)',
      meshEdges: ['e-orch-geo', 'e-geo-correlation', 'e-geo-decision']
    },
    'Triage Agent': {
      inboundSource: 'Vision & Orchestrator Nodes',
      inboundData: `${incidentCategory} defect class + arterial road kinetic traffic density`,
      internalAction: `Evaluates accident probability. Assigned ${incidentPriority} Critical severity with a 4.0-hour SLA window.`,
      outboundTarget: 'Decision & Correlation Agents',
      outboundData: `Priority: ${incidentPriority} • Target SLA: 4.0 Hours • Risk Score: 88/100`,
      latency: '32 ms',
      accuracy: '96.5%',
      health: 'Nominal (100%)',
      meshEdges: ['e-vision-triage', 'e-triage-correlation', 'e-triage-decision']
    },
    'Correlation Agent': {
      inboundSource: 'Geo & Triage Nodes',
      inboundData: 'Geographic coordinates & 50m spatial cluster query buffer',
      internalAction: 'Scans active civic incident index for duplicate submissions within 3 hours. Merged 0 child records.',
      outboundTarget: 'Decision Agent',
      outboundData: 'Unique primary incident authenticated. No duplicate collision detected.',
      latency: '26 ms',
      accuracy: '99.1%',
      health: 'Nominal (100%)',
      meshEdges: ['e-geo-correlation', 'e-triage-correlation', 'e-correlation-decision']
    },
    'Decision Agent': {
      inboundSource: 'Triage, Correlation & Geo Nodes',
      inboundData: `${incidentPriority} Priority + Ward 18 Location + Dedupe Confirmation`,
      internalAction: 'Evaluates crew availability matrix. Auto-dispatched GVMC Rapid Road Repair Unit 3.',
      outboundTarget: 'Monitoring Agent',
      outboundData: 'Work Order #WO-4921 generated. Dispatched to field maintenance vehicle #04.',
      latency: '41 ms',
      accuracy: '100%',
      health: 'Nominal (100%)',
      meshEdges: ['e-triage-decision', 'e-correlation-decision', 'e-geo-decision', 'e-vision-decision', 'e-orch-decision', 'e-decision-monitoring']
    },
    'Monitoring Agent': {
      inboundSource: 'Decision Agent',
      inboundData: 'Work order #WO-4921 & crew dispatch telemetry',
      internalAction: 'Initiates real-time SLA countdown, updates public tracker, and triggers citizen SMS alert.',
      outboundTarget: 'Orchestrator & Public Map',
      outboundData: 'Closed-loop audit verified. Map marker updated to ACTIVE DISPATCH.',
      latency: '22 ms',
      accuracy: '100%',
      health: 'Nominal (100%)',
      meshEdges: ['e-decision-monitoring', 'e-monitoring-orch']
    }
  };

  const activeDiag = diagnosticsData[selectedAgentName] || diagnosticsData['Vision Agent'];
  const activeNode = nodes.find(n => n.name === selectedAgentName) || nodes[1];

  // --------------------------------------------------------------------------
  // RUN DIAGNOSTIC ACTION
  // --------------------------------------------------------------------------
  const handleRunDiagnostic = (agentName?: AgentName) => {
    const target = agentName || selectedAgentName;
    setSelectedAgentName(target);
    setIsDiagnosing(true);

    setTimeout(() => {
      setIsDiagnosing(false);
    }, 550);
  };

  // Auto-cycle through all 7 nodes if triggered
  useEffect(() => {
    if (!autoCycle) return;
    const agentList: AgentName[] = [
      'Orchestrator',
      'Vision Agent',
      'Geo Agent',
      'Triage Agent',
      'Correlation Agent',
      'Decision Agent',
      'Monitoring Agent'
    ];

    let currentIndex = agentList.indexOf(selectedAgentName);
    const interval = setInterval(() => {
      currentIndex = (currentIndex + 1) % agentList.length;
      setSelectedAgentName(agentList[currentIndex]);
      setIsDiagnosing(true);
      setTimeout(() => setIsDiagnosing(false), 450);
    }, 1800);

    return () => clearInterval(interval);
  }, [autoCycle, selectedAgentName]);

  return (
    <div className="p-5 sm:p-6 rounded-xl border border-slate-300 shadow-sm bg-white space-y-5 font-sans">
      
      {/* 1. TOP HEADER & PURE DIAGNOSTIC TRIGGER */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-300">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 shadow-xs">
              <Network className="w-4 h-4 text-blue-600" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black tracking-tight text-slate-900">
                  AI Agent Mesh Network
                </h2>
                <span className={`text-[10px] px-2.5 py-0.5 rounded font-extrabold uppercase tracking-wider border ${
                  isDiagnosing 
                    ? 'bg-amber-50 text-amber-700 border-amber-300 animate-pulse' 
                    : 'bg-emerald-50 text-emerald-700 border-emerald-300'
                }`}>
                  {isDiagnosing ? '[PROBING MESH DATA FLOW...]' : '[MESH HEALTH: 100% NOMINAL]'}
                </span>
              </div>
              <p className="text-sm text-slate-500 leading-relaxed mt-0.5">
                Click any agent below to inspect its live data flow through the municipal intelligence mesh.
              </p>
            </div>
          </div>
        </div>

        {/* PRIMARY DIAGNOSTIC CONTROLS */}
        <div className="flex flex-wrap items-center gap-2">
          {/* AUTO-CYCLE TOGGLE */}
          <button
            onClick={() => setAutoCycle(!autoCycle)}
            className={`px-3 py-1.5 rounded-lg border text-xs font-bold transition-all cursor-pointer shadow-xs flex items-center gap-1.5 ${
              autoCycle 
                ? 'bg-blue-50 text-blue-700 border-blue-300' 
                : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
            }`}
          >
            <Radio className={`w-3.5 h-3.5 ${autoCycle ? 'text-blue-600 animate-pulse' : 'text-slate-400'}`} />
            <span className="text-[11px] font-extrabold uppercase tracking-wider">{autoCycle ? '[Stop Auto-Cycle]' : '[Auto-Cycle Mesh]'}</span>
          </button>

          {/* RUN DIAGNOSTIC BUTTON (PROMINENT & CLEAN) */}
          <button
            onClick={() => handleRunDiagnostic()}
            disabled={isDiagnosing}
            className="px-4 py-2 rounded-lg text-xs font-extrabold uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer shadow-sm bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/20 disabled:opacity-60"
          >
            <Play className={`w-3.5 h-3.5 fill-white ${isDiagnosing ? 'animate-spin' : ''}`} />
            <span>[Run Diagnostic on {activeNode.short}]</span>
          </button>

          {/* STUDIO LINK */}
          {onNavigateToFullWorkflow && (
            <button
              onClick={onNavigateToFullWorkflow}
              className="px-3 py-2 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-800 hover:text-slate-900 border border-slate-300 text-xs font-bold transition-all cursor-pointer shadow-xs"
            >
              Full Studio
            </button>
          )}
        </div>
      </div>

      {/* 2. AGENT SELECTION TABS (QUICK, PURE, INSTANT) */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
        {nodes.map((node) => {
          const isSelected = node.name === selectedAgentName;
          const NodeIcon = node.icon;

          return (
            <button
              key={node.id}
              onClick={() => handleRunDiagnostic(node.name)}
              className={`px-3 py-1.5 rounded-lg font-extrabold uppercase tracking-wider text-[11px] transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap border ${
                isSelected
                  ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                  : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-300 shadow-xs'
              }`}
            >
              <NodeIcon className={`w-3.5 h-3.5 ${isSelected ? 'text-white' : 'text-slate-500'}`} />
              <span>{node.short}</span>
              {isSelected && (
                <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
              )}
            </button>
          );
        })}
      </div>

      {/* 3. PURE SVG MESH CANVAS (7 CONNECTED NODES) */}
      <div className="relative w-full rounded-xl bg-slate-50/50 border border-slate-300 p-3 overflow-hidden shadow-xs">
        <svg 
          viewBox="0 0 820 260" 
          className="w-full h-auto select-none"
          style={{ minHeight: '190px', maxHeight: '250px' }}
        >
          {/* DEFINITIONS FOR GLOWING ARROWHEADS */}
          <defs>
            <marker
              id="arrow-active"
              viewBox="0 0 10 10"
              refX="18"
              refY="5"
              markerWidth="6"
              markerHeight="6"
              orient="auto-start-reverse"
            >
              <path d="M 0 1 L 10 5 L 0 9 z" fill="#2563eb" />
            </marker>
            <marker
              id="arrow-outbound"
              viewBox="0 0 10 10"
              refX="18"
              refY="5"
              markerWidth="6"
              markerHeight="6"
              orient="auto-start-reverse"
            >
              <path d="M 0 1 L 10 5 L 0 9 z" fill="#10b981" />
            </marker>
            <marker
              id="arrow-muted"
              viewBox="0 0 10 10"
              refX="18"
              refY="5"
              markerWidth="5"
              markerHeight="5"
              orient="auto-start-reverse"
            >
              <path d="M 0 1 L 10 5 L 0 9 z" fill="#cbd5e1" />
            </marker>
          </defs>

          {/* RENDER MESH EDGES */}
          {edges.map((edge) => {
            const fromNode = nodes.find(n => n.id === edge.from)!;
            const toNode = nodes.find(n => n.id === edge.to)!;
            const isConnectedToActive = activeDiag.meshEdges.includes(edge.id);
            const isInbound = edge.to === activeNode.id;
            const isOutbound = edge.from === activeNode.id;

            let pathD = `M ${fromNode.x} ${fromNode.y} L ${toNode.x} ${toNode.y}`;
            if (edge.curved) {
              const midX = (fromNode.x + toNode.x) / 2;
              const midY = (fromNode.y + toNode.y) / 2 - 35;
              pathD = `M ${fromNode.x} ${fromNode.y} Q ${midX} ${midY} ${toNode.x} ${toNode.y}`;
            }

            return (
              <g key={edge.id} className="transition-all duration-300">
                {/* Background Shadow/Glow Line for Active Flow */}
                {isConnectedToActive && (
                  <path
                    d={pathD}
                    fill="none"
                    stroke={isInbound ? '#38bdf8' : '#34d399'}
                    strokeWidth={isDiagnosing ? 5 : 3.5}
                    strokeOpacity={0.4}
                    strokeLinecap="round"
                    className={isDiagnosing ? 'animate-pulse' : ''}
                  />
                )}

                {/* Primary Edge Line */}
                <path
                  d={pathD}
                  fill="none"
                  stroke={
                    isConnectedToActive
                      ? isInbound
                        ? '#2563eb'
                        : '#059669'
                      : '#cbd5e1'
                  }
                  strokeWidth={isConnectedToActive ? 2.5 : 1.2}
                  strokeDasharray={isConnectedToActive ? (isDiagnosing ? '6 3' : '4 2') : 'none'}
                  strokeLinecap="round"
                  markerEnd={
                    isConnectedToActive
                      ? isInbound
                        ? 'url(#arrow-active)'
                        : 'url(#arrow-outbound)'
                      : 'url(#arrow-muted)'
                  }
                />
              </g>
            );
          })}

          {/* RENDER MESH NODES */}
          {nodes.map((node) => {
            const isSelected = node.name === selectedAgentName;
            const NodeIcon = node.icon;
            const isMeshPeer = activeDiag.meshEdges.some(eId => {
              const edge = edges.find(e => e.id === eId);
              return edge && (edge.from === node.id || edge.to === node.id);
            });

            return (
              <g
                key={node.id}
                onClick={() => handleRunDiagnostic(node.name)}
                className="cursor-pointer group"
              >
                {/* Outer Pulsing Ring for Selected Agent */}
                {isSelected && (
                  <circle
                    cx={node.x}
                    cy={node.y}
                    r={26}
                    fill={node.color}
                    fillOpacity={0.15}
                    className="animate-ping"
                  />
                )}

                {/* Node Outer Circle */}
                <circle
                  cx={node.x}
                  cy={node.y}
                  r={isSelected ? 22 : 18}
                  fill={isSelected ? '#ffffff' : isMeshPeer ? node.bg : '#ffffff'}
                  stroke={isSelected ? node.color : isMeshPeer ? node.border : '#e2e8f0'}
                  strokeWidth={isSelected ? 3 : 1.5}
                  className="transition-all duration-200 shadow-sm"
                />

                {/* Inner Center Dot / Icon Badge */}
                <circle
                  cx={node.x}
                  cy={node.y}
                  r={isSelected ? 10 : 8}
                  fill={node.color}
                />

                {/* Node Label Below */}
                <text
                  x={node.x}
                  y={node.y + (isSelected ? 33 : 29)}
                  textAnchor="middle"
                  className={`text-[11px] font-extrabold select-none transition-all ${
                    isSelected ? 'fill-slate-900 font-black' : 'fill-slate-600'
                  }`}
                >
                  {node.short}
                </text>
              </g>
            );
          })}
        </svg>

        {/* MESH FLOW LEGEND STRIP */}
        <div className="flex items-center justify-between px-2 pt-2 border-t border-slate-300 text-[11px] text-slate-500 font-medium">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-1 rounded-full bg-blue-600" />
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-600">[Inbound Stream]</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-1 rounded-full bg-emerald-600" />
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-600">[Outbound Stream]</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-1 rounded-full bg-slate-400" />
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500">[Passive Mesh Links]</span>
            </div>
          </div>

          <div className="font-mono text-slate-900 font-extrabold text-[11px] uppercase tracking-wider">
            [{activeNode.name} • ACTIVE FOCUS]
          </div>
        </div>
      </div>

      {/* 4. SIMPLE AND PURE FLOW PATHWAY STRIP (SOURCE -> ACTIVE -> TARGET) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
        
        {/* INBOUND PATH */}
        <div className="p-3.5 rounded-xl border border-slate-300 bg-white space-y-1 text-left shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-blue-700">
              [1. INBOUND MESH FLOW]
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded font-extrabold uppercase tracking-wider bg-blue-50 text-blue-800 border border-blue-200">
              From: {activeDiag.inboundSource}
            </span>
          </div>
          <div className="text-xs font-bold text-slate-900 mt-1">
            "{activeDiag.inboundData}"
          </div>
        </div>

        {/* ACTIVE AGENT ACTION */}
        <div className="p-3.5 rounded-xl border border-blue-600 bg-blue-50/20 space-y-1 text-left ring-2 ring-blue-400/40 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-blue-700">
              [2. {activeNode.name}]
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded font-extrabold uppercase tracking-wider bg-white text-blue-900 border border-blue-300 font-mono">
              {activeDiag.latency} LATENCY
            </span>
          </div>
          <div className="text-xs font-semibold text-slate-900 mt-1">
            {activeDiag.internalAction}
          </div>
        </div>

        {/* OUTBOUND PATH */}
        <div className="p-3.5 rounded-xl border border-slate-300 bg-white space-y-1 text-left shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-700">
              [3. OUTBOUND MESH FLOW]
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded font-extrabold uppercase tracking-wider bg-emerald-50 text-emerald-800 border border-emerald-300">
              To: {activeDiag.outboundTarget}
            </span>
          </div>
          <div className="text-xs font-bold text-slate-900 mt-1">
            "{activeDiag.outboundData}"
          </div>
        </div>
      </div>

      {/* 5. DIAGNOSTIC METRIC CHIPS (HIGH CONTRAST & PURE) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1 text-xs">
        <div className="p-2.5 rounded-xl bg-white border border-slate-300 text-center shadow-xs">
          <div className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">[DIAGNOSTIC HEALTH]</div>
          <div className="text-emerald-700 font-black text-sm mt-0.5 flex items-center justify-center gap-1 font-mono">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>{activeDiag.health}</span>
          </div>
        </div>

        <div className="p-2.5 rounded-xl bg-white border border-slate-300 text-center shadow-xs">
          <div className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">[DIAGNOSTIC LATENCY]</div>
          <div className="text-blue-700 font-mono font-black text-sm mt-0.5">
            {activeDiag.latency}
          </div>
        </div>

        <div className="p-2.5 rounded-xl bg-white border border-slate-300 text-center shadow-xs">
          <div className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">[ALGORITHM ACCURACY]</div>
          <div className="text-slate-900 font-mono font-black text-sm mt-0.5">
            {activeDiag.accuracy}
          </div>
        </div>

        <div className="p-2.5 rounded-xl bg-white border border-slate-300 text-center shadow-xs">
          <div className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">[MESH PEER LINKS]</div>
          <div className="text-slate-900 font-mono font-black text-sm mt-0.5">
            {activeDiag.meshEdges.length} Active Edges
          </div>
        </div>
      </div>
    </div>
  );
};
