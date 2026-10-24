import { 
  Incident, 
  Hotspot, 
  AgentMetric, 
  CloudServiceHealth, 
  LiveActivityEvent, 
  UserProfile, 
  AgentName, 
  IncidentCategory, 
  IncidentStatus, 
  DuplicateReport,
  WorkOrder,
  FieldCrew,
  WardProfile,
  CivicUserKarma,
  EmergencyAlert,
  DronePatrolRoute,
  DroneDetection,
  CapitalBudget,
  WorkOrderStatus,
  FieldCrewStatus
} from '../types';
import { initialIncidents, initialHotspots, initialAgentMetrics, initialCloudHealth, initialLiveActivity, sampleImages } from './mock/seedData';
import { 
  initialWorkOrders, 
  initialFieldCrews, 
  initialWards, 
  initialCivicKarma, 
  initialEmergencyAlerts, 
  initialDroneRoutes, 
  initialDroneDetections, 
  initialCapitalBudget 
} from './mock/enterpriseData';
import { realtimeSync, SyncMessage } from './realtime/supabaseClient';
import { calculateDistanceMeters } from './geo/vizagGeofence';

const STORAGE_KEY_INCIDENTS = 'cloudpulse_vizag_incidents';
const STORAGE_KEY_HOTSPOTS = 'cloudpulse_vizag_hotspots';
const STORAGE_KEY_ACTIVITY = 'cloudpulse_vizag_activity';
const STORAGE_KEY_WORK_ORDERS = 'cloudpulse_vizag_work_orders';
const STORAGE_KEY_CREWS = 'cloudpulse_vizag_crews';
const STORAGE_KEY_ALERTS = 'cloudpulse_vizag_alerts';

class IncidentStore {
  private incidents: Incident[] = [];
  private hotspots: Hotspot[] = [];
  private agentMetrics: AgentMetric[] = [...initialAgentMetrics];
  private cloudHealth: CloudServiceHealth[] = [...initialCloudHealth];
  private liveActivity: LiveActivityEvent[] = [];
  private workOrders: WorkOrder[] = [];
  private fieldCrews: FieldCrew[] = [];
  private wards: WardProfile[] = [...initialWards];
  private civicKarma: CivicUserKarma[] = [...initialCivicKarma];
  private emergencyAlerts: EmergencyAlert[] = [];
  private droneRoutes: DronePatrolRoute[] = [...initialDroneRoutes];
  private droneDetections: DroneDetection[] = [...initialDroneDetections];
  private capitalBudget: CapitalBudget = { ...initialCapitalBudget };
  private selectedIncident: Incident | null = null;
  private demoMode: boolean = true;
  private newlyArrivedIncidentId: string | null = null;
  private currentUser: UserProfile = {
    id: 'usr-001',
    name: 'Command Administrator',
    role: 'Command Administrator',
    department: 'Smart City Infrastructure Operations Cell (GVMC)',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'
  };
  private listeners: Set<() => void> = new Set();

  constructor() {
    this.loadFromStorage();
    this.initRealtimeSubscription();
  }

