module.exports = {
  watch: true, // Enable watch mode
  poweredByHeader: false,
  reactStrictMode: true,
  publicRuntimeConfig: {
    fhirClientId: process.env.FHIR_CLIENT_ID,
    defaultZipCode: process.env.DEFAULT_ZIP_CODE,
    sendLocationData: eval(process.env.SEND_LOCATION_DATA),
    reactAppDebug: eval(process.env.REACT_APP_DEBUG),
    services: [
      {
        name: 'breastCancerTrials',
        label: 'BreastCancerTrials.org',
        url: 'http://localhost:3001',
        searchRoute: '/getClinicalTrial',
        defaultValue: true,
      },
      {
        name: 'trialjectory',
        label: 'TrialJectory',
        url: 'http://localhost:3000',
        searchRoute: '/getClinicalTrial',
      },
      // We'll be phasing out TrialScope
      {
        name: 'trialscope',
        label: 'TrialScope',
        url: 'http://localhost:3000',
        searchRoute: '/getClinicalTrial',
      },
    ],
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
