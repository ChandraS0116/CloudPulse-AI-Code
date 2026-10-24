export type IncidentCategory = 
  | 'Pothole'
  | 'Water Leakage'
  | 'Garbage Overflow'
  | 'Broken Streetlight'
  | 'Damaged Road'
  | 'Drainage Blockage'
  | 'Fallen Tree / Hazard';

export type IncidentSeverity = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
export type IncidentPriority = 'P1' | 'P2' | 'P3' | 'P4';

export type IncidentStatus = 
  | 'REPORTED' 
  | 'AI_ANALYZING'
  | 'AI_VERIFIED'
  | 'PRIORITIZED'
  | 'ACTION_REQUIRED'
  | 'ASSIGNED' 
  | 'IN_PROGRESS' 
  | 'RESOLVED'
  | 'VERIFIED'
  | 'REJECTED';

export type AgentName = 
  | 'Orchestrator'
  | 'Vision Agent'
  | 'Geo Agent'
  | 'Triage Agent'
  | 'Correlation Agent'
  | 'Decision Agent'
  | 'Monitoring Agent';

export type AIMode = 'DEMO_DETERMINISTIC' | 'LIVE_AI';

export interface AgentExecution {
  id: string;
  incidentId: string;
  agentName: AgentName;
  status: 'WAITING' | 'RUNNING' | 'COMPLETED' | 'FAILED';
  startedAt?: string;
  completedAt?: string;
  latencyMs: number;
  input: Record<string, any>;
  output: Record<string, any>;
  telemetryLogs: string[];
  aiMode?: AIMode;
}

export interface DuplicateReport {
  id: string;
  timestamp: string;
  reporterName: string;
  notes?: string;
  image?: string;
  distanceMeters?: number;
}

export interface Incident {
  id: string;
  category: IncidentCategory;
  image: string;
  latitude: number;
  longitude: number;
  locality: string;
  ward?: string;
  address: string;
  description: string;
  severity: IncidentSeverity;
  priority: IncidentPriority;
  confidence: number;
  status: IncidentStatus;
  createdAt: string;
  resolvedAt?: string;
  assignedTeam?: string;
  department?: string;
  targetResolutionHours?: number;
  slaDeadline?: string;
  caseId?: string;
  hotspotId?: string;
  hotspotName?: string;
  nearbyCount: number;
  duplicateCount: number;
  duplicates?: DuplicateReport[];
  agentTrace: AgentExecution[];
  recommendedAction: string;
  rationale: string;
  aiMode: AIMode;
  reporter?: {
    name: string;
    role: 'Citizen' | 'Field Inspector' | 'Municipal Sensor';
  };
  isImageValid?: boolean;
  imageRejectionReason?: string;
  detectedVisualFeatures?: string[];
}

export interface Hotspot {
  id: string;
  name: string;
  locality: string;
  latitude: number;
  longitude: number;
  radiusMeters: number;
  incidentCount: number;
  growthRate: string;
  severity: IncidentSeverity;
  confidence: number;
  recommendedAction: string;
  incidentIds: string[];
  createdAt: string;
}

export interface AgentMetric {
  id: string;
  name: AgentName;
  role: string;
  status: 'ONLINE' | 'STANDBY' | 'DEGRADED';
  mode: 'AUTONOMOUS' | 'SUPERVISED';
  tasksProcessed: number;
  successRate: number;
  avgLatencyMs: number;
  currentTask: string;
  description: string;
  capabilities: string[];
}

export interface CloudServiceHealth {
  name: string;
  type: 'API Gateway' | 'Database' | 'Vector DB' | 'Orchestrator' | 'Inference Engine' | 'Object Storage' | 'Pub/Sub Stream';
  status: 'ONLINE' | 'DEGRADED' | 'STANDBY';
  latencyMs: number;
  uptime: string;
  region: string;
}

export interface LiveActivityEvent {
  id: string;
  timestamp: string;
  timeDisplay: string;
  agent: AgentName;
  incidentId: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'critical';
}

export interface UserProfile {
  id: string;
  name: string;
  role: 'Citizen' | 'Field Operator' | 'Command Administrator';
  department: string;
  avatar: string;
}

/* ==========================================================================
   ENTERPRISE MUNICIPAL EXTENSIONS: WORK ORDERS & CREWS
   ========================================================================== */

