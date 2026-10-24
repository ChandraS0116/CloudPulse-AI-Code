import { AgentName, Incident, AIMode, AgentExecution } from '../types';
import { incidentStore } from './incidentStore';

export type WorkflowPhase = 'Ingestion' | 'Analysis' | 'Verification' | 'Synthesis' | 'Action';
export type ProviderType = 'REAL_PERSISTED' | 'DEMO_ALGORITHM' | 'SIMULATED' | 'PLANNED_PROVIDER';

export type WorkflowStepStatus = 'IDLE' | 'WAITING' | 'RUNNING' | 'COMPLETED' | 'FAILED';

export interface WorkflowStep {
  id: string;
  stepNumber: number;
  agentName: AgentName;
  role: string;
  phase: WorkflowPhase;
  title: string;
  purpose: string;
  status: WorkflowStepStatus;
  durationMs: number;
  confidence?: number;
  inputLabel: string;
  outputLabel: string;
  modelTech: string;
  providerType: ProviderType;
  processingLogic: string;
  inputs: Record<string, any>;
  outputs: Record<string, any>;
  telemetryLog: string;
  keyDecision: string;
  startedAt?: string;
  completedAt?: string;
}

export interface AgentWorkflowDef {
  id: string;
  name: string;
  shortName: string;
  badge: string;
  isRealIncident: boolean;
  category: 'Citizen Facing' | 'Preventative Patrol' | 'Disaster Management' | 'Deduplication' | 'Operational SLA';
  trigger: string;
  objective: string;
  targetSla: string;
  typicalLatency: string;
  aiMode: AIMode | 'SIMULATION';
  steps: WorkflowStep[];
  liveLogs: { time: string; agent: string; message: string }[];
}

