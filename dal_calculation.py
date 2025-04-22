#!/usr/bin/env python3

import sys
import json
import requests
import logging
import argparse
import time
import os
from typing import Dict, Optional, List
from datetime import datetime
from pathlib import Path

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('dal_stats.log'),
        logging.StreamHandler(sys.stdout)
    ]
)
logger = logging.getLogger(__name__)

# Define the path for storing results
DATA_DIR = Path("/opt/dal_dashboard/data")
DOCS_DIR = Path("/opt/dal_dashboard/docs")
RESULTS_FILE_DATA = DATA_DIR / "dal_stats.json"
RESULTS_FILE_DOCS = DOCS_DIR / "dal_stats.json"
HISTORY_FILE_DATA = DATA_DIR / "dal_stats_history.json"
HISTORY_FILE_DOCS = DOCS_DIR / "dal_stats_history.json"

class DALCalculator:
    def __init__(self, network: str = "mainnet"):
        self.network = network
        self.rpc_url = f"https://rpc.tzkt.io/{network}"
        self.api_url = f"https://api.{network}.tzkt.io/v1"
        self._session = requests.Session()

    def _fetch_json(self, url: str) -> Optional[dict]:
        """Fetch JSON data from a URL with rate limiting."""
        try:
            response = self._session.get(url, timeout=10)
            response.raise_for_status()
            # Add a small delay between requests to avoid rate limiting
            time.sleep(0.5)
            return response.json()
        except Exception as e:
            logger.error(f"Error fetching data from {url}: {e}")
            # Add a longer delay if we hit an error (might be rate limiting)
            time.sleep(2)
            return None

    def get_current_cycle(self) -> int:
        """Get the current Tezos cycle."""
        level_infos = self._fetch_json(f"{self.rpc_url}/chains/main/blocks/head/helpers/current_level")
        return level_infos["cycle"]

    def get_delegate_stake(self, delegate: Dict, cycle: int) -> float:
        """Get a delegate's stake for a given cycle."""
        rights = self._fetch_json(f"{self.api_url}/rewards/bakers/{delegate['address']}?cycle={cycle}")
        if rights and rights[0]:
            return rights[0]["bakingPower"]
        return 0

    def check_dal_activation(self, delegate: Dict, cycle: int) -> Optional[bool]:
        """Check if a delegate has activated DAL."""
        rights = self._fetch_json(
            f"{self.api_url}/rights?cycle={cycle}&baker={delegate['address']}&status=realized&limit=300&type=endorsing"
        )
        if not rights:
            return None

        for endorsement in rights[:300]:
            try:
                attestation_rights = self._fetch_json(
                    f"{self.rpc_url}/chains/main/blocks/{endorsement['level'] - 1}/helpers/attestation_rights?delegate={delegate['address']}"
                )
                if attestation_rights[0]["delegates"][0]["first_slot"] < 512:
                    block_data = self._fetch_json(f"{self.rpc_url}/chains/main/blocks/{endorsement['level']}")
                    for op in block_data["operations"][0]:
                        if op["contents"][0]["metadata"]["delegate"] == delegate["address"]:
                            return op["contents"][0]["kind"] == "attestation_with_dal"
            except Exception as e:
                logger.debug(f"Could not verify attestation for {delegate['address']}: {e}")
        return None

    def process_delegate(self, delegate: Dict, cycle: int) -> tuple[Dict, float, Optional[bool]]:
        """Process a delegate to get their stake and DAL status."""
        stake = self.get_delegate_stake(delegate, cycle)
        dal_status = self.check_dal_activation(delegate, cycle)
        return delegate, stake, dal_status

    def calculate_stats(self):
        """Calculate and display DAL statistics."""
        cycle = self.get_current_cycle()
        logger.info(f"Processing cycle {cycle}")
        
        delegates = self._fetch_json(f"{self.api_url}/delegates?active=true&limit=10000")
        if not delegates:
            logger.error("Could not fetch delegates")
            return

        dal_active = 0
        dal_inactive = 0
        unclassified = 0
        non_attesting = 0
        total_stake = 0
        dal_stake = 0

        total_delegates = len(delegates)
        for i, delegate in enumerate(delegates, 1):
            logger.info(f"Processing delegate {i}/{total_delegates}: {delegate['address']}")
            delegate_info, stake, dal_status = self.process_delegate(delegate, cycle)
            total_stake += stake

            if dal_status is None and stake == 0:
                non_attesting += 1
            elif dal_status is None:
                unclassified += 1
            elif dal_status:
                dal_active += 1
                dal_stake += stake
            else:
                dal_inactive += 1

        # Calculate DAL participation percentage
        non_attesting_count = total_delegates - non_attesting
        dal_participation = (dal_active / non_attesting_count * 100) if non_attesting_count > 0 else 0
        
        # Calculate DAL adoption percentage
        dal_adoption = ((total_delegates - dal_inactive - unclassified - non_attesting) / total_delegates * 100) if total_delegates > 0 else 0
        
        # Prepare results
        results = {
            "timestamp": datetime.now().isoformat(),
            "cycle": cycle,
            "total_bakers": total_delegates,
            "dal_active_bakers": dal_active,
            "dal_inactive_bakers": dal_inactive,
            "unclassified_bakers": unclassified,
            "non_attesting_bakers": non_attesting,
            "dal_baking_power_percentage": (100 * dal_stake/total_stake) if total_stake > 0 else 0,
            "total_baking_power": total_stake,
            "dal_baking_power": dal_stake,
            "dal_participation_percentage": dal_participation,
            "dal_adoption_percentage": dal_adoption
        }

        # Save results to data directory
        DATA_DIR.mkdir(parents=True, exist_ok=True)
        with open(RESULTS_FILE_DATA, 'w') as f:
            json.dump(results, f, indent=2)
        
        # Save results to docs directory for GitHub Pages
        DOCS_DIR.mkdir(parents=True, exist_ok=True)
        with open(RESULTS_FILE_DOCS, 'w') as f:
            json.dump(results, f, indent=2)
            
        # Update history file - first load existing history
        history = []
        if HISTORY_FILE_DATA.exists():
            try:
                with open(HISTORY_FILE_DATA, 'r') as f:
                    history = json.load(f)
            except json.JSONDecodeError:
                logger.error("Error reading history file. Creating new one.")
                history = []
        
        # Check if this cycle is already in history
        cycle_exists = False
        for entry in history:
            if entry.get("cycle") == cycle:
                # Update existing entry
                entry.update({
                    "timestamp": results["timestamp"],
                    "dal_active_bakers": results["dal_active_bakers"],
                    "dal_baking_power_percentage": results["dal_baking_power_percentage"],
                    "dal_participation_percentage": results["dal_participation_percentage"],
                    "dal_adoption_percentage": results["dal_adoption_percentage"]
                })
                cycle_exists = True
                break
        
        # If cycle doesn't exist, add new entry
        if not cycle_exists:
            history.append({
                "timestamp": results["timestamp"],
                "cycle": cycle,
                "dal_active_bakers": results["dal_active_bakers"],
                "dal_baking_power_percentage": results["dal_baking_power_percentage"],
                "dal_participation_percentage": results["dal_participation_percentage"],
                "dal_adoption_percentage": results["dal_adoption_percentage"]
            })
        
        # Sort history by cycle (descending)
        history.sort(key=lambda x: x["cycle"], reverse=True)
        
        # Save updated history to both locations
        with open(HISTORY_FILE_DATA, 'w') as f:
            json.dump(history, f, indent=2)
            
        with open(HISTORY_FILE_DOCS, 'w') as f:
            json.dump(history, f, indent=2)

        # Log results
        logger.info("=== Final Results ===")
        logger.info(f"{dal_active} bakers have activated their DAL node.")
        logger.info(f"{dal_inactive} bakers have NOT activated their DAL node.")
        logger.info(f"{unclassified} bakers cannot be classified.")
        logger.info(f"{non_attesting} bakers sent no attestations.")
        logger.info(f"DAL users represent {100 * dal_active/(dal_active + dal_inactive + unclassified + non_attesting):.2f}% of the total bakers.")
        logger.info(f"DAL users represent {dal_stake/1e6:.1f}M ꜩ / {total_stake/1e6:.1f}M = {100 * dal_stake/total_stake:.2f}% of the baking power.")
        logger.info(f"Results saved to {RESULTS_FILE_DATA} and {RESULTS_FILE_DOCS}")
        logger.info(f"History updated in {HISTORY_FILE_DATA} and {HISTORY_FILE_DOCS}")

def main():
    parser = argparse.ArgumentParser(description='Calculate DAL statistics for Tezos network')
    parser.add_argument('--network', type=str, default='mainnet', help='Network to analyze (default: mainnet)')
    args = parser.parse_args()

    calculator = DALCalculator(network=args.network)
    calculator.calculate_stats()

if __name__ == "__main__":
    main()
