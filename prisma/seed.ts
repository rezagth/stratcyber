import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  await prisma.user.create({
    data: {
      id: 'demo-user-id',
      email: 'demo@stratcyber.local',
      password: 'test',
      role: 'user',
    },
  });
}
main();
