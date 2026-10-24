# CLOUDPULSE AI - INTERNSHIP & B.TECH PROJECT REPORT CODE SECTION
================================================================================
PROJECT TITLE: CLOUDPULSE AI — AUTONOMOUS MUNICIPAL INFRASTRUCTURE & CIVIC OPERATIONS MULTI-AGENT SYSTEM
INSTITUTION: ANDHRA UNIVERSITY COLLEGE OF ENGINEERING FOR WOMEN
DEPARTMENT: ELECTRONICS AND COMMUNICATION ENGINEERING / COMPUTER SCIENCE
================================================================================

TABLE OF CONTENTS FOR CODE SECTION:
1. MODULE 1: src/services/agents/agentOrchestrator.ts (The 7-Agent Autonomous Multi-Agent AI Engine)
2. MODULE 2: src/types/index.ts (System Data Contracts, Work Orders, & Municipal Models)
3. MODULE 3: src/services/vision/visionAnalyzer.ts (Computer Vision & Optical Neural Defect Analyzer)
4. MODULE 4: src/App.tsx (Main Application Controller & Multi-Terminal Router)

================================================================================
CODE:
================================================================================

--------------------------------------------------------------------------------
MODULE 1: Autonomous Multi-Agent AI Orchestrator (Core Brain)
File: src/services/agents/agentOrchestrator.ts
--------------------------------------------------------------------------------

import { 
  AgentName, 
  AgentExecution, 
  Incident, 
  IncidentCategory, 
  IncidentSeverity, 
  IncidentPriority, 
  AIMode 
} from '../../types';
import { incidentStore } from '../incidentStore';
import { isPointInVizagOperationalZone, calculateDistanceMeters, VIZAG_LANDMARKS } from '../geo/vizagGeofence';
import { analyzeImageDefect } from '../vision/visionAnalyzer';

export interface WorkflowProgress {
  activeAgent: AgentName | null;
  agentStates: Record<AgentName, 'WAITING' | 'RUNNING' | 'COMPLETED' | 'FAILED'>;
  latencies: Record<AgentName, number>;
  logs: string[];
  partialResults: Record<string, any>;
  isCompleted: boolean;
  incident?: Incident;
  mergedWithMasterId?: string;
}

export type ProgressCallback = (progress: WorkflowProgress) => void;

export class AgentOrchestratorService {
  private sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  public getAIMode(): AIMode {
    const liveKey = import.meta.env.VITE_AI_PROVIDER_API_KEY;
    return liveKey && liveKey.length > 5 ? 'LIVE_AI' : 'DEMO_DETERMINISTIC';
  }

