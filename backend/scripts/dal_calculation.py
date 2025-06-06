#!/usr/bin/env python3

import sys
import json
import logging
import argparse
import requests
import time
from concurrent.futures import ThreadPoolExecutor, as_completed
from typing import Dict, List, Tuple, Optional
from dataclasses import dataclass
from datetime import datetime, timedelta
from pathlib import Path
import os

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('logs/dal_stats.log'),
        logging.StreamHandler(sys.stdout)
    ]
)
logger = logging.getLogger(__name__)

# Define the path for storing results
DATA_DIR = Path("/opt/dal_dashboard/backend/data")

# Create argument parser to accept output directory
def parse_args():
    parser = argparse.ArgumentParser(description='Calculate DAL statistics for Tezos network')
    parser.add_argument('--network', type=str, default='mainnet', help='Network to analyze (default: mainnet)')
    parser.add_argument('--output-dir', type=str, help='Output directory for data files')
    return parser.parse_args()

@dataclass
class DALStats:
    """Data class representing DAL statistics for a cycle"""
    cycle: int
    timestamp: datetime
    total_bakers: int
    dal_active_bakers: int
    dal_inactive_bakers: int
    unclassified_bakers: int
    non_attesting_bakers: int
    dal_baking_power_percentage: float
    total_baking_power: float
    dal_baking_power: float
    # Extended attributes for historical tracking
    dal_participation_percentage: float = 0.0
    dal_adoption_percentage: float = 0.0

class DALCalculator:
    """Calculator for DAL statistics on Tezos network"""
    
    def __init__(self, network: str = "mainnet"):
        """
        Initialize the DAL calculator.
        
        Args:
            network: Tezos network to use (default: mainnet)
        """
        self.network = network
        self.rpc_url = f"https://rpc.tzkt.io/{network}"
        self.api_url = f"https://api.{network}.tzkt.io/v1"
        self.cache = {}
        self.cache_duration = timedelta(minutes=5)
        self._session = requests.Session()

    def _fetch_json(self, url: str) -> Optional[dict]:
        """
        Fetch JSON data from a URL with caching and rate limiting.
        
        Args:
            url: URL to fetch data from
            
        Returns:
            JSON response as dict or None if request failed
        """
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
        """
        Get the current Tezos cycle.
        
        Returns:
            Current cycle number
        """
        level_infos = self._fetch_json(f"{self.rpc_url}/chains/main/blocks/head/helpers/current_level")
        return level_infos["cycle"]

    def get_delegate_stake(self, delegate: Dict, cycle: int) -> float:
        """
        Get a delegate's stake for a given cycle.
        
        Args:
            delegate: Delegate information
            cycle: Cycle number
            
        Returns:
            Delegate's baking power
        """
        rights = self._fetch_json(f"{self.api_url}/rewards/bakers/{delegate['address']}?cycle={cycle}")
        if rights and rights[0]:
            return rights[0]["bakingPower"]
        return 0

    def check_dal_activation(self, delegate: Dict, cycle: int) -> Optional[bool]:
        """
        Check if a delegate has activated DAL.
        
        Args:
            delegate: Delegate information
            cycle: Cycle number
            
        Returns:
            True if DAL is activated, False if not, None if cannot determine
        """
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

    def process_delegate(self, delegate: Dict, cycle: int) -> Tuple[Dict, float, Optional[bool]]:
        """
        Process a delegate to get their stake and DAL status.
        
        Args:
            delegate: Delegate information
            cycle: Cycle number
            
        Returns:
            Tuple of (delegate info, stake, DAL status)
        """
        stake = self.get_delegate_stake(delegate, cycle)
        dal_status = self.check_dal_activation(delegate, cycle)
        return delegate, stake, dal_status

    def calculate_stats(self, verbose: bool = False) -> DALStats:
        """
        Calculate DAL statistics for the current cycle.
        
        Args:
            verbose: Whether to log verbose progress information
            
        Returns:
            DALStats object containing current statistics
        """
        cache_key = f"stats_{self.network}"
        if cache_key in self.cache:
            cached_stats, timestamp = self.cache[cache_key]
            if datetime.now() - timestamp < self.cache_duration:
                return cached_stats

        cycle = self.get_current_cycle()
        if verbose:
            logger.info(f"Processing cycle {cycle}")
            
        delegates = self._fetch_json(f"{self.api_url}/delegates?active=true&limit=10000")
        if not delegates:
            logger.error("Could not fetch delegates")
            raise RuntimeError("Failed to fetch delegates data")

        dal_active = 0
        dal_inactive = 0
        unclassified = 0
        non_attesting = 0
        total_stake = 0
        dal_stake = 0

        total_delegates = len(delegates)
        
        # Use ThreadPoolExecutor for parallel processing if not verbose
        if not verbose:
            with ThreadPoolExecutor(max_workers=10) as executor:
                futures = {
                    executor.submit(self.process_delegate, delegate, cycle): delegate
                    for delegate in delegates
                }

                for future in as_completed(futures):
                    delegate, stake, dal_status = future.result()
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
        else:
            # Process sequentially with verbose logging
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

        stats = DALStats(
            cycle=cycle,
            timestamp=datetime.now(),
            total_bakers=total_delegates,
            dal_active_bakers=dal_active,
            dal_inactive_bakers=dal_inactive,
            unclassified_bakers=unclassified,
            non_attesting_bakers=non_attesting,
            dal_baking_power_percentage=(dal_stake / total_stake * 100) if total_stake > 0 else 0,
            total_baking_power=total_stake,
            dal_baking_power=dal_stake,
            dal_participation_percentage=dal_participation,
            dal_adoption_percentage=dal_adoption
        )

        self.cache[cache_key] = (stats, datetime.now())
        
        if verbose:
            # Log results
            logger.info("=== Final Results ===")
            logger.info(f"{dal_active} bakers have activated their DAL node.")
            logger.info(f"{dal_inactive} bakers have NOT activated their DAL node.")
            logger.info(f"{unclassified} bakers cannot be classified.")
            logger.info(f"{non_attesting} bakers sent no attestations.")
            logger.info(f"DAL users represent {100 * dal_active/(dal_active + dal_inactive + unclassified + non_attesting):.2f}% of the total bakers.")
            logger.info(f"DAL users represent {dal_stake/1e6:.1f}M ꜩ / {total_stake/1e6:.1f}M = {100 * dal_stake/total_stake:.2f}% of the baking power.")
        
        return stats

