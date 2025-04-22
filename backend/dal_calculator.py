import requests
import logging
from concurrent.futures import ThreadPoolExecutor, as_completed
from typing import Dict, List, Tuple, Optional
from dataclasses import dataclass
from datetime import datetime, timedelta

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

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
        Fetch JSON data from a URL with caching.
        
        Args:
            url: URL to fetch data from
            
        Returns:
            JSON response as dict or None if request failed
        """
        try:
            response = self._session.get(url, timeout=10)
            response.raise_for_status()
            return response.json()
        except Exception as e:
            logger.error(f"Error fetching data from {url}: {e}")
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

    def calculate_stats(self) -> DALStats:
        """
        Calculate DAL statistics for the current cycle.
        
        Returns:
            DALStats object containing current statistics
        """
        cache_key = f"stats_{self.network}"
        if cache_key in self.cache:
            cached_stats, timestamp = self.cache[cache_key]
            if datetime.now() - timestamp < self.cache_duration:
                return cached_stats

        cycle = self.get_current_cycle()
        delegates = self._fetch_json(f"{self.api_url}/delegates?active=true&limit=10000")

        with ThreadPoolExecutor(max_workers=10) as executor:
            futures = {
                executor.submit(self.process_delegate, delegate, cycle): delegate
                for delegate in delegates
            }

            dal_active = 0
            dal_inactive = 0
            unclassified = 0
            non_attesting = 0
            total_stake = 0
            dal_stake = 0

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

        stats = DALStats(
            cycle=cycle,
            timestamp=datetime.now(),
            total_bakers=len(delegates),
            dal_active_bakers=dal_active,
            dal_inactive_bakers=dal_inactive,
            unclassified_bakers=unclassified,
            non_attesting_bakers=non_attesting,
            dal_baking_power_percentage=(dal_stake / total_stake * 100) if total_stake > 0 else 0,
            total_baking_power=total_stake,
            dal_baking_power=dal_stake
        )

        self.cache[cache_key] = (stats, datetime.now())
        return stats 