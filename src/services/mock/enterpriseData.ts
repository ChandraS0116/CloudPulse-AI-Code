import { 
  WorkOrder, 
  FieldCrew, 
  WardProfile, 
  CivicUserKarma, 
  EmergencyAlert, 
  DronePatrolRoute, 
  DroneDetection, 
  CapitalBudget 
} from '../../types';
import { sampleImages } from './seedData';

/* ==========================================================================
   OFFLINE HIGH-RES REPAIR & COMPLETION SVGS
   ========================================================================== */

export const repairVerificationImages = {
  // Before / After Pairs
  potholeRepairedMVP: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="640" height="420" viewBox="0 0 640 420"><defs><linearGradient id="freshAsphalt" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="%231a202c"/><stop offset="100%" stop-color="%23111827"/></linearGradient></defs><rect width="640" height="420" fill="%232d3748"/><path d="M0,210 Q320,190 640,210" stroke="%23cbd5e1" stroke-width="4" stroke-dasharray="20,20"/><g transform="translate(180, 110)"><ellipse cx="140" cy="100" rx="140" ry="85" fill="url(%23freshAsphalt)" stroke="%23475569" stroke-width="2"/><circle cx="140" cy="100" r="12" fill="%2310b981" opacity="0.4"/><text x="140" y="105" font-family="sans-serif" font-weight="bold" font-size="11" fill="%2334d399" text-anchor="middle">BITUMINOUS PATCH VG-30</text></g><rect x="150" y="80" width="340" height="240" fill="none" stroke="%2310b981" stroke-width="2.5"/><rect x="150" y="55" width="220" height="25" fill="%2310b981"/><text x="160" y="72" font-family="sans-serif" font-weight="bold" font-size="11" fill="%23ffffff">AI VERIFIED: RESOLUTION 98.4%</text><text x="320" y="390" font-family="monospace" font-size="12" fill="%2310b981" text-anchor="middle">GVMC COMPACTION QUALITY CERTIFICATE ISSUED</text></svg>`,

  waterLeakRepairedGajuwaka: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="640" height="420" viewBox="0 0 640 420"><rect width="640" height="420" fill="%231e293b"/><rect x="120" y="160" width="400" height="140" rx="8" fill="%23334155"/><line x1="120" y1="230" x2="520" y2="230" stroke="%2364748b" stroke-width="20"/><rect x="280" y="210" width="80" height="40" rx="4" fill="%232563eb"/><text x="320" y="235" font-family="monospace" font-size="11" fill="%23ffffff" text-anchor="middle">250mm DI SLEEVE</text><rect x="100" y="90" width="440" height="250" fill="none" stroke="%232563eb" stroke-width="2"/><rect x="100" y="65" width="230" height="25" fill="%232563eb"/><text x="110" y="82" font-family="sans-serif" font-weight="bold" font-size="11" fill="%23fff">PRESSURE TEST PASS: 8.5 BAR</text><text x="320" y="380" font-family="monospace" font-size="12" fill="%2338bdf8" text-anchor="middle">PIPELINE SEAL INTEGRITY VERIFIED (0 LEAKAGE)</text></svg>`,

  garbageClearedDwaraka: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="640" height="420" viewBox="0 0 640 420"><rect width="640" height="420" fill="%23f1f5f9"/><rect x="180" y="150" width="120" height="160" rx="10" fill="%23059669"/><rect x="340" y="150" width="120" height="160" rx="10" fill="%232563eb"/><path d="M0,320 L640,320" stroke="%23cbd5e1" stroke-width="6"/><text x="320" y="380" font-family="sans-serif" font-weight="bold" font-size="13" fill="%23059669" text-anchor="middle">AREA DISINFECTED WITH SODIUM HYPOCHLORITE & LIME</text><rect x="140" y="80" width="360" height="260" fill="none" stroke="%23059669" stroke-width="2.5"/><rect x="140" y="55" width="220" height="25" fill="%23059669"/><text x="150" y="72" font-family="sans-serif" font-weight="bold" font-size="11" fill="%23fff">AI SANITATION CONFIDENCE: 99.2%</text></svg>`,

  droneAerialInspection: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="640" height="420" viewBox="0 0 640 420"><defs><radialGradient id="hudGlow" cx="50%" cy="50%" r="50%"><stop offset="0%" stop-color="%232563eb" stop-opacity="0.15"/><stop offset="100%" stop-color="%23000000" stop-opacity="0"/></radialGradient></defs><rect width="640" height="420" fill="%230f172a"/><circle cx="320" cy="210" r="160" fill="url(%23hudGlow)" stroke="%233b82f6" stroke-width="1.5" stroke-dasharray="6,6"/><line x1="320" y1="20" x2="320" y2="400" stroke="%233b82f6" stroke-width="1" stroke-dasharray="4,4" opacity="0.4"/><line x1="20" y1="210" x2="620" y2="210" stroke="%233b82f6" stroke-width="1" stroke-dasharray="4,4" opacity="0.4"/><rect x="220" y="140" width="180" height="120" fill="none" stroke="%23ef4444" stroke-width="2"/><text x="230" y="130" font-family="monospace" font-size="11" fill="%23ef4444" font-weight="bold">DEFECT #DRN-941 (POTHOLE)</text><text x="230" y="155" font-family="monospace" font-size="10" fill="%23ffffff">AREA: 1.42 m² | SEVERITY: HIGH</text><text x="320" y="380" font-family="monospace" font-size="12" fill="%2338bdf8" text-anchor="middle">DRONE TELEMETRY: ALT 45m | SPEED 32 km/h | 4K OPTICAL</text></svg>`
};

