import { IUserRepository } from '../../ports/repositories.js';
import { IPasswordHasher, ITokenProvider } from '../../ports/providers.js';
import { JwtTokenProvider } from '../../../infrastructure/providers/JwtTokenProvider.js';
import { Role } from '../../../domain/roles.js';

export type LoginInput = { email: string; password: string };
export type LoginOutput = { 
  accessToken: string; 
  refreshToken: string;
  user: Omit<ReturnType<LoginUser['sanitize']>, 'password'> 
};

export class LoginUser {
  constructor(
    private readonly users: IUserRepository,
    private readonly hasher: IPasswordHasher,
    private readonly tokens: JwtTokenProvider,
  ) {}

  private sanitize(user: any) {
    const { password, ...rest } = user;
    return rest;
  }

  async execute(input: LoginInput): Promise<LoginOutput> {
    const user = await this.users.findByEmail(input.email);
    if (!user) throw new Error('Credenciais inválidas');

    const ok = await this.hasher.compare(input.password, (user as any).password);
    if (!ok) throw new Error('Credenciais inválidas');

    const { accessToken, refreshToken } = this.tokens.signTokenPair({ 
      id: user.id, 
      role: user.role as Role, 
      localId: user.localId ?? null 
    });
    
    return { accessToken, refreshToken, user: this.sanitize(user) };
  }
}
