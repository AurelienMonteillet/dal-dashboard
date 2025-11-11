'use client';

import React, { useState } from 'react';

export default function BakerPage() {
  const [tzAddress, setTzAddress] = useState('');
  const [dalStatus, setDalStatus] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const checkBakerStatus = async () => {
    if (!tzAddress) {
      setError('Please enter a Tezos address');
      setDalStatus(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/baker/${tzAddress}`);
      if (!response.ok) {
        throw new Error('Error checking status');
      }
      const data = await response.json();
      if (typeof data.has_dal !== 'undefined') {
        setDalStatus(data.has_dal);
      } else if (typeof data.online !== 'undefined') {
        setDalStatus(data.online);
      } else {
        setError('Could not retrieve DAL status.');
        setDalStatus(null);
      }
    } catch (err) {
      setError('Could not retrieve the DAL status. Please verify the address or try again later.');
      setDalStatus(null);
    } finally {
      setLoading(false);
    }
  };

  const renderStatusMessage = () => {
    if (dalStatus === true) {
      return (
        <div className="p-6 rounded-lg text-center bg-green-500/20 border border-green-500">
          <h2 className="text-xl font-semibold mb-2 text-green-400">
            Baker <b>{tzAddress}</b> is currently <span className="font-bold">online</span> on the DAL network.
          </h2>
        </div>
      );
    } else if (dalStatus === false) {
      return (
        <div className="p-6 rounded-lg text-center bg-red-500/20 border border-red-500">
          <h2 className="text-xl font-semibold mb-2 text-red-400">
            Baker <b>{tzAddress}</b> is currently <span className="font-bold">offline</span> on the DAL network.
          </h2>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-[#23272f] p-8 rounded-lg shadow-lg">
        <h1 className="text-3xl font-bold text-white text-center mb-8">
          DAL Status Checker
        </h1>

        <div className="space-y-6">
          <div className="flex flex-col space-y-2">
            <label htmlFor="tzAddress" className="text-white text-lg">
              Baker's Tezos Address
            </label>
            <div className="flex space-x-2">
              <input
                type="text"
                id="tzAddress"
                value={tzAddress}
                onChange={(e) => setTzAddress(e.target.value)}
                placeholder="tz1..."
                className="flex-1 p-3 rounded bg-[#2a2d34] text-white border border-gray-600 focus:border-blue-500 focus:outline-none"
              />
              <button
                onClick={checkBakerStatus}
                disabled={loading}
                className="px-6 py-3 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {loading ? 'Checking...' : 'Check'}
              </button>
            </div>
          </div>

          {error && (
            <div className="p-4 bg-red-500/20 border border-red-500 rounded text-red-200">
              {error}
            </div>
          )}

          {renderStatusMessage()}
        </div>
      </div>
    </div>
  );
} 