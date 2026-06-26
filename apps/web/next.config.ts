import { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const nextConfig: NextConfig = {
    trailingSlash: true,
    reactStrictMode: false,
    images: {
        unoptimized: true
    },
};

const withNextIntl = createNextIntlPlugin();
export default withNextIntl(nextConfig);