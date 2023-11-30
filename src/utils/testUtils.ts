import type { NextRouter } from 'next/router';

export const createMockRouter = (props: Partial<NextRouter> = {}): NextRouter => ({
  route: '/',
  pathname: '/',
  query: {},
  asPath: '/',
  basePath: '/',
  isLocaleDomain: true,
  push: jest.fn(),
  replace: jest.fn(),
  reload: jest.fn(),
  back: jest.fn(),
  beforePopState: jest.fn(),
  prefetch: jest.fn(),
  isFallback: false,
  isReady: true,
  isPreview: false,
  events: {
    on: jest.fn(),
    off: jest.fn(),
    emit: jest.fn(),
  },
  ...props,
});
