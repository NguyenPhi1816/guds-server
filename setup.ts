const { PrismaClient } = require('@prisma/client');

const argon = require('argon2');

const prisma = new PrismaClient();

async function setup() {
  await prisma.userRole.create({
    data: {
      Name: 'USER',
    },
  });

  const admin = await prisma.userRole.create({
    data: {
      Name: 'ADMIN',
    },
  });

  // save user
  await prisma.user.create({
    data: {
      FirstName: 'ADMIN',
      LastName: 'ADMIN',
      Address: 'Just for Admin',
      DateOfBirth: new Date(),
      Email: 'guds.admin@gmail.com',
      PhoneNumber: '0999999999',
      Gender: 'MALE',
    },
  });

  const hashedPass = await argon.hash('123456789');

  // save account
  const user = await prisma.account.create({
    data: {
      UserPhoneNumber: '0999999999',
      Password: hashedPass,
      Status: 'ACTIVE',
      UserRoleId: admin.Id,
    },
  });

  await prisma.cart.create({
    data: {
      UserId: user.Id,
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
