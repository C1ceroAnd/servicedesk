import { ITokenProvider } from '../../ports/providers';
import { JwtTokenProvider } from '../../../infrastructure/providers/JwtTokenProvider';

export class RefreshToken {
  constructor(private readonly tokenProvider: JwtTokenProvider) {}

  async execute(refreshToken: string): Promise<{ accessToken: string; refreshToken: string }> {
    const payload = this.tokenProvider.verifyRefreshToken(refreshToken);

    const newTokens = this.tokenProvider.signTokenPair({
      id: payload.id,
      email: payload.email,
      role: payload.role,
    });

    return newTokens;
  }
}
