import '@testing-library/jest-dom';
import { setLogger } from 'react-query';

jest.mock('next/image');

jest.mock('next/config', () => () => ({
  publicRuntimeConfig: {
    sendLocationData: true,
    services: [
      { name: 'service-1', label: 'Service 1', url: 'http://localhost:3002', searchRoute: '/getClinicalTrial' },
      { name: 'service-2', label: 'Service 2', url: 'http://localhost:3003', searchRoute: '/getClinicalTrial' },
    ],
  },
}));

setLogger({
  log: console.log,
  warn: console.warn,
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  error: () => {},
});
