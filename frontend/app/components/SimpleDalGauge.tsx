'use client';

import React, { useState } from 'react';

interface SimpleDalGaugeProps {
    value: number;
    label: string;
    description: string;
    maxValue?: number;
    tooltip?: string;
    threshold?: number;
    showActivationStatus?: boolean;
}

const SimpleDalGauge: React.FC<SimpleDalGaugeProps> = ({ 
    value, 
    label, 
    description, 
    maxValue = 100,
    tooltip,
    threshold,
    showActivationStatus = false
}) => {
    const [showTooltip, setShowTooltip] = useState(false);
    const percentage = Math.round((value / maxValue) * 100);
    
    const isActive = threshold ? percentage >= threshold : false;

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

    const infoIconStyle = {
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '16px',
        height: '16px',
        borderRadius: '50%',
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        color: 'white',
        fontSize: '11px',
        fontWeight: 'bold',
        marginLeft: '8px',
        cursor: 'help',
        borderWidth: '1px',
        borderStyle: 'solid',
        borderColor: 'rgba(255, 255, 255, 0.3)',
        transition: 'all 0.2s ease'
    };

    const getThresholdPosition = (thresholdPercent: number) => {
        const angle = 180 - (thresholdPercent * 180) / 100;
        const angleRad = (angle * Math.PI) / 180;
        const centerX = 50;
        const centerY = 50;
        const radius = 40;
        
        const x = centerX + radius * Math.cos(angleRad);
        const y = centerY - radius * Math.sin(angleRad);
        
        return { x, y, angle };
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
            <div style={{ textAlign: 'center', marginBottom: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ color: 'white', fontSize: '20px', fontWeight: 'bold' }}>{label}</span>
                
                {/* Petite icône d'état discrète */}
                {showActivationStatus && threshold && (
                    <span style={{ 
                        marginLeft: '6px', 
                        fontSize: '12px',
                        color: isActive ? '#22c55e' : 'rgba(255,255,255,0.5)',
                        animation: isActive ? 'pulse 2s ease-in-out infinite' : 'none'
                    }}>
                        {isActive ? '●' : '○'}
                    </span>
                )}
                
                {tooltip && (
                    <span 
                        style={{
                            ...infoIconStyle,
                            ...(showTooltip ? { backgroundColor: 'rgba(59, 130, 246, 0.3)', borderColor: 'rgba(59, 130, 246, 0.5)' } : {})
                        }}
                    >
                        i
                    </span>
                )}
            </div>

            <svg width="150" height="90" viewBox="0 0 100 60">
                <path
                    d="M 10,50 A 40,40 0 0,1 90,50"
                    fill="none"
                    stroke="#2a2d34"
                    strokeWidth="8"
                    strokeLinecap="round"
                />

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

                {threshold && (
                    <>
                        {(() => {
                            const pos = getThresholdPosition(threshold);
                            return (
                                <g>
                                    {/* Ligne pointillée du centre vers l'extérieur */}
                                    <line
                                        x1="50"
                                        y1="50"
                                        x2={pos.x + 15 * Math.cos((pos.angle * Math.PI) / 180)}
                                        y2={pos.y - 15 * Math.sin((pos.angle * Math.PI) / 180)}
                                        stroke="white"
                                        strokeWidth="1.5"
                                        strokeDasharray="4,3"
                                        opacity="0.6"
                                    />
                                    {/* Petit marqueur sur l'arc */}
                                    <circle
                                        cx={pos.x}
                                        cy={pos.y}
                                        r="2.5"
                                        fill="white"
                                        opacity="0.8"
                                    />
                                    {/* Label du seuil */}
                                    <text
                                        x={pos.x < 50 ? pos.x - 12 : pos.x + 12}
                                        y={pos.y - 8}
                                        fill="white"
                                        fontSize="10"
                                        textAnchor="middle"
                                        opacity="0.8"
                                        fontWeight="500"
                                    >
                                        {threshold}%
                                    </text>
                                </g>
                            );
                        })()}
                    </>
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