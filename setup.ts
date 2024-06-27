const { PrismaClient } = require('@prisma/client');

const argon = require('argon2');

const prisma = new PrismaClient();

async function setup() {
  await prisma.role.create({
    data: {
      name: 'USER',
    },
  });

  const admin = await prisma.role.create({
    data: {
      name: 'ADMIN',
    },
  });

  // save user
  await prisma.user.create({
    data: {
      firstName: 'ADMIN',
      lastName: 'ADMIN',
      address: 'Just for Admin',
      dateOfBirth: new Date(),
      email: 'guds.admin@gmail.com',
      phoneNumber: '0999999999',
      gender: 'MALE',
    },
  });

  const hashedPass = await argon.hash('123456789');

  // save account
  const user = await prisma.account.create({
    data: {
      userPhoneNumber: '0999999999',
      password: hashedPass,
      status: 'ACTIVE',
      roleId: admin.id,
    },
  });
}

setup()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
