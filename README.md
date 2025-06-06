# Tezos DAL-o-meter Dashboard

This dashboard allows real-time visualization of the adoption statistics of the DAL (Data Availability Layer) protocol on the Tezos network.

## Metrics Explained

The dashboard displays four key metrics to measure DAL adoption:

### DAL Active Bakers
Shows the number and percentage of active bakers that have enabled the DAL protocol. 
Example: `63/295` means 63 out of 295 total bakers have activated DAL.

### Baking Power
Represents the percentage of total Tezos staking power controlled by bakers who have activated DAL. 

### DAL Participation
Calculated as: `(dal_active_bakers / (total_bakers - non_attesting_bakers)) * 100`
This measures the participation rate among active bakers who are making attestations.
It provides a more accurate view of participation by excluding inactive bakers.

### DAL Adoption
Calculated as: `((total_bakers - dal_inactive_bakers - unclassified_bakers - non_attesting_bakers) / total_bakers) * 100`
This represents the overall adoption rate of DAL among all bakers on the Tezos network.

## Project Structure

The project has been optimized with a clean separation of concerns:

```
/opt/dal_dashboard/
├── backend/              # Backend components
│   ├── scripts/          # Python scripts for data collection
│   │   ├── dal_calculation.py    # Main calculation script
│   │   └── update_dal_stats.sh   # Update script with Git integration
│   ├── data/             # Data files generated by the scripts
│   │   ├── dal_stats.json
│   │   └── dal_stats_history.json
│   └── requirements.txt  # Python dependencies
├── frontend/             # Next.js frontend application
│   ├── app/              # App router components
│   ├── public/           # Contains symlinks to the actual data
│   └── ...
├── logs/                 # Log files
└── crontab_setup.sh      # Script to set up automated updates
```

## How It Works

1. **Data Collection**: 
   - The `dal_calculation.py` script collects data from Tezos blockchain using TzKT API
   - It analyzes baker participation in the DAL protocol
   - Results are stored in JSON files in the `backend/data/` directory

2. **Data Presentation**:
   - The Next.js frontend reads data using symbolic links in the `public/` folder
   - It displays statistics using gauge charts and tables

3. **Automation**:
   - A cron job runs every 2 days to update the statistics
   - The `update_dal_stats.sh` script handles running the calculation and Git commits

## Setup Instructions

### Backend Setup

1. Install Python dependencies:
   ```bash
   cd /opt/dal_dashboard
   pip install -r backend/requirements.txt
   ```

2. Set up the cron job:
   ```bash
   ./crontab_setup.sh
   ```

### Frontend Setup

1. Install Node.js dependencies:
   ```bash
   cd /opt/dal_dashboard/frontend
   npm install
   ```

2. Run the development server:
   ```bash
   npm run dev
   ```

3. Build for production:
   ```bash
   npm run build
   ```

## API Endpoints

The dashboard provides RESTful API endpoints that return JSON data with CORS headers enabled:

### Current DAL Statistics

```
GET /api/stats
```

Returns the latest DAL statistics for the current cycle.

Example response:
```json
{
  "timestamp": "2025-04-22T15:07:38.442367",
  "cycle": 854,
  "total_bakers": 295,
  "dal_active_bakers": 63,
  "dal_inactive_bakers": 223,
  "unclassified_bakers": 3,
  "non_attesting_bakers": 6,
  "dal_baking_power_percentage": 27.61,
  "total_baking_power": 384748516960365,
  "dal_baking_power": 106247247736948,
  "dal_participation_percentage": 21.80,
  "dal_adoption_percentage": 21.36
}
```

### Historical DAL Statistics

```
GET /api/history
```

Returns the history of DAL statistics across multiple cycles.

Example response:
```json
[
  {
    "timestamp": "2025-04-22T15:07:38.442367",
    "cycle": 854,
    "dal_active_bakers": 63,
    "dal_baking_power_percentage": 27.61,
    "dal_participation_percentage": 21.80,
    "dal_adoption_percentage": 21.36
  },
  {
    "timestamp": "2023-04-17T10:15:32.123456",
    "cycle": 852,
    "dal_active_bakers": 62,
    "dal_baking_power_percentage": 28.10,
    "dal_participation_percentage": 27.60,
    "dal_adoption_percentage": 22.20
  }
  // ...more cycles
]
```

### Cycle-Specific Statistics

```
GET /api/cycle/[cycle]
```

Returns DAL statistics for a specific cycle.

Example: `/api/cycle/854`

All API endpoints include the following CORS headers:
- `Access-Control-Allow-Origin: *`
- `Access-Control-Allow-Methods: GET`
- `Cache-Control: max-age=3600`

## Manual Data Updates

To manually update the statistics:

```bash
cd /opt/dal_dashboard
./backend/scripts/update_dal_stats.sh
```

## Logs

All logs are stored in the `/opt/dal_dashboard/logs/` directory:
- `dal_update.log` - Update script logs
- `dal_stats.log` - Calculation script logs
