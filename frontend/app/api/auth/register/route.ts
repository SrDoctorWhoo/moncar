import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
    try {
        const { nome, email, senha, tipo_perfil } = await req.json();

        if (!nome || !email || !senha || !tipo_perfil) {
            return NextResponse.json({ message: "Dados incompletos." }, { status: 400 });
        }

        const existingUser = await prisma.user.findUnique({
            where: { email },
        });

        if (existingUser) {
            return NextResponse.json(
                { message: "Usuário com este e-mail já existe." },
                { status: 409 }
            );
        }

        const salt = await bcrypt.genSalt();
        const hashedPassword = await bcrypt.hash(senha, salt);

        const user = await prisma.user.create({
            data: {
                nome,
                email,
                senha: hashedPassword,
                tipo_perfil,
            },
        });

        // Remove password from response
        const { senha: _, ...userWithoutPassword } = user;

        return NextResponse.json(userWithoutPassword, { status: 201 });
    } catch (error) {
        console.error("Erro no registro:", error);
        return NextResponse.json({ message: "Erro interno do servidor." }, { status: 500 });
    }
}
