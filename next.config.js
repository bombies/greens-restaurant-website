/** @type {import("next").NextConfig} */
const nextConfig = {
    swcMinify: true,
    images: {
        domains: [
            "i.imgur.com",
            "res.cloudinary.com"
        ]
    },
    webpack: (config, { buildId }) => {
        // only apply it if dev: false, isServer: false, nextRuntime: undefined
        if (config.output.filename === 'static/chunks/[name]-[chunkhash].js') {
            config.output.filename = `static/chunks/[name]-[chunkhash]-${buildId}.js`
        }
        return config
    },
};

module.exports = nextConfig;