// --------------------------------------------------------------------------
// 1. DYNAMIC REAL INCIDENT WORKFLOW BUILDER
// --------------------------------------------------------------------------
export function buildRealIncidentWorkflow(incident: Incident): AgentWorkflowDef {
  const traceMap = new Map<AgentName, AgentExecution>();
  if (incident && incident.agentTrace) {
    incident.agentTrace.forEach((trace) => {
      traceMap.set(trace.agentName, trace);
    });
  }

  const getTrace = (agent: AgentName) => traceMap.get(agent);

  const steps: WorkflowStep[] = [
    {
      id: 'step-orch',
      stepNumber: 1,
      agentName: 'Orchestrator',
      role: 'Master Pipeline Coordinator',
      phase: 'Ingestion',
      title: 'Workflow Context Initialization',
      purpose: 'Validates raw citizen telemetry, initiates DAG execution context, and delegates tasks.',
      status: getTrace('Orchestrator')?.status || 'COMPLETED',
      durationMs: getTrace('Orchestrator')?.latencyMs || 420,
      confidence: 1.0,
      inputLabel: 'CITIZEN REPORT',
      outputLabel: 'EXECUTION DAG',
      modelTech: 'CloudPulse Distributed Orchestrator (DAG Engine)',
      providerType: 'REAL_PERSISTED',
      processingLogic: 'Validates JSON payload schema, verifies image binary integrity, creates incident session ID, and provisions execution state on the asynchronous bus.',
      inputs: getTrace('Orchestrator')?.input || {
        locality: incident.locality,
        coordinates: [incident.latitude, incident.longitude],
        categoryHint: incident.category
      },
      outputs: getTrace('Orchestrator')?.output || {
        workflowState: 'INITIALIZED',
        delegatedAgents: ['Vision Agent', 'Geo Agent', 'Triage Agent', 'Correlation Agent', 'Decision Agent', 'Monitoring Agent']
      },
      telemetryLog: `Pipeline initialized for Report #${incident.id} at ${incident.locality}.`,
      keyDecision: `Dispatched concurrent analysis to Vision, Geo, Triage, and Correlation agents.`,
      startedAt: getTrace('Orchestrator')?.startedAt || '10:14:02.100',
      completedAt: getTrace('Orchestrator')?.completedAt || '10:14:02.520'
    },
    {
      id: 'step-vision',
      stepNumber: 2,
      agentName: 'Vision Agent',
      role: 'Computer Vision Defect Classifier',
      phase: 'Analysis',
      title: 'Visual Defect Classification & Sizing',
      purpose: 'Analyzes road photo to identify structural damage class, cavity dimensions, and depth rating.',
      status: getTrace('Vision Agent')?.status || 'COMPLETED',
      durationMs: getTrace('Vision Agent')?.latencyMs || 840,
      confidence: incident.confidence || 0.942,
      inputLabel: 'IMAGE EVIDENCE',
      outputLabel: 'DEFECT CLASS & DEPTH',
      modelTech: 'ViT Defect Classifier (Demo Feature Extractor)',
      providerType: 'DEMO_ALGORITHM',
      processingLogic: 'Evaluates photographic pixel gradient, runs bounding-box heuristic on road depression, computes confidence score against civic defect ontology.',
      inputs: getTrace('Vision Agent')?.input || {
        imageFormat: 'JPEG',
        resolution: '2048x1536',
        targetLocality: incident.locality
      },
      outputs: getTrace('Vision Agent')?.output || {
        category: incident.category,
        confidence: incident.confidence,
        estimatedDepth: incident.severity === 'CRITICAL' ? '12-15 cm (Extreme)' : '6-8 cm (Moderate)'
      },
      telemetryLog: `Defect identified as [${incident.category}] with ${(incident.confidence * 100).toFixed(1)}% confidence.`,
      keyDecision: `Classified as ${incident.category} with severity rating ${incident.severity}.`,
      startedAt: getTrace('Vision Agent')?.startedAt || '10:14:02.525',
      completedAt: getTrace('Vision Agent')?.completedAt || '10:14:03.365'
    },
    {
      id: 'step-geo',
      stepNumber: 3,
      agentName: 'Geo Agent',
      role: 'Geofence & Administrative Mapper',
      phase: 'Verification',
      title: 'Municipal Boundary & Ward Verification',
      purpose: 'Performs ray-casting against Visakhapatnam operational polygon and attributes administrative ward.',
      status: getTrace('Geo Agent')?.status || 'COMPLETED',
      durationMs: getTrace('Geo Agent')?.latencyMs || 310,
      confidence: 1.0,
      inputLabel: 'GPS COORDINATES',
      outputLabel: 'GVMC WARD & JURISDICTION',
      modelTech: 'Ray-Casting Operational Polygon Validator',
      providerType: 'REAL_PERSISTED',
      processingLogic: 'Runs point-in-polygon ray casting against the 12-vertex Visakhapatnam operational boundary; identifies nearest landmark and municipal ward zone.',
      inputs: getTrace('Geo Agent')?.input || {
        latitude: incident.latitude,
        longitude: incident.longitude
      },
      outputs: getTrace('Geo Agent')?.output || {
        inZone: true,
        locality: incident.locality,
        ward: incident.ward || 'GVMC Zone 3',
        address: incident.address
      },
      telemetryLog: `Point (${incident.latitude.toFixed(4)}, ${incident.longitude.toFixed(4)}) verified inside GVMC jurisdiction (${incident.ward || 'Zone 3'}).`,
      keyDecision: `Verified within municipal boundary. Bound to ${incident.ward || 'GVMC Administrative Ward'}.`,
      startedAt: getTrace('Geo Agent')?.startedAt || '10:14:03.370',
      completedAt: getTrace('Geo Agent')?.completedAt || '10:14:03.680'
    },
    {
      id: 'step-triage',
      stepNumber: 4,
      agentName: 'Triage Agent',
      role: 'Severity & SLA Triage Engine',
      phase: 'Analysis',
      title: 'Kinetic Risk & Priority Scoring',
      purpose: 'Determines traffic velocity risk, calculates priority tier (P1-P4), and binds SLA deadline.',
      status: getTrace('Triage Agent')?.status || 'COMPLETED',
      durationMs: getTrace('Triage Agent')?.latencyMs || 490,
      confidence: 0.96,
      inputLabel: 'DEFECT + TRAFFIC',
      outputLabel: 'PRIORITY & SLA HOURS',
      modelTech: 'Multi-Factor Severity Scoring Matrix',
      providerType: 'REAL_PERSISTED',
      processingLogic: 'Combines vision depth metrics with road transit classification (arterial vs local) to calculate kinetic accident potential and assign legal response SLA.',
      inputs: getTrace('Triage Agent')?.input || {
        defect: incident.category,
        severity: incident.severity,
        locality: incident.locality
      },
      outputs: getTrace('Triage Agent')?.output || {
        priority: incident.priority,
        targetResolutionHours: incident.targetResolutionHours || 8,
        slaDeadline: incident.slaDeadline
      },
      telemetryLog: `Calculated Priority [${incident.priority}]. Target SLA: ${incident.targetResolutionHours || 8} hours.`,
      keyDecision: `Assigned priority ${incident.priority} with ${incident.targetResolutionHours || 8}h SLA compliance deadline.`,
      startedAt: getTrace('Triage Agent')?.startedAt || '10:14:03.685',
      completedAt: getTrace('Triage Agent')?.completedAt || '10:14:04.175'
    },
    {
      id: 'step-correlation',
      stepNumber: 5,
      agentName: 'Correlation Agent',
      role: 'Spatial Deduplication & Clustering',
      phase: 'Verification',
      title: '50-Meter Radius Spatial Deduplication',
      purpose: 'Scans existing incidents for spatial proximity (<50m) and temporal overlap to prevent duplicate dispatch.',
      status: getTrace('Correlation Agent')?.status || 'COMPLETED',
      durationMs: getTrace('Correlation Agent')?.latencyMs || 380,
      confidence: 0.98,
      inputLabel: '50M SPATIAL BUFFER',
      outputLabel: 'CLUSTER ID / PARENT',
      modelTech: 'Haversine Spatial Proximity Cluster Engine',
      providerType: 'REAL_PERSISTED',
      processingLogic: 'Computes great-circle distance against all active unresolved incidents in Visakhapatnam; checks 48-hour time window and image similarity.',
      inputs: getTrace('Correlation Agent')?.input || {
        coordinates: [incident.latitude, incident.longitude],
        searchRadiusMeters: 50
      },
      outputs: getTrace('Correlation Agent')?.output || {
        isDuplicate: incident.duplicateCount > 0,
        duplicateCount: incident.duplicateCount,
        nearbyCount: incident.nearbyCount,
        hotspotName: incident.hotspotName || 'Isolated Incident'
      },
      telemetryLog: incident.duplicateCount > 0
        ? `Consolidated ${incident.duplicateCount} duplicate citizen reports within 50m radius.`
        : `Verified standalone incident: 0 duplicate collisions detected within 50m.`,
      keyDecision: incident.duplicateCount > 0
        ? `Merged ${incident.duplicateCount} duplicate submissions into master ticket #${incident.id}.`
        : `Created new primary incident record; no duplicate work orders issued.`,
      startedAt: getTrace('Correlation Agent')?.startedAt || '10:14:04.180',
      completedAt: getTrace('Correlation Agent')?.completedAt || '10:14:04.560'
    },
    {
      id: 'step-decision',
      stepNumber: 6,
      agentName: 'Decision Agent',
      role: 'Consensus & Action Synthesis',
      phase: 'Synthesis',
      title: 'Multi-Agent Consensus & Rationale',
      purpose: 'Fuses multi-agent outputs into an actionable legal rationale and allocates responsible department.',
      status: getTrace('Decision Agent')?.status || 'COMPLETED',
      durationMs: getTrace('Decision Agent')?.latencyMs || 540,
      confidence: 0.95,
      inputLabel: 'MULTI-AGENT TRACE',
      outputLabel: 'ACTIONABLE WORK ORDER',
      modelTech: 'Consensus Decision Fusion Engine',
      providerType: 'REAL_PERSISTED',
      processingLogic: 'Combines Vision classification, Geo jurisdiction, Triage urgency, and Correlation state to synthesize an indisputable municipal rationale and department routing.',
      inputs: getTrace('Decision Agent')?.input || {
        category: incident.category,
        severity: incident.severity,
        priority: incident.priority,
        ward: incident.ward
      },
      outputs: getTrace('Decision Agent')?.output || {
        assignedDepartment: incident.department || 'GVMC Road Maintenance Wing',
        assignedTeam: incident.assignedTeam || 'Rapid Response Unit',
        recommendedAction: incident.recommendedAction
      },
      telemetryLog: `Consensus reached: Route to [${incident.department || 'GVMC Road Maintenance'}] -> ${incident.assignedTeam || 'Rapid Response'}.`,
      keyDecision: `Action rationale: ${incident.rationale}`,
      startedAt: getTrace('Decision Agent')?.startedAt || '10:14:04.565',
      completedAt: getTrace('Decision Agent')?.completedAt || '10:14:05.105'
    },
    {
      id: 'step-monitoring',
      stepNumber: 7,
      agentName: 'Monitoring Agent',
      role: 'Dispatch & Realtime Broadcaster',
      phase: 'Action',
      title: 'Work Order Dispatch & Real-Time Broadcast',
      purpose: 'Dispatches digital work order, updates hotspot tracking, and broadcasts event to Command Center.',
      status: getTrace('Monitoring Agent')?.status || 'COMPLETED',
      durationMs: getTrace('Monitoring Agent')?.latencyMs || 290,
      confidence: 1.0,
      inputLabel: 'WORK ORDER SPEC',
      outputLabel: 'LIVE BROADCAST & MAP EVENT',
      modelTech: 'Real-Time Sync Protocol (Supabase / BroadcastChannel)',
      providerType: 'REAL_PERSISTED',
      processingLogic: 'Transmits incident creation event over WebSocket / Realtime channel to synchronize all open Command Center terminals across Visakhapatnam.',
      inputs: getTrace('Monitoring Agent')?.input || {
        caseId: incident.caseId,
        incidentId: incident.id,
        status: incident.status
      },
      outputs: getTrace('Monitoring Agent')?.output || {
        broadcastSuccess: true,
        terminalSubscribersNotified: 4,
        workOrderPushed: true
      },
      telemetryLog: `Work Order #${incident.caseId || 'MNT-8421'} dispatched. Broadcast event sent to Command Center.`,
      keyDecision: `Dispatched work order to field crew and illuminated incident marker on live map.`,
      startedAt: getTrace('Monitoring Agent')?.startedAt || '10:14:05.110',
      completedAt: getTrace('Monitoring Agent')?.completedAt || '10:14:05.400'
    }
  ];

  const liveLogs = [
    { time: '00:00.420', agent: 'ORCHESTRATOR', message: `Pipeline initialized for Report #${incident.id}` },
    { time: '00:01.260', agent: 'VISION', message: `Detected ${incident.category} (${(incident.confidence * 100).toFixed(0)}% confidence)` },
    { time: '00:01.570', agent: 'GEO', message: `Location verified inside GVMC jurisdiction (${incident.ward || 'Zone 3'})` },
    { time: '00:02.060', agent: 'TRIAGE', message: `Assigned Priority ${incident.priority} (${incident.targetResolutionHours || 8}h SLA)` },
    { time: '00:02.440', agent: 'CORRELATION', message: incident.duplicateCount > 0 ? `Merged ${incident.duplicateCount} duplicates within 50m` : `0 duplicate collisions found within 50m` },
    { time: '00:02.980', agent: 'DECISION', message: `Allocated to ${incident.assignedTeam || 'GVMC Maintenance'}` },
    { time: '00:03.270', agent: 'MONITORING', message: `Work Order #${incident.caseId || 'MNT-8421'} live broadcast emitted` }
  ];

  return {
    id: 'citizen-triage',
    name: 'Citizen Incident Triage & Resolution',
    shortName: 'Citizen Triage',
    badge: `REAL INCIDENT #${incident.id}`,
    isRealIncident: true,
    category: 'Citizen Facing',
    trigger: 'Citizen mobile camera report with GPS & description',
    objective: 'Autonomous end-to-end classification, geofencing, prioritization, deduplication, and work order creation.',
    targetSla: `${incident.targetResolutionHours || 8} Hours (Priority ${incident.priority})`,
    typicalLatency: `${((steps.reduce((a, b) => a + b.durationMs, 0)) / 1000).toFixed(2)}s Total Pipeline`,
    aiMode: incident.aiMode || 'DEMO_DETERMINISTIC',
    steps,
    liveLogs
  };
}

