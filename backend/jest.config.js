export default {
  testEnvironment: 'node',
  transform: {},
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1',
  },
  testMatch: ['**/*.test.js'],
  collectCoverageFrom: [
    'utils/**/*.js',
    'services/**/*.js',
    'controllers/**/*.js',
    'middleware/**/*.js',
    '!**/*.test.js',
  ],
};
