'use client';

import React from 'react';

interface DalGaugeProps {
    value: number;
    label: string;
    maxValue?: number;
}

const DalGauge: React.FC<DalGaugeProps> = ({ value, label, maxValue = 100 }) => {
    const percentage = (value / maxValue) * 100;
    const angle = (percentage * 180) / 100;

    return (
        <div className="flex flex-col items-center">
            <div className="w-[25px] h-[12px]">
                <svg viewBox="0 0 100 50" className="w-full h-full">
                    {/* Background arc */}
                    <path
                        d="M 10 50 A 40 40 0 0 1 90 50"
                        fill="none"
                        stroke="#2a2d34"
                        strokeWidth="8"
                        strokeLinecap="round"
                    />
                    {/* Needle */}
                    <line
                        x1="50"
                        y1="50"
                        x2="50"
                        y2="20"
                        stroke="#3B82F6"
                        strokeWidth="8"
                        strokeLinecap="round"
                        transform={`rotate(${angle - 180} 50 50)`}
                    />
                </svg>
            </div>
            <div className="text-center mt-1">
                <p className="text-white text-[8px] font-semibold">{label}</p>
            </div>
        </div>
    );
};

export default DalGauge;
