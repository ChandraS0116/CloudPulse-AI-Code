import React from 'react';
import { 
  CheckCircle2, 
  MapPin, 
  ArrowRight, 
  X, 
  Cpu, 
  ShieldCheck,
  Building2,
  AlertTriangle,
  XCircle,
  EyeOff,
  Sparkles
} from 'lucide-react';
import { Incident } from '../../types';

interface IntelligenceResultModalProps {
  incident: Incident;
  onClose: () => void;
  onGoToCommandCenter: () => void;
  onGoToAgents: () => void;
}

export const IntelligenceResultModal: React.FC<IntelligenceResultModalProps> = ({
  incident,
  onClose,
  onGoToCommandCenter,
  onGoToAgents
}) => {
  const isRejected = incident.status === 'REJECTED' || incident.isImageValid === false;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn font-sans">
      <div className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white border border-slate-300 p-6 sm:p-7 space-y-5 text-slate-900 shadow-2xl">
        {/* CLOSE BUTTON */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 transition-all cursor-pointer border border-slate-300"
          title="Close dialog"
        >
          <X className="w-4 h-4" />
        </button>

        {/* TOP STATUS STRIP */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="font-mono font-bold text-slate-800 px-2 py-0.5 rounded bg-slate-100 border border-slate-300">
            [#{incident.id}]
          </span>
          {isRejected ? (
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-800 border border-red-300 flex items-center gap-1.5">
              <XCircle className="w-3.5 h-3.5 text-red-600" />
              <span>[REJECTED - FALSE ALARM FILTERED]</span>
            </span>
          ) : (
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
              incident.priority === 'P1' ? 'bg-red-100 text-red-800 border border-red-300' : 'bg-amber-100 text-amber-800 border border-amber-300'
            }`}>
              [PRIORITY {incident.priority} • {incident.severity}]
            </span>
          )}
          <span className="text-slate-500 font-medium text-xs">
            {new Date(incident.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>

        {/* MAIN IDENTIFICATION BANNER */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-300">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                {incident.category}
              </h2>
              {isRejected && (
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-red-100 text-red-800 border border-red-300">
                  [IMAGE REJECTED]
                </span>
              )}
            </div>
            <p className="text-xs text-slate-600 font-mono mt-1 font-medium">
              {incident.locality} • ({incident.latitude.toFixed(4)}, {incident.longitude.toFixed(4)})
            </p>
          </div>

          <div className="flex items-center gap-2 text-right">
            <div className="px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-300 text-center shadow-2xs">
              <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">[DEFECT MATCH]</div>
              <div className={`text-sm font-bold font-mono mt-0.5 ${isRejected ? 'text-red-700' : 'text-slate-900'}`}>
                {isRejected ? '0%' : `${(incident.confidence * 100).toFixed(0)}%`}
              </div>
            </div>
            <div className="px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-300 text-center shadow-2xs">
              <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">[STATUS]</div>
              <div className={`text-sm font-bold mt-0.5 ${isRejected ? 'text-red-700' : 'text-emerald-700'}`}>
                [{incident.status}]
              </div>
            </div>
          </div>
        </div>

        {/* REJECTION ALERT BANNER IF REJECTED */}
        {isRejected && (
          <div className="p-4 rounded-xl bg-red-50 border border-red-200 space-y-2.5 shadow-2xs">
            <div className="flex items-center gap-2 text-red-950 font-bold text-sm">
              <AlertTriangle className="w-4 h-4 text-red-600 flex-shrink-0" />
              <span>Vision Agent Defect Verification Result</span>
            </div>
            <p className="text-red-900 text-xs leading-relaxed font-medium">
              {incident.imageRejectionReason || 'No visible road surface, asphalt cavity, or civic infrastructure defect detected in the uploaded photograph.'}
            </p>
            {incident.detectedVisualFeatures && incident.detectedVisualFeatures.length > 0 && (
              <div className="pt-1 flex flex-wrap gap-1.5">
                {incident.detectedVisualFeatures.map((feat, i) => (
                  <span key={i} className="px-2.5 py-1 rounded-md bg-white text-slate-900 text-xs font-bold border border-red-200 shadow-2xs">
                    {feat}
                  </span>
                ))}
              </div>
            )}
          </div>
        )}

        {/* EVIDENCE PHOTO & STRUCTURED INTELLIGENCE */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
          {/* IMAGE EVIDENCE (5 COLS) */}
          <div className="md:col-span-5 space-y-2">
            <div className="text-xs font-bold text-slate-700 flex items-center justify-between">
              <span>Captured Evidence</span>
              {isRejected && (
                <span className="text-[10px] text-red-700 font-bold flex items-center gap-1">
                  <EyeOff className="w-3 h-3 text-red-600" /> Non-Defect
                </span>
              )}
            </div>
            <div className={`aspect-[4/3] rounded-xl overflow-hidden border bg-slate-100 relative shadow-inner ${
              isRejected ? 'border-red-300' : 'border-slate-300'
            }`}>
              <img 
                src={incident.image} 
                alt="Defect analysis" 
                className="w-full h-full object-cover"
              />
              {isRejected && (
                <div className="absolute bottom-2 left-2 right-2 bg-red-900/90 text-white border border-red-700 px-2 py-1 rounded text-[11px] text-center font-bold">
                  [STATUS: NO ROAD DEFECT FOUND]
                </div>
              )}
            </div>
          </div>

          {/* STRUCTURED INTELLIGENCE SECTIONS (7 COLS) */}
          <div className="md:col-span-7 space-y-3 text-xs">
            {/* 1. AI FINDINGS */}
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-300 space-y-1 text-slate-800">
              <div className="text-slate-900 font-bold flex items-center gap-1.5 uppercase text-[11px] tracking-wider">
                <Cpu className={`w-3.5 h-3.5 ${isRejected ? 'text-red-600' : 'text-blue-600'}`} />
                <span>[VISUAL ANALYSIS]</span>
              </div>
              <p className="text-slate-700 leading-relaxed text-xs">
                {isRejected 
                  ? (incident.imageRejectionReason || 'Computer vision verified that the image pixels do not exhibit asphalt erosion, cavity shadows, or civic structural damage.')
                  : `Vision model verified authentic ${incident.category} defect features with ${(incident.confidence * 100).toFixed(0)}% confidence index.`}
              </p>
            </div>

            {/* 2. LOCATION INTELLIGENCE */}
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-300 space-y-1 text-slate-800">
              <div className="text-slate-900 font-bold flex items-center gap-1.5 uppercase text-[11px] tracking-wider">
                <MapPin className="w-3.5 h-3.5 text-amber-600" />
                <span>[GEOSPATIAL CORRELATION]</span>
              </div>
              <p className="text-slate-700 leading-relaxed text-xs">
                {isRejected 
                  ? `Geofence verified location within ${incident.ward || 'GVMC Zone'}, but spatial correlation was aborted to avoid corrupting road distress heatmaps.`
                  : <span><strong>{incident.nearbyCount} similar reports</strong> detected within 800m over the past 48 hours. Spatial density indicates ongoing sub-base degradation.</span>}
              </p>
            </div>

            {/* 3. CONSENSUS RATIONALE */}
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-300 space-y-1 text-slate-800">
              <div className="text-slate-900 font-bold flex items-center gap-1.5 uppercase text-[11px] tracking-wider">
                <ShieldCheck className={`w-3.5 h-3.5 ${isRejected ? 'text-red-600' : 'text-indigo-600'}`} />
                <span>[DECISION RATIONALE]</span>
              </div>
              <p className="text-slate-700 leading-relaxed text-xs">
                {incident.rationale}
              </p>
            </div>
          </div>
        </div>

        {/* ACTION OR REJECTION BANNER */}
        {isRejected ? (
          <div className="p-4 rounded-xl bg-red-50 border border-red-300 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-slate-800">
            <div className="space-y-0.5">
              <div className="text-xs text-red-800 font-bold flex items-center gap-1.5">
                <XCircle className="w-4 h-4 text-red-600" />
                <span>[FIELD DISPATCH ABORTED - FALSE ALARM BLOCKED]</span>
              </div>
              <div className="text-xs font-bold text-slate-900">
                No Municipal Work Order Dispatched
              </div>
              <p className="text-xs text-slate-600 max-w-xl">
                {incident.recommendedAction}
              </p>
            </div>

            <span className="px-3 py-1 rounded-full bg-red-100 text-red-800 border border-red-300 text-xs font-bold self-end sm:self-center">
              [REJECTED]
            </span>
          </div>
        ) : (
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-300 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-slate-800">
            <div className="space-y-0.5">
              <div className="text-xs text-emerald-800 font-bold flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>[MUNICIPAL WORK ORDER DISPATCHED]</span>
              </div>
              <div className="text-xs font-bold text-slate-900">
                Case #{incident.caseId} • {incident.assignedTeam}
              </div>
              <p className="text-xs text-slate-600 max-w-xl">
                {incident.recommendedAction}
              </p>
            </div>

            <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 text-xs font-bold self-end sm:self-center">
              [ASSIGNED]
            </span>
          </div>
        )}

        {/* BOTTOM ACTION BUTTONS */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
          <button
            onClick={onGoToAgents}
            className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 text-xs font-bold flex items-center gap-2 transition-all cursor-pointer"
          >
            <Cpu className="w-4 h-4 text-slate-600" />
            <span>View Agent Topology</span>
          </button>

          <div className="flex items-center gap-2.5">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 text-xs font-bold cursor-pointer transition-all"
            >
              Dismiss
            </button>
            <button
              onClick={onGoToCommandCenter}
              className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-2 transition-all cursor-pointer shadow-xs"
            >
              <span>View in Command Center</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