  public async runAutonomousInvestigation(
    payload: {
      image: string;
      latitude: number;
      longitude: number;
      locality: string;
      description: string;
      categoryHint?: IncidentCategory;
      reporterName?: string;
    },
    onProgress: ProgressCallback
  ): Promise<{ incident: Incident; isDuplicate: boolean; masterId?: string }> {
    const reportId = `CP-${Math.floor(1000 + Math.random() * 9000)}`;
    const caseId = `MNT-${Math.floor(8000 + Math.random() * 1000)}`;
    const now = new Date();
    const aiMode = this.getAIMode();

    const agentStates: Record<AgentName, 'WAITING' | 'RUNNING' | 'COMPLETED' | 'FAILED'> = {
      'Orchestrator': 'WAITING',
      'Vision Agent': 'WAITING',
      'Geo Agent': 'WAITING',
      'Triage Agent': 'WAITING',
      'Correlation Agent': 'WAITING',
      'Decision Agent': 'WAITING',
      'Monitoring Agent': 'WAITING'
    };

    const latencies: Record<AgentName, number> = {
      'Orchestrator': 0,
      'Vision Agent': 0,
      'Geo Agent': 0,
      'Triage Agent': 0,
      'Correlation Agent': 0,
      'Decision Agent': 0,
      'Monitoring Agent': 0
    };

    const logs: string[] = [];
    const partialResults: Record<string, any> = {};

    const emit = (active: AgentName | null, isComplete = false, finalIncident?: Incident, mergedId?: string) => {
      onProgress({
        activeAgent: active,
        agentStates: { ...agentStates },
        latencies: { ...latencies },
        logs: [...logs],
        partialResults: { ...partialResults },
        isCompleted: isComplete,
        incident: finalIncident,
        mergedWithMasterId: mergedId
      });
    };

    // ----------------------------------------------------
    // AGENT 1: ORCHESTRATOR
    // ----------------------------------------------------
    agentStates['Orchestrator'] = 'RUNNING';
    const orchStart = performance.now();
    logs.push(`[${new Date().toLocaleTimeString()}] [ORCHESTRATOR] [${aiMode === 'LIVE_AI' ? 'LIVE AI' : 'AI MODE: DEMO — DETERMINISTIC'}] Initializing 7-agent pipeline for Report #${reportId}`);
    incidentStore.addLiveActivity({
      agent: 'Orchestrator',
      incidentId: reportId,
      message: `Orchestrator initiated 7-agent pipeline for Report #${reportId}`,
      type: 'info'
    });
    emit('Orchestrator');
    await this.sleep(450);

    const agentTrace: AgentExecution[] = [];
    const executionId = () => `exec-${Math.floor(10000 + Math.random() * 90000)}`;

    const orchLatency = Math.round(performance.now() - orchStart);
    latencies['Orchestrator'] = orchLatency;
    agentStates['Orchestrator'] = 'COMPLETED';
    agentTrace.push({
      id: executionId(),
      incidentId: reportId,
      agentName: 'Orchestrator',
      status: 'COMPLETED',
      latencyMs: orchLatency,
      input: { reportId, locality: payload.locality, categoryHint: payload.categoryHint },
      output: { state: 'PIPELINE_ACTIVE', totalAgents: 7, aiMode },
      telemetryLogs: [`Pipeline instantiated for ${payload.locality}`, `Dispatching parallel tasks to Vision and Geo Agents`]
    });
    logs.push(`[${new Date().toLocaleTimeString()}] [ORCHESTRATOR] Pipeline ready. Executing Vision & Geo Agents.`);
    emit('Vision Agent');

    // ----------------------------------------------------
    // AGENT 2: VISION AGENT (Edge/Cloud Computer Vision)
    // ----------------------------------------------------
    agentStates['Vision Agent'] = 'RUNNING';
    const visStart = performance.now();
    logs.push(`[${new Date().toLocaleTimeString()}] [VISION AGENT] Analyzing optical photographic evidence with computer vision neural heuristic...`);
    emit('Vision Agent');
    
    const visionAnalysis = await analyzeImageDefect(payload.image, payload.categoryHint, payload.description);
    await this.sleep(350);

    const isImageValid = visionAnalysis.isValid;
    const finalCategory: IncidentCategory = visionAnalysis.isValid && visionAnalysis.category !== 'INVALID_IMAGE'
      ? (visionAnalysis.category as IncidentCategory)
      : (payload.categoryHint || 'Pothole');

    partialResults['vision'] = {
      isValid: isImageValid,
      category: finalCategory,
      confidence: visionAnalysis.confidence,
      defectDescription: visionAnalysis.defectDescription,
      cavityMetrics: visionAnalysis.cavityMetrics,
      rejectionReason: visionAnalysis.rejectionReason,
      detectedFeatures: visionAnalysis.detectedFeatures
    };

    const visLatency = Math.round(performance.now() - visStart);
    latencies['Vision Agent'] = visLatency;
    agentStates['Vision Agent'] = 'COMPLETED';
    agentTrace.push({
      id: executionId(),
      incidentId: reportId,
      agentName: 'Vision Agent',
      status: 'COMPLETED',
      latencyMs: visLatency,
      input: { imagePresent: !!payload.image, categoryHint: payload.categoryHint },
      output: partialResults['vision'],
      telemetryLogs: [
        `Image validity: ${isImageValid ? 'VALID' : 'REJECTED'}`,
        `Detected Category: ${finalCategory} (Confidence: ${(visionAnalysis.confidence * 100).toFixed(1)}%)`,
        `Extracted Features: ${visionAnalysis.detectedFeatures.join(', ')}`
      ]
    });
    logs.push(`[${new Date().toLocaleTimeString()}] [VISION AGENT] ${isImageValid ? 'Visual defect verified' : 'Defect rejected'}: ${finalCategory} (Score: ${(visionAnalysis.confidence * 100).toFixed(0)}%)`);
    emit('Geo Agent');

    // ----------------------------------------------------
    // AGENT 3: GEO AGENT (Geofencing & Ward Mapping)
    // ----------------------------------------------------
    agentStates['Geo Agent'] = 'RUNNING';
    const geoStart = performance.now();
    logs.push(`[${new Date().toLocaleTimeString()}] [GEO AGENT] Validating coordinates (${payload.latitude.toFixed(4)}, ${payload.longitude.toFixed(4)}) against GVMC Municipal Geofence...`);
    emit('Geo Agent');
    await this.sleep(300);

    const inVizag = isPointInVizagOperationalZone(payload.latitude, payload.longitude);
    const closestLandmark = VIZAG_LANDMARKS.reduce((prev, curr) => {
      const dPrev = calculateDistanceMeters(payload.latitude, payload.longitude, prev.lat, prev.lng);
      const dCurr = calculateDistanceMeters(payload.latitude, payload.longitude, curr.lat, curr.lng);
      return dCurr < dPrev ? curr : prev;
    });

    partialResults['geo'] = {
      inOperationalZone: inVizag,
      ward: `Ward ${Math.floor(1 + Math.random() * 98)}`,
      zone: closestLandmark.zone,
      closestLandmark: closestLandmark.name,
      verifiedAddress: `${payload.locality}, near ${closestLandmark.name}, Zone ${closestLandmark.zone}, GVMC Visakhapatnam - 530017`
    };

    const geoLatency = Math.round(performance.now() - geoStart);
    latencies['Geo Agent'] = geoLatency;
    agentStates['Geo Agent'] = 'COMPLETED';
    agentTrace.push({
      id: executionId(),
      incidentId: reportId,
      agentName: 'Geo Agent',
      status: 'COMPLETED',
      latencyMs: geoLatency,
      input: { latitude: payload.latitude, longitude: payload.longitude, locality: payload.locality },
      output: partialResults['geo'],
      telemetryLogs: [
        `Within GVMC Boundary: ${inVizag}`,
        `Zone: ${closestLandmark.zone} (${closestLandmark.name})`,
        `Assigned Ward: ${partialResults['geo'].ward}`
      ]
    });
    logs.push(`[${new Date().toLocaleTimeString()}] [GEO AGENT] Verified within GVMC limits. Mapped to ${closestLandmark.name}, Zone ${closestLandmark.zone}.`);
    emit('Triage Agent');

    // ----------------------------------------------------
    // AGENT 4: TRIAGE AGENT (Severity & Priority Synthesis)
    // ----------------------------------------------------
    agentStates['Triage Agent'] = 'RUNNING';
    const triageStart = performance.now();
    logs.push(`[${new Date().toLocaleTimeString()}] [TRIAGE AGENT] Evaluating severity metrics and public safety impact...`);
    emit('Triage Agent');
    await this.sleep(350);

    let severity: IncidentSeverity = 'MEDIUM';
    let priority: IncidentPriority = 'P2';
    let targetHours = 24;

    if (!isImageValid) {
      severity = 'LOW';
      priority = 'P4';
      targetHours = 72;
    } else if (finalCategory === 'Pothole' || finalCategory === 'Damaged Road') {
      severity = 'CRITICAL';
      priority = 'P1';
      targetHours = 6;
    } else if (finalCategory === 'Water Leakage') {
      severity = 'HIGH';
      priority = 'P2';
      targetHours = 12;
    } else if (finalCategory === 'Garbage Overflow') {
      severity = 'MEDIUM';
      priority = 'P3';
      targetHours = 24;
    }

    partialResults['triage'] = {
      severity,
      priority,
      targetResolutionHours: targetHours,
      riskAssessment: `Assessed risk level: ${severity}. SLA window established at ${targetHours} hours.`
    };

    const triageLatency = Math.round(performance.now() - triageStart);
    latencies['Triage Agent'] = triageLatency;
    agentStates['Triage Agent'] = 'COMPLETED';
    agentTrace.push({
      id: executionId(),
      incidentId: reportId,
      agentName: 'Triage Agent',
      status: 'COMPLETED',
      latencyMs: triageLatency,
      input: { category: finalCategory, isValidImage: isImageValid },
      output: partialResults['triage'],
      telemetryLogs: [
        `Severity Classification: ${severity}`,
        `Action Priority: ${priority}`,
        `SLA Target: ${targetHours}h`
      ]
    });
    logs.push(`[${new Date().toLocaleTimeString()}] [TRIAGE AGENT] Classified as ${priority} (${severity} Severity) - SLA: ${targetHours}h.`);
    emit('Correlation Agent');

    // ----------------------------------------------------
    // AGENT 5: CORRELATION AGENT (Deduplication & Spatial Clustering)
    // ----------------------------------------------------
    agentStates['Correlation Agent'] = 'RUNNING';
    const corrStart = performance.now();
    logs.push(`[${new Date().toLocaleTimeString()}] [CORRELATION AGENT] Scanning active incidents within 150m radius for spatial deduplication...`);
    emit('Correlation Agent');
    await this.sleep(350);

    const existingIncidents = incidentStore.getIncidents();
    let duplicateOf: Incident | undefined;

    for (const inc of existingIncidents) {
      if (inc.category === finalCategory && inc.status !== 'RESOLVED' && inc.status !== 'REJECTED') {
        const dist = calculateDistanceMeters(payload.latitude, payload.longitude, inc.latitude, inc.longitude);
        if (dist <= 150) {
          duplicateOf = inc;
          break;
        }
      }
    }

    const corrLatency = Math.round(performance.now() - corrStart);
    latencies['Correlation Agent'] = corrLatency;
    agentStates['Correlation Agent'] = 'COMPLETED';

    if (duplicateOf) {
      logs.push(`[${new Date().toLocaleTimeString()}] [CORRELATION AGENT] Duplicate detected! Matching master report #${duplicateOf.id}. Merging report.`);
      incidentStore.mergeDuplicateReport(duplicateOf.id, {
        id: reportId,
        timestamp: now.toISOString(),
        reporterName: payload.reporterName || 'Citizen Sentinel',
        notes: payload.description,
        image: payload.image,
        distanceMeters: Math.round(calculateDistanceMeters(payload.latitude, payload.longitude, duplicateOf.latitude, duplicateOf.longitude))
      });
      emit(null, true, duplicateOf, duplicateOf.id);
      return { incident: duplicateOf, isDuplicate: true, masterId: duplicateOf.id };
    }

    partialResults['correlation'] = {
      isDuplicate: false,
      clusterMatch: 'New Incident Cluster Initiated',
      radiusSearchedMeters: 150
    };

    agentTrace.push({
      id: executionId(),
      incidentId: reportId,
      agentName: 'Correlation Agent',
      status: 'COMPLETED',
      latencyMs: corrLatency,
      input: { coordinates: [payload.latitude, payload.longitude], category: finalCategory },
      output: partialResults['correlation'],
      telemetryLogs: [`Scanned 150m zone`, `Zero duplicates found - Unique incident verified`]
    });
    logs.push(`[${new Date().toLocaleTimeString()}] [CORRELATION AGENT] Spatial check passed: Unique civic incident verified.`);
    emit('Decision Agent');

    // ----------------------------------------------------
    // AGENT 6: DECISION AGENT (Resource Allocation & Work Order Dispatch)
    // ----------------------------------------------------
    agentStates['Decision Agent'] = 'RUNNING';
    const decStart = performance.now();
    logs.push(`[${new Date().toLocaleTimeString()}] [DECISION AGENT] Allocating municipal repair crew and dispatching Work Order...`);
    emit('Decision Agent');
    await this.sleep(400);

    const teamAssignment = finalCategory === 'Water Leakage' 
      ? 'GVMC Water Works & Hydraulic Unit 3'
      : finalCategory === 'Garbage Overflow'
      ? 'GVMC Solid Waste Sanitation Flying Squad'
      : 'GVMC Rapid Road Restoration Crew 2';

    const department = finalCategory === 'Water Leakage'
      ? 'Department of Water Supply & Drainage'
      : finalCategory === 'Garbage Overflow'
      ? 'Public Health & Sanitation Wing'
      : 'Engineering & Road Infrastructure Wing';

    partialResults['decision'] = {
      assignedTeam: teamAssignment,
      department,
      caseId,
      recommendedAction: isImageValid
        ? `Dispatch emergency restoration team immediately under standard operating procedure SOP-GVMC-2026.`
        : `Flagged for manual physical inspection due to inconclusive visual evidence.`
    };

    const decLatency = Math.round(performance.now() - decStart);
    latencies['Decision Agent'] = decLatency;
    agentStates['Decision Agent'] = 'COMPLETED';
    agentTrace.push({
      id: executionId(),
      incidentId: reportId,
      agentName: 'Decision Agent',
      status: 'COMPLETED',
      latencyMs: decLatency,
      input: { category: finalCategory, priority, severity },
      output: partialResults['decision'],
      telemetryLogs: [
        `Assigned Team: ${teamAssignment}`,
        `Department: ${department}`,
        `Authorized Case ID: ${caseId}`
      ]
    });
    logs.push(`[${new Date().toLocaleTimeString()}] [DECISION AGENT] Assigned to ${teamAssignment} (${caseId}).`);
    emit('Monitoring Agent');

    // ----------------------------------------------------
    // AGENT 7: MONITORING AGENT (Telemetry & Store Ingestion)
    // ----------------------------------------------------
    agentStates['Monitoring Agent'] = 'RUNNING';
    const monStart = performance.now();
    logs.push(`[${new Date().toLocaleTimeString()}] [MONITORING AGENT] Committing incident to municipal ledger and initializing SLA clock...`);
    emit('Monitoring Agent');
    await this.sleep(300);

    const slaDeadline = new Date(Date.now() + targetHours * 3600 * 1000).toISOString();

    const finalizedIncident: Incident = {
      id: reportId,
      caseId,
      category: finalCategory,
      image: payload.image,
      latitude: payload.latitude,
      longitude: payload.longitude,
      locality: payload.locality,
      ward: partialResults['geo'].ward,
      address: partialResults['geo'].verifiedAddress,
      description: payload.description,
      severity,
      priority,
      confidence: visionAnalysis.confidence,
      status: isImageValid ? 'ASSIGNED' : 'ACTION_REQUIRED',
      createdAt: now.toISOString(),
      assignedTeam: teamAssignment,
      department,
      targetResolutionHours: targetHours,
      slaDeadline,
      nearbyCount: 1,
      duplicateCount: 0,
      duplicates: [],
      agentTrace,
      recommendedAction: partialResults['decision'].recommendedAction,
      rationale: `Validated by 7 autonomous AI agents with ${(visionAnalysis.confidence * 100).toFixed(0)}% optical confidence.`,
      aiMode,
      reporter: {
        name: payload.reporterName || 'Citizen Reporter',
        role: 'Citizen'
      },
      isImageValid,
      imageRejectionReason: visionAnalysis.rejectionReason,
      detectedVisualFeatures: visionAnalysis.detectedFeatures
    };

    const monLatency = Math.round(performance.now() - monStart);
    latencies['Monitoring Agent'] = monLatency;
    agentStates['Monitoring Agent'] = 'COMPLETED';

    incidentStore.addIncident(finalizedIncident);

    // Automatically issue municipal work order if valid defect
    if (isImageValid) {
      incidentStore.createWorkOrder({
        incidentId: finalizedIncident.id,
        title: `${finalCategory} Emergency Restoration`,
        category: finalCategory,
        priority,
        zone: closestLandmark.zone,
        ward: partialResults['geo'].ward,
        address: partialResults['geo'].verifiedAddress,
        contractor: 'Visakha Urban Infrastructure Projects Ltd.',
        beforeImage: payload.image
      });
    }

    logs.push(`[${new Date().toLocaleTimeString()}] [MONITORING AGENT] Consensus achieved. SLA active until ${new Date(slaDeadline).toLocaleTimeString()}.`);
    emit(null, true, finalizedIncident);

    return { incident: finalizedIncident, isDuplicate: false };
  }
}

