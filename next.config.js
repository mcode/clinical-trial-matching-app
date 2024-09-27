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
  const cancerTypesString = process.env[`MATCHING_SERVICE_${serviceEnvName}_CANCER_TYPES`];
  const cancerTypes = cancerTypesString
    ? cancerTypesString.split(/\s*,\s*/).filter(cancer => allowedCancerTypes.includes(cancer))
    : [];
  if (cancerTypes.length === 0) {
    console.error(`Warning: ${service} has no cancer types set.`);
  }
  return {
    name: service,
    label: process.env[`MATCHING_SERVICE_${serviceEnvName}_LABEL`] ?? service,
    url: process.env[`MATCHING_SERVICE_${serviceEnvName}_URL`] ?? `http://localhost/${service}`,
    searchRoute: '/getClinicalTrial',
    defaultValue: defaultMatchingServices.has(service),
    cancerTypes: cancerTypes,
  };
});

function parseEnvInt(stringValue, defaultValue, min, max) {
  let value = Number(stringValue);
  return isNaN(value) ? defaultValue : Math.min(Math.max(Math.floor(value), min), max);
}

/** @type {import('next').NextConfig} */
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
    resultsMax: parseEnvInt(process.env.RESULTS_MAX, 15, 1, 15),
    siteRubric: allowedSiteRubrics.includes(process.env.SITE_RUBRIC) ? process.env.SITE_RUBRIC : 'none',
    services: matchingServices,
    fhirlessPatient: {
      id: 'example',
      name: process.env.FHIRLESS_PATIENT_NAME ?? 'Test Launch',
      gender: process.env.FHIRLESS_PATIENT_GENDER ?? 'male',
      age: parseEnvInt(process.env.FHIRLESS_PATIENT_AGE, 35, 1, 150),
      zipcode: process.env.FHIRLESS_PATIENT_ZIPCODE ?? null,
    },
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
