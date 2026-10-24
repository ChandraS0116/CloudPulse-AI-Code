import React, { useState } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  Sparkles, 
  Clock, 
  CheckCircle2, 
  Layers, 
  Cpu, 
  Filter,
  Calendar,
  AlertTriangle
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  CartesianGrid
} from 'recharts';

export const AnalyticsView: React.FC = () => {
  const [timeRange, setTimeRange] = useState<'7D' | '30D' | '90D'>('7D');

  // Realistic time-series data
  const reportVolumeData = [
    { day: 'Mon', reports: 142, resolved: 130, critical: 18 },
    { day: 'Tue', reports: 189, resolved: 165, critical: 24 },
    { day: 'Wed', reports: 168, resolved: 158, critical: 19 },
    { day: 'Thu', reports: 245, resolved: 210, critical: 32 },
    { day: 'Fri', reports: 290, resolved: 260, critical: 41 },
    { day: 'Sat', reports: 215, resolved: 195, critical: 25 },
    { day: 'Sun', reports: 178, resolved: 172, critical: 16 },
  ];

  // Category distribution
  const categoryData = [
    { name: 'Potholes', count: 542, color: '#2563eb' },
    { name: 'Water Leaks', count: 320, color: '#0284c7' },
    { name: 'Damaged Roads', count: 215, color: '#4f46e5' },
    { name: 'Streetlights', count: 185, color: '#dc2626' },
    { name: 'Garbage Overflow', count: 140, color: '#d97706' },
  ];

  // Agent latency benchmarks (in ms)
  const latencyData = [
    { agent: 'Orchestrator', latency: 408, benchmark: 500 },
    { agent: 'Location', latency: 450, benchmark: 600 },
    { agent: 'Action', latency: 620, benchmark: 800 },
    { agent: 'Severity', latency: 870, benchmark: 1000 },
    { agent: 'Decision', latency: 950, benchmark: 1200 },
    { agent: 'Vision', latency: 1420, benchmark: 1800 },
  ];

  // Resolution time by locality (in hours)
  const resolutionTimeData = [
    { locality: 'MVP Colony', avgHours: 3.2, target: 4.0 },
    { locality: 'Dwaraka Nagar', avgHours: 4.1, target: 4.0 },
    { locality: 'Gajuwaka', avgHours: 5.4, target: 6.0 },
    { locality: 'Madhurawada', avgHours: 6.8, target: 8.0 },
    { locality: 'Seethammadhara', avgHours: 3.8, target: 4.0 },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8 font-sans bg-slate-50">
      {/* HEADER & TIME RANGE SELECTOR */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-300">
        <div>
          <div className="flex items-center gap-2 text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
            <BarChart3 className="w-4 h-4 text-blue-600" />
            <span>[OPERATIONAL TELEMETRY]</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 mt-1">
            System Analytics & Trends
          </h1>
          <p className="text-sm text-slate-500 max-w-2xl leading-relaxed mt-1">
            Aggregated metrics on citizen reporting volume, agent execution latency, and municipal resolution velocity.
          </p>
        </div>

        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-white border border-slate-300 text-xs shadow-xs">
          {(['7D', '30D', '90D'] as const).map(t => (
            <button
              key={t}
              onClick={() => setTimeRange(t)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                timeRange === t 
                  ? 'bg-blue-600 text-white shadow-xs' 
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* STRATEGIC INSIGHTS STRIP */}
      <div className="p-5 rounded-xl border border-slate-300 bg-white space-y-3 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-slate-800">
            <Sparkles className="w-4 h-4 text-blue-600" />
            <span>[AUTOMATED ANALYSIS & HIGHLIGHTS]</span>
          </div>
          <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded border border-emerald-300 font-extrabold uppercase tracking-wider">
            [96% STATISTICAL CONFIDENCE]
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-300 space-y-1.5 shadow-2xs">
            <div className="text-rose-700 font-extrabold text-xs uppercase tracking-wider">[SECTOR 4 ARTERIAL DEGRADATION]</div>
            <p className="text-slate-800 leading-relaxed font-sans text-xs">
              Pothole and structural fissure reports increased <strong>23% in MVP Colony and Madhurawada</strong> over the last 7 days following recent rains.
            </p>
            <div className="text-slate-500 text-[11px] pt-1.5 border-t border-slate-300 font-medium">
              Recommendation: Deploy preventive cold-milling team across Sector 4 corridor.
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-300 space-y-1.5 shadow-2xs">
            <div className="text-amber-800 font-extrabold text-xs uppercase tracking-wider">[GAJUWAKA PRESSURE ANOMALY]</div>
            <p className="text-slate-800 leading-relaxed font-sans text-xs">
              Water leakage reports in Gajuwaka correlate with localized pressure fluctuations (+4.2 bar) detected by smart flow meters.
            </p>
            <div className="text-slate-500 text-[11px] pt-1.5 border-t border-slate-300 font-medium">
              Recommendation: Schedule acoustic leak profiling along distribution feeder V-402.
            </div>
          </div>
        </div>
      </div>

      {/* CHARTS GRID 1: REPORT VOLUME & CATEGORY BREAKDOWN */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* REPORT VOLUME OVER TIME (7 COLS) */}
        <div className="lg:col-span-7 p-6 rounded-xl border border-slate-300 bg-white space-y-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-900">[INCIDENT INGESTION & RESOLUTION]</h3>
              <p className="text-xs text-slate-500 mt-0.5">Daily reports received vs. municipal resolutions completed</p>
            </div>
            <span className="text-[10px] text-slate-700 font-mono font-extrabold px-2 py-0.5 rounded bg-slate-100 border border-slate-300">[1,427 TOTAL]</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={reportVolumeData}>
                <defs>
                  <linearGradient id="colorReports" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorResolved" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#059669" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#059669" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="day" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#ffffff', borderColor: '#cbd5e1', borderRadius: '12px', fontSize: '12px', color: '#0f172a', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}
                  labelStyle={{ color: '#0f172a', fontWeight: 700 }}
                />
                <Area type="monotone" dataKey="reports" stroke="#2563eb" strokeWidth={2} fillOpacity={1} fill="url(#colorReports)" name="Ingested Reports" />
                <Area type="monotone" dataKey="resolved" stroke="#059669" strokeWidth={2} fillOpacity={1} fill="url(#colorResolved)" name="Assigned / Resolved" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* DEFECT CATEGORY BREAKDOWN (5 COLS) */}
        <div className="lg:col-span-5 p-6 rounded-xl border border-slate-300 bg-white space-y-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-900">[ISSUES BY CATEGORY]</h3>
              <p className="text-xs text-slate-500 mt-0.5">Distribution across infrastructure assets</p>
            </div>
            <span className="text-[10px] text-slate-700 font-mono font-bold px-2 py-0.5 rounded bg-slate-100 border border-slate-300">[100% CALIBRATED]</span>
          </div>

          <div className="h-48 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={3}
                  dataKey="count"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#ffffff', borderColor: '#cbd5e1', borderRadius: '12px', fontSize: '11px', color: '#0f172a', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}
                  itemStyle={{ color: '#0f172a' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs text-slate-700 pt-2 border-t border-slate-300">
            {categoryData.map(item => (
              <div key={item.name} className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: item.color }} />
                <span className="truncate">{item.name}: <span className="font-mono text-slate-900 font-bold">{item.count}</span></span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CHARTS GRID 2: AGENT LATENCY BENCHMARKS & RESOLUTION SPEED */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* AGENT LATENCY BENCHMARKS (6 COLS) */}
        <div className="lg:col-span-6 p-6 rounded-xl border border-slate-300 bg-white space-y-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-900">[AGENT EXECUTION LATENCY (MS)]</h3>
              <p className="text-xs text-slate-500 mt-0.5">Average execution time per agent</p>
            </div>
            <span className="text-[10px] text-emerald-700 font-extrabold uppercase px-2 py-0.5 rounded bg-emerald-50 border border-emerald-300">[WITHIN SLA]</span>
          </div>

          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={latencyData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis type="number" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis dataKey="agent" type="category" stroke="#64748b" fontSize={11} tickLine={false} width={90} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#ffffff', borderColor: '#cbd5e1', borderRadius: '12px', fontSize: '11px', color: '#0f172a', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}
                  itemStyle={{ color: '#0f172a' }}
                />
                <Bar dataKey="latency" fill="#2563eb" radius={[0, 4, 4, 0]} name="Actual Latency (ms)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* AVERAGE RESOLUTION TIME BY LOCALITY (6 COLS) */}
        <div className="lg:col-span-6 p-6 rounded-xl border border-slate-300 bg-white space-y-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-900">[AVERAGE RESOLUTION TIME (HOURS)]</h3>
              <p className="text-xs text-slate-500 mt-0.5">From report submission to field closure</p>
            </div>
            <span className="text-[10px] text-slate-700 font-mono font-bold px-2 py-0.5 rounded bg-slate-100 border border-slate-300">[AVG: 4.6H]</span>
          </div>

          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={resolutionTimeData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="locality" stroke="#64748b" fontSize={10} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={11} tickLine={false} unit="h" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#ffffff', borderColor: '#cbd5e1', borderRadius: '12px', fontSize: '11px', color: '#0f172a', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}
                  itemStyle={{ color: '#0f172a' }}
                />
                <Bar dataKey="avgHours" fill="#2563eb" radius={[4, 4, 0, 0]} name="Actual Avg Hours" />
                <Bar dataKey="target" fill="#94a3b8" radius={[4, 4, 0, 0]} name="Target SLA Hours" opacity={0.5} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
