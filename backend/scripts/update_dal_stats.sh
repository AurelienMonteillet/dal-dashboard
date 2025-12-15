#!/bin/bash

# Change to the project root directory
cd /opt/dal_dashboard

# === LOG ROTATION ===
# Truncate dal_stats.log if larger than 10MB
LOG_FILE="logs/dal_stats.log"
MAX_SIZE=$((10 * 1024 * 1024))  # 10MB in bytes

if [ -f "$LOG_FILE" ]; then
    FILE_SIZE=$(stat -c%s "$LOG_FILE" 2>/dev/null || stat -f%z "$LOG_FILE" 2>/dev/null)
    if [ "$FILE_SIZE" -gt "$MAX_SIZE" ]; then
        echo "$(date): Rotating $LOG_FILE (size: $FILE_SIZE bytes)" >> logs/dal_update.log
        # Keep last 1000 lines and overwrite
        tail -1000 "$LOG_FILE" > "${LOG_FILE}.tmp" && mv "${LOG_FILE}.tmp" "$LOG_FILE"
    fi
fi

# Also check backend/scripts/logs
BACKEND_LOG="backend/scripts/logs/dal_stats.log"
if [ -f "$BACKEND_LOG" ]; then
    FILE_SIZE=$(stat -c%s "$BACKEND_LOG" 2>/dev/null || stat -f%z "$BACKEND_LOG" 2>/dev/null)
    if [ "$FILE_SIZE" -gt "$MAX_SIZE" ]; then
        echo "$(date): Rotating $BACKEND_LOG (size: $FILE_SIZE bytes)" >> logs/dal_update.log
        tail -1000 "$BACKEND_LOG" > "${BACKEND_LOG}.tmp" && mv "${BACKEND_LOG}.tmp" "$BACKEND_LOG"
    fi
fi

# Truncate dal_update.log if larger than 1MB
UPDATE_LOG="logs/dal_update.log"
UPDATE_MAX_SIZE=$((1 * 1024 * 1024))  # 1MB
if [ -f "$UPDATE_LOG" ]; then
    FILE_SIZE=$(stat -c%s "$UPDATE_LOG" 2>/dev/null || stat -f%z "$UPDATE_LOG" 2>/dev/null)
    if [ "$FILE_SIZE" -gt "$UPDATE_MAX_SIZE" ]; then
        tail -500 "$UPDATE_LOG" > "${UPDATE_LOG}.tmp" && mv "${UPDATE_LOG}.tmp" "$UPDATE_LOG"
    fi
fi

# === START LOGGING ===
exec > >(tee -a logs/dal_update.log) 2>&1

echo "===== Starting DAL stats update: $(date) ====="

# Activate virtual environment
source venv/bin/activate

# Store current branch
CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)
echo "Current branch: $CURRENT_BRANCH"

# Check if we need to switch to main
if [ "$CURRENT_BRANCH" != "main" ]; then
    echo "Not on main branch. Switching to main for updates..."
    git stash
    git checkout main
fi

# Get current cycle and calculate for previous cycle (current is not yet complete)
CURRENT_CYCLE=$(curl -s "https://api.mainnet.tzkt.io/v1/head" | jq -r '.cycle')
PREVIOUS_CYCLE=$((CURRENT_CYCLE - 1))

# Check if we already have data for the previous cycle
EXISTING_CYCLE=$(jq -r '.cycle' backend/data/dal_stats.json 2>/dev/null || echo "0")

if [ "$EXISTING_CYCLE" == "$PREVIOUS_CYCLE" ]; then
    echo "Cycle $PREVIOUS_CYCLE already calculated. Skipping."
else
    # Run the calculation script for the previous cycle
    echo "Running DAL calculation script for cycle $PREVIOUS_CYCLE..."
    python backend/scripts/dal_calculation.py --network mainnet --output-dir backend/data --cycle $PREVIOUS_CYCLE
fi

# Check if there are changes to commit
if git diff --quiet backend/data/dal_stats.json; then
    echo "No changes to DAL stats detected."
else
    echo "Changes detected, committing and pushing..."
    
    # Ensure docs directory exists
    mkdir -p docs
    
    # Copy JSON files to docs directory for GitHub Pages
    cp backend/data/dal_stats.json docs/
    cp backend/data/dal_stats_history.json docs/
    
    # Copy JSON files to frontend/public for local fallback in the frontend
    cp backend/data/dal_stats.json frontend/public/
    cp backend/data/dal_stats_history.json frontend/public/
    
    # Set up SSH agent with the automation key
    eval "$(ssh-agent -s)"
    ssh-add ~/.ssh/github_automation_key
    
    # Configure git to use SSH
    git config --local core.sshCommand "ssh -i ~/.ssh/github_automation_key -F /dev/null"
    
    # Fetch latest changes from remote
    echo "Fetching latest changes from remote..."
    git fetch origin main
    
    # Check if we need to rebase or reset
    if git log HEAD..origin/main --oneline | grep -q .; then
        echo "Remote has new commits. Rebasing local changes..."
        # Reset to remote to avoid conflicts (cron should work with latest remote state)
        git reset --hard origin/main
        # Re-add and commit the changes
        git add backend/data/dal_stats.json backend/data/dal_stats_history.json docs/ frontend/public/dal_stats.json frontend/public/dal_stats_history.json
        git commit -m "Update DAL stats for cycle $(jq -r '.cycle' backend/data/dal_stats.json) ($(date +%Y-%m-%d))"
    else
        # Add and commit changes
        git add backend/data/dal_stats.json backend/data/dal_stats_history.json docs/ frontend/public/dal_stats.json frontend/public/dal_stats_history.json
        git commit -m "Update DAL stats for cycle $(jq -r '.cycle' backend/data/dal_stats.json) ($(date +%Y-%m-%d))"
    fi
    
    # Push changes
    if git push origin main; then
        echo "Changes pushed successfully!"
    else
        echo "Warning: Failed to push changes. This may be due to concurrent updates."
    fi
    
    # Clean up SSH agent
    ssh-agent -k
fi

# Return to original branch if needed
if [ "$CURRENT_BRANCH" != "main" ]; then
    echo "Switching back to $CURRENT_BRANCH branch..."
    git checkout "$CURRENT_BRANCH"
    git stash pop || true
fi

echo "===== DAL stats update completed: $(date) ====="
