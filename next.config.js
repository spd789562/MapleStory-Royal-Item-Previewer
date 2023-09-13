/** @type {import('next').NextConfig} */
const nextConfig = {
    webpack: (config) => {
        /* prevent node-webpmux compile error */
        config.resolve.fallback = { fs: false };

        return config;
    },
    async rewrites() {
        return [
            // force redirect to public wasm folder
            {
                source: '/libwebp.wasm',
                destination: '/wasm/libwebp.wasm',
            },
        ];
    },
};

module.exports = nextConfig;
