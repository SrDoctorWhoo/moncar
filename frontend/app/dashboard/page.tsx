"use client";

import { useSession } from "next-auth/react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { FaIdCard, FaRoute, FaCarSide, FaShieldHalved } from "react-icons/fa6";

export default function DashboardHomePage() {
    const { data: session } = useSession();

    if (!session) return (
        <div className="animate-pulse flex flex-col space-y-4">
            <div className="h-12 w-64 bg-foreground/5 rounded-xl"></div>
            <div className="h-6 w-96 bg-foreground/5 rounded-xl"></div>
        </div>
    );

    const user = session.user as any;

    return (
        <div className="space-y-8">
            <div className="pb-6 relative">
                <h1 className="text-4xl md:text-5xl font-heading font-bold tracking-tight text-secondary">
                    Bem-vinda, <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">{user.name}</span>!
                </h1>
                <p className="text-muted-foreground font-medium text-lg mt-3">
                    Acompanhe a sua rotina escolar e os próximos passos na Momcar.
                </p>
                {/* Decorative blob */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-[60px] pointer-events-none -mr-32 -mt-16"></div>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 relative z-10">
                {user.role === 'ADMIN' ? (
                    <Card className="bg-white/90 backdrop-blur-xl border border-accent/20 shadow-2xl shadow-accent/10 overflow-hidden relative transition-transform hover:-translate-y-1">
                        <div className="absolute -right-8 -top-8 w-40 h-40 bg-accent/10 rounded-full blur-3xl pointer-events-none"></div>
                        <CardHeader className="relative z-10">
                            <div className="w-12 h-12 rounded-2xl bg-accent/10 flex items-center justify-center mb-4 border border-accent/20">
                                <FaShieldHalved className="w-6 h-6 text-accent drop-shadow-sm" />
                            </div>
                            <CardTitle className="text-2xl font-bold text-accent">
                                Painel Gestor
                            </CardTitle>
                            <CardDescription className="font-medium text-accent/80 text-base mt-2">Controle absoluto sobre verificações e identidades na rede.</CardDescription>
                        </CardHeader>
                        <CardFooter className="mt-4 relative z-10">
                            <Link href="/dashboard/admin" className="w-full">
                                <Button className="w-full rounded-2xl bg-accent hover:bg-accent/90 text-white font-bold h-14 shadow-lg shadow-accent/20 transition-all hover:scale-[1.02]">
                                    Acessar Comando Geral
                                </Button>
                            </Link>
                        </CardFooter>
                    </Card>
                ) : (
                    <>
                        {/* Profile/Docs Card */}
                        <Card className="border border-white/60 shadow-2xl shadow-[rgba(53,92,125,0.08)] bg-white/90 backdrop-blur-xl relative overflow-hidden group transition-all hover:-translate-y-1 hover:shadow-[rgba(53,92,125,0.15)] flex flex-col">
                            <div className={`absolute top-0 right-0 w-32 h-32 rounded-bl-full pointer-events-none transition-transform group-hover:scale-150 blur-2xl 
                                ${user.verifiedStatus === 'VERIFIED' ? 'bg-emerald-500/10' : user.verifiedStatus === 'REJECTED' ? 'bg-destructive/10' : 'bg-orange-500/10'}`}
                            />
                            <CardHeader className="relative z-10 flex-none">
                                <div className="flex justify-between items-start mb-4">
                                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border shadow-sm ${user.verifiedStatus === 'VERIFIED' ? 'bg-emerald-50 border-emerald-100 text-emerald-600' : user.verifiedStatus === 'REJECTED' ? 'bg-destructive/10 border-destructive/20 text-destructive' : 'bg-orange-50 border-orange-100 text-orange-500'}`}>
                                        <FaIdCard className="w-6 h-6 drop-shadow-sm" />
                                    </div>
                                    <span className={`px-3 py-1 rounded-full text-xs font-bold border shadow-sm ${user.verifiedStatus === 'VERIFIED' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : user.verifiedStatus === 'REJECTED' ? 'bg-destructive/10 text-destructive border-destructive/20' : 'bg-orange-50 text-orange-700 border-orange-200'}`}>
                                        {user.verifiedStatus === 'PENDING' ? 'Em Auditoria' : user.verifiedStatus === 'VERIFIED' ? 'Verificada' : 'Doc. Rejeitada'}
                                    </span>
                                </div>
                                <CardTitle className="text-2xl font-bold text-secondary">
                                    Sua Identidade
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="relative z-10 flex-1">
                                <p className="text-sm font-medium text-muted-foreground leading-relaxed mt-2">
                                    {user.verifiedStatus === 'PENDING' && "Precisamos que você envie sua CNH ou RG e o documento da criança para liberar seu acesso."}
                                    {user.verifiedStatus === 'VERIFIED' && "Sua identidade materna foi confirmada. Acesso total liberado para utilizar a plataforma."}
                                    {user.verifiedStatus === 'REJECTED' && "Houve um problema na triagem. Verifique as anotações no seu dossier documental e reenvie."}
                                </p>
                            </CardContent>
                            <CardFooter className="relative z-10 mt-6 flex-none">
                                <Link href="/dashboard/documents" className="w-full">
                                    <Button variant={user.verifiedStatus === 'VERIFIED' ? "outline" : "default"} className={`w-full rounded-2xl font-bold h-14 transition-all ${user.verifiedStatus !== 'VERIFIED' ? 'bg-primary hover:bg-primary/90 text-white shadow-[0_10px_20px_-10px_rgba(192,108,132,0.5)] hover:scale-[1.02]' : 'border-secondary/20 text-secondary hover:bg-secondary/5 hover:scale-[1.02]'}`}>
                                        Acessar Meus Documentos
                                    </Button>
                                </Link>
                            </CardFooter>
                        </Card>

                        {/* Routes Card */}
                        <Card className={`border border-white/60 shadow-2xl shadow-[rgba(53,92,125,0.08)] bg-white/90 backdrop-blur-xl relative overflow-hidden group transition-all hover:-translate-y-1 flex flex-col ${user.verifiedStatus !== 'VERIFIED' ? 'opacity-60 grayscale-[50%] pointer-events-none' : 'hover:shadow-[rgba(53,92,125,0.15)]'}`}>
                            <div className="absolute top-0 right-0 w-32 h-32 bg-secondary/5 rounded-bl-[100px] pointer-events-none transition-transform group-hover:scale-150 blur-xl" />
                            <CardHeader className="relative z-10 flex-none">
                                <div className="w-12 h-12 rounded-2xl bg-secondary/5 border border-secondary/10 flex items-center justify-center mb-4 text-secondary shadow-sm">
                                    <FaRoute className="w-6 h-6 drop-shadow-sm" />
                                </div>
                                <CardTitle className="text-2xl font-bold text-secondary">
                                    Trajeto Escolar
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="relative z-10 flex-1">
                                <p className="text-sm font-medium text-muted-foreground leading-relaxed mt-1">Configure o caminho de casa para a escola e defina os períodos em que você faz essa rota.</p>
                            </CardContent>
                            <CardFooter className="relative z-10 mt-6 flex-none">
                                <Link href={user.verifiedStatus === 'VERIFIED' ? "/dashboard/routes" : "#"} className="w-full">
                                    <Button disabled={user.verifiedStatus !== 'VERIFIED'} className="w-full rounded-2xl bg-secondary hover:bg-secondary/90 text-white font-bold h-14 shadow-[0_10px_20px_-10px_rgba(53,92,125,0.5)] transition-all hover:scale-[1.02]">
                                        Gerenciar Minha Rota
                                    </Button>
                                </Link>
                            </CardFooter>
                        </Card>

                        {/* Matches Card */}
                        <Card className={`border border-primary/20 shadow-2xl shadow-primary/10 bg-gradient-to-br from-white to-primary/5 backdrop-blur-xl relative overflow-hidden group transition-all hover:-translate-y-1 flex flex-col ${user.verifiedStatus !== 'VERIFIED' ? 'opacity-60 grayscale-[50%] pointer-events-none' : 'hover:shadow-primary/20'}`}>
                            <div className="absolute top-0 right-0 w-40 h-40 bg-primary/10 rounded-bl-[120px] pointer-events-none transition-transform group-hover:scale-150 blur-2xl" />
                            <CardHeader className="relative z-10 flex-none">
                                <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-4 text-primary shadow-sm">
                                    <FaCarSide className="w-6 h-6 drop-shadow-sm" />
                                </div>
                                <CardTitle className="text-2xl font-bold text-primary">
                                    Mãetoristas Próximas
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="relative z-10 flex-1">
                                <p className="text-sm font-medium text-secondary/80 leading-relaxed mt-1">Acesse a rede de contatos e conecte-se com mães que possuem rotas compatíveis com a sua no colégio.</p>
                            </CardContent>
                            <CardFooter className="relative z-10 mt-6 flex-none">
                                <Link href={user.verifiedStatus === 'VERIFIED' ? "/dashboard/matches" : "#"} className="w-full">
                                    <Button disabled={user.verifiedStatus !== 'VERIFIED'} className="w-full rounded-2xl bg-primary hover:bg-primary/90 text-white font-bold h-14 shadow-[0_10px_20px_-10px_rgba(192,108,132,0.6)] transition-all hover:scale-[1.02]">
                                        Explorar Rede
                                    </Button>
                                </Link>
                            </CardFooter>
                        </Card>
                    </>
                )}
            </div>
        </div>
    );
}
