"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import axios from "axios";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export default function ProfilePage() {
    const { data: session, update } = useSession();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState({
        nome: "",
        bio: "",
        imagem_url: "",
        dados_filhos: ""
    });

    useEffect(() => {
        if (session) {
            fetchProfile();
        }
    }, [session]);

    const fetchProfile = async () => {
        try {
            const res = await axios.get("/api/user/profile");
            setFormData({
                nome: res.data.nome || "",
                bio: res.data.bio || "",
                imagem_url: res.data.imagem_url || "",
                dados_filhos: res.data.dados_filhos || ""
            });
        } catch (error) {
            toast.error("Erro ao carregar perfil");
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            await axios.patch("/api/user/profile", formData);
            toast.success("Perfil atualizado!");
            // Update session to reflect new name if changed
            await update({ name: formData.nome });
        } catch (error) {
            toast.error("Erro ao salvar alterações");
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="p-8 text-center text-slate-500">Carregando perfil...</div>;

    return (
        <div className="max-w-2xl mx-auto space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-purple-700">Meu Perfil</h1>
                <p className="text-slate-600">Personalize sua conta para aumentar a confiança na rede.</p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Informações Pessoais</CardTitle>
                    <CardDescription>Estes dados serão visíveis para outras mães em caso de match.</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="nome">Nome Completo</Label>
                            <Input
                                id="nome"
                                value={formData.nome}
                                onChange={e => setFormData({ ...formData, nome: e.target.value })}
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="img">URL da Foto de Perfil</Label>
                            <Input
                                id="img"
                                placeholder="https://exemplo.com/foto.jpg"
                                value={formData.imagem_url}
                                onChange={e => setFormData({ ...formData, imagem_url: e.target.value })}
                            />
                            {formData.imagem_url && (
                                <div className="mt-2 flex justify-center">
                                    <img
                                        src={formData.imagem_url}
                                        alt="Preview"
                                        className="w-24 h-24 rounded-full object-cover border-2 border-purple-200"
                                        onError={(e) => (e.currentTarget.style.display = 'none')}
                                    />
                                </div>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="bio">Sobre Você (Bio)</Label>
                            <Textarea
                                id="bio"
                                placeholder="Conte um pouco sobre você..."
                                value={formData.bio}
                                onChange={e => setFormData({ ...formData, bio: e.target.value })}
                                className="min-h-[100px]"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="kids">Sobre seus Filhos (Opcional)</Label>
                            <Textarea
                                id="kids"
                                placeholder="Idade, escola, particularidades que ajudam no match..."
                                value={formData.dados_filhos}
                                onChange={e => setFormData({ ...formData, dados_filhos: e.target.value })}
                            />
                        </div>

                        <Button type="submit" className="w-full bg-purple-600 hover:bg-purple-700" disabled={saving}>
                            {saving ? "Salvando..." : "Salvar Alterações"}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
