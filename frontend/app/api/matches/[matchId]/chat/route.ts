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

        // Check if user is part of the match
        const match = await prisma.match.findUnique({
            where: { id: matchId },
        });

        if (!match || (match.requester_id !== (session.user as any).id && match.driver_id !== (session.user as any).id)) {
            return NextResponse.json({ message: "Acesso negado ao chat" }, { status: 403 });
        }

        const messages = await prisma.chatMessage.findMany({
            where: { match_id: matchId },
            include: { sender: { select: { nome: true, imagem_url: true } } },
            orderBy: { createdAt: 'asc' }
        });

        return NextResponse.json(messages);
    } catch (error) {
        return NextResponse.json({ message: "Erro ao carregar mensagens" }, { status: 500 });
    }
}

export async function POST(
    req: Request,
    { params }: { params: Promise<{ matchId: string }> }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) return NextResponse.json({ message: "Não autorizado" }, { status: 401 });

        const { matchId } = await params;
        const { conteudo } = await req.json();

        if (!conteudo) return NextResponse.json({ message: "Conteúdo vazio" }, { status: 400 });

        // Check if user is part of the match
        const match = await prisma.match.findUnique({
            where: { id: matchId },
        });

        if (!match || (match.requester_id !== (session.user as any).id && match.driver_id !== (session.user as any).id)) {
            return NextResponse.json({ message: "Acesso negado" }, { status: 403 });
        }

        const message = await prisma.chatMessage.create({
            data: {
                match_id: matchId,
                sender_id: (session.user as any).id,
                conteudo
            },
            include: { sender: { select: { nome: true, imagem_url: true } } }
        });

        // Update match updatedAt to bring it to the top of the list
        await (prisma as any).match.update({
            where: { id: matchId },
            data: { updatedAt: new Date() }
        });

        // Trigger notification for the other user (TODO: implement notification service)
        const recipientId = match.requester_id === (session.user as any).id ? match.driver_id : match.requester_id;
        await prisma.notification.create({
            data: {
                user_id: recipientId,
                titulo: "Nova mensagem",
                mensagem: `${session.user.name} enviou uma mensagem para você.`,
                link: `/dashboard/chat/${matchId}`
            }
        });

        return NextResponse.json(message);
    } catch (error) {
        return NextResponse.json({ message: "Erro ao enviar mensagem" }, { status: 500 });
    }
}
