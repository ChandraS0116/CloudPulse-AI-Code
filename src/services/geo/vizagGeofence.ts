// ==============================================================================
// CLOUDPULSE AI — VISAKHAPATNAM OPERATIONAL ZONE & GEOFENCE ENGINE
// ==============================================================================
// Note: This polygon defines the CloudPulse AI municipal operations corridor
// covering key urban GVMC / VMRDA transit sectors from Duvvada/Gajuwaka to Bheemili.
// It is explicitly designated as the "CloudPulse operational zone".

export interface GeoPoint {
  lat: number;
  lng: number;
}

export interface VizagLandmark {
  id: string;
  name: string;
  locality: string;
  ward: string;
  roadName: string;
  roadType: 'ARTERIAL_CORRIDOR' | 'COMMERCIAL_HUB' | 'TRANSIT_HIGHWAY' | 'RESIDENTIAL_CONNECTOR' | 'COASTAL_PROMENADE';
  trafficWeight: number; // 1.0 (quiet) to 2.5 (peak arterial)
  lat: number;
  lng: number;
  description: string;
}

// Visakhapatnam Operational Zone Polygon Boundary Coordinates
// Encompasses Gajuwaka, Duvvada, Scindia, Old Post Office, Jagadamba, RK Beach,
// Waltair, Siripuram, Maddilapalem, MVP Colony, Rushikonda, Madhurawada, and Bheemili Coastal Corridor.
export const VIZAG_OPERATIONAL_ZONE_POLYGON: GeoPoint[] = [
  { lat: 17.6200, lng: 83.1200 }, // South-West Boundary (Kurmannapalem / Steel Plant Gateway)
  { lat: 17.6500, lng: 83.1400 }, // Duvvada Sector
  { lat: 17.6800, lng: 83.1800 }, // Gajuwaka Industrial Hub
  { lat: 17.6950, lng: 83.2400 }, // Scindia / Naval Dockyard corridor
  { lat: 17.6800, lng: 83.2900 }, // Visakhapatnam Port Outer Pier
  { lat: 17.7050, lng: 83.3100 }, // Coastal RK Beach south
  { lat: 17.7250, lng: 83.3400 }, // Lawson's Bay / Tenneti Park
  { lat: 17.7850, lng: 83.3900 }, // Rushikonda Beach & IT Park
  { lat: 17.8400, lng: 83.4300 }, // Mangamaripeta / Thotlakonda
  { lat: 17.8950, lng: 83.4600 }, // Bheemunipatnam (Bheemili) North Point
  { lat: 17.9100, lng: 83.4300 }, // Bheemili Inland turn
  { lat: 17.8600, lng: 83.3600 }, // Anandapuram Highway Junction
  { lat: 17.8200, lng: 83.3300 }, // Madhurawada IT Hill inland
  { lat: 17.7600, lng: 83.2900 }, // Seethammadhara / Hanumanthawaka
  { lat: 17.7300, lng: 83.2600 }, // Simhachalam Foothills
  { lat: 17.6900, lng: 83.2000 }, // NAD Junction / Airport Road
  { lat: 17.6400, lng: 83.1300 }, // Sheela Nagar transit belt
  { lat: 17.6200, lng: 83.1200 }  // Closed loop back to Kurmannapalem
];

