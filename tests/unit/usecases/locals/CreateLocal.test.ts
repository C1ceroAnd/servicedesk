import { CreateLocal } from '../../../../src/application/usecases/locals/CreateLocal';
import { ILocalRepository } from '../../../../src/application/ports/repositories';

describe('CreateLocal', () => {
  let createLocal: CreateLocal;
  let mockLocalRepository: jest.Mocked<ILocalRepository>;

  beforeEach(() => {
    mockLocalRepository = {
      findById: jest.fn(),
      findByName: jest.fn(),
      create: jest.fn(),
      listActive: jest.fn(),
      delete: jest.fn(),
      hasOpenTickets: jest.fn(),
    };

    createLocal = new CreateLocal(mockLocalRepository);
  });

  it('deve criar local com nome apenas', async () => {
    const params = {
      name: 'Setor TI',
    };

    mockLocalRepository.create.mockResolvedValue({
      id: 1,
      name: params.name,
      address: null,
      active: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const result = await createLocal.execute(params);

    expect(result.name).toBe('Setor TI');
    expect(mockLocalRepository.create).toHaveBeenCalledWith({
      name: params.name,
      address: null,
    });
  });

  it('deve criar local com nome e endereço', async () => {
    const params = {
      name: 'Setor Financeiro',
      address: 'Rua A, 123 - Sala 201',
    };

    mockLocalRepository.create.mockResolvedValue({
      id: 2,
      name: params.name,
      address: null,
      active: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const result = await createLocal.execute(params);

    expect(result.name).toBe('Setor Financeiro');
    expect(mockLocalRepository.create).toHaveBeenCalledWith({
      name: params.name,
      address: params.address,
    });
  });

  it('deve criar local com address null se não fornecido', async () => {
    const params = {
      name: 'Recepção',
      address: null,
    };

    mockLocalRepository.create.mockResolvedValue({
      id: 3,
      name: params.name,
      address: null,
      active: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const result = await createLocal.execute(params);

    expect(result.name).toBe('Recepção');
    expect(mockLocalRepository.create).toHaveBeenCalledWith({
      name: params.name,
      address: null,
    });
  });
});
