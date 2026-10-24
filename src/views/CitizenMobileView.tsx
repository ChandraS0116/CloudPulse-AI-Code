import React, { useState, useEffect } from 'react';
import { 
  Camera, 
  MapPin, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  ArrowRight, 
  ArrowLeft, 
  RefreshCw, 
  ShieldCheck, 
  ChevronRight, 
  Smartphone, 
  FileText, 
  Upload, 
  Eye, 
  Zap, 
  Layers, 
  Search, 
  Check, 
  Building2,
  XCircle,
  EyeOff,
  AlertCircle
} from 'lucide-react';
import { IncidentCategory, Incident, IncidentStatus } from '../types';
import { VIZAG_LANDMARKS, VizagLandmark, isPointInVizagOperationalZone } from '../services/geo/vizagGeofence';
import { sampleImages } from '../services/mock/seedData';
import { agentOrchestrator, WorkflowProgress } from '../services/agents/agentOrchestrator';
import { incidentStore } from '../services/incidentStore';

interface CitizenMobileViewProps {
  isPhoneSimulator?: boolean;
}

export const CitizenMobileView: React.FC<CitizenMobileViewProps> = ({ isPhoneSimulator }) => {
  const [activeTab, setActiveTab] = useState<'REPORT' | 'MY_REPORTS'>('REPORT');
  const [step, setStep] = useState<number>(1);

  // Form State
  const [category, setCategory] = useState<IncidentCategory>('Pothole');
  const [selectedPhoto, setSelectedPhoto] = useState<string>(sampleImages.potholeMVP);
  const [selectedLandmark, setSelectedLandmark] = useState<VizagLandmark>(VIZAG_LANDMARKS[0]);
  const [customDescription, setCustomDescription] = useState<string>('');
  const [reporterName, setReporterName] = useState<string>('Citizen Sai');
  const [urgency, setUrgency] = useState<'CRITICAL' | 'HIGH' | 'NORMAL'>('CRITICAL');

  // Multi-agent submission state
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [workflowProgress, setWorkflowProgress] = useState<WorkflowProgress | null>(null);
  const [submissionResult, setSubmissionResult] = useState<{
    incident: Incident;
    isDuplicate: boolean;
    masterId?: string;
  } | null>(null);

  // My Reports list from incidentStore
  const [myReports, setMyReports] = useState<Incident[]>([]);

  useEffect(() => {
    const updateReports = () => {
      setMyReports(incidentStore.getIncidents());
    };
    updateReports();
    return incidentStore.subscribe(updateReports);
  }, []);

  // Preset demo photo choices
  const presetPhotos = [
    {
      label: 'MVP Double Road Crater',
      category: 'Pothole' as IncidentCategory,
      landmark: VIZAG_LANDMARKS[0], // MVP Colony
      image: sampleImages.potholeMVP,
      desc: 'Deep road cavity on main double road causing sharp vehicle braking.',
      isTest: false
    },
    {
      label: 'Non-Road Sample (Test)',
      category: 'Pothole' as IncidentCategory,
      landmark: VIZAG_LANDMARKS[0], // MVP Colony
      image: sampleImages.selfieTest,
      desc: 'Sample non-infrastructure photo to verify automated quality gate.',
      isTest: true
    },
    {
      label: 'Kanithi Road Pipeline Rupture',
      category: 'Water Leakage' as IncidentCategory,
      landmark: VIZAG_LANDMARKS[5], // Gajuwaka
      image: sampleImages.waterLeakGajuwaka,
      desc: 'Municipal drinking water pipeline burst flooding roadway.',
      isTest: false
    },
    {
      label: 'RTC Complex Waste Overflow',
      category: 'Garbage Overflow' as IncidentCategory,
      landmark: VIZAG_LANDMARKS[3], // Dwaraka Nagar
      image: sampleImages.garbageDwaraka,
      desc: 'Commercial bin overflow spilling onto pedestrian footpath.',
      isTest: false
    },
    {
      label: 'Indoor Scene (Test)',
      category: 'Pothole' as IncidentCategory,
      landmark: VIZAG_LANDMARKS[3], // Dwaraka Nagar
      image: sampleImages.indoorPetTest,
      desc: 'Indoor non-civic scene to test defect classification gate.',
      isTest: true
    },
    {
      label: 'Madhurawada Damaged Streetlight',
      category: 'Broken Streetlight' as IncidentCategory,
      landmark: VIZAG_LANDMARKS[6], // Madhurawada
      image: sampleImages.streetlightMadhurawada,
      desc: 'Severed electrical cable dangling over bike lane.',
      isTest: false
    }
  ];

  const handleApplyPreset = (preset: typeof presetPhotos[0]) => {
    setCategory(preset.category);
    setSelectedLandmark(preset.landmark);
    setSelectedPhoto(preset.image);
    setCustomDescription(preset.desc);
  };

  const handleCustomPhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setSelectedPhoto(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleStartSubmission = async () => {
    setIsSubmitting(true);
    setSubmissionResult(null);

    try {
      const result = await agentOrchestrator.runAutonomousInvestigation(
        {
          image: selectedPhoto,
          latitude: selectedLandmark.lat,
          longitude: selectedLandmark.lng,
          locality: selectedLandmark.locality,
          description: customDescription || `${category} reported near ${selectedLandmark.name}`,
          categoryHint: category,
          reporterName
        },
        (progress) => {
          setWorkflowProgress(progress);
        }
      );

      setSubmissionResult(result);
    } catch (err) {
      console.error('Submission error:', err);
    } finally {
      setIsSubmitting(false);
      setStep(6);
    }
  };

  const geofenceCheck = isPointInVizagOperationalZone(selectedLandmark.lat, selectedLandmark.lng);

  return (
    <div className="w-full min-h-screen bg-transparent text-slate-900 flex flex-col items-center justify-start p-1 sm:p-4 select-none font-sans">
      {/* MOBILE DEVICE CONTAINER / FLAGSHIP SMARTPHONE FRAME */}
      <div className="phone-canvas w-full max-w-md bg-white border-[7px] border-slate-800 rounded-[44px] overflow-hidden shadow-2xl flex flex-col min-h-[730px] relative text-slate-900">
        {/* DYNAMIC ISLAND / SPEAKER NOTCH */}
        <div className="w-full pt-3 pb-1 flex justify-center bg-slate-900">
          <div className="w-24 h-4 bg-black rounded-full flex items-center justify-end px-2">
            <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
          </div>
        </div>

        {/* MOBILE APP HEADER */}
        <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-800 p-4 pt-3 text-white shadow-md">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white font-bold shadow-xs">
                <Building2 className="w-4 h-4 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-white tracking-tight">Citizen Civic Care</span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-white/20 text-white font-semibold font-mono">
                    GVMC
                  </span>
                </div>
                <p className="text-[11px] text-blue-100">Visakhapatnam Municipal Services</p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-600 text-white text-[10px] font-extrabold uppercase tracking-wider shadow-xs">
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
              <span>[PORTAL LIVE]</span>
            </div>
          </div>

          {/* TAB BAR (REPORT vs MY REPORTS) */}
          <div className="grid grid-cols-2 gap-1 p-1 mt-3 rounded-xl bg-black/20 text-xs">
            <button
              onClick={() => {
                setActiveTab('REPORT');
                if (step === 6) setStep(1);
              }}
              className={`py-2 rounded-lg font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                activeTab === 'REPORT'
                  ? 'bg-white text-blue-900 shadow-sm'
                  : 'text-blue-100 hover:text-white'
              }`}
            >
              <Camera className="w-3.5 h-3.5" />
              <span>NEW REPORT</span>
            </button>

            <button
              onClick={() => setActiveTab('MY_REPORTS')}
              className={`py-2 rounded-lg font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                activeTab === 'MY_REPORTS'
                  ? 'bg-white text-blue-900 shadow-sm'
                  : 'text-blue-100 hover:text-white'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>MY REPORTS ({myReports.length})</span>
            </button>
          </div>
        </div>

        {/* ==================================================================== */}
        {/* TAB 1: NEW ISSUE REPORTING FLOW */}
        {/* ==================================================================== */}
        {activeTab === 'REPORT' && (
          <div className="flex-1 flex flex-col p-4 overflow-y-auto bg-slate-50/50">

            {/* STEP PROGRESS BAR */}
            {step <= 5 && !isSubmitting && (
              <div className="flex items-center justify-between mb-4 px-1 text-xs">
                <span className="text-blue-700 font-bold">Step {step} of 5</span>
                <span className="text-slate-600 font-medium">
                  {step === 1 && 'Select Category'}
                  {step === 2 && 'Upload Photo'}
                  {step === 3 && 'Location'}
                  {step === 4 && 'Details'}
                  {step === 5 && 'Review'}
                </span>
              </div>
            )}

            {/* ---------------------------------------------------- */}
            {/* SCREEN 1: CATEGORY SELECTION */}
            {/* ---------------------------------------------------- */}
            {step === 1 && !isSubmitting && (
              <div className="space-y-4 animate-fadeIn">
                <div className="space-y-0.5">
                  <h2 className="text-sm font-bold text-slate-900">Select infrastructure issue type</h2>
                  <p className="text-xs text-slate-600">Choose the category matching the observed defect.</p>
                </div>

                <div className="grid grid-cols-2 gap-2.5 pt-1">
                  {(['Pothole', 'Water Leakage', 'Garbage Overflow', 'Broken Streetlight', 'Damaged Road', 'Drainage Blockage'] as IncidentCategory[]).map(cat => (
                    <button
                      key={cat}
                      onClick={() => {
                        setCategory(cat);
                        setStep(2);
                      }}
                      className={`p-3.5 rounded-xl border text-left flex flex-col justify-between h-24 transition-all cursor-pointer ${
                        category === cat
                          ? 'bg-blue-50 border-2 border-blue-600 shadow-sm'
                          : 'bg-white border-slate-300 hover:border-blue-600 hover:bg-slate-50/80 shadow-2xs'
                      }`}
                    >
                      <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center text-slate-700">
                        {cat === 'Pothole' && <AlertTriangle className="w-4 h-4 text-red-600" />}
                        {cat === 'Water Leakage' && <Zap className="w-4 h-4 text-blue-600" />}
                        {cat === 'Garbage Overflow' && <Layers className="w-4 h-4 text-amber-600" />}
                        {cat === 'Broken Streetlight' && <Clock className="w-4 h-4 text-amber-600" />}
                        {cat === 'Damaged Road' && <AlertTriangle className="w-4 h-4 text-orange-600" />}
                        {cat === 'Drainage Blockage' && <RefreshCw className="w-4 h-4 text-slate-700" />}
                      </div>
                      <span className="text-xs font-bold text-slate-900">{cat}</span>
                    </button>
                  ))}
                </div>

                {/* DEMO PRESETS */}
                <div className="pt-3 border-t border-slate-300 space-y-2">
                  <div className="text-xs text-slate-700 font-bold uppercase tracking-wider text-[11px]">[QUICK DEMONSTRATION PRESETS]</div>

                  <div className="space-y-1.5">
                    {presetPhotos.map((preset, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          handleApplyPreset(preset);
                          setStep(5);
                        }}
                        className={`w-full p-2.5 rounded-xl border text-left flex items-center justify-between text-xs transition-all cursor-pointer ${
                          preset.isTest
                            ? 'bg-amber-50 hover:bg-amber-100/60 border-amber-300 text-amber-950'
                            : 'bg-white hover:bg-slate-50 border-slate-300 text-slate-900 shadow-2xs'
                        }`}
                      >
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-slate-900">{preset.label}</span>
                            {preset.isTest && (
                              <span className="text-[9px] uppercase px-1.5 py-0.2 rounded bg-amber-100 text-amber-800 border border-amber-300 font-mono font-bold">
                                [TEST SAMPLE]
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-slate-600 font-medium">{preset.landmark.name}</div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-slate-500" />
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ---------------------------------------------------- */}
            {/* SCREEN 2: PHOTO EVIDENCE CAPTURE */}
            {/* ---------------------------------------------------- */}
            {step === 2 && !isSubmitting && (
              <div className="space-y-4 animate-fadeIn">
                <div className="space-y-0.5">
                  <h2 className="text-sm font-bold text-slate-900">Upload or Capture Photo</h2>
                  <p className="text-xs text-slate-600">Clear photos help the field team identify severity accurately.</p>
                </div>

                {/* PHOTO PREVIEW */}
                <div className="relative w-full h-52 rounded-2xl overflow-hidden border border-slate-300 bg-slate-100 flex flex-col items-center justify-center group shadow-xs">
                  <img 
                    src={selectedPhoto} 
                    alt="Defect Preview" 
                    className="w-full h-full object-cover" 
                  />
                  <div className="absolute top-2.5 right-2.5 px-2.5 py-1 rounded-full bg-white/95 backdrop-blur-md border border-slate-300 text-[10px] font-bold text-slate-800 shadow-xs">
                    [EVIDENCE ATTACHED]
                  </div>
                </div>

                {/* BUTTONS */}
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <label className="p-2.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-300 text-slate-800 font-semibold text-xs flex items-center justify-center gap-2 cursor-pointer transition-all shadow-2xs">
                    <Camera className="w-4 h-4 text-blue-600" />
                    <span>Upload Image</span>
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={handleCustomPhotoUpload} 
                      className="hidden" 
                    />
                  </label>

                  <button
                    onClick={() => setStep(3)}
                    className="p-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm cursor-pointer transition-all"
                  >
                    <span>Continue</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex justify-between pt-2">
                  <button
                    onClick={() => setStep(1)}
                    className="text-xs text-slate-600 hover:text-slate-900 font-medium flex items-center gap-1 cursor-pointer"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" /> Back
                  </button>
                </div>
              </div>
            )}

            {/* ---------------------------------------------------- */}
            {/* SCREEN 3: VIZAG LOCATION */}
            {/* ---------------------------------------------------- */}
            {step === 3 && !isSubmitting && (
              <div className="space-y-4 animate-fadeIn">
                <div className="space-y-0.5">
                  <h2 className="text-sm font-bold text-slate-900">Select Location</h2>
                  <p className="text-xs text-slate-600">Validated against Visakhapatnam operational sectors.</p>
                </div>

                {/* GEOFENCE BADGE */}
                <div className={`p-3 rounded-xl border flex items-start gap-2.5 text-xs ${
                  geofenceCheck.inZone 
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-950' 
                    : 'bg-red-50 border-red-200 text-red-950'
                }`}>
                  {geofenceCheck.inZone ? (
                    <ShieldCheck className="w-4 h-4 flex-shrink-0 text-emerald-600 mt-0.5" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 flex-shrink-0 text-red-600 mt-0.5" />
                  )}
                  <div className="space-y-0.5 text-[11px]">
                    <div className="font-bold">
                      {geofenceCheck.inZone ? 'Within GVMC Operational Zone' : 'Outside Supported Zone'}
                    </div>
                    <p className="text-slate-700 text-[10px] leading-tight">
                      {geofenceCheck.message}
                    </p>
                  </div>
                </div>

                {/* LANDMARK SELECTION LIST */}
                <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
                  {VIZAG_LANDMARKS.map(lm => (
                    <button
                      key={lm.id}
                      onClick={() => setSelectedLandmark(lm)}
                      className={`w-full p-2.5 rounded-xl border text-left flex items-start justify-between text-xs transition-all cursor-pointer ${
                        selectedLandmark.id === lm.id
                          ? 'bg-blue-50 border-2 border-blue-600 text-blue-950 shadow-xs'
                          : 'bg-white border-slate-300 hover:border-blue-600 text-slate-800 shadow-2xs'
                      }`}
                    >
                      <div className="space-y-0.5">
                        <div className="font-bold text-slate-900">{lm.name}</div>
                        <div className="text-[11px] text-slate-600">{lm.ward} • {lm.roadName}</div>
                      </div>
                      {selectedLandmark.id === lm.id && (
                        <Check className="w-4 h-4 text-blue-600 flex-shrink-0 mt-1" />
                      )}
                    </button>
                  ))}
                </div>

                <div className="flex items-center justify-between pt-2">
                  <button
                    onClick={() => setStep(2)}
                    className="text-xs text-slate-600 hover:text-slate-900 font-medium flex items-center gap-1 cursor-pointer"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" /> Back
                  </button>

                  <button
                    onClick={() => setStep(4)}
                    className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1 cursor-pointer shadow-sm"
                  >
                    <span>Continue</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* ---------------------------------------------------- */}
            {/* SCREEN 4: CITIZEN DETAILS */}
            {/* ---------------------------------------------------- */}
            {step === 4 && !isSubmitting && (
              <div className="space-y-4 animate-fadeIn">
                <div className="space-y-0.5">
                  <h2 className="text-sm font-bold text-slate-900">Observation Details</h2>
                  <p className="text-xs text-slate-600">Add any additional notes for the maintenance crew.</p>
                </div>

                <div className="space-y-3 text-xs">
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Your Name</label>
                    <input
                      type="text"
                      value={reporterName}
                      onChange={(e) => setReporterName(e.target.value)}
                      placeholder="e.g. Citizen Sai"
                      className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-slate-900 font-medium focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Description / Notes</label>
                    <textarea
                      rows={3}
                      value={customDescription}
                      onChange={(e) => setCustomDescription(e.target.value)}
                      placeholder="e.g. Sharp road cavity on main lane. Vehicles swerving into opposing traffic."
                      className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-slate-900 font-medium focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Perceived Urgency</label>
                    <div className="grid grid-cols-3 gap-2">
                      {(['CRITICAL', 'HIGH', 'NORMAL'] as const).map(u => (
                        <button
                          key={u}
                          type="button"
                          onClick={() => setUrgency(u)}
                          className={`py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                            urgency === u
                              ? 'bg-red-50 text-red-900 border-2 border-red-500 shadow-xs'
                              : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                          }`}
                        >
                          {u === 'CRITICAL' ? 'Critical' : u === 'HIGH' ? 'High' : 'Normal'}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <button
                    onClick={() => setStep(3)}
                    className="text-xs text-slate-600 hover:text-slate-900 font-medium flex items-center gap-1 cursor-pointer"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" /> Back
                  </button>

                  <button
                    onClick={() => setStep(5)}
                    className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1 cursor-pointer shadow-sm"
                  >
                    <span>Review Report</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* ---------------------------------------------------- */}
            {/* SCREEN 5: REVIEW & DISPATCH */}
            {/* ---------------------------------------------------- */}
            {step === 5 && !isSubmitting && (
              <div className="space-y-4 animate-fadeIn">
                <div className="space-y-0.5">
                  <h2 className="text-sm font-bold text-slate-900">Review Submission</h2>
                  <p className="text-xs text-slate-600">Your report will be processed and routed to the responsible department.</p>
                </div>

                {/* SUMMARY CARD */}
                <div className="p-3.5 rounded-2xl bg-white border border-slate-300 space-y-3 text-xs shadow-xs">
                  <div className="flex items-center gap-3">
                    <img 
                      src={selectedPhoto} 
                      alt="Thumbnail" 
                      className="w-14 h-14 rounded-xl object-cover border border-slate-300" 
                    />
                    <div>
                      <div className="text-sm font-bold text-slate-900">{category}</div>
                      <div className="text-blue-700 text-xs font-semibold">{selectedLandmark.name}</div>
                      <div className="text-slate-600 text-[11px]">{selectedLandmark.ward}</div>
                    </div>
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-300 text-xs text-slate-800 leading-relaxed font-medium">
                    "{customDescription || `Observed ${category} on ${selectedLandmark.roadName}`}"
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs pt-1 border-t border-slate-300">
                    <div>
                      <span className="text-slate-500 block text-[11px] font-medium">Reporter</span>
                      <span className="text-slate-900 font-bold">{reporterName}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[11px] font-medium">Jurisdiction</span>
                      <span className="text-emerald-700 font-bold">[GVMC VERIFIED]</span>
                    </div>
                  </div>
                </div>

                {/* SUBMIT BUTTON */}
                <button
                  onClick={handleStartSubmission}
                  className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-600/20 flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-[0.98]"
                >
                  <span>Submit Incident Report</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <div className="flex justify-between pt-1">
                  <button
                    onClick={() => setStep(4)}
                    className="text-xs text-slate-600 hover:text-slate-900 font-medium flex items-center gap-1 cursor-pointer"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" /> Back
                  </button>
                </div>
              </div>
            )}

            {/* ---------------------------------------------------- */}
            {/* SUBMITTING STATE: CLEAN PROGRESS CHECKLIST */}
            {/* ---------------------------------------------------- */}
            {isSubmitting && (
              <div className="flex-1 flex flex-col justify-center space-y-4 py-8 animate-fadeIn">
                <div className="text-center space-y-1">
                  <div className="inline-flex p-3 rounded-2xl bg-blue-50 border border-blue-200 text-blue-600 shadow-xs">
                    <RefreshCw className="w-6 h-6 animate-spin" />
                  </div>
                  <h3 className="text-sm font-bold text-slate-900">Processing Report</h3>
                  <p className="text-xs text-slate-600">Automated triage & dispatch sequence</p>
                </div>

                {/* CLEAN 7-STAGE SEQUENCE */}
                <div className="space-y-1.5 p-3.5 rounded-2xl bg-white border border-slate-300 text-xs shadow-xs">
                  {[
                    { name: 'Orchestrator', desc: 'Validating report metadata' },
                    { name: 'Vision Agent', desc: 'Analyzing defect photo' },
                    { name: 'Geo Agent', desc: 'Validating municipal zone' },
                    { name: 'Triage Agent', desc: 'Assessing traffic risk & priority' },
                    { name: 'Correlation Agent', desc: 'Checking spatial duplicates (<50m)' },
                    { name: 'Decision Agent', desc: 'Assigning resolution SLA' },
                    { name: 'Monitoring Agent', desc: 'Routing work order to field unit' }
                  ].map((agent, i) => {
                    const agentName = agent.name as import('../types').AgentName;
                    const state = workflowProgress?.agentStates[agentName] || 'WAITING';
                    return (
                      <div key={i} className="flex items-center justify-between py-1.5 border-b border-slate-100 last:border-0">
                        <div className="flex items-center gap-2.5">
                          {state === 'COMPLETED' ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                          ) : state === 'RUNNING' ? (
                            <RefreshCw className="w-4 h-4 text-blue-600 animate-spin flex-shrink-0" />
                          ) : (
                            <span className="w-4 h-4 rounded-full border border-slate-300 flex items-center justify-center text-[10px] text-slate-500 font-bold">
                              {i + 1}
                            </span>
                          )}
                          <span className={`text-xs ${
                            state === 'COMPLETED' ? 'text-slate-900 font-bold' : state === 'RUNNING' ? 'text-blue-700 font-bold' : 'text-slate-500 font-medium'
                          }`}>
                            {agent.desc}
                          </span>
                        </div>

                        <span className="text-[11px]">
                          {state === 'COMPLETED' ? (
                            <span className="text-emerald-700 font-bold">{workflowProgress?.latencies[agentName] || 220}ms</span>
                          ) : state === 'RUNNING' ? (
                            <span className="text-blue-600 font-semibold">Processing...</span>
                          ) : (
                            <span className="text-slate-400">Queued</span>
                          )}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ---------------------------------------------------- */}
            {/* SCREEN 6: CONFIRMATION & TRACKING CARD */}
            {/* ---------------------------------------------------- */}
            {step === 6 && submissionResult && !isSubmitting && (
              <div className="space-y-4 animate-fadeIn">
                {submissionResult.incident.status === 'REJECTED' || submissionResult.incident.isImageValid === false ? (
                  <div className="space-y-3">
                    {/* REJECTION CARD - HIGH CONTRAST LIGHT THEME */}
                    <div className="p-5 rounded-2xl bg-red-50 border border-red-200 text-center space-y-3 shadow-sm">
                      <div className="w-12 h-12 rounded-full bg-red-100 text-red-700 border border-red-200 flex items-center justify-center mx-auto shadow-2xs">
                        <AlertTriangle className="w-6 h-6" />
                      </div>
                      <h3 className="text-base font-extrabold text-red-950">Submission Not Accepted</h3>
                      <div className="text-xs font-bold text-red-900 bg-red-100 px-3.5 py-1 rounded-full border border-red-300 inline-block font-mono">
                        [STATUS: REJECTED - NO CIVIC HAZARD DETECTED]
                      </div>
                      <p className="text-xs text-red-950 font-medium leading-relaxed px-1">
                        {submissionResult.incident.imageRejectionReason || 'The AI Vision Agent analyzed your photo and verified that no visible road surface, asphalt cavity, or civic infrastructure defect was detected.'}
                      </p>
                    </div>

                    {/* DETECTED FEATURES / QUALITY GATE AUDIT */}
                    {submissionResult.incident.detectedVisualFeatures && submissionResult.incident.detectedVisualFeatures.length > 0 && (
                      <div className="p-3.5 rounded-xl bg-white border border-slate-300 space-y-2 text-xs shadow-2xs">
                        <span className="text-slate-900 text-xs block font-bold">[VISUAL CHARACTERISTICS EVALUATED]</span>
                        <div className="flex flex-wrap gap-1.5">
                          {submissionResult.incident.detectedVisualFeatures.map((f, i) => (
                            <span key={i} className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-900 font-bold text-[11px] font-mono border border-slate-300">
                              {f}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* OPERATIONAL DISPATCH CANCELLATION METRICS */}
                    <div className="p-4 rounded-xl bg-white border border-slate-300 space-y-2.5 text-xs text-slate-800 shadow-2xs">
                      <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                        <span className="text-slate-600 font-medium">Work Order Dispatch:</span>
                        <span className="text-red-700 font-bold">[CANCELLED - FALSE ALARM]</span>
                      </div>
                      <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                        <span className="text-slate-600 font-medium">Municipal Crew:</span>
                        <span className="text-slate-800 font-semibold">None Dispatched</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-600 font-medium">Defect Match Score:</span>
                        <span className="text-red-700 font-bold">0% (Non-Civic Image)</span>
                      </div>
                    </div>

                    <div className="space-y-2 pt-2">
                      <button
                        onClick={() => {
                          setStep(2);
                          setSubmissionResult(null);
                        }}
                        className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-600/20 flex items-center justify-center gap-2 cursor-pointer transition-all"
                      >
                        <Camera className="w-4 h-4" />
                        <span>Re-take Authentic Defect Photo & Retry</span>
                      </button>

                      <button
                        onClick={() => setActiveTab('MY_REPORTS')}
                        className="w-full py-2.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-300 text-slate-800 font-semibold text-xs cursor-pointer transition-all shadow-2xs"
                      >
                        View in My Reports
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-200 text-center space-y-3 shadow-sm">
                      <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 border border-emerald-200 flex items-center justify-center mx-auto shadow-2xs">
                        <CheckCircle2 className="w-6 h-6" />
                      </div>
                      <h3 className="text-base font-extrabold text-emerald-950">Report Ingested Successfully</h3>
                      <div className="text-xs font-bold text-blue-900 bg-blue-50 px-3.5 py-1 rounded-full border border-blue-200 inline-block font-mono">
                        [TRACKING ID: #{submissionResult.incident.id}]
                      </div>
                    </div>

                    {/* DUPLICATE NOTIFICATION IF MERGED */}
                    {submissionResult.isDuplicate && (
                      <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 space-y-1 text-xs shadow-2xs">
                        <div className="flex items-center gap-2 text-amber-900 font-bold">
                          <Layers className="w-4 h-4 text-amber-700" />
                          <span>[DUPLICATE REPORT CONSOLIDATED]</span>
                        </div>
                        <p className="text-slate-700 text-[11px] leading-relaxed">
                          A report for {submissionResult.incident.category} was already active within 50 meters. Your submission has been <span className="text-amber-900 font-bold">merged into Incident #{submissionResult.masterId}</span>, strengthening its priority with the maintenance team.
                        </p>
                      </div>
                    )}

                    {/* DETAILS SUMMARY */}
                    <div className="p-4 rounded-xl bg-white border border-slate-300 space-y-2.5 text-xs text-slate-800 shadow-2xs">
                      <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                        <span className="text-slate-600 font-medium">Assigned Department:</span>
                        <span className="text-slate-900 font-bold">{submissionResult.incident.department || 'GVMC Operations'}</span>
                      </div>
                      <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                        <span className="text-slate-600 font-medium">Target Resolution SLA:</span>
                        <span className="text-blue-700 font-bold">{submissionResult.incident.targetResolutionHours || 24} Hours</span>
                      </div>
                      <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                        <span className="text-slate-600 font-medium">Assigned Priority:</span>
                        <span className="text-red-700 font-bold">{submissionResult.incident.priority} ({submissionResult.incident.severity})</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-600 font-medium">Confidence Score:</span>
                        <span className="text-emerald-700 font-bold">{(submissionResult.incident.confidence * 100).toFixed(0)}%</span>
                      </div>
                    </div>

                    {/* ACTION BUTTONS */}
                    <div className="space-y-2 pt-2">
                      <button
                        onClick={() => setActiveTab('MY_REPORTS')}
                        className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-600/20 flex items-center justify-center gap-1.5 cursor-pointer transition-all"
                      >
                        <span>View in My Reports</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => {
                          setStep(1);
                          setSubmissionResult(null);
                        }}
                        className="w-full py-2.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-300 text-slate-800 font-semibold text-xs cursor-pointer transition-all shadow-2xs"
                      >
                        Report Another Issue
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        )}

        {/* ==================================================================== */}
        {/* TAB 2: MY CIVIC REPORTS */}
        {/* ==================================================================== */}
        {activeTab === 'MY_REPORTS' && (
          <div className="flex-1 flex flex-col p-4 overflow-y-auto space-y-3 bg-slate-50/50">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-bold text-slate-900">[YOUR SUBMITTED REPORTS]</h2>
              <span className="text-[11px] text-slate-600 font-medium">[LIVE STATUS TRACKING]</span>
            </div>

            {myReports.length === 0 ? (
              <div className="text-center py-12 text-slate-500 text-xs font-medium">
                No reports submitted yet.
              </div>
            ) : (
              myReports.map((inc) => (
                <div
                  key={inc.id}
                  className="p-3.5 rounded-xl bg-white border border-slate-300 space-y-2.5 text-xs shadow-2xs"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900">#{inc.id}</span>
                        <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                          inc.status === 'REJECTED' ? 'bg-red-100 text-red-900 border border-red-300' :
                          inc.severity === 'CRITICAL' ? 'bg-red-100 text-red-900 border border-red-300' :
                          inc.severity === 'HIGH' ? 'bg-amber-100 text-amber-900 border border-amber-300' :
                          'bg-blue-100 text-blue-900 border border-blue-300'
                        }`}>
                          [{inc.status === 'REJECTED' ? 'REJECTED' : inc.priority}]
                        </span>
                        {inc.duplicateCount > 0 && (
                          <span className="text-[10px] bg-slate-100 text-slate-700 font-semibold px-1.5 py-0.2 rounded border border-slate-300">
                            +{inc.duplicateCount} merged
                          </span>
                        )}
                      </div>
                      <div className="text-xs font-bold text-slate-900 mt-1">{inc.category}</div>
                      <div className="text-[11px] text-slate-600 font-medium">{inc.locality}</div>
                    </div>

                    <img 
                      src={inc.image} 
                      alt="Thumbnail" 
                      className="w-12 h-12 rounded-lg object-cover border border-slate-300" 
                    />
                  </div>

                  {/* PROGRESSION OR REJECTION STRIP */}
                  <div className="pt-2 border-t border-slate-100 space-y-1.5">
                    <div className="flex items-center justify-between text-[11px] text-slate-600 font-medium">
                      <span>Status</span>
                      <span className={`font-bold ${inc.status === 'REJECTED' ? 'text-red-700' : 'text-slate-900'}`}>
                        {inc.status === 'REJECTED' ? '[REJECTED - FALSE ALARM]' : `[STATUS: ${inc.status}]`}
                      </span>
                    </div>

                    {inc.status === 'REJECTED' ? (
                      <div className="p-2 rounded-lg bg-red-50 border border-red-200 space-y-1">
                        <div className="h-1.5 rounded-full bg-red-600 w-full" />
                        <div className="text-[11px] text-red-950 font-medium leading-tight">
                          {inc.imageRejectionReason || 'Vision Agent rejected non-civic image. Crew dispatch aborted.'}
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="grid grid-cols-3 gap-1">
                          <div className={`h-1.5 rounded-full ${
                            inc.status === 'REPORTED' || inc.status === 'ASSIGNED' || inc.status === 'IN_PROGRESS' || inc.status === 'RESOLVED' || inc.status === 'VERIFIED'
                              ? 'bg-blue-600'
                              : 'bg-slate-200'
                          }`} />
                          <div className={`h-1.5 rounded-full ${
                            inc.status === 'IN_PROGRESS' || inc.status === 'RESOLVED' || inc.status === 'VERIFIED'
                              ? 'bg-amber-500'
                              : 'bg-slate-200'
                          }`} />
                          <div className={`h-1.5 rounded-full ${
                            inc.status === 'RESOLVED' || inc.status === 'VERIFIED'
                              ? 'bg-emerald-600'
                              : 'bg-slate-200'
                          }`} />
                        </div>

                        <div className="flex justify-between text-[10px] text-slate-500 font-semibold">
                          <span>Assigned</span>
                          <span>In Progress</span>
                          <span>Resolved</span>
                        </div>
                      </>
                    )}
                  </div>

                  {inc.assignedTeam && (
                    <div className="text-[11px] text-slate-600 pt-0.5">
                      Assigned Unit: <span className="text-slate-900 font-bold">{inc.assignedTeam}</span>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {/* MOBILE FOOTER */}
        <div className="p-3 bg-slate-50 border-t border-slate-300 text-center text-[11px] text-slate-600 font-medium">
          GVMC Civic Infrastructure Service
        </div>
      </div>
    </div>
  );
};
