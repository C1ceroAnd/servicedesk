import { ILocalRepository } from '../../ports/repositories';

export class CreateLocal {
  constructor(private readonly locals: ILocalRepository) {}
  async execute(params: { name: string }) {
    return this.locals.create({ name: params.name } as any);
  }
}
