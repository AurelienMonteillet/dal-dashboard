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
            className="w-full sm:w-1/2 lg:w-1/4 flex flex-col items-center box-border px-2 sm:px-4 py-2 relative cursor-help"
            onMouseEnter={() => setShowTooltip(true)}
            onMouseLeave={() => setShowTooltip(false)}
        >
            <div className="text-center mb-2 sm:mb-4 flex items-center justify-center">
                <span className="text-white text-lg sm:text-xl font-bold">{label}</span>
                
                {showActivationStatus && threshold && (
                    <span className={`ml-1.5 text-xs ${isActive ? 'text-green-500 animate-pulse' : 'text-white/50'}`}>
                        {isActive ? '●' : '○'}
                    </span>
                )}
                
                {tooltip && (
                    <span 
                        className={`inline-flex items-center justify-center w-4 h-4 rounded-full bg-white/20 text-white text-xs font-bold ml-2 cursor-help border border-white/30 transition-all duration-200 ${
                            showTooltip ? 'bg-blue-500/30 border-blue-500/50' : ''
                        }`}
                    >
                        i
                    </span>
                )}
            </div>

            <svg className="w-[120px] sm:w-[150px]" height="90" viewBox="0 0 100 60" preserveAspectRatio="xMidYMid meet">
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
                                    <circle
                                        cx={pos.x}
                                        cy={pos.y}
                                        r="2.5"
                                        fill="white"
                                        opacity="0.8"
                                    />
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

            <div className="text-center mt-2 sm:mt-4">
                <span className="text-white text-sm sm:text-base opacity-80">
                    {description}
                </span>
            </div>

            {tooltip && showTooltip && (
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 bg-[#2a2d34] text-white p-4 rounded w-[280px] sm:w-[300px] z-[1000] shadow-lg mt-2 whitespace-pre-line leading-relaxed text-sm">
                    {tooltip}
                </div>
            )}
        </div>
    );
};

export default SimpleDalGauge; 