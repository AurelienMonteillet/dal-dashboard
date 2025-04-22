import React from 'react';

interface SimpleDalGaugeProps {
    value: number;
    label: string;
    description: string;
    maxValue?: number;
}

const SimpleDalGauge: React.FC<SimpleDalGaugeProps> = ({
    value,
    label,
    description,
    maxValue = 100
}) => {
    // Calculate the percentage for display
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

export default SimpleDalGauge; 