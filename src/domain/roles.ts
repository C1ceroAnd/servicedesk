export type Role = 'ADMIN' | 'TECNICO' | 'USER';

export const ALLOWED_ROLES: Role[] = ['ADMIN', 'TECNICO', 'USER'];

export function normalizeRole(role?: string): Role {
  const normalized = (role || 'USER').toUpperCase();
  if (!ALLOWED_ROLES.includes(normalized as Role)) {
    throw new Error('Role inválido');
  }
  return normalized as Role;
}