// --------------------------------------------------------------------------
// 2. SIMULATED WORKFLOW: PAVEMENT DEGRADATION & INFRASTRUCTURE SCAN
// --------------------------------------------------------------------------
export const pavementPatrolWorkflowDef: AgentWorkflowDef = {
  id: 'pavement-patrol',
  name: 'Pavement Degradation & Infrastructure Scan',
  shortName: 'Pavement Patrol',
  badge: 'SIMULATION MODE',
  isRealIncident: false,
  category: 'Preventative Patrol',
  trigger: 'High-frequency telemetry stream from municipal transit bus cameras & drone sweeps',
  objective: 'Proactively detect hairline cracks, raveling, and road degradation before pothole cavities form.',
  targetSla: '48 Hours (Preventative Maintenance Schedule)',
  typicalLatency: '3.45s Batch Analysis',
  aiMode: 'SIMULATION',
  steps: [
    {
      id: 'step-pp-1',
      stepNumber: 1,
      agentName: 'Orchestrator',
      role: 'Fleet Ingestion Controller',
      phase: 'Ingestion',
      title: 'Municipal Patrol Stream Ingest',
      purpose: 'Pulls high-frequency (10Hz) video frames and GNSS spatial tags from municipal transit fleet.',
      status: 'COMPLETED',
      durationMs: 380,
      confidence: 1.0,
      inputLabel: 'BUS PATROL STREAM',
      outputLabel: 'FRAME BATCH (50 FPS)',
      modelTech: 'Kafka Stream Ingestion Buffer (Simulated)',
      providerType: 'SIMULATED',
      processingLogic: 'Buffers 60-second burst road footage from RTC route 28A across Beach Road; filters blurry and obstructed frames.',
      inputs: { fleetId: 'AP-31-Z-4012', route: 'Beach Road Corridor', frameCount: 600 },
      outputs: { usableFrames: 540, roadSurfaceCapturedKm: 2.4 },
      telemetryLog: 'Ingested 2.4 km road scan frames along Beach Road Ch. 4+200 to 6+600.',
      keyDecision: 'Selected high-clarity keyframes for crack segmentation processing.'
    },
    {
      id: 'step-pp-2',
      stepNumber: 2,
      agentName: 'Vision Agent',
      role: 'Crack Segmentation Vision Unit',
      phase: 'Analysis',
      title: 'Pavement Crack & Rutting Segmentation',
      purpose: 'Runs semantic segmentation to detect early hairline alligator cracking and asphalt rutting.',
      status: 'COMPLETED',
      durationMs: 1120,
      confidence: 0.912,
      inputLabel: 'ROAD FRAMES',
      outputLabel: 'DEFECT MASK & CRACK LENGTH',
      modelTech: 'Semantic Pavement Segmentation Net (Planned Provider: Mask R-CNN)',
      providerType: 'PLANNED_PROVIDER',
      processingLogic: 'Segments longitudinal and transverse cracks; calculates cumulative crack length (14.2 meters) and surface raveling area.',
      inputs: { targetFrames: 120, minCrackWidthMm: 3 },
      outputs: { detectedDefect: 'Alligator Fatigue Cracking', linearExtentMeters: 14.2, severity: 'MODERATE_WEAR' },
      telemetryLog: 'Detected 14.2m progressive alligator cracking along outer carriage lane.',
      keyDecision: 'Classified defect as early structural fatigue prior to pavement cavity formation.'
    },
    {
      id: 'step-pp-3',
      stepNumber: 3,
      agentName: 'Geo Agent',
      role: 'Road Network Linear Referencer',
      phase: 'Verification',
      title: 'GIS Linear Road Snapping',
      purpose: 'Snaps GPS telemetry to Visakhapatnam Road Network GIS geometry segments.',
      status: 'COMPLETED',
      durationMs: 410,
      confidence: 0.99,
      inputLabel: 'GNSS TELEMETRY',
      outputLabel: 'GIS ROAD ASSET ID',
      modelTech: 'Linear Referencing System (Demo Algorithm)',
      providerType: 'DEMO_ALGORITHM',
      processingLogic: 'Correlates latitude/longitude against Vizag GIS Road Master database; assigns road segment asset tag #RD-BR-084.',
      inputs: { rawCoords: [17.7185, 83.3195], toleranceMeters: 8 },
      outputs: { roadAssetId: 'RD-BR-084', segmentName: 'Beach Road Sub-sector 4', roadClass: 'Arterial' },
      telemetryLog: 'Bound detection to Road Asset #RD-BR-084 (Beach Road Arterial Promenade).',
      keyDecision: 'Assigned segment priority based on high municipal tourism & commute traffic density.'
    },
    {
      id: 'step-pp-4',
      stepNumber: 4,
      agentName: 'Triage Agent',
      role: 'Pavement Index Calculator',
      phase: 'Analysis',
      title: 'Pavement Condition Index (PCI) Rating',
      purpose: 'Computes ASTM D6433 Pavement Condition Index (0-100) and predicts deterioration velocity.',
      status: 'COMPLETED',
      durationMs: 520,
      confidence: 0.94,
      inputLabel: 'CRACK DENSITY',
      outputLabel: 'PCI SCORE (62/100)',
      modelTech: 'ASTM D6433 Standard Evaluation Matrix (Simulated)',
      providerType: 'SIMULATED',
      processingLogic: 'Deducts index points based on distress type, density, and traffic weight. PCI computed at 62 (Fair Condition).',
      inputs: { crackDensityPercent: 8.4, trafficEquivalentAxleLoad: 1200 },
      outputs: { pciScore: 62, conditionRating: 'FAIR', predictedPotholeOnsetWeeks: 3.5 },
      telemetryLog: 'Calculated PCI Score: 62/100 (Fair). Predicted cavity onset: 3.5 weeks without seal.',
      keyDecision: 'Flagged for proactive seal application to save 65% versus full structural resurfacing.'
    },
    {
      id: 'step-pp-5',
      stepNumber: 5,
      agentName: 'Correlation Agent',
      role: 'Historical Degradation Modeler',
      phase: 'Verification',
      title: 'Multi-Pass Cluster Trend Analysis',
      purpose: 'Compares historical patrol scans from past 90 days to determine wear trajectory.',
      status: 'COMPLETED',
      durationMs: 440,
      confidence: 0.97,
      inputLabel: '90-DAY PATROL LOGS',
      outputLabel: 'CLUSTER TREND: ESCALATING',
      modelTech: 'Temporal Degradation Regressor (Simulated)',
      providerType: 'SIMULATED',
      processingLogic: 'Queries previous scan passes for segment #RD-BR-084; observes crack growth rate of +18% month-over-month.',
      inputs: { historicalPassesCount: 6, timespanDays: 90 },
      outputs: { wearTrajectory: 'ACCELERATING', hotspotClusterLinked: 'HS-BR-01' },
      telemetryLog: 'Historical comparison confirms wear acceleration (+18% MoM). Linked to Hotspot #HS-BR-01.',
      keyDecision: 'Upgraded preventative cluster status to active surveillance.'
    },
    {
      id: 'step-pp-6',
      stepNumber: 6,
      agentName: 'Decision Agent',
      role: 'Preventative Strategy Formulator',
      phase: 'Synthesis',
      title: 'Slurry Seal Maintenance Recommendation',
      purpose: 'Selects optimal municipal remediation method balancing cost, road life, and traffic disruption.',
      status: 'COMPLETED',
      durationMs: 590,
      confidence: 0.93,
      inputLabel: 'PCI + COST MODEL',
      outputLabel: 'MICRO-SURFACING ORDER',
      modelTech: 'Municipal Asset Lifecycle Optimizer (Simulated)',
      providerType: 'SIMULATED',
      processingLogic: 'Calculates cost: Slurry Micro-surfacing (₹180/sq.m) vs emergency pothole repair (₹650/sq.m). Recommends off-peak night crew seal.',
      inputs: { recommendedFix: 'Bituminous Slurry Micro-Surfacing', estimatedAreaSqM: 180 },
      outputs: { assignedWing: 'GVMC Preventative Infrastructure Division', estimatedCostSaving: '₹84,600' },
      telemetryLog: 'Decision: Schedule proactive slurry seal during 02:00-05:00 night window.',
      keyDecision: 'Approved micro-surfacing maintenance order; prevented catastrophic pothole formation.'
    },
    {
      id: 'step-pp-7',
      stepNumber: 7,
      agentName: 'Monitoring Agent',
      role: 'Maintenance Scheduler & Telemetry Sync',
      phase: 'Action',
      title: 'Preventative Work Order Scheduling',
      purpose: 'Publishes scheduled work order to municipal field app and updates city road health index.',
      status: 'COMPLETED',
      durationMs: 310,
      confidence: 1.0,
      inputLabel: 'APPROVED ACTION',
      outputLabel: 'SCHEDULED WORK ORDER',
      modelTech: 'Field Crew Scheduling Sync (Simulated)',
      providerType: 'SIMULATED',
      processingLogic: 'Queues preventative maintenance ticket #PREV-2026-088; updates public road health status for Beach Road sector.',
      inputs: { ticketId: 'PREV-2026-088', targetWindow: '2026-09-22 02:00-05:00 IST' },
      outputs: { scheduledStatus: 'QUEUED', roadHealthIndexUpdated: true },
      telemetryLog: 'Work order #PREV-2026-088 queued for nighttime maintenance. Road health index updated.',
      keyDecision: 'Dispatched notification to maintenance contractor and logistics coordinator.'
    }
  ],
  liveLogs: [
    { time: '00:00.380', agent: 'ORCHESTRATOR', message: 'Patrol stream ingested for Beach Road Corridor (AP-31-Z-4012)' },
    { time: '00:01.500', agent: 'VISION', message: 'Detected 14.2m fatigue alligator cracking across lane 2' },
    { time: '00:01.910', agent: 'GEO', message: 'Snapped coordinates to Road Asset #RD-BR-084' },
    { time: '00:02.430', agent: 'TRIAGE', message: 'Calculated PCI Score: 62/100 (Fair Condition)' },
    { time: '00:02.870', agent: 'CORRELATION', message: 'Linked to Hotspot #HS-BR-01 (+18% MoM degradation)' },
    { time: '00:03.460', agent: 'DECISION', message: 'Formulated preventative bituminous slurry seal specification' },
    { time: '00:03.770', agent: 'MONITORING', message: 'Queued scheduled work order #PREV-2026-088 for night window' }
  ]
};

