#!/bin/bash

# Log start time
echo "===== Starting DAL stats update: $(date) ====="

# Activate virtual environment
source venv/bin/activate

# Run the calculation script
echo "Running DAL calculation script..."
python dal_calculation.py --network mainnet

# Check if there are changes to commit
if git diff --quiet docs/dal_stats.json; then
    echo "No changes to DAL stats detected."
else
    echo "Changes detected, committing and pushing..."
    
    # Set up SSH agent with the automation key
    eval "$(ssh-agent -s)"
    ssh-add ~/.ssh/github_automation_key
    
    # Configure git to use SSH
    git config --local core.sshCommand "ssh -i ~/.ssh/github_automation_key -F /dev/null"
    
    # Add and commit changes
    git add docs/dal_stats.json docs/dal_stats_history.json
    git commit -m "Update DAL stats for cycle $(jq -r '.cycle' docs/dal_stats.json) ($(date +%Y-%m-%d))"
    
    # Push changes
    git push origin main
    
    # Clean up SSH agent
    ssh-agent -k
    
    echo "Changes pushed successfully!"
fi

echo "===== DAL stats update completed: $(date) =====" 