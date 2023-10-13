/** @type {import('next').NextConfig} */
const nextConfig = {
    distDir: '.next',
    experimental: { appDir: true },
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
    webpack(config, options) {
        config.experiments = { ...config.experiments, topLevelAwait: true }

        config.resolve.fallback = {
            fs: false
        }

        config.module.rules.push({
            test: /\.wasm$/,
            type: 'asset/resource'
        })

        // config.module.rules.push({
        //     test: /\.css$/,
        //     type: 'stylesheet'
        // })

        return config
    }
}

module.exports = nextConfig
