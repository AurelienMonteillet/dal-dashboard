# Tezos DAL-o-meter Frontend

This is the frontend for the Tezos DAL-o-meter dashboard, built with Next.js. It displays real-time statistics about the Data Availability Layer (DAL) on the Tezos network, including active bakers, baking power, participation, and adoption rates.

## Features

- Real-time DAL statistics visualization with semi-circular gauges
- Historical data by cycle in a tabular format
- Responsive design for desktop and mobile viewing
- Automatic data refresh (hourly)
- Manual history loading option for debugging

## Project Structure

The frontend is organized as follows:

- `app/` - Main app directory (used for Vercel deployment)
  - `page.tsx` - The main page component with the dashboard
  - `layout.tsx` - The root layout component
  - `globals.css` - Global CSS styles
  - `components/` - React components
    - `SimpleDalGauge.tsx` - SVG-based gauge component for DAL statistics

- `public/` - Static files
  - `dal_stats_history.json` - Backup for historical DAL data

## Local Development

To run the frontend locally:

```bash
# Install dependencies
npm install

# Start the development server
npm run dev
```

The app will be available at http://localhost:3000.

## Deployment on Vercel

This frontend is designed to be deployed on Vercel. When deploying:

1. Connect your GitHub repository to Vercel
2. Configure the build settings:
   - Framework: Next.js
   - Root directory: `frontend`
   - Build Command: `npm run build`

3. Add the following environment variables:
   - `NEXT_PUBLIC_JSON_URL` = `https://aurelienmonteillet.github.io/dal-dashboard/dal_stats.json`
   - `NEXT_PUBLIC_HISTORY_URL` = `https://aurelienmonteillet.github.io/dal-dashboard/dal_stats_history.json`

## Data Source

The dashboard fetches data from two main sources:

1. **Current statistics**: A static JSON file hosted on GitHub Pages updated regularly
2. **Historical data**: A JSON file containing DAL statistics history by cycle

Both data sources are updated by a cron job that runs every few days, calculating DAL statistics for the Tezos network.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