/* ==========================================================================
   1. GVMC WORK ORDERS (FIELD DISPATCH LIFECYCLE)
   ========================================================================== */

export const initialWorkOrders: WorkOrder[] = [
  {
    id: 'WO-GVMC-2026-081',
    incidentId: 'CP-1042',
    title: 'Emergency Pothole Patching & Sub-base Compaction — MVP Sector 4',
    category: 'Pothole',
    priority: 'P1',
    status: 'IN_REPAIR',
    assignedCrewId: 'CREW-02',
    assignedCrewName: 'GVMC Rapid Road Maintenance Unit 2 (Zone 2)',
    zone: 2,
    ward: 'Ward 18',
    address: 'Sector 4, Main Double Road, near AS Raja Grounds, MVP Colony',
    contractor: 'Visakha Urban Infra Projects Ltd.',
    boqItems: [
      { item: 'Cold Milling of Damaged Asphalt (50mm depth)', quantity: 24, unit: 'sq.m', rate: 450, totalCost: 10800 },
      { item: 'Bituminous Concrete VG-30 Hot Mix (IRC:111)', quantity: 4.8, unit: 'MT', rate: 7500, totalCost: 36000 },
      { item: 'Bitumen Emulsion RS-1 Tack Coat', quantity: 35, unit: 'liters', rate: 95, totalCost: 3325 },
      { item: 'Vibratory Tandem Roller Compaction & Finishing', quantity: 4, unit: 'hours', rate: 2200, totalCost: 8800 },
      { item: 'Night Safety Barricading & Solar Warning Blinkers', quantity: 1, unit: 'set', rate: 4500, totalCost: 4500 }
    ],
    totalEstimatedCost: 63425,
    actualCost: 61800,
    scheduledDate: '2026-09-23T18:00:00Z',
    completionDate: '2026-09-24T02:30:00Z',
    beforeImage: sampleImages.potholeMVP,
    afterImage: repairVerificationImages.potholeRepairedMVP,
    aiVerificationScore: 98.4,
    aiVerificationNotes: 'Vision Agent evaluated post-repair surface texture. Void completely filled and flush with adjoining road grade (0.2cm tolerance). Compaction certified.',
    officialSignoffBy: 'Er. D. Srinivasa Murthy (Executive Engineer, Zone 2)',
    qrCodeHash: 'GVMC-WO-2026-081-VERIFIED-984',
    materialsDispatched: true
  },
  {
    id: 'WO-GVMC-2026-082',
    incidentId: 'CP-1043',
    title: 'Pressurized Drinking Water Main Burst Excavation & Sleeve Replacement',
    category: 'Water Leakage',
    priority: 'P2',
    status: 'COMPLETED',
    assignedCrewId: 'CREW-05',
    assignedCrewName: 'GVMC Water Works Emergency Unit (Zone 4 Gajuwaka)',
    zone: 4,
    ward: 'Ward 64',
    address: 'Opp. BHEL Main Gate, Kanithi Road, Gajuwaka',
    contractor: 'Andhra Hydro Infrastructure Corp.',
    boqItems: [
      { item: 'JCB Trench Excavation & Water Dewatering Pump', quantity: 6, unit: 'hours', rate: 3200, totalCost: 19200 },
      { item: '250mm Ductile Iron (DI) K9 Pipe Repair Sleeve', quantity: 2, unit: 'units', rate: 28500, totalCost: 57000 },
      { item: 'Mechanical Coupler & High-Tension Gaskets', quantity: 4, unit: 'sets', rate: 4500, totalCost: 18000 },
      { item: 'Hydrostatic Pressure Testing (up to 9.0 Bar)', quantity: 1, unit: 'job', rate: 12000, totalCost: 12000 },
      { item: 'Granular Sub-Base Backfilling & Road Restitution', quantity: 18, unit: 'cu.m', rate: 1950, totalCost: 35100 }
    ],
    totalEstimatedCost: 141300,
    actualCost: 138500,
    scheduledDate: '2026-09-22T08:00:00Z',
    completionDate: '2026-09-22T17:45:00Z',
    beforeImage: sampleImages.waterLeakGajuwaka,
    afterImage: repairVerificationImages.waterLeakRepairedGajuwaka,
    aiVerificationScore: 99.1,
    aiVerificationNotes: 'Pipeline hydro-pressure test confirmed stable 8.5 bar with 0 psi decay over 2 hours. Trench backfill leveled.',
    officialSignoffBy: 'Er. K. Venkata Rao (Superintending Engineer, Water Supply)',
    qrCodeHash: 'GVMC-WO-2026-082-VERIFIED-991',
    materialsDispatched: true
  },
  {
    id: 'WO-GVMC-2026-083',
    incidentId: 'CP-1044',
    title: 'Solid Waste Overflow Clearing, Deep Sanitization & Compactor Bins Installation',
    category: 'Garbage Overflow',
    priority: 'P3',
    status: 'CERTIFIED',
    assignedCrewId: 'CREW-04',
    assignedCrewName: 'GVMC Clean City Rapid Sanitation Unit (Zone 3)',
    zone: 3,
    ward: 'Ward 26',
    address: 'Near RTC Complex North Gate, Dwaraka Nagar',
    contractor: 'Swachh Visakha Environmental Services',
    boqItems: [
      { item: 'Hydraulic Compactor Waste Evacuation (1.4 MT)', quantity: 2, unit: 'trips', rate: 6500, totalCost: 13000 },
      { item: 'Manual Sweeping & Bio-Enzyme Deep Washing', quantity: 1, unit: 'job', rate: 4500, totalCost: 4500 },
      { item: 'Chemical Disinfectant Spray (Lime & Hypochlorite)', quantity: 50, unit: 'kg', rate: 120, totalCost: 6000 },
      { item: 'Replacement 1100-Liter Wheeled HDPE Green Dumper Bins', quantity: 2, unit: 'bins', rate: 14000, totalCost: 28000 }
    ],
    totalEstimatedCost: 51500,
    actualCost: 49500,
    scheduledDate: '2026-09-21T06:00:00Z',
    completionDate: '2026-09-21T11:15:00Z',
    beforeImage: sampleImages.garbageDwaraka,
    afterImage: repairVerificationImages.garbageClearedDwaraka,
    aiVerificationScore: 99.2,
    aiVerificationNotes: 'Vision Agent confirmed zero residual litter on road perimeter. 2 new 1100L bins deployed with 100% capacity.',
    officialSignoffBy: 'Dr. S. Padmavathi (Chief Medical Officer of Health, GVMC)',
    qrCodeHash: 'GVMC-WO-2026-083-VERIFIED-992',
    materialsDispatched: true
  },
  {
    id: 'WO-GVMC-2026-084',
    incidentId: 'CP-1045',
    title: 'LED Matrix Mast Replacement & Underground Cable Fault Rectification',
    category: 'Broken Streetlight',
    priority: 'P2',
    status: 'DISPATCHED',
    assignedCrewId: 'CREW-06',
    assignedCrewName: 'GVMC Electrical & Smart Lighting Wing (Zone 5)',
    zone: 5,
    ward: 'Ward 9',
    address: 'IT SEZ Hill 2 Arterial Link, Madhurawada',
    contractor: 'AP Central Power & Lighting Division',
    boqItems: [
      { item: '120W Philips Smart LED Street Luminaire (IP66)', quantity: 3, unit: 'units', rate: 9800, totalCost: 29400 },
      { item: 'Hydraulic Cherry Picker Boom Lift Truck Hire', quantity: 4, unit: 'hours', rate: 2500, totalCost: 10000 },
      { item: 'Underground Armoured Copper Cable (3-Core, 16 sq.mm)', quantity: 45, unit: 'meters', rate: 380, totalCost: 17100 },
      { item: 'Automatic Dusk-to-Dawn Photocell Sensor Kit', quantity: 3, unit: 'sets', rate: 1800, totalCost: 5400 }
    ],
    totalEstimatedCost: 61900,
    scheduledDate: '2026-09-24T10:00:00Z',
    beforeImage: sampleImages.streetlightMadhurawada,
    qrCodeHash: 'GVMC-WO-2026-084-PENDING',
    materialsDispatched: true
  },
  {
    id: 'WO-GVMC-2026-085',
    incidentId: 'CP-1046',
    title: 'Structural Road Fissure Grouting & Polymer Bitumen Overlay — Seethammadhara',
    category: 'Damaged Road',
    priority: 'P2',
    status: 'INSPECTION_PENDING',
    assignedCrewId: 'CREW-03',
    assignedCrewName: 'GVMC Urban Arterials Rapid Team (Zone 2 Central)',
    zone: 2,
    ward: 'Ward 20',
    address: 'HB Colony Junction Road, Seethammadhara',
    contractor: 'Coastal Highways & Pavements Ltd.',
    boqItems: [
      { item: 'High-Pressure Compressed Air Crack Cleaning', quantity: 65, unit: 'meters', rate: 120, totalCost: 7800 },
      { item: 'Polymer Modified Bitumen (PMB-120) Crack Pouring', quantity: 180, unit: 'kg', rate: 190, totalCost: 34200 },
      { item: 'Geotextile Reinforcement Fabric Underlay', quantity: 95, unit: 'sq.m', rate: 320, totalCost: 30400 },
      { item: 'Micro-surfacing Bituminous Layer (Type III)', quantity: 95, unit: 'sq.m', rate: 450, totalCost: 42750 }
    ],
    totalEstimatedCost: 115150,
    scheduledDate: '2026-09-23T14:00:00Z',
    completionDate: '2026-09-24T04:00:00Z',
    beforeImage: sampleImages.damagedRoadSeethammadhara,
    afterImage: repairVerificationImages.potholeRepairedMVP,
    aiVerificationScore: 94.6,
    aiVerificationNotes: 'Transverse cracking sealed with elastomer membrane. Structural elasticity restored to 95% of standard benchmark.',
    officialSignoffBy: 'Er. M. Mohan Rao (EE Roads, GVMC)',
    qrCodeHash: 'GVMC-WO-2026-085-PENDING-SIGN',
    materialsDispatched: true
  }
];

