"""
CloudPulse AI — FastAPI Cloud Gateway & 7-Agent Orchestration API
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
import uvicorn
from agents.graph import run_cloudpulse_swarm

app = FastAPI(
    title="CloudPulse AI API",
    description="Visakhapatnam Autonomous Infrastructure Intelligence Multi-Agent Gateway",
    version="2.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class IncidentReportRequest(BaseModel):
    image_url: str = Field(..., description="S3 or base64 visual evidence URI")
    latitude: float = Field(..., example=17.7424)
    longitude: float = Field(..., example=83.3356)
    locality: str = Field(..., example="MVP Colony")
    description: str = Field(..., example="Deep road crater on arterial road")
    reporter_name: Optional[str] = Field("Citizen", example="Citizen Sai")

@app.get("/api/v1/health")
def get_system_health():
    return {
        "status": "ONLINE",
        "service": "CloudPulse Core Gateway",
        "region": "ap-south-1 (Mumbai)",
        "zone": "Visakhapatnam Operational Corridor",
        "ai_mode": "DEMO_DETERMINISTIC",
        "agents": {
            "orchestrator": "ONLINE",
            "vision": "ONLINE",
            "geo": "ONLINE",
            "triage": "ONLINE",
            "correlation": "ONLINE",
            "decision": "ONLINE",
            "monitoring": "ONLINE"
        }
    }

@app.post("/api/v1/incidents/analyze")
def analyze_incident(req: IncidentReportRequest):
    """
    Executes the 7-agent autonomous swarm on the submitted report.
    Returns complete decision, rationale, priority, and dispatched work order.
    """
    try:
        result = run_cloudpulse_swarm({
            "report_id": f"CP-{abs(hash(req.description)) % 9000 + 1000}",
            "image_url": req.image_url,
            "latitude": req.latitude,
            "longitude": req.longitude,
            "locality": req.locality,
            "description": req.description,
            "reporter_name": req.reporter_name
        })
        return {
            "success": True,
            "incident": result
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
