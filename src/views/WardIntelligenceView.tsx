import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  MapPin, 
  Award, 
  AlertTriangle, 
  ShieldAlert, 
  Megaphone, 
  TrendingUp, 
  CheckCircle2, 
  Phone, 
  User, 
  Sparkles, 
  Search, 
  Filter, 
  Plus, 
  X, 
  Clock, 
  ArrowUpRight,
  ShieldCheck,
  Radio,
  Flame
} from 'lucide-react';
import { incidentStore } from '../services/incidentStore';
import { WardProfile, CivicUserKarma, EmergencyAlert } from '../types';

export const WardIntelligenceView: React.FC = () => {
  const [wards, setWards] = useState<WardProfile[]>(incidentStore.getWards());
  const [civicKarma, setCivicKarma] = useState<CivicUserKarma[]>(incidentStore.getCivicKarma());
  const [alerts, setAlerts] = useState<EmergencyAlert[]>(incidentStore.getEmergencyAlerts());
  const [selectedZone, setSelectedZone] = useState<number | 'ALL'>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // New Alert Modal
  const [isAlertModalOpen, setIsAlertModalOpen] = useState<boolean>(false);
  const [newAlertForm, setNewAlertForm] = useState({
    title: '',
    category: 'CYCLONE' as EmergencyAlert['category'],
    severity: 'WARNING' as EmergencyAlert['severity'],
    areasAffected: 'RK Beach Road, Rushikonda Promenade, Bheemili',
    actionRequired: 'Avoid unnecessary coastal road travel. Drive at under 30 km/h due to storm winds.',
    broadcastAuthority: 'GVMC Disaster Management Cell'
  });

  useEffect(() => {
    const unsubscribe = incidentStore.subscribe(() => {
      setWards(incidentStore.getWards());
      setCivicKarma(incidentStore.getCivicKarma());
      setAlerts(incidentStore.getEmergencyAlerts());
    });
    return unsubscribe;
  }, []);

  // Filtered wards
  const filteredWards = wards.filter(w => {
    const matchesZone = selectedZone === 'ALL' || w.zone === selectedZone;
    const matchesSearch = !searchQuery.trim() || 
      w.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      w.corporator.toLowerCase().includes(searchQuery.toLowerCase()) ||
      w.engineer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      w.keyLandmarks.some(l => l.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesZone && matchesSearch;
  });

  // Handle Publish Alert
  const handlePublishAlert = (e: React.FormEvent) => {
    e.preventDefault();
    incidentStore.publishEmergencyAlert({
      title: newAlertForm.title,
      category: newAlertForm.category,
      severity: newAlertForm.severity,
      areasAffected: newAlertForm.areasAffected.split(',').map(s => s.trim()),
      validUntil: new Date(Date.now() + 48 * 3600 * 1000).toISOString(),
      actionRequired: newAlertForm.actionRequired,
      broadcastAuthority: newAlertForm.broadcastAuthority
    });

    setIsAlertModalOpen(false);
    setNewAlertForm({
      title: '',
      category: 'CYCLONE',
      severity: 'WARNING',
      areasAffected: 'RK Beach Road, Rushikonda Promenade',
      actionRequired: 'Avoid unnecessary coastal road travel.',
      broadcastAuthority: 'GVMC Disaster Management Cell'
    });
  };

  const avgCleanliness = (wards.reduce((sum, w) => sum + w.cleanlinessScore, 0) / (wards.length || 1)).toFixed(1);
  const avgPotholeFree = (wards.reduce((sum, w) => sum + w.potholeFreeIndex, 0) / (wards.length || 1)).toFixed(1);

  return (
    <div className="min-h-full p-4 sm:p-7 space-y-6 font-sans bg-slate-50 text-slate-900 select-none">
      
      {/* 1. PAGE HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-300">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500">GVMC Civic Transparency & Public Analytics</span>
            <span className="text-slate-300">•</span>
            <span className="text-xs font-bold text-emerald-700">98 Wards • Zones 1–6</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 mt-1">
            Ward Intelligence & Civic Transparency Hub
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 leading-relaxed mt-0.5">
            Operational scorecards across Visakhapatnam wards, corporator directory, citizen karma champions, and city-wide emergency advisories.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setIsAlertModalOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs flex items-center gap-2 shadow-md shadow-red-500/25 transition-all cursor-pointer hover:scale-[1.02]"
          >
            <Megaphone className="w-4 h-4" />
            <span>Publish Emergency Advisory</span>
          </button>
        </div>
      </div>

      {/* 2. KPI OVERVIEW STRIP */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="p-4 rounded-2xl bg-white border border-slate-300 shadow-xs kpi-accent-blue space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Jurisdictional Wards</span>
            <Building2 className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-black text-slate-900 font-mono">98 Wards</div>
          <div className="text-[11px] text-slate-500">Divided into <span className="font-bold text-slate-800">6 Administrative Zones</span></div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-300 shadow-xs kpi-accent-emerald space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">City Cleanliness Index</span>
            <Award className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-emerald-700 font-mono">{avgCleanliness}%</div>
          <div className="text-[11px] text-slate-500">Swachh Survekshan Grade: <span className="font-bold text-emerald-700">Top Tier</span></div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-300 shadow-xs kpi-accent-indigo space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Pothole-Free Network</span>
            <ShieldCheck className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-2xl font-black text-indigo-700 font-mono">{avgPotholeFree}%</div>
          <div className="text-[11px] text-slate-500">Arterial Roads: <span className="font-bold text-blue-700">92.4%</span></div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-300 shadow-xs kpi-accent-amber space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Civic Karma Sentinels</span>
            <Sparkles className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-black text-amber-700 font-mono">1,420</div>
          <div className="text-[11px] text-slate-500">Active Verified Citizen Reporters</div>
        </div>
      </div>

      {/* 3. CITY EMERGENCY ADVISORIES SECTION */}
      {alerts.filter(a => a.active).length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-red-600" />
            <h2 className="text-xs font-extrabold uppercase tracking-wider text-slate-900">
              Active Municipal Emergency Advisories ({alerts.filter(a => a.active).length})
            </h2>
          </div>

          <div className="space-y-2.5">
            {alerts.filter(a => a.active).map(alert => (
              <div 
                key={alert.id}
                className={`p-4 rounded-2xl border transition-all flex flex-col md:flex-row md:items-center justify-between gap-3 ${
                  alert.severity === 'CRITICAL' ? 'bg-red-50/70 border-red-300' :
                  alert.severity === 'WARNING' ? 'bg-amber-50/70 border-amber-300' :
                  'bg-blue-50/70 border-blue-300'
                }`}
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                      alert.severity === 'CRITICAL' ? 'bg-red-600 text-white' :
                      alert.severity === 'WARNING' ? 'bg-amber-600 text-white' :
                      'bg-blue-600 text-white'
                    }`}>
                      [{alert.category}]
                    </span>
                    <span className="text-xs font-bold text-slate-900">{alert.title}</span>
                  </div>
                  <p className="text-xs text-slate-700 leading-relaxed font-medium">
                    {alert.actionRequired}
                  </p>
                  <div className="text-[11px] text-slate-500 flex items-center gap-1.5 pt-0.5">
                    <MapPin className="w-3 h-3 text-slate-400" />
                    <span>Areas: <strong>{alert.areasAffected.join(', ')}</strong></span>
                    <span>•</span>
                    <span className="font-mono text-[10px]">{alert.broadcastAuthority}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={() => incidentStore.toggleAlertActive(alert.id)}
                    className="px-3 py-1.5 rounded-xl border border-slate-300 hover:bg-white text-slate-700 font-bold text-xs cursor-pointer shadow-2xs"
                  >
                    Dismiss Notice
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. WARD PERFORMANCE SCORECARDS */}
      <div className="p-5 rounded-3xl bg-white border border-slate-300 shadow-xl space-y-4">
        
        {/* ZONE SELECTOR & SEARCH */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-slate-200">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
            <span className="text-xs font-bold text-slate-500 mr-1 whitespace-nowrap">Administrative Zone:</span>
            {(['ALL', 1, 2, 3, 4, 5, 6] as (number | 'ALL')[]).map(z => (
              <button
                key={String(z)}
                onClick={() => setSelectedZone(z)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  selectedZone === z
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                {z === 'ALL' ? 'All Zones' : `Zone ${z}`}
              </button>
            ))}
          </div>

          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search ward, corporator, landmark..."
              className="pl-8 pr-3 py-1.5 rounded-xl bg-slate-50 border border-slate-300 text-xs text-slate-900 placeholder-slate-400 focus:outline-none w-60 font-medium"
            />
          </div>
        </div>

        {/* WARD CARDS GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredWards.map(ward => (
            <div 
              key={ward.wardNumber}
              className="p-4 rounded-2xl bg-white border border-slate-300 hover:border-slate-400 transition-all shadow-xs space-y-3"
            >
              <div className="flex items-start justify-between gap-2 pb-2.5 border-b border-slate-200">
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-mono font-bold px-1.5 py-0.5 rounded bg-blue-100 text-blue-800">
                      W-{ward.wardNumber}
                    </span>
                    <span className="text-xs font-extrabold text-slate-900">{ward.name}</span>
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">Zone {ward.zone} Jurisdiction • Pop: {ward.population.toLocaleString('en-IN')}</div>
                </div>

                <span className="text-xs font-black text-emerald-700 font-mono px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200">
                  {ward.cleanlinessScore}% Clean
                </span>
              </div>

              {/* PROGRESS BARS */}
              <div className="space-y-2 text-xs">
                <div>
                  <div className="flex justify-between text-[11px] mb-1">
                    <span className="text-slate-500 font-medium">Cleanliness Rating:</span>
                    <span className="font-bold text-slate-800 font-mono">{ward.cleanlinessScore}%</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-slate-100 overflow-hidden">
                    <div 
                      className="h-full rounded-full bg-emerald-600" 
                      style={{ width: `${ward.cleanlinessScore}%` }} 
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-[11px] mb-1">
                    <span className="text-slate-500 font-medium">Pothole-Free Index:</span>
                    <span className="font-bold text-slate-800 font-mono">{ward.potholeFreeIndex}%</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-slate-100 overflow-hidden">
                    <div 
                      className="h-full rounded-full bg-blue-600" 
                      style={{ width: `${ward.potholeFreeIndex}%` }} 
                    />
                  </div>
                </div>
              </div>

              {/* CORPORATOR & ENGINEER CONTACT */}
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1 text-[11px]">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Corporator:</span>
                  <span className="font-bold text-slate-900">{ward.corporator}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Executive Engineer:</span>
                  <span className="text-slate-800 font-medium">{ward.engineer}</span>
                </div>
                <div className="flex items-center justify-between pt-1 border-t border-slate-200">
                  <span className="text-slate-500 flex items-center gap-1">
                    <Phone className="w-3 h-3 text-slate-400" />
                    <span>Control Desk:</span>
                  </span>
                  <span className="font-mono text-blue-700 font-bold">{ward.phone}</span>
                </div>
              </div>

              {/* METRICS STRIP */}
              <div className="flex items-center justify-between text-[11px] pt-1 text-slate-600">
                <span>Active Defects: <strong className="text-red-600">{ward.activeIncidents}</strong></span>
                <span>Resolved (Month): <strong className="text-emerald-700">{ward.resolvedThisMonth}</strong></span>
                <span>SLA: <strong className="font-mono text-slate-900">{ward.avgResolutionHours}h</strong></span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 5. CITIZEN CIVIC CHAMPIONS LEADERBOARD */}
      <div className="p-5 rounded-3xl bg-white border border-slate-300 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-600" />
            <div>
              <h2 className="text-sm font-extrabold uppercase tracking-wider text-slate-900">
                Visakhapatnam Civic Champions & Karma Leaderboard
              </h2>
              <p className="text-xs text-slate-500">Rewarding citizens whose verified incident reports keep Vizag pristine and accident-free.</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
          {/* LEADERBOARD TABLE (8 COLS) */}
          <div className="lg:col-span-8 overflow-x-auto">
            <table className="w-full border-collapse text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 uppercase text-[10px] tracking-wider bg-slate-50">
                  <th className="py-2.5 px-3">Rank</th>
                  <th className="py-2.5 px-3">Citizen Sentinel</th>
                  <th className="py-2.5 px-3">Ward Jurisdiction</th>
                  <th className="py-2.5 px-3 text-center">Verified Reports</th>
                  <th className="py-2.5 px-3 text-right">Karma Points</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {civicKarma.map(user => (
                  <tr key={user.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-3">
                      <span className={`w-6 h-6 rounded-full inline-flex items-center justify-center font-bold text-xs ${
                        user.rank === 1 ? 'bg-amber-100 text-amber-900 border border-amber-300' :
                        user.rank === 2 ? 'bg-slate-200 text-slate-800' :
                        user.rank === 3 ? 'bg-amber-50 text-amber-800' :
                        'text-slate-500'
                      }`}>
                        {user.rank}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <div className="font-bold text-slate-900">{user.name}</div>
                      <div className="text-[10px] text-blue-700 font-semibold">{user.badge}</div>
                    </td>
                    <td className="py-3 px-3 text-slate-600 font-medium">
                      {user.ward}
                    </td>
                    <td className="py-3 px-3 text-center font-mono font-bold text-emerald-700">
                      {user.verifiedCount} / {user.reportsCount}
                    </td>
                    <td className="py-3 px-3 text-right font-mono font-black text-slate-900">
                      {user.points.toLocaleString('en-IN')} pts
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* CIVIC KARMA SYSTEM EXPLAINER (4 COLS) */}
          <div className="lg:col-span-4 p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3 text-xs">
            <div className="flex items-center gap-1.5 font-bold text-slate-900">
              <Sparkles className="w-4 h-4 text-blue-600" />
              <span>How Civic Karma Works</span>
            </div>
            <p className="text-slate-600 leading-relaxed text-[11px]">
              Every citizen report verified by the Autonomous AI Vision Gate earns <strong>+50 Karma points</strong>. Reports dispatched and resolved in under 24 hours earn an additional <strong>+25 bonus points</strong>.
            </p>
            <div className="space-y-1.5 text-[11px]">
              <div className="p-2 rounded-xl bg-white border border-slate-200 flex justify-between">
                <span className="font-bold text-slate-800">Master Sentinel</span>
                <span className="font-mono text-blue-700">&gt; 1,500 pts</span>
              </div>
              <div className="p-2 rounded-xl bg-white border border-slate-200 flex justify-between">
                <span className="font-bold text-slate-800">Clean City Guardian</span>
                <span className="font-mono text-emerald-700">&gt; 1,000 pts</span>
              </div>
              <div className="p-2 rounded-xl bg-white border border-slate-200 flex justify-between">
                <span className="font-bold text-slate-800">Active Contributor</span>
                <span className="font-mono text-amber-700">&gt; 500 pts</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ==================================================================== */}
      {/* MODAL: PUBLISH EMERGENCY ADVISORY */}
      {/* ==================================================================== */}
      {isAlertModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl border border-slate-300 shadow-2xl max-w-lg w-full p-6 space-y-4 animate-scaleUp">
            
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <Megaphone className="w-5 h-5 text-red-600" />
                <h2 className="text-base font-extrabold text-slate-900">Broadcast City Emergency Notice</h2>
              </div>
              <button 
                onClick={() => setIsAlertModalOpen(false)}
                className="p-1 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handlePublishAlert} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 font-bold mb-1">Advisory Headline</label>
                <input
                  type="text"
                  required
                  value={newAlertForm.title}
                  onChange={e => setNewAlertForm({ ...newAlertForm, title: e.target.value })}
                  placeholder="e.g. Flash Flood Risk along Drainage Main 4"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:border-red-600 font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Hazard Category</label>
                  <select
                    value={newAlertForm.category}
                    onChange={e => setNewAlertForm({ ...newAlertForm, category: e.target.value as EmergencyAlert['category'] })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:border-red-600 font-medium"
                  >
                    <option value="CYCLONE">CYCLONE / HIGH WINDS</option>
                    <option value="FLASH_FLOOD">FLASH FLOOD / DRAIN BURST</option>
                    <option value="WATER_PIPELINE">WATER PIPELINE SHUTDOWN</option>
                    <option value="TRAFFIC_DIVERSION">TRAFFIC DIVERSION</option>
                    <option value="ROAD_COLLAPSE">ROAD COLLAPSE</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Severity Level</label>
                  <select
                    value={newAlertForm.severity}
                    onChange={e => setNewAlertForm({ ...newAlertForm, severity: e.target.value as EmergencyAlert['severity'] })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:border-red-600 font-medium"
                  >
                    <option value="CRITICAL">CRITICAL (Action Required)</option>
                    <option value="WARNING">WARNING (High Precaution)</option>
                    <option value="ADVISORY">ADVISORY (General Notice)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Affected Localities (Comma-separated)</label>
                <input
                  type="text"
                  required
                  value={newAlertForm.areasAffected}
                  onChange={e => setNewAlertForm({ ...newAlertForm, areasAffected: e.target.value })}
                  placeholder="e.g. RK Beach Road, Tenneti Park, Rushikonda"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:border-red-600 font-medium"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Public Guidance & Instructions</label>
                <textarea
                  rows={3}
                  required
                  value={newAlertForm.actionRequired}
                  onChange={e => setNewAlertForm({ ...newAlertForm, actionRequired: e.target.value })}
                  placeholder="Specific actions citizens should take or avoid..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:border-red-600 font-medium"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsAlertModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 font-bold text-xs cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs cursor-pointer shadow-md shadow-red-500/25"
                >
                  Broadcast to All Civics & Field Units
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
