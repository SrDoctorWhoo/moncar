import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";

export async function GET(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user || (session.user as any).role !== 'ADMIN') {
            return NextResponse.json({ message: "Acesso negado" }, { status: 403 });
        }

        const users = await prisma.user.findMany({
            select: {
                id: true,
                nome: true,
                email: true,
                tipo_perfil: true,
                status_verificacao: true,
                createdAt: true,
            },
            orderBy: { createdAt: 'desc' }
        });

        return NextResponse.json(users);
    } catch (error) {
        console.error("Fetch Users Error:", error);
        return NextResponse.json({ message: "Erro interno do servidor." }, { status: 500 });
    }
}
