from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from datetime import datetime
import json
from pathlib import Path
import subprocess
import logging
import sys
import os

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Path to results file
RESULTS_FILE = Path("/opt/dal_dashboard/backend/data/dal_stats.json")

app = FastAPI(
    title="DAL-o-meter API",
    description="API for tracking DAL adoption on Tezos network",
    version="1.0.0"
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class DALStatsResponse(BaseModel):
    """Response model for DAL statistics"""
    cycle: int
    timestamp: datetime
    total_bakers: int
    dal_active_bakers: int
    dal_inactive_bakers: int
    unclassified_bakers: int
    non_attesting_bakers: int
    dal_baking_power_percentage: float
    total_baking_power: float
    dal_baking_power: float
    dal_participation_percentage: float = 0.0
    dal_adoption_percentage: float = 0.0

def read_dal_stats():
    """Read DAL statistics from file"""
    try:
        with open(RESULTS_FILE, 'r') as f:
            data = json.load(f)
            # Convert string timestamp to datetime
            data['timestamp'] = datetime.fromisoformat(data['timestamp'])
            return data
    except FileNotFoundError:
        logger.error("DAL stats file not found. Running initial calculation...")
        # Run the calculation script if file doesn't exist
        script_path = "/opt/dal_dashboard/backend/scripts/dal_calculation.py"
        subprocess.run([script_path, "--network", "mainnet"], check=True)
        # Try reading again
        with open(RESULTS_FILE, 'r') as f:
            data = json.load(f)
            data['timestamp'] = datetime.fromisoformat(data['timestamp'])
            return data
    except Exception as e:
        logger.error(f"Error reading DAL stats: {e}")
        raise HTTPException(status_code=500, detail="Error reading DAL statistics")

@app.get("/api/stats", response_model=DALStatsResponse)
async def get_stats():
    """
    Get the latest DAL statistics from stored results.
    
    Returns:
        DALStatsResponse: Current DAL statistics
    """
    return read_dal_stats()

@app.get("/api/health")
async def health_check():
    """
    Health check endpoint.
    
    Returns:
        dict: Status of the API
    """
    try:
        stats = read_dal_stats()
        return JSONResponse({
            "status": "healthy",
            "last_update": stats["timestamp"]
        })
    except Exception:
        return JSONResponse({
            "status": "unhealthy",
            "error": "Could not read DAL statistics"
        }, status_code=500) 