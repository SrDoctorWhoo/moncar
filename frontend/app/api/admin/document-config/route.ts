import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";
import { ProfileType } from "@prisma/client";

// GET — return all configs grouped by perfil
export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user || (session.user as any).role !== "ADMIN") {
            return NextResponse.json({ message: "Acesso negado" }, { status: 403 });
        }

        const configs = await (prisma as any).documentConfig.findMany({
            orderBy: [{ perfil: "asc" }, { ordem: "asc" }],
        });

        return NextResponse.json(configs);
    } catch (error) {
        console.error("GET DocumentConfig Error:", error);
        return NextResponse.json({ message: "Erro interno" }, { status: 500 });
    }
}

// PUT — bulk upsert: receives array of configs and replaces everything
export async function PUT(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user || (session.user as any).role !== "ADMIN") {
            return NextResponse.json({ message: "Acesso negado" }, { status: 403 });
        }

        const body: Array<{
            tipo_documento: string;
            label: string;
            descricao?: string;
            icone?: string;
            perfil: ProfileType;
            ativo: boolean;
            ordem: number;
        }> = await req.json();

        if (!Array.isArray(body)) {
            return NextResponse.json({ message: "Payload inválido" }, { status: 400 });
        }

        // Upsert each config entry
        const upserts = body.map((cfg, i) =>
            (prisma as any).documentConfig.upsert({
                where: {
                    tipo_documento_perfil: {
                        tipo_documento: cfg.tipo_documento,
                        perfil: cfg.perfil,
                    },
                },
                update: {
                    label: cfg.label,
                    descricao: cfg.descricao,
                    icone: cfg.icone ?? "📄",
                    ativo: cfg.ativo,
                    ordem: cfg.ordem ?? i,
                },
                create: {
                    tipo_documento: cfg.tipo_documento,
                    label: cfg.label,
                    descricao: cfg.descricao,
                    icone: cfg.icone ?? "📄",
                    perfil: cfg.perfil,
                    ativo: cfg.ativo,
                    ordem: cfg.ordem ?? i,
                },
            })
        );

        await (prisma as any).$transaction(upserts);

        const updated = await (prisma as any).documentConfig.findMany({
            orderBy: [{ perfil: "asc" }, { ordem: "asc" }],
        });

        return NextResponse.json(updated);
    } catch (error) {
        console.error("PUT DocumentConfig Error:", error);
        return NextResponse.json({ message: "Erro interno" }, { status: 500 });
    }
}
