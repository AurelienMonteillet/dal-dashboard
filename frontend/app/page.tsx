'use client';

import React, { useEffect, useState } from 'react';
import SimpleDalGauge from './components/SimpleDalGauge';
import { fetchDalStats } from './services/api';

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
            label={`${stats?.dal_baking_power_percentage.toFixed(1) || 0}%`}
            description="Baking Power"
            maxValue={100}
          />
          <SimpleDalGauge
            value={(stats ? (stats.dal_active_bakers / (stats.total_bakers - stats.non_attesting_bakers) * 100) : 0)}
            label={`${stats ? (stats.dal_active_bakers / (stats.total_bakers - stats.non_attesting_bakers) * 100).toFixed(1) : 0}%`}
            description="DAL Participation"
            maxValue={100}
          />
          <SimpleDalGauge
            value={(stats ? ((stats.total_bakers - stats.dal_inactive_bakers - stats.unclassified_bakers - stats.non_attesting_bakers) / stats.total_bakers * 100) : 0)}
            label={`${stats ? ((stats.total_bakers - stats.dal_inactive_bakers - stats.unclassified_bakers - stats.non_attesting_bakers) / stats.total_bakers * 100).toFixed(1) : 0}%`}
            description="DAL Adoption"
            maxValue={100}
          />
        </div>
      </div>
    </div>
  );
}
