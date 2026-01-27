import { ILocalRepository } from '../../ports/repositories';

export class UpdateLocal {
  constructor(private readonly locals: ILocalRepository) {}

  async execute(id: number, data: { name?: string }) {
    const existing = await this.locals.findById(id);
    if (!existing) throw new Error('Local não encontrado');

    const payload: any = {};
    if (data.name !== undefined) payload.name = data.name;

    if (Object.keys(payload).length === 0) return existing;

    return this.locals.update(id, payload);
  }
}
