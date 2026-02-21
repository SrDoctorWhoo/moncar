import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";

export async function GET(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ message: "Não autorizado" }, { status: 401 });
        }

        const documents = await prisma.document.findMany({
            where: { user_id: session.user.id },
            orderBy: { createdAt: 'desc' }
        });

        return NextResponse.json(documents);
    } catch (error) {
        console.error("Fetch Docs Error:", error);
        return NextResponse.json({ message: "Erro interno do servidor." }, { status: 500 });
    }
}
