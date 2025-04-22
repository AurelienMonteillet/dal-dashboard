#!/bin/bash

# Log start time
echo "===== Starting DAL stats update: $(date) ====="

# Change to the project root directory
cd /opt/dal_dashboard

# Activate virtual environment
source venv/bin/activate

# Run the calculation script
echo "Running DAL calculation script..."
python backend/scripts/dal_calculation.py --network mainnet --output-dir backend/data

# Check if there are changes to commit
if git diff --quiet backend/data/dal_stats.json; then
    echo "No changes to DAL stats detected."
else
    echo "Changes detected, committing and pushing..."
    
    # Set up SSH agent with the automation key
    eval "$(ssh-agent -s)"
    ssh-add ~/.ssh/github_automation_key
    
    # Configure git to use SSH
    git config --local core.sshCommand "ssh -i ~/.ssh/github_automation_key -F /dev/null"
    
    # Add and commit changes
    git add backend/data/dal_stats.json backend/data/dal_stats_history.json
    git commit -m "Update DAL stats for cycle $(jq -r '.cycle' backend/data/dal_stats.json) ($(date +%Y-%m-%d))"
    
    # Push changes
    git push origin main
    
    # Clean up SSH agent
    ssh-agent -k
    
    echo "Changes pushed successfully!"
fi

# Log output to file
exec > >(tee -a logs/dal_update.log) 2>&1

echo "===== DAL stats update completed: $(date) =====" 