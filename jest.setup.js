import '@testing-library/jest-dom/extend-expect';
import { setLogger } from 'react-query';

jest.mock('next/image');

setLogger({
  log: console.log,
  warn: console.warn,
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  error: () => {},
});
