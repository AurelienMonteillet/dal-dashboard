'use client';

import React, { useEffect, useState } from 'react';
import SimpleDalGauge from './components/SimpleDalGauge';

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

// URL du fichier JSON hébergé sur GitHub Pages
const JSON_URL = process.env.NEXT_PUBLIC_JSON_URL || 'https://aurelienmonteillet.github.io/dal-dashboard/dal_stats.json';

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

export default function Home() {
  // État pour stocker les données DAL
  const [stats, setStats] = useState<DALStats | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Récupérer les données au chargement de la page
  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const data = await fetchDalStats();
        setStats(data);
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
        Loading DAL statistics...
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
        Tezos mainnet DAL-o-meter: cycle {stats?.cycle || '...'}
      </h1>

      <div style={{
        flex: 1,
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
            description="DAL Active Bakers"
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
    </div>
  );
}
