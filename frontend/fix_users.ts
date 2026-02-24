import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log("Fixing affected users...");
    // Find users who are PENDING
    const pendingUsers = await prisma.user.findMany({
        where: { status_verificacao: 'PENDING' }
    });

    for (const user of pendingUsers) {
        // Fetch their documents
        const docs = await prisma.document.findMany({
            where: { user_id: user.id }
        });

        // Check if they uploaded the required docs and all are APPROVED
        const hasRgCnh = docs.some(d => d.tipo_documento === 'RG_CNH' && d.status === 'APPROVED');
        const hasCrianca = docs.some(d => d.tipo_documento === 'CRIANCA' && d.status === 'APPROVED');
        const hasCnhMotorista = user.tipo_perfil === 'DRIVER'
            ? docs.some(d => d.tipo_documento === 'CNH_MOTORISTA' && d.status === 'APPROVED')
            : true;

        if (hasRgCnh && hasCrianca && hasCnhMotorista) {
            await prisma.user.update({
                where: { id: user.id },
                data: { status_verificacao: 'VERIFIED' }
            });
            console.log(`Updated user ${user.email} to VERIFIED!`);
        }
    }
}

main().finally(() => prisma.$disconnect());