/* ==========================================================================
   2. GVMC RAPID-RESPONSE FIELD CREWS (ACTIVE FLEET)
   ========================================================================== */

export const initialFieldCrews: FieldCrew[] = [
  {
    id: 'CREW-01',
    name: 'Unit 1 — Bheemili Coastal Infrastructure Crew',
    zone: 1,
    leader: 'K. Appala Naidu',
    contact: '+91 891 278 4012',
    vehicleNumber: 'AP 31 TV 4012',
    vehicleType: 'Heavy Tipper & Asphalt Patch Truck',
    status: 'AVAILABLE',
    currentLat: 17.8920,
    currentLng: 83.4540,
    equipment: ['Cold Mix Bitumen (2 MT)', 'Plate Compactor (5 HP)', 'Air Blower', 'Safety Cones'],
    completedToday: 2,
    crewSize: 6,
    currentLocality: 'Bheemunipatnam Zone 1 Office'
  },
  {
    id: 'CREW-02',
    name: 'Unit 2 — MVP & Maddilapalem Road Maintenance',
    zone: 2,
    leader: 'V. Ramesh Kumar',
    contact: '+91 891 254 1088',
    vehicleNumber: 'AP 31 TX 1088',
    vehicleType: 'Jetpatcher Hot-Mix Jet Injection Truck',
    status: 'ON_SITE',
    activeWorkOrderId: 'WO-GVMC-2026-081',
    currentLat: 17.7424,
    currentLng: 83.3356,
    equipment: ['Jetpatcher Emulsion Tank (3000L)', 'Vibratory Roller', 'Infrared Joint Heater', 'GPS Leveler'],
    completedToday: 3,
    crewSize: 8,
    currentLocality: 'MVP Colony Sector 4'
  },
  {
    id: 'CREW-03',
    name: 'Unit 3 — Siripuram & Town Rapid Unit',
    zone: 2,
    leader: 'P. Satyanarayana',
    contact: '+91 891 256 9901',
    vehicleNumber: 'AP 31 TV 9901',
    vehicleType: 'Quick Intervention Utility Van',
    status: 'EN_ROUTE',
    activeWorkOrderId: 'WO-GVMC-2026-085',
    currentLat: 17.7280,
    currentLng: 83.3150,
    equipment: ['Bitumen Pouring Pot', 'Concrete Cutter', 'Generator 7.5 kVA', 'Floodlight Mast'],
    completedToday: 1,
    crewSize: 5,
    currentLocality: 'En Route to Seethammadhara'
  },
  {
    id: 'CREW-04',
    name: 'Unit 4 — Dwaraka Nagar & RTC Swachh Unit',
    zone: 3,
    leader: 'M. Srinivasa Rao',
    contact: '+91 891 250 3320',
    vehicleNumber: 'AP 31 TZ 3320',
    vehicleType: 'Hydraulic Refuse Compactor (14 Cu.m)',
    status: 'AVAILABLE',
    currentLat: 17.7215,
    currentLng: 83.3080,
    equipment: ['High-Pressure Water Jetter', 'Sanitizer Mist Tank', 'Mechanical Sweeper Attachment', 'Heavy Winch'],
    completedToday: 4,
    crewSize: 6,
    currentLocality: 'Dwaraka Nagar Zonal Depot'
  },
  {
    id: 'CREW-05',
    name: 'Unit 5 — Gajuwaka Industrial Water Works',
    zone: 4,
    leader: 'G. Venkata Ramana',
    contact: '+91 891 276 7741',
    vehicleNumber: 'AP 31 TY 7741',
    vehicleType: 'Hydraulic Trench Excavator & Dewatering Rig',
    status: 'RETURNING',
    currentLat: 17.6900,
    currentLng: 83.2100,
    equipment: ['Sludge Pump (1000 LPM)', 'Pipe Fusion Welding Rig', 'Acoustic Leak Detector', 'DI Clamps'],
    completedToday: 2,
    crewSize: 7,
    currentLocality: 'Kanithi Road, Returning to Base'
  },
  {
    id: 'CREW-06',
    name: 'Unit 6 — Madhurawada IT Corridor Electrical Wing',
    zone: 5,
    leader: 'B. Anand',
    contact: '+91 891 281 6022',
    vehicleNumber: 'AP 31 TW 6022',
    vehicleType: 'Insulated Aerial Boom Lift (18 Meters)',
    status: 'EN_ROUTE',
    activeWorkOrderId: 'WO-GVMC-2026-084',
    currentLat: 17.8040,
    currentLng: 83.3550,
    equipment: ['Laser Distance Meter', 'Insulated Cable Jointing Kit', 'High-Voltage Insulation Tester', 'LED Luminaires'],
    completedToday: 3,
    crewSize: 4,
    currentLocality: 'Approaching IT SEZ Hill 2'
  },
  {
    id: 'CREW-07',
    name: 'Unit 7 — Pendurthi Drainage & Stormwater Wing',
    zone: 6,
    leader: 'Ch. Trinadha Rao',
    contact: '+91 891 279 8815',
    vehicleNumber: 'AP 31 TV 8815',
    vehicleType: 'Super Sucker Hydro-Vacuum Dredger',
    status: 'AVAILABLE',
    currentLat: 17.7950,
    currentLng: 83.2040,
    equipment: ['High-Velocity Vacuum Nozzle (300mm)', 'Silt Dredge Auger', 'Culvert Inspection CCTV Camera', 'Sewer Rodding Kit'],
    completedToday: 2,
    crewSize: 8,
    currentLocality: 'Pendurthi Zonal Depot'
  },
  {
    id: 'CREW-08',
    name: 'Unit 8 — Highway Corridor & Anakapalli Fast Response',
    zone: 6,
    leader: 'S. Nageswara Rao',
    contact: '+91 891 288 4490',
    vehicleNumber: 'AP 31 TX 4490',
    vehicleType: 'Emergency Highway Patrol Vehicle',
    status: 'AVAILABLE',
    currentLat: 17.6850,
    currentLng: 83.1500,
    equipment: ['Heavy Tow Winch', 'Hydraulic Cutter & Spreader', 'Rapid Asphalt Cold Premix', 'LED Arrow Signboard'],
    completedToday: 5,
    crewSize: 5,
    currentLocality: 'NH16 Gajuwaka-Anakapalli Sector'
  }
];

