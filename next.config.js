const path = require("path");
const loaderUtils = require("loader-utils");

const hashOnlyIdent = (context, _, exportName) => {
    return loaderUtils
        .getHashDigest(
            Buffer.from(
                `filePath:${path
                    .relative(context.rootContext, context.resourcePath)
                    .replace(/\\+/g, "/")}#className:${exportName}`
            ),
            "md4",
            "base64",
            6
        )
        .replace(/^(-?\d|--)/, "_$1")
        .replaceAll("+", "_")
        .replaceAll("/", "_");
};

/** @type {import("next").NextConfig} */
const nextConfig = {
    webpack(config, { dev }) {
        const rules = config.module.rules
            .find((rule) => typeof rule.oneOf === "object")
            .oneOf.filter((rule) => Array.isArray(rule.use));

        if (!dev)
            rules.forEach((rule) => {
                rule.use.forEach((moduleLoader) => {
                    if (
                        moduleLoader.loader?.includes("css-loader") &&
                        !moduleLoader.loader?.includes("postcss-loader")
                    )
                        moduleLoader.options.modules.getLocalIdent = hashOnlyIdent;

                    // earlier below statements were sufficient:
                    // delete moduleLoader.options.modules.getLocalIdent;
                    // moduleLoader.options.modules.localIdentName = '[hash:base64:6]';
                });
            });

        return config;
    },
    experimental: {
        turbo: {
            resolveAlias: {
                underscore: "lodash",
                mocha: { browser: "mocha/browser-entry.js" }
            }
        }
    },
    reactStrictMode: true,
    swcMinify: true,
    images: {
        domains: [
            "i.imgur.com",
            "res.cloudinary.com"
        ]
    }
};

module.exports = nextConfig;
