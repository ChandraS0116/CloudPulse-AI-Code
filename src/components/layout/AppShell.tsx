import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Flame, 
  Cpu, 
  BarChart3, 
  TableProperties, 
  Smartphone,
  Search,
  Bell,
  ChevronDown,
  Compass,
  CheckCircle2,
  FilePlus2,
  Database,
  Palette,
  PanelLeftClose,
  PanelLeftOpen,
  Sparkles,
  ShieldCheck,
  Radio,
  Clock,
  Zap,
  Wifi,
  X,
  ArrowUpRight,
  MapPin,
  Activity,
  ShieldAlert,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Wrench,
  Truck,
  Building2,
  Navigation,
  DollarSign,
  Award
} from 'lucide-react';
import { UserProfile, LiveActivityEvent } from '../../types';
import { incidentStore } from '../../services/incidentStore';
import { CitizenMobileView } from '../../views/CitizenMobileView';

export type ActiveTab = 
  | 'landing' 
  | 'command-center' 
  | 'citizen-mobile'
  | 'work-orders'
  | 'ward-intelligence'
  | 'drone-patrol'
  | 'budget-planner'
  | 'report-issue' 
  | 'investigation' 
  | 'hotspots' 
  | 'agents' 
  | 'analytics' 
  | 'incidents' 
  | 'settings';

interface AppShellProps {
  currentTab: ActiveTab;
  onNavigate: (tab: ActiveTab) => void;
  children: React.ReactNode;
}

export type LightThemeCombination = 
  | 'sapphire' 
  | 'emerald' 
  | 'coral' 
  | 'amethyst' 
  | 'amber';

