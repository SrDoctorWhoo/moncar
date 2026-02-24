import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";
import fs from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ message: "Não autorizado" }, { status: 401 });
        }

        const formData = await req.formData();
        const file = formData.get("file") as File;
        const tipo_documento = formData.get("tipo_documento") as string;
        const numero_documento = formData.get("numero_documento") as string | null;
        const data_validade_raw = formData.get("data_validade") as string | null;

        if (!file || !tipo_documento) {
            return NextResponse.json({ message: "Arquivo e tipo são obrigatórios" }, { status: 400 });
        }

        const cleanNumero = numero_documento && numero_documento !== "null" ? numero_documento : undefined;
        const data_validade = data_validade_raw && data_validade_raw !== "null" ? new Date(data_validade_raw) : undefined;

        // Save File locally for MVP
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        const ext = path.extname(file.name);
        const uniqueFilename = `${randomUUID()}${ext}`;
        const uploadDir = path.join(process.cwd(), "public/uploads");
        await fs.mkdir(uploadDir, { recursive: true });

        const filePath = path.join(uploadDir, uniqueFilename);
        const dbPath = `/uploads/${uniqueFilename}`;

        await fs.writeFile(filePath, buffer);

        // Save to Postgres
        const doc = await prisma.document.create({
            data: {
                user_id: session.user.id,
                tipo_documento,
                url: dbPath,
                numero_documento: cleanNumero,
                data_validade: data_validade,
            },
            include: {
                user: true
            }
        });

        // Automatically mark user as PENDING if they were REJECTED or just uploaded
        const userStatus = (doc as any).user.status_verificacao;
        if (userStatus === 'REJECTED') {
            await prisma.user.update({
                where: { id: (session.user as any).id },
                data: { status_verificacao: 'PENDING' }
            });
        }

        return NextResponse.json(doc, { status: 201 });
    } catch (error) {
        console.error("Upload Error:", error);
        return NextResponse.json({ message: "Erro interno do servidor." }, { status: 500 });
    }
}
