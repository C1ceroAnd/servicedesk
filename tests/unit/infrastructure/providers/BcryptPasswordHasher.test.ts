import { BcryptPasswordHasher } from '../../../../src/infrastructure/providers/BcryptPasswordHasher';

describe('Hash de Senha com Bcrypt', () => {
  let hasher: BcryptPasswordHasher;

  beforeEach(() => {
    hasher = new BcryptPasswordHasher();
  });

  describe('hash', () => {
    it('deve fazer hash de uma senha', async () => {
      const password = 'minha_senha_123';
      const hashed = await hasher.hash(password);

      expect(hashed).toBeDefined();
      expect(hashed).not.toBe(password);
      expect(hashed.length).toBeGreaterThan(0);
    });

    it('deve gerar hashes diferentes para a mesma senha', async () => {
      const password = 'minha_senha_123';
      const hash1 = await hasher.hash(password);
      const hash2 = await hasher.hash(password);

      expect(hash1).not.toBe(hash2);
    });
  });

  describe('compare', () => {
    it('deve validar senha correta', async () => {
      const password = 'minha_senha_123';
      const hashed = await hasher.hash(password);
      const isValid = await hasher.compare(password, hashed);

      expect(isValid).toBe(true);
    });

    it('deve rejeitar senha incorreta', async () => {
      const password = 'minha_senha_123';
      const wrongPassword = 'senha_errada';
      const hashed = await hasher.hash(password);
      const isValid = await hasher.compare(wrongPassword, hashed);

      expect(isValid).toBe(false);
    });
  });
});
