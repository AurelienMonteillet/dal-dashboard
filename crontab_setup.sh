#!/bin/bash

# This script sets up the cron job for updating DAL statistics

# Create log directory if it doesn't exist
mkdir -p /opt/dal_dashboard/logs

# Set up cron job to run update_dal_stats.sh every 2 days at midnight
(crontab -l 2>/dev/null | grep -v "dal_dashboard.*update_dal_stats" || true; 
 echo "0 0 */2 * * cd /opt/dal_dashboard && ./backend/scripts/update_dal_stats.sh > /opt/dal_dashboard/logs/dal_update.log 2>&1") | crontab -

echo "Cron job set up successfully. It will run every 2 days at midnight."
echo "Check the current crontab with: crontab -l" 