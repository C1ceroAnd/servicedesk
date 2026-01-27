import { ILocalRepository } from '../../ports/repositories';

export class ListLocals {
  constructor(private readonly locals: ILocalRepository) {}
  async execute() {
    return this.locals.list();
  }
}
