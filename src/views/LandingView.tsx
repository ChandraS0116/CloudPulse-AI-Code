import React, { useState } from 'react';
import { 
  ArrowRight, 
  Cpu, 
  ShieldCheck, 
  Eye, 
  AlertTriangle, 
  MapPin, 
  Activity, 
  Layers, 
  Sparkles, 
  CheckCircle2,
  Building2, 
  Radio,
  Smartphone,
  Flame,
  Zap,
  Clock,
  TrendingUp,
  Bot,
  Play,
  Check,
  Compass,
  FileCheck2,
  Share2
} from 'lucide-react';
import { ActiveTab } from '../components/layout/AppShell';

interface LandingViewProps {
  onNavigate: (tab: ActiveTab) => void;
}

export const LandingView: React.FC<LandingViewProps> = ({ onNavigate }) => {
  // Interactive Live Workforce Simulation on the Landing Page
  const [activeScenario, setActiveScenario] = useState<number>(0);
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [simStep, setSimStep] = useState<number>(4);

  const scenarios = [
    {
      id: 'pothole',
      title: 'P1 Critical Crater — RK Beach Road',
      category: 'Pothole',
      location: 'RK Beach Promenade, Ward 18',
      image: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=600&q=80',
      defectScore: '87cm diameter • 9.2cm depth',
      triage: 'High Kinetic Accident Risk (P1)',
      sla: '4.0 Hours SLA Commitment',
      dept: 'GVMC Engineering & Road Works',
      color: 'rose'
    },
    {
      id: 'water',
      title: 'P2 High Water Main Burst — Gajuwaka Belt',
      category: 'Water Leakage',
      location: 'Kanithi Road, Gajuwaka, Ward 64',
      image: 'https://images.unsplash.com/photo-1584824486509-112e4181ff6b?auto=format&fit=crop&w=600&q=80',
      defectScore: '180 PSI rupture • Road subgrade erosion',
      triage: 'Infrastructure Disruption (P2)',
      sla: '8.0 Hours SLA Commitment',
      dept: 'GVMC Public Health & Water Works',
      color: 'blue'
    },
    {
      id: 'garbage',
      title: 'P3 Medium Commercial Waste — Dwaraka Nagar',
      category: 'Garbage Overflow',
      location: 'RTC Complex Corridor, Ward 26',
      image: 'https://images.unsplash.com/photo-1605600659908-0ef719419d41?auto=format&fit=crop&w=600&q=80',
      defectScore: '1.4 ton overflow • Pedestrian lane obstruction',
      triage: 'Sanitation Cluster Warning (P3)',
      sla: '16.0 Hours SLA Commitment',
      dept: 'GVMC Sanitation & Environmental Health',
      color: 'amber'
    }
  ];

  const currentScenario = scenarios[activeScenario];

  const handleRunSimulation = (idx: number) => {
    setActiveScenario(idx);
    setIsSimulating(true);
    setSimStep(1);

    setTimeout(() => setSimStep(2), 500);
    setTimeout(() => setSimStep(3), 1000);
    setTimeout(() => {
      setSimStep(4);
      setIsSimulating(false);
    }, 1600);
  };

  const agentWorkforce = [
    {
      number: '01',
      name: 'Orchestrator Agent',
      role: 'Master DAG Dispatcher',
      color: 'border-t-4 border-t-blue-600',
      badgeBg: 'bg-blue-50 text-blue-700 border-blue-200',
      icon: Cpu,
      iconColor: 'text-blue-600',
      desc: 'Initializes async workflow state, coordinates parallel agent execution, manages shared context, and tracks SLA targets.',
      latency: '340ms avg latency',
      skills: ['DAG Coordination', 'State Hydration', 'SLA Governance']
    },
    {
      number: '02',
      name: 'Vision Specialist Agent',
      role: 'Computer Vision & Defect Geometry',
      color: 'border-t-4 border-t-sky-500',
      badgeBg: 'bg-sky-50 text-sky-700 border-sky-200',
      icon: Eye,
      iconColor: 'text-sky-600',
      desc: 'Analyzes citizen evidence using Vision Transformers to classify defect type, compute confidence score, and estimate physical cavity dimensions.',
      latency: '780ms avg latency',
      skills: ['ViT Defect Extraction', 'Bounding Geometry', 'Confidence Scoring']
    },
    {
      number: '03',
      name: 'Geospatial Intelligence Agent',
      role: 'Spatial Geofence & Ward Routing',
      color: 'border-t-4 border-t-emerald-600',
      badgeBg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      icon: MapPin,
      iconColor: 'text-emerald-600',
      desc: 'Executes polygon ray-casting against Greater Visakhapatnam operational coordinates and assigns responsible GVMC administrative ward.',
      latency: '290ms avg latency',
      skills: ['Operational Polygon Check', 'Ward Geofence', 'Coordinate Validation']
    },
    {
      number: '04',
      name: 'Kinetic Risk Triage Agent',
      role: 'Hazard Severity & Traffic Danger',
      color: 'border-t-4 border-t-amber-500',
      badgeBg: 'bg-amber-50 text-amber-700 border-amber-200',
      icon: AlertTriangle,
      iconColor: 'text-amber-600',
      desc: 'Cross-examines road classification, arterial vehicular density, and defect geometry to compute dynamic risk rating (P1 to P4).',
      latency: '410ms avg latency',
      skills: ['Traffic Density Analysis', 'Kinetic Danger Index', 'Priority Tiering']
    },
    {
      number: '05',
      name: 'Spatial Correlation Agent',
      role: '50m Deduplication & Hotspot Clusters',
      color: 'border-t-4 border-t-purple-600',
      badgeBg: 'bg-purple-50 text-purple-700 border-purple-200',
      icon: Layers,
      iconColor: 'text-purple-600',
      desc: 'Queries spatial index to identify duplicate reports within 50 meters, merges redundant tickets, and detects emerging sector hotspots.',
      latency: '360ms avg latency',
      skills: ['Haversine Indexing', 'Incident Merging', 'DBSCAN Hotspot Detection']
    },
    {
      number: '06',
      name: 'Autonomous Decision Agent',
      role: 'Multi-Agent Consensus & Rationale',
      color: 'border-t-4 border-t-indigo-600',
      badgeBg: 'bg-indigo-50 text-indigo-700 border-indigo-200',
      icon: ShieldCheck,
      iconColor: 'text-indigo-600',
      desc: 'Fuses multi-agent telemetry into an interpretable audit rationale, assigns GVMC department responsibility, and establishes SLA commitment.',
      latency: '520ms avg latency',
      skills: ['Audit Rationale', 'Department Routing', 'Consensus Verification']
    },
    {
      number: '07',
      name: 'Field Operations & Dispatch',
      role: 'Work Order & Realtime Broadcast',
      color: 'border-t-4 border-t-teal-600',
      badgeBg: 'bg-teal-50 text-teal-700 border-teal-200',
      icon: Activity,
      iconColor: 'text-teal-600',
      desc: 'Generates formal municipal work order ticket, triggers field repair crew assignment, and broadcasts live state update to operations centers.',
      latency: '240ms avg latency',
      skills: ['Work Order Ticket', 'Crew Dispatch', 'WebSocket Telemetry']
    }
  ];

  return (
    <div className="min-h-full pb-24 relative font-sans text-slate-900 select-none overflow-x-hidden">
      {/* GLOWING AURORA MESH BACKGROUND (Subtle, luxury lighting) */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[480px] pointer-events-none overflow-hidden -z-10 opacity-70">
        <div className="absolute -top-24 left-1/4 w-96 h-96 bg-blue-400/20 rounded-full blur-3xl" />
        <div className="absolute top-10 right-1/4 w-96 h-96 bg-indigo-400/15 rounded-full blur-3xl" />
        <div className="absolute top-32 left-1/3 w-80 h-80 bg-emerald-400/15 rounded-full blur-3xl" />
      </div>

      {/* ==================================================================== */}
      {/* 1. HERO SECTION */}
      {/* ==================================================================== */}
      <section className="max-w-6xl mx-auto px-6 pt-12 sm:pt-16 pb-12 relative z-10 text-center">
        {/* PILL BADGE */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-slate-300 shadow-xs mb-6 text-xs font-semibold text-slate-700">
          <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
          <span>Agentic AI Workforce v2.4</span>
          <span className="text-slate-300">•</span>
          <span className="text-blue-700 font-medium">Greater Visakhapatnam Municipal Grid</span>
        </div>

        {/* HERO TITLE */}
        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-slate-900 max-w-4xl mx-auto leading-[1.12]">
          The Autonomous AI Workforce for{' '}
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-700 via-indigo-600 to-emerald-600">
            Civic Infrastructure.
          </span>
        </h1>

        {/* HERO SUBTITLE */}
        <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed mt-5">
          Deploy 7 specialized AI agents to autonomously ingest citizen evidence, evaluate structural defects, validate city geofences, and dispatch certified municipal work orders across Visakhapatnam in near real-time.
        </p>

        {/* HERO ACTION BUTTONS */}
        <div className="flex flex-wrap items-center justify-center gap-3.5 pt-8">
          <button
            onClick={() => onNavigate('command-center')}
            className="px-6 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm flex items-center gap-2.5 shadow-md shadow-blue-500/25 transition-all cursor-pointer hover:scale-[1.02]"
          >
            <span>Launch Command Center</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            onClick={() => onNavigate('citizen-mobile')}
            className="px-6 py-3.5 rounded-xl bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 font-semibold text-sm flex items-center gap-2.5 shadow-xs transition-all cursor-pointer hover:border-blue-600"
          >
            <Smartphone className="w-4 h-4 text-blue-600" />
            <span>Citizen Reporter App</span>
          </button>

          <button
            onClick={() => onNavigate('drone-patrol')}
            className="px-5 py-3.5 rounded-xl bg-slate-900 hover:bg-black text-white font-semibold text-sm flex items-center gap-2 shadow-sm transition-all cursor-pointer hover:scale-[1.02]"
          >
            <Compass className="w-4 h-4 text-sky-400" />
            <span>Drone Aerial Vision</span>
          </button>
        </div>

        {/* LIVE METRICS STRIP */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 mt-12 max-w-4xl mx-auto">
          <div className="p-4 rounded-xl bg-white border border-slate-300 shadow-xs text-left">
            <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Pipeline Latency</div>
            <div className="text-2xl font-bold text-blue-600 mt-0.5 font-mono">&lt; 1.2s</div>
            <div className="text-[11px] text-slate-500 mt-0.5">Near Real-Time Consensus</div>
          </div>

          <div className="p-4 rounded-xl bg-white border border-slate-300 shadow-xs text-left">
            <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Vision Accuracy</div>
            <div className="text-2xl font-bold text-emerald-600 mt-0.5 font-mono">99.4%</div>
            <div className="text-[11px] text-slate-500 mt-0.5">ViT Classification F1</div>
          </div>

          <div className="p-4 rounded-xl bg-white border border-slate-300 shadow-xs text-left">
            <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Deduplication</div>
            <div className="text-2xl font-bold text-indigo-600 mt-0.5 font-mono">50 Meters</div>
            <div className="text-[11px] text-slate-500 mt-0.5">Zero Redundant Dispatch</div>
          </div>

          <div className="p-4 rounded-xl bg-white border border-slate-300 shadow-xs text-left">
            <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">City Coverage</div>
            <div className="text-2xl font-bold text-amber-600 mt-0.5 font-mono">100%</div>
            <div className="text-[11px] text-slate-500 mt-0.5">Greater Visakhapatnam Wards</div>
          </div>
        </div>
      </section>

      {/* ==================================================================== */}
      {/* 2. INTERACTIVE "WORKFORCE IN ACTION" SIMULATION STUDIO */}
      {/* ==================================================================== */}
      <section className="max-w-6xl mx-auto px-6 py-12">
        <div className="rounded-3xl bg-white border border-slate-300 shadow-xl overflow-hidden p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-300">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold text-blue-700 uppercase tracking-wider">
                <Sparkles className="w-4 h-4 text-blue-600" />
                <span>Live Interactive Simulation</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mt-0.5">
                Watch the 7-Agent Workforce Solve a Civic Report
              </h2>
            </div>

            {/* SCENARIO SELECTOR BUTTONS */}
            <div className="flex items-center gap-2 flex-wrap">
              {scenarios.map((sc, idx) => (
                <button
                  key={sc.id}
                  onClick={() => handleRunSimulation(idx)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                    activeScenario === idx
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                  }`}
                >
                  <Play className="w-3 h-3" />
                  <span>Scenario {idx + 1}</span>
                </button>
              ))}
            </div>
          </div>

          {/* SIMULATION WORKSPACE DUAL PANEL */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            {/* EVIDENCE PREVIEW (LEFT 5 COLS) */}
            <div className="lg:col-span-5 space-y-3">
              <div className="rounded-2xl overflow-hidden border border-slate-300 relative h-60 bg-slate-100 shadow-xs">
                <img 
                  src={currentScenario.image} 
                  alt={currentScenario.title} 
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-3 left-3 px-2.5 py-1 rounded-lg bg-black/60 backdrop-blur-md text-white text-[11px] font-semibold flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                  <span>Evidence Ingested</span>
                </div>
                <div className="absolute bottom-3 left-3 right-3 p-2.5 rounded-xl bg-white/95 backdrop-blur-md border border-slate-300 text-xs space-y-0.5 shadow-md">
                  <div className="font-bold text-slate-900">{currentScenario.title}</div>
                  <div className="text-[11px] text-slate-500 font-medium flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-emerald-600" />
                    <span>{currentScenario.location}</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-300">
                  <span className="text-[10px] text-slate-500 font-semibold block uppercase">[VISION ANALYSIS]</span>
                  <span className="font-bold text-slate-800">{currentScenario.defectScore}</span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-300">
                  <span className="text-[10px] text-slate-500 font-semibold block uppercase">[TARGET SLA]</span>
                  <span className="font-bold text-blue-700">{currentScenario.sla}</span>
                </div>
              </div>
            </div>

            {/* AGENT COLLABORATION CHAIN (RIGHT 7 COLS) */}
            <div className="lg:col-span-7 space-y-3 bg-slate-50/70 p-5 rounded-2xl border border-slate-300">
              <div className="flex items-center justify-between text-xs pb-2 border-b border-slate-300">
                <span className="font-bold text-slate-800 flex items-center gap-1.5">
                  <Bot className="w-4 h-4 text-indigo-600" />
                  <span>[AGENT COLLABORATION BUS]</span>
                </span>
                <span className="text-[11px] font-mono text-emerald-600 font-semibold">
                  {isSimulating ? 'Processing...' : '[CONSENSUS REACHED]'}
                </span>
              </div>

              {/* STAGE STEPS */}
              <div className="space-y-2.5">
                {/* Step 1: Orchestrator */}
                <div className={`p-3 rounded-xl border text-xs transition-all flex items-start gap-3 bg-white ${
                  simStep >= 1 ? 'border-blue-300 shadow-xs' : 'opacity-40 border-slate-300'
                }`}>
                  <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold flex-shrink-0">
                    <Cpu className="w-3.5 h-3.5" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900">Orchestrator & Context Bus</span>
                      <span className="text-[10px] font-mono text-blue-700 font-bold">[STG-01 COMPLETE]</span>
                    </div>
                    <p className="text-slate-600 text-[11px] mt-0.5">
                      Ingested GPS payload, initialized DAG, dispatched 4 concurrent worker threads.
                    </p>
                  </div>
                </div>

                {/* Step 2: Vision + Geo */}
                <div className={`p-3 rounded-xl border text-xs transition-all flex items-start gap-3 bg-white ${
                  simStep >= 2 ? 'border-sky-300 shadow-xs' : 'opacity-40 border-slate-300'
                }`}>
                  <div className="w-7 h-7 rounded-lg bg-sky-100 text-sky-700 flex items-center justify-center font-bold flex-shrink-0">
                    <Eye className="w-3.5 h-3.5" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900">Vision & Geo Intelligence</span>
                      <span className="text-[10px] font-mono text-emerald-700 font-bold">[STG-02 COMPLETE]</span>
                    </div>
                    <p className="text-slate-600 text-[11px] mt-0.5">
                      Classified defect as <strong className="text-slate-900">{currentScenario.category}</strong> (99.2% F1). Confirmed within Greater Visakhapatnam operational bounds.
                    </p>
                  </div>
                </div>

                {/* Step 3: Triage & Correlation */}
                <div className={`p-3 rounded-xl border text-xs transition-all flex items-start gap-3 bg-white ${
                  simStep >= 3 ? 'border-amber-300 shadow-xs' : 'opacity-40 border-slate-300'
                }`}>
                  <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center font-bold flex-shrink-0">
                    <AlertTriangle className="w-3.5 h-3.5" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900">Risk Triage & Deduplication</span>
                      <span className="text-[10px] font-mono text-amber-700 font-bold">[STG-03 COMPLETE]</span>
                    </div>
                    <p className="text-slate-600 text-[11px] mt-0.5">
                      Assigned <strong className="text-rose-700">{currentScenario.triage}</strong>. 0 duplicate reports found within 50m radius.
                    </p>
                  </div>
                </div>

                {/* Step 4: Decision & Dispatch */}
                <div className={`p-3 rounded-xl border text-xs transition-all flex items-start gap-3 bg-white ${
                  simStep >= 4 ? 'border-emerald-400 shadow-md ring-2 ring-emerald-100' : 'opacity-40 border-slate-300'
                }`}>
                  <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold flex-shrink-0">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900">Decision & Field Work Order Dispatched</span>
                      <span className="text-[10px] font-mono text-emerald-700 font-bold">[CERTIFIED]</span>
                    </div>
                    <p className="text-slate-600 text-[11px] mt-0.5">
                      Case assigned to <strong className="text-slate-900">{currentScenario.dept}</strong>. Live marker broadcasted to Command Center.
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between">
                <button
                  onClick={() => onNavigate('command-center')}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
                >
                  <span>View in Live Command Center</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>

                <span className="text-[11px] text-slate-500 font-mono">Total DAG Latency: 780ms</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ==================================================================== */}
      {/* 3. THE 7 SPECIALIZED AGENTS (THE AI WORKFORCE GRID) */}
      {/* ==================================================================== */}
      <section className="max-w-6xl mx-auto px-6 py-12">
        <div className="text-center max-w-2xl mx-auto mb-10 space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold">
            <Bot className="w-3.5 h-3.5" />
            <span>Autonomous Workforce Architecture</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Meet the 7 Specialized Civic AI Agents
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
            Each agent operates as an autonomous specialist within a coordinated Directed Acyclic Graph, combining computer vision, spatial clustering, and governance logic.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {agentWorkforce.map((agent) => {
            const Icon = agent.icon;
            return (
              <div 
                key={agent.number}
                className={`p-5 rounded-2xl bg-white border border-slate-300 shadow-xs hover:shadow-lg transition-all duration-200 space-y-3.5 flex flex-col justify-between ${agent.color}`}
              >
                <div className="space-y-3">
                  {/* Top Bar */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-xl bg-slate-50 border border-slate-300 flex items-center justify-center">
                        <Icon className={`w-5 h-5 ${agent.iconColor}`} />
                      </div>
                      <div>
                        <div className="text-xs font-extrabold text-slate-900">{agent.name}</div>
                        <div className="text-[10px] text-slate-500 font-medium">{agent.role}</div>
                      </div>
                    </div>
                    <span className="text-xs font-mono font-bold text-slate-400">#{agent.number}</span>
                  </div>

                  {/* Description */}
                  <p className="text-xs text-slate-600 leading-relaxed font-normal">
                    {agent.desc}
                  </p>
                </div>

                {/* Skills Chips & Latency */}
                <div className="pt-3 border-t border-slate-100 space-y-2.5">
                  <div className="flex flex-wrap gap-1">
                    {agent.skills.map((skill, idx) => (
                      <span 
                        key={idx} 
                        className="text-[10px] px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-medium"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center justify-between text-[11px] pt-1">
                    <span className="text-slate-500 font-mono">{agent.latency}</span>
                    <span className="inline-flex items-center gap-1 text-emerald-600 font-semibold text-[10px]">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      <span>Operational</span>
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ==================================================================== */}
      {/* 4. VISAKHAPATNAM OPERATIONAL GRID SECTORS */}
      {/* ==================================================================== */}
      <section className="max-w-6xl mx-auto px-6 py-12">
        <div className="rounded-3xl bg-white border border-slate-300 p-8 shadow-md">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-300">
            <div>
              <div className="text-xs font-bold text-blue-700 uppercase tracking-wider">Geospatial Corridors</div>
              <h3 className="text-xl font-bold text-slate-900 mt-0.5">
                Precision Municipal Coverage Across Visakhapatnam
              </h3>
            </div>
            <span className="px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 font-semibold text-xs">
              9 Primary Operational Sectors
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 pt-6">
            {[
              { name: 'RK Beach Promenade', type: 'Coastal Zone', tag: 'COASTAL', ward: 'Ward 18' },
              { name: 'Rushikonda Bay', type: 'Tourist Corridor', tag: 'TOURISM', ward: 'Ward 04' },
              { name: 'MVP Colony Hub', type: 'Residential Sector', tag: 'RESIDENTIAL', ward: 'Ward 12' },
              { name: 'Cricket Stadium', type: 'Public Grounds', tag: 'SPORTS', ward: 'Ward 08' },
              { name: 'Andhra University', type: 'Academic Zone', tag: 'CAMPUS', ward: 'Ward 21' },
              { name: 'Dwaraka Nagar', type: 'Commercial Hub', tag: 'TRANSIT', ward: 'Ward 26' },
              { name: 'Gajuwaka Corridor', type: 'Industrial Zone', tag: 'INDUSTRIAL', ward: 'Ward 64' },
              { name: 'Kailasagiri Hill', type: 'Highland Viewpoint', tag: 'ELEVATED', ward: 'Ward 10' },
              { name: 'Port & Harbor', type: 'Maritime District', tag: 'MARITIME', ward: 'Ward 39' },
              { name: 'Madhurawada', type: 'IT & Growth Belt', tag: 'TECH BELT', ward: 'Ward 06' }
            ].map((sector) => (
              <div 
                key={sector.name}
                className="p-3.5 rounded-xl bg-white hover:bg-blue-50/40 border border-slate-300 hover:border-blue-600 transition-all cursor-pointer shadow-xs"
                onClick={() => onNavigate('command-center')}
              >
                <div className="mb-2">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                    [{sector.tag}]
                  </span>
                </div>
                <div className="text-xs font-bold text-slate-900 truncate">{sector.name}</div>
                <div className="text-[10px] text-slate-500 font-medium flex items-center justify-between mt-1">
                  <span>{sector.type}</span>
                  <span className="font-mono text-blue-700 font-semibold">{sector.ward}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ==================================================================== */}
      {/* 5. BOTTOM CALL TO ACTION BANNER */}
      {/* ==================================================================== */}
      <section className="max-w-5xl mx-auto px-6 pt-6 text-center">
        <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-br from-blue-900 via-slate-900 to-indigo-950 text-white shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 space-y-4 max-w-2xl mx-auto">
            <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              Experience the Municipal AI Workforce
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Explore live incident ingestion on the real-world Visakhapatnam map, test the citizen mobile reporting interface, or inspect the 7-agent consensus trace.
            </p>
            <div className="pt-4 flex flex-wrap items-center justify-center gap-3">
              <button
                onClick={() => onNavigate('command-center')}
                className="px-6 py-3 rounded-xl bg-blue-500 hover:bg-blue-400 text-white font-semibold text-xs tracking-normal shadow-lg transition-all cursor-pointer"
              >
                Open Command Operations
              </button>
              <button
                onClick={() => onNavigate('citizen-mobile')}
                className="px-6 py-3 rounded-xl bg-white/10 hover:bg-white/15 text-white border border-white/20 text-xs font-semibold transition-all cursor-pointer"
              >
                Submit Citizen Report
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
