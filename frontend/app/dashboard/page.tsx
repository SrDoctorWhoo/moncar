"use client";

import { useSession } from "next-auth/react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function DashboardHomePage() {
    const { data: session } = useSession();

    if (!session) return <p>Carregando...</p>;
    const user = session.user as any;

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Bem-vinda, {user.name}!</h1>
                <p className="text-muted-foreground">Aqui está o resumo da sua conta Momcar.</p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {user.role === 'ADMIN' ? (
                    <Card className="bg-purple-50 border-purple-200">
                        <CardHeader>
                            <CardTitle>Painel Administrativo</CardTitle>
                            <CardDescription>Gerencie documentos e usuários da plataforma.</CardDescription>
                        </CardHeader>
                        <CardFooter>
                            <Link href="/dashboard/admin">
                                <Button className="bg-purple-600 hover:bg-purple-700">Acessar Painel Admin</Button>
                            </Link>
                        </CardFooter>
                    </Card>
                ) : (
                    <>
                        <Card>
                            <CardHeader>
                                <CardTitle>Status de Verificação</CardTitle>
                                <CardDescription>
                                    Seu perfil está atualmente{' '}
                                    <span className={`font-bold ${user.verifiedStatus === 'VERIFIED' ? 'text-green-600' : user.verifiedStatus === 'REJECTED' ? 'text-red-600' : 'text-orange-500'}`}>
                                        {user.verifiedStatus === 'PENDING' ? 'Em Análise' : user.verifiedStatus === 'VERIFIED' ? 'Verificado' : 'Rejeitado'}
                                    </span>
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-slate-600">
                                    {user.verifiedStatus === 'PENDING' && "Você precisa enviar seus documentos primeiro ou aguardar a análise do nosso time para utilizar o mapa de caronas."}
                                    {user.verifiedStatus === 'VERIFIED' && "Sua identidade foi confirmada! Você pode começar a cadastrar sua rota."}
                                    {user.verifiedStatus === 'REJECTED' && "Houve um problema com a sua verificação de documentos. Verifique as observações no menu de Documentos."}
                                </p>
                            </CardContent>
                            <CardFooter>
                                <Link href="/dashboard/documents">
                                    <Button variant={user.verifiedStatus === 'VERIFIED' ? "outline" : "default"}>
                                        Enviar / Ver Documentos
                                    </Button>
                                </Link>
                            </CardFooter>
                        </Card>

                        <Card className={user.verifiedStatus !== 'VERIFIED' ? 'opacity-50' : ''}>
                            <CardHeader>
                                <CardTitle>Minha Rota Escolar</CardTitle>
                                <CardDescription>Cadastre o seu trajeto e horários habituais.</CardDescription>
                            </CardHeader>
                            <CardFooter>
                                <Link href={user.verifiedStatus === 'VERIFIED' ? "/dashboard/routes" : "#"}>
                                    <Button disabled={user.verifiedStatus !== 'VERIFIED'}>Gerenciar Rotas</Button>
                                </Link>
                            </CardFooter>
                        </Card>

                        {user.role === 'PASSENGER' && (
                            <Card className={user.verifiedStatus !== 'VERIFIED' ? 'opacity-50' : ''}>
                                <CardHeader>
                                    <CardTitle>Mãetoristas Próximas</CardTitle>
                                    <CardDescription>Encontre mães que fazem o mesmo caminho.</CardDescription>
                                </CardHeader>
                                <CardFooter>
                                    <Link href={user.verifiedStatus === 'VERIFIED' ? "/dashboard/matches" : "#"}>
                                        <Button disabled={user.verifiedStatus !== 'VERIFIED'} className="bg-green-600 hover:bg-green-700">
                                            Buscar Matches Geográficos
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
