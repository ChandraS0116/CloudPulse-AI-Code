import React, { useState, useEffect } from 'react';
import { 
  Wrench, 
  Truck, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  FileText, 
  Printer, 
  Search, 
  Filter, 
  Plus, 
  ShieldCheck, 
  Sparkles, 
  ChevronRight, 
  ArrowUpRight, 
  MapPin, 
  Phone, 
  Calendar, 
  QrCode, 
  Check, 
  X, 
  RefreshCw,
  Building2,
  DollarSign,
  Layers,
  Activity,
  HardHat
} from 'lucide-react';
import { incidentStore } from '../services/incidentStore';
import { WorkOrder, FieldCrew, WorkOrderStatus, FieldCrewStatus, IncidentCategory, IncidentPriority } from '../types';
import { repairVerificationImages } from '../services/mock/enterpriseData';

interface WorkOrderDispatchViewProps {
  onOpenIncidentDetail?: (incidentId: string) => void;
}

export const WorkOrderDispatchView: React.FC<WorkOrderDispatchViewProps> = () => {
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>(incidentStore.getWorkOrders());
  const [crews, setCrews] = useState<FieldCrew[]>(incidentStore.getFieldCrews());
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  // Modals state
  const [activeVerificationWO, setActiveVerificationWO] = useState<WorkOrder | null>(null);
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [verificationResult, setVerificationResult] = useState<{ score: number; notes: string } | null>(null);

  const [activePrintWO, setActivePrintWO] = useState<WorkOrder | null>(null);
  const [isNewOrderModalOpen, setIsNewOrderModalOpen] = useState<boolean>(false);

  // Form state for new Work Order
  const [newOrderForm, setNewOrderForm] = useState({
    title: '',
    category: 'Pothole' as IncidentCategory,
    priority: 'P1' as IncidentPriority,
    zone: 2,
    ward: 'Ward 18 MVP Colony',
    address: '',
    contractor: 'Visakha Urban Infra Projects Ltd.',
    assignedCrewId: 'CREW-02',
    asphaltMT: 4.0,
    compactorHours: 3
  });

  useEffect(() => {
    const unsubscribe = incidentStore.subscribe(() => {
      setWorkOrders(incidentStore.getWorkOrders());
      setCrews(incidentStore.getFieldCrews());
    });
    return unsubscribe;
  }, []);

  // Filtered work orders
  const filteredOrders = workOrders.filter(wo => {
    const matchesStatus = statusFilter === 'ALL' || wo.status === statusFilter;
    const matchesSearch = !searchQuery.trim() || 
      wo.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      wo.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      wo.ward.toLowerCase().includes(searchQuery.toLowerCase()) ||
      wo.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
      wo.assignedCrewName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  // Handle Quick Status Advance
  const handleAdvanceStatus = (wo: WorkOrder) => {
    let nextStatus: WorkOrderStatus = wo.status;
    if (wo.status === 'ISSUED') nextStatus = 'DISPATCHED';
    else if (wo.status === 'DISPATCHED') nextStatus = 'IN_REPAIR';
    else if (wo.status === 'IN_REPAIR') nextStatus = 'INSPECTION_PENDING';
    else if (wo.status === 'INSPECTION_PENDING') {
      setActiveVerificationWO(wo);
      return;
    } else if (wo.status === 'COMPLETED') nextStatus = 'CERTIFIED';

    incidentStore.updateWorkOrderStatus(wo.id, nextStatus);
  };

  // Run Before/After AI Vision Verification
  const handleRunAiVerification = () => {
    if (!activeVerificationWO) return;
    setIsVerifying(true);
    setVerificationResult(null);

    setTimeout(() => {
      const score = Math.floor(Math.random() * 5) + 95; // 95 - 99%
      const notes = 'Vision Agent analyzed RGB disparity and shadow gradient. Road surface voids completely filled, asphalt micro-texture uniform, grade deflection within 0.15cm tolerance. Indian Road Congress (IRC) structural compliance certified.';
      setVerificationResult({ score, notes });
      setIsVerifying(false);
    }, 1200);
  };

  const handleConfirmVerification = () => {
    if (!activeVerificationWO || !verificationResult) return;
    incidentStore.verifyWorkOrderResolution(
      activeVerificationWO.id,
      repairVerificationImages.potholeRepairedMVP,
      verificationResult.score,
      verificationResult.notes
    );
    setActiveVerificationWO(null);
    setVerificationResult(null);
  };

  // Create New Work Order
  const handleCreateNewOrder = (e: React.FormEvent) => {
    e.preventDefault();
    const estCost = Math.round((newOrderForm.asphaltMT * 7500) + (newOrderForm.compactorHours * 2200) + 12000);
    const selectedCrew = crews.find(c => c.id === newOrderForm.assignedCrewId);

    incidentStore.createWorkOrder({
      title: newOrderForm.title || `${newOrderForm.category} Repair & Restoration`,
      category: newOrderForm.category,
      priority: newOrderForm.priority,
      zone: Number(newOrderForm.zone),
      ward: newOrderForm.ward,
      address: newOrderForm.address || 'Arterial Road, Visakhapatnam',
      contractor: newOrderForm.contractor,
      assignedCrewId: newOrderForm.assignedCrewId,
      assignedCrewName: selectedCrew?.name || 'GVMC Road Maintenance Unit',
      totalEstimatedCost: estCost,
      boqItems: [
        { item: 'Bituminous Concrete VG-30 Hot Mix', quantity: newOrderForm.asphaltMT, unit: 'MT', rate: 7500, totalCost: newOrderForm.asphaltMT * 7500 },
        { item: 'Vibratory Tandem Roller Compaction', quantity: newOrderForm.compactorHours, unit: 'hours', rate: 2200, totalCost: newOrderForm.compactorHours * 2200 },
        { item: 'Tack Coat & Site Barricading', quantity: 1, unit: 'set', rate: 12000, totalCost: 12000 }
      ]
    });

    setIsNewOrderModalOpen(false);
    setNewOrderForm({
      title: '',
      category: 'Pothole',
      priority: 'P1',
      zone: 2,
      ward: 'Ward 18 MVP Colony',
      address: '',
      contractor: 'Visakha Urban Infra Projects Ltd.',
      assignedCrewId: 'CREW-02',
      asphaltMT: 4.0,
      compactorHours: 3
    });
  };

  const totalValueINR = workOrders.reduce((sum, w) => sum + w.totalEstimatedCost, 0);
  const activeCrewsCount = crews.filter(c => c.status === 'ON_SITE' || c.status === 'EN_ROUTE').length;

  return (
    <div className="min-h-full p-4 sm:p-7 space-y-6 font-sans bg-slate-50 text-slate-900 select-none">
      
      {/* 1. HEADER STRIP */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-300">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500">GVMC Engineering Wing • Smart Operations</span>
            <span className="text-slate-300">•</span>
            <span className="text-xs font-bold text-blue-700">8 Rapid Response Teams Online</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 mt-1">
            Work Orders & Field Crew Dispatch
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 leading-relaxed mt-0.5">
            Automated work order issuance, Bill of Quantities (BOQ) materials allocation, live fleet telemetry, and Before/After AI resolution verification.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setIsNewOrderModalOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-2 shadow-md shadow-blue-500/25 transition-all cursor-pointer hover:scale-[1.02]"
          >
            <Plus className="w-4 h-4" />
            <span>Generate Work Order</span>
          </button>
        </div>
      </div>

      {/* 2. EXECUTIVE METRIC KPI CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="p-4 rounded-2xl bg-white border border-slate-300 shadow-xs kpi-accent-blue space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Total Work Orders</span>
            <FileText className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-black text-slate-900 font-mono">{workOrders.length}</div>
          <div className="text-[11px] text-slate-500">Committed Value: <span className="font-bold text-blue-700 font-mono">₹{(totalValueINR / 100000).toFixed(2)} Lakhs</span></div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-300 shadow-xs kpi-accent-emerald space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Active Field Crews</span>
            <Truck className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-emerald-700 font-mono">{activeCrewsCount} / {crews.length}</div>
          <div className="text-[11px] text-slate-500">Deployed across Zones 1–6</div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-300 shadow-xs kpi-accent-indigo space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Avg Resolution SLA</span>
            <Clock className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-2xl font-black text-indigo-700 font-mono">5.2 Hours</div>
          <div className="text-[11px] text-slate-500">GVMC P1 Compliance: <span className="font-bold text-emerald-700">98.4%</span></div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-300 shadow-xs kpi-accent-amber space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">AI Quality Verified</span>
            <ShieldCheck className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-black text-amber-700 font-mono">98.7%</div>
          <div className="text-[11px] text-slate-500">IRC Standards Certified</div>
        </div>
      </div>

      {/* 3. ACTIVE FIELD CREW FLEET MATRIX */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <HardHat className="w-4 h-4 text-blue-600" />
            <h2 className="text-sm font-extrabold uppercase tracking-wider text-slate-900">
              GVMC Rapid Response Field Fleet (8 Units)
            </h2>
          </div>
          <span className="text-xs text-slate-500">Live GPS Status Telemetry</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3.5">
          {crews.map(crew => {
            const isBusy = crew.status === 'ON_SITE' || crew.status === 'EN_ROUTE';
            return (
              <div 
                key={crew.id}
                className={`p-3.5 rounded-2xl bg-white border transition-all shadow-xs ${
                  isBusy ? 'border-blue-400 ring-1 ring-blue-100' : 'border-slate-300 hover:border-slate-400'
                }`}
              >
                <div className="flex items-start justify-between gap-2 pb-2 border-b border-slate-200">
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-slate-900">{crew.name}</span>
                    </div>
                    <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3 h-3 text-slate-400" />
                      <span className="truncate">{crew.currentLocality}</span>
                    </div>
                  </div>
                  <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider whitespace-nowrap ${
                    crew.status === 'ON_SITE' ? 'bg-blue-100 text-blue-800 border border-blue-200' :
                    crew.status === 'EN_ROUTE' ? 'bg-amber-100 text-amber-800 border border-amber-200' :
                    crew.status === 'RETURNING' ? 'bg-indigo-100 text-indigo-800 border border-indigo-200' :
                    'bg-emerald-100 text-emerald-800 border border-emerald-200'
                  }`}>
                    {crew.status.replace('_', ' ')}
                  </span>
                </div>

                <div className="mt-2.5 space-y-1.5 text-xs">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-500">Team Leader:</span>
                    <span className="font-bold text-slate-800">{crew.leader} ({crew.crewSize} Crew)</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-500">Vehicle:</span>
                    <span className="font-mono text-slate-700">{crew.vehicleNumber}</span>
                  </div>
                  <div className="flex flex-wrap gap-1 pt-1">
                    {crew.equipment.slice(0, 2).map((eq, eIdx) => (
                      <span key={eIdx} className="text-[9px] font-medium px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
                        {eq}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="mt-3 pt-2 border-t border-slate-200 flex items-center justify-between text-[11px]">
                  <span className="text-slate-500">Today: <strong className="text-slate-900">{crew.completedToday} jobs done</strong></span>
                  <button 
                    onClick={() => {
                      const nextStatus: FieldCrewStatus = crew.status === 'AVAILABLE' ? 'ON_SITE' : 'AVAILABLE';
                      incidentStore.updateCrewStatus(crew.id, nextStatus);
                    }}
                    className="text-blue-600 hover:text-blue-800 font-bold cursor-pointer"
                  >
                    Toggle Status
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. WORK ORDERS TABLE & MANAGEMENT */}
      <div className="p-5 rounded-3xl bg-white border border-slate-300 shadow-xl space-y-4">
        
        {/* FILTERS & SEARCH BAR */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-slate-200">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
            {['ALL', 'IN_REPAIR', 'DISPATCHED', 'INSPECTION_PENDING', 'COMPLETED', 'CERTIFIED'].map(st => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  statusFilter === st
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-slate-100 hover:bg-slate-200/80 text-slate-700'
                }`}
              >
                {st.replace('_', ' ')}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search orders, crews, wards..."
                className="pl-8 pr-3 py-1.5 rounded-xl bg-slate-50 border border-slate-300 text-xs text-slate-900 placeholder-slate-400 focus:outline-none w-56 font-medium"
              />
            </div>
          </div>
        </div>

        {/* WORK ORDERS LIST */}
        <div className="space-y-3">
          {filteredOrders.length === 0 ? (
            <div className="p-8 text-center text-slate-500 text-xs">
              No municipal work orders found matching the filter criteria.
            </div>
          ) : (
            filteredOrders.map(wo => {
              const isCertified = wo.status === 'CERTIFIED';
              const isPendingInspection = wo.status === 'INSPECTION_PENDING';
              return (
                <div 
                  key={wo.id}
                  className={`p-4 rounded-2xl border transition-all space-y-3 ${
                    isCertified 
                      ? 'bg-emerald-50/20 border-emerald-300' 
                      : isPendingInspection
                      ? 'bg-amber-50/30 border-amber-300 ring-1 ring-amber-200'
                      : 'bg-white border-slate-300 hover:border-slate-400 shadow-2xs'
                  }`}
                >
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono text-xs font-black text-blue-700">{wo.id}</span>
                        <span className="text-slate-300">•</span>
                        <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-md ${
                          wo.priority === 'P1' ? 'bg-red-50 text-red-700 border border-red-200' :
                          wo.priority === 'P2' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                          'bg-blue-50 text-blue-700 border border-blue-200'
                        }`}>
                          {wo.priority}
                        </span>
                        <span className="text-slate-300">•</span>
                        <span className="text-xs font-bold text-slate-900">{wo.category}</span>
                        <span className="text-slate-300">•</span>
                        <span className="text-xs text-slate-600 font-medium">{wo.ward} ({wo.address})</span>
                      </div>
                      <h3 className="text-sm font-bold text-slate-900">{wo.title}</h3>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`text-[11px] font-bold px-3 py-1 rounded-full uppercase tracking-wider ${
                        wo.status === 'CERTIFIED' ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' :
                        wo.status === 'COMPLETED' ? 'bg-teal-100 text-teal-800 border border-teal-300' :
                        wo.status === 'INSPECTION_PENDING' ? 'bg-amber-100 text-amber-800 border border-amber-300' :
                        wo.status === 'IN_REPAIR' ? 'bg-blue-100 text-blue-800 border border-blue-300' :
                        'bg-slate-100 text-slate-700 border border-slate-300'
                      }`}>
                        {wo.status.replace('_', ' ')}
                      </span>

                      {/* ACTION: INSPECT & AI VERIFY */}
                      {wo.status === 'INSPECTION_PENDING' && (
                        <button
                          onClick={() => setActiveVerificationWO(wo)}
                          className="px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs cursor-pointer"
                        >
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>AI Inspect & Certify</span>
                        </button>
                      )}

                      {/* ACTION: PRINT CERTIFICATE */}
                      <button
                        onClick={() => setActivePrintWO(wo)}
                        className="p-1.5 rounded-xl hover:bg-slate-100 border border-slate-300 text-slate-700 hover:text-slate-900 transition-colors cursor-pointer"
                        title="View Official GVMC Printable Work Order"
                      >
                        <Printer className="w-4 h-4" />
                      </button>

                      {/* ACTION: ADVANCE STATUS */}
                      {wo.status !== 'CERTIFIED' && wo.status !== 'INSPECTION_PENDING' && (
                        <button
                          onClick={() => handleAdvanceStatus(wo)}
                          className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-black text-white font-bold text-xs flex items-center gap-1 cursor-pointer"
                        >
                          <span>Advance</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* BILL OF QUANTITIES MINI BREAKDOWN */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                    <div>
                      <span className="text-[10px] text-slate-500 font-bold uppercase block">Assigned Crew & Contractor</span>
                      <div className="font-bold text-slate-800">{wo.assignedCrewName}</div>
                      <div className="text-[11px] text-slate-500">{wo.contractor}</div>
                    </div>

                    <div>
                      <span className="text-[10px] text-slate-500 font-bold uppercase block">Key Materials (BOQ)</span>
                      <div className="text-[11px] text-slate-700 truncate">
                        {wo.boqItems.map(b => `${b.quantity} ${b.unit} ${b.item.split(' ')[0]}`).join(', ')}
                      </div>
                      <div className="text-[11px] font-bold text-blue-700 font-mono">
                        Estimated: ₹{wo.totalEstimatedCost.toLocaleString('en-IN')}
                      </div>
                    </div>

                    <div>
                      <span className="text-[10px] text-slate-500 font-bold uppercase block">AI Verification Status</span>
                      {wo.aiVerificationScore ? (
                        <div className="flex items-center gap-1.5 text-emerald-700 font-bold">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Quality Score {wo.aiVerificationScore}%</span>
                        </div>
                      ) : (
                        <div className="text-slate-400 font-medium">Pending field completion</div>
                      )}
                      <div className="text-[10px] font-mono text-slate-400 truncate">QR: {wo.qrCodeHash}</div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* ==================================================================== */}
      {/* MODAL 1: BEFORE / AFTER AI RESOLUTION INSPECTION & CERTIFIER */}
      {/* ==================================================================== */}
      {activeVerificationWO && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl border border-slate-300 shadow-2xl max-w-3xl w-full p-6 space-y-5 animate-scaleUp">
            
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-800">
                    {activeVerificationWO.id}
                  </span>
                  <span className="text-xs font-bold text-slate-900">{activeVerificationWO.category}</span>
                </div>
                <h2 className="text-base font-extrabold text-slate-900 mt-0.5">
                  AI Dual-Image Repair Verification Inspector
                </h2>
              </div>
              <button 
                onClick={() => setActiveVerificationWO(null)}
                className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* DUAL IMAGE COMPARISON GRID */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* BEFORE */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-rose-700">Citizen Ingest Evidence (Before)</span>
                  <span className="text-[10px] text-slate-400 font-mono">ORIGINAL DEFECT</span>
                </div>
                <div className="rounded-2xl overflow-hidden border border-slate-300 relative h-52 bg-slate-100">
                  <img 
                    src={activeVerificationWO.beforeImage} 
                    alt="Before Repair" 
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-rose-600 text-white font-bold text-[10px]">
                    DEFECT UNRESOLVED
                  </div>
                </div>
              </div>

              {/* AFTER */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-emerald-700">Field Crew Repair Proof (After)</span>
                  <span className="text-[10px] text-slate-400 font-mono">CREW RESOLUTION</span>
                </div>
                <div className="rounded-2xl overflow-hidden border border-slate-300 relative h-52 bg-slate-100">
                  <img 
                    src={activeVerificationWO.afterImage || repairVerificationImages.potholeRepairedMVP} 
                    alt="After Repair" 
                    className="w-full h-full object-cover"
                  />
                  {isVerifying && (
                    <div className="absolute inset-0 bg-blue-600/20 backdrop-blur-xs flex items-center justify-center flex-col gap-2">
                      <RefreshCw className="w-6 h-6 text-white animate-spin" />
                      <span className="text-white text-xs font-bold font-mono">VISION NEURAL INFERENCE...</span>
                    </div>
                  )}
                  <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-emerald-600 text-white font-bold text-[10px]">
                    RESTORED SURFACE
                  </div>
                </div>
              </div>
            </div>

            {/* AI VERIFICATION RESULTS CARD */}
            {verificationResult ? (
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-300 space-y-2 animate-fadeIn text-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    <span className="font-bold text-emerald-950 text-sm">
                      Quality Resolution Score: {verificationResult.score}%
                    </span>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-emerald-200 text-emerald-900 font-mono font-bold text-[10px]">
                    IRC:111 CERTIFIED
                  </span>
                </div>
                <p className="text-emerald-900 leading-relaxed font-medium">
                  {verificationResult.notes}
                </p>
                <div className="pt-2 border-t border-emerald-200 text-[11px] text-emerald-800 font-medium">
                  Official Signoff: <strong className="text-emerald-950">Er. D. Srinivasa Murthy (Executive Engineer, GVMC)</strong>
                </div>
              </div>
            ) : (
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-300 text-xs text-slate-600 flex items-center justify-between">
                <span>Click analyze to execute Multi-Agent Vision segmentation comparison.</span>
                <button
                  onClick={handleRunAiVerification}
                  disabled={isVerifying}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{isVerifying ? 'Analyzing...' : 'Run Vision Verification'}</span>
                </button>
              </div>
            )}

            {/* FOOTER ACTIONS */}
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200">
              <button
                onClick={() => setActiveVerificationWO(null)}
                className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 font-bold text-xs cursor-pointer"
              >
                Close
              </button>
              {verificationResult && (
                <button
                  onClick={handleConfirmVerification}
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-sm"
                >
                  <Check className="w-4 h-4" />
                  <span>Certify & Issue GVMC Certificate</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* MODAL 2: PRINTABLE OFFICIAL GVMC WORK ORDER */}
      {/* ==================================================================== */}
      {activePrintWO && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl border border-slate-300 shadow-2xl max-w-2xl w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-blue-600" />
                <span className="font-bold text-xs uppercase tracking-wider text-slate-600">Official Municipal Work Order Document</span>
              </div>
              <button 
                onClick={() => setActivePrintWO(null)}
                className="p-1 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* FORMAL GVMC CERTIFICATE CONTAINER */}
            <div className="p-6 rounded-2xl border-2 border-slate-800 bg-white space-y-4 text-xs font-sans">
              <div className="text-center pb-4 border-b border-slate-300 space-y-1">
                <div className="text-sm font-black tracking-tight uppercase text-slate-900">
                  Greater Visakhapatnam Municipal Corporation (GVMC)
                </div>
                <div className="text-[11px] font-bold text-slate-600">
                  Department of Urban Engineering & Infrastructure Maintenance
                </div>
                <div className="text-[10px] font-mono text-slate-400">
                  TICKET REF: {activePrintWO.id} | DATED: {new Date(activePrintWO.scheduledDate).toLocaleDateString('en-IN')}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase font-bold">Location & Jurisdiction</span>
                  <div className="font-bold text-slate-900">{activePrintWO.ward}</div>
                  <div className="text-slate-700">{activePrintWO.address}</div>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase font-bold">Assigned Contractor / Crew</span>
                  <div className="font-bold text-slate-900">{activePrintWO.assignedCrewName}</div>
                  <div className="text-slate-700">{activePrintWO.contractor}</div>
                </div>
              </div>

              {/* BOQ TABLE */}
              <div className="space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-500 block">Bill of Quantities (BOQ)</span>
                <table className="w-full border-collapse border border-slate-300 text-left text-[11px]">
                  <thead>
                    <tr className="bg-slate-100 text-slate-700">
                      <th className="border border-slate-300 p-1.5">Item Description</th>
                      <th className="border border-slate-300 p-1.5">Qty</th>
                      <th className="border border-slate-300 p-1.5">Rate (₹)</th>
                      <th className="border border-slate-300 p-1.5 text-right">Total (₹)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {activePrintWO.boqItems.map((item, idx) => (
                      <tr key={idx}>
                        <td className="border border-slate-300 p-1.5">{item.item}</td>
                        <td className="border border-slate-300 p-1.5">{item.quantity} {item.unit}</td>
                        <td className="border border-slate-300 p-1.5 font-mono">{item.rate}</td>
                        <td className="border border-slate-300 p-1.5 text-right font-mono font-bold">{item.totalCost.toLocaleString('en-IN')}</td>
                      </tr>
                    ))}
                    <tr className="bg-slate-50 font-bold">
                      <td colSpan={3} className="border border-slate-300 p-1.5 text-right">Total Estimated Cost:</td>
                      <td className="border border-slate-300 p-1.5 text-right font-mono text-blue-700">
                        ₹{activePrintWO.totalEstimatedCost.toLocaleString('en-IN')}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* SIGNATURE & QR BLOCK */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-300 text-[11px]">
                <div className="flex items-center gap-2">
                  <div className="w-12 h-12 rounded-lg border border-slate-300 bg-slate-50 flex items-center justify-center">
                    <QrCode className="w-8 h-8 text-slate-800" />
                  </div>
                  <div>
                    <div className="font-bold text-slate-900">Digitally Verified Document</div>
                    <div className="font-mono text-[9px] text-slate-400">{activePrintWO.qrCodeHash}</div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-slate-400 text-[9px]">Authorizing Officer</div>
                  <div className="font-bold text-slate-900">{activePrintWO.officialSignoffBy || 'Er. D. Srinivasa Murthy'}</div>
                  <div className="text-slate-500 text-[10px]">Executive Engineer (Zone 2, GVMC)</div>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <button
                onClick={() => window.print()}
                className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-black text-white font-bold text-xs flex items-center gap-2 cursor-pointer shadow-sm"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Document</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* MODAL 3: GENERATE NEW MUNICIPAL WORK ORDER */}
      {/* ==================================================================== */}
      {isNewOrderModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl border border-slate-300 shadow-2xl max-w-xl w-full p-6 space-y-4 animate-scaleUp">
            
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <Wrench className="w-5 h-5 text-blue-600" />
                <h2 className="text-base font-extrabold text-slate-900">Issue New Municipal Work Order</h2>
              </div>
              <button 
                onClick={() => setIsNewOrderModalOpen(false)}
                className="p-1 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateNewOrder} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-700 font-bold mb-1">Work Order Title</label>
                <input
                  type="text"
                  required
                  value={newOrderForm.title}
                  onChange={e => setNewOrderForm({ ...newOrderForm, title: e.target.value })}
                  placeholder="e.g. RK Beach Road Asphalt Restoration & Compaction"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:border-blue-600 font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Category</label>
                  <select
                    value={newOrderForm.category}
                    onChange={e => setNewOrderForm({ ...newOrderForm, category: e.target.value as IncidentCategory })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:border-blue-600 font-medium"
                  >
                    <option value="Pothole">Pothole</option>
                    <option value="Water Leakage">Water Leakage</option>
                    <option value="Garbage Overflow">Garbage Overflow</option>
                    <option value="Broken Streetlight">Broken Streetlight</option>
                    <option value="Damaged Road">Damaged Road</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Priority</label>
                  <select
                    value={newOrderForm.priority}
                    onChange={e => setNewOrderForm({ ...newOrderForm, priority: e.target.value as IncidentPriority })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:border-blue-600 font-medium"
                  >
                    <option value="P1">P1 (Critical • 4h SLA)</option>
                    <option value="P2">P2 (High • 8h SLA)</option>
                    <option value="P3">P3 (Medium • 16h SLA)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Municipal Ward</label>
                  <input
                    type="text"
                    required
                    value={newOrderForm.ward}
                    onChange={e => setNewOrderForm({ ...newOrderForm, ward: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:border-blue-600 font-medium"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Assign Rapid Crew</label>
                  <select
                    value={newOrderForm.assignedCrewId}
                    onChange={e => setNewOrderForm({ ...newOrderForm, assignedCrewId: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:border-blue-600 font-medium"
                  >
                    {crews.map(c => (
                      <option key={c.id} value={c.id}>{c.name} ({c.status})</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Street Address</label>
                <input
                  type="text"
                  required
                  value={newOrderForm.address}
                  onChange={e => setNewOrderForm({ ...newOrderForm, address: e.target.value })}
                  placeholder="e.g. Near Siripuram Circle, VIP Road"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:border-blue-600 font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Bituminous Concrete (MT)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={newOrderForm.asphaltMT}
                    onChange={e => setNewOrderForm({ ...newOrderForm, asphaltMT: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-300 font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Compactor Roller (Hours)</label>
                  <input
                    type="number"
                    step="1"
                    value={newOrderForm.compactorHours}
                    onChange={e => setNewOrderForm({ ...newOrderForm, compactorHours: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-300 font-mono font-bold"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsNewOrderModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 font-bold text-xs cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs cursor-pointer shadow-md shadow-blue-500/25"
                >
                  Confirm & Dispatch Work Order
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
