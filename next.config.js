module.exports = {
  poweredByHeader: false,
  reactStrictMode: true,
  publicRuntimeConfig: {
    fhirClientId: process.env.FHIR_CLIENT_ID,
  },
  serverRuntimeConfig: {
    sessionSecretKey: process.env.SESSION_SECRET_KEY,
  },
  webpack(config) {
    config.module.rules.push({
      test: /\.svg$/,
      use: [{ loader: '@svgr/webpack', options: { icon: true } }],
    });

    return config;
  },
};