// Verified Visakhapatnam Landmarks & High-Traffic Nodes
export const VIZAG_LANDMARKS: VizagLandmark[] = [
  {
    id: 'lm-mvp-01',
    name: 'MVP Colony Sector 4 (AS Raja Grounds)',
    locality: 'MVP Colony',
    ward: 'Ward 18 (Zone 2)',
    roadName: 'Main Double Road',
    roadType: 'ARTERIAL_CORRIDOR',
    trafficWeight: 2.2,
    lat: 17.7424,
    lng: 83.3356,
    description: 'High-density commercial-residential junction with rapid transit bus feeder.'
  },
  {
    id: 'lm-rkbeach-02',
    name: 'RK Beach Promenade (Submarine Museum)',
    locality: 'Beach Road',
    ward: 'Ward 24 (Zone 3)',
    roadName: 'Beach Road Coastal Highway',
    roadType: 'COASTAL_PROMENADE',
    trafficWeight: 2.4,
    lat: 17.7142,
    lng: 83.3234,
    description: 'Primary tourist and civic promenade with constant pedestrian density.'
  },
  {
    id: 'lm-siripuram-03',
    name: 'Siripuram Circle (VIP Road)',
    locality: 'Siripuram',
    ward: 'Ward 21 (Zone 3)',
    roadName: 'VIP Road / Waltair Uplands Link',
    roadType: 'COMMERCIAL_HUB',
    trafficWeight: 2.3,
    lat: 17.7225,
    lng: 83.3155,
    description: 'Central administrative and shopping intersection connecting AU Campus.'
  },
  {
    id: 'lm-dwaraka-04',
    name: 'Dwaraka Nagar (RTC Complex)',
    locality: 'Dwaraka Nagar',
    ward: 'Ward 27 (Zone 3)',
    roadName: 'Dwaraka Bus Station Approach Road',
    roadType: 'ARTERIAL_CORRIDOR',
    trafficWeight: 2.5,
    lat: 17.7265,
    lng: 83.3072,
    description: 'Busiest multimodal transit interchange with 2,400+ bus movements daily.'
  },
  {
    id: 'lm-jagadamba-05',
    name: 'Jagadamba Centre (Central Cinema Circle)',
    locality: 'Jagadamba Centre',
    ward: 'Ward 31 (Zone 4)',
    roadName: 'Cinema Road / One Town Link',
    roadType: 'COMMERCIAL_HUB',
    trafficWeight: 2.4,
    lat: 17.7121,
    lng: 83.3012,
    description: 'Historic commercial bottleneck with high two-wheeler and pedestrian volumes.'
  },
  {
    id: 'lm-gajuwaka-06',
    name: 'Gajuwaka Junction (Kanithi Road)',
    locality: 'Gajuwaka',
    ward: 'Ward 65 (Zone 6)',
    roadName: 'Kanithi Road / NH16 Service Lane',
    roadType: 'TRANSIT_HIGHWAY',
    trafficWeight: 2.1,
    lat: 17.6905,
    lng: 83.2095,
    description: 'Heavy industrial transit artery accommodating steel plant logistics.'
  },
  {
    id: 'lm-madhurawada-07',
    name: 'Madhurawada IT SEZ Gateway (Hill 2)',
    locality: 'Madhurawada',
    ward: 'Ward 5 (Zone 1)',
    roadName: 'IT Park Link Road',
    roadType: 'ARTERIAL_CORRIDOR',
    trafficWeight: 1.8,
    lat: 17.8042,
    lng: 83.3551,
    description: 'Rapidly growing tech corridor with high evening peak vehicle volume.'
  },
  {
    id: 'lm-rushikonda-08',
    name: 'Rushikonda Beach & IT Park Road',
    locality: 'Rushikonda',
    ward: 'Ward 6 (Zone 1)',
    roadName: 'Beach Road Extension / IT Hill Drive',
    roadType: 'COASTAL_PROMENADE',
    trafficWeight: 1.7,
    lat: 17.7816,
    lng: 83.3768,
    description: 'Scenic transit road with severe monsoon water runoff patterns.'
  },
  {
    id: 'lm-seethammad-09',
    name: 'Seethammadhara North Extension (Balaji Temple)',
    locality: 'Seethammadhara',
    ward: 'Ward 14 (Zone 2)',
    roadName: 'North Extension Main Road',
    roadType: 'RESIDENTIAL_CONNECTOR',
    trafficWeight: 1.6,
    lat: 17.7391,
    lng: 83.3168,
    description: 'Primary residential artery linking NH16 bypass to Waltair ridge.'
  },
  {
    id: 'lm-kurmannapalem-10',
    name: 'Kurmannapalem Junction (Steel Plant Gate)',
    locality: 'Kurmannapalem',
    ward: 'Ward 72 (Zone 6)',
    roadName: 'NH16 Steel City Corridor',
    roadType: 'TRANSIT_HIGHWAY',
    trafficWeight: 2.0,
    lat: 17.6748,
    lng: 83.1672,
    description: 'Southern gateway junction connecting national highway to heavy industry.'
  }
];

/**
 * Standard Haversine formula to compute distance between coordinates in meters.
 */
export function calculateDistanceMeters(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371e3; // Earth radius in meters
  const phi1 = (lat1 * Math.PI) / 180;
  const phi2 = (lat2 * Math.PI) / 180;
  const deltaPhi = ((lat2 - lat1) * Math.PI) / 180;
  const deltaLambda = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
    Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return Math.round(R * c);
}

/**
 * Ray-casting algorithm to determine if point (lat, lng) is inside the CloudPulse Visakhapatnam operational zone polygon.
 */
export function isPointInVizagOperationalZone(lat: number, lng: number): {
  inZone: boolean;
  sector?: string;
  ward?: string;
  nearestLandmark?: VizagLandmark;
  distanceToNearestMeters?: number;
  message: string;
} {
  const polygon = VIZAG_OPERATIONAL_ZONE_POLYGON;
  let inside = false;

  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i].lng;
    const yi = polygon[i].lat;
    const xj = polygon[j].lng;
    const yj = polygon[j].lat;

    const intersect =
      yi > lat !== yj > lat && lng < ((xj - xi) * (lat - yi)) / (yj - yi) + xi;
    if (intersect) inside = !inside;
  }

  // Find nearest known landmark
  let nearest: VizagLandmark | undefined;
  let minDistance = Infinity;

  for (const lm of VIZAG_LANDMARKS) {
    const dist = calculateDistanceMeters(lat, lng, lm.lat, lm.lng);
    if (dist < minDistance) {
      minDistance = dist;
      nearest = lm;
    }
  }

  if (inside) {
    return {
      inZone: true,
      sector: nearest ? `${nearest.locality} Corridor` : 'Visakhapatnam Urban Grid',
      ward: nearest?.ward || 'GVMC Central Jurisdiction',
      nearestLandmark: nearest,
      distanceToNearestMeters: minDistance,
      message: `Within CloudPulse Vizag Operational Zone (${nearest?.ward || 'GVMC Zone'}). Nearest landmark: ${nearest?.name} (${minDistance}m away).`
    };
  } else {
    return {
      inZone: false,
      nearestLandmark: nearest,
      distanceToNearestMeters: minDistance,
      message: `Outside CloudPulse Vizag Operational Zone. Nearest supported sector is ${nearest?.name} (${(minDistance / 1000).toFixed(1)} km away).`
    };
  }
}
