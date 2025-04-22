'use client';

import React, { useEffect, useState } from 'react';

// Interface pour les statistiques DAL
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

// Interface pour les entrées d'historique
interface HistoryEntry {
  timestamp: string;
  cycle: number;
  dal_active_bakers: number;
  dal_baking_power_percentage: number;
  dal_participation_percentage: number;
  dal_adoption_percentage: number;
}

// URL du fichier JSON hébergé sur GitHub Pages
const JSON_URL = process.env.NEXT_PUBLIC_JSON_URL || 'https://aurelienmonteillet.github.io/dal-dashboard/dal_stats.json';
const HISTORY_URL = process.env.NEXT_PUBLIC_HISTORY_URL || 'https://aurelienmonteillet.github.io/dal-dashboard/dal_stats_history.json';

/**
 * Récupère les statistiques DAL depuis le JSON hébergé sur GitHub Pages
 */
async function fetchDalStats(): Promise<DALStats> {
  try {
    const response = await fetch(JSON_URL, {
      // Nécessaire pour éviter la mise en cache de la réponse
      cache: 'no-store',
      next: { revalidate: 3600 } // Revalider toutes les heures
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
 * Récupère l'historique des statistiques DAL
 */
async function fetchDalHistory(): Promise<HistoryEntry[]> {
  try {
    const response = await fetch(HISTORY_URL, {
      cache: 'no-store',
      next: { revalidate: 3600 }
    });

    if (!response.ok) {
      throw new Error(`Network response was not ok: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching DAL history:', error);
    return []; // Renvoyer un tableau vide en cas d'erreur
  }
}

// Composant pour afficher une jauge simple
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

// Composant pour afficher le tableau historique
const HistoryTable: React.FC<{ history: HistoryEntry[] }> = ({ history }) => {
  if (!history || history.length === 0) {
    return <div style={{ color: 'white', textAlign: 'center', padding: '20px' }}>Aucune donnée historique disponible.</div>;
  }

  return (
    <div style={{ overflowX: 'auto', marginTop: '4rem' }}>
      <h2 style={{ color: 'white', fontSize: '24px', marginBottom: '20px', textAlign: 'center' }}>Données historiques par cycle</h2>
      <table style={{ width: '100%', borderCollapse: 'collapse', color: 'white' }}>
        <thead>
          <tr style={{ borderBottom: '1px solid #444', textAlign: 'left' }}>
            <th style={{ padding: '10px', textAlign: 'center' }}>Cycle</th>
            <th style={{ padding: '10px', textAlign: 'center' }}>Date</th>
            <th style={{ padding: '10px', textAlign: 'center' }}>Bakers DAL actifs</th>
            <th style={{ padding: '10px', textAlign: 'center' }}>Pouvoir de baking (%)</th>
            <th style={{ padding: '10px', textAlign: 'center' }}>Participation DAL (%)</th>
            <th style={{ padding: '10px', textAlign: 'center' }}>Adoption DAL (%)</th>
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
  // État pour stocker les données DAL
  const [stats, setStats] = useState<DALStats | null>(null);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Récupérer les données au chargement de la page
  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);

        // Charger les deux ensembles de données en parallèle
        const [dataStats, dataHistory] = await Promise.all([
          fetchDalStats(),
          fetchDalHistory()
        ]);

        setStats(dataStats);
        setHistory(dataHistory);
        setError(null);
      } catch (err) {
        console.error('Error loading DAL stats:', err);
        setError('Impossible de charger les statistiques DAL');
      } finally {
        setLoading(false);
      }
    }

    loadData();

    // Rafraîchir les données toutes les heures
    const intervalId = setInterval(loadData, 60 * 60 * 1000);

    // Nettoyer l'intervalle lors du démontage du composant
    return () => clearInterval(intervalId);
  }, []);

  // Calcul des pourcentages avec protection contre les divisions par zéro
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

  // Afficher un message de chargement
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
        Chargement des statistiques DAL...
      </div>
    );
  }

  // Afficher un message d'erreur
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
        Erreur: {error}
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
        Tezos mainnet DAL-o-meter: cycle {stats?.cycle || '...'}
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
            description="Bakers DAL actifs"
            maxValue={stats?.total_bakers || 100}
          />
          <SimpleDalGauge
            value={stats?.dal_baking_power_percentage || 0}
            label={`${stats?.dal_baking_power_percentage?.toFixed(1) || '0'}%`}
            description="Pouvoir de baking"
            maxValue={100}
          />
          <SimpleDalGauge
            value={participationPercentage}
            label={`${participationPercentage.toFixed(1)}%`}
            description="Participation DAL"
            maxValue={100}
          />
          <SimpleDalGauge
            value={adoptionPercentage}
            label={`${adoptionPercentage.toFixed(1)}%`}
            description="Adoption DAL"
            maxValue={100}
          />
        </div>
      </div>

      {/* Tableau historique */}
      <HistoryTable history={history} />
    </div>
  );
}