// --------------------------------------------------------------------------
// 3. SIMULATED WORKFLOW: EMERGENCY HAZARD & DISASTER ESCALATION
// --------------------------------------------------------------------------
export const emergencyHazardWorkflowDef: AgentWorkflowDef = {
  id: 'emergency-hazard',
  name: 'Emergency Hazard & Disaster Escalation',
  shortName: 'Emergency Escalation',
  badge: 'SIMULATION MODE',
  isRealIncident: false,
  category: 'Disaster Management',
  trigger: 'Urgent citizen panic report or flood/structural sensor alarm for open sinkhole / downed electrical wire',
  objective: 'Bypass routine queues, trigger 150m dynamic hazard exclusion cordon, and auto-dispatch emergency responders.',
  targetSla: '45 Minutes (P1 Emergency Protocol)',
  typicalLatency: '2.15s High-Priority Override',
  aiMode: 'SIMULATION',
  steps: [
    {
      id: 'step-eh-1',
      stepNumber: 1,
      agentName: 'Orchestrator',
      role: 'Emergency Interrupt Controller',
      phase: 'Ingestion',
      title: 'High-Priority Alert Ingestion',
      purpose: 'Detects emergency hazard trigger, bypasses standard ingestion queue, and locks real-time thread.',
      status: 'COMPLETED',
      durationMs: 190,
      confidence: 1.0,
      inputLabel: 'EMERGENCY INGEST',
      outputLabel: 'FAST-TRACK DAG',
      modelTech: 'Priority-Queue Preemption Engine (Simulated)',
      providerType: 'SIMULATED',
      processingLogic: 'Keyword matches: "massive sinkhole collapse" & "exposed water main". Preempts background jobs for immediate pipeline focus.',
      inputs: { alertLevel: 'URGENT', locality: 'Siripuram Junction', keywords: ['sinkhole', 'collapse', 'water main'] },
      outputs: { priorityPreemption: true, allocatedLatencyBudgetMs: 2500 },
      telemetryLog: 'Emergency trigger recognized: Siripuram Junction sinkhole hazard. Priority preemption engaged.',
      keyDecision: 'Bypassed standard triage queue; assigned P1 emergency processing slot.'
    },
    {
      id: 'step-eh-2',
      stepNumber: 2,
      agentName: 'Vision Agent',
      role: 'Acute Hazard Vision Analyzer',
      phase: 'Analysis',
      title: 'Catastrophic Cavity & Hazard Detection',
      purpose: 'Identifies active ground collapse, water pipe rupture, and vehicle ingestion hazard.',
      status: 'COMPLETED',
      durationMs: 640,
      confidence: 0.985,
      inputLabel: 'HAZARD PHOTOGRAPHY',
      outputLabel: 'CRITICAL CAVITY (1.8m DEPTH)',
      modelTech: 'Hazard Detection CNN (Demo Algorithm)',
      providerType: 'DEMO_ALGORITHM',
      processingLogic: 'Measures depression depth (>1.8m) with severe underground water flow; detects structural void under asphalt.',
      inputs: { visualFeature: 'Dark Void with Water Infiltration', roadWidthAffected: '80%' },
      outputs: { dangerClass: 'STRUCTURAL_SINKHOLE', voidDepthMeters: 1.8, lifeHazardScore: 98 },
      telemetryLog: 'Critical hazard confirmed: 1.8m deep active sinkhole with pipe rupture.',
      keyDecision: 'Flagged immediate life-safety hazard requiring immediate traffic closure.'
    },
    {
      id: 'step-eh-3',
      stepNumber: 3,
      agentName: 'Geo Agent',
      role: 'Exclusion Cordon & Critical Asset Mapper',
      phase: 'Verification',
      title: '150-Meter Dynamic Cordon & Facility Audit',
      purpose: 'Calculates dynamic perimeter cordon and queries nearby hospitals, schools, and bus stops.',
      status: 'COMPLETED',
      durationMs: 280,
      confidence: 1.0,
      inputLabel: 'GROUND ZERO COORDS',
      outputLabel: '150M CORDON & ASSET LIST',
      modelTech: 'Spatial Buffer & Critical Asset Index (Simulated)',
      providerType: 'SIMULATED',
      processingLogic: 'Generates 150m buffer polygon around Siripuram Junction; identifies 2 schools, 1 petrol station, and 1 feeder line inside radius.',
      inputs: { coords: [17.7212, 83.3156], bufferRadiusMeters: 150 },
      outputs: { cordonPolygonActive: true, affectedSchools: 2, fuelBunkRisk: true, busDiversionRequired: true },
      telemetryLog: 'Generated 150m safety cordon. Identified 2 nearby schools and 1 fuel station in impact radius.',
      keyDecision: 'Mandated vehicular cordon and immediate bus transit rerouting.'
    },
    {
      id: 'step-eh-4',
      stepNumber: 4,
      agentName: 'Triage Agent',
      role: 'Disaster SLA & Risk Accelerator',
      phase: 'Analysis',
      title: 'Instant P1 Override & 45-Min SLA Lock',
      purpose: 'Enforces highest urgency priority and activates sirens/SMS to GVMC Disaster Cell.',
      status: 'COMPLETED',
      durationMs: 240,
      confidence: 1.0,
      inputLabel: 'HAZARD + CORDON',
      outputLabel: 'P1 OVERRIDE (45-MIN SLA)',
      modelTech: 'Disaster Protocol Escalation Matrix (Simulated)',
      providerType: 'SIMULATED',
      processingLogic: 'Overrides any default SLA; binds 45-minute on-site response requirement under GVMC Disaster Management Act.',
      inputs: { severity: 'CATASTROPHIC', cordonRadius: 150 },
      outputs: { priority: 'P1', targetSlaMinutes: 45, emergencyLevel: 'RED_ALERT' },
      telemetryLog: 'Priority P1 Emergency locked. 45-minute on-site response deadline triggered.',
      keyDecision: 'Locked P1 emergency SLA with automatic escalation to City Disaster Commissioner.'
    },
    {
      id: 'step-eh-5',
      stepNumber: 5,
      agentName: 'Correlation Agent',
      role: 'Multi-Call Incident Synthesizer',
      phase: 'Verification',
      title: 'Panic Stream Clustering & Master Link',
      purpose: 'Clusters 18 incoming citizen distress calls and sensor telemetry into a single Master Incident Command.',
      status: 'COMPLETED',
      durationMs: 320,
      confidence: 0.99,
      inputLabel: '18 INCOMING REPORTS',
      outputLabel: 'UNIFIED COMMAND INCIDENT',
      modelTech: 'Real-Time Spatiotemporal Stream Aggregator (Simulated)',
      providerType: 'SIMULATED',
      processingLogic: 'Groups calls received within 8 minutes across Siripuram into unified incident record #EMERG-2026-004 to eliminate command duplication.',
      inputs: { incomingAlerts: 18, timeWindowMinutes: 8 },
      outputs: { masterIncidentId: 'EMERG-2026-004', callersNotified: 18, duplicateFloodSuppressed: true },
      telemetryLog: 'Aggregated 18 citizen emergency reports into Master Incident #EMERG-2026-004.',
      keyDecision: 'Unified dispatch under single operational incident commander.'
    },
    {
      id: 'step-eh-6',
      stepNumber: 6,
      agentName: 'Decision Agent',
      role: 'Multi-Agency Mobilization Engine',
      phase: 'Synthesis',
      title: 'Joint Action Directive (GVMC + Police + Water)',
      purpose: 'Synthesizes coordinated response mobilizing Civil Works, Vizag City Traffic Police, and Water Supply Board.',
      status: 'COMPLETED',
      durationMs: 460,
      confidence: 0.96,
      inputLabel: 'CORDON + MULTI-AGENCY',
      outputLabel: 'JOINT ACTION DIRECTIVE',
      modelTech: 'Multi-Agency Municipal Dispatch Protocol (Simulated)',
      providerType: 'SIMULATED',
      processingLogic: 'Directs: 1. Traffic Police -> Close Siripuram approach; 2. Water Board -> Shut valve line #W-8; 3. Disaster Unit -> Deploy trench shoring.',
      inputs: { agencies: ['Traffic Police', 'Water Works', 'Civil Disaster Unit'] },
      outputs: { valveIsolationPushed: true, trafficDiversionPlanIssued: true, barricadeCrewDispatched: true },
      telemetryLog: 'Joint directive issued: Traffic diversion deployed + Water Valve #W-8 isolation triggered.',
      keyDecision: 'Authorized immediate multi-agency emergency intervention.'
    },
    {
      id: 'step-eh-7',
      stepNumber: 7,
      agentName: 'Monitoring Agent',
      role: 'Emergency Broadcast & Responder Tracker',
      phase: 'Action',
      title: 'Civic Push Alert & Live First Responder Tracking',
      purpose: 'Pushes geo-targeted safety push notification to citizen mobile phones and monitors GPS of responding units.',
      status: 'COMPLETED',
      durationMs: 270,
      confidence: 1.0,
      inputLabel: 'CORDON GEO-ZONE',
      outputLabel: 'LIVE BROADCAST & UNIT GPS',
      modelTech: 'Geo-Targeted Citizen Push & Telemetry Tracker (Simulated)',
      providerType: 'SIMULATED',
      processingLogic: 'Transmits push alert to users within 500m of Siripuram; tracks GPS of Rapid Response Vehicle RRV-02 (ETA: 8 minutes).',
      inputs: { targetCivicRadiusMeters: 500, responderUnit: 'RRV-02' },
      outputs: { citizensAlerted: 1420, responderEtaMinutes: 8, mapHazardPulsing: true },
      telemetryLog: 'Civic safety alert delivered to 1,420 nearby citizens. Rapid unit RRV-02 en route (ETA 8 mins).',
      keyDecision: 'Live hazard polygon rendered on Command Center screen with critical pulsing aura.'
    }
  ],
  liveLogs: [
    { time: '00:00.190', agent: 'ORCHESTRATOR', message: 'CRITICAL EMERGENCY PREEMPTION: Siripuram Junction collapse' },
    { time: '00:00.830', agent: 'VISION', message: 'Vision confirmed 1.8m structural sinkhole void with pipe burst' },
    { time: '00:01.110', agent: 'GEO', message: 'Established 150m cordon; identified 2 schools and bus route' },
    { time: '00:01.350', agent: 'TRIAGE', message: 'Locked P1 RED ALERT with 45-minute mandatory SLA deadline' },
    { time: '00:01.670', agent: 'CORRELATION', message: 'Unified 18 distress submissions into Master #EMERG-2026-004' },
    { time: '00:02.130', agent: 'DECISION', message: 'Multi-agency deployment: Traffic diversion + Valve isolation' },
    { time: '00:02.400', agent: 'MONITORING', message: 'Geo-fence push alert sent to 1,420 citizens; Unit RRV-02 ETA 8m' }
  ]
};

