import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const users = await prisma.user.findMany();
    users.forEach(u => console.log(`${u.email} - ${u.nome} - Status: ${u.status_verificacao}`));

    // Test the newly fixed logic for a specific user
    const pendingDocs = await prisma.document.findMany({
        where: { status: 'PENDING' }
    });
    console.log(`\nPending Docs Count: ${pendingDocs.length}`);
}

main().finally(() => prisma.$disconnect());
