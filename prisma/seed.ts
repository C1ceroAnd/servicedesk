import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

async function ensureLocal(name: string) {
  const existing = await prisma.local.findFirst({ where: { name } });
  if (existing) return existing;
  return prisma.local.create({ data: { name } });
}

async function upsertUser(params: { name: string; email: string; password: string; role: 'ADMIN' | 'TECNICO' | 'USER'; localId?: number | null }) {
  const hashed = await bcrypt.hash(params.password, 10);
  return prisma.user.upsert({
    where: { email: params.email },
    update: {},
    create: {
      name: params.name,
      email: params.email,
      password: hashed,
      role: params.role,
      localId: params.localId ?? null,
    },
  });
}

async function main() {
  console.log('🌱 Seeding database...');

  const localCentral = await ensureLocal('Matriz');
  const localFilial = await ensureLocal('Filial');

  const admin = await upsertUser({
    name: 'Admin',
    email: 'admin@servicedesk.local',
    password: 'admin123',
    role: 'ADMIN',
    localId: null,
  });

  console.log('✅ Seed concluído');
  console.table({ admin: admin.email });
}

main()
  .catch((e) => {
    console.error('Seed error', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
