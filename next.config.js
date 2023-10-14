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
    api: {
        responseLimit: false
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

        if (!options.isServer) {
            // This entry point will be loaded separately from main.js
            // const originalEntry = config.entry
            // config.entry = async () => {
            //     const entryConfig = await originalEntry()
            //     console.log(entryConfig)
            //     return {
            //         ...entryConfig,
            //         extensionHostWorker:
            //             './node_modules/vscode/workers/extensionHost.worker.js'
            //     }
            // }
        }

        // config.module.rules.push({
        //     test: /\.css$/,
        //     type: 'stylesheet'
        // })

        return config
    }
}

module.exports = nextConfig
