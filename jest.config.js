const { createDefaultPreset } = require('ts-jest');

const tsJestTransformCfg = createDefaultPreset().transform;

/** @type {import("jest").Config} **/
module.exports = {
  testEnvironment: 'jsdom',
  transform: {
    ...tsJestTransformCfg,
    // 'src/python-analyzer/.+\\.(j|t)sx?$': 'ts-jest',
  },
  // transformIgnorePatterns: ['src/(?!python-analyzer/.*)'],
  // testMatch: ['**/?(*.)+(spec|test).[jt]s?(x)'],
  testPathIgnorePatterns: ['/node_modules/', '/.next/', '/cypress/'],
};
