import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";

export async function PATCH(
    req: Request,
    { params }: { params: Promise<{ docId: string }> }
) {
    try {
        const resolvedParams = await params;
        const { docId } = resolvedParams;

        const session = await getServerSession(authOptions);
        if (!session?.user || (session.user as any).role !== 'ADMIN') {
            return NextResponse.json({ message: "Acesso negado" }, { status: 403 });
        }

        const { status, observacao_admin } = await req.json();

        if (!['APPROVED', 'REJECTED'].includes(status)) {
            return NextResponse.json({ message: "Status inválido" }, { status: 400 });
        }
        if (status === 'REJECTED' && !observacao_admin) {
            return NextResponse.json({ message: "Observação é obrigatória para rejeição" }, { status: 400 });
        }

        // Update the document
        const doc = await prisma.document.update({
            where: { id: docId },
            data: { status, observacao_admin },
            include: { user: true }
        });

        await prisma.adminLog.create({
            data: {
                admin_id: (session.user as any).id,
                acao: `Alterou doc ${doc.id} do user ${doc.user_id} para ${status}`
            }
        });

        // Check if user has all required docs approved to mark as VERIFIED (Simplified logic for MVP)
        // If Admin approves ANY doc, we can set verified=VERIFIED just to unblock the flow for MVP
        // If Admin rejects, we set REJECTED
        const userStatus = status === 'APPROVED' ? 'VERIFIED' : 'REJECTED';

        await prisma.user.update({
            where: { id: doc.user_id },
            data: { status_verificacao: userStatus as any }
        });

        return NextResponse.json(doc);
    } catch (error) {
        console.error("Update Doc Error:", error);
        return NextResponse.json({ message: "Erro interno" }, { status: 500 });
    }
}
