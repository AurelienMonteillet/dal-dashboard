#!/bin/bash

# Robust script to recalculate all historical DAL cycles in a SEPARATE directory
# This allows verification before replacing the production data

set -e

cd /opt/dal_dashboard

# Configuration - USE SEPARATE DIRECTORY
OUTPUT_DIR="backend/data_recalculated"
LOG_DIR="backend/logs"
LOG_FILE="$LOG_DIR/recalculate_separate_$(date +%Y%m%d_%H%M%S).log"
PROGRESS_FILE="$LOG_DIR/recalculate_progress.json"
FAILED_FILE="$LOG_DIR/recalculate_failed.txt"
SUCCESS_FILE="$LOG_DIR/recalculate_success.txt"

# Create directories
mkdir -p "$OUTPUT_DIR"
mkdir -p "$LOG_DIR"

# Function to log messages
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

# Function to update progress
update_progress() {
    local cycle=$1
    local status=$2
    echo "{\"last_cycle\": $cycle, \"status\": \"$status\", \"timestamp\": \"$(date -Iseconds)\"}" > "$PROGRESS_FILE"
}

# Function to calculate a single cycle with retry
calculate_cycle() {
    local cycle=$1
    local max_retries=5
    local retry_count=0
    local delay=5
    
    while [ $retry_count -lt $max_retries ]; do
        log "  Attempt $((retry_count + 1))/$max_retries for cycle $cycle..."
        
        if timeout 300 python3 backend/scripts/dal_calculation.py \
            --network mainnet \
            --output-dir "$OUTPUT_DIR" \
            --cycle "$cycle" >> "$LOG_FILE" 2>&1; then
            
            log "  ✅ Cycle $cycle succeeded"
            echo "$cycle" >> "$SUCCESS_FILE"
            update_progress "$cycle" "success"
            return 0
        else
            exit_code=$?
            retry_count=$((retry_count + 1))
            
            if [ $retry_count -lt $max_retries ]; then
                log "  ⚠️  Cycle $cycle failed (exit code $exit_code), retrying in ${delay}s..."
                sleep $delay
                delay=$((delay * 2))  # Exponential backoff
            else
                log "  ❌ Cycle $cycle failed after $max_retries attempts"
                echo "$cycle" >> "$FAILED_FILE"
                update_progress "$cycle" "failed"
                return 1
            fi
        fi
    done
}

# Main execution
log "=========================================="
log "Robust Historical DAL Recalculation"
log "Output directory: $OUTPUT_DIR"
log "Method: dal_participation RPC with correct dates"
log "=========================================="
log ""

# Get list of all cycles to process
CYCLES=$(cat backend/data/dal_stats_history.json | jq -r '.[] | .cycle' | sort -n)
TOTAL=$(echo "$CYCLES" | wc -l)

log "Total cycles to recalculate: $TOTAL"
log "Log file: $LOG_FILE"
log "Progress file: $PROGRESS_FILE"
log ""

# Check if we should resume
START_CYCLE=""
if [ -f "$PROGRESS_FILE" ]; then
    LAST_CYCLE=$(jq -r '.last_cycle' "$PROGRESS_FILE" 2>/dev/null || echo "")
    LAST_STATUS=$(jq -r '.status' "$PROGRESS_FILE" 2>/dev/null || echo "")
    
    if [ -n "$LAST_CYCLE" ]; then
        log "Found previous progress: Last processed cycle $LAST_CYCLE (status: $LAST_STATUS)"
        log "Resuming from cycle $((LAST_CYCLE + 1))"
        START_CYCLE=$((LAST_CYCLE + 1))
    fi
fi

# Initialize counters
COUNT=0
SUCCESS_COUNT=0
FAILED_COUNT=0
SKIPPED=0

# Process each cycle
for CYCLE in $CYCLES; do
    COUNT=$((COUNT + 1))
    
    # Skip cycles before resume point
    if [ -n "$START_CYCLE" ] && [ "$CYCLE" -lt "$START_CYCLE" ]; then
        SKIPPED=$((SKIPPED + 1))
        continue
    fi
    
    log ""
    log "[$COUNT/$TOTAL] Processing cycle $CYCLE..."
    
    # Calculate the cycle
    if calculate_cycle "$CYCLE"; then
        SUCCESS_COUNT=$((SUCCESS_COUNT + 1))
    else
        FAILED_COUNT=$((FAILED_COUNT + 1))
        
        # If too many consecutive failures, pause longer
        if [ $((FAILED_COUNT % 5)) -eq 0 ]; then
            log ""
            log "⚠️  Warning: Multiple failures detected. Possible rate limiting."
            log "Waiting 60 seconds before continuing..."
            sleep 60
        fi
    fi
    
    # Show progress
    PROCESSED=$((SUCCESS_COUNT + FAILED_COUNT))
    log "  Progress: $PROCESSED/$TOTAL cycles processed ($SUCCESS_COUNT succeeded, $FAILED_COUNT failed)"
    
    # Rate limiting: wait between cycles
    if [ $COUNT -lt $TOTAL ]; then
        WAIT_TIME=2
        log "  Waiting ${WAIT_TIME}s before next cycle..."
        sleep $WAIT_TIME
    fi
done

log ""
log "=========================================="
log "Recalculation Complete!"
log "=========================================="
log ""
log "Summary:"
log "  Total cycles: $TOTAL"
log "  Skipped: $SKIPPED"
log "  Succeeded: $SUCCESS_COUNT"
log "  Failed: $FAILED_COUNT"
log ""
log "Files:"
log "  New data: $OUTPUT_DIR/dal_stats_history.json"
log "  Original: backend/data/dal_stats_history.json"
log "  Full log: $LOG_FILE"
log "  Progress: $PROGRESS_FILE"

if [ $FAILED_COUNT -gt 0 ]; then
    log "  Failed cycles: $FAILED_FILE"
    log ""
    log "⚠️  Some cycles failed. You can retry them with:"
    log "     while read cycle; do python3 backend/scripts/dal_calculation.py --network mainnet --output-dir $OUTPUT_DIR --cycle \$cycle; done < $FAILED_FILE"
fi

log ""
log "=========================================="
log "Next steps:"
log "=========================================="
log ""
log "1. Compare the results:"
log "   python3 backend/scripts/compare_recalculated.py"
log ""
log "2. If everything looks good, replace the data:"
log "   cp backend/data/dal_stats_history.json backend/data/dal_stats_history.backup_$(date +%Y%m%d_%H%M%S).json"
log "   cp $OUTPUT_DIR/dal_stats_history.json backend/data/dal_stats_history.json"
log ""
log "Done! 🎉"


