/** @type {import('next').NextConfig} */
const nextConfig = {
    distDir: '.next',
    experimental: { appDir: true },
    assetPrefix:
        process.env.NODE_ENV === 'production'
            ? 'https://monaco-next-poc.vercel.app/'
            : `http://localhost:${process.env.PORT || '3000'}/`,
    async headers() {
        return [
            {
                source: '/(.*)',
                headers: [
                    {
                        key: 'Cross-Origin-Embedder-Policy',
                        value: 'require-corp'
                    },
                    {
                        key: 'Cross-Origin-Opener-Policy',
                        value: 'same-origin'
                    },
                    {
                        key: 'Cross-Origin-Resource-Policy',
                        value: 'cross-origin'
                    }
                ]
            }
        ]
    },
    env: {
        PROJECT_ROOT: __dirname
    },
    webpack(config, options) {
        config.experiments = { ...config.experiments, topLevelAwait: true }

        config.resolve.fallback = {
            fs: false
        }

        config.module.rules.push({
            test: /\.wasm$/,
            type: 'asset/resource'
        })

        return config
    }
}

module.exports = nextConfig
