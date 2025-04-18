'use client';

import React, { useEffect, useRef } from 'react';
import Script from 'next/script';

declare global {
    interface JQuery {
        gaugeMeter: (options?: any) => JQuery;
    }

    interface Window {
        jQuery: any;
    }
}

interface DalGaugeMeterProps {
    value: number;
    label: string;
    maxValue?: number;
}

const DalGaugeMeter: React.FC<DalGaugeMeterProps> = ({ value, label, maxValue = 100 }) => {
    const gaugeId = useRef(`gauge_${Math.random().toString(36).substring(2, 9)}`);
    const percentage = Math.round((value / maxValue) * 100);

    useEffect(() => {
        // Vérifier si jQuery et GaugeMeter sont disponibles
        if (typeof window !== 'undefined' && window.jQuery && window.jQuery.fn.gaugeMeter) {
            // Initialiser la jauge
            window.jQuery(`#${gaugeId.current}`).gaugeMeter({
                percent: percentage,
                text: label,
                size: 60,
                width: 5,
                style: 'Semi',
                color: '#3B82F6',
                back: '#2a2d34',
                animationstep: 1,
            });
        }
    }, [percentage, label]);

    // Mettre à jour la jauge si la valeur change
    useEffect(() => {
        if (typeof window !== 'undefined' && window.jQuery && window.jQuery.fn.gaugeMeter) {
            window.jQuery(`#${gaugeId.current}`).gaugeMeter({
                percent: percentage
            });
        }
    }, [percentage]);

    return (
        <>
            <Script src="/js/GaugeMeter.js" strategy="lazyOnload" />
            <div
                id={gaugeId.current}
                className="GaugeMeter"
                data-size="60"
                data-width="5"
                data-style="Semi"
                data-color="#3B82F6"
                data-back="#2a2d34"
                data-percent={percentage}
                data-text={label}
                data-text_size="0.16"
                data-animationstep="1"
            ></div>
        </>
    );
};

export default DalGaugeMeter; 