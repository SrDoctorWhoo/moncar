"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import axios from "axios";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

export default function AdminDashboardPage() {
    const { data: session } = useSession();
    const [pendingDocs, setPendingDocs] = useState<any[]>([]);
    const [users, setUsers] = useState<any[]>([]);
    const [observation, setObservation] = useState<{ [key: string]: string }>({});

    useEffect(() => {
        if (session) {
            fetchData();
        }
    }, [session]);

    const fetchData = async () => {
        try {
            const [docsRes, usersRes] = await Promise.all([
                axios.get(`/api/admin/documents/pending`),
                axios.get(`/api/admin/users`)
            ]);
            setPendingDocs(docsRes.data);
            setUsers(usersRes.data);
        } catch (error) {
            console.error(error);
            toast.error("Erro ao carregar dados do admin");
        }
    };

    const handleAction = async (docId: string, status: 'APPROVED' | 'REJECTED') => {
        const obs = observation[docId] || "";
        if (status === 'REJECTED' && !obs) {
            return toast.error("Obrigatório inserir observação ao rejeitar");
        }

        try {
            await axios.patch(
                `/api/admin/documents/${docId}`,
                { status, observacao_admin: obs }
            );
            toast.success(`Documento ${status === 'APPROVED' ? 'Aprovado' : 'Rejeitado'}`);

            // Remove from list
            setPendingDocs(docs => docs.filter(d => d.id !== docId));
            fetchData(); // Refresh users list status
        } catch (err) {
            toast.error("Erro ao atualizar o documento");
        }
    };

    if ((session?.user as any)?.role !== 'ADMIN') {
        return <div className="p-8 text-center text-red-600 font-bold">Acesso Negado</div>;
    }

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-purple-700">Painel Administrativo</h1>
                <p className="text-slate-600">Aprovação de documentos e gestão de usuárias.</p>
            </div>

            <section>
                <h2 className="text-2xl font-semibold mb-4">Documentos Pendentes ({pendingDocs.length})</h2>
                {pendingDocs.length === 0 ? (
                    <p className="text-sm text-slate-500 bg-slate-100 p-4 rounded-md">Todos os documentos foram analisados.</p>
                ) : (
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {pendingDocs.map(doc => (
                            <Card key={doc.id} className="border-orange-200 bg-orange-50">
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-lg">{doc.tipo_documento}</CardTitle>
                                    <CardDescription>
                                        Enviado por: {doc.user.nome} <br />
                                        Email: {doc.user.email} <br />
                                        Data: {new Date(doc.createdAt).toLocaleDateString()}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="p-4 bg-slate-200 rounded text-center text-sm font-medium">
                                        {/* Em produção, renderizaria a img da CNH. Mock local do caminho: */}
                                        [Arquivo: {doc.url}]
                                    </div>

                                    <Textarea
                                        placeholder="Adicionar observação (obrigatório se rejeitar)..."
                                        value={observation[doc.id] || ""}
                                        onChange={(e) => setObservation({ ...observation, [doc.id]: e.target.value })}
                                        className="bg-white"
                                    />
                                </CardContent>
                                <CardFooter className="flex gap-2">
                                    <Button
                                        variant="outline"
                                        className="w-full border-red-200 text-red-600 hover:bg-red-50"
                                        onClick={() => handleAction(doc.id, 'REJECTED')}
                                    >
                                        Rejeitar
                                    </Button>
                                    <Button
                                        className="w-full bg-green-600 hover:bg-green-700"
                                        onClick={() => handleAction(doc.id, 'APPROVED')}
                                    >
                                        Aprovar
                                    </Button>
                                </CardFooter>
                            </Card>
                        ))}
                    </div>
                )}
            </section>

            <section>
                <h2 className="text-2xl font-semibold mb-4">Mães Cadastradas ({users.length})</h2>
                <div className="bg-white rounded-md border shadow-sm overflow-hidden">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-slate-50 text-slate-600 border-b">
                            <tr>
                                <th className="px-4 py-3 font-medium">Nome</th>
                                <th className="px-4 py-3 font-medium">Email</th>
                                <th className="px-4 py-3 font-medium">Tipo Perfil</th>
                                <th className="px-4 py-3 font-medium">Status Verificação</th>
                                <th className="px-4 py-3 font-medium">Data Cadastro</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {users.map(u => (
                                <tr key={u.id}>
                                    <td className="px-4 py-3">{u.nome}</td>
                                    <td className="px-4 py-3">{u.email}</td>
                                    <td className="px-4 py-3 font-medium">
                                        {u.tipo_perfil === 'DRIVER' ? '🚗 Mãetorista' : u.tipo_perfil === 'PASSENGER' ? '👩‍👧 Passageira' : '👑 Admin'}
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${u.status_verificacao === 'VERIFIED' ? 'bg-green-100 text-green-700' :
                                            u.status_verificacao === 'REJECTED' ? 'bg-red-100 text-red-700' :
                                                'bg-orange-100 text-orange-700'
                                            }`}>
                                            {u.status_verificacao}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3">{new Date(u.createdAt).toLocaleDateString()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </section>
        </div>
    );
}
