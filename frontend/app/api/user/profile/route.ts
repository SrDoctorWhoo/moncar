import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";

export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ message: "Não autorizado" }, { status: 401 });
        }

        const user = await prisma.user.findUnique({
            where: { id: (session.user as any).id }
        });

        return NextResponse.json(user);
    } catch (error) {
        return NextResponse.json({ message: "Erro ao buscar perfil" }, { status: 500 });
    }
}

export async function PATCH(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ message: "Não autorizado" }, { status: 401 });
        }

        const { bio, imagem_url, dados_filhos, nome } = await req.json();

        const updatedUser = await prisma.user.update({
            where: { id: (session.user as any).id },
            data: {
                nome,
                bio,
                imagem_url,
                dados_filhos
            }
        });

        return NextResponse.json(updatedUser);
    } catch (error) {
        console.error("Profile Update Error:", error);
        return NextResponse.json({ message: "Erro ao atualizar perfil" }, { status: 500 });
    }
}