/* ==========================================================================
   3. VISAKHAPATNAM WARD PROFILES & SCORECARDS (98 WARDS / ZONES 1–6)
   ========================================================================== */

export const initialWards: WardProfile[] = [
  {
    wardNumber: 18,
    name: 'MVP Colony (Sectors 1–12)',
    zone: 2,
    corporator: 'Smt. G. Venkata Lakshmi',
    engineer: 'Er. D. Srinivasa Murthy',
    phone: '+91 891 254 1801',
    cleanlinessScore: 94.8,
    potholeFreeIndex: 88.5,
    activeIncidents: 3,
    resolvedThisMonth: 42,
    avgResolutionHours: 5.2,
    population: 48500,
    keyLandmarks: ['AS Raja Grounds', 'MVP Double Road', 'Sector 4 Junction', 'Ushodaya Supermarket']
  },
  {
    wardNumber: 64,
    name: 'Gajuwaka Industrial Belt',
    zone: 4,
    corporator: 'Sri P. Ramana Murthy',
    engineer: 'Er. K. Venkata Rao',
    phone: '+91 891 276 6401',
    cleanlinessScore: 78.4,
    potholeFreeIndex: 71.2,
    activeIncidents: 8,
    resolvedThisMonth: 64,
    avgResolutionHours: 7.8,
    population: 68200,
    keyLandmarks: ['Kanithi Road', 'BHEL Junction', 'Steel Plant Gate', 'Gajuwaka Old Bus Stand']
  },
  {
    wardNumber: 26,
    name: 'Dwaraka Nagar Commercial Core',
    zone: 3,
    corporator: 'Sri K. Suresh Babu',
    engineer: 'Er. P. Narayana',
    phone: '+91 891 250 2601',
    cleanlinessScore: 89.2,
    potholeFreeIndex: 84.0,
    activeIncidents: 4,
    resolvedThisMonth: 58,
    avgResolutionHours: 4.8,
    population: 39400,
    keyLandmarks: ['RTC Complex', 'Sankaramatam Road', 'Diamond Park', 'Dwaraka Inn Corridor']
  },
  {
    wardNumber: 9,
    name: 'Madhurawada IT & Education Hub',
    zone: 5,
    corporator: 'Smt. B. Anuradha',
    engineer: 'Er. T. Satish',
    phone: '+91 891 281 0901',
    cleanlinessScore: 91.5,
    potholeFreeIndex: 79.8,
    activeIncidents: 5,
    resolvedThisMonth: 38,
    avgResolutionHours: 6.4,
    population: 58900,
    keyLandmarks: ['IT SEZ Hill 2', 'Cricket Stadium', 'Mithilapuri Vuda Colony', 'Car Shed Junction']
  },
  {
    wardNumber: 20,
    name: 'Siripuram & Waltair Uplands',
    zone: 2,
    corporator: 'Sri V. Krishna Mohan',
    engineer: 'Er. M. Mohan Rao',
    phone: '+91 891 256 2001',
    cleanlinessScore: 96.2,
    potholeFreeIndex: 92.4,
    activeIncidents: 2,
    resolvedThisMonth: 48,
    avgResolutionHours: 3.9,
    population: 34200,
    keyLandmarks: ['Siripuram Circle', 'AU Engineering College', 'Dutt Island', 'Seven Hills Hospital']
  },
  {
    wardNumber: 31,
    name: 'Jagadamba & Old Town Heritage',
    zone: 3,
    corporator: 'Sri Ch. Vamsi Krishna',
    engineer: 'Er. N. Appa Rao',
    phone: '+91 891 257 3101',
    cleanlinessScore: 82.6,
    potholeFreeIndex: 77.5,
    activeIncidents: 6,
    resolvedThisMonth: 51,
    avgResolutionHours: 5.6,
    population: 52100,
    keyLandmarks: ['Jagadamba Theatre', 'Super Bazaar', 'Purna Market', 'King George Hospital (KGH)']
  },
  {
    wardNumber: 4,
    name: 'Rushikonda Beach & Tech Zone',
    zone: 5,
    corporator: 'Smt. K. Bhavani',
    engineer: 'Er. B. Anand Kumar',
    phone: '+91 891 278 0401',
    cleanlinessScore: 97.4,
    potholeFreeIndex: 94.1,
    activeIncidents: 1,
    resolvedThisMonth: 29,
    avgResolutionHours: 4.1,
    population: 26800,
    keyLandmarks: ['Rushikonda Blue Flag Beach', 'Gitams University Road', 'Millennium Tower', 'Hill 3 Infotech']
  },
  {
    wardNumber: 72,
    name: 'Pendurthi Sub-Urban Gateway',
    zone: 6,
    corporator: 'Sri M. Jagadeesh',
    engineer: 'Er. Ch. Trinadha Rao',
    phone: '+91 891 279 7201',
    cleanlinessScore: 81.0,
    potholeFreeIndex: 73.8,
    activeIncidents: 7,
    resolvedThisMonth: 44,
    avgResolutionHours: 8.2,
    population: 46200,
    keyLandmarks: ['Pendurthi Railway Station', 'Suvarna Nagar', 'Anandapuram Link', 'Agricultural Market']
  }
];

