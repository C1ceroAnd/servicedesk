import { jest } from '@jest/globals';

// Mock Repository Factories
export const createMockUserRepository = () => ({
  create: jest.fn() as any,
  findById: jest.fn() as any,
  findByEmail: jest.fn() as any,
  update: jest.fn() as any,
  delete: jest.fn() as any,
  list: jest.fn() as any,
});

export const createMockLocalRepository = () => ({
  findById: jest.fn() as any,
  create: jest.fn() as any,
  update: jest.fn() as any,
  delete: jest.fn() as any,
  list: jest.fn() as any,
});

export const createMockTicketRepository = () => ({
  findById: jest.fn() as any,
  create: jest.fn() as any,
  update: jest.fn() as any,
  findByUserId: jest.fn() as any,
  findByLocalId: jest.fn() as any,
  list: jest.fn() as any,
});

export const createMockPasswordHasher = () => ({
  hash: jest.fn() as any,
  compare: jest.fn() as any,
});

export const createMockJwtProvider = () => ({
  sign: jest.fn() as any,
  verify: jest.fn() as any,
});

// Fixture Factories
export const createUserFixture = (overrides: any = {}) => ({
  id: 1,
  name: 'Test User',
  email: 'test@example.com',
  role: 'USER',
  localId: 1,
  ...overrides,
});

export const createLocalFixture = (overrides: any = {}) => ({
  id: 1,
  name: 'Test Local',
  description: 'Test Description',
  ...overrides,
});

export const createTicketFixture = (overrides: any = {}) => ({
  id: 1,
  title: 'Test Ticket',
  description: 'Test Description',
  status: 'PENDING',
  userId: 1,
  localId: 1,
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

// Helper to reset all mocks in a repository
export const resetRepositoryMocks = (repository: any) => {
  Object.values(repository).forEach((mock: any) => {
    if (mock.mockReset) {
      mock.mockReset();
    }
  });
};