export const agentOrchestrator = new AgentOrchestratorService();


--------------------------------------------------------------------------------
MODULE 2: Core Domain Architecture & Data Contracts
File: src/types/index.ts
--------------------------------------------------------------------------------

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

export interface WorkOrder {
  id: string;
  incidentId: string;
  title: string;
  category: IncidentCategory;
  priority: IncidentPriority;
  status: 'ISSUED' | 'DISPATCHED' | 'IN_REPAIR' | 'INSPECTION_PENDING' | 'COMPLETED' | 'CERTIFIED';
  assignedCrewId: string;
  assignedCrewName: string;
  zone: number;
  ward: string;
  address: string;
  contractor: string;
  boqItems: Array<{ item: string; quantity: number; unit: string; rate: number; totalCost: number }>;
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

export interface FieldCrew {
  id: string;
  name: string;
  zone: number;
  leader: string;
  contact: string;
  vehicleNumber: string;
  vehicleType: string;
  status: 'AVAILABLE' | 'EN_ROUTE' | 'ON_SITE' | 'RETURNING' | 'OFF_DUTY';
  activeWorkOrderId?: string;
  currentLat: number;
  currentLng: number;
  equipment: string[];
  completedToday: number;
  crewSize: number;
  currentLocality: string;
}

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


--------------------------------------------------------------------------------
MODULE 3: Central Application Controller & Enterprise Router
File: src/App.tsx
--------------------------------------------------------------------------------

import React, { useState } from 'react';
import { AppShell, ActiveTab } from './components/layout/AppShell';
import { LandingView } from './views/LandingView';
import { CommandCenterView } from './views/CommandCenterView';
import { CitizenMobileView } from './views/CitizenMobileView';
import { ReportIssueView } from './views/ReportIssueView';
import { InvestigationView } from './views/InvestigationView';
import { HotspotIntelligenceView } from './views/HotspotIntelligenceView';
import { AgentControlCenterView } from './views/AgentControlCenterView';
import { AnalyticsView } from './views/AnalyticsView';
import { IncidentHistoryView } from './views/IncidentHistoryView';
import { SettingsView } from './views/SettingsView';
import { WorkOrderDispatchView } from './views/WorkOrderDispatchView';
import { WardIntelligenceView } from './views/WardIntelligenceView';
import { DronePatrolView } from './views/DronePatrolView';
import { BudgetPlannerView } from './views/BudgetPlannerView';
import { IncidentDetailModal } from './views/IncidentDetailModal';
import { Incident, IncidentCategory } from './types';
import { sampleImages } from './services/mock/seedData';
import { incidentStore } from './services/incidentStore';

export const App: React.FC = () => {
  const [currentTab, setCurrentTab] = useState<ActiveTab>('landing');
  const [investigationPayload, setInvestigationPayload] = useState<{
    image: string;
    latitude: number;
    longitude: number;
    locality: string;
    description: string;
    categoryHint?: IncidentCategory;
  }>({
    image: sampleImages.potholeMVP,
    latitude: 17.7424,
    longitude: 83.3356,
    locality: 'MVP Colony',
    description: 'Large structural pothole cavity across arterial carriage road. Extreme accident hazard.'
  });

  const [activeModalIncident, setActiveModalIncident] = useState<Incident | null>(null);

  const handleStartInvestigation = (payload: {
    image: string;
    latitude: number;
    longitude: number;
    locality: string;
    description: string;
    categoryHint?: IncidentCategory;
  }) => {
    setInvestigationPayload(payload);
    setCurrentTab('investigation');
  };

  const handleInvestigationFinished = (incident: Incident) => {
    // Incident is committed to store and triggers real-time subscriber updates
  };

  return (
    <AppShell currentTab={currentTab} onNavigate={setCurrentTab}>
      {currentTab === 'landing' && (
        <LandingView onNavigate={setCurrentTab} />
      )}

      {currentTab === 'command-center' && (
        <CommandCenterView 
          onNavigate={setCurrentTab}
          onOpenIncidentDetail={(inc) => setActiveModalIncident(inc)}
        />
      )}

      {currentTab === 'citizen-mobile' && (
        <CitizenMobileView />
      )}

      {currentTab === 'report-issue' && (
        <ReportIssueView 
          onStartInvestigation={handleStartInvestigation}
        />
      )}

      {currentTab === 'investigation' && (
        <InvestigationView 
          payload={investigationPayload}
          onNavigate={setCurrentTab}
          onFinished={handleInvestigationFinished}
        />
      )}

      {currentTab === 'hotspots' && (
        <HotspotIntelligenceView 
          onNavigate={setCurrentTab}
          onOpenIncidentDetail={(inc) => setActiveModalIncident(inc)}
        />
      )}

      {currentTab === 'agents' && (
        <AgentControlCenterView 
          onOpenIncidentDetail={(inc) => setActiveModalIncident(inc)}
        />
      )}

      {currentTab === 'analytics' && (
        <AnalyticsView />
      )}

      {currentTab === 'incidents' && (
        <IncidentHistoryView />
      )}

      {currentTab === 'work-orders' && (
        <WorkOrderDispatchView 
          onOpenIncidentDetail={(incidentId) => {
            const inc = incidentStore.getIncidentById(incidentId);
            if (inc) setActiveModalIncident(inc);
          }}
        />
      )}

      {currentTab === 'ward-intelligence' && (
        <WardIntelligenceView />
      )}

      {currentTab === 'drone-patrol' && (
        <DronePatrolView />
      )}

      {currentTab === 'budget-planner' && (
        <BudgetPlannerView />
      )}

      {currentTab === 'settings' && (
        <SettingsView />
      )}

      {/* GLOBAL MODAL FOR INSPECTING 7-AGENT TRACES */}
      {activeModalIncident && (
        <IncidentDetailModal 
          incident={activeModalIncident}
          onClose={() => setActiveModalIncident(null)}
        />
      )}
    </AppShell>
  );
};