// --------------------------------------------------------------------------
// 4. SIMULATED WORKFLOW: SPATIAL CORRELATION & DEDUPLICATION
// --------------------------------------------------------------------------
export const duplicateMergingWorkflowDef: AgentWorkflowDef = {
  id: 'duplicate-merging',
  name: 'Spatial Correlation & Deduplication',
  shortName: 'Deduplication',
  badge: 'SIMULATION MODE',
  isRealIncident: false,
  category: 'Deduplication',
  trigger: 'Burst of incoming citizen reports around high-traffic junctions and public events',
  objective: 'Prevent duplicate road crew dispatch, merge redundant submissions into master ticket, and calculate report gravity.',
  targetSla: 'Near Real-Time (<1.8s Deduplication)',
  typicalLatency: '1.65s Spatial Graph Resolution',
  aiMode: 'SIMULATION',
  steps: [
    {
      id: 'step-dm-1',
      stepNumber: 1,
      agentName: 'Orchestrator',
      role: 'Report Stream Vectorizer',
      phase: 'Ingestion',
      title: 'Incoming Report Stream Vectorization',
      purpose: 'Receives raw report, extracts spatial coordinates and timestamp, and prepares spatial comparison query.',
      status: 'COMPLETED',
      durationMs: 210,
      confidence: 1.0,
      inputLabel: 'NEW REPORT STREAM',
      outputLabel: 'SPATIAL QUERY VECTOR',
      modelTech: 'Stream Pre-Processor (Simulated)',
      providerType: 'SIMULATED',
      processingLogic: 'Extracts coordinates (17.7424, 83.3356) and temporal index; queues spatial cluster verification.',
      inputs: { reportId: 'CP-9942', coordinates: [17.7424, 83.3356], timestamp: '2026-09-20T10:14:00Z' },
      outputs: { readyForIndexSearch: true },
      telemetryLog: 'Prepared spatial query vector for Report #CP-9942 (MVP Colony Sector 4).',
      keyDecision: 'Initiated spatial index scan against active unresolved incidents.'
    },
    {
      id: 'step-dm-2',
      stepNumber: 2,
      agentName: 'Vision Agent',
      role: 'Visual Feature Embedder',
      phase: 'Analysis',
      title: '512-Dimension Image Embedding Comparison',
      purpose: 'Generates feature vector to compare damage geometry, surrounding curb, and road markings.',
      status: 'COMPLETED',
      durationMs: 580,
      confidence: 0.948,
      inputLabel: 'REPORT IMAGE',
      outputLabel: '512-D EMBEDDING VECTOR',
      modelTech: 'Feature Vector Embedding (Planned Provider: MobileNet / ResNet)',
      providerType: 'PLANNED_PROVIDER',
      processingLogic: 'Extracts 512-dimensional feature embedding; compares cosine similarity against candidate parent images.',
      inputs: { targetImageResolution: '1024x768' },
      outputs: { vectorDimensions: 512, topCandidateMatchSimilarity: 0.924 },
      telemetryLog: 'Image embedding similarity evaluated at 92.4% match with Master Ticket #CP-1042.',
      keyDecision: 'Strong visual correspondence confirmed with existing active MVP Colony pothole.'
    },
    {
      id: 'step-dm-3',
      stepNumber: 3,
      agentName: 'Geo Agent',
      role: 'Spatial Distance & Radius Filter',
      phase: 'Verification',
      title: '50-Meter Haversine Proximity Check',
      purpose: 'Computes geodesic distance between candidate report and open incident registry.',
      status: 'COMPLETED',
      durationMs: 240,
      confidence: 1.0,
      inputLabel: 'COORDINATE PAIR',
      outputLabel: 'DELTA DISTANCE: 14 METERS',
      modelTech: 'Haversine Great-Circle Distance (Demo Algorithm)',
      providerType: 'DEMO_ALGORITHM',
      processingLogic: 'Calculates distance: 14 meters from Master Ticket #CP-1042. Well within 50m municipal correlation threshold.',
      inputs: { candidateCoords: [17.7424, 83.3356], parentCoords: [17.7423, 83.3357] },
      outputs: { distanceMeters: 14.2, withinThreshold: true, thresholdLimitMeters: 50 },
      telemetryLog: 'Geodesic distance calculated: 14.2 meters. Within 50m spatial correlation boundary.',
      keyDecision: 'Confirmed spatial co-location with active incident #CP-1042.'
    },
    {
      id: 'step-dm-4',
      stepNumber: 4,
      agentName: 'Triage Agent',
      role: 'Report Velocity & Gravity Evaluator',
      phase: 'Analysis',
      title: 'Civic Velocity Multiplier Assessment',
      purpose: 'Measures reporting speed: multiple reports within 30 minutes elevate public impact severity score.',
      status: 'COMPLETED',
      durationMs: 290,
      confidence: 0.96,
      inputLabel: 'BURST FREQUENCY',
      outputLabel: 'IMPACT MULTIPLIER: 1.45X',
      modelTech: 'Reporting Velocity Scoring Engine (Simulated)',
      providerType: 'SIMULATED',
      processingLogic: 'Detects 4 citizen reports in under 25 minutes; triggers public urgency multiplier (+45% severity boost).',
      inputs: { burstCount: 4, windowMinutes: 25 },
      outputs: { urgencyBoostFactor: 1.45, revisedSeverity: 'HIGH_PUBLIC_IMPACT' },
      telemetryLog: 'Report burst detected: 4 submissions in 25 mins. Urgency elevated by 1.45x multiplier.',
      keyDecision: 'Elevated dispatch priority of parent ticket due to rapid civic report volume.'
    },
    {
      id: 'step-dm-5',
      stepNumber: 5,
      agentName: 'Correlation Agent',
      role: 'Graph Clustering & Master Merging Engine',
      phase: 'Verification',
      title: 'Graph Link & Master-Child Assignment',
      purpose: 'Attaches secondary report as a child witness evidence record to the primary Master Ticket.',
      status: 'COMPLETED',
      durationMs: 320,
      confidence: 0.99,
      inputLabel: 'CANDIDATE + PARENT',
      outputLabel: 'LINKED CHILD (DUP #3)',
      modelTech: 'Graph Relationship Deduplicator (Simulated)',
      providerType: 'SIMULATED',
      processingLogic: 'Appends photo, citizen notes, and timestamp to parent ticket #CP-1042 duplicate array; updates duplicate counter to 3.',
      inputs: { parentId: 'CP-1042', childId: 'CP-9942', citizenName: 'Sunil Rao' },
      outputs: { parentTicketUpdated: true, newDuplicateCount: 3, duplicateSuppressedFromQueue: true },
      telemetryLog: 'Linked #CP-9942 as duplicate #3 on Master #CP-1042. Redundant work order suppressed.',
      keyDecision: 'Prevented duplicate municipal work order; consolidated evidence into single master ticket.'
    },
    {
      id: 'step-dm-6',
      stepNumber: 6,
      agentName: 'Decision Agent',
      role: 'Combined Evidence Synthesizer',
      phase: 'Synthesis',
      title: 'Consolidated Incident Summary Update',
      purpose: 'Updates master repair rationale with combined citizen notes and corroborating angles.',
      status: 'COMPLETED',
      durationMs: 380,
      confidence: 0.95,
      inputLabel: 'MULTI-CITIZEN NOTES',
      outputLabel: 'CONSOLIDATED EVIDENCE',
      modelTech: 'Evidence Synthesis Generator (Simulated)',
      providerType: 'SIMULATED',
      processingLogic: 'Synthesizes notes: multiple two-wheeler rim damage reports confirm sharp cavity edges requiring hot-mix patch.',
      inputs: { totalWitnessReports: 4, primaryConcern: 'Two-wheeler rim bent' },
      outputs: { updatedWorkOrderSpec: 'Heavy-duty asphalt compaction required', contractorAlerted: true },
      telemetryLog: 'Master repair specification updated with multi-angle citizen evidence.',
      keyDecision: 'Updated contractor instruction to include edge-grinding based on combined notes.'
    },
    {
      id: 'step-dm-7',
      stepNumber: 7,
      agentName: 'Monitoring Agent',
      role: 'Unified Citizen Subscriber',
      phase: 'Action',
      title: 'Multi-Citizen Status Sync Subscription',
      purpose: 'Subscribes reporting citizen to Master Ticket updates with transparency SMS/push.',
      status: 'COMPLETED',
      durationMs: 230,
      confidence: 1.0,
      inputLabel: 'CITIZEN CONTACTS',
      outputLabel: 'UNIFIED SUBSCRIBER CHANNEL',
      modelTech: 'Citizen Notification Bridge (Simulated)',
      providerType: 'SIMULATED',
      processingLogic: 'Sends automated push: "Thank you! Your report matches active Master Ticket #CP-1042. You will receive live repair progress updates."',
      inputs: { citizenId: 'usr-9942', masterId: 'CP-1042' },
      outputs: { pushDelivered: true, subscriberLinked: true },
      telemetryLog: 'Citizen subscribed to Master #CP-1042 notifications. Auto-acknowledgment sent.',
      keyDecision: 'Ensured reporting citizen receives unified real-time progress without ticket confusion.'
    }
  ],
  liveLogs: [
    { time: '00:00.210', agent: 'ORCHESTRATOR', message: 'Vectorized incoming report #CP-9942 for spatial deduplication' },
    { time: '00:00.790', agent: 'VISION', message: 'Image feature embedding indicates 92.4% visual match with #CP-1042' },
    { time: '00:01.030', agent: 'GEO', message: 'Geodesic distance verified: 14.2m (<50m correlation radius)' },
    { time: '00:01.320', agent: 'TRIAGE', message: 'Report burst detected: 4 reports in 25 mins (+45% urgency boost)' },
    { time: '00:01.640', agent: 'CORRELATION', message: 'Consolidated into Master #CP-1042 (Duplicate count: 3)' },
    { time: '00:02.020', agent: 'DECISION', message: 'Updated repair spec with multi-witness evidence notes' },
    { time: '00:02.250', agent: 'MONITORING', message: 'Citizen subscribed to Master Ticket; duplicate work order prevented' }
  ]
};

