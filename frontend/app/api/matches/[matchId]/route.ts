import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";

export async function GET(
    req: Request,
    { params }: { params: Promise<{ matchId: string }> }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) return NextResponse.json({ message: "Não autorizado" }, { status: 401 });

        const { matchId } = await params;
        const userId = (session.user as any).id;

        const match = await (prisma as any).match.findUnique({
            where: { id: matchId },
            include: {
                requester: {
                    select: { id: true, nome: true, imagem_url: true, status_verificacao: true, tipo_perfil: true }
                },
                driver: {
                    select: { id: true, nome: true, imagem_url: true, status_verificacao: true, tipo_perfil: true }
                }
            }
        });

        if (!match) return NextResponse.json({ message: "Match não encontrado" }, { status: 404 });

        // Check if user is part of the match
        if (match.requester_id !== userId && match.driver_id !== userId) {
            return NextResponse.json({ message: "Acesso negado" }, { status: 403 });
        }

        // Determine who the "other" person is
        const otherUser = match.requester_id === userId ? match.driver : match.requester;

        return NextResponse.json({
            ...match,
            otherUser
        });
    } catch (error) {
        console.error("GET Match Error:", error);
        return NextResponse.json({ message: "Erro ao carregar dados do match" }, { status: 500 });
    }
}