/* ==========================================================================
   4. CITIZEN KARMA & CIVIC CHAMPIONS LEADERBOARD
   ========================================================================== */

export const initialCivicKarma: CivicUserKarma[] = [
  {
    id: 'USR-K-01',
    name: 'Sai Pavan Teja',
    ward: 'Ward 18 MVP Colony',
    points: 1840,
    reportsCount: 38,
    verifiedCount: 36,
    badge: 'Master Civic Sentinel',
    rank: 1,
    joinedDate: 'Jan 2026'
  },
  {
    id: 'USR-K-02',
    name: 'Dr. K. S. Lakshmi',
    ward: 'Ward 20 Siripuram',
    points: 1590,
    reportsCount: 31,
    verifiedCount: 30,
    badge: 'Clean City Guardian',
    rank: 2,
    joinedDate: 'Feb 2026'
  },
  {
    id: 'USR-K-03',
    name: 'M. Harsha Vardhan',
    ward: 'Ward 9 Madhurawada',
    points: 1420,
    reportsCount: 29,
    verifiedCount: 27,
    badge: 'Infrastructure Watchdog',
    rank: 3,
    joinedDate: 'Dec 2025'
  },
  {
    id: 'USR-K-04',
    name: 'R. Sneha Latha',
    ward: 'Ward 4 Rushikonda',
    points: 1280,
    reportsCount: 24,
    verifiedCount: 24,
    badge: 'Eco-Corridor Champion',
    rank: 4,
    joinedDate: 'Mar 2026'
  },
  {
    id: 'USR-K-05',
    name: 'P. Venkat Ram',
    ward: 'Ward 64 Gajuwaka',
    points: 1140,
    reportsCount: 26,
    verifiedCount: 23,
    badge: 'Safety First Contributor',
    rank: 5,
    joinedDate: 'Jan 2026'
  }
];

