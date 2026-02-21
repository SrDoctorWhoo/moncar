"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import NotificationsBell from "@/components/NotificationsBell";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { data: session, status } = useSession();
    const router = useRouter();

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/login");
        }
    }, [status, router]);

    if (status === "loading" || !session) {
        return <div className="min-h-screen flex items-center justify-center">Carregando...</div>;
    }

    const { role, verifiedStatus } = session.user as any;

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col">
            <header className="px-6 h-16 flex items-center border-b bg-white justify-between">
                <Link href="/dashboard" className="text-xl font-bold tracking-tight text-blue-600">
                    Momcar
                </Link>
                <nav className="flex gap-4 items-center">
                    <div className="hidden sm:block text-sm">
                        Status:
                        <span className={`ml-2 font-medium ${verifiedStatus === 'VERIFIED' ? 'text-green-600' : verifiedStatus === 'REJECTED' ? 'text-red-600' : 'text-orange-500'}`}>
                            {verifiedStatus === 'PENDING' ? 'Em Análise' : verifiedStatus === 'VERIFIED' ? 'Verificado' : 'Rejeitado'}
                        </span>
                    </div>
                    <div className="flex gap-2 items-center">
                        <NotificationsBell />
                        <Button variant="outline" size="sm" onClick={() => signOut()}>
                            Sair
                        </Button>
                    </div>
                </nav>
            </header>

            <div className="flex-1 flex flex-col sm:flex-row">
                {/* Sidebar Navigation */}
                <aside className="w-full sm:w-64 border-r bg-white p-4 hidden md:block">
                    <nav className="space-y-2">
                        <Link href="/dashboard">
                            <Button variant="ghost" className="w-full justify-start">Início</Button>
                        </Link>
                        <Link href="/dashboard/profile">
                            <Button variant="ghost" className="w-full justify-start">Meu Perfil</Button>
                        </Link>

                        {role !== "ADMIN" && (
                            <>
                                <Link href="/dashboard/documents">
                                    <Button variant="ghost" className="w-full justify-start">Meus Documentos</Button>
                                </Link>
                                {verifiedStatus === "VERIFIED" && (
                                    <Link href="/dashboard/routes">
                                        <Button variant="ghost" className="w-full justify-start">Cadastrar Rota</Button>
                                    </Link>
                                )}
                                {verifiedStatus === "VERIFIED" && role === "PASSENGER" && (
                                    <Link href="/dashboard/matches">
                                        <Button variant="ghost" className="w-full justify-start">Buscar Matches</Button>
                                    </Link>
                                )}
                            </>
                        )}

                        {role === "ADMIN" && (
                            <Link href="/dashboard/admin">
                                <Button variant="ghost" className="w-full justify-start text-purple-600 hover:text-purple-700">Painel Admin</Button>
                            </Link>
                        )}
                    </nav>
                </aside>

                {/* Main Content Area */}
                <main className="flex-1 p-6 overflow-y-auto">
                    {children}
                </main>
            </div>
        </div>
    );
}
