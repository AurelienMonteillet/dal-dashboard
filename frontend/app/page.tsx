'use client';

import React from 'react';
import SimpleDalGauge from './components/SimpleDalGauge';

export default function Home() {
  // Test data - to be replaced with real data later
  const mockData = {
    cycle: 852,
    total_bakers: 289,
    dal_active_bakers: 62,
    dal_baking_power_percentage: 28.1
  };

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
        Tezos mainnet DAL-o-meter: cycle {mockData.cycle}
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
            value={mockData.dal_active_bakers}
            label={`${mockData.dal_active_bakers}/${mockData.total_bakers}`}
            description="DAL Active Bakers"
            maxValue={mockData.total_bakers}
          />
          <SimpleDalGauge
            value={mockData.dal_baking_power_percentage}
            label={`${mockData.dal_baking_power_percentage}%`}
            description="Baking Power"
            maxValue={100}
          />
          <SimpleDalGauge
            value={65}
            label="65%"
            description="DAL Attestations"
            maxValue={100}
          />
          <SimpleDalGauge
            value={42}
            label="42%"
            description="DAL Participation"
            maxValue={100}
          />
        </div>
      </div>
    </div>
  );
}
