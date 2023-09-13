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
    typescript: {
        // !! WARN !!
        // Dangerously allow production builds to successfully complete even if
        // your project has type errors.
        // !! WARN !!
        ignoreBuildErrors: true,
    },
};

module.exports = nextConfig;
