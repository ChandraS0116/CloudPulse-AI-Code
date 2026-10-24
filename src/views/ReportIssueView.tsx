import React, { useState } from 'react';
import { 
  UploadCloud, 
  MapPin, 
  Sparkles, 
  CheckCircle2, 
  ArrowRight, 
  Image as ImageIcon,
  Info,
  Navigation,
  Crosshair,
  Check,
  AlertCircle
} from 'lucide-react';
import { sampleImages } from '../services/mock/seedData';
import { IncidentCategory } from '../types';
import { VIZAG_LANDMARKS, VizagLandmark } from '../services/geo/vizagGeofence';

interface ReportIssueViewProps {
  onStartInvestigation: (payload: {
    image: string;
    latitude: number;
    longitude: number;
    locality: string;
    description: string;
    categoryHint?: IncidentCategory;
  }) => void;
}

export const ReportIssueView: React.FC<ReportIssueViewProps> = ({ onStartInvestigation }) => {
  const [selectedImage, setSelectedImage] = useState<string>(sampleImages.potholeMVP);
  const [selectedLandmark, setSelectedLandmark] = useState<VizagLandmark>(VIZAG_LANDMARKS[0]);
  const [streetAddress, setStreetAddress] = useState<string>('Main Double Road, near AS Raja Grounds');
  const [description, setDescription] = useState<string>('Deep road surface crater located on high-traffic carriage lane. Vehicles are swerving into oncoming lane.');
  const [categoryHint, setCategoryHint] = useState<IncidentCategory | undefined>('Pothole');
  const [isDragging, setIsDragging] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [gpsLocked, setGpsLocked] = useState(true);

  // Quick demonstration sample presets for easy testing
  const presets = [
    {
      label: 'MVP Colony Pothole',
      landmark: VIZAG_LANDMARKS[0], // MVP Sector 4
      address: 'Main Double Road, near AS Raja Grounds',
      desc: 'Large structural pothole cavity across arterial carriage road. Extreme accident hazard.',
      image: sampleImages.potholeMVP,
      hint: 'Pothole' as IncidentCategory,
      isTest: false
    },
    {
      label: 'Non-Road Sample (Test)',
      landmark: VIZAG_LANDMARKS[0], // MVP Sector 4
      address: 'Near Beach Road (Quality Gate Test)',
      desc: 'Sample non-infrastructure image to test automated defect verification and false alarm prevention.',
      image: sampleImages.selfieTest,
      hint: 'Pothole' as IncidentCategory,
      isTest: true
    },
    {
      label: 'Gajuwaka Water Rupture',
      landmark: VIZAG_LANDMARKS[4], // Gajuwaka Junction
      address: 'Old Gajuwaka Main Road, near RTC Depot',
      desc: 'High-pressure water distribution pipe rupture flooding roadway and eroding subgrade.',
      image: sampleImages.waterLeakGajuwaka,
      hint: 'Water Leakage' as IncidentCategory,
      isTest: false
    },
    {
      label: 'Dwaraka Nagar Overflow',
      landmark: VIZAG_LANDMARKS[3], // Dwaraka Nagar
      address: '3rd Lane Commercial Corridor, near Complex',
      desc: 'Commercial waste bin overflow blocking pedestrian sidewalk and storm drain.',
      image: sampleImages.garbageDwaraka,
      hint: 'Garbage Overflow' as IncidentCategory,
      isTest: false
    },
    {
      label: 'Beach Road Asphalt Damage',
      landmark: VIZAG_LANDMARKS[1], // RK Beach
      address: 'Coastal Promenade, opp. Kursura Submarine Museum',
      desc: 'Severe coastal salt spallation and asphalt erosion along the tourist promenade.',
      image: sampleImages.damagedRoadSeethammadhara,
      hint: 'Damaged Road' as IncidentCategory,
      isTest: false
    },
    {
      label: 'Indoor Scene (Test)',
      landmark: VIZAG_LANDMARKS[3], // Dwaraka Nagar
      address: 'Indoor Area (Quality Gate Test)',
      desc: 'Indoor scene to test civic infrastructure detection gate.',
      image: sampleImages.indoorPetTest,
      hint: 'Pothole' as IncidentCategory,
      isTest: true
    },
    {
      label: 'Madhurawada Fallen Light',
      landmark: VIZAG_LANDMARKS[6], // Madhurawada
      address: 'Cricket Stadium Outer Ring Road',
      desc: 'Fallen high-mast streetlight pole with exposed dangling electric cable.',
      image: sampleImages.streetlightMadhurawada,
      hint: 'Broken Streetlight' as IncidentCategory,
      isTest: false
    }
  ];

  const applyPreset = (preset: typeof presets[0]) => {
    setSelectedImage(preset.image);
    setSelectedLandmark(preset.landmark);
    setStreetAddress(preset.address);
    setDescription(preset.desc);
    setCategoryHint(preset.hint);
    setGpsLocked(true);
  };

  // 1-Click Browser/Device Geolocation (No manual lat/long required from citizen)
  const handleAutoDetectLocation = () => {
    setIsLocating(true);
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          // Successfully obtained device GPS coordinates
          setIsLocating(false);
          setGpsLocked(true);
          // Set to closest landmark or keep accurate coordinates
          setSelectedLandmark({
            ...selectedLandmark,
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            name: `${selectedLandmark.locality} (Live GPS Captured)`
          });
        },
        (error) => {
          // If browser location permission is denied or running on localhost, fallback gracefully to selected landmark
          console.warn('Geolocation fallback:', error.message);
          setIsLocating(false);
          setGpsLocked(true);
        },
        { enableHighAccuracy: true, timeout: 5000 }
      );
    } else {
      setIsLocating(false);
      setGpsLocked(true);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setSelectedImage(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onStartInvestigation({
      image: selectedImage,
      latitude: selectedLandmark.lat,
      longitude: selectedLandmark.lng,
      locality: selectedLandmark.locality,
      description: `${description} (${streetAddress})`,
      categoryHint
    });
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-7 font-sans bg-slate-50">
      {/* PAGE HEADER */}
      <div className="space-y-1.5 pb-4 border-b border-slate-300">
        <div className="flex items-center gap-2 text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">
          <Sparkles className="w-4 h-4 text-blue-600" />
          <span>Civilian Infrastructure Portal</span>
          <span className="text-slate-300">•</span>
          <span className="text-slate-600">Greater Visakhapatnam (GVMC)</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
          Report Road & Civic Defect
        </h1>
        <p className="text-sm text-slate-500 max-w-2xl leading-relaxed">
          Snap a photo and tap your area. The municipal 7-agent intelligence pipeline will automatically classify the damage, check city geofences, determine priority, and dispatch a repair work order.
        </p>
      </div>

      {/* QUICK DEMO PRESETS BAR */}
      <div className="p-4 rounded-xl border border-slate-300 bg-white space-y-3 shadow-sm">
        <div className="flex items-center justify-between text-xs">
          <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
            [Quick Incident Presets]:
          </span>
          <span className="text-[11px] text-slate-500 font-medium hidden sm:inline">
            Pre-loaded with real Visakhapatnam landmarks and photos
          </span>
        </div>
        <div className="flex flex-wrap gap-2">
          {presets.map((preset, idx) => {
            const isSelected = selectedLandmark.id === preset.landmark.id && categoryHint === preset.hint;
            return (
              <button
                key={idx}
                type="button"
                onClick={() => applyPreset(preset)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all text-left flex items-center gap-2 cursor-pointer ${
                  isSelected 
                    ? preset.isTest ? 'bg-amber-100 text-amber-900 border-amber-400 shadow-2xs' : 'bg-blue-50 text-blue-700 border-blue-400 shadow-2xs' 
                    : preset.isTest ? 'bg-amber-50/70 hover:bg-amber-100/70 text-amber-800 border-amber-200' : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-300'
                }`}
              >
                <div className={`w-1.5 h-1.5 rounded-full ${isSelected ? (preset.isTest ? 'bg-amber-600' : 'bg-blue-600') : (preset.isTest ? 'bg-amber-400' : 'bg-slate-400')}`} />
                <span>{preset.label}</span>
                {preset.isTest && (
                  <span className="text-[9px] font-mono uppercase px-1 py-0.2 rounded bg-amber-200/80 text-amber-800 font-extrabold">
                    [TEST]
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* MAIN CIVIC SUBMISSION FORM */}
      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT COLUMN: EVIDENCE UPLOAD & PREVIEW (7 COLS) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="p-5 rounded-xl border border-slate-300 bg-white space-y-4 shadow-sm">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-extrabold uppercase tracking-wider text-slate-900 flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-blue-600" />
                <span>[1. PHOTOGRAPHIC EVIDENCE]</span>
              </label>
              <span className="text-[11px] text-slate-500 font-medium">
                JPG, PNG, WebP supported
              </span>
            </div>

            {/* DRAG & DROP UPLOAD BOX */}
            <div 
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={(e) => {
                e.preventDefault();
                setIsDragging(false);
                const file = e.dataTransfer.files?.[0];
                if (file) {
                  const reader = new FileReader();
                  reader.onload = (event) => {
                    if (event.target?.result) setSelectedImage(event.target.result as string);
                  };
                  reader.readAsDataURL(file);
                }
              }}
              className={`border border-dashed rounded-xl p-3 flex flex-col items-center justify-center text-center relative transition-all ${
                isDragging ? 'border-blue-500 bg-blue-50' : 'border-slate-300 hover:border-slate-400 bg-slate-50/70'
              }`}
            >
              {selectedImage ? (
                <div className="relative w-full aspect-[16/10] rounded-xl overflow-hidden border border-slate-300 group shadow-inner">
                  <img 
                    src={selectedImage} 
                    alt="Infrastructure defect evidence" 
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 p-4">
                    <p className="text-xs text-white font-bold">Click below to change photo</p>
                    <label className="cursor-pointer px-3.5 py-1.5 rounded-xl bg-white text-slate-900 text-xs font-bold shadow-md hover:bg-slate-100 transition-colors">
                      Select Another Photo
                      <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
                    </label>
                  </div>
                </div>
              ) : (
                <div className="py-12 space-y-3">
                  <UploadCloud className="w-10 h-10 text-slate-400 mx-auto" />
                  <div>
                    <p className="text-xs font-bold text-slate-800">Drag and drop defect photo here</p>
                    <p className="text-[11px] text-slate-500 mt-0.5">High clarity assists the AI vision agent in sizing cavities</p>
                  </div>
                  <label className="inline-block cursor-pointer px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-xs">
                    Choose Photo
                    <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
                  </label>
                </div>
              )}
            </div>

            {/* DEFECT CATEGORY HINT */}
            <div>
              <label className="text-xs font-bold text-slate-800 block mb-1.5">
                Issue Classification (Optional Hint)
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {(['Pothole', 'Water Leakage', 'Garbage Overflow', 'Broken Streetlight', 'Damaged Road', 'Drainage Blockage'] as IncidentCategory[]).map(cat => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setCategoryHint(cat)}
                    className={`p-2 rounded-xl text-xs font-bold border transition-all text-left flex items-center justify-between cursor-pointer ${
                      categoryHint === cat
                        ? 'bg-blue-50 text-blue-700 border-blue-300 shadow-2xs'
                        : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-300'
                    }`}
                  >
                    <span className="truncate">{cat}</span>
                    {categoryHint === cat && <Check className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />}
                  </button>
                ))}
              </div>
            </div>

            <div className="text-[11px] text-slate-500 flex items-center gap-2 pt-1">
              <Info className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />
              <span>Vision Transformer automatically measures depth, surface area, and severity index.</span>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: CITIZEN-FRIENDLY LOCATION (ZERO MANUAL LAT/LONG!) (5 COLS) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="p-5 rounded-xl border border-slate-300 bg-white space-y-4 shadow-sm">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-extrabold uppercase tracking-wider text-slate-900 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-blue-600" />
                <span>[2. LOCATION IN VISAKHAPATNAM]</span>
              </label>
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-300">
                [GPS AUTOMATED]
              </span>
            </div>

            {/* 1-CLICK AUTOMATIC GPS LOCATION BUTTON */}
            <div className="space-y-2">
              <button
                type="button"
                onClick={handleAutoDetectLocation}
                disabled={isLocating}
                className="w-full py-2.5 px-3.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-300 text-[11px] font-extrabold uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs"
              >
                <Crosshair className={`w-4 h-4 text-blue-600 ${isLocating ? 'animate-spin' : ''}`} />
                <span>{isLocating ? '[ACQUIRING GPS SATELLITE FIX...]' : '[USE MY CURRENT GPS LOCATION]'}</span>
              </button>

              <div className="text-center text-[10px] text-slate-500 uppercase font-extrabold tracking-wider">
                [— OR PICK VISAKHAPATNAM AREA —]
              </div>
            </div>

            {/* AREA / LANDMARK PICKER */}
            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-800 block mb-1">
                  Locality / Landmark
                </label>
                <select
                  value={selectedLandmark.id}
                  onChange={(e) => {
                    const lm = VIZAG_LANDMARKS.find(l => l.id === e.target.value);
                    if (lm) {
                      setSelectedLandmark(lm);
                      setStreetAddress(`${lm.roadName}, ${lm.locality}`);
                      setGpsLocked(true);
                    }
                  }}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-400 cursor-pointer shadow-2xs"
                >
                  {VIZAG_LANDMARKS.map(lm => (
                    <option key={lm.id} value={lm.id}>
                      {lm.name} ({lm.locality} • {lm.ward})
                    </option>
                  ))}
                </select>
              </div>

              {/* STREET ADDRESS / NEARBY LANDMARK */}
              <div>
                <label className="text-xs font-bold text-slate-800 block mb-1">
                  Street Address / Nearby Reference
                </label>
                <input
                  type="text"
                  value={streetAddress}
                  onChange={(e) => setStreetAddress(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-400 shadow-2xs"
                  placeholder="e.g. Opposite Sector 4 Park, near Cricket Stadium"
                  required
                />
              </div>

              {/* AUTOMATIC COORDINATES CONFIRMATION PILL (NO MANUAL INPUT!) */}
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-300 text-xs space-y-1">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-500 font-medium">Automatic Municipal Geotag:</span>
                  <span className="text-emerald-700 font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>GVMC Operational Zone</span>
                  </span>
                </div>
                <div className="font-mono text-[11px] text-slate-700 font-semibold truncate">
                  {selectedLandmark.lat.toFixed(4)}° N, {selectedLandmark.lng.toFixed(4)}° E • {selectedLandmark.ward}
                </div>
              </div>

              {/* DESCRIPTION */}
              <div>
                <label className="text-xs font-bold text-slate-800 block mb-1">
                  Citizen Notes / Severity Details (Optional)
                </label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-400 resize-none shadow-2xs"
                  placeholder="Describe obstruction, vehicle danger, water depth, or traffic swerving..."
                />
              </div>

              {/* SUBMIT BUTTON */}
              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md hover:shadow-lg"
                >
                  <span>Submit to Autonomous Workforce</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-200/90 space-y-1.5 text-xs text-slate-700 shadow-2xs">
            <div className="flex items-center gap-2 text-slate-900 font-bold">
              <CheckCircle2 className="w-4 h-4 text-blue-700" />
              <span>Direct Real-Time Dispatch</span>
            </div>
            <p className="leading-relaxed text-[11px] text-slate-600 font-medium">
              Your submission immediately triggers the 7-agent pipeline. The incident appears on the Command Center live map within seconds.
            </p>
          </div>
        </div>
      </form>
    </div>
  );
};
