# Tezos DAL-O-Meter Dashboard

Real-time visualization of DAL (Data Availability Layer) adoption statistics on the Tezos network.

## Detection Method

The dashboard uses the Tezos RPC endpoint `dal_participation` to detect bakers with DAL activated.

A baker is considered DAL-active if `delegate_attested_dal_slots > 0` at the cycle's last level. This method measures actual DAL slot attestation, ensuring only functional DAL nodes are counted.

## Metrics

- **DAL Active Bakers** -- Number and percentage of bakers actively using DAL
- **Baking Power** -- Percentage of total baking power from DAL-active bakers
- **DAL Participation** -- Participation rate among attesting bakers
- **DAL Adoption** -- Overall DAL adoption rate across all bakers

## Project Structure

```
dal-dashboard/
├── backend/
│   ├── scripts/
│   │   ├── dal_calculation.py      # Main calculation script
│   │   └── update_dal_stats.sh     # Update script with Git integration
│   ├── data/
│   │   ├── dal_stats.json
│   │   └── dal_stats_history.json
│   └── requirements.txt
├── frontend/                       # Next.js application
│   ├── app/
│   ├── public/
│   └── ...
├── logs/
└── crontab_setup.sh
```

## How It Works

1. `dal_calculation.py` queries TzKT API and the `dal_participation` RPC endpoint to determine each baker's DAL status
2. The Next.js frontend displays statistics with gauge charts and history tables
3. A cron job runs hourly to update statistics automatically

See `backend/scripts/README.md` for detailed technical documentation.

## Setup

### Backend

```bash
pip install -r backend/requirements.txt
./crontab_setup.sh
```

### Frontend

```bash
cd frontend
npm install
npm run dev       # development
npm run build     # production
```

## API

All endpoints return JSON with CORS enabled (`Access-Control-Allow-Origin: *`).

### GET /api/stats

Returns the latest DAL statistics for the current cycle.

```json
{
  "timestamp": "2025-04-22T15:07:38.442367",
  "cycle": 854,
  "total_bakers": 295,
  "dal_active_bakers": 63,
  "dal_inactive_bakers": 223,
  "dal_baking_power_percentage": 27.61,
  "dal_participation_percentage": 21.80,
  "dal_adoption_percentage": 21.36
}
```

### GET /api/history

Returns DAL statistics across multiple cycles.

### GET /api/cycle/[cycle]

Returns DAL statistics for a specific cycle.

## Manual Update

```bash
./backend/scripts/update_dal_stats.sh
```

## Logs

- `logs/dal_update.log` -- Update script logs
- `backend/logs/dal_stats.log` -- Calculation script logs

## References

- [TzKT API](https://api.tzkt.io/)
- [Tezos RPC](https://tezos.gitlab.io/active/rpc.html)
- `backend/scripts/README.md` -- Backend technical documentation
