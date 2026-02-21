import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";

function getDistanceInKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Radius in km
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

function getTimeDifferenceMinutes(t1: string, t2: string): number {
    const [h1, m1] = t1.split(':').map(Number);
    const [h2, m2] = t2.split(':').map(Number);
    const date1 = new Date(1970, 0, 1, h1, m1);
    const date2 = new Date(1970, 0, 1, h2, m2);
    return Math.abs((date1.getTime() - date2.getTime()) / 60000);
}

export async function GET(
    req: Request,
    { params }: { params: Promise<{ routeId: string }> }
) {
    try {
        const resolvedParams = await params;
        const { routeId } = resolvedParams;

        const session = await getServerSession(authOptions);
        if (!session?.user || (session.user as any).verifiedStatus !== 'VERIFIED') {
            return NextResponse.json({ message: "Perfil não verificado ou não autorizado" }, { status: 403 });
        }

        // 1. Get my route
        const myRoute = await prisma.route.findUnique({ where: { id: routeId } });
        if (!myRoute) return NextResponse.json({ message: 'Rota não encontrada' }, { status: 404 });

        // 2. Load potential drivers
        const potentialDrivers = await prisma.route.findMany({
            where: {
                user_id: { not: session.user.id },
                user: {
                    status_verificacao: 'VERIFIED',
                    tipo_perfil: 'DRIVER'
                }
            },
            include: {
                user: { select: { id: true, nome: true, email: true } }
            }
        });

        // 3. Match logic
        const matches = [];
        const MAX_DISTANCE_KM = 5;
        const MAX_TIME_DIFF_MINUTES = 30;

        for (const dRoute of potentialDrivers) {
            const originDist = getDistanceInKm(myRoute.origem_lat, myRoute.origem_lng, dRoute.origem_lat, dRoute.origem_lng);
            const destDist = getDistanceInKm(myRoute.destino_lat, myRoute.destino_lng, dRoute.destino_lat, dRoute.destino_lng);

            const isClose = originDist <= MAX_DISTANCE_KM && destDist <= MAX_DISTANCE_KM;

            const idaDiff = getTimeDifferenceMinutes(myRoute.horario_ida, dRoute.horario_ida);
            const voltaDiff = getTimeDifferenceMinutes(myRoute.horario_volta, dRoute.horario_volta);

            const isTimeCompat = idaDiff <= MAX_TIME_DIFF_MINUTES && voltaDiff <= MAX_TIME_DIFF_MINUTES;

            if (isClose && isTimeCompat) {
                const score = originDist + destDist + (idaDiff / 60) + (voltaDiff / 60);

                matches.push({
                    score_proximidade: score,
                    originDistanceKm: originDist.toFixed(2),
                    destDistanceKm: destDist.toFixed(2),
                    idaDifferenceMins: idaDiff,
                    voltaDifferenceMins: voltaDiff,
                    driver: dRoute.user,
                    driverRouteId: dRoute.id
                });
            }
        }

        matches.sort((a, b) => a.score_proximidade - b.score_proximidade);
        return NextResponse.json(matches);

    } catch (error) {
        console.error("Match Error:", error);
        return NextResponse.json({ message: "Erro ao calcular matches" }, { status: 500 });
    }
}