/* ==========================================================================
   5. CITY EMERGENCY BROADCASTS & ADVISORIES
   ========================================================================== */

export const initialEmergencyAlerts: EmergencyAlert[] = [
  {
    id: 'ALT-VIZAG-2026-04',
    title: 'Bay of Bengal Deep Depression — Coastal High Wind & Surge Warning',
    category: 'CYCLONE',
    severity: 'WARNING',
    areasAffected: ['RK Beach Road', 'Rushikonda Promenade', 'Bheemili Marine Drive', 'Fishing Harbour'],
    publishedAt: '2026-09-23T14:00:00Z',
    validUntil: '2026-09-25T18:00:00Z',
    active: true,
    actionRequired: 'Avoid beach access and parking vehicles beneath aged Casuarina/Rain trees. GVMC Disaster Response Crew 1 and 2 on high alert.',
    broadcastAuthority: 'GVMC Disaster Management Cell & IMD Visakhapatnam'
  },
  {
    id: 'ALT-VIZAG-2026-03',
    title: 'Gajuwaka 400mm Feeder Line Interconnection — Planned Water Supply Shutdown',
    category: 'WATER_PIPELINE',
    severity: 'ADVISORY',
    areasAffected: ['Kanithi Road', 'BHPVL Colony', 'Gajuwaka Ward 64 & 65', 'Chaitanya Nagar'],
    publishedAt: '2026-09-23T08:30:00Z',
    validUntil: '2026-09-24T20:00:00Z',
    active: true,
    actionRequired: 'Municipal water supply will remain suspended between 08:00 AM and 04:00 PM for repair sleeve sealing. Tanker assistance on 1800-425-0001.',
    broadcastAuthority: 'GVMC Public Health Engineering Department'
  },
  {
    id: 'ALT-VIZAG-2026-02',
    title: 'Siripuram VIP Road Smart City Duct Trenching — Lane 2 Diversion',
    category: 'TRAFFIC_DIVERSION',
    severity: 'ADVISORY',
    areasAffected: ['Siripuram Circle', 'Dutt Island Corridor', 'Tycoon Junction'],
    publishedAt: '2026-09-22T19:00:00Z',
    validUntil: '2026-09-26T06:00:00Z',
    active: true,
    actionRequired: 'Heavy vehicles diverted via AU Out Gate road. Speed restricted to 20 km/h with LED barrier indicators active.',
    broadcastAuthority: 'Visakhapatnam City Traffic Police & GVMC Smart City Cell'
  }
];

/* ==========================================================================
   6. DRONE PATROL CORRIDORS & REAL-TIME VISION DETECTIONS
   ========================================================================== */

export const initialDroneRoutes: DronePatrolRoute[] = [
  {
    id: 'DP-01',
    name: 'Skylark 1 — RK Beach to Rushikonda Coastal Spine',
    corridor: 'Beach Road (Submarine Museum → Tenneti Park → Rushikonda Beach)',
    totalDistanceKm: 14.2,
    altitudeMeters: 45,
    batteryPercent: 88,
    status: 'PATROLLING',
    waypoints: [
      { lat: 17.7142, lng: 83.3234, name: 'INS Kursura Museum' },
      { lat: 17.7380, lng: 83.3510, name: 'Tenneti Park Overlook' },
      { lat: 17.7650, lng: 83.3720, name: 'Bay Cliff Viewpoint' },
      { lat: 17.7850, lng: 83.3850, name: 'Rushikonda Blue Flag Cove' }
    ],
    detectionsCount: 4,
    pavementConditionIndex: 78.4,
    maxSpeedKmph: 42
  },
  {
    id: 'DP-02',
    name: 'Falcon 2 — NH16 Arterial Highway Survey Corridor',
    corridor: 'National Highway 16 (Anandapuram → Car Shed → Maddilapalem)',
    totalDistanceKm: 19.5,
    altitudeMeters: 60,
    batteryPercent: 94,
    status: 'ANALYZING',
    waypoints: [
      { lat: 17.8800, lng: 83.3900, name: 'Anandapuram Junction' },
      { lat: 17.8200, lng: 83.3600, name: 'Madhurawada IT SEZ Gate' },
      { lat: 17.7800, lng: 83.3400, name: 'Hanumanthawaka Junction' },
      { lat: 17.7400, lng: 83.3200, name: 'Maddilapalem Flyover' }
    ],
    detectionsCount: 9,
    pavementConditionIndex: 64.8,
    maxSpeedKmph: 55
  },
  {
    id: 'DP-03',
    name: 'Horus 3 — Central Commercial & Port Link',
    corridor: 'Siripuram → Jagadamba → Old Post Office → Port Container Road',
    totalDistanceKm: 9.8,
    altitudeMeters: 38,
    batteryPercent: 72,
    status: 'IDLE',
    waypoints: [
      { lat: 17.7200, lng: 83.3150, name: 'Siripuram Circle' },
      { lat: 17.7100, lng: 83.3050, name: 'Jagadamba Cinema Junction' },
      { lat: 17.7000, lng: 83.2950, name: 'Town Hall Old City' },
      { lat: 17.6850, lng: 83.2850, name: 'Port North Gate' }
    ],
    detectionsCount: 6,
    pavementConditionIndex: 71.2,
    maxSpeedKmph: 38
  },
  {
    id: 'DP-04',
    name: 'Gannet 4 — Gajuwaka Industrial & Steel Corridor',
    corridor: 'Gajuwaka Belt (Kanithi Road → BHEL → Autonagar → Kurmannapalem)',
    totalDistanceKm: 13.5,
    altitudeMeters: 50,
    batteryPercent: 62,
    status: 'PATROLLING',
    waypoints: [
      { lat: 17.6950, lng: 83.2150, name: 'Gajuwaka Main Flyover' },
      { lat: 17.6850, lng: 83.1950, name: 'BHEL Gate 1' },
      { lat: 17.6750, lng: 83.1750, name: 'Autonagar Heavy Cluster' },
      { lat: 17.6650, lng: 83.1550, name: 'Kurmannapalem Junction' }
    ],
    detectionsCount: 11,
    pavementConditionIndex: 56.4,
    maxSpeedKmph: 45
  }
];

