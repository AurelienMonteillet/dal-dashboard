'use client';

import React, { useEffect, useState } from 'react';

// Interface for DAL statistics
interface DALStats {
  timestamp: string;
  cycle: number;
  total_bakers: number;
  dal_active_bakers: number;
  dal_inactive_bakers: number;
  unclassified_bakers: number;
  non_attesting_bakers: number;
  dal_baking_power_percentage: number;
  total_baking_power: number;
  dal_baking_power: number;
}

// Interface for history entries
interface HistoryEntry {
  timestamp: string;
  cycle: number;
  dal_active_bakers: number;
  dal_baking_power_percentage: number;
  dal_participation_percentage: number;
  dal_adoption_percentage: number;
}

// URL of the JSON file hosted on GitHub Pages
const JSON_URL = process.env.NEXT_PUBLIC_JSON_URL || 'https://aurelienmonteillet.github.io/dal-dashboard/dal_stats.json';
const HISTORY_URL = process.env.NEXT_PUBLIC_HISTORY_URL || 'https://aurelienmonteillet.github.io/dal-dashboard/dal_stats_history.json';

/**
 * Fetches DAL statistics from the JSON hosted on GitHub Pages
 */
async function fetchDalStats(): Promise<DALStats> {
  try {
    const response = await fetch(JSON_URL, {
      // Necessary to avoid caching the response
      cache: 'no-store',
      next: { revalidate: 3600 } // Revalidate every hour
    });

    if (!response.ok) {
      throw new Error(`Network response was not ok: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching DAL stats:', error);
    throw error;
  }
}

/**
 * Fetches DAL statistics history
 */
async function fetchDalHistory(): Promise<HistoryEntry[]> {
  try {
    console.log("Attempting to load history from:", HISTORY_URL);
    const response = await fetch(HISTORY_URL, {
      cache: 'no-store',
      next: { revalidate: 3600 }
    });

    if (!response.ok) {
      throw new Error(`Network response was not ok: ${response.status}`);
    }

    const data = await response.json();
    console.log("Historical data loaded successfully:", data);
    return data;
  } catch (error) {
    console.error('Error loading from GitHub Pages:', error);
    console.log("Attempting to load from public folder...");

    // Try to load from the public folder
    try {
      const response = await fetch('/dal_stats_history.json', {
        cache: 'no-store'
      });

      if (!response.ok) {
        throw new Error(`Local loading failed: ${response.status}`);
      }

      const data = await response.json();
      console.log("Historical data loaded from public folder:", data);
      return data;
    } catch (localError) {
      console.error('Local loading failed:', localError);
      return []; // Return an empty array in case of error
    }
  }
}

// Component to display a simple gauge
const SimpleDalGauge: React.FC<{ value: number; label: string; description: string; maxValue?: number }> =
  ({ value, label, description, maxValue = 100 }) => {
    const percentage = Math.round((value / maxValue) * 100);

    return (
      <div style={{
        width: '25%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        boxSizing: 'border-box',
        padding: '0 10px'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '10px' }}>
          <span style={{ color: 'white', fontSize: '20px', fontWeight: 'bold' }}>{label}</span>
        </div>

        {/* SVG gauge container */}
        <svg width="150" height="90" viewBox="0 0 100 60">
          {/* Gray background semi-circle */}
          <path
            d="M 10,50 A 40,40 0 0,1 90,50"
            fill="none"
            stroke="#2a2d34"
            strokeWidth="8"
            strokeLinecap="round"
          />

          {/* Blue segment showing progress */}
          {percentage > 0 && (
            <path
              id="progressArc"
              fill="none"
              stroke="#3B82F6"
              strokeWidth="8"
              strokeDasharray={`${percentage * 1.26}, 126`}
              strokeLinecap="round"
              d="M 10,50 A 40,40 0 0,1 90,50"
            />
          )}
        </svg>

        <div style={{ textAlign: 'center', marginTop: '10px' }}>
          <span style={{ color: 'white', fontSize: '14px', opacity: '0.8' }}>{description}</span>
        </div>
      </div>
    );
  };

// Component to display the history table
const HistoryTable: React.FC<{ history: HistoryEntry[] }> = ({ history }) => {
  if (!history || history.length === 0) {
    return <div style={{ color: 'white', textAlign: 'center', padding: '20px' }}>No historical data available.</div>;
  }

  return (
    <div style={{ overflowX: 'auto', marginTop: '4rem' }}>
      <h2 style={{ color: 'white', fontSize: '24px', marginBottom: '20px', textAlign: 'center' }}>Historical data by cycle</h2>
      <table style={{ width: '100%', borderCollapse: 'collapse', color: 'white' }}>
        <thead>
          <tr style={{ borderBottom: '1px solid #444', textAlign: 'left' }}>
            <th style={{ padding: '10px', textAlign: 'center' }}>Cycle</th>
            <th style={{ padding: '10px', textAlign: 'center' }}>Date</th>
            <th style={{ padding: '10px', textAlign: 'center' }}>Active DAL Bakers</th>
            <th style={{ padding: '10px', textAlign: 'center' }}>Baking Power (%)</th>
            <th style={{ padding: '10px', textAlign: 'center' }}>DAL Participation (%)</th>
            <th style={{ padding: '10px', textAlign: 'center' }}>DAL Adoption (%)</th>
          </tr>
        </thead>
        <tbody>
          {history.map((entry) => (
            <tr key={entry.cycle} style={{ borderBottom: '1px solid #333' }}>
              <td style={{ padding: '10px', textAlign: 'center' }}>{entry.cycle}</td>
              <td style={{ padding: '10px', textAlign: 'center' }}>{new Date(entry.timestamp).toLocaleDateString()}</td>
              <td style={{ padding: '10px', textAlign: 'center' }}>{entry.dal_active_bakers}</td>
              <td style={{ padding: '10px', textAlign: 'center' }}>{entry.dal_baking_power_percentage.toFixed(1)}%</td>
              <td style={{ padding: '10px', textAlign: 'center' }}>{entry.dal_participation_percentage.toFixed(1)}%</td>
              <td style={{ padding: '10px', textAlign: 'center' }}>{entry.dal_adoption_percentage.toFixed(1)}%</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default function Home() {
  // State to store DAL data
  const [stats, setStats] = useState<DALStats | null>(null);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [debug, setDebug] = useState<string>("");

  // Function to manually load historical data
  const loadHistoryManually = async () => {
    try {
      setDebug("Loading directly from /dal_stats_history.json...");
      const response = await fetch('/dal_stats_history.json');
      if (!response.ok) {
        setDebug(debug + "\nLoading failed: " + response.status);
        return;
      }
      const data = await response.json();
      setDebug(debug + "\nData loaded: " + JSON.stringify(data).substring(0, 100) + "...");
      setHistory(data);
    } catch (err) {
      setDebug(debug + "\nError: " + (err instanceof Error ? err.message : String(err)));
    }
  };

  // Fetch data when the page loads
  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        console.log("Loading data...");

        // Load both data sets in parallel
        const [dataStats, dataHistory] = await Promise.all([
          fetchDalStats(),
          fetchDalHistory()
        ]);

        console.log("Stats loaded:", dataStats);
        console.log("History loaded, length:", dataHistory?.length, "data:", dataHistory);

        setStats(dataStats);
        setHistory(dataHistory);
        setError(null);
      } catch (err) {
        console.error('Error loading DAL stats:', err);
        setError('Unable to load DAL statistics');
      } finally {
        setLoading(false);
      }
    }

    loadData();

    // Refresh data every hour
    const intervalId = setInterval(loadData, 60 * 60 * 1000);

    // Clean up the interval when the component unmounts
    return () => clearInterval(intervalId);
  }, []);

  // Calculate percentages with protection against division by zero
  const calculateParticipationPercentage = () => {
    if (!stats) return 0;
    const nonAttestingCount = stats.total_bakers - stats.non_attesting_bakers;
    if (nonAttestingCount <= 0) return 0;
    return (stats.dal_active_bakers / nonAttestingCount) * 100;
  };

  const calculateAdoptionPercentage = () => {
    if (!stats || stats.total_bakers <= 0) return 0;
    return ((stats.total_bakers - stats.dal_inactive_bakers - stats.unclassified_bakers - stats.non_attesting_bakers) / stats.total_bakers) * 100;
  };

  // Display a loading message
  if (loading && !stats) {
    return (
      <div style={{
        minHeight: '100vh',
        backgroundColor: 'black',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        color: 'white',
        fontSize: '24px'
      }}>
        Loading DAL statistics...
      </div>
    );
  }

  // Display an error message
  if (error) {
    return (
      <div style={{
        minHeight: '100vh',
        backgroundColor: 'black',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        color: 'red',
        fontSize: '24px'
      }}>
        Error: {error}
      </div>
    );
  }

  const participationPercentage = calculateParticipationPercentage();
  const adoptionPercentage = calculateAdoptionPercentage();

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: 'black',
      display: 'flex',
      flexDirection: 'column',
      padding: '2rem'
    }}>
      <h1 style={{
        textAlign: 'center',
        fontSize: '32px',
        fontWeight: 'bold',
        marginBottom: '4rem',
        color: 'white',
        marginTop: '2rem'
      }}>
        Tezos Mainnet DAL-o-meter: Cycle {stats?.cycle || '...'}
      </h1>

      <div style={{
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        paddingTop: '2rem'
      }}>
        <div style={{
          display: 'flex',
          flexDirection: 'row',
          width: '100%'
        }}>
          <SimpleDalGauge
            value={stats?.dal_active_bakers || 0}
            label={`${stats?.dal_active_bakers || 0}/${stats?.total_bakers || 0}`}
            description="Active DAL Bakers"
            maxValue={stats?.total_bakers || 100}
          />
          <SimpleDalGauge
            value={stats?.dal_baking_power_percentage || 0}
            label={`${stats?.dal_baking_power_percentage?.toFixed(1) || '0'}%`}
            description="Baking Power"
            maxValue={100}
          />
          <SimpleDalGauge
            value={participationPercentage}
            label={`${participationPercentage.toFixed(1)}%`}
            description="DAL Participation"
            maxValue={100}
          />
          <SimpleDalGauge
            value={adoptionPercentage}
            label={`${adoptionPercentage.toFixed(1)}%`}
            description="DAL Adoption"
            maxValue={100}
          />
        </div>
      </div>

      {/* History Table */}
      <div style={{
        marginTop: '4rem',
        padding: '1rem',
        border: '1px solid #444',
        borderRadius: '4px',
        backgroundColor: '#111'
      }}>
        <h2 style={{
          color: 'white',
          fontSize: '24px',
          marginBottom: '20px',
          textAlign: 'center'
        }}>
          Cycle History
        </h2>

        {/* Debug button */}
        <div style={{ marginBottom: '20px', textAlign: 'center' }}>
          <button
            onClick={loadHistoryManually}
            style={{
              background: '#3B82F6',
              border: 'none',
              color: 'white',
              padding: '10px 20px',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Load history manually
          </button>

          {debug && (
            <pre style={{
              marginTop: '10px',
              padding: '10px',
              background: '#222',
              color: '#0f0',
              borderRadius: '4px',
              textAlign: 'left',
              overflowX: 'auto',
              maxHeight: '150px'
            }}>
              {debug}
            </pre>
          )}
        </div>

        {/* Debug information */}
        <div style={{ color: 'yellow', marginBottom: '20px', textAlign: 'center' }}>
          History length: {history?.length || 0}
        </div>

        {/* Raw data display */}
        {history && history.length > 0 && (
          <div style={{ marginTop: '20px', overflowX: 'auto' }}>
            <h3 style={{ color: 'white', textAlign: 'center', marginBottom: '10px' }}>Raw history data</h3>
            <pre style={{ color: '#0f0', background: '#222', padding: '10px', borderRadius: '4px' }}>
              {JSON.stringify(history, null, 2)}
            </pre>
          </div>
        )}

        {/* Normal history table */}
        <HistoryTable history={history} />
      </div>
    </div>
  );
}
