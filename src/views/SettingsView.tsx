import React, { useState } from 'react';
import { 
  Database, 
  Server, 
  Sliders, 
  UserCheck
} from 'lucide-react';
import { incidentStore } from '../services/incidentStore';
import { CloudServiceHealth, UserProfile } from '../types';

export const SettingsView: React.FC = () => {
  const [cloudServices] = useState<CloudServiceHealth[]>(incidentStore.getCloudHealth());
  const [user, setUser] = useState<UserProfile>(incidentStore.getUser());
  const [demoMode, setDemoMode] = useState<boolean>(incidentStore.isDemoMode());
  const [visionModel, setVisionModel] = useState('ViT-Infrastructure-v4-TensorRT');
  const [spatialRadius, setSpatialRadius] = useState(800);

  const handleRoleToggle = (role: UserProfile['role']) => {
    incidentStore.setUserRole(role);
    setUser(incidentStore.getUser());
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8 font-sans">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-white/[0.07]">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-400">
            <Database className="w-4 h-4 text-blue-400" />
            <span>Infrastructure & Configuration</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white mt-1">
            System Architecture & Settings
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 max-w-2xl leading-relaxed mt-1">
            Cloud microservices health status, persona switching, and spatial clustering parameters.
          </p>
        </div>

        <div className="px-3.5 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-400 flex items-center gap-2 font-medium">
          <span className="w-2 h-2 rounded-full bg-emerald-400" />
          <span>All Systems Nominal</span>
        </div>
      </div>

      {/* CLOUD ARCHITECTURE DAG VISUALIZATION */}
      <div className="p-6 rounded-2xl glass-panel border border-white/[0.07] space-y-4">
        <div className="flex items-center justify-between text-xs pb-2 border-b border-white/[0.05]">
          <span className="font-semibold text-slate-300 flex items-center gap-2">
            <Server className="w-4 h-4 text-blue-400" />
            <span>Cloud Service Architecture</span>
          </span>
          <span className="text-slate-500 text-[11px]">Event-Driven Architecture</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-3 pt-1">
          {/* Node 1 */}
          <div className="p-3.5 rounded-xl bg-dark-950/60 border border-white/[0.05] space-y-2">
            <div className="text-[10px] text-slate-500 font-medium">01 • Ingestion</div>
            <div className="text-xs font-semibold text-white">Client Applications</div>
            <p className="text-[11px] text-slate-400 leading-tight">Web App + Mobile Field App + City Feeds</p>
            <div className="text-[10px] font-mono text-slate-400">WebSocket / HTTPS</div>
          </div>

          {/* Node 2 */}
          <div className="p-3.5 rounded-xl bg-dark-950/60 border border-white/[0.05] space-y-2">
            <div className="text-[10px] text-slate-500 font-medium">02 • Gateway</div>
            <div className="text-xs font-semibold text-white">API Gateway</div>
            <p className="text-[11px] text-slate-400 leading-tight">JWT Auth, Rate Limiting, Route Proxy</p>
            <div className="text-[10px] font-mono text-blue-400">14ms Latency</div>
          </div>

          {/* Node 3 */}
          <div className="p-3.5 rounded-xl bg-dark-950/60 border border-white/[0.1] shadow-sm space-y-2">
            <div className="text-[10px] text-slate-500 font-medium">03 • Orchestration</div>
            <div className="text-xs font-semibold text-white">Agent Pipeline</div>
            <p className="text-[11px] text-slate-400 leading-tight">7 Specialized Agents executing async DAG</p>
            <div className="text-[10px] font-mono text-emerald-400">Operational Core</div>
          </div>

          {/* Node 4 */}
          <div className="p-3.5 rounded-xl bg-dark-950/60 border border-white/[0.05] space-y-2">
            <div className="text-[10px] text-slate-500 font-medium">04 • Storage</div>
            <div className="text-xs font-semibold text-white">Spatial DB & Object Store</div>
            <p className="text-[11px] text-slate-400 leading-tight">R-Tree Spatial Index + Evidence Media</p>
            <div className="text-[10px] font-mono text-slate-400">R-Tree Spatial Index</div>
          </div>

          {/* Node 5 */}
          <div className="p-3.5 rounded-xl bg-dark-950/60 border border-white/[0.05] space-y-2">
            <div className="text-[10px] text-slate-500 font-medium">05 • Dispatch</div>
            <div className="text-xs font-semibold text-white">Municipal Integration</div>
            <p className="text-[11px] text-slate-400 leading-tight">GVMC Work Orders, Field Crew Routing</p>
            <div className="text-[10px] font-mono text-slate-400">REST / Webhooks</div>
          </div>
        </div>
      </div>

      {/* CLOUD SERVICES HEALTH MONITOR GRID */}
      <div className="space-y-3">
        <div className="text-xs font-semibold text-slate-400 flex items-center justify-between">
          <span>Microservices Telemetry</span>
          <span className="text-emerald-400 font-medium">7/7 Nodes Online</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {cloudServices.map((svc) => (
            <div key={svc.name} className="p-4 rounded-xl glass-panel border border-white/[0.07] space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase text-slate-500 font-medium">{svc.type}</span>
                <span className="flex items-center gap-1.5 text-[11px] text-emerald-400 font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  {svc.status}
                </span>
              </div>
              <div className="text-xs font-semibold text-white truncate">{svc.name}</div>
              <div className="flex items-center justify-between text-xs text-slate-400 pt-1.5 border-t border-white/[0.04]">
                <span className="font-mono">{svc.latencyMs}ms</span>
                <span className="text-slate-400">{svc.uptime}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* SETTINGS PANELS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* ROLE PROFILE SWITCHER (6 COLS) */}
        <div className="lg:col-span-6 p-6 rounded-2xl glass-panel border border-white/[0.07] space-y-4">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-300">
            <UserCheck className="w-4 h-4 text-blue-400" />
            <span>Role-Based Access Control (RBAC)</span>
          </div>

          <p className="text-xs text-slate-400 leading-relaxed">
            Switch your active session persona to experience the platform from different stakeholder views.
          </p>

          <div className="grid grid-cols-3 gap-2">
            {(['Citizen', 'Field Operator', 'Command Administrator'] as UserProfile['role'][]).map(r => (
              <button
                key={r}
                onClick={() => handleRoleToggle(r)}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                  user.role === r 
                    ? 'bg-white/[0.08] text-white border-white/[0.2] shadow-sm' 
                    : 'bg-dark-900/60 text-slate-400 border-white/[0.05] hover:border-white/[0.12]'
                }`}
              >
                <div className="text-[10px] uppercase text-slate-500">Role</div>
                <div className="text-xs font-semibold text-white mt-0.5">{r}</div>
              </button>
            ))}
          </div>

          <div className="p-3 rounded-xl bg-dark-950/60 border border-white/[0.04] text-xs text-slate-400 space-y-1">
            <div>Current User: <strong className="text-white font-medium">{user.name}</strong></div>
            <div>Assigned Org: <strong className="text-slate-300 font-medium">{user.department}</strong></div>
          </div>
        </div>

        {/* AI & HOTSPOT PREFERENCES (6 COLS) */}
        <div className="lg:col-span-6 p-6 rounded-2xl glass-panel border border-white/[0.07] space-y-4">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-300">
            <Sliders className="w-4 h-4 text-blue-400" />
            <span>Pipeline Parameters</span>
          </div>

          <div className="space-y-3.5 text-xs">
            <div>
              <label className="text-slate-400 block mb-1 text-xs">Vision Inference Model</label>
              <select
                value={visionModel}
                onChange={(e) => setVisionModel(e.target.value)}
                className="w-full bg-dark-950/70 border border-white/[0.08] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-white/[0.2]"
              >
                <option value="ViT-Infrastructure-v4-TensorRT">ViT-Infrastructure-v4 (Optimized)</option>
                <option value="YOLOv10-Urban-Defect-FP16">YOLOv10-Urban-Defect (Edge)</option>
                <option value="SegmentAnything-Roadway-HQ">SegmentAnything-Roadway (High-Precision)</option>
              </select>
            </div>

            <div>
              <div className="flex justify-between text-xs text-slate-400 mb-1">
                <span>Spatial Clustering Radius:</span>
                <span className="text-white font-mono">{spatialRadius}m</span>
              </div>
              <input 
                type="range" 
                min="400" 
                max="2000" 
                step="100"
                value={spatialRadius}
                onChange={(e) => setSpatialRadius(parseInt(e.target.value))}
                className="w-full accent-blue-500"
              />
            </div>

            <div className="pt-2 flex items-center justify-between border-t border-white/[0.04] text-xs">
              <span className="text-slate-400">Simulation Environment:</span>
              <button
                onClick={() => {
                  incidentStore.setDemoMode(!demoMode);
                  setDemoMode(!demoMode);
                }}
                className={`px-3 py-1 rounded-md text-xs font-medium transition-all cursor-pointer ${
                  demoMode ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20' : 'bg-white/[0.05] text-slate-400'
                }`}
              >
                {demoMode ? 'Demo Simulation Active' : 'Direct Live Feed'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
