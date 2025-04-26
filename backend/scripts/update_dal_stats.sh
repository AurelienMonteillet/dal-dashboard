#!/bin/bash

# Log start time
echo "===== Starting DAL stats update: $(date) ====="

# Change to the project root directory
cd /opt/dal_dashboard

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

# Run the calculation script
echo "Running DAL calculation script..."
python backend/scripts/dal_calculation.py --network mainnet --output-dir backend/data

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
    
    # Set up SSH agent with the automation key
    eval "$(ssh-agent -s)"
    ssh-add ~/.ssh/github_automation_key
    
    # Configure git to use SSH
    git config --local core.sshCommand "ssh -i ~/.ssh/github_automation_key -F /dev/null"
    
    # Add and commit changes
    git add backend/data/dal_stats.json backend/data/dal_stats_history.json docs/
    git commit -m "Update DAL stats for cycle $(jq -r '.cycle' backend/data/dal_stats.json) ($(date +%Y-%m-%d))"
    
    # Push changes
    git push origin main
    
    # Clean up SSH agent
    ssh-agent -k
    
    echo "Changes pushed successfully!"
fi

# Return to original branch if needed
if [ "$CURRENT_BRANCH" != "main" ]; then
    echo "Switching back to $CURRENT_BRANCH branch..."
    git checkout "$CURRENT_BRANCH"
    git stash pop || true
fi

# Log output to file
exec > >(tee -a logs/dal_update.log) 2>&1

echo "===== DAL stats update completed: $(date) =====" 