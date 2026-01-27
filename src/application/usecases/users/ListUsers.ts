import { IUserRepository } from '../../ports/repositories';

export class ListUsers {
  constructor(private readonly users: IUserRepository) {}
  async execute() {
    const list = await this.users.list();
    return list.map((u: any) => {
      const { password, ...rest } = u;
      return rest;
    });
  }
}
