import json
import os
import time
import requests
import logging
import shutil
from datetime import datetime
from pathlib import Path
import sys

class DalChecker:
    def __init__(self):
        self.config = self._load_config()
        self._setup_logging()
        self.output_path = self._get_output_path()
        self.backup_path = self._get_backup_path()
        self.api_base = self.config['tezos']['api_base']
        self.bootstrap_url = self.config['dal']['bootstrap_url']
        self.rate_limit_delay = self.config['dal']['rate_limit_delay']

    def _setup_logging(self):
        """Setup logging configuration"""
        log_path = Path(self.config['logging']['file'])
        log_path.parent.mkdir(parents=True, exist_ok=True)
        
        logging.basicConfig(
            level=self.config['logging']['level'],
            format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
            handlers=[
                logging.FileHandler(log_path),
                logging.StreamHandler(sys.stdout)
            ]
        )
        self.logger = logging.getLogger(__name__)

    def _load_config(self):
        """Load configuration from config.json"""
        config_path = Path(__file__).parent.parent / 'config' / 'config.json'
        try:
            with open(config_path, 'r') as f:
                return json.load(f)
        except FileNotFoundError:
            raise Exception("Configuration file not found. Please create config.json based on config.example.json")
        except json.JSONDecodeError:
            raise Exception("Invalid configuration file format")

    def _get_output_path(self):
        """Get the full path for the output file"""
        return Path(__file__).parent.parent / self.config['output']['json_path'].lstrip('./')

    def _get_backup_path(self):
        """Get the full path for backup directory"""
        return Path(__file__).parent.parent / self.config['output']['backup_path'].lstrip('./')

    def _ensure_directories(self):
        """Create necessary directories if they don't exist"""
        self.output_path.parent.mkdir(parents=True, exist_ok=True)
        self.backup_path.mkdir(parents=True, exist_ok=True)

    def _create_backup(self):
        """Create a backup of the current status file"""
        if not self.output_path.exists():
            return

        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        backup_file = self.backup_path / f"dal_status_{timestamp}.json"
        
        try:
            shutil.copy2(self.output_path, backup_file)
            self.logger.info(f"Created backup: {backup_file}")
        except Exception as e:
            self.logger.error(f"Failed to create backup: {e}")

    def get_all_bakers(self):
        """Récupère la liste de tous les bakers actifs depuis l'API Tezos"""
        try:
            url = f"{self.api_base}/delegates?active=true"
            response = requests.get(url, timeout=30)
            response.raise_for_status()
            bakers = response.json()
            baker_addresses = [baker['address'] for baker in bakers]
            self.logger.info(f"Récupéré {len(baker_addresses)} bakers actifs")
            return baker_addresses
        except Exception as e:
            self.logger.error(f"Erreur lors de la récupération des bakers: {e}")
            return []

    def is_baker_dal_online_prometheus(self, address):
        """Récupère la liste des bakers online via Prometheus en une seule requête"""
        url = f'{self.bootstrap_url}/api/v1/query?query=sum_over_time(tezt_dal_commitments_attested{{attester="{address}"}}[24h])'
        try:
            resp = requests.get(url, timeout=10)
            resp.raise_for_status()
            data = resp.json()
            result = data.get('data', {}).get('result', [])
            if result and float(result[0]['value'][1]) > 0:
                self.logger.info(f"✅ Attestation DAL sur 24h trouvée pour {address}.")
                return True
            self.logger.info(f"❌ Aucune attestation DAL sur 24h pour {address}.")
            return False
        except Exception as e:
            self.logger.error(f"Erreur Prometheus 24h pour {address} : {e}")
            return None

    def save_status(self, data):
        """Save the data to JSON file with error handling"""
        if data is None:
            self.logger.error("No data to save")
            return

        output_data = {
            "timestamp": datetime.now().isoformat(),
            "data": data
        }

        try:
            self._ensure_directories()
            self._create_backup()
            
            # Write to temporary file first
            temp_path = self.output_path.with_suffix('.tmp')
            with open(temp_path, 'w') as f:
                json.dump(output_data, f, indent=2)
            
            # Atomic rename
            temp_path.replace(self.output_path)
            self.logger.info(f"Successfully saved status to {self.output_path}")
        except Exception as e:
            self.logger.error(f"Failed to save status: {e}")
            raise

    def run(self):
        """Run the DAL status check avec la nouvelle logique"""
        self.logger.info(f"Starting DAL status check at {datetime.now().isoformat()}")
        try:
            baker_addresses = self.get_all_bakers()
            if not baker_addresses:
                self.logger.error("Aucun baker trouvé")
                return
            results = {}
            now = datetime.now().isoformat()
            for address in baker_addresses:
                self.logger.info(f"Vérification de {address}")
                is_online = self.is_baker_dal_online_prometheus(address)
                results[address] = {
                    "online": is_online if is_online is not None else False,
                    "last_checked": now
                }
                time.sleep(self.rate_limit_delay)
            self.save_status(results)
            self.logger.info("Status check completed successfully")
        except Exception as e:
            self.logger.error(f"Fatal error during status check: {e}")
            raise

def main():
    try:
        checker = DalChecker()
        checker.run()
    except Exception as e:
        logging.error(f"Script failed: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main() 