module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/__tests__/**/*.test.[jt]s?(x)'],
  transform: {
    '^.+\\.[jt]sx?$': ['babel-jest', { configFile: './babel.config.js' }],
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
};
