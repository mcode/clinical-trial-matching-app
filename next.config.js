// Transpile modules so that they support IE11. There does not appear to be a
// way to say "transpile everything."
const withTM = require('next-transpile-modules')([
  '@emotion/react',
  '@emotion/serialize',
  '@emotion/styled',
  '@mui/base',
  '@mui/material',
  '@mui/private-theming',
  '@mui/styled-engine',
  '@mui/system',
  '@mui/utils',
  'react-hook-form',
]);
const enabledMatchingServices = process.env.MATCHING_SERVICES;
if (!enabledMatchingServices || /^\s*$/.test(enabledMatchingServices)) {
  console.error(
    'Warning: no matching services present in environment, no matching services will be present in the UI!'
  );
}

const defaultMatchingServices = new Set((process.env.MATCHING_SERVICES_DEFAULT_ENABLED ?? '').split(/\s*,\s*/));

const matchingServices = enabledMatchingServices.split(/\s*,\s*/).map(service => {
  const serviceEnvName = service.toUpperCase();
  return {
    name: service,
    label: process.env[`MATCHING_SERVICE_${serviceEnvName}_LABEL`] ?? service,
    url: process.env[`MATCHING_SERVICE_${serviceEnvName}_URL`] ?? `http://localhost/${service}`,
    searchRoute: '/getClinicalTrial',
    defaultValue: defaultMatchingServices.has(service),
  };
});

module.exports = withTM({
  watch: true, // Enable watch mode
  poweredByHeader: false,
  reactStrictMode: true,
  publicRuntimeConfig: {
    fhirClientId: process.env.FHIR_CLIENT_ID,
    defaultZipCode: process.env.DEFAULT_ZIP_CODE,
    sendLocationData: JSON.parse(process.env.SEND_LOCATION_DATA ?? 'false'),
    reactAppDebug: JSON.parse(process.env.REACT_APP_DEBUG ?? 'false'),
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
    // Disable minification (useful for debugging IE11).
    // Left commented out because it greatly bloats the script size.
    // config.optimization.minimize = false;

    return config;
  },
});
