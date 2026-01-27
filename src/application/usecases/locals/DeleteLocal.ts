import { ILocalRepository } from '../../ports/repositories';

export class DeleteLocal {
  constructor(private readonly locals: ILocalRepository) {}
  async execute(id: number) {
    const hasOpen = await this.locals.hasOpenTickets(id);
    if (hasOpen) throw new Error('Não é possível deletar local com chamados pendentes ou em andamento');
    await this.locals.delete(id);
  }
}
