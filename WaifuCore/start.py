#!/usr/bin/env python3
"""
Simple script to start the WaifuCore API with proper environment configuration
"""
import os
import sys
from pathlib import Path

# Add the parent directory to the Python path
sys.path.insert(0, str(Path(__file__).parent.parent))

# Import and run the main API
from main_api import app
import uvicorn

if __name__ == "__main__":
    # Get port from environment or use default
    port = int(os.environ.get("PORT", 8000))
    host = os.environ.get("HOST", "0.0.0.0")
    
    print(f"🚀 Starting WaifuCore API on {host}:{port}")
    print(f"📊 Environment: {os.environ.get('RAILWAY_ENVIRONMENT_NAME', 'development')}")
    
    # Run with uvicorn
    uvicorn.run(
        "main_api:app",
        host=host,
        port=port,
        reload=False,  # Disable reload in production
        workers=1      # Single worker for Railway
    )
