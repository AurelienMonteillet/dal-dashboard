'use client';

import React from 'react';
import Script from 'next/script';

const JQueryLoader: React.FC = () => {
    return (
        <>
            <Script
                src="https://code.jquery.com/jquery-3.7.1.min.js"
                strategy="beforeInteractive"
                onLoad={() => {
                    console.log('jQuery loaded');
                }}
            />
        </>
    );
};

export default JQueryLoader; 