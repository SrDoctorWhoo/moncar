import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";

export async function DELETE(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ message: "Não autorizado" }, { status: 401 });
        }

        const { id: routeId } = await params;

        // Verify if route belongs to user
        const route = await prisma.route.findUnique({
            where: { id: routeId }
        });

        if (!route) {
            return NextResponse.json({ message: "Rota não encontrada" }, { status: 404 });
        }

        if (route.user_id !== session.user.id) {
            return NextResponse.json({ message: "Acesso negado" }, { status: 403 });
        }

        await prisma.route.delete({
            where: { id: routeId }
        });

        return NextResponse.json({ message: "Rota excluída com sucesso" });
    } catch (error) {
        console.error("Delete Route Error:", error);
        return NextResponse.json({ message: "Erro ao excluir rota" }, { status: 500 });
    }
}
