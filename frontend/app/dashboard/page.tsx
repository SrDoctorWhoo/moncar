"use client";

import { useSession } from "next-auth/react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ShieldCheck, MapPin, Users } from "lucide-react";

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
                    <Card className="bg-gradient-to-br from-accent/5 to-accent/10 border border-accent/20 shadow-xl shadow-accent/5 overflow-hidden relative">
                        <div className="absolute -right-8 -top-8 w-32 h-32 bg-accent/20 rounded-full blur-2xl"></div>
                        <CardHeader>
                            <CardTitle className="text-2xl font-bold text-accent flex items-center gap-2">
                                <ShieldCheck className="w-6 h-6" />
                                Painel Gestor
                            </CardTitle>
                            <CardDescription className="font-medium text-accent/80 text-base">Controle absoluto sobre verificações e identidades.</CardDescription>
                        </CardHeader>
                        <CardFooter className="mt-8">
                            <Link href="/dashboard/admin" className="w-full">
                                <Button className="w-full rounded-xl bg-accent hover:bg-accent/90 text-white font-bold h-14 shadow-lg shadow-accent/20 transition-all hover:-translate-y-1">
                                    Acessar Gestão Central
                                </Button>
                            </Link>
                        </CardFooter>
                    </Card>
                ) : (
                    <>
                        {/* Profile/Docs Card */}
                        <Card className="border border-foreground/5 shadow-xl shadow-foreground/5 bg-white relative overflow-hidden group">
                            <div className={`absolute top-0 right-0 w-24 h-24 rounded-bl-[100px] pointer-events-none transition-transform group-hover:scale-110 
                                ${user.verifiedStatus === 'VERIFIED' ? 'bg-green-500/10' : user.verifiedStatus === 'REJECTED' ? 'bg-destructive/10' : 'bg-orange-500/10'}`}
                            />
                            <CardHeader>
                                <CardTitle className="text-2xl font-bold text-secondary flex items-center gap-2">
                                    <ShieldCheck className={`w-6 h-6 ${user.verifiedStatus === 'VERIFIED' ? 'text-green-500' : user.verifiedStatus === 'REJECTED' ? 'text-destructive' : 'text-orange-500'}`} />
                                    Sua Identidade
                                </CardTitle>
                                <CardDescription className="font-bold uppercase tracking-wider text-xs mt-2 flex items-center gap-2">
                                    Status Atual:
                                    <span className={`px-2 py-1 rounded-md ${user.verifiedStatus === 'VERIFIED' ? 'bg-green-50 text-green-700' : user.verifiedStatus === 'REJECTED' ? 'bg-destructive/10 text-destructive' : 'bg-orange-50 text-orange-700'}`}>
                                        {user.verifiedStatus === 'PENDING' ? 'Em Auditoria' : user.verifiedStatus === 'VERIFIED' ? 'Verificada' : 'Doc. Rejeitada'}
                                    </span>
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm font-medium text-muted-foreground leading-relaxed">
                                    {user.verifiedStatus === 'PENDING' && "Precisamos que você envie sua CNH ou RG e o documento da criança para liberar seu acesso."}
                                    {user.verifiedStatus === 'VERIFIED' && "Sua identidade materna foi confirmada. Acesso total liberado para utilizar a plataforma."}
                                    {user.verifiedStatus === 'REJECTED' && "Houve um problema na triagem. Verifique as anotações no seu dossier documental e reenvie."}
                                </p>
                            </CardContent>
                            <CardFooter className="mt-auto pt-6">
                                <Link href="/dashboard/documents" className="w-full">
                                    <Button variant={user.verifiedStatus === 'VERIFIED' ? "outline" : "default"} className={`w-full rounded-xl font-bold h-12 transition-all ${user.verifiedStatus !== 'VERIFIED' ? 'bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/30 hover:-translate-y-0.5' : 'border-secondary/20 text-secondary hover:bg-secondary/5'}`}>
                                        Acessar Meus Documentos
                                    </Button>
                                </Link>
                            </CardFooter>
                        </Card>

                        {/* Routes Card */}
                        <Card className={`border border-foreground/5 shadow-xl shadow-foreground/5 bg-white relative overflow-hidden group ${user.verifiedStatus !== 'VERIFIED' ? 'opacity-60 grayscale-[50%] pointer-events-none' : ''}`}>
                            <div className="absolute top-0 right-0 w-32 h-32 bg-secondary/5 rounded-bl-[100px] pointer-events-none transition-transform group-hover:scale-110" />
                            <CardHeader>
                                <CardTitle className="text-2xl font-bold text-secondary flex items-center gap-2">
                                    <MapPin className="w-6 h-6 text-secondary" />
                                    Trajeto Escolar
                                </CardTitle>
                                <CardDescription className="font-medium text-base mt-1">Configure o caminho de casa para a escola e seus horários.</CardDescription>
                            </CardHeader>
                            <CardFooter className="mt-8">
                                <Link href={user.verifiedStatus === 'VERIFIED' ? "/dashboard/routes" : "#"} className="w-full">
                                    <Button disabled={user.verifiedStatus !== 'VERIFIED'} className="w-full rounded-xl bg-secondary hover:bg-secondary/90 text-white font-bold h-12 shadow-lg shadow-secondary/20 transition-all hover:-translate-y-0.5">
                                        Gerenciar Rota
                                    </Button>
                                </Link>
                            </CardFooter>
                        </Card>

                        {/* Matches Card */}
                        {user.role === 'PASSENGER' && (
                            <Card className={`border border-primary/20 bg-gradient-to-br from-primary/5 to-white shadow-xl shadow-primary/10 relative overflow-hidden group ${user.verifiedStatus !== 'VERIFIED' ? 'opacity-60 grayscale-[50%] pointer-events-none' : ''}`}>
                                <div className="absolute top-0 right-0 w-40 h-40 bg-primary/10 rounded-bl-[120px] pointer-events-none transition-transform group-hover:scale-110" />
                                <CardHeader>
                                    <CardTitle className="text-2xl font-bold text-primary flex items-center gap-2">
                                        <Users className="w-6 h-6 text-primary" />
                                        Mãetoristas Próximas
                                    </CardTitle>
                                    <CardDescription className="text-secondary/80 font-medium text-base mt-1">Conecte-se com mães que fazem o mesmo trajeto que você.</CardDescription>
                                </CardHeader>
                                <CardFooter className="mt-8">
                                    <Link href={user.verifiedStatus === 'VERIFIED' ? "/dashboard/matches" : "#"} className="w-full">
                                        <Button disabled={user.verifiedStatus !== 'VERIFIED'} className="w-full rounded-xl bg-primary hover:bg-primary/90 text-white font-bold h-14 shadow-xl shadow-primary/30 transition-all hover:-translate-y-1">
                                            Procurar Caronas
                                        </Button>
                                    </Link>
                                </CardFooter>
                            </Card>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}
