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

        const docs = await prisma.document.findMany({
            where: { status: 'PENDING' },
            include: {
                user: { select: { nome: true, email: true, tipo_perfil: true } }
            },
            orderBy: { createdAt: 'desc' }
        });

        return NextResponse.json(docs);
    } catch (error) {
        console.error("Fetch Pending Docs Error:", error);
        return NextResponse.json({ message: "Erro interno" }, { status: 500 });
    }
}
