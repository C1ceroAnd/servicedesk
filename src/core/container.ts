import { PrismaClient } from '@prisma/client';
import { PrismaUserRepository } from '../infrastructure/repositories/PrismaUserRepository.js';
import { PrismaLocalRepository } from '../infrastructure/repositories/PrismaLocalRepository.js';
import { PrismaTicketRepository } from '../infrastructure/repositories/PrismaTicketRepository.js';
import { BcryptPasswordHasher } from '../infrastructure/providers/BcryptPasswordHasher.js';
import { JwtTokenProvider } from '../infrastructure/providers/JwtTokenProvider.js';
import { RegisterUser } from '../application/usecases/auth/RegisterUser.js';
import { LoginUser } from '../application/usecases/auth/LoginUser.js';
import { RefreshToken } from '../application/usecases/auth/RefreshToken.js';
import { CreateUser } from '../application/usecases/users/CreateUser.js';
import { ListUsers } from '../application/usecases/users/ListUsers.js';
import { UpdateUser } from '../application/usecases/users/UpdateUser.js';
import { DeleteUser } from '../application/usecases/users/DeleteUser.js';
import { CreateLocal } from '../application/usecases/locals/CreateLocal.js';
import { ListLocals } from '../application/usecases/locals/ListLocals.js';
import { DeleteLocal } from '../application/usecases/locals/DeleteLocal.js';
import { UpdateLocal } from '../application/usecases/locals/UpdateLocal.js';
import { CreateTicket } from '../application/usecases/tickets/CreateTicket.js';
import { ListTickets } from '../application/usecases/tickets/ListTickets.js';
import { AcceptTicket } from '../application/usecases/tickets/AcceptTicket.js';
import { FinalizeTicket } from '../application/usecases/tickets/FinalizeTicket.js';
import { CancelTicket } from '../application/usecases/tickets/CancelTicket.js';
import { RejectTicket } from '../application/usecases/tickets/RejectTicket.js';

type Token<T> = symbol;

type Provider<T> = {
  factory: (resolver: Resolver) => T;
  singleton: boolean;
};

type Resolver = {
  resolve: <T>(token: Token<T>) => T;
};

class Container {
  private providers = new Map<Token<unknown>, Provider<unknown>>();
  private singletons = new Map<Token<unknown>, unknown>();

  registerSingleton<T>(token: Token<T>, factory: (resolver: Resolver) => T) {
    this.providers.set(token as Token<unknown>, { factory: factory as any, singleton: true });
  }

  resolve<T>(token: Token<T>): T {
    if (this.singletons.has(token)) {
      return this.singletons.get(token) as T;
    }

    const provider = this.providers.get(token as Token<unknown>);
    if (!provider) {
      throw new Error(`Provider not found for token`);
    }

    const instance = (provider as Provider<any>).factory({
      resolve: <K>(other: Token<K>) => this.resolve(other),
    });

    if (provider.singleton) {
      this.singletons.set(token, instance as unknown);
    }

    return instance as T;
  }
}

export const TOKENS = {
  prisma: Symbol('PrismaClient'),
  userRepo: Symbol('UserRepository'),
  localRepo: Symbol('LocalRepository'),
  ticketRepo: Symbol('TicketRepository'),
  passwordHasher: Symbol('PasswordHasher'),
  tokenProvider: Symbol('TokenProvider'),
  registerUser: Symbol('RegisterUser'),
  loginUser: Symbol('LoginUser'),
  refreshToken: Symbol('RefreshToken'),
  createUser: Symbol('CreateUser'),
  listUsers: Symbol('ListUsers'),
  updateUser: Symbol('UpdateUser'),
  deleteUser: Symbol('DeleteUser'),
  createLocal: Symbol('CreateLocal'),
  listLocals: Symbol('ListLocals'),
  updateLocal: Symbol('UpdateLocal'),
  deleteLocal: Symbol('DeleteLocal'),
  createTicket: Symbol('CreateTicket'),
  listTickets: Symbol('ListTickets'),
  acceptTicket: Symbol('AcceptTicket'),
  finalizeTicket: Symbol('FinalizeTicket'),
  cancelTicket: Symbol('CancelTicket'),
  rejectTicket: Symbol('RejectTicket'),
} as const;

