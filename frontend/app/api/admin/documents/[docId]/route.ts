import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";
import { VerificationStatus, DocumentStatus } from "@prisma/client";

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

        const adminId = (session.user as any).id as string | undefined;

        const { status, observacao_admin } = await req.json();

        if (!['APPROVED', 'REJECTED'].includes(status)) {
            return NextResponse.json({ message: "Status inválido" }, { status: 400 });
        }
        if (status === 'REJECTED' && !observacao_admin) {
            return NextResponse.json({ message: "Observação é obrigatória para rejeição" }, { status: 400 });
        }

        // 1. Update the document status
        const doc = await prisma.document.update({
            where: { id: docId },
            data: {
                status: status as DocumentStatus,
                observacao_admin: observacao_admin ?? null,
            }
        });

        // 2. Fetch all unique documents for this user
        const userDocs = await prisma.document.findMany({
            where: { user_id: doc.user_id }
        });

        // 3. Fetch user info (especially for profile)
        const user = await prisma.user.findUnique({
            where: { id: doc.user_id },
            select: { tipo_perfil: true }
        });

        if (!user) {
            return NextResponse.json({ message: "Usuário não encontrado" }, { status: 404 });
        }

        // 4. Fetch required document types for this profile
        const requiredConfigs = await (prisma as any).documentConfig.findMany({
            where: { perfil: user.tipo_perfil, ativo: true }
        });

        // 5. Determine overall status
        let newStatus: VerificationStatus = VerificationStatus.VERIFIED;

        if (requiredConfigs.length > 0) {
            for (const config of requiredConfigs) {
                const userDoc = userDocs.find(ud => ud.tipo_documento === config.tipo_documento);

                if (!userDoc || userDoc.status === 'PENDING') {
                    newStatus = VerificationStatus.PENDING;
                } else if (userDoc.status === 'REJECTED') {
                    newStatus = VerificationStatus.REJECTED;
                    break;
                }
            }
        } else {
            newStatus = VerificationStatus.PENDING;
        }

        const updatedUser = await prisma.user.update({
            where: { id: doc.user_id },
            data: { status_verificacao: newStatus }
        });

        // 6. Log admin action
        if (adminId) {
            try {
                await prisma.adminLog.create({
                    data: {
                        admin_id: adminId,
                        acao: `Documento ${docId} do usuário ${doc.user_id} alterado para ${status}. Status geral: ${newStatus}`,
                    }
                });
            } catch (logError) {
                console.warn("AdminLog creation failed:", logError);
            }
        }

        return NextResponse.json({ ...doc, userStatus: newStatus });
    } catch (error) {
        console.error("Update Doc Error:", error);
        return NextResponse.json({ message: "Erro interno" }, { status: 500 });
    }
}
