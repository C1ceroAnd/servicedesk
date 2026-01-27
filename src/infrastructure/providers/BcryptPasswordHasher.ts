import bcrypt from 'bcryptjs';
import { IPasswordHasher } from '../../application/ports/providers.js';

export class BcryptPasswordHasher implements IPasswordHasher {
  hash(plain: string) {
    return bcrypt.hash(plain, 10);
  }
  compare(plain: string, hash: string) {
    return bcrypt.compare(plain, hash);
  }
}
