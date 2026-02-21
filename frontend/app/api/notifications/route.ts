import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";

export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) return NextResponse.json({ message: "Não autorizado" }, { status: 401 });

        const notifications = await prisma.notification.findMany({
            where: { user_id: (session.user as any).id },
            orderBy: { createdAt: 'desc' },
            take: 20
        });

        return NextResponse.json(notifications);
    } catch (error) {
        return NextResponse.json({ message: "Erro ao buscar notificações" }, { status: 500 });
    }
}

export async function PATCH(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) return NextResponse.json({ message: "Não autorizado" }, { status: 401 });

        const { id } = await req.json();

        if (id) {
            // Mark specific as read
            await prisma.notification.update({
                where: { id, user_id: (session.user as any).id },
                data: { lida: true }
            });
        } else {
            // Mark all as read
            await prisma.notification.updateMany({
                where: { user_id: (session.user as any).id, lida: false },
                data: { lida: true }
            });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ message: "Erro ao atualizar notificações" }, { status: 500 });
    }
}