def save_results_and_update_history(stats, results_file, history_file):
    """Save the results and update the history file"""
    # Convert DALStats object to dictionary
    results = {
        "timestamp": stats.timestamp.isoformat(),
        "cycle": stats.cycle,
        "total_bakers": stats.total_bakers,
        "dal_active_bakers": stats.dal_active_bakers,
        "dal_inactive_bakers": stats.dal_inactive_bakers,
        "unclassified_bakers": stats.unclassified_bakers,
        "non_attesting_bakers": stats.non_attesting_bakers,
        "dal_baking_power_percentage": stats.dal_baking_power_percentage,
        "total_baking_power": stats.total_baking_power,
        "dal_baking_power": stats.dal_baking_power,
        "dal_participation_percentage": stats.dal_participation_percentage,
        "dal_adoption_percentage": stats.dal_adoption_percentage
    }
    
    # Save results to data directory
    results_file.parent.mkdir(parents=True, exist_ok=True)
    with open(results_file, 'w') as f:
        json.dump(results, f, indent=2)
        
    # Update history file - first load existing history
    history = []
    if history_file.exists():
        try:
            with open(history_file, 'r') as f:
                history = json.load(f)
        except json.JSONDecodeError:
            logger.error("Error reading history file. Creating new one.")
            history = []
    
    # Check if this cycle is already in history
    cycle_exists = False
    for entry in history:
        if entry.get("cycle") == stats.cycle:
            # Update existing entry
            entry.update({
                "timestamp": results["timestamp"],
                "dal_active_bakers": stats.dal_active_bakers,
                "dal_baking_power_percentage": stats.dal_baking_power_percentage,
                "dal_participation_percentage": stats.dal_participation_percentage,
                "dal_adoption_percentage": stats.dal_adoption_percentage
            })
            cycle_exists = True
            break
    
    # If cycle doesn't exist, add new entry
    if not cycle_exists:
        history.append({
            "timestamp": results["timestamp"],
            "cycle": stats.cycle,
            "dal_active_bakers": stats.dal_active_bakers,
            "dal_baking_power_percentage": stats.dal_baking_power_percentage,
            "dal_participation_percentage": stats.dal_participation_percentage,
            "dal_adoption_percentage": stats.dal_adoption_percentage
        })
    
    # Sort history by cycle (descending)
    history.sort(key=lambda x: x["cycle"], reverse=True)
    
    # Save updated history
    with open(history_file, 'w') as f:
        json.dump(history, f, indent=2)

    logger.info(f"Results saved to {results_file}")
    logger.info(f"History updated in {history_file}")

def main():
    # Parse command line arguments
    args = parse_args()
    
    # Initialize paths
    if args.output_dir:
        data_dir = Path(args.output_dir)
    else:
        data_dir = DATA_DIR
    
    results_file = data_dir / "dal_stats.json"
    history_file = data_dir / "dal_stats_history.json"
    
    # Initialize the calculator
    calculator = DALCalculator(network=args.network)
    
    try:
        # Calculate stats with verbose output
        stats = calculator.calculate_stats(verbose=True)
        
        # Save results and update history
        save_results_and_update_history(stats, results_file, history_file)
    except Exception as e:
        logger.error(f"Error calculating DAL stats: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
