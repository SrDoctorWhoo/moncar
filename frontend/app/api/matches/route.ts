import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";

export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) return NextResponse.json({ message: "Não autorizado" }, { status: 401 });

        const userId = (session.user as any).id;

        // Fetch matches where user is requester or driver
        const matches = await (prisma as any).match.findMany({
            where: {
                OR: [
                    { requester_id: userId },
                    { driver_id: userId }
                ]
            },
            include: {
                requester: {
                    select: { id: true, nome: true, imagem_url: true, status_verificacao: true, tipo_perfil: true }
                },
                driver: {
                    select: { id: true, nome: true, imagem_url: true, status_verificacao: true, tipo_perfil: true }
                },
                messages: {
                    orderBy: { createdAt: 'desc' },
                    take: 1
                }
            },
            orderBy: { updatedAt: 'desc' }
        });

        // Map matches to identify the "other user" and format for the list
        const chatList = matches.map((m: any) => {
            const otherUser = m.requester_id === userId ? m.driver : m.requester;
            return {
                id: m.id,
                otherUser,
                lastMessage: m.messages[0] || null,
                updatedAt: m.updatedAt
            };
        });

        return NextResponse.json(chatList);
    } catch (error) {
        console.error("GET Matches Error:", error);
        return NextResponse.json({ message: "Erro ao carregar conversas" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) return NextResponse.json({ message: "Não autorizado" }, { status: 401 });

        const { driverId, score } = await req.json();

        if (!driverId) return NextResponse.json({ message: "ID da motorista obrigatório" }, { status: 400 });

        const requesterId = (session.user as any).id;

        // Check if match already exists
        let match = await prisma.match.findFirst({
            where: {
                OR: [
                    { requester_id: requesterId, driver_id: driverId },
                    { requester_id: driverId, driver_id: requesterId }
                ]
            }
        });

        if (!match) {
            match = await prisma.match.create({
                data: {
                    requester_id: requesterId,
                    driver_id: driverId,
                    score_proximidade: score || 0
                }
            });

            // Create notification for driver
            await prisma.notification.create({
                data: {
                    user_id: driverId,
                    titulo: "Nova solicitação de carona",
                    mensagem: `${session.user.name} tem interesse em dividir a rota com você!`,
                    link: `/dashboard/chat/${match.id}`
                }
            });
        }

        return NextResponse.json(match);
    } catch (error) {
        console.error("Match Create Error:", error);
        return NextResponse.json({ message: "Erro ao iniciar contato" }, { status: 500 });
    }
}
