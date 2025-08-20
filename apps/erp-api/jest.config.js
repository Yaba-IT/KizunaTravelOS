
module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/__tests__/**/*.[jt]s?(x)', '**/?(*.)+(test|spec).[jt]s?(x)'],
  collectCoverage: true,
  coverageDirectory: 'coverage',
  testPathIgnorePatterns: ['/node_modules/', '/dist/', '/build/'],
  reporters: ['default', ['jest-junit', { outputDirectory: './', outputName: 'junit.xml' }]],
};
