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
    async headers() {
        return [
            {
                source: '/(.*)\\.wasm',
                headers: [
                    {
                        key: 'Cache-Control',
                        value: 'public, max-age=31536000, immutable',
                    },
                ],
            },
        ];
    },
    typescript: {
        // !! WARN !!
        // Dangerously allow production builds to successfully complete even if
        // your project has type errors.
        // !! WARN !!
        ignoreBuildErrors: true,
    },
};

module.exports = nextConfig;