export const AppShell: React.FC<AppShellProps> = ({ currentTab, onNavigate, children }) => {
  const [user, setUser] = useState<UserProfile>(incidentStore.getUser());
  const [demoMode, setDemoMode] = useState<boolean>(incidentStore.isDemoMode());
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);
  const [themeDropdownOpen, setThemeDropdownOpen] = useState(false);
  const [activeTheme, setActiveTheme] = useState<LightThemeCombination>('sapphire');
  const [liveEvents, setLiveEvents] = useState<LiveActivityEvent[]>(incidentStore.getLiveActivity());
  const [searchQuery, setSearchQuery] = useState('');
  const [isSimulatorOpen, setIsSimulatorOpen] = useState<boolean>(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(false);

  const [currentTime, setCurrentTime] = useState<string>('');
  const [searchFocused, setSearchFocused] = useState<boolean>(false);
  const [incidentsList, setIncidentsList] = useState(incidentStore.getIncidents());

  const [zoomLevel, setZoomLevel] = useState<number>(() => {
    const saved = localStorage.getItem('cloudpulse_zoom_level');
    return saved ? parseFloat(saved) : 1.0;
  });
  const [zoomDropdownOpen, setZoomDropdownOpen] = useState(false);

  useEffect(() => {
    (document.documentElement.style as any).zoom = `${zoomLevel * 100}%`;
    localStorage.setItem('cloudpulse_zoom_level', String(zoomLevel));
  }, [zoomLevel]);

  const handleZoomChange = (newZoom: number) => {
    const clamped = Math.max(0.6, Math.min(1.4, Math.round(newZoom * 100) / 100));
    setZoomLevel(clamped);
    (document.documentElement.style as any).zoom = `${clamped * 100}%`;
    localStorage.setItem('cloudpulse_zoom_level', String(clamped));
  };

  const handleAutoDpiFit = () => {
    const dpr = window.devicePixelRatio || 1;
    if (dpr > 1) {
      handleZoomChange(Math.round((1 / dpr) * 100) / 100);
    } else {
      handleZoomChange(1.0);
    }
    setZoomDropdownOpen(false);
  };

  useEffect(() => {
    const unsubscribe = incidentStore.subscribe(() => {
      setUser(incidentStore.getUser());
      setDemoMode(incidentStore.isDemoMode());
      setLiveEvents(incidentStore.getLiveActivity());
      setIncidentsList(incidentStore.getIncidents());
    });
    return unsubscribe;
  }, []);

  // Live IST Clock Timer
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true }));
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  // Cmd+K / Ctrl+K Global Shortcut for Command Search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        const el = document.getElementById('global-command-search');
        el?.focus();
        setSearchFocused(true);
      }
      if (e.key === 'Escape') {
        setSearchFocused(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Initialize light theme from storage
  useEffect(() => {
    const savedTheme = localStorage.getItem('cloudpulse_light_theme') as string;
    let initialTheme: LightThemeCombination = 'sapphire';
    if (savedTheme === 'emerald' || savedTheme === 'aurora-emerald') initialTheme = 'emerald';
    else if (savedTheme === 'coral' || savedTheme === 'sunset-coral') initialTheme = 'coral';
    else if (savedTheme === 'amethyst' || savedTheme === 'quantum-violet') initialTheme = 'amethyst';
    else if (savedTheme === 'amber' || savedTheme === 'solar-amber') initialTheme = 'amber';
    else initialTheme = 'sapphire';

    setActiveTheme(initialTheme);
    document.documentElement.setAttribute('data-theme', initialTheme);

    const savedSidebar = localStorage.getItem('cloudpulse_sidebar_collapsed');
    if (savedSidebar === 'true') setIsSidebarCollapsed(true);
  }, []);

  const handleThemeSelect = (theme: LightThemeCombination) => {
    setActiveTheme(theme);
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('cloudpulse_light_theme', theme);
    setThemeDropdownOpen(false);
  };

  const handleToggleSidebar = () => {
    const nextState = !isSidebarCollapsed;
    setIsSidebarCollapsed(nextState);
    localStorage.setItem('cloudpulse_sidebar_collapsed', String(nextState));
  };

  // Structured Categorized Navigation
  // Role-Based Navigation Filtering (Only respective person/officer sees authorized views)
  const getFilteredNavGroups = (role: UserProfile['role']) => {
    if (role === 'Citizen') {
      return [
        {
          groupTitle: 'Citizen Services',
          items: [
            { id: 'citizen-mobile' as ActiveTab, label: 'Citizen Reporter', icon: Smartphone, badge: 'Mobile App' },
            { id: 'drone-patrol' as ActiveTab, label: 'Drone Aerial Patrol', icon: Navigation, badge: 'Live AI' },
            { id: 'ward-intelligence' as ActiveTab, label: 'Ward Scores & Karma', icon: Award, badge: '98 Wards' },
            { id: 'report-issue' as ActiveTab, label: 'Report Road Defect', icon: FilePlus2, badge: 'Quick Report' },
            { id: 'incidents' as ActiveTab, label: 'Public Status Registry', icon: TableProperties, badge: 'Civic Track' },
            { id: 'landing' as ActiveTab, label: 'Platform Transparency', icon: Compass, badge: 'Public' },
          ]
        }
      ];
    }

    if (role === 'Field Operator') {
      return [
        {
          groupTitle: 'Field Dispatch Operations',
          items: [
            { id: 'work-orders' as ActiveTab, label: 'Work Orders & Fleet', icon: Wrench, badge: 'Dispatch' },
            { id: 'command-center' as ActiveTab, label: 'Work Orders & Map', icon: LayoutDashboard, badge: 'Assigned' },
            { id: 'drone-patrol' as ActiveTab, label: 'Drone Road Patrol', icon: Navigation, badge: 'Aerial AI' },
            { id: 'incidents' as ActiveTab, label: 'Assigned Incidents', icon: TableProperties, badge: 'Tasks' },
            { id: 'hotspots' as ActiveTab, label: 'Spatial Hazard Zones', icon: Flame, badge: 'Hotspots' },
            { id: 'report-issue' as ActiveTab, label: 'Field Damage Log', icon: FilePlus2 },
          ]
        },
        {
          groupTitle: 'Public & City Services',
          items: [
            { id: 'citizen-mobile' as ActiveTab, label: 'Citizen View Test', icon: Smartphone },
            { id: 'ward-intelligence' as ActiveTab, label: 'Ward Intelligence', icon: Building2 },
            { id: 'landing' as ActiveTab, label: 'Platform Overview', icon: Compass },
          ]
        }
      ];
    }

    // Default: Command Administrator has full unrestricted access
    return [
      {
        groupTitle: 'Core Operations',
        items: [
          { id: 'command-center' as ActiveTab, label: 'Command Operations', icon: LayoutDashboard, badge: 'Live' },
          { id: 'work-orders' as ActiveTab, label: 'Work Orders & Fleet', icon: Wrench, badge: 'BOQ Dispatch' },
          { id: 'citizen-mobile' as ActiveTab, label: 'Citizen Reporter', icon: Smartphone, badge: 'App' },
          { id: 'landing' as ActiveTab, label: 'Platform Overview', icon: Compass, badge: 'Web' },
        ]
      },
      {
        groupTitle: 'AI & Drone Intelligence',
        items: [
          { id: 'agents' as ActiveTab, label: 'AI Agent Workforce', icon: Cpu, badge: '7 DAG' },
          { id: 'drone-patrol' as ActiveTab, label: 'Drone Patrol & Vision', icon: Navigation, badge: 'Aerial AI' },
          { id: 'hotspots' as ActiveTab, label: 'Spatial Hotspots', icon: Flame, badge: 'Clusters' },
          { id: 'report-issue' as ActiveTab, label: 'Submit Incident', icon: FilePlus2 },
        ]
      },
      {
        groupTitle: 'City, Wards & Finance',
        items: [
          { id: 'ward-intelligence' as ActiveTab, label: 'Ward Intelligence', icon: Building2, badge: '98 Wards' },
          { id: 'budget-planner' as ActiveTab, label: 'Budget & Planning', icon: DollarSign, badge: 'Finance' },
          { id: 'incidents' as ActiveTab, label: 'Incident Records', icon: TableProperties },
          { id: 'analytics' as ActiveTab, label: 'Analytics & KPIs', icon: BarChart3 },
          { id: 'settings' as ActiveTab, label: 'System Architecture', icon: Database },
        ]
      }
    ];
  };

  const navigationGroups = getFilteredNavGroups(user.role);

  const themeOptions: { id: LightThemeCombination; name: string; tag: string; dot: string; glow: string }[] = [
    { 
      id: 'sapphire', 
      name: 'Ocean Sapphire & White', 
      tag: 'Classic Executive • Royal Blue on Crisp White', 
      dot: 'bg-blue-600',
      glow: 'shadow-blue-500/25'
    },
    { 
      id: 'emerald', 
      name: 'Emerald Meadow & White', 
      tag: 'Eco-Smart Coastal • Deep Green on Crisp White', 
      dot: 'bg-emerald-600',
      glow: 'shadow-emerald-500/25'
    },
    { 
      id: 'coral', 
      name: 'Crimson Ruby & White', 
      tag: 'High-Contrast Civic • Bold Crimson on Clean White', 
      dot: 'bg-rose-700',
      glow: 'shadow-rose-600/30'
    },
    { 
      id: 'amethyst', 
      name: 'Royal Amethyst & White', 
      tag: 'Quantum Computing • Violet on Pearl White', 
      dot: 'bg-purple-600',
      glow: 'shadow-purple-500/25'
    },
    { 
      id: 'amber', 
      name: 'Amber Honey & White', 
      tag: 'Precision Aerospace • Golden Amber on Warm White', 
      dot: 'bg-amber-600',
      glow: 'shadow-amber-500/25'
    },
  ];

  const handleRoleChange = (role: UserProfile['role']) => {
    incidentStore.setUserRole(role);
    setRoleDropdownOpen(false);

    // Automatically navigate to an authorized view when switching role
    if (role === 'Citizen') {
      if (currentTab === 'command-center' || currentTab === 'agents' || currentTab === 'settings' || currentTab === 'analytics') {
        onNavigate('citizen-mobile');
      }
    } else if (role === 'Field Operator') {
      if (currentTab === 'agents' || currentTab === 'settings') {
        onNavigate('command-center');
      }
    }
  };

  // Human-readable titles for current view
  const currentViewTitleMap: Record<ActiveTab, { title: string; subtitle: string }> = {
    'command-center': { title: 'Command Operations', subtitle: 'Live Municipal Grid • Visakhapatnam' },
    'work-orders': { title: 'Work Orders & Fleet', subtitle: 'BOQ Material Estimation • Crew Dispatch • AI Verification' },
    'ward-intelligence': { title: 'Ward Intelligence & Scores', subtitle: 'Visakhapatnam 98-Ward Directory • Civic Karma Leaderboard' },
    'drone-patrol': { title: 'Drone Patrol & Vision Lab', subtitle: 'Autonomous Aerial Corridor Surveillance • IRC PCI Analytics' },
    'budget-planner': { title: 'Budget & Infrastructure Planning', subtitle: 'Capital Finance • Monsoon Risk Simulation • GIS Exports' },
    'citizen-mobile': { title: 'Citizen Reporter', subtitle: 'Mobile Reporting Interface • GVMC' },
    'landing': { title: 'Platform Overview', subtitle: 'Workforce AI Platform • 7 Autonomous Agents' },
    'agents': { title: 'Agent Intelligence', subtitle: '7-Agent DAG Consensus Architecture' },
    'hotspots': { title: 'Spatial Hotspots', subtitle: 'Density Clustering & Anomaly Zones' },
    'report-issue': { title: 'Submit Incident', subtitle: 'Civilian Infrastructure Ingestion' },
    'incidents': { title: 'Incident Records', subtitle: 'Historical Registry & Audit Traces' },
    'analytics': { title: 'Analytics & KPIs', subtitle: 'Municipal Performance & Resolution Metrics' },
    'settings': { title: 'System Architecture', subtitle: 'Realtime WebSocket & Vizag Geofence' },
    'investigation': { title: 'Investigation Mode', subtitle: 'Forensic Multi-Agent Trace' },
  };

  const currentViewInfo = currentViewTitleMap[currentTab] || { title: 'CloudPulse AI', subtitle: 'Municipal Operations' };

  return (
    <div className="flex h-screen w-screen overflow-hidden font-sans antialiased select-none" style={{ backgroundColor: 'var(--canvas)' }}>
      {/* SIDEBAR NAVIGATION (CLEAN, HIGH-CONTRAST LIGHT THEME) */}
      <aside 
        style={{ backgroundColor: 'var(--sidebar-bg)', borderColor: 'var(--sidebar-border)' }}
        className={`flex-shrink-0 border-r flex flex-col justify-between z-30 shadow-sm transition-all duration-200 ${
          isSidebarCollapsed ? 'w-18' : 'w-60'
        }`}
      >
        {/* BRAND LOGO & COLLAPSE TOGGLE */}
        <div style={{ borderColor: 'var(--sidebar-border)' }} className="p-4 border-b flex items-center justify-between">
          <div 
            onClick={() => onNavigate('landing')}
            className={`flex items-center gap-2.5 cursor-pointer group ${isSidebarCollapsed ? 'justify-center w-full' : ''}`}
            title="CloudPulse AI — Visakhapatnam Municipal Grid"
          >
            <div 
              style={{ backgroundColor: 'var(--theme-primary)' }}
              className="w-8 h-8 rounded-xl text-white flex items-center justify-center shadow-md group-hover:scale-105 transition-transform flex-shrink-0"
            >
              <Compass className="w-4 h-4 text-white" />
            </div>
            {!isSidebarCollapsed && (
              <div>
                <div style={{ color: 'var(--text-main)' }} className="text-sm font-bold tracking-tight flex items-center gap-1.5">
                  <span>CloudPulse</span>
                  <span 
                    style={{ color: 'var(--theme-primary)', borderColor: 'var(--theme-primary-border)', backgroundColor: 'var(--theme-primary-subtle)' }}
                    className="text-[10px] font-bold font-mono px-1.5 py-0.5 rounded border"
                  >
                    VIZAG
                  </span>
                </div>
                <div style={{ color: 'var(--text-muted)' }} className="text-[10px]">Municipal AI Workforce</div>
              </div>
            )}
          </div>
        </div>

        {/* STRUCTURED NAVIGATION GROUPS */}
        <nav className="flex-1 px-2.5 py-3 space-y-4 overflow-y-auto">
          {navigationGroups.map((group, gIdx) => (
            <div key={gIdx} className="space-y-1">
              {!isSidebarCollapsed && (
                <div style={{ color: 'var(--text-muted)' }} className="px-3 pb-1 text-[10px] font-bold uppercase tracking-wider">
                  {group.groupTitle}
                </div>
              )}
              {group.items.map(item => {
                const Icon = item.icon;
                const isActive = currentTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => onNavigate(item.id)}
                    style={
                      isActive 
                        ? { backgroundColor: 'var(--sidebar-active-bg)', color: 'var(--sidebar-active-text)' }
                        : { color: 'var(--text-secondary)' }
                    }
                    className={`w-full flex items-center ${isSidebarCollapsed ? 'justify-center p-2.5' : 'justify-between px-3 py-2'} rounded-xl text-xs font-semibold transition-all group cursor-pointer ${
                      isActive 
                        ? 'shadow-xs' 
                        : 'hover:bg-slate-100 hover:text-slate-900'
                    }`}
                    title={isSidebarCollapsed ? item.label : undefined}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className={`w-4 h-4 flex-shrink-0 transition-colors ${isActive ? 'text-inherit' : 'text-slate-500 group-hover:text-slate-900'}`} />
                      {!isSidebarCollapsed && <span className="truncate">{item.label}</span>}
                    </div>
                    {!isSidebarCollapsed && item.badge && (
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${
                        isActive 
                          ? 'bg-white/25 text-white' 
                          : 'bg-slate-100 text-slate-600'
                      }`}>
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          ))}
        </nav>

        {/* BOTTOM STATUS & COLLAPSE TOGGLE */}
        <div style={{ borderColor: 'var(--sidebar-border)' }} className="p-3 border-t space-y-2">
          {!isSidebarCollapsed ? (
            <div style={{ backgroundColor: 'var(--surface-subtle)', borderColor: 'var(--border-subtle)' }} className="flex items-center justify-between px-3 py-2 rounded-xl border text-xs">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span style={{ color: 'var(--text-main)' }} className="text-xs font-semibold">Vizag Grid Active</span>
              </div>
              <span style={{ color: 'var(--theme-primary)' }} className="text-[11px] font-bold">7 Agents</span>
            </div>
          ) : (
            <div className="flex justify-center py-1" title="Vizag Grid Active (7 Agents)">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            </div>
          )}
        </div>
      </aside>

      {/* MAIN VIEWPORT CONTAINER */}
      <div style={{ backgroundColor: 'var(--canvas)' }} className="flex-1 flex flex-col h-full overflow-hidden transition-colors duration-200">
        
        {/* TOP COMMAND & NAVIGATION HEADER */}
        <header 
          style={{ backgroundColor: 'var(--header-bg)', borderColor: 'var(--header-border)' }}
          className="h-16 min-h-16 flex-shrink-0 border-b px-3 sm:px-6 flex items-center justify-between z-20 transition-colors duration-200 shadow-xs gap-3"
        >
          {/* LEFT: SIDEBAR TOGGLE & BREADCRUMB TITLE */}
          <div className="flex items-center gap-2.5 sm:gap-3 flex-shrink-0 min-w-0">
            <button
              onClick={handleToggleSidebar}
              className="p-2 rounded-xl hover:bg-slate-100 border border-slate-300 text-slate-700 hover:text-slate-900 transition-all cursor-pointer shadow-xs flex-shrink-0"
              title={isSidebarCollapsed ? 'Expand Navigation Sidebar' : 'Collapse Sidebar'}
            >
              {isSidebarCollapsed ? <PanelLeftOpen className="w-4 h-4" /> : <PanelLeftClose className="w-4 h-4" />}
            </button>

            <div className="flex flex-col justify-center min-w-0">
              <div className="flex items-center gap-2">
                <h1 style={{ color: 'var(--text-main)' }} className="text-sm sm:text-base font-extrabold tracking-tight whitespace-nowrap leading-tight">
                  {currentViewInfo.title}
                </h1>
                <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-extrabold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-300 tracking-wider whitespace-nowrap flex-shrink-0">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span>[ONLINE]</span>
                </span>
              </div>
              <p style={{ color: 'var(--text-muted)' }} className="text-xs text-slate-500 leading-tight hidden sm:block whitespace-nowrap truncate max-w-[200px] md:max-w-xs xl:max-w-sm mt-0.5">
                {currentViewInfo.subtitle}
              </p>
            </div>
          </div>

          {/* CENTER: CLEAN MUNICIPAL STATUS BADGE (UNCLUTTERED, RESPONSIVE) */}
          <div className="hidden xl:flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100/90 border border-slate-300 text-xs shadow-2xs flex-shrink-0">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-bold text-slate-900 text-xs whitespace-nowrap">GVMC Operations Grid</span>
            <span className="text-slate-300 hidden 2xl:inline">•</span>
            <span className="text-slate-600 text-[11px] font-extrabold uppercase tracking-wider hidden 2xl:inline whitespace-nowrap">[SYSTEM STATUS: 7 AGENTS ONLINE]</span>
          </div>

          {/* RIGHT ACTION CONTROLS */}
          <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
            {/* REAL-TIME LIVE CLOCK */}
            <div 
              className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-300 text-xs text-slate-900 font-mono font-bold shadow-2xs whitespace-nowrap flex-shrink-0"
              title="Real-Time Clock"
            >
              <Clock className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />
              <span>{currentTime || '12:00:00 PM'}</span>
            </div>

            {/* SEARCH BAR ICON AT TOP RIGHT CORNER */}
            <button
              onClick={() => setSearchFocused(true)}
              className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-300 text-slate-700 hover:text-slate-900 transition-all cursor-pointer shadow-2xs text-xs font-bold whitespace-nowrap flex-shrink-0"
              title="Search incidents, localities, wards... (⌘K)"
            >
              <Search className="w-3.5 h-3.5 text-slate-600 flex-shrink-0" />
              <span className="hidden xl:inline font-bold text-slate-800">Search</span>
              <kbd className="hidden 2xl:inline-block px-1.5 py-0.2 rounded bg-white border border-slate-300 text-[10px] font-mono text-slate-500">⌘K</kbd>
            </button>

            {/* INTERACTIVE ZOOM / UI SCALE CONTROLLER */}
            <div className="relative flex-shrink-0">
              <div 
                className="flex items-center rounded-xl bg-slate-50 border border-slate-300 p-0.5 text-xs shadow-2xs flex-shrink-0"
                title="Application Zoom Scale (Ctrl+0 to reset browser zoom)"
              >
                <button
                  onClick={() => handleZoomChange(zoomLevel - 0.1)}
                  disabled={zoomLevel <= 0.6}
                  className="p-1 rounded-lg hover:bg-slate-200 text-slate-700 hover:text-slate-900 transition-colors disabled:opacity-30 cursor-pointer"
                  title="Zoom Out (-10%)"
                >
                  <ZoomOut className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setZoomDropdownOpen(!zoomDropdownOpen)}
                  className="px-2 py-0.5 font-bold font-mono text-[11px] text-slate-900 hover:bg-slate-200/60 rounded-md transition-colors flex items-center gap-1 cursor-pointer"
                  title="Zoom presets & screen fitting"
                >
                  <span>{Math.round(zoomLevel * 100)}%</span>
                  <ChevronDown className="w-2.5 h-2.5 text-slate-500" />
                </button>
                <button
                  onClick={() => handleZoomChange(zoomLevel + 0.1)}
                  disabled={zoomLevel >= 1.4}
                  className="p-1 rounded-lg hover:bg-slate-200 text-slate-700 hover:text-slate-900 transition-colors disabled:opacity-30 cursor-pointer"
                  title="Zoom In (+10%)"
                >
                  <ZoomIn className="w-3.5 h-3.5" />
                </button>
              </div>

              {zoomDropdownOpen && (
                <div 
                  style={{ backgroundColor: '#ffffff', borderColor: 'var(--border-strong)' }}
                  className="absolute right-0 mt-2 w-64 rounded-2xl border shadow-xl p-2 z-50 animate-fadeIn"
                >
                  <div 
                    style={{ borderColor: 'var(--border-subtle)', color: 'var(--text-muted)' }}
                    className="px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider border-b mb-1 flex items-center justify-between"
                  >
                    <span>Display Zoom</span>
                    <span className="text-[10px] font-mono font-bold text-blue-600">{Math.round(zoomLevel * 100)}%</span>
                  </div>

                  <div className="space-y-1">
                    {[
                      { val: 1.0, label: '100% (Standard Scale)', desc: 'Default true 1:1 web zoom' },
                      { val: 0.9, label: '90% (Executive Compact)', desc: 'Balanced for medium screens' },
                      { val: 0.8, label: '80% (Fitted 1080p)', desc: 'Ideal for Windows 125% DPI' },
                      { val: 0.75, label: '75% (Wide Overview)', desc: 'High-density multi-panel' }
                    ].map(preset => (
                      <button
                        key={preset.val}
                        onClick={() => {
                          handleZoomChange(preset.val);
                          setZoomDropdownOpen(false);
                        }}
                        className={`w-full text-left p-2 rounded-xl text-xs flex items-center justify-between transition-colors cursor-pointer ${
                          Math.abs(zoomLevel - preset.val) < 0.01 
                            ? 'bg-blue-50 text-blue-900 font-bold border border-blue-200' 
                            : 'hover:bg-slate-50 text-slate-700'
                        }`}
                      >
                        <div>
                          <div className="font-bold">{preset.label}</div>
                          <div className="text-[10px] text-slate-500 font-medium">{preset.desc}</div>
                        </div>
                        {Math.abs(zoomLevel - preset.val) < 0.01 && (
                          <CheckCircle2 className="w-4 h-4 text-blue-600 flex-shrink-0" />
                        )}
                      </button>
                    ))}

                    <div className="pt-1 mt-1 border-t border-slate-200 space-y-1">
                      <button
                        onClick={handleAutoDpiFit}
                        className="w-full text-left p-2 rounded-xl text-xs flex items-center justify-between hover:bg-slate-50 text-slate-700 transition-colors cursor-pointer"
                      >
                        <div className="flex items-center gap-2">
                          <RotateCcw className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />
                          <div>
                            <div className="font-bold text-slate-900">Auto-Fit to Display DPI</div>
                            <div className="text-[10px] text-slate-500">Detects {Math.round((window.devicePixelRatio || 1) * 100)}% Windows scaling</div>
                          </div>
                        </div>
                      </button>

                      <div className="p-2 rounded-lg bg-slate-50 text-[10px] text-slate-500 border border-slate-200">
                        <span className="font-bold text-slate-700">Tip:</span> Press <kbd className="px-1 py-0.5 rounded bg-white border border-slate-300 font-mono font-bold text-slate-700">Ctrl + 0</kbd> in your browser to reset browser-level zoom.
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* LIGHT THEME COMBINATIONS SELECTOR */}
            <div className="relative flex-shrink-0">
              <button
                onClick={() => setThemeDropdownOpen(!themeDropdownOpen)}
                style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border-subtle)', color: 'var(--text-main)' }}
                className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 rounded-xl border text-xs font-bold shadow-xs transition-all cursor-pointer hover:border-[var(--border-strong)] whitespace-nowrap"
                title="Select Light Color Theme Combination"
              >
                <Palette className="w-3.5 h-3.5 flex-shrink-0" style={{ color: 'var(--theme-primary)' }} />
                <span className="hidden 2xl:inline font-bold whitespace-nowrap">
                  {themeOptions.find(t => t.id === activeTheme)?.name || 'Ocean Sapphire & White'}
                </span>
                <ChevronDown className="w-3 h-3 text-slate-400 flex-shrink-0" />
              </button>

              {themeDropdownOpen && (
                <div 
                  style={{ backgroundColor: '#ffffff', borderColor: 'var(--border-strong)' }}
                  className="absolute right-0 mt-2 w-80 rounded-2xl border shadow-xl p-2 z-50 animate-fadeIn"
                >
                  <div 
                    style={{ borderColor: 'var(--border-subtle)', color: 'var(--text-muted)' }}
                    className="px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider border-b mb-1 flex items-center justify-between"
                  >
                    <span>Light Color Themes</span>
                    <span className="text-[10px] font-mono lowercase">High Contrast</span>
                  </div>
                  <div className="space-y-1">
                    {themeOptions.map(th => {
                      const isSelected = activeTheme === th.id;
                      return (
                        <button
                          key={th.id}
                          onClick={() => handleThemeSelect(th.id)}
                          style={{
                            backgroundColor: isSelected ? 'var(--theme-primary-subtle)' : 'transparent',
                            borderColor: isSelected ? 'var(--theme-primary-border)' : 'transparent',
                            color: 'var(--text-main)'
                          }}
                          className={`w-full text-left p-2.5 rounded-xl text-xs flex items-center justify-between border transition-all cursor-pointer ${
                            !isSelected ? 'hover:bg-slate-50' : ''
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <span className={`w-3.5 h-3.5 rounded-full ${th.dot} ${th.glow} shadow-sm flex-shrink-0`} />
                            <div>
                              <div className="font-bold">{th.name}</div>
                              <div style={{ color: 'var(--text-muted)' }} className="text-[10px] font-medium">{th.tag}</div>
                            </div>
                          </div>
                          {isSelected && <CheckCircle2 className="w-4 h-4 flex-shrink-0" style={{ color: 'var(--theme-primary)' }} />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* SIDE-BY-SIDE PHONE SIMULATOR TOGGLE */}
            <button
              onClick={() => setIsSimulatorOpen(!isSimulatorOpen)}
              style={isSimulatorOpen ? {
                backgroundColor: 'var(--theme-primary)',
                borderColor: 'var(--theme-primary)',
                color: '#ffffff'
              } : {
                backgroundColor: 'var(--surface)',
                borderColor: 'var(--border-subtle)',
                color: 'var(--text-main)'
              }}
              className="px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-2 transition-all cursor-pointer shadow-xs hover:border-[var(--border-strong)]"
              title="Toggle Side-by-Side Citizen Phone View"
            >
              <Smartphone className="w-3.5 h-3.5" style={{ color: isSimulatorOpen ? '#ffffff' : 'var(--theme-primary)' }} />
              <span className="hidden sm:inline">{isSimulatorOpen ? 'Close Phone' : 'Phone'}</span>
            </button>

            {/* NOTIFICATIONS DROPDOWN */}
            <div className="relative">
              <button 
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border-subtle)', color: 'var(--text-main)' }}
                className="relative p-2 rounded-xl border shadow-xs transition-all cursor-pointer hover:border-[var(--border-strong)]"
                title="Activity Feed"
              >
                <Bell className="w-4 h-4 text-slate-700" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full" style={{ backgroundColor: 'var(--theme-primary)' }}></span>
              </button>

              {notificationsOpen && (
                <div 
                  style={{ backgroundColor: '#ffffff', borderColor: 'var(--border-strong)' }}
                  className="absolute right-0 mt-2 w-80 rounded-2xl border shadow-xl p-3 z-50 animate-fadeIn"
                >
                  <div style={{ borderColor: 'var(--border-subtle)' }} className="flex items-center justify-between pb-2 border-b">
                    <span style={{ color: 'var(--text-main)' }} className="text-xs font-bold">Activity Log</span>
                    <span style={{ color: 'var(--text-muted)' }} className="text-[11px]">Realtime Feed</span>
                  </div>
                  <div className="mt-2 space-y-1.5 max-h-64 overflow-y-auto pr-1">
                    {liveEvents.slice(0, 5).map(ev => (
                      <div 
                        key={ev.id} 
                        style={{ backgroundColor: 'var(--surface-subtle)', borderColor: 'var(--border-subtle)' }}
                        className="p-2.5 rounded-xl border text-xs"
                      >
                        <div className="flex items-center justify-between text-[10px]">
                          <span className="font-bold" style={{ color: 'var(--theme-primary)' }}>{ev.agent}</span>
                          <span style={{ color: 'var(--text-muted)' }}>{ev.timeDisplay}</span>
                        </div>
                        <p style={{ color: 'var(--text-main)' }} className="mt-0.5 leading-snug font-medium">{ev.message}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* USER PERSONA SWITCHER */}
            <div className="relative flex-shrink-0">
              <button 
                onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
                style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border-subtle)', color: 'var(--text-main)' }}
                className="flex items-center gap-2 px-2.5 sm:px-3 py-1.5 rounded-xl border text-xs shadow-xs transition-all cursor-pointer hover:border-[var(--border-strong)] whitespace-nowrap"
                title={`Logged in as ${user.name} (${user.role})`}
              >
                <div 
                  style={{ backgroundColor: 'var(--theme-primary-subtle)', borderColor: 'var(--theme-primary-border)', color: 'var(--theme-primary)' }}
                  className="w-6 h-6 rounded-full border flex items-center justify-center text-[10px] font-bold flex-shrink-0"
                >
                  {user.role === 'Citizen' ? 'CZ' : user.role === 'Field Operator' ? 'OP' : 'AD'}
                </div>
                <div className="text-left hidden lg:block whitespace-nowrap">
                  <div style={{ color: 'var(--text-main)' }} className="text-xs font-bold leading-tight whitespace-nowrap">{user.name}</div>
                  <div style={{ color: 'var(--text-muted)' }} className="text-[10px] whitespace-nowrap leading-tight">{user.role}</div>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
              </button>

              {roleDropdownOpen && (
                <div 
                  style={{ backgroundColor: '#ffffff', borderColor: 'var(--border-strong)' }}
                  className="absolute right-0 mt-2 w-52 rounded-2xl border shadow-xl p-1.5 z-50 animate-fadeIn"
                >
                  <div style={{ borderColor: 'var(--border-subtle)', color: 'var(--text-muted)' }} className="px-2.5 py-1 text-[11px] font-bold border-b mb-1">
                    Access Persona
                  </div>
                  {(['Citizen', 'Field Operator', 'Command Administrator'] as UserProfile['role'][]).map(role => (
                    <button
                      key={role}
                      onClick={() => handleRoleChange(role)}
                      style={{
                        backgroundColor: user.role === role ? 'var(--theme-primary-subtle)' : 'transparent',
                        color: user.role === role ? 'var(--theme-primary)' : 'var(--text-main)'
                      }}
                      className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs flex items-center justify-between transition-all cursor-pointer hover:bg-slate-50"
                    >
                      <span className={user.role === role ? 'font-bold' : ''}>{role}</span>
                      {user.role === role && <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" style={{ color: 'var(--theme-primary)' }} />}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </header>

        {/* CENTERED COMMAND PALETTE SEARCH MODAL (TRIGGERED BY TOP-RIGHT SEARCH ICON OR ⌘K) */}
        {searchFocused && (
          <div 
            className="fixed inset-0 z-50 flex items-start justify-center pt-24 p-4 bg-slate-900/40 backdrop-blur-xs animate-fadeIn font-sans"
            onClick={() => setSearchFocused(false)}
          >
            <div 
              className="bg-white rounded-xl border border-slate-300 shadow-2xl max-w-xl w-full p-4 space-y-3 animate-scaleUp text-xs"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-2.5 bg-slate-100/90 rounded-xl border border-slate-300 px-3.5 py-2.5">
                <Search className="w-4 h-4 text-slate-500 flex-shrink-0" />
                <input
                  id="global-command-search"
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by incident #ID, locality (e.g. MVP Colony), category, or ward..."
                  className="w-full bg-transparent text-xs text-slate-900 placeholder-slate-400 focus:outline-none font-bold"
                  autoFocus
                />
                {searchQuery && (
                  <button 
                    onClick={() => setSearchQuery('')} 
                    className="p-1 text-slate-400 hover:text-slate-700 cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
                <kbd className="px-1.5 py-0.5 rounded-md bg-white border border-slate-300 text-[10px] font-mono font-bold text-slate-500 shadow-2xs select-none">
                  ESC
                </kbd>
              </div>

              {/* SEARCH RESULTS LIST */}
              <div className="max-h-72 overflow-y-auto space-y-1 pr-1">
                <div className="px-2 py-1 text-[11px] font-extrabold text-slate-500 uppercase tracking-wider border-b border-slate-300 flex items-center justify-between">
                  <span>{searchQuery.trim() ? '[MATCHING RECORDS]' : '[ACTIVE VISAKHAPATNAM INCIDENTS]'}</span>
                  <span className="text-slate-500 font-mono text-[10px]">[JUMP DIRECTLY TO MAP]</span>
                </div>

                {incidentsList
                  .filter(i => 
                    !searchQuery.trim() ||
                    i.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    i.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    i.locality.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    i.address.toLowerCase().includes(searchQuery.toLowerCase())
                  )
                  .slice(0, 6)
                  .map(inc => (
                    <div
                      key={inc.id}
                      onClick={() => {
                        incidentStore.setSelectedIncident(inc);
                        onNavigate('command-center');
                        setSearchFocused(false);
                        setSearchQuery('');
                      }}
                      className="p-2.5 rounded-xl hover:bg-slate-50 flex items-center justify-between cursor-pointer transition-colors border border-transparent hover:border-slate-300"
                    >
                      <div className="flex items-center gap-2.5">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                          inc.priority === 'P1' ? 'bg-rose-50 text-rose-700 border border-rose-200' :
                          inc.priority === 'P2' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                          'bg-blue-50 text-blue-700 border border-blue-200'
                        }`}>
                          {inc.priority}
                        </span>
                        <div>
                          <div className="font-bold text-slate-900 flex items-center gap-1.5">
                            <span className="font-mono text-blue-700">#{inc.id}</span>
                            <span className="text-slate-300">•</span>
                            <span>{inc.category}</span>
                          </div>
                          <div className="text-[11px] text-slate-500 font-medium">
                            {inc.locality} ({inc.ward || 'GVMC Zone'})
                          </div>
                        </div>
                      </div>
                      <span className="text-[11px] text-blue-600 font-bold flex items-center gap-1">
                        View on Map <ArrowUpRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        )}

        {/* DYNAMIC VIEW CONTENT */}
        <main className="flex-1 overflow-hidden relative flex" style={{ backgroundColor: 'var(--canvas)' }}>
          {/* PRIMARY WORKSPACE VIEW */}
          <div className={`h-full overflow-y-auto transition-all ${
            isSimulatorOpen ? 'w-full lg:w-[62%] xl:w-[68%]' : 'w-full'
          }`}>
            {user.role === 'Citizen' && (currentTab === 'command-center' || currentTab === 'agents' || currentTab === 'settings' || currentTab === 'analytics') ? (
              <div className="h-full flex items-center justify-center p-6 text-center font-sans animate-fadeIn">
                <div className="max-w-md w-full bg-white p-7 rounded-2xl border border-slate-300 shadow-xl space-y-4">
                  <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 mx-auto flex items-center justify-center shadow-xs">
                    <ShieldAlert className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-base font-black text-slate-900">Restricted Operational Console</h2>
                    <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                      This operational module is reserved for Municipal Operations Officers. You are currently logged in with <strong>Citizen Persona</strong> ({user.name}).
                    </p>
                  </div>
                  <div className="pt-2 space-y-2">
                    <button
                      onClick={() => onNavigate('citizen-mobile')}
                      className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition-all cursor-pointer shadow-xs"
                    >
                      Go to Citizen Reporter Portal
                    </button>
                    <button
                      onClick={() => handleRoleChange('Command Administrator')}
                      className="w-full py-2 px-4 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-300 font-bold text-xs transition-all cursor-pointer"
                    >
                      Switch to Command Administrator
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              children
            )}
          </div>

          {/* DOCKED PHONE SIMULATOR DRAWER (IF OPEN) */}
          {isSimulatorOpen && (
            <div className="hidden lg:flex w-[38%] xl:w-[32%] h-full border-l border-slate-300 bg-white/90 backdrop-blur-xl flex-col items-center justify-center p-4 relative z-20 shadow-xl animate-fadeIn">
              <div className="w-full max-w-[370px] h-[780px] max-h-[96%] rounded-[44px] border-[6px] border-slate-800 bg-slate-900 shadow-2xl overflow-hidden relative flex flex-col">
                {/* IPHONE NOTCH / DYNAMIC ISLAND */}
                <div className="w-full h-7 bg-slate-900 flex items-center justify-center relative flex-shrink-0 z-30">
                  <div className="w-24 h-4 bg-black rounded-full flex items-center justify-end px-2">
                    <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                  </div>
                </div>

                {/* CITIZEN MOBILE APP EMBED */}
                <div className="flex-1 w-full overflow-y-auto bg-white">
                  <CitizenMobileView isPhoneSimulator={true} />
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};
