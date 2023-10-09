/** @type {import('next').NextConfig} */
const nextConfig = {
    webpack: (config, { isServer }) => {
        config.output.globalObject = 'self'

        return config
    }
}

module.exports = nextConfig
