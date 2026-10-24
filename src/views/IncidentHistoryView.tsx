import React, { useState, useEffect } from 'react';
import { 
  TableProperties, 
  Search, 
  ChevronLeft, 
  ChevronRight,
  Download,
  Flame
} from 'lucide-react';
import { incidentStore } from '../services/incidentStore';
import { Incident } from '../types';
import { IncidentDetailModal } from './IncidentDetailModal';

export const IncidentHistoryView: React.FC = () => {
  const [incidents, setIncidents] = useState<Incident[]>(incidentStore.getIncidents());
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedSeverity, setSelectedSeverity] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [inspectIncident, setInspectIncident] = useState<Incident | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;

  useEffect(() => {
    const unsubscribe = incidentStore.subscribe(() => {
      setIncidents(incidentStore.getIncidents());
    });
    return unsubscribe;
  }, []);

  const filteredIncidents = incidents.filter(inc => {
    const matchesSearch = 
      inc.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inc.locality.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inc.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inc.description.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory = selectedCategory === 'ALL' || inc.category === selectedCategory;
    const matchesSeverity = selectedSeverity === 'ALL' || inc.severity === selectedSeverity;
    const matchesStatus = selectedStatus === 'ALL' || inc.status === selectedStatus;

    return matchesSearch && matchesCategory && matchesSeverity && matchesStatus;
  });

  const totalPages = Math.ceil(filteredIncidents.length / pageSize) || 1;
  const paginatedIncidents = filteredIncidents.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const categories: string[] = ['ALL', 'Pothole', 'Water Leakage', 'Garbage Overflow', 'Broken Streetlight', 'Damaged Road'];
  const severities: string[] = ['ALL', 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW'];
  const statuses: string[] = ['ALL', 'REPORTED', 'INVESTIGATING', 'ASSIGNED', 'IN_PROGRESS', 'RESOLVED'];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6 font-sans bg-slate-50">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-300">
        <div>
          <div className="flex items-center gap-2 text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
            <TableProperties className="w-4 h-4 text-blue-600" />
            <span>[OPERATIONAL LEDGER]</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 mt-1">
            Incident Records & Audit Log
          </h1>
          <p className="text-sm text-slate-500 max-w-2xl leading-relaxed mt-1">
            Search, filter, and audit verified citizen reports, multi-agent evaluation traces, and municipal work order assignments.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              const csvData = "data:text/csv;charset=utf-8," + 
                ["ID,Category,Locality,Severity,Priority,Confidence,Status,CaseId"].concat(
                  incidents.map(i => `${i.id},${i.category},${i.locality},${i.severity},${i.priority},${i.confidence},${i.status},${i.caseId || ''}`)
                ).join("\n");
              const encodedUri = encodeURI(csvData);
              const link = document.createElement("a");
              link.setAttribute("href", encodedUri);
              link.setAttribute("download", "cloudpulse_incident_records.csv");
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
            }}
            className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 text-xs font-bold flex items-center gap-2 transition-all cursor-pointer shadow-xs"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>[Export CSV]</span>
          </button>
        </div>
      </div>

      {/* SEARCH & FILTERS STRIP */}
      <div className="p-4 rounded-xl border border-slate-300 bg-white flex flex-wrap items-center gap-3 shadow-sm">
        {/* Search */}
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search report ID, locality, or notes..."
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
            className="w-full bg-slate-50 border border-slate-300 rounded-lg pl-9 pr-4 py-2 text-xs text-slate-900 placeholder-slate-400 font-medium focus:outline-none focus:border-blue-600 transition-colors"
          />
        </div>

        {/* Category Filter */}
        <div className="flex items-center gap-1.5 text-xs">
          <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500">Category:</span>
          <select
            value={selectedCategory}
            onChange={(e) => { setSelectedCategory(e.target.value); setCurrentPage(1); }}
            className="bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 font-bold focus:outline-none focus:border-blue-600"
          >
            {categories.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        {/* Severity Filter */}
        <div className="flex items-center gap-1.5 text-xs">
          <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500">Severity:</span>
          <select
            value={selectedSeverity}
            onChange={(e) => { setSelectedSeverity(e.target.value); setCurrentPage(1); }}
            className="bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 font-bold focus:outline-none focus:border-blue-600"
          >
            {severities.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-1.5 text-xs">
          <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500">Status:</span>
          <select
            value={selectedStatus}
            onChange={(e) => { setSelectedStatus(e.target.value); setCurrentPage(1); }}
            className="bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 font-bold focus:outline-none focus:border-blue-600"
          >
            {statuses.map(st => <option key={st} value={st}>{st}</option>)}
          </select>
        </div>
      </div>

      {/* DATA TABLE WITH CRISP CONTRAST ON WHITE */}
      <div className="rounded-xl border border-slate-300 overflow-hidden bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-100/90 border-b border-slate-300 text-[11px] font-extrabold uppercase tracking-wider text-slate-700">
              <tr>
                <th className="py-3.5 px-4">Report ID</th>
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4">Locality</th>
                <th className="py-3.5 px-4">Severity</th>
                <th className="py-3.5 px-4">Priority</th>
                <th className="py-3.5 px-4">Confidence</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Time</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {paginatedIncidents.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-500 font-medium">
                    No incident reports match the specified criteria.
                  </td>
                </tr>
              ) : (
                paginatedIncidents.map((incident) => (
                  <tr 
                    key={incident.id} 
                    onClick={() => setInspectIncident(incident)}
                    className="hover:bg-blue-50/40 cursor-pointer transition-colors"
                  >
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900 flex items-center gap-2">
                      <span>#{incident.id}</span>
                      {incident.nearbyCount >= 4 && (
                        <span title="Associated with Hotspot Cluster">
                          <Flame className="w-3.5 h-3.5 text-amber-500" />
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-slate-900 font-bold">
                      {incident.category}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 font-medium">
                      {incident.locality}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-wider ${
                        incident.severity === 'CRITICAL' ? 'bg-rose-50 text-rose-700 border border-rose-300' :
                        incident.severity === 'HIGH' ? 'bg-amber-50 text-amber-800 border border-amber-300' :
                        'bg-blue-50 text-blue-800 border border-blue-300'
                      }`}>
                        [{incident.severity}]
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-mono font-extrabold">
                      <span className={incident.priority === 'P1' ? 'text-rose-600' : incident.priority === 'P2' ? 'text-amber-600' : 'text-blue-600'}>
                        [{incident.priority}]
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-blue-700">
                      {(incident.confidence * 100).toFixed(0)}%
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded bg-slate-100 border border-slate-300 text-[10px] font-extrabold uppercase tracking-wider text-slate-700 font-mono">
                        [{incident.status}]
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 text-xs font-mono">
                      {new Date(incident.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setInspectIncident(incident);
                        }}
                        className="px-2.5 py-1 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-800 border border-slate-300 text-[11px] font-extrabold uppercase tracking-wider transition-all cursor-pointer shadow-2xs"
                      >
                        [Inspect]
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* PAGINATION BAR */}
        <div className="p-4 bg-slate-50 border-t border-slate-300 flex items-center justify-between text-xs text-slate-600">
          <div>
            Showing {(currentPage - 1) * pageSize + 1} to {Math.min(currentPage * pageSize, filteredIncidents.length)} of {filteredIncidents.length} records
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="p-1.5 rounded-lg bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 disabled:opacity-30 cursor-pointer shadow-2xs"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-slate-900 font-bold font-mono px-2">{currentPage} / {totalPages}</span>
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded-lg bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 disabled:opacity-30 cursor-pointer shadow-2xs"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* DETAIL MODAL IF INSPECTED */}
      {inspectIncident && (
        <IncidentDetailModal
          incident={inspectIncident}
          onClose={() => setInspectIncident(null)}
        />
      )}
    </div>
  );
};