export const initialDroneDetections: DroneDetection[] = [
  {
    id: 'DET-DRN-901',
    timestamp: '11:42:18',
    routeId: 'DP-01',
    lat: 17.7420,
    lng: 83.3540,
    defectType: 'Alligator Cracking & Pothole Cavity',
    severity: 'CRITICAL',
    estimatedAreaSqM: 2.4,
    confidence: 0.962,
    snapshot: repairVerificationImages.droneAerialInspection,
    ircStandardCode: 'IRC:82-2015 Class 3 (Severe Fatigue)',
    locality: 'Tenneti Park Sea Overlook (Beach Road)'
  },
  {
    id: 'DET-DRN-902',
    timestamp: '11:43:05',
    routeId: 'DP-01',
    lat: 17.7510,
    lng: 83.3610,
    defectType: 'Pavement Edge Drop-off & Shoulder Washout',
    severity: 'HIGH',
    estimatedAreaSqM: 4.8,
    confidence: 0.918,
    snapshot: sampleImages.damagedRoadSeethammadhara,
    ircStandardCode: 'IRC:SP:72-2015 Shoulder Distress',
    locality: 'Jodugullapalem Curve'
  },
  {
    id: 'DET-DRN-903',
    timestamp: '11:44:22',
    routeId: 'DP-02',
    lat: 17.8120,
    lng: 83.3540,
    defectType: 'Transverse Reflection Crack',
    severity: 'MEDIUM',
    estimatedAreaSqM: 1.2,
    confidence: 0.884,
    snapshot: sampleImages.damagedRoadSeethammadhara,
    ircStandardCode: 'IRC:82-2015 Class 2 (Moderate)',
    locality: 'Madhurawada Mid-Corridor'
  }
];

/* ==========================================================================
   7. CAPITAL INFRASTRUCTURE BUDGET & FORECASTING MODEL
   ========================================================================== */

export const initialCapitalBudget: CapitalBudget = {
  fiscalYear: 'FY 2026–2027',
  totalAllocatedCrores: 125.00,
  spentCrores: 48.60,
  committedCrores: 42.10,
  monsoonReserveCrores: 18.50,
  projectedRainfallRiskPct: 22.4,
  categories: [
    {
      name: 'Road Pavements & Bridge Maintenance',
      allocatedCrores: 52.00,
      spentCrores: 24.30,
      projectsCount: 142,
      color: '#2563eb'
    },
    {
      name: 'Water Supply & Pressurized Pipelines',
      allocatedCrores: 36.50,
      spentCrores: 12.80,
      projectsCount: 68,
      color: '#0284c7'
    },
    {
      name: 'Stormwater Drains & Culvert Desilting',
      allocatedCrores: 21.50,
      spentCrores: 7.90,
      projectsCount: 54,
      color: '#d97706'
    },
    {
      name: 'Smart LED Public Lighting & Micro-Grid',
      allocatedCrores: 15.00,
      spentCrores: 3.60,
      projectsCount: 31,
      color: '#059669'
    }
  ]
};
