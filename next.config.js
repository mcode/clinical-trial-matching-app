// List of active services. These are used to pass the service configuration within SERVICES below
// within the publicRuntimeConfig.
const ACTIVE_SERVICES = ['ancora', 'breastCancerTrials', 'carebox', 'lungevity', 'trialjectory'];

// If true, uses http://localhost/${id}/getClinicalTrial as the service URL, otherwise,
// uses http://localhost:${service.defaultPort}/getClinicalTrial.
const SERVICES_ON_SAME_SERVER = false;

const SERVICES = {
  ancora: {
    label: 'Ancora.ai',
    defaultPort: 3002,
  },
  breastCancerTrials: {
    label: 'BreastCancerTrials.org',
    defaultPort: 3000,
    defaultValue: true,
  },
  carebox: {
    label: 'Carebox',
    defaultPort: 3004,
  },
  lungevity: {
    label: 'LUNGevity',
    defaultPort: 3003,
  },
  trialjectory: {
    label: 'TrialJectory',
    defaultPort: 3001,
  },
};

module.exports = {
  watch: true, // Enable watch mode
  poweredByHeader: false,
  reactStrictMode: true,
  publicRuntimeConfig: {
    fhirClientId: process.env.FHIR_CLIENT_ID,
    fhirRedirectUri: process.env.FHIR_REDIRECT_URI,
    defaultZipCode: process.env.DEFAULT_ZIP_CODE,
    defaultTravelDistance: process.env.DEFAULT_TRAVEL_DISTANCE,
    sendLocationData: JSON.parse(process.env.SEND_LOCATION_DATA ?? 'false'),
    reactAppDebug: JSON.parse(process.env.REACT_APP_DEBUG ?? 'false'),
    services: ACTIVE_SERVICES.map(id => {
      const service = SERVICES[id];
      if (!service) {
        throw Error(`Unknown active service "${id}".`);
      }
      return {
        name: id,
        label: service.label,
        url: SERVICES_ON_SAME_SERVER ? 'http://localhost' : `http://localhost:${service.defaultPort}`,
        searchRoute: SERVICES_ON_SAME_SERVER ? `/${id}/getClinicalTrial` : '/getClinicalTrial',
        defaultValue: service.defaultValue ?? false,
      };
    }),
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
