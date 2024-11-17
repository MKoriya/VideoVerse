module.exports = {
    verbose: true,
    testEnvironment: 'node',
    testMatch: ['**/tests/**/*.test.js'],
    collectCoverage: true, // Enable coverage reporting
    collectCoverageFrom: ['src/**/*.js', '!src/server.js'], // Include source files for coverage
    coverageDirectory: './coverage',
    coverageReporters: ['text', 'lcov'],
    globalSetup: './tests/setup.js',
    globalTeardown: './tests/teardown.js',
};
