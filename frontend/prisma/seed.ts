import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
    console.log('Seeding database...');

    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash('123456', salt);

    // 1. Create Admin
    const admin = await prisma.user.upsert({
        where: { email: 'admin@momcar.com' },
        update: {},
        create: {
            email: 'admin@momcar.com',
            senha: hashedPassword,
            nome: 'Administradora Geral',
            tipo_perfil: 'ADMIN',
            status_verificacao: 'VERIFIED'
        },
    });

    // 2. Create Passenger (Verified)
    const passenger = await prisma.user.upsert({
        where: { email: 'maria.passageira@email.com' },
        update: {},
        create: {
            email: 'maria.passageira@email.com',
            senha: hashedPassword,
            nome: 'Maria Silva',
            tipo_perfil: 'PASSENGER',
            status_verificacao: 'VERIFIED'
        },
    });

    // 3. Create Driver (Verified)
    const driver = await prisma.user.upsert({
        where: { email: 'joana.motorista@email.com' },
        update: {},
        create: {
            email: 'joana.motorista@email.com',
            senha: hashedPassword,
            nome: 'Joana Souza',
            tipo_perfil: 'DRIVER',
            status_verificacao: 'VERIFIED'
        },
    });

    // 4. Create Driver Route (e.g. going from some point A to School B)
    const driverRoute = await prisma.route.create({
        data: {
            user_id: driver.id,
            origem_lat: -23.550520,  // São Paulo center mock
            origem_lng: -46.633308,
            destino_lat: -23.561684, // Paulista Ave mock
            destino_lng: -46.655981,
            polyline: "mock_polyline_xyz",
            horario_ida: '07:00',
            horario_volta: '12:30'
        }
    });

    console.log('Database seeded perfectly!');
    console.log(`Admin ID: ${admin.id} | Email: ${admin.email}`);
    console.log(`Passenger ID: ${passenger.id} | Email: ${passenger.email}`);
    console.log(`Driver ID: ${driver.id} | Email: ${driver.email}`);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
