# Tezos DAL-o-meter Dashboard

This dashboard allows real-time visualization of the adoption statistics of the DAL (Data Availability Layer) protocol on the Tezos network.

## Features

- Display of the current cycle
- Number of bakers who have activated/deactivated DAL
- Percentage of total bakers using DAL
- Percentage of baking power represented by DAL users
- Automatic data updates every 2 days
- Modern and responsive user interface

## Project Architecture

### Simplified Architecture
This project uses a serverless approach:
- A Python script collects and calculates DAL statistics every 2 days
- The data is stored as a static JSON file hosted on GitHub Pages
- A Next.js frontend fetches and displays this data
- No permanent backend is needed

### Data Flow
1. A cron job runs `dal_calculation.py` every 2 days
2. The script collects data from Tezos blockchain using TzKT API
3. Statistics are calculated and saved to both `data/` directory and `docs/` directory
4. The JSON file in `docs/` is automatically pushed to GitHub
5. GitHub Pages serves the static JSON file
6. The Next.js frontend fetches and visualizes the data

## Prerequisites

- Python 3.8+
- Node.js 16+
- npm or yarn
- Git

## Local Development Setup

1. Clone the repository:
```bash
git clone <repository_url>
cd dal_dashboard
```

2. Create and activate a Python virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Linux/Mac
# or
.\venv\Scripts\activate  # On Windows
```

3. Install Python dependencies:
```bash
pip install -r requirements.txt
```

4. Install frontend dependencies:
```bash
cd frontend
npm install
```

## Configuration

1. Copy the `.env.example` file to `.env`:
```bash
cp .env.example .env
```

2. Modify environment variables if necessary in the `.env` file

## Running Locally

### Generate DAL Statistics
```bash
python dal_calculation.py --network mainnet
```
This creates JSON files in both the `data/` and `docs/` directories.

### Start the frontend:
```bash
cd frontend
npm run dev
```

Access the dashboard in your browser at: http://localhost:3000

## Deployment

### Data Generation & GitHub Pages

The project is configured to:
1. Generate DAL statistics every 2 days via a cron job
2. Save the data directly to both `data/` and `docs/` directories
3. Push the updated data to GitHub
4. Serve the data via GitHub Pages at:
   https://aurelienmonteillet.github.io/dal-dashboard/dal_stats.json

To set up the cron job on your server:
```bash
crontab -e
```
Add:
```
0 0 */2 * * cd /opt/dal_dashboard && source venv/bin/activate && python dal_calculation.py --network mainnet && git add docs/dal_stats.json && git commit -m "Update DAL stats $(date +\%Y-\%m-\%d)" && git push origin main >> logs/dal_update.log 2>&1
```

Note: The script now saves directly to the `docs/` directory, so no manual copying is needed.

### Frontend Deployment

The frontend is deployed on Vercel:
1. Connect your GitHub repository to Vercel
2. Configure it to use the `frontend` directory as the root
3. Add the environment variable:
   - `NEXT_PUBLIC_JSON_URL` = `https://aurelienmonteillet.github.io/dal-dashboard/dal_stats.json`

## Project Structure

- `dal_calculation.py`: Script that fetches and calculates DAL statistics
- `data/`: Directory where generated JSON is stored locally
- `docs/`: Directory for GitHub Pages (contains the published JSON)
- `frontend/`: Next.js application
  - `app/components/SimpleDalGauge.tsx`: Custom gauge component
  - `app/page.tsx`: Main dashboard page

## Contributing

Contributions are welcome! Feel free to open an issue or pull request.
