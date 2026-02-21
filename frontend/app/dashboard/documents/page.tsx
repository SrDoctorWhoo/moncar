"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import axios from "axios";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";

export default function DocumentsPage() {
    const { data: session } = useSession();
    const [documents, setDocuments] = useState<any[]>([]);
    const [file, setFile] = useState<File | null>(null);
    const [docType, setDocType] = useState("RG_CNH");
    const [isUploading, setIsUploading] = useState(false);

    useEffect(() => {
        fetchDocuments();
    }, [session]);

    const fetchDocuments = async () => {
        try {
            const res = await axios.get(`/api/documents/my-documents`);
            setDocuments(res.data);
        } catch (error) {
            console.error("Erro ao carregar documentos", error);
        }
    };

    const handleUpload = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!file || !docType) return toast.error("Selecione o arquivo e o tipo");

        setIsUploading(true);
        const formData = new FormData();
        formData.append("file", file);
        formData.append("tipo_documento", docType);

        try {
            await axios.post(`/api/documents/upload`, formData);
            toast.success("Documento enviado com sucesso!");
            setFile(null);
            fetchDocuments(); // Refresh list
        } catch (err) {
            toast.error("Erro no upload");
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold tracking-tight">Meus Documentos</h1>
            <p className="text-slate-600 max-w-2xl">
                Para manter o Momcar um ambiente seguro, precisamos validar a identidade de todas as mães.
                Por favor, envie uma foto do seu RG/CNH e a certidão ou declaração escolar da criança.
            </p>

            <Card>
                <CardHeader>
                    <CardTitle>Enviar Novo Documento</CardTitle>
                    <CardDescription>Formatos aceitos: JPG, PNG, PDF (max 5MB)</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleUpload} className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Tipo de Documento</label>
                            <Select value={docType} onValueChange={setDocType}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Selecione..." />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="RG_CNH">Documento da Mãe (RG, CNH, Passaporte)</SelectItem>
                                    <SelectItem value="CRIANCA">Documento da Criança (Certidão, RG)</SelectItem>
                                    {(session?.user as any)?.role === 'DRIVER' && (
                                        <SelectItem value="CNH_MOTORISTA">CNH Válida (Obrigatório para Mãetorista)</SelectItem>
                                    )}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Arquivo</label>
                            <Input
                                type="file"
                                onChange={(e) => setFile(e.target.files?.[0] || null)}
                                accept="image/*,.pdf"
                            />
                        </div>

                        <Button type="submit" disabled={isUploading || !file} className="bg-blue-600 hover:bg-blue-700">
                            {isUploading ? "Enviando..." : "Fazer Upload"}
                        </Button>
                    </form>
                </CardContent>
            </Card>

            <div className="mt-8">
                <h2 className="text-xl font-semibold mb-4">Arquivos Enviados</h2>
                {documents.length === 0 ? (
                    <p className="text-sm text-slate-500">Você ainda não enviou documentos.</p>
                ) : (
                    <div className="grid gap-4 md:grid-cols-2">
                        {documents.map((doc) => (
                            <Card key={doc.id} className="bg-slate-50">
                                <CardHeader className="py-4">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <CardTitle className="text-base">{doc.tipo_documento}</CardTitle>
                                            <CardDescription className="text-xs">Enviado em {new Date(doc.createdAt).toLocaleDateString()}</CardDescription>
                                        </div>
                                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${doc.status === 'PENDING' ? 'bg-orange-100 text-orange-700' :
                                            doc.status === 'APPROVED' ? 'bg-green-100 text-green-700' :
                                                'bg-red-100 text-red-700'
                                            }`}>
                                            {doc.status}
                                        </span>
                                    </div>
                                </CardHeader>
                                {doc.observacao_admin && (
                                    <CardContent className="pt-0 text-sm">
                                        <p className="text-red-600"><span className="font-semibold">Obs:</span> {doc.observacao_admin}</p>
                                    </CardContent>
                                )}
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
