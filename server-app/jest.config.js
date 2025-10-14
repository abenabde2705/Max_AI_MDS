export default {
  testEnvironment: 'node',
  transform: {},
  // extensionsToTreatAsEsm: ['.js'], // Removed as it's auto-inferred
  globals: {
    'ts-jest': {
      useESM: true
    }
  },
  coverageDirectory: 'coverage',
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/**/*.test.js',
    '!src/server.js'
  ],
  setupFilesAfterEnv: ['<rootDir>/src/tests/setup.js'],
  testMatch: [
    '<rootDir>/src/**/*.test.js'
  ]
};