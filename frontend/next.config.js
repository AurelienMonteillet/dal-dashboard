/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    env: {
        NEXT_PUBLIC_JSON_URL: process.env.NEXT_PUBLIC_JSON_URL || 'https://aurelienmonteillet.github.io/dal-dashboard/dal_stats.json',
        NEXT_PUBLIC_HISTORY_URL: process.env.NEXT_PUBLIC_HISTORY_URL || 'https://aurelienmonteillet.github.io/dal-dashboard/dal_stats_history.json'
    },
    eslint: {
        ignoreDuringBuilds: true
    },
};

module.exports = nextConfig;
