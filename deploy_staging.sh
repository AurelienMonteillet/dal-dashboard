#!/bin/bash

echo "===== Starting simple staging deployment: $(date) ====="

# Change to the project root directory
cd /opt/dal_dashboard

# Activate virtual environment
source venv/bin/activate

# Set environment to staging
export ENV=staging

# Install/update dependencies
pip install -r backend/requirements.txt

# Start the staging server on port 8001
echo "Starting staging server on port 8001..."
uvicorn backend.main:app --host 0.0.0.0 --port 8001 --reload

echo "===== Staging deployment completed: $(date) =====" 