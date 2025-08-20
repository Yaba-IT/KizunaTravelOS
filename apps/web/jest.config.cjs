module.exports = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['@testing-library/jest-dom'],
  transform: {
    '\\.[jt]sx?$': 'babel-jest',
  },
  reporters: ['default', ['jest-junit', { outputDirectory: './', outputName: 'junit.xml' }]],
};
