/** @type {import("next").NextConfig} */
const nextConfig = {
    swcMinify: true,
    images: {
        domains: [
            "i.imgur.com",
            "res.cloudinary.com"
        ]
    }
};

module.exports = nextConfig;
