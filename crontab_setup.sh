#!/bin/bash

# Make dal_calculation.py executable
chmod +x dal_calculation.py

# Create a log directory if it doesn't exist
mkdir -p /opt/dal_dashboard/logs

# Create the cron job
(crontab -l 2>/dev/null; echo "0 0 */2 * * cd /opt/dal_dashboard && ./dal_calculation.py --network mainnet >> /opt/dal_dashboard/logs/dal_stats.log 2>&1") | crontab -

echo "Cron job has been set up to run every 2 days at midnight"
echo "Logs will be written to /opt/dal_dashboard/logs/dal_stats.log"
echo "You can check the cron jobs with: crontab -l" 