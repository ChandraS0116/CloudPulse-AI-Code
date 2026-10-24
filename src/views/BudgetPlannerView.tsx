import React, { useState } from 'react';
import { 
  DollarSign, 
  TrendingUp, 
  AlertTriangle, 
  ShieldCheck, 
  Download, 
  Printer, 
  FileSpreadsheet, 
  FileCode, 
  Sparkles, 
  CloudRain, 
  CheckCircle2, 
  BarChart3, 
  PieChart, 
  Layers, 
  Building2,
  Calendar,
  Sliders
} from 'lucide-react';
import { incidentStore } from '../services/incidentStore';
import { CapitalBudget } from '../types';

export const BudgetPlannerView: React.FC = () => {
  const [budget, setBudget] = useState<CapitalBudget>(incidentStore.getCapitalBudget());
  const [rainfallSlider, setRainfallSlider] = useState<number>(20);
  const [exportNotice, setExportNotice] = useState<string | null>(null);

  const handleSimulateRainfall = (val: number) => {
    setRainfallSlider(val);
    const updated = incidentStore.simulateBudgetRisk(val);
    setBudget({ ...updated });
  };

  const handleExportCSV = () => {
    const incidents = incidentStore.getIncidents();
    const headers = ['ID', 'Category', 'Priority', 'Status', 'Locality', 'Ward', 'Estimated_Cost_INR', 'Created_At'];
    const rows = incidents.map(i => [
      i.id,
      i.category,
      i.priority,
      i.status,
      `"${i.locality}"`,
      `"${i.ward || ''}"`,
      i.priority === 'P1' ? 65000 : i.priority === 'P2' ? 35000 : 18000,
      i.createdAt
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `GVMC_Infrastructure_Audit_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setExportNotice('CSV Audit Export downloaded successfully.');
    setTimeout(() => setExportNotice(null), 3500);
  };

  const handleExportGeoJSON = () => {
    const incidents = incidentStore.getIncidents();
    const geojson = {
      type: 'FeatureCollection',
      features: incidents.map(i => ({
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [i.longitude, i.latitude]
        },
        properties: {
          id: i.id,
          category: i.category,
          priority: i.priority,
          locality: i.locality,
          status: i.status
        }
      }))
    };
    const blob = new Blob([JSON.stringify(geojson, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `GVMC_GIS_Layers_${new Date().toISOString().split('T')[0]}.geojson`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setExportNotice('GeoJSON GIS Layer exported successfully for QGIS/ArcGIS.');
    setTimeout(() => setExportNotice(null), 3500);
  };

  const totalCommittedSpent = (budget.spentCrores + budget.committedCrores).toFixed(2);
  const utilizationPct = Math.round(((budget.spentCrores + budget.committedCrores) / budget.totalAllocatedCrores) * 100);

  return (
    <div className="min-h-full p-4 sm:p-7 space-y-6 font-sans bg-slate-50 text-slate-900 select-none">
      
      {/* 1. PAGE HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-300">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500">GVMC Municipal Finance & Asset Management</span>
            <span className="text-slate-300">•</span>
            <span className="text-xs font-bold text-blue-700">{budget.fiscalYear}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 mt-1">
            Capital Infrastructure Budget & Monsoon Forecaster
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 leading-relaxed mt-0.5">
            Real-time capital budget allocation, contractor expenditure tracking, monsoon rainfall risk modeling, and GIS/CSV export suite.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleExportCSV}
            className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-300 text-slate-800 font-bold text-xs flex items-center gap-1.5 shadow-xs cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={handleExportGeoJSON}
            className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-blue-500/25 cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Export GeoJSON GIS</span>
          </button>
        </div>
      </div>

      {exportNotice && (
        <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-300 text-xs text-emerald-900 font-bold flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{exportNotice}</span>
        </div>
      )}

      {/* 2. KPI STRIP */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="p-4 rounded-2xl bg-white border border-slate-300 shadow-xs kpi-accent-blue space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Total Capital Budget</span>
            <DollarSign className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-black text-slate-900 font-mono">₹{budget.totalAllocatedCrores.toFixed(2)} Cr</div>
          <div className="text-[11px] text-slate-500">Sanctioned for FY 2026–27</div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-300 shadow-xs kpi-accent-emerald space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Committed & Spent</span>
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-emerald-700 font-mono">₹{totalCommittedSpent} Cr</div>
          <div className="text-[11px] text-slate-500">Utilization Rate: <span className="font-bold text-emerald-700">{utilizationPct}%</span></div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-300 shadow-xs kpi-accent-amber space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Monsoon Emergency Fund</span>
            <CloudRain className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-black text-amber-700 font-mono">₹{budget.monsoonReserveCrores.toFixed(2)} Cr</div>
          <div className="text-[11px] text-slate-500">Contingency Buffer Active</div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-300 shadow-xs kpi-accent-indigo space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Active Works Sanctioned</span>
            <Building2 className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-2xl font-black text-indigo-700 font-mono">295 Projects</div>
          <div className="text-[11px] text-slate-500">Across 98 Municipal Wards</div>
        </div>
      </div>

      {/* 3. DEPARTMENTAL BUDGET ALLOCATION CARDS */}
      <div className="p-5 rounded-3xl bg-white border border-slate-300 shadow-xl space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-200">
          <div>
            <h2 className="text-sm font-extrabold uppercase tracking-wider text-slate-900">
              Departmental Asset Allocation & Expenditure
            </h2>
            <p className="text-xs text-slate-500">Capital fund utilization across primary urban maintenance wings.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {budget.categories.map((cat, idx) => {
            const pct = Math.round((cat.spentCrores / cat.allocatedCrores) * 100);
            return (
              <div key={idx} className="p-4 rounded-2xl bg-slate-50/70 border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: cat.color }} />
                    <span className="text-xs font-bold text-slate-900">{cat.name}</span>
                  </div>
                  <span className="text-xs font-mono font-bold text-slate-700">{cat.projectsCount} Works</span>
                </div>

                <div className="space-y-1 text-xs">
                  <div className="flex justify-between text-[11px] text-slate-600">
                    <span>Spent: <strong>₹{cat.spentCrores.toFixed(2)} Cr</strong></span>
                    <span>Allocated: <strong>₹{cat.allocatedCrores.toFixed(2)} Cr</strong></span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-200 overflow-hidden">
                    <div 
                      className="h-full rounded-full transition-all duration-500" 
                      style={{ width: `${pct}%`, backgroundColor: cat.color }}
                    />
                  </div>
                  <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                    <span>Progress: {pct}%</span>
                    <span>Remaining: ₹{(cat.allocatedCrores - cat.spentCrores).toFixed(2)} Cr</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. MONSOON RISK & PAVEMENT WEAR SIMULATOR */}
      <div className="p-5 rounded-3xl bg-white border border-slate-300 shadow-xl space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <CloudRain className="w-5 h-5 text-blue-600" />
            <div>
              <h2 className="text-sm font-extrabold uppercase tracking-wider text-slate-900">
                Monsoon Degradation & Emergency Reserve Simulator
              </h2>
              <p className="text-xs text-slate-500">Model the financial impact of abnormal Bay of Bengal coastal rainfall on road subgrades.</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-center">
          {/* SLIDER CONTROLS (7 COLS) */}
          <div className="lg:col-span-7 space-y-4 p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-800">Projected Rainfall Anomaly:</span>
              <span className="font-mono text-sm font-black text-blue-700">+{rainfallSlider}% Above Normal</span>
            </div>

            <input
              type="range"
              min="0"
              max="60"
              step="5"
              value={rainfallSlider}
              onChange={e => handleSimulateRainfall(parseInt(e.target.value))}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />

            <div className="flex justify-between text-[10px] text-slate-400 font-mono">
              <span>Standard (0%)</span>
              <span>Moderate (+20%)</span>
              <span>Severe Coastal Cyclone (+40%)</span>
              <span>Extreme (+60%)</span>
            </div>

            <div className="p-3 rounded-xl bg-white border border-slate-200 text-[11px] space-y-1">
              <div className="font-bold text-slate-800">Predicted Infrastructure Impact:</div>
              <ul className="list-disc list-inside text-slate-600 space-y-0.5">
                <li>Estimated Pothole Emergence: <strong>+{Math.round(rainfallSlider * 2.4)}% increase</strong> on coastal roads.</li>
                <li>Drainage Main Desilting Frequency: <strong>+{Math.round(rainfallSlider * 1.8)}% additional cycles</strong>.</li>
                <li>Forecasted Emergency Expenditure: <strong>₹{((rainfallSlider / 100) * 14.2).toFixed(2)} Crores</strong>.</li>
              </ul>
            </div>
          </div>

          {/* SIMULATED BUFFER STATUS (5 COLS) */}
          <div className="lg:col-span-5 p-5 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50/50 border border-blue-200 space-y-3 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-slate-600 font-bold uppercase text-[10px]">Contingency Reserve Status</span>
              <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 font-bold text-[10px]">
                SOLVENT
              </span>
            </div>

            <div className="space-y-0.5">
              <div className="text-2xl font-black text-blue-900 font-mono">
                ₹{budget.monsoonReserveCrores.toFixed(2)} Crores
              </div>
              <p className="text-[11px] text-slate-600">
                Adjusted Emergency Buffer for monsoon months (July–November).
              </p>
            </div>

            <div className="pt-2 border-t border-blue-200 text-[11px] text-slate-700 space-y-1">
              <div className="flex justify-between">
                <span>Material Stockpile:</span>
                <strong className="text-slate-900">4,200 MT Cold Mix</strong>
              </div>
              <div className="flex justify-between">
                <span>Standby Pumps:</span>
                <strong className="text-slate-900">28 Dewatering Rigs</strong>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};
