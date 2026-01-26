export interface User {
  id: number;
  name: string;
  email: string;
  role: 'ADMIN' | 'TECNICO' | 'USER';
  localId?: number;
  createdAt?: string;
}

export interface Local {
  id: number;
  name: string;
  createdAt?: string;
}

export interface Ticket {
  id: number;
  title: string;
  description: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  userId: number;
  localId: number;
  tecnicoId?: number;
  createdAt: string;
  dataAceito?: string;
  dataFechamento?: string;
}

export interface TicketWithRelations extends Ticket {
  user?: { id: number; name: string; email: string };
  local?: { id: number; name: string };
  tecnico?: { id: number; name: string; email: string };
}

export interface TicketFilters {
  status: string;
  tecnicoId: string;
  localId: string;
}

export interface UserFormData {
  name: string;
  email: string;
  role: 'USER' | 'TECNICO';
  localId: string;
}

export interface LocalFormData {
  name: string;
  active: boolean;
}

export interface TicketFormData {
  title: string;
  description: string;
  localId: string;
}
