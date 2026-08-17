const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {

    const count = await prisma.tickets.count();

    console.log('Tickets:', count);

}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());