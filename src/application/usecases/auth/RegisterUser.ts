import { IUserRepository, ILocalRepository } from '../../ports/repositories';
import { IPasswordHasher } from '../../ports/providers';
import { normalizeRole } from '../../../domain/roles';

export type RegisterInput = { name: string; email: string; password: string; role?: string; localId?: number | null };

export class RegisterUser {
  constructor(
    private readonly users: IUserRepository,
    private readonly locals: ILocalRepository,
    private readonly hasher: IPasswordHasher,
  ) {}

  private sanitize(user: any) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...rest } = user;
    return rest;
  }

  async execute(params: RegisterInput) {
    const role = normalizeRole(params.role);

    if (role === 'USER' && !params.localId) {
      throw new Error('localId é obrigatório para USER');
    }

    if (role !== 'USER') {
      params.localId = null;
    }

    const exists = await this.users.findByEmail(params.email);
    if (exists) throw new Error('Email já cadastrado');

    if (params.localId) {
      const local = await this.locals.findById(params.localId);
      if (!local) throw new Error('Local inválido');
    }

    const hashed = await this.hasher.hash(params.password);

    const user = await this.users.create({
      name: params.name,
      email: params.email,
      password: hashed,
      role,
      local: params.localId ? { connect: { id: params.localId } } : undefined,
    } as any);

    return this.sanitize(user);
  }
}
