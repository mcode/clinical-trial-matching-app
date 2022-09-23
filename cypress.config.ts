import { defineConfig } from 'cypress';

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:3200',
    setupNodeEvents(_on, _config) {
      // implement node event listeners here
    },
    supportFile: false,
  },
  chromeWebSecurity: false,
});
