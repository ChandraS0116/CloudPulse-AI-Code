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
    // Incident is already pushed to incidentStore by AgentOrchestrator
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
        <DronePatrolView onNavigate={setCurrentTab} />
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
