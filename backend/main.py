from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from starlette.middleware.base import BaseHTTPMiddleware
from pydantic import BaseModel
from datetime import datetime
import json
from pathlib import Path
import subprocess
import logging
import sys
import os
import time
from collections import defaultdict

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Configure security logging
security_logger = logging.getLogger("security")
security_logger.setLevel(logging.INFO)
security_handler = logging.FileHandler("logs/security.log")
security_handler.setFormatter(logging.Formatter(
    '%(asctime)s - %(levelname)s - %(message)s'
))
security_logger.addHandler(security_handler)

# Rate limiting configuration
RATE_LIMIT_WINDOW = 60  # 1 minute window
RATE_LIMITS = {
    "/api/stats": 30,  # 30 requests per minute for stats
    "/api/health": 60,  # 60 requests per minute for health check
}

# Store request timestamps per IP
request_history = defaultdict(list)

def rate_limit_middleware(request: Request):
    """Rate limiting middleware"""
    client_ip = request.client.host
    path = request.url.path
    
    # Get rate limit for this endpoint
    limit = RATE_LIMITS.get(path, 30)  # Default to 30 requests per minute
    
    # Clean old requests
    current_time = time.time()
    request_history[client_ip] = [t for t in request_history[client_ip] 
                                if current_time - t < RATE_LIMIT_WINDOW]
    
    # Check if rate limit exceeded
    if len(request_history[client_ip]) >= limit:
        raise HTTPException(
            status_code=429,
            detail=f"Rate limit exceeded. Maximum {limit} requests per minute."
        )
    
    # Add current request
    request_history[client_ip].append(current_time)

# Path to results file
RESULTS_FILE = Path("/opt/dal_dashboard/backend/data/dal_stats.json")

class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        response = await call_next(request)
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["X-XSS-Protection"] = "1; mode=block"
        response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
        response.headers["Content-Security-Policy"] = "default-src 'self'"
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        response.headers["Permissions-Policy"] = "geolocation=(), microphone=(), camera=()"
        return response

app = FastAPI(
    title="DAL-o-meter API",
    description="API for tracking DAL adoption on Tezos network",
    version="1.0.0"
)

# CORS configuration with more restrictive settings
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://aurelienmonteillet.github.io"],  # Restrict to your GitHub Pages domain
    allow_credentials=True,
    allow_methods=["GET"],  # Only allow GET requests
    allow_headers=["*"],
    max_age=3600,  # Cache preflight requests for 1 hour
)

# Add trusted hosts middleware
app.add_middleware(
    TrustedHostMiddleware,
    allowed_hosts=["*"]  # Configure with your actual domains in production
)

# Add security headers middleware
app.add_middleware(SecurityHeadersMiddleware)

# Add rate limiting middleware
@app.middleware("http")
async def rate_limit(request: Request, call_next):
    try:
        rate_limit_middleware(request)
        response = await call_next(request)
        return response
    except HTTPException as e:
        return JSONResponse(
            status_code=e.status_code,
            content={"detail": e.detail}
        )

def log_security_event(event_type: str, details: dict):
    """Log security events"""
    security_logger.info(f"{event_type}: {json.dumps(details)}")

@app.middleware("http")
async def security_logging_middleware(request: Request, call_next):
    """Middleware to log security events"""
    start_time = time.time()
    client_ip = request.client.host
    path = request.url.path
    
    try:
        response = await call_next(request)
        process_time = time.time() - start_time
        
        # Log successful requests
        log_security_event("request", {
            "ip": client_ip,
            "path": path,
            "method": request.method,
            "status_code": response.status_code,
            "process_time": process_time
        })
        
        return response
    except Exception as e:
        # Log errors
        log_security_event("error", {
            "ip": client_ip,
            "path": path,
            "method": request.method,
            "error": str(e)
        })
        raise

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

# Environment configuration
ENV = os.getenv("ENV", "production")
IS_STAGING = ENV == "staging"

# Adjust rate limits for staging
if IS_STAGING:
    RATE_LIMITS = {
        "/api/stats": 10,  # More restrictive for testing
        "/api/health": 20,
    }
    # Add staging indicator to response
    @app.middleware("http")
    async def staging_middleware(request: Request, call_next):
        response = await call_next(request)
        if IS_STAGING:
            response.headers["X-Staging"] = "true"
        return response 