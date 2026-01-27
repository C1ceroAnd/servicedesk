import jwt from 'jsonwebtoken';
import { ITokenProvider } from '../../application/ports/providers';
import { config } from '../../config/env';

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

export class JwtTokenProvider implements ITokenProvider<any> {
  sign(payload: any, options?: { expiresIn?: string | number }): string {
    return jwt.sign(payload, config.jwt.secret as string, { expiresIn: options?.expiresIn || config.jwt.expiresIn } as any);
  }

  signAccessToken(payload: any): string {
    return jwt.sign(payload, config.jwt.secret as string, { expiresIn: config.jwt.expiresIn } as any);
  }

  signRefreshToken(payload: any): string {
    return jwt.sign(payload, config.jwt.refreshSecret as string, { expiresIn: config.jwt.refreshExpiresIn } as any);
  }

  signTokenPair(payload: any): TokenPair {
    return {
      accessToken: this.signAccessToken(payload),
      refreshToken: this.signRefreshToken(payload),
    };
  }

  verifyAccessToken(token: string): any {
    try {
      return jwt.verify(token, config.jwt.secret as string);
    } catch (error) {
      throw new Error('Token de acesso inválido');
    }
  }

  verifyRefreshToken(token: string): any {
    try {
      return jwt.verify(token, config.jwt.refreshSecret as string);
    } catch (error) {
      throw new Error('Token de atualização inválido ou expirado');
    }
  }
}
