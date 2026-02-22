import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";
import { ProfileType } from "@prisma/client";

// GET — returns active document configs for the current user's profile type
export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ message: "Não autorizado" }, { status: 401 });
        }

        const role = (session.user as any).role as ProfileType;

        // ADMIN doesn't upload docs
        if (role === "ADMIN") {
            return NextResponse.json([]);
        }

        let configs = await (prisma as any).documentConfig.findMany({
            where: { perfil: role, ativo: true },
            orderBy: { ordem: "asc" },
            select: {
                tipo_documento: true,
                label: true,
                descricao: true,
                icone: true,
            },
        });

        // If no configs are set in DB, return defaults
        if (configs.length === 0) {
            const defaults = [
                {
                    tipo_documento: "RG_CNH",
                    label: "Documento da Mãe",
                    descricao: "RG, CNH ou Passaporte",
                    icone: "🪪",
                    perfil: role
                },
                {
                    tipo_documento: "CRIANCA",
                    label: "Documento da Criança",
                    descricao: "Certidão ou RG do menor",
                    icone: "⭐",
                    perfil: role
                }
            ];

            if (role === "DRIVER") {
                defaults.push({
                    tipo_documento: "CNH_MOTORISTA",
                    label: "CNH Mãetorista",
                    descricao: "CNH válida (obrigatório)",
                    icone: "🚗",
                    perfil: role
                });
            }

            return NextResponse.json(defaults);
        }

        return NextResponse.json(configs);
    } catch (error) {
        console.error("GET user document-config error:", error);
        return NextResponse.json({ message: "Erro interno" }, { status: 500 });
    }
}
