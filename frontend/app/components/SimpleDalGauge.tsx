'use client';

import React, { useState } from 'react';

interface SimpleDalGaugeProps {
    value: number;
    label: string;
    description: string;
    maxValue?: number;
    tooltip?: string;
}

const SimpleDalGauge: React.FC<SimpleDalGaugeProps> = ({ 
    value, 
    label, 
    description, 
    maxValue = 100,
    tooltip 
}) => {
    const [showTooltip, setShowTooltip] = useState(false);
    const percentage = Math.round((value / maxValue) * 100);

    const tooltipStyle = {
        position: 'absolute' as const,
        top: '100%',
        left: '50%',
        transform: 'translateX(-50%)',
        backgroundColor: '#2a2d34',
        color: 'white',
        padding: '1rem',
        borderRadius: '4px',
        width: '300px',
        zIndex: 1000,
        boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
        marginTop: '0.5rem',
        whiteSpace: 'pre-line' as const,
        lineHeight: '1.5',
        fontSize: '14px'
    };

    return (
        <div 
            style={{
                width: '25%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                boxSizing: 'border-box',
                padding: '0 10px',
                position: 'relative',
                cursor: 'help'
            }}
            onMouseEnter={() => setShowTooltip(true)}
            onMouseLeave={() => setShowTooltip(false)}
        >
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
                <span style={{ 
                    color: 'white', 
                    fontSize: '14px', 
                    opacity: '0.8'
                }}>
                    {description}
                </span>
            </div>

            {tooltip && showTooltip && (
                <div style={tooltipStyle}>
                    {tooltip}
                </div>
            )}
        </div>
    );
};

export default SimpleDalGauge; 