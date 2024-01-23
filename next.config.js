/** @type {import("next").NextConfig} */
const nextConfig = {
    swcMinify: true,
    images: {
        remotePatterns: [
            {
                protocol: "https",
                hostname: "i.imgur.com"
            },
            {
                protocol: "https",
                hostname: "res.cloudinary.com"
            }
        ]
    },
    webpack: (config, { isServer, nextRuntime, webpack }) => {
        // config.resolve.fallback = {
        //     fs: false,
        //     os: false,
        //     path: false
        // };

        // Avoid AWS SDK Node.js require issue
        if (isServer && nextRuntime === "nodejs")
            config.plugins.push(
                new webpack.IgnorePlugin({ resourceRegExp: /^aws-crt$/ })
            );
        return config;
    }
};

module.exports = nextConfig;
