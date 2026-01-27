import { ILocalRepository } from '../../ports/repositories.js';

export class ListLocals {
  constructor(private readonly locals: ILocalRepository) {}
  async execute() {
    return this.locals.list();
  }
}
