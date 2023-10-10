/** @type {import('next').NextConfig} */
const nextConfig = {
    distDir: '.next',
    swcMinify: false,
    experimental: { appDir: true },
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'avatars.githubusercontent.com',
                port: '',
                pathname: '/**'
            },
            {
                protocol: 'https',
                hostname: 'via.placeholder.com',
                port: '',
                pathname: '/**'
            },
            {
                protocol: 'https',
                hostname: 'forge-website-assets.s3.amazonaws.com',
                port: '',
                pathname: '/**'
            }
        ]
    },
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
        return config
    }
}

module.exports = nextConfig
