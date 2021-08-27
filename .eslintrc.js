const path = require('path');

module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  parserOptions: {
    sourceType: 'module',
  },
  extends: [
    'plugin:react-hooks/recommended',
    'plugin:jest-dom/recommended',
    'plugin:@next/next/recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:prettier/recommended',
  ],
  plugins: ['react'],
  env: {
    browser: true,
    es6: true,
  },
  globals: {
    process: 'readonly',
  },
  rules: {
    '@typescript-eslint/no-empty-interface': [
      'error',
      {
        allowSingleExtends: true,
      },
    ],
  },
  settings: {
    react: {
      version: 'detect',
    },
    'import/resolver': {
      alias: {
        map: [['@', path.resolve('./src')]],
        extensions: ['.js', '.png'],
      },
    },
  },
  overrides: [
    {
      files: [
        '.eslintrc.js',
        'jest.config.js',
        'jest.setup.js',
        'next.config.js',
        'server.js',
        'src/**/__mocks__/**/*.js',
      ],
      env: {
        node: true,
      },
      rules: {
        '@typescript-eslint/no-var-requires': 'off',
        'no-console': 'off',
      },
    },
  ],
};
