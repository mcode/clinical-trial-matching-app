const allowedCancerTypes = ['bladder', 'brain', 'breast', 'colon', 'lung', 'multipleMyeloma', 'prostate'];
const allowedSiteRubrics = ['none', 'site1', 'site2'];
const enabledMatchingServices = process.env.MATCHING_SERVICES;
if (!enabledMatchingServices || /^\s*$/.test(enabledMatchingServices)) {
  console.error(
    'Warning: no matching services present in environment, no matching services will be present in the UI!'
  );
}

const defaultMatchingServices = new Set((process.env.MATCHING_SERVICES_DEFAULT_ENABLED ?? '').split(/\s*,\s*/));

const matchingServices = enabledMatchingServices.split(/\s*,\s*/).map(service => {
  const serviceEnvName = service.toUpperCase();
  const cancerTypes = process.env[`MATCHING_SERVICE_${serviceEnvName}_CANCER_TYPES`]
    .split(/\s*,\s*/)
    .filter(cancer => allowedCancerTypes.includes(cancer));
  return {
    name: service,
    label: process.env[`MATCHING_SERVICE_${serviceEnvName}_LABEL`] ?? service,
    url: process.env[`MATCHING_SERVICE_${serviceEnvName}_URL`] ?? `http://localhost/${service}`,
    searchRoute: '/getClinicalTrial',
    defaultValue: defaultMatchingServices.has(service),
    cancerTypes: cancerTypes,
  };
});

module.exports = {
  // Disable image optimization, as it's currently broken when Next.js is
  // running under IISnode.
  images: { unoptimized: true },
  poweredByHeader: false,
  reactStrictMode: true,
  publicRuntimeConfig: {
    fhirClientId: process.env.FHIR_CLIENT_ID,
    fhirRedirectUri: process.env.FHIR_REDIRECT_URI,
    fhirScope: process.env.FHIR_SCOPE,
    fhirQueryFlavor: process.env.SMART_FHIR_FLAVOR ?? 'sandbox',
    defaultZipCode: process.env.DEFAULT_ZIP_CODE,
    defaultTravelDistance: process.env.DEFAULT_TRAVEL_DISTANCE,
    sendLocationData: JSON.parse(process.env.SEND_LOCATION_DATA ?? 'false'),
    reactAppDebug: JSON.parse(process.env.REACT_APP_DEBUG ?? 'false'),
    disableSearchLocation: JSON.parse(process.env.DISABLE_SEARCH_LOCATION ?? 'false'),
    defaultSearchZipCode: process.env.DEFAULT_SEARCH_ZIP_CODE,
    defaultSearchTravelDistance: process.env.DEFAULT_SEARCH_TRAVEL_DISTANCE,
    resultsMax: process.env.RESULTS_MAX,
    siteRubric: allowedSiteRubrics.includes(process.env.SITE_RUBRIC) ? process.env.SITE_RUBRIC : 'none',
    services: matchingServices,
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
