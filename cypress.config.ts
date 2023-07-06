import { defineConfig } from 'cypress';

export default defineConfig({
  defaultCommandTimeout: 20000,
  e2e: {
    baseUrl: 'http://localhost:3000',
  },
  retries: {
    runMode: 2,
  },
});
