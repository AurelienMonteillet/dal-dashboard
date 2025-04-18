# Tezos DAL-o-meter Dashboard

This dashboard allows real-time visualization of the adoption statistics of the DAL (Data Availability Layer) protocol on the Tezos network.

## Features

- Display of the current cycle
- Number of bakers who have activated/deactivated DAL
- Percentage of total bakers using DAL
- Percentage of baking power represented by DAL users
- Automatic data updates
- Modern and responsive user interface

## Prerequisites

- Python 3.8+
- Node.js 16+
- npm or yarn

## Installation

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

## Launching the Application

1. Start the backend:
```bash
uvicorn app.main:app --reload
```

2. In another terminal, start the frontend:
```bash
cd frontend
npm run dev
```

3. Access the dashboard in your browser at: http://localhost:3000

## Architecture

### Backend
- `app/` : FastAPI backend code
  - `main.py` : Application entry point and API endpoints
  - `dal_calculator.py` : Module for calculating DAL statistics
  - `scheduler.py` : Manager for periodic updates
  
### Frontend
- `frontend/` : Next.js application (React framework)
  - `app/` : Application components and pages
  - `public/` : Static assets
  - `src/types/` : TypeScript type definitions
  
### Data Flow
1. The Python script `dal_calculation.py` collects data from the Tezos blockchain using the TzKT API
2. The statistics are calculated and stored in JSON format
3. The FastAPI backend provides these statistics through RESTful endpoints
4. The Next.js frontend fetches and displays the data using React components

### Components
- `SimpleDalGauge`: A custom gauge component to visually display percentages and statistics
- Main dashboard page: Aggregates multiple gauges to provide an overview of DAL adoption

## Data Updates

The application automatically updates data through:
- A cron job configured in `crontab_setup.sh`
- Data is stored in the `data/` directory
- Logs are available in the `logs/` directory

## Optimizations

- Data caching with configurable validity duration
- Parallelized requests for TzKT API calls
- Rate limiting for API requests
- Configurable automatic updates (default every 5 minutes)

## Contributing

Contributions are welcome! Feel free to open an issue or pull request.
