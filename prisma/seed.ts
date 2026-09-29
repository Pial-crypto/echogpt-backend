import { PrismaClient, RoleName } from '@prisma/client';
import * as bcrypt from 'bcrypt';
const prisma = new PrismaClient();

async function main() {
  await prisma.role.upsert({
    where: {
      name: RoleName.USER,
    },
    update: {},
    create: {
      name: RoleName.USER,
    },
  });

  await prisma.role.upsert({
    where: {
      name: RoleName.ADMIN,
    },
    update: {},
    create: {
      name: RoleName.ADMIN,
    },
  });

  console.log('Roles seeded successfully');
  const adminRole = await prisma.role.findUnique({
  where: {
    name: RoleName.ADMIN,
  },
});

if (!adminRole) {
  throw new Error('Admin role not found');
}

const adminPasswordHash = await bcrypt.hash(
  'AdminPassword123!',
  12,
);

await prisma.user.upsert({
  where: {
    email: 'admin@echogpt.local',
  },
  update: {
    roleId: adminRole.id,
  },
  create: {
    email: 'admin@echogpt.local',
    passwordHash: adminPasswordHash,
    firstName: 'System',
    lastName: 'Admin',
    isVerified: true,
    roleId: adminRole.id,

    subscription: {
      create: {
        plan: 'PREMIUM',
        status: 'ACTIVE',
        requestLimit: 1000,
      },
    },
  },
});
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });