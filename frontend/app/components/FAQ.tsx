'use client';

import React from 'react';

const FAQ: React.FC = () => {
    return (
        <div style={{
            marginTop: '4rem',
            padding: '2rem',
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
                API Endpoints
            </h2>
            
            <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '1.5rem'
            }}>
                <div>
                    <h3 style={{ color: 'white', fontSize: '18px', marginBottom: '10px' }}>Current DAL Statistics</h3>
                    <p style={{ color: '#ccc', fontSize: '14px' }}><code>GET /api/stats</code></p>
                    <p style={{ color: '#ccc', fontSize: '14px' }}>Returns the latest DAL statistics for the current cycle.</p>
                </div>

                <div>
                    <h3 style={{ color: 'white', fontSize: '18px', marginBottom: '10px' }}>DAL Statistics History</h3>
                    <p style={{ color: '#ccc', fontSize: '14px' }}><code>GET /api/history</code></p>
                    <p style={{ color: '#ccc', fontSize: '14px' }}>Returns the complete historical DAL statistics across cycles.</p>
                </div>

                <div>
                    <h3 style={{ color: 'white', fontSize: '18px', marginBottom: '10px' }}>DAL Statistics by Cycle</h3>
                    <p style={{ color: '#ccc', fontSize: '14px' }}><code>GET /api/cycle/{'{cycle}'}</code></p>
                    <p style={{ color: '#ccc', fontSize: '14px' }}>Returns DAL statistics for a specific cycle.</p>
                </div>
            </div>

            <div style={{
                marginTop: '1rem',
                padding: '1rem',
                backgroundColor: '#2a2d34',
                borderRadius: '4px'
            }}>
                <p style={{ color: '#ccc', fontSize: '14px', fontStyle: 'italic' }}>
                    All endpoints are updated every 2 hours and include CORS headers to allow access from any origin.
                </p>
            </div>
        </div>
    );
};

export default FAQ; 