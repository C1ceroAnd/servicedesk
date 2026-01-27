import { IUserRepository, ILocalRepository } from '../../ports/repositories.js';
import { IPasswordHasher } from '../../ports/providers.js';
import { normalizeRole } from '../../../domain/roles.js';

export class UpdateUser {
  constructor(
    private readonly users: IUserRepository,
    private readonly locals: ILocalRepository,
    private readonly hasher: IPasswordHasher,
  ) {}

  private sanitize(user: any) {
    const { password, ...rest } = user;
    return rest;
  }

  async execute(id: number, data: { name?: string; email?: string; password?: string; role?: string; localId?: number | null }) {
    const role = data.role ? normalizeRole(data.role) : undefined;

    if (data.email) {
      const existing = await this.users.findByEmail(data.email);
      if (existing && existing.id !== id) throw new Error('Email já cadastrado');
    }

    let localIdToUse: number | null | undefined = data.localId ?? undefined;
    if (role === 'USER') {
      if (!localIdToUse) throw new Error('localId é obrigatório para USER');
    }
    if (role && role !== 'USER') {
      localIdToUse = null as any;
    }

    if (typeof localIdToUse === 'number') {
      const existsLocal = await this.locals.findById(localIdToUse);
      if (!existsLocal) throw new Error('Local inválido');
    }

    const updates: any = {
      name: data.name,
      email: data.email,
      role,
      local: typeof localIdToUse === 'number' ? { connect: { id: localIdToUse } } : localIdToUse === null ? { disconnect: true } : undefined,
    };

    if (data.password) updates.password = await this.hasher.hash(data.password);

    const user = await this.users.update(id, updates);
    return this.sanitize(user);
  }
}
