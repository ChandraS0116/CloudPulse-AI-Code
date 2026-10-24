// ==============================================================================
// CLOUDPULSE AI — REALTIME SYNCHRONIZATION ENGINE
// ==============================================================================
// Combines Supabase Realtime (for cross-device / cloud sync) with
// HTML5 BroadcastChannel + LocalStorage (for zero-latency local demo & cross-tab sync).

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Incident, DuplicateReport } from '../../types';

export type RealtimeSyncMode = 'SUPABASE_REALTIME' | 'LOCAL_BROADCAST_PERSISTENCE';

export interface SyncMessage {
  type: 'INCIDENT_CREATED' | 'INCIDENT_UPDATED' | 'DUPLICATE_MERGED' | 'HOTSPOT_UPDATED';
  incidentId: string;
  data?: any;
  timestamp: string;
  senderTabId: string;
}

class RealtimeSyncManager {
  private supabase: SupabaseClient | null = null;
  private broadcastChannel: BroadcastChannel | null = null;
  private tabId: string = `tab-${Math.random().toString(36).substring(2, 9)}`;
  private listeners: Set<(message: SyncMessage) => void> = new Set();
  private isConnectedToSupabase: boolean = false;

  constructor() {
    this.initBroadcastChannel();
    this.initSupabase();
  }

  private initBroadcastChannel() {
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      try {
        this.broadcastChannel = new BroadcastChannel('cloudpulse_vizag_sync');
        this.broadcastChannel.onmessage = (event: MessageEvent<SyncMessage>) => {
          if (event.data && event.data.senderTabId !== this.tabId) {
            this.notifyListeners(event.data);
          }
        };
      } catch (err) {
        console.warn('[CloudPulse Sync] BroadcastChannel initialization skipped:', err);
      }
    }
  }

  private initSupabase() {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

    if (supabaseUrl && supabaseKey && supabaseUrl.startsWith('http')) {
      try {
        this.supabase = createClient(supabaseUrl, supabaseKey);
        this.isConnectedToSupabase = true;
        this.subscribeToSupabaseChanges();
        console.log('[CloudPulse Sync] Supabase Realtime connected successfully.');
      } catch (err) {
        console.warn('[CloudPulse Sync] Supabase initialization failed, falling back to Local Broadcast:', err);
        this.isConnectedToSupabase = false;
      }
    } else {
      console.log('[CloudPulse Sync] Running in Local Broadcast & Persistent Cache mode (Zero-config offline mode).');
    }
  }

  private subscribeToSupabaseChanges() {
    if (!this.supabase) return;

    this.supabase
      .channel('public:incidents')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'incidents' },
        (payload) => {
          const eventType = payload.eventType;
          const newRecord = payload.new as any;
          if (eventType === 'INSERT') {
            this.notifyListeners({
              type: 'INCIDENT_CREATED',
              incidentId: newRecord.id,
              data: newRecord,
              timestamp: new Date().toISOString(),
              senderTabId: 'supabase-remote'
            });
          } else if (eventType === 'UPDATE') {
            this.notifyListeners({
              type: 'INCIDENT_UPDATED',
              incidentId: newRecord.id,
              data: newRecord,
              timestamp: new Date().toISOString(),
              senderTabId: 'supabase-remote'
            });
          }
        }
      )
      .subscribe();
  }

  private notifyListeners(message: SyncMessage) {
    this.listeners.forEach(fn => fn(message));
  }

  public subscribe(listener: (message: SyncMessage) => void) {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  public broadcastIncidentCreated(incident: Incident) {
    const message: SyncMessage = {
      type: 'INCIDENT_CREATED',
      incidentId: incident.id,
      data: incident,
      timestamp: new Date().toISOString(),
      senderTabId: this.tabId
    };

    // Broadcast across local browser tabs
    if (this.broadcastChannel) {
      try {
        this.broadcastChannel.postMessage(message);
      } catch (e) {
        // Ignore serialization errors if any
      }
    }

    // If Supabase connected, push record to PostgreSQL
    if (this.supabase && this.isConnectedToSupabase) {
      this.supabase.from('incidents').insert([
        {
          id: incident.id,
          case_id: incident.caseId,
          category: incident.category,
          description: incident.description,
          image_url: incident.image,
          latitude: incident.latitude,
          longitude: incident.longitude,
          locality: incident.locality,
          ward: incident.ward,
          address: incident.address,
          severity: incident.severity,
          priority: incident.priority,
          confidence: incident.confidence,
          status: incident.status,
          assigned_team: incident.assignedTeam,
          department: incident.department,
          target_resolution_hours: incident.targetResolutionHours,
          sla_deadline: incident.slaDeadline,
          recommended_action: incident.recommendedAction,
          rationale: incident.rationale,
          hotspot_id: incident.hotspotId,
          hotspot_name: incident.hotspotName,
          nearby_count: incident.nearbyCount,
          duplicate_count: incident.duplicateCount,
          reporter_name: incident.reporter?.name || 'Citizen',
          reporter_role: incident.reporter?.role || 'Citizen',
          ai_mode: incident.aiMode,
          created_at: incident.createdAt
        }
      ]).then(({ error }) => {
        if (error) console.warn('[CloudPulse Sync] Supabase insert error:', error.message);
      });
    }
  }

  public broadcastIncidentUpdated(id: string, updates: Partial<Incident>) {
    const message: SyncMessage = {
      type: 'INCIDENT_UPDATED',
      incidentId: id,
      data: updates,
      timestamp: new Date().toISOString(),
      senderTabId: this.tabId
    };

    if (this.broadcastChannel) {
      try {
        this.broadcastChannel.postMessage(message);
      } catch (e) {}
    }

    if (this.supabase && this.isConnectedToSupabase) {
      const dbUpdates: Record<string, any> = { updated_at: new Date().toISOString() };
      if (updates.status) dbUpdates.status = updates.status;
      if (updates.resolvedAt) dbUpdates.resolved_at = updates.resolvedAt;
      if (updates.assignedTeam) dbUpdates.assigned_team = updates.assignedTeam;
      if (updates.department) dbUpdates.department = updates.department;

      this.supabase.from('incidents').update(dbUpdates).eq('id', id).then(({ error }) => {
        if (error) console.warn('[CloudPulse Sync] Supabase update error:', error.message);
      });
    }
  }

  public broadcastDuplicateMerged(masterIncidentId: string, duplicate: DuplicateReport, newCount: number) {
    const message: SyncMessage = {
      type: 'DUPLICATE_MERGED',
      incidentId: masterIncidentId,
      data: { duplicate, newCount },
      timestamp: new Date().toISOString(),
      senderTabId: this.tabId
    };

    if (this.broadcastChannel) {
      try {
        this.broadcastChannel.postMessage(message);
      } catch (e) {}
    }

    if (this.supabase && this.isConnectedToSupabase) {
      this.supabase.from('duplicate_reports').insert([
        {
          master_incident_id: masterIncidentId,
          reporter_name: duplicate.reporterName,
          notes: duplicate.notes,
          image_url: duplicate.image,
          distance_meters: duplicate.distanceMeters,
          submitted_at: duplicate.timestamp
        }
      ]).then(() => {
        this.supabase?.from('incidents').update({ duplicate_count: newCount }).eq('id', masterIncidentId);
      });
    }
  }

  public getSyncMode(): RealtimeSyncMode {
    return this.isConnectedToSupabase ? 'SUPABASE_REALTIME' : 'LOCAL_BROADCAST_PERSISTENCE';
  }

  public isSupabaseActive(): boolean {
    return this.isConnectedToSupabase;
  }
}

export const realtimeSync = new RealtimeSyncManager();