// --------------------------------------------------------------------------
// 5. SIMULATED WORKFLOW: WORK ORDER EXECUTION & CITIZEN SLA VERIFICATION
// --------------------------------------------------------------------------
export const workOrderSlaWorkflowDef: AgentWorkflowDef = {
  id: 'work-order-sla',
  name: 'Work Order Execution & Citizen SLA Verification',
  shortName: 'Work Order SLA',
  badge: 'SIMULATION MODE',
  isRealIncident: false,
  category: 'Operational SLA',
  trigger: 'Maintenance crew on-site upload of completed asphalt patch photo & material consumption sheet',
  objective: 'Authenticate physical road repair with before/after AI vision, verify spatial coordinates, and certify SLA.',
  targetSla: '100% Verified Before Ticket Closure',
  typicalLatency: '2.80s Verification Cycle',
  aiMode: 'SIMULATION',
  steps: [
    {
      id: 'step-wo-1',
      stepNumber: 1,
      agentName: 'Orchestrator',
      role: 'Repair Completion Ingest Agent',
      phase: 'Ingestion',
      title: 'Contractor Repair Evidence Ingest',
      purpose: 'Receives contractor photo upload, crew GPS log, and repair completion timestamp.',
      status: 'COMPLETED',
      durationMs: 280,
      confidence: 1.0,
      inputLabel: 'CREW REPAIR LOG',
      outputLabel: 'VERIFICATION CONTEXT',
      modelTech: 'Work Order Ingestion Gateway (Simulated)',
      providerType: 'SIMULATED',
      processingLogic: 'Ingests contractor submission for Work Order #MNT-8421; parses EXIF metadata and material consumption manifest.',
      inputs: { workOrderId: 'MNT-8421', contractorId: 'GVMC-UNIT-3', patchType: 'Hot-Mix Asphalt' },
      outputs: { beforePhotoRetrieved: true, postPhotoReady: true },
      telemetryLog: 'Ingested completion packet for Work Order #MNT-8421 from GVMC Unit 3.',
      keyDecision: 'Initiated independent multi-agent verification before approving ticket closure.'
    },
    {
      id: 'step-wo-2',
      stepNumber: 2,
      agentName: 'Vision Agent',
      role: 'Before/After Repair AI Auditor',
      phase: 'Analysis',
      title: 'Before & After Photographic Defect Closure Verification',
      purpose: 'Compares pre-repair defect photo with post-repair surface to confirm depression elimination.',
      status: 'COMPLETED',
      durationMs: 980,
      confidence: 0.962,
      inputLabel: 'BEFORE/AFTER PHOTOS',
      outputLabel: 'REPAIR AUTHENTICATED (96%)',
      modelTech: 'Comparative Surface Verification Model (Planned Provider: Vision Transformer)',
      providerType: 'PLANNED_PROVIDER',
      processingLogic: 'Performs structural difference mapping; confirms pothole depression is completely filled, leveled, and sealed flush with pavement.',
      inputs: { preDefectCavityDepthCm: 14, postSurfaceLevelVarianceMm: 2.1 },
      outputs: { depressionEliminated: true, compactionQuality: 'EXCELLENT', surfaceProfileMatch: 0.962 },
      telemetryLog: 'Vision audit passed: Surface cavity 100% filled and leveled flush (96.2% score).',
      keyDecision: 'Certified physical defect elimination based on comparative photographic analysis.'
    },
    {
      id: 'step-wo-3',
      stepNumber: 3,
      agentName: 'Geo Agent',
      role: 'On-Site Geotag & Time-Lock Validator',
      phase: 'Verification',
      title: 'GPS Metadata & Geofence Authentication',
      purpose: 'Validates contractor photo GPS coordinates and EXIF time lock against original incident ground truth.',
      status: 'COMPLETED',
      durationMs: 310,
      confidence: 1.0,
      inputLabel: 'EXIF METADATA',
      outputLabel: 'LOCATION DELTA: 2.8 METERS',
      modelTech: 'Anti-Spoofing EXIF Geotag Verifier (Demo Algorithm)',
      providerType: 'DEMO_ALGORITHM',
      processingLogic: 'Checks EXIF GNSS metadata: photo captured at (17.7424, 83.3355), delta 2.8m from original defect coordinates. Timestamp verified live.',
      inputs: { defectCoords: [17.7424, 83.3356], photoCoords: [17.7424, 83.3355] },
      outputs: { deltaMeters: 2.8, withinAntiFraudTolerance: true, spoofingDetected: false },
      telemetryLog: 'Geotag verified: Photo taken on-site (2.8m variance). Anti-spoofing checks passed.',
      keyDecision: 'Validated that contractor uploaded genuine on-site photographic evidence.'
    },
    {
      id: 'step-wo-4',
      stepNumber: 4,
      agentName: 'Triage Agent',
      role: 'IRC Technical Durability Assessor',
      phase: 'Analysis',
      title: 'IRC Municipal Standards & SLA Compliance',
      purpose: 'Audits asphalt thickness, roller compaction passes, and checks resolution against legal SLA deadline.',
      status: 'COMPLETED',
      durationMs: 420,
      confidence: 0.97,
      inputLabel: 'CREW LOGS + TIME',
      outputLabel: 'SLA MET (5.2h / 6h LIMIT)',
      modelTech: 'Indian Road Congress (IRC) Compliance Rules (Simulated)',
      providerType: 'SIMULATED',
      processingLogic: 'Resolved in 5.2 hours against 6.0-hour SLA allowance (0.8 hours ahead of deadline). Meets IRC-SP-100 pavement patch standards.',
      inputs: { targetResolutionHours: 6, actualResolutionHours: 5.2 },
      outputs: { slaComplianceMet: true, remainingSlaBufferHours: 0.8, durabilityGrade: 'CLASS_A' },
      telemetryLog: 'SLA Audit: Completed in 5.2 hours (Target: 6h). 100% on-time SLA compliance.',
      keyDecision: 'Certified on-time municipal SLA compliance and Indian Road Congress standard adherence.'
    },
    {
      id: 'step-wo-5',
      stepNumber: 5,
      agentName: 'Correlation Agent',
      role: 'Cluster De-escalation Modeler',
      phase: 'Verification',
      title: 'Hotspot Cluster De-escalation & Duplicate Resolution',
      purpose: 'Closes all linked child duplicate tickets simultaneously and decrements active hotspot severity.',
      status: 'COMPLETED',
      durationMs: 360,
      confidence: 1.0,
      inputLabel: 'LINKED CHILD TICKETS',
      outputLabel: '2 CHILD TICKETS RESOLVED',
      modelTech: 'Hotspot Graph De-escalator (Simulated)',
      providerType: 'SIMULATED',
      processingLogic: 'Cascades resolution to duplicate child tickets #dup-1042-a and #dup-1042-b; recalculates MVP Colony hotspot risk score from 84 to 42.',
      inputs: { childTickets: ['dup-1042-a', 'dup-1042-b'], hotspotId: 'HS-MVP-01' },
      outputs: { childTicketsClosed: 2, hotspotRiskScoreUpdated: 42, clusterStatus: 'DE_ESCALATED' },
      telemetryLog: 'Resolved 2 linked child tickets. Hotspot #HS-MVP-01 risk downgraded from 84 to 42.',
      keyDecision: 'De-escalated hotspot cluster in the municipal operations grid.'
    },
    {
      id: 'step-wo-6',
      stepNumber: 6,
      agentName: 'Decision Agent',
      role: 'Contractor Invoice & Audit Certifier',
      phase: 'Synthesis',
      title: 'Formal Municipal Quality Certification',
      purpose: 'Issues formal certificate of repair completion and clears contractor invoice for municipal payment.',
      status: 'COMPLETED',
      durationMs: 490,
      confidence: 0.98,
      inputLabel: 'AUDIT RESULTS',
      outputLabel: 'CERTIFICATE OF COMPLETION',
      modelTech: 'Automated Municipal Audit Sign-Off (Simulated)',
      providerType: 'SIMULATED',
      processingLogic: 'Compiles multi-agent evidence dossier into tamper-evident completion certificate #CERT-2026-MVP-8421; authorizes milestone release.',
      inputs: { certifiedBy: 'GVMC Smart Infrastructure Cell', auditPassed: true },
      outputs: { certificateId: 'CERT-2026-MVP-8421', contractorScore: 98.4, paymentApproved: true },
      telemetryLog: 'Certificate #CERT-2026-MVP-8421 issued. Contractor quality score recorded at 98.4%.',
      keyDecision: 'Authorized formal closure of municipal work order and approved contractor milestone.'
    },
    {
      id: 'step-wo-7',
      stepNumber: 7,
      agentName: 'Monitoring Agent',
      role: 'Citizen Transparency Broadcaster',
      phase: 'Action',
      title: 'Citizen Notification with Before/After Photo & Public Sync',
      purpose: 'Pushes "Pothole Repaired" verification alert to the reporting citizen with rating prompt and updates map status.',
      status: 'COMPLETED',
      durationMs: 250,
      confidence: 1.0,
      inputLabel: 'COMPLETION DOSSIER',
      outputLabel: 'CITIZEN PUSH & MAP RESOLVED',
      modelTech: 'Citizen Push Bridge & Map Marker Sync (Simulated)',
      providerType: 'SIMULATED',
      processingLogic: 'Transmits push notification with side-by-side before/after repair photos; updates map pin color from Rose/Amber to Emerald (Resolved).',
      inputs: { citizenId: 'usr-001', pushTemplate: 'REPAIR_VERIFIED', mapMarkerId: 'CP-1042' },
      outputs: { pushDelivered: true, mapPinTurnedGreen: true, citizenSatisfactionRequested: true },
      telemetryLog: 'Citizen push delivered with Before/After verification photo. Map marker updated to RESOLVED.',
      keyDecision: 'Broadcasted resolved status across Command Center and citizen transparency portal.'
    }
  ],
  liveLogs: [
    { time: '00:00.280', agent: 'ORCHESTRATOR', message: 'Ingested completion packet for Work Order #MNT-8421 from Unit 3' },
    { time: '00:01.260', agent: 'VISION', message: 'Comparative vision audit: Defect cavity 100% filled and leveled (96.2%)' },
    { time: '00:01.570', agent: 'GEO', message: 'On-site geotag authenticated (2.8m delta). Anti-spoofing passed' },
    { time: '00:01.990', agent: 'TRIAGE', message: 'SLA met in 5.2 hours (Target 6h). IRC-SP-100 standards compliant' },
    { time: '00:02.350', agent: 'CORRELATION', message: 'Resolved 2 child duplicates. Hotspot #HS-MVP-01 risk halved (42)' },
    { time: '00:02.840', agent: 'DECISION', message: 'Certificate #CERT-2026-MVP-8421 issued; contractor invoice cleared' },
    { time: '00:03.090', agent: 'MONITORING', message: 'Citizen push delivered with Before/After photo. Map pin turned green' }
  ]
};

// --------------------------------------------------------------------------
// ALL WORKFLOWS REPOSITORY
// --------------------------------------------------------------------------
export function getAllWorkflowDefinitions(currentIncident?: Incident): AgentWorkflowDef[] {
  const activeIncident = currentIncident || incidentStore.getSelectedIncident() || incidentStore.getIncidents()[0];
  const realWorkflow = buildRealIncidentWorkflow(activeIncident);

  return [
    realWorkflow,
    pavementPatrolWorkflowDef,
    emergencyHazardWorkflowDef,
    duplicateMergingWorkflowDef,
    workOrderSlaWorkflowDef
  ];
}
