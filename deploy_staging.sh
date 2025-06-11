#!/bin/bash

# Log start time
echo "===== Starting staging deployment: $(date) ====="

# Change to the project root directory
cd /opt/dal_dashboard

# Activate virtual environment
source venv/bin/activate

# Set environment to staging
export ENV=staging

# Pull latest changes
git fetch origin
git checkout staging
git pull origin staging

# Install/update dependencies
pip install -r backend/requirements.txt

# Run tests (if any)
echo "Running tests..."
# Add your test commands here

# Start the staging server
echo "Starting staging server..."
uvicorn backend.main:app --host 0.0.0.0 --port 8001 --reload

# Log completion
echo "===== Staging deployment completed: $(date) =====" 