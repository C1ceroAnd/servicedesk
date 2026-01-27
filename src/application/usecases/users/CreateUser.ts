import { IUserRepository, ILocalRepository } from '../../ports/repositories';
import { IPasswordHasher } from '../../ports/providers';
import { normalizeRole } from '../../../domain/roles';

export class CreateUser {
  constructor(
    private readonly users: IUserRepository,
    private readonly locals: ILocalRepository,
    private readonly hasher: IPasswordHasher,
  ) {}

  private generatePassword(length: number = 12): string {
    const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
    let password = '';
    for (let i = 0; i < length; i++) {
      password += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    return password;
  }

  private sanitize(user: any) {
    const { password, ...rest } = user;
    return rest;
  }

  async execute(params: { name: string; email: string; role?: string; localId?: number | string | null }) {
    const role = normalizeRole(params.role);

    if (role === 'USER' && !params.localId) throw new Error('localId é obrigatório para USER');
    if (role !== 'USER') params.localId = null;

    const exists = await this.users.findByEmail(params.email);
    if (exists) throw new Error('Email já cadastrado');

    let localId: number | null = null;
    if (typeof params.localId === 'number') {
      const existsLocal = await this.locals.findById(params.localId);
      if (!existsLocal) throw new Error('Local inválido');
      localId = params.localId;
    } else if (typeof params.localId === 'string') {
      const trimmed = params.localId.trim();
      // Se for string numérica (ex: "3"), trata como ID
      const parsedId = parseInt(trimmed, 10);
      if (!isNaN(parsedId) && parsedId > 0 && String(parsedId) === trimmed) {
        const existsLocal = await this.locals.findById(parsedId);
        if (!existsLocal) throw new Error('Local inválido');
        localId = parsedId;
      } else {
        // Caso contrário, trata como nome de local
        const byName = await this.locals.findByName(trimmed);
        localId = byName ? byName.id : (await this.locals.create({ name: trimmed })).id;
      }
    }

    const generatedPassword = this.generatePassword();

    const passwordHash = await this.hasher.hash(generatedPassword);

    const user = await this.users.create({
      name: params.name,
      email: params.email,
      password: passwordHash,
      role,
      local: localId ? { connect: { id: localId } } : undefined,
    } as any);

    return { ...this.sanitize(user), tempPassword: generatedPassword };
  }
}
