const webpack = require("webpack");

const isProd = process.env.NODE_ENV === "production";
const domains = process.env.IMAGE_DOMAINS
  ? process.env.IMAGE_DOMAINS.split(",")
  : [];

const common = {
  swcMinify: true,
  i18n: {
    // These are all the locales you want to support in
    // your application
    locales: ["en-US", "zh-TW"],
    // This is the default locale you want to be used when visiting
    // a non-locale prefixed path e.g. `/hello`
    defaultLocale: "zh-TW",
  },
  images: {
    domains: [...domains, "icons.iconarchive.com"],
  },
  webpack: (config) => {
    // import markdown files
    config.module.rules.push({
      test: /\.md$/,
      use: "raw-loader",
    });
    config.module.rules.push({
      test: /\.svg$/,
      use: "svg-react-loader",
    });
    // import jquery
    config.plugins.push(
      new webpack.ProvidePlugin({
        $: "jquery",
        jQuery: "jquery",
      })
    );

    return config;
  },
};

const dev = {
  eslint: {
    // Warning: Dangerously allow production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },
  i18n: {
    // These are all the locales you want to support in
    // your application
    locales: ["en-US", "zh-TW"],
    // This is the default locale you want to be used when visiting
    // a non-locale prefixed path e.g. `/hello`
    defaultLocale: "zh-TW",
  },
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${process.env.PROXY_URL}/api/:path*`, // Proxy to Backend
      },
      {
        source: "/api-mock/:path*",
        destination: `${process.env.MOCK_PROXY_URL}/:path*`, // Proxy to Mock Backend
      },
    ];
  },
  ...common,
};

const prod = {
  assetPrefix: process.env.ASSET_PREFIX,
  ...common,
};

module.exports = isProd ? prod : dev;
