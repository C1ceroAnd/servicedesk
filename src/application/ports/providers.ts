export interface IPasswordHasher {
  hash(plain: string): Promise<string>;
  compare(plain: string, hash: string): Promise<boolean>;
}

export interface ITokenProvider<TPayload extends object = any> {
  sign(payload: TPayload, options?: { expiresIn?: string | number }): string;
}