export type WorkOrderStatus = 
  | 'ISSUED' 
  | 'DISPATCHED' 
  | 'IN_REPAIR' 
  | 'INSPECTION_PENDING' 
  | 'COMPLETED' 
  | 'CERTIFIED';

export interface BOQItem {
  item: string;
  quantity: number;
  unit: string;
  rate: number;
  totalCost: number;
}

export interface WorkOrder {
  id: string;
  incidentId: string;
  title: string;
  category: IncidentCategory;
  priority: IncidentPriority;
  status: WorkOrderStatus;
  assignedCrewId: string;
  assignedCrewName: string;
  zone: number;
  ward: string;
  address: string;
  contractor: string;
  boqItems: BOQItem[];
  totalEstimatedCost: number;
  actualCost?: number;
  scheduledDate: string;
  completionDate?: string;
  beforeImage: string;
  afterImage?: string;
  aiVerificationScore?: number;
  aiVerificationNotes?: string;
  officialSignoffBy?: string;
  qrCodeHash: string;
  materialsDispatched: boolean;
}

export type FieldCrewStatus = 'AVAILABLE' | 'EN_ROUTE' | 'ON_SITE' | 'RETURNING' | 'OFF_DUTY';

export interface FieldCrew {
  id: string;
  name: string;
  zone: number;
  leader: string;
  contact: string;
  vehicleNumber: string;
  vehicleType: string;
  status: FieldCrewStatus;
  activeWorkOrderId?: string;
  currentLat: number;
  currentLng: number;
  equipment: string[];
  completedToday: number;
  crewSize: number;
  currentLocality: string;
}

/* ==========================================================================
   WARD INTELLIGENCE & CIVIC SCORECARDS
   ========================================================================== */

export interface WardProfile {
  wardNumber: number;
  name: string;
  zone: number;
  corporator: string;
  engineer: string;
  phone: string;
  cleanlinessScore: number;
  potholeFreeIndex: number;
  activeIncidents: number;
  resolvedThisMonth: number;
  avgResolutionHours: number;
  population: number;
  keyLandmarks: string[];
}

export interface CivicUserKarma {
  id: string;
  name: string;
  ward: string;
  points: number;
  reportsCount: number;
  verifiedCount: number;
  badge: string;
  rank: number;
  joinedDate: string;
}

export interface EmergencyAlert {
  id: string;
  title: string;
  category: 'CYCLONE' | 'FLASH_FLOOD' | 'WATER_PIPELINE' | 'TRAFFIC_DIVERSION' | 'ROAD_COLLAPSE';
  severity: 'CRITICAL' | 'WARNING' | 'ADVISORY';
  areasAffected: string[];
  publishedAt: string;
  validUntil: string;
  active: boolean;
  actionRequired: string;
  broadcastAuthority: string;
}

/* ==========================================================================
   DRONE PATROL & PAVEMENT DISTRESS VISION LAB
   ========================================================================== */

export interface DroneWaypoint {
  lat: number;
  lng: number;
  name: string;
}

export interface DronePatrolRoute {
  id: string;
  name: string;
  corridor: string;
  totalDistanceKm: number;
  altitudeMeters: number;
  batteryPercent: number;
  status: 'IDLE' | 'PATROLLING' | 'ANALYZING' | 'RETURNING';
  waypoints: DroneWaypoint[];
  detectionsCount: number;
  pavementConditionIndex: number;
  maxSpeedKmph: number;
}

export interface DroneDetection {
  id: string;
  timestamp: string;
  routeId: string;
  lat: number;
  lng: number;
  defectType: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM';
  estimatedAreaSqM: number;
  confidence: number;
  snapshot: string;
  ircStandardCode: string;
  locality: string;
}

/* ==========================================================================
   CAPITAL BUDGET & INFRASTRUCTURE PLANNING
   ========================================================================== */

export interface CapitalBudgetCategory {
  name: string;
  allocatedCrores: number;
  spentCrores: number;
  projectsCount: number;
  color: string;
}

export interface CapitalBudget {
  fiscalYear: string;
  totalAllocatedCrores: number;
  spentCrores: number;
  committedCrores: number;
  categories: CapitalBudgetCategory[];
  monsoonReserveCrores: number;
  projectedRainfallRiskPct: number;
}
