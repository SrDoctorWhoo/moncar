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

        const { status: newDocStatus, observacao_admin } = await req.json();

        if (!['APPROVED', 'REJECTED'].includes(newDocStatus)) {
            return NextResponse.json({ message: "Status inválido" }, { status: 400 });
        }
        if (newDocStatus === 'REJECTED' && !observacao_admin) {
            return NextResponse.json({ message: "Observação é obrigatória para rejeição" }, { status: 400 });
        }

        // 1. Update the document status
        const doc = await prisma.document.update({
            where: { id: docId },
            data: {
                status: newDocStatus as DocumentStatus,
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
        let requiredConfigs = await (prisma as any).documentConfig.findMany({
            where: { perfil: user.tipo_perfil, ativo: true }
        });

        // Fallback to defaults if DB is empty (same as frontend API)
        if (requiredConfigs.length === 0) {
            requiredConfigs = [
                { tipo_documento: "RG_CNH", perfil: user.tipo_perfil },
                { tipo_documento: "CRIANCA", perfil: user.tipo_perfil }
            ];

            if (user.tipo_perfil === "DRIVER") {
                requiredConfigs.push({ tipo_documento: "CNH_MOTORISTA", perfil: user.tipo_perfil });
            }
        }

        // 5. Determine overall status
        let newStatus: VerificationStatus = VerificationStatus.VERIFIED;

        if (requiredConfigs.length > 0) {
            for (const config of requiredConfigs) {
                const userDoc = userDocs.find(ud => ud.tipo_documento === config.tipo_documento);

                // Check against the updated status for the current document being processed
                const effectiveDocStatus = userDoc?.id === docId ? newDocStatus : userDoc?.status;

                if (!effectiveDocStatus || effectiveDocStatus === 'PENDING') {
                    newStatus = VerificationStatus.PENDING;
                } else if (effectiveDocStatus === 'REJECTED') {
                    newStatus = VerificationStatus.REJECTED;
                    break;
                }
            }
        }

        const updatedUser = await prisma.user.update({
            where: { id: doc.user_id },
            data: { status_verificacao: newStatus }
        });

        // 6. Log admin action
        if (adminId) {
            try {
                // @ts-ignore
                await prisma.adminLog.create({
                    data: {
                        admin_id: adminId,
                        acao: `Documento ${docId} do usuário ${doc.user_id} alterado para ${newDocStatus}. Status geral: ${newStatus}`,
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