type TokenMap = typeof TOKENS;
export type TokenKey = TokenMap[keyof TokenMap];

export const container = new Container();

// Registry
container.registerSingleton(TOKENS.prisma, () => new PrismaClient());
// repositories
container.registerSingleton(TOKENS.userRepo, ({ resolve }) => new PrismaUserRepository(resolve(TOKENS.prisma) as PrismaClient));
container.registerSingleton(TOKENS.localRepo, ({ resolve }) => new PrismaLocalRepository(resolve(TOKENS.prisma) as PrismaClient));
container.registerSingleton(TOKENS.ticketRepo, ({ resolve }) => new PrismaTicketRepository(resolve(TOKENS.prisma) as PrismaClient));

// providers
container.registerSingleton(TOKENS.passwordHasher, () => new BcryptPasswordHasher());
container.registerSingleton(TOKENS.tokenProvider, () => new JwtTokenProvider());

// usecases
container.registerSingleton(TOKENS.registerUser, ({ resolve }) => new RegisterUser(
  resolve(TOKENS.userRepo) as any,
  resolve(TOKENS.localRepo) as any,
  resolve(TOKENS.passwordHasher) as any,
));

container.registerSingleton(TOKENS.loginUser, ({ resolve }) => new LoginUser(
  resolve(TOKENS.userRepo) as any,
  resolve(TOKENS.passwordHasher) as any,
  resolve(TOKENS.tokenProvider) as any,
));

container.registerSingleton(TOKENS.refreshToken, ({ resolve }) => new RefreshToken(
  resolve(TOKENS.tokenProvider) as any,
));

container.registerSingleton(TOKENS.createUser, ({ resolve }) => new CreateUser(
  resolve(TOKENS.userRepo) as any,
  resolve(TOKENS.localRepo) as any,
  resolve(TOKENS.passwordHasher) as any,
));

container.registerSingleton(TOKENS.listUsers, ({ resolve }) => new ListUsers(resolve(TOKENS.userRepo) as any));
container.registerSingleton(TOKENS.updateUser, ({ resolve }) => new UpdateUser(
  resolve(TOKENS.userRepo) as any,
  resolve(TOKENS.localRepo) as any,
  resolve(TOKENS.passwordHasher) as any,
));
container.registerSingleton(TOKENS.deleteUser, ({ resolve }) => new DeleteUser(
  resolve(TOKENS.userRepo) as any,
  resolve(TOKENS.ticketRepo) as any,
));

container.registerSingleton(TOKENS.createLocal, ({ resolve }) => new CreateLocal(resolve(TOKENS.localRepo) as any));
container.registerSingleton(TOKENS.listLocals, ({ resolve }) => new ListLocals(resolve(TOKENS.localRepo) as any));
container.registerSingleton(TOKENS.updateLocal, ({ resolve }) => new UpdateLocal(resolve(TOKENS.localRepo) as any));
container.registerSingleton(TOKENS.deleteLocal, ({ resolve }) => new DeleteLocal(resolve(TOKENS.localRepo) as any));

container.registerSingleton(TOKENS.createTicket, ({ resolve }) => new CreateTicket(
  resolve(TOKENS.ticketRepo) as any,
  resolve(TOKENS.userRepo) as any,
  resolve(TOKENS.localRepo) as any,
));
container.registerSingleton(TOKENS.listTickets, ({ resolve }) => new ListTickets(resolve(TOKENS.ticketRepo) as any));
container.registerSingleton(TOKENS.acceptTicket, ({ resolve }) => new AcceptTicket(resolve(TOKENS.ticketRepo) as any));
container.registerSingleton(TOKENS.finalizeTicket, ({ resolve }) => new FinalizeTicket(resolve(TOKENS.ticketRepo) as any));
container.registerSingleton(TOKENS.cancelTicket, ({ resolve }) => new CancelTicket(resolve(TOKENS.ticketRepo) as any));
container.registerSingleton(TOKENS.rejectTicket, ({ resolve }) => new RejectTicket(resolve(TOKENS.ticketRepo) as any));