  private loadFromStorage() {
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        const storedIncidents = localStorage.getItem(STORAGE_KEY_INCIDENTS);
        if (storedIncidents) {
          this.incidents = JSON.parse(storedIncidents);
        } else {
          this.incidents = [...initialIncidents];
          this.saveIncidentsToStorage();
        }

        const storedHotspots = localStorage.getItem(STORAGE_KEY_HOTSPOTS);
        if (storedHotspots) {
          this.hotspots = JSON.parse(storedHotspots);
        } else {
          this.hotspots = [...initialHotspots];
          this.saveHotspotsToStorage();
        }

        const storedActivity = localStorage.getItem(STORAGE_KEY_ACTIVITY);
        if (storedActivity) {
          this.liveActivity = JSON.parse(storedActivity);
        } else {
          this.liveActivity = [...initialLiveActivity];
          this.saveActivityToStorage();
        }

        const storedWorkOrders = localStorage.getItem(STORAGE_KEY_WORK_ORDERS);
        if (storedWorkOrders) {
          this.workOrders = JSON.parse(storedWorkOrders);
        } else {
          this.workOrders = [...initialWorkOrders];
          this.saveWorkOrdersToStorage();
        }

        const storedCrews = localStorage.getItem(STORAGE_KEY_CREWS);
        if (storedCrews) {
          this.fieldCrews = JSON.parse(storedCrews);
        } else {
          this.fieldCrews = [...initialFieldCrews];
          this.saveCrewsToStorage();
        }

        const storedAlerts = localStorage.getItem(STORAGE_KEY_ALERTS);
        if (storedAlerts) {
          this.emergencyAlerts = JSON.parse(storedAlerts);
        } else {
          this.emergencyAlerts = [...initialEmergencyAlerts];
          this.saveAlertsToStorage();
        }
      } catch (e) {
        console.warn('[IncidentStore] Storage read fallback:', e);
        this.incidents = [...initialIncidents];
        this.hotspots = [...initialHotspots];
        this.liveActivity = [...initialLiveActivity];
        this.workOrders = [...initialWorkOrders];
        this.fieldCrews = [...initialFieldCrews];
        this.emergencyAlerts = [...initialEmergencyAlerts];
      }
    } else {
      this.incidents = [...initialIncidents];
      this.hotspots = [...initialHotspots];
      this.liveActivity = [...initialLiveActivity];
      this.workOrders = [...initialWorkOrders];
      this.fieldCrews = [...initialFieldCrews];
      this.emergencyAlerts = [...initialEmergencyAlerts];
    }

    this.selectedIncident = this.incidents[0] || null;
  }

  private saveIncidentsToStorage() {
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        localStorage.setItem(STORAGE_KEY_INCIDENTS, JSON.stringify(this.incidents));
      } catch (e) {}
    }
  }

  private saveHotspotsToStorage() {
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        localStorage.setItem(STORAGE_KEY_HOTSPOTS, JSON.stringify(this.hotspots));
      } catch (e) {}
    }
  }

  private saveActivityToStorage() {
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        localStorage.setItem(STORAGE_KEY_ACTIVITY, JSON.stringify(this.liveActivity.slice(0, 50)));
      } catch (e) {}
    }
  }

  private saveWorkOrdersToStorage() {
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        localStorage.setItem(STORAGE_KEY_WORK_ORDERS, JSON.stringify(this.workOrders));
      } catch (e) {}
    }
  }

  private saveCrewsToStorage() {
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        localStorage.setItem(STORAGE_KEY_CREWS, JSON.stringify(this.fieldCrews));
      } catch (e) {}
    }
  }

  private saveAlertsToStorage() {
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        localStorage.setItem(STORAGE_KEY_ALERTS, JSON.stringify(this.emergencyAlerts));
      } catch (e) {}
    }
  }

  private initRealtimeSubscription() {
    realtimeSync.subscribe((msg: SyncMessage) => {
      if (msg.type === 'INCIDENT_CREATED') {
        const remoteIncident = msg.data as Incident;
        if (!this.incidents.some(i => i.id === remoteIncident.id)) {
          this.incidents = [remoteIncident, ...this.incidents];
          this.saveIncidentsToStorage();
          this.newlyArrivedIncidentId = remoteIncident.id;
          this.notify();
        }
      } else if (msg.type === 'INCIDENT_UPDATED') {
        const id = msg.incidentId;
        const updates = msg.data as Partial<Incident>;
        this.incidents = this.incidents.map(i => i.id === id ? { ...i, ...updates } : i);
        if (this.selectedIncident?.id === id) {
          this.selectedIncident = { ...this.selectedIncident, ...updates };
        }
        this.saveIncidentsToStorage();
        this.notify();
      } else if (msg.type === 'DUPLICATE_MERGED') {
        const masterId = msg.incidentId;
        const { duplicate, newCount } = msg.data as { duplicate: DuplicateReport; newCount: number };
        this.incidents = this.incidents.map(inc => {
          if (inc.id === masterId) {
            const currentDups = inc.duplicates || [];
            return {
              ...inc,
              duplicateCount: newCount,
              duplicates: [duplicate, ...currentDups]
            };
          }
          return inc;
        });
        if (this.selectedIncident?.id === masterId) {
          const currentDups = this.selectedIncident.duplicates || [];
          this.selectedIncident = {
            ...this.selectedIncident,
            duplicateCount: newCount,
            duplicates: [duplicate, ...currentDups]
          };
        }
        this.saveIncidentsToStorage();
        this.notify();
      }
    });
  }

  public subscribe(listener: () => void) {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify() {
    this.listeners.forEach(fn => fn());
  }

  public getIncidents(): Incident[] {
    return this.incidents;
  }

  public getIncidentById(id: string): Incident | undefined {
    return this.incidents.find(i => i.id === id);
  }

  public getHotspots(): Hotspot[] {
    return this.hotspots;
  }

  public getAgentMetrics(): AgentMetric[] {
    return this.agentMetrics;
  }

  public getCloudHealth(): CloudServiceHealth[] {
    return this.cloudHealth;
  }

  public getLiveActivity(): LiveActivityEvent[] {
    return this.liveActivity;
  }

  public getSelectedIncident(): Incident | null {
    return this.selectedIncident;
  }

  public setSelectedIncident(incident: Incident | null) {
    this.selectedIncident = incident;
    this.notify();
  }

  public getNewlyArrivedIncidentId(): string | null {
    return this.newlyArrivedIncidentId;
  }

  public clearNewlyArrivedIncidentId() {
    this.newlyArrivedIncidentId = null;
    this.notify();
  }

  public getUser(): UserProfile {
    return this.currentUser;
  }

  public setUserRole(role: UserProfile['role']) {
    this.currentUser.role = role;
    if (role === 'Citizen') {
      this.currentUser.name = 'Citizen Contributor';
      this.currentUser.department = 'Visakhapatnam Resident & Civic Contributor';
    } else if (role === 'Field Operator') {
      this.currentUser.name = 'Field Response Operator';
      this.currentUser.department = 'GVMC Rapid Response Field Crew Unit 3';
    } else {
      this.currentUser.name = 'Command Administrator';
      this.currentUser.department = 'Smart City Infrastructure Operations Cell (GVMC)';
    }
    this.notify();
  }

  public isDemoMode(): boolean {
    return this.demoMode;
  }

  public setDemoMode(mode: boolean) {
    this.demoMode = mode;
    this.notify();
  }

  /**
   * Scans for an existing incident of the same category within maxDistanceMeters (default 50m).
   */
  public findDuplicateIncident(
    lat: number,
    lng: number,
    category: IncidentCategory,
    maxDistanceMeters: number = 50
  ): { incident: Incident; distanceMeters: number } | null {
    for (const inc of this.incidents) {
      if (inc.status === 'RESOLVED' || inc.status === 'VERIFIED') continue;
      if (inc.category === category) {
        const dist = calculateDistanceMeters(lat, lng, inc.latitude, inc.longitude);
        if (dist <= maxDistanceMeters) {
          return { incident: inc, distanceMeters: dist };
        }
      }
    }
    return null;
  }

  /**
   * Consolidates a duplicate citizen report into an existing master incident.
   */
  public mergeDuplicateReport(
    masterIncidentId: string,
    report: { reporterName: string; notes?: string; image?: string; distanceMeters?: number }
  ): Incident {
    const existing = this.getIncidentById(masterIncidentId);
    if (!existing) throw new Error(`Master incident ${masterIncidentId} not found`);

    const newDuplicate: DuplicateReport = {
      id: `dup-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      timestamp: new Date().toISOString(),
      reporterName: report.reporterName || 'Anonymous Citizen',
      notes: report.notes,
      image: report.image,
      distanceMeters: report.distanceMeters
    };

    const updatedDuplicates = [newDuplicate, ...(existing.duplicates || [])];
    const newDuplicateCount = updatedDuplicates.length;
    // Boost confidence slightly when multiple citizens corroborate the issue
    const updatedConfidence = Math.min(0.995, existing.confidence + 0.015);

    const updatedIncident: Incident = {
      ...existing,
      duplicateCount: newDuplicateCount,
      duplicates: updatedDuplicates,
      confidence: updatedConfidence,
      nearbyCount: existing.nearbyCount + 1
    };

    this.incidents = this.incidents.map(i => i.id === masterIncidentId ? updatedIncident : i);
    if (this.selectedIncident?.id === masterIncidentId) {
      this.selectedIncident = updatedIncident;
    }
    this.saveIncidentsToStorage();

    // Broadcast update across tabs / Supabase
    realtimeSync.broadcastDuplicateMerged(masterIncidentId, newDuplicate, newDuplicateCount);

    this.addLiveActivity({
      agent: 'Correlation Agent',
      incidentId: masterIncidentId,
      message: `Correlation Agent merged duplicate report from ${newDuplicate.reporterName} into #${masterIncidentId} (${report.distanceMeters || 0}m away)`,
      type: 'warning'
    });

    this.notify();
    return updatedIncident;
  }

  public addIncident(newIncident: Incident) {
    this.incidents = [newIncident, ...this.incidents];
    this.newlyArrivedIncidentId = newIncident.id;
    this.saveIncidentsToStorage();

    // Broadcast across realtime channels
    realtimeSync.broadcastIncidentCreated(newIncident);

    // Auto increment agent metrics
    this.agentMetrics = this.agentMetrics.map(agent => ({
      ...agent,
      tasksProcessed: agent.tasksProcessed + 1,
      currentTask: `Processed #${newIncident.id}`
    }));

    // If incident is critical or nearby count is high, associate or update hotspot
    if (newIncident.nearbyCount >= 4 || newIncident.hotspotId) {
      const existingHotspotIndex = this.hotspots.findIndex(
        h => h.id === newIncident.hotspotId || h.locality === newIncident.locality
      );
      if (existingHotspotIndex >= 0) {
        const updated = [...this.hotspots];
        updated[existingHotspotIndex] = {
          ...updated[existingHotspotIndex],
          incidentCount: updated[existingHotspotIndex].incidentCount + 1,
          incidentIds: [newIncident.id, ...updated[existingHotspotIndex].incidentIds]
        };
        this.hotspots = updated;
        this.saveHotspotsToStorage();
      }
    }

    this.notify();
  }

  public updateIncident(id: string, updates: Partial<Incident>) {
    this.incidents = this.incidents.map(inc => {
      if (inc.id === id) {
        return { ...inc, ...updates };
      }
      return inc;
    });
    if (this.selectedIncident?.id === id) {
      this.selectedIncident = { ...this.selectedIncident, ...updates };
    }
    this.saveIncidentsToStorage();
    realtimeSync.broadcastIncidentUpdated(id, updates);
    this.notify();
  }

  /**
   * Transition lifecycle status (e.g. ASSIGNED -> IN_PROGRESS -> RESOLVED)
   */
  public updateIncidentStatus(id: string, newStatus: IncidentStatus, assignedTeam?: string) {
    const inc = this.getIncidentById(id);
    if (!inc) return;

    const oldStatus = inc.status;
    const updates: Partial<Incident> = {
      status: newStatus,
      ...(newStatus === 'RESOLVED' ? { resolvedAt: new Date().toISOString() } : {}),
      ...(assignedTeam ? { assignedTeam } : {})
    };

    this.updateIncident(id, updates);

    this.addLiveActivity({
      agent: 'Monitoring Agent',
      incidentId: id,
      message: `Status updated: #${id} [${oldStatus}] -> [${newStatus}]${assignedTeam ? ` (Assigned: ${assignedTeam})` : ''}`,
      type: newStatus === 'RESOLVED' ? 'success' : 'info'
    });
  }

  public addLiveActivity(event: Omit<LiveActivityEvent, 'id' | 'timestamp' | 'timeDisplay'>) {
    const now = new Date();
    const timeDisplay = now.toTimeString().split(' ')[0];
    const newEvent: LiveActivityEvent = {
      id: `act-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      timestamp: now.toISOString(),
      timeDisplay,
      ...event
    };
    this.liveActivity = [newEvent, ...this.liveActivity.slice(0, 49)];
    this.saveActivityToStorage();
    this.notify();
  }

  public updateAgentTask(agentName: AgentName, currentTask: string) {
    this.agentMetrics = this.agentMetrics.map(a => 
      a.name === agentName ? { ...a, currentTask } : a
    );
    this.notify();
  }

  public resetToFactoryDefaults() {
    this.incidents = [...initialIncidents];
    this.hotspots = [...initialHotspots];
    this.liveActivity = [...initialLiveActivity];
    this.workOrders = [...initialWorkOrders];
    this.fieldCrews = [...initialFieldCrews];
    this.emergencyAlerts = [...initialEmergencyAlerts];
    this.selectedIncident = this.incidents[0] || null;
    this.saveIncidentsToStorage();
    this.saveHotspotsToStorage();
    this.saveActivityToStorage();
    this.saveWorkOrdersToStorage();
    this.saveCrewsToStorage();
    this.saveAlertsToStorage();
    this.notify();
  }

  /* ==========================================================================
     ENTERPRISE WORK ORDERS LIFECYCLE
     ========================================================================== */

  public getWorkOrders(): WorkOrder[] {
    return this.workOrders;
  }

  public getWorkOrderById(id: string): WorkOrder | undefined {
    return this.workOrders.find(w => w.id === id);
  }

  public createWorkOrder(woData: Partial<WorkOrder>): WorkOrder {
    const newWo: WorkOrder = {
      id: `WO-GVMC-2026-${String(this.workOrders.length + 86).padStart(3, '0')}`,
      incidentId: woData.incidentId || 'INC-MANUAL',
      title: woData.title || 'Municipal Infrastructure Restoration',
      category: woData.category || 'Pothole',
      priority: woData.priority || 'P2',
      status: 'ISSUED',
      assignedCrewId: woData.assignedCrewId || 'CREW-02',
      assignedCrewName: woData.assignedCrewName || 'GVMC Rapid Road Unit 2',
      zone: woData.zone || 2,
      ward: woData.ward || 'Ward 18',
      address: woData.address || 'Visakhapatnam Municipal Jurisdiction',
      contractor: woData.contractor || 'Visakha Urban Infra Projects Ltd.',
      boqItems: woData.boqItems || [
        { item: 'Standard Asphalt Patch & Surface Leveling', quantity: 20, unit: 'sq.m', rate: 550, totalCost: 11000 },
        { item: 'Bituminous Tack Coat RS-1', quantity: 30, unit: 'liters', rate: 95, totalCost: 2850 },
        { item: 'Compaction Roller & Operator Hire', quantity: 2, unit: 'hours', rate: 2200, totalCost: 4400 }
      ],
      totalEstimatedCost: woData.totalEstimatedCost || 18250,
      scheduledDate: new Date().toISOString(),
      beforeImage: woData.beforeImage || sampleImages.potholeMVP,
      qrCodeHash: `GVMC-WO-2026-${Date.now().toString(36).toUpperCase()}`,
      materialsDispatched: true,
      ...woData
    };
    this.workOrders = [newWo, ...this.workOrders];
    this.saveWorkOrdersToStorage();
    this.addLiveActivity({
      agent: 'Monitoring Agent',
      incidentId: newWo.incidentId,
      message: `Work Order issued: [${newWo.id}] assigned to ${newWo.assignedCrewName} (Est: ₹${newWo.totalEstimatedCost.toLocaleString('en-IN')})`,
      type: 'success'
    });
    this.notify();
    return newWo;
  }

  public updateWorkOrderStatus(id: string, status: WorkOrderStatus) {
    this.workOrders = this.workOrders.map(wo => {
      if (wo.id === id) {
        return {
          ...wo,
          status,
          ...(status === 'COMPLETED' ? { completionDate: new Date().toISOString() } : {})
        };
      }
      return wo;
    });
    this.saveWorkOrdersToStorage();
    this.notify();
  }

  public verifyWorkOrderResolution(id: string, afterImage: string, score: number, notes: string) {
    this.workOrders = this.workOrders.map(wo => {
      if (wo.id === id) {
        return {
          ...wo,
          status: 'CERTIFIED' as WorkOrderStatus,
          afterImage,
          aiVerificationScore: score,
          aiVerificationNotes: notes,
          completionDate: new Date().toISOString(),
          officialSignoffBy: 'Er. D. Srinivasa Murthy (Executive Engineer, Zone 2)'
        };
      }
      return wo;
    });
    this.saveWorkOrdersToStorage();

    // Automatically resolve associated incident
    const targetWo = this.workOrders.find(w => w.id === id);
    if (targetWo && targetWo.incidentId) {
      this.updateIncidentStatus(targetWo.incidentId, 'RESOLVED');
    }

    this.addLiveActivity({
      agent: 'Vision Agent',
      incidentId: targetWo?.incidentId || id,
      message: `Resolution AI Verified for ${id}: Quality Score ${score}% certified. GVMC completion stamp applied.`,
      type: 'success'
    });
    this.notify();
  }

  /* ==========================================================================
     FIELD CREWS FLEET OPERATIONS
     ========================================================================== */

  public getFieldCrews(): FieldCrew[] {
    return this.fieldCrews;
  }

  public updateCrewStatus(crewId: string, status: FieldCrewStatus, currentLocality?: string) {
    this.fieldCrews = this.fieldCrews.map(c => {
      if (c.id === crewId) {
        return {
          ...c,
          status,
          ...(currentLocality ? { currentLocality } : {})
        };
      }
      return c;
    });
    this.saveCrewsToStorage();
    this.notify();
  }

  public assignCrewToWorkOrder(crewId: string, workOrderId: string) {
    const crew = this.fieldCrews.find(c => c.id === crewId);
    const wo = this.workOrders.find(w => w.id === workOrderId);
    if (!crew || !wo) return;

    this.updateCrewStatus(crewId, 'ON_SITE');
    this.workOrders = this.workOrders.map(w => 
      w.id === workOrderId ? { ...w, assignedCrewId: crewId, assignedCrewName: crew.name, status: 'DISPATCHED' } : w
    );
    this.saveWorkOrdersToStorage();
    this.saveCrewsToStorage();
    this.notify();
  }

  /* ==========================================================================
     WARD INTELLIGENCE & CIVIC KARMA
     ========================================================================== */

  public getWards(): WardProfile[] {
    return this.wards;
  }

  public getWardByNumber(num: number): WardProfile | undefined {
    return this.wards.find(w => w.wardNumber === num);
  }

  public getCivicKarma(): CivicUserKarma[] {
    return this.civicKarma;
  }

  public addCivicKarmaPoints(userId: string, points: number) {
    this.civicKarma = this.civicKarma.map(k => 
      k.id === userId ? { ...k, points: k.points + points, verifiedCount: k.verifiedCount + 1 } : k
    );
    this.notify();
  }

  /* ==========================================================================
     EMERGENCY BROADCASTS
     ========================================================================== */

  public getEmergencyAlerts(): EmergencyAlert[] {
    return this.emergencyAlerts;
  }

  public publishEmergencyAlert(alertData: Omit<EmergencyAlert, 'id' | 'publishedAt' | 'active'>): EmergencyAlert {
    const newAlert: EmergencyAlert = {
      id: `ALT-VIZAG-2026-${String(this.emergencyAlerts.length + 5).padStart(2, '0')}`,
      publishedAt: new Date().toISOString(),
      active: true,
      ...alertData
    };
    this.emergencyAlerts = [newAlert, ...this.emergencyAlerts];
    this.saveAlertsToStorage();
    this.addLiveActivity({
      agent: 'Monitoring Agent',
      incidentId: 'CITY-BROADCAST',
      message: `Emergency Alert Published: [${newAlert.title}] affecting ${newAlert.areasAffected.join(', ')}`,
      type: 'critical'
    });
    this.notify();
    return newAlert;
  }

  public toggleAlertActive(id: string) {
    this.emergencyAlerts = this.emergencyAlerts.map(a => 
      a.id === id ? { ...a, active: !a.active } : a
    );
    this.saveAlertsToStorage();
    this.notify();
  }

  /* ==========================================================================
     DRONE PATROL CORRIDORS & DETECTIONS
     ========================================================================== */

  public getDroneRoutes(): DronePatrolRoute[] {
    return this.droneRoutes;
  }

  public getDroneDetections(): DroneDetection[] {
    return this.droneDetections;
  }

  public updateDroneRouteStatus(id: string, status: DronePatrolRoute['status'], batteryPercent?: number) {
    this.droneRoutes = this.droneRoutes.map(r => 
      r.id === id ? { ...r, status, ...(batteryPercent !== undefined ? { batteryPercent } : {}) } : r
    );
    this.notify();
  }

  /* ==========================================================================
     CAPITAL INFRASTRUCTURE BUDGET FORECASTING
     ========================================================================== */

  public getCapitalBudget(): CapitalBudget {
    return this.capitalBudget;
  }

  public simulateBudgetRisk(rainfallIncreasePct: number): CapitalBudget {
    const baseRisk = 18.50;
    const extraRisk = (rainfallIncreasePct / 100) * 14.20;
    this.capitalBudget = {
      ...this.capitalBudget,
      projectedRainfallRiskPct: Math.round((rainfallIncreasePct + 15) * 10) / 10,
      monsoonReserveCrores: Math.round((baseRisk + extraRisk) * 100) / 100
    };
    this.notify();
    return this.capitalBudget;
  }
}

export const incidentStore = new IncidentStore();
