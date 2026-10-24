-- ==============================================================================
-- CLOUDPULSE AI — VISAKHAPATNAM CIVIC INFRASTRUCTURE INTELLIGENCE PLATFORM
-- PRODUCTION POSTGRESQL + POSTGIS SCHEMA
-- ==============================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";

-- 1. INCIDENTS TABLE
CREATE TABLE IF NOT EXISTS public.incidents (
    id VARCHAR(32) PRIMARY KEY,
    case_id VARCHAR(32),
    category VARCHAR(64) NOT NULL,
    description TEXT,
    image_url TEXT NOT NULL,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    locality VARCHAR(128) NOT NULL,
    ward VARCHAR(64),
    address TEXT,
    severity VARCHAR(16) NOT NULL CHECK (severity IN ('CRITICAL', 'HIGH', 'MEDIUM', 'LOW')),
    priority VARCHAR(8) NOT NULL CHECK (priority IN ('P1', 'P2', 'P3', 'P4')),
    confidence DOUBLE PRECISION NOT NULL DEFAULT 0.90,
    status VARCHAR(32) NOT NULL DEFAULT 'REPORTED' CHECK (
        status IN ('REPORTED', 'AI_ANALYZING', 'AI_VERIFIED', 'PRIORITIZED', 'ACTION_REQUIRED', 'ASSIGNED', 'IN_PROGRESS', 'RESOLVED', 'VERIFIED')
    ),
    assigned_team VARCHAR(128),
    department VARCHAR(128),
    target_resolution_hours INTEGER DEFAULT 24,
    sla_deadline TIMESTAMPTZ,
    recommended_action TEXT,
    rationale TEXT,
    hotspot_id VARCHAR(32),
    hotspot_name VARCHAR(128),
    nearby_count INTEGER DEFAULT 0,
    duplicate_count INTEGER DEFAULT 0,
    reporter_name VARCHAR(128) DEFAULT 'Anonymous Citizen',
    reporter_role VARCHAR(64) DEFAULT 'Citizen',
    ai_mode VARCHAR(32) DEFAULT 'DEMO_DETERMINISTIC' CHECK (ai_mode IN ('DEMO_DETERMINISTIC', 'LIVE_AI')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    resolved_at TIMESTAMPTZ
);

-- 2. DUPLICATE REPORTS TABLE (Consolidated Reports within 50m)
CREATE TABLE IF NOT EXISTS public.duplicate_reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    master_incident_id VARCHAR(32) NOT NULL REFERENCES public.incidents(id) ON DELETE CASCADE,
    reporter_name VARCHAR(128) DEFAULT 'Citizen',
    notes TEXT,
    image_url TEXT,
    distance_meters DOUBLE PRECISION,
    submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. HOTSPOTS TABLE
CREATE TABLE IF NOT EXISTS public.hotspots (
    id VARCHAR(32) PRIMARY KEY,
    name VARCHAR(128) NOT NULL,
    locality VARCHAR(128) NOT NULL,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    radius_meters INTEGER NOT NULL DEFAULT 800,
    incident_count INTEGER NOT NULL DEFAULT 1,
    growth_rate VARCHAR(32) DEFAULT '+0% in 48h',
    severity VARCHAR(16) NOT NULL DEFAULT 'MEDIUM',
    confidence DOUBLE PRECISION NOT NULL DEFAULT 0.85,
    recommended_action TEXT,
    incident_ids JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. AGENT EXECUTION TRACES & LOGS
CREATE TABLE IF NOT EXISTS public.agent_traces (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    incident_id VARCHAR(32) NOT NULL REFERENCES public.incidents(id) ON DELETE CASCADE,
    agent_name VARCHAR(64) NOT NULL,
    status VARCHAR(16) NOT NULL DEFAULT 'COMPLETED',
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    latency_ms INTEGER NOT NULL DEFAULT 0,
    input_payload JSONB DEFAULT '{}'::jsonb,
    output_payload JSONB DEFAULT '{}'::jsonb,
    telemetry_logs JSONB DEFAULT '[]'::jsonb,
    ai_mode VARCHAR(32) DEFAULT 'DEMO_DETERMINISTIC',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. LIVE ACTIVITY FEED
CREATE TABLE IF NOT EXISTS public.live_activities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    incident_id VARCHAR(32),
    agent_name VARCHAR(64) NOT NULL,
    message TEXT NOT NULL,
    activity_type VARCHAR(16) NOT NULL DEFAULT 'info' CHECK (activity_type IN ('info', 'success', 'warning', 'critical')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_incidents_status ON public.incidents(status);
CREATE INDEX IF NOT EXISTS idx_incidents_severity ON public.incidents(severity);
CREATE INDEX IF NOT EXISTS idx_incidents_locality ON public.incidents(locality);
CREATE INDEX IF NOT EXISTS idx_incidents_coords ON public.incidents(latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_duplicate_master_id ON public.duplicate_reports(master_incident_id);
CREATE INDEX IF NOT EXISTS idx_agent_traces_incident_id ON public.agent_traces(incident_id);

-- Enable Row Level Security (RLS)
ALTER TABLE public.incidents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.duplicate_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hotspots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agent_traces ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.live_activities ENABLE ROW LEVEL SECURITY;

-- Allow public read & insert for demo/field prototype operations
CREATE POLICY "Allow public read access" ON public.incidents FOR SELECT USING (true);
CREATE POLICY "Allow public insert access" ON public.incidents FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update access" ON public.incidents FOR UPDATE USING (true);

CREATE POLICY "Allow public read duplicates" ON public.duplicate_reports FOR SELECT USING (true);
CREATE POLICY "Allow public insert duplicates" ON public.duplicate_reports FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public read hotspots" ON public.hotspots FOR SELECT USING (true);
CREATE POLICY "Allow public update hotspots" ON public.hotspots FOR UPDATE USING (true);

CREATE POLICY "Allow public read agent_traces" ON public.agent_traces FOR SELECT USING (true);
CREATE POLICY "Allow public insert agent_traces" ON public.agent_traces FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public read live_activities" ON public.live_activities FOR SELECT USING (true);
CREATE POLICY "Allow public insert live_activities" ON public.live_activities FOR INSERT WITH CHECK (true);

-- Enable Realtime publication for near real-time updates
ALTER PUBLICATION supabase_realtime ADD TABLE public.incidents;
ALTER PUBLICATION supabase_realtime ADD TABLE public.duplicate_reports;
ALTER PUBLICATION supabase_realtime ADD TABLE public.live_activities;
