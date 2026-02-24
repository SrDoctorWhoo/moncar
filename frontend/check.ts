import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log("--- Passenger Document Configs ---");
    const configs = await (prisma as any).documentConfig.findMany({
        where: { perfil: 'PASSENGER' }
    });
    console.log(configs);

    console.log("\n--- Passenger Documents ---");
    const user = await prisma.user.findUnique({
        where: { email: 'maria.passageira@email.com' }
    });

    if (user) {
        const docs = await prisma.document.findMany({
            where: { user_id: user.id }
        });
        console.log(docs);
        console.log(`\nUser Status: ${user.status_verificacao}`);
    }
}

main().finally(() => prisma.$disconnect());
