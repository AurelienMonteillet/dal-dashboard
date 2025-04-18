/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    swcMinify: true,
    env: {
        NEXT_PUBLIC_JSON_URL: process.env.NEXT_PUBLIC_JSON_URL || 'https://aurelienmonteillet.github.io/dal-dashboard/dal_stats.json',
    },
};

module.exports = nextConfig;
