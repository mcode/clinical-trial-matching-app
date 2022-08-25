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
        name: 'ancora',
        label: 'Ancora.ai',
        url: 'http://localhost:3002',
        searchRoute: '/getClinicalTrial',
      },
      {
        name: 'breastCancerTrials',
        label: 'BreastCancerTrials.org',
        url: 'http://localhost:3000',
        searchRoute: '/getClinicalTrial',
        defaultValue: true,
      },
      {
        name: 'lungevity',
        label: 'LUNGevity',
        url: 'http://localhost:3003',
        searchRoute: '/getClinicalTrial',
      },
      {
        name: 'trialjectory',
        label: 'TrialJectory',
        url: 'http://localhost:3001',
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
