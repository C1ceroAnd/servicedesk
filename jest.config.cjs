/** @type {import('jest').Config} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  roots: ['<rootDir>/tests'],
  testMatch: ['**/*.test.ts'],
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  
  // Otimizações de Performance
  maxWorkers: '50%',
  bail: false,
  
  // Transform otimizado para ts-jest
  transform: {
    '^.+\\.ts$': ['ts-jest', {
      tsconfig: 'tsconfig.test.json',
      disableSolutionSearch: true,
      useESM: false,
    }]
  },
  
  // Cache para melhor performance
  cache: true,
  cacheDirectory: '<rootDir>/.jest-cache',
  
  // Coverage otimizado
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
    '!src/server.ts',
    '!src/frontend/**',
    '!src/types/**',
    '!src/core/**',
    '!src/config/**',
    '!src/routes/**',
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  
  // Mock management
  clearMocks: true,
  resetMocks: true,
  restoreMocks: true,
  
  // Evitar avisos desnecessários
  testPathIgnorePatterns: ['/node_modules/'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1'
  },
  
  // Aumentar timeout global dos testes
  testTimeout: 10000,
  
  // Ignorar transformações de dependencies (melhor performance)
  transformIgnorePatterns: ['/node_modules/']
};
