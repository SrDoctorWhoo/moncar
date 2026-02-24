"use client";

import { useState, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import {
    Menu,
    X,
    ChevronDown,
} from "lucide-react";

import {
    FaHouse,
    FaFileSignature,
    FaMapLocationDot,
    FaUsersViewfinder,
    FaComments,
    FaShieldHalved,
    FaArrowRightFromBracket,
    FaCircleNotch,
    FaRegUser
} from "react-icons/fa6";

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import NotificationsBell from "@/components/NotificationsBell";
import { MomcarLogo } from "@/components/ui/Logo";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { data: session, status } = useSession();
    const router = useRouter();
    const pathname = usePathname();

    const [isMobileOpen, setIsMobileOpen] = useState(false);

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/login");
        }
    }, [status, router]);

    useEffect(() => {
        setIsMobileOpen(false);
    }, [pathname]);

    if (status === "loading" || !session) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background text-secondary">
                <div className="flex flex-col items-center gap-4">
                    <FaCircleNotch className="w-12 h-12 animate-spin text-primary" />
                    <p className="font-semibold text-sm">Sincronizando Sistema...</p>
                </div>
            </div>
        );
    }

    const { role, verifiedStatus, name, email } = session.user as any;
    const isVerified = verifiedStatus === "VERIFIED";

    const navItems = [
        { href: "/dashboard", label: "Painel Central", icon: FaHouse, show: true },
        {
            href: "/dashboard/documents",
            label: "Dossier Documental",
            icon: FaFileSignature,
            show: role !== "ADMIN"
        },
        {
            href: "/dashboard/routes",
            label: "Malha Viária",
            icon: FaMapLocationDot,
            show: role !== "ADMIN" && isVerified
        },
        {
            href: "/dashboard/matches",
            label: "Mãetoristas Próximas",
            icon: FaUsersViewfinder,
            show: role === "PASSENGER" && isVerified
        },
        {
            href: "/dashboard/chat",
            label: "Comunicações",
            icon: FaComments,
            show: role !== "ADMIN" && isVerified
        },
        {
            href: "/dashboard/admin",
            label: "Comando Geral",
            icon: FaShieldHalved,
            show: role === "ADMIN",
            special: true
        },
    ];

    const userInitials = name ? name.split(' ').slice(0, 2).map((n: string) => n[0]).join('').toUpperCase() : 'M';

    const SidebarContent = () => (
        <div className="flex flex-col h-full bg-secondary text-white relative overflow-hidden">
            {/* Soft decorative blur */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/4 pointer-events-none"></div>

            {/* Logo Section */}
            <div className="flex items-center justify-center sm:justify-start h-20 px-8 border-b border-white/10 relative z-10 w-full">
                <Link href="/dashboard" className="flex items-center group py-2">
                    <span className="sr-only">Momcar</span>
                    <MomcarLogo className="h-12 sm:h-16 w-auto drop-shadow-sm" />
                </Link>
            </div>

            {/* Navigation links */}
            <nav className="flex-1 overflow-y-auto py-8 px-4 space-y-2 custom-scrollbar relative z-10">
                <p className="px-4 text-xs font-semibold text-white/50 uppercase tracking-wider mb-4">Acesso Rápido</p>
                {navItems.filter(item => item.show).map((item) => {
                    const isActive = item.href === "/dashboard"
                        ? pathname === "/dashboard"
                        : pathname === item.href || pathname.startsWith(item.href + "/");
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-all group
                                ${isActive
                                    ? item.special
                                        ? 'bg-accent/80 text-white shadow-md'
                                        : 'bg-primary text-white shadow-md shadow-primary/20'
                                    : 'text-white/70 hover:bg-white/10 hover:text-white'
                                }`}
                        >
                            <item.icon className={`flex-shrink-0 w-5 h-5 transition-colors ${isActive ? 'text-white' : 'text-white/70 group-hover:text-white'}`} />
                            <span className="font-medium text-sm">
                                {item.label}
                            </span>
                        </Link>
                    );
                })}
            </nav>

            <div className="p-6 border-t border-white/10 bg-secondary-foreground/5 relative z-10">
                <button
                    onClick={() => signOut()}
                    className="flex w-full items-center justify-start rounded-xl px-4 py-3 text-sm font-medium text-white/70 hover:bg-white/10 hover:text-white transition-colors gap-3"
                >
                    <FaArrowRightFromBracket className="w-4 h-4" /> Encerrar Sessão
                </button>
            </div>
        </div>
    );

    return (
        <div className="flex h-screen bg-background overflow-hidden font-sans">
            {/* Desktop Sidebar */}
            <aside className="hidden md:block w-72 h-full z-20 shadow-[-10px_0_30px_rgba(0,0,0,0.1)_inset]">
                <SidebarContent />
            </aside>

            {/* Mobile Sidebar Overlay */}
            {isMobileOpen && (
                <div className="md:hidden fixed inset-0 z-40 flex">
                    <div
                        className="fixed inset-0 bg-secondary/80 backdrop-blur-sm transition-opacity"
                        onClick={() => setIsMobileOpen(false)}
                    />
                    <aside className="relative w-[85%] max-w-sm h-full z-50 transform transition-transform duration-300 shadow-2xl">
                        <button
                            onClick={() => setIsMobileOpen(false)}
                            className="absolute right-4 top-4 p-2 text-white bg-white/10 hover:bg-white/20 rounded-full transition-colors z-50 flex items-center justify-center"
                        >
                            <X className="w-5 h-5" />
                        </button>
                        <SidebarContent />
                    </aside>
                </div>
            )}

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
                {/* Top Header */}
                <header className="h-20 px-4 sm:px-6 lg:px-10 flex items-center justify-between border-b border-foreground/5 bg-white/80 backdrop-blur-md sticky top-0 z-40 transition-all shadow-sm">
                    <div className="flex items-center gap-2 sm:gap-4">
                        <button
                            className="md:hidden p-2 text-secondary bg-secondary/5 hover:bg-secondary/10 rounded-xl transition-colors shrink-0"
                            onClick={() => setIsMobileOpen(true)}
                        >
                            <Menu className="w-5 h-5" />
                        </button>

                        <div className="hidden sm:flex items-center gap-3 font-semibold text-sm">
                            <span className="text-secondary opacity-50">App / </span>
                            <span className="text-secondary">{navItems.find(i => i.href === pathname)?.label || 'Painel'}</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-4 lg:gap-6">
                        <NotificationsBell />

                        <div className="h-8 w-[1px] bg-foreground/5 hidden sm:block mx-1"></div>

                        <DropdownMenu>
                            <DropdownMenuTrigger className="focus:outline-none">
                                <div className="flex items-center gap-3 hover:bg-secondary/5 p-1.5 pr-4 rounded-full transition-all cursor-pointer border border-transparent hover:border-foreground/5">
                                    <div className="text-right hidden sm:block">
                                        <p className="text-sm font-bold text-secondary leading-none">{name?.split(' ')[0]}</p>
                                        <p className="text-[11px] font-semibold text-muted-foreground mt-1.5 leading-none">
                                            {role === 'DRIVER' ? 'Mãetorista' : role === 'ADMIN' ? 'Gestor' : 'Passageira'}
                                        </p>
                                    </div>
                                    <div className="relative">
                                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm border border-primary/20">
                                            {userInitials}
                                        </div>
                                        <div className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 border-2 border-white rounded-full 
                                            ${verifiedStatus === 'VERIFIED' ? 'bg-green-500' : verifiedStatus === 'REJECTED' ? 'bg-destructive' : 'bg-orange-400'}`}
                                        />
                                    </div>
                                    <ChevronDown className="w-4 h-4 text-muted-foreground hidden sm:block ml-1" />
                                </div>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-64 mt-2 rounded-2xl shadow-xl shadow-foreground/5 border border-foreground/5 p-2 bg-white">
                                <div className="p-3 bg-background rounded-xl mb-2">
                                    <p className="text-sm font-bold text-secondary truncate">{name}</p>
                                    <p className="text-xs font-medium text-muted-foreground truncate mt-0.5">{email}</p>
                                </div>

                                <div className="px-1 mb-2">
                                    <div className={`flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg text-xs font-bold
                                        ${verifiedStatus === 'VERIFIED' ? 'bg-green-50 text-green-700' :
                                            verifiedStatus === 'REJECTED' ? 'bg-destructive/10 text-destructive' :
                                                'bg-orange-50 text-orange-700'}`}
                                    >
                                        <FaShieldHalved className="w-4 h-4" />
                                        <span>{verifiedStatus === 'PENDING' ? 'Auditoria Pendente' : verifiedStatus === 'VERIFIED' ? 'Conta Autenticada' : 'Doc. Rejeitada'}</span>
                                    </div>
                                </div>

                                <DropdownMenuSeparator className="bg-foreground/5 my-1" />

                                <div className="p-1">
                                    <DropdownMenuItem onClick={() => router.push('/dashboard/profile')} className="cursor-pointer gap-3 py-2.5 rounded-xl hover:bg-secondary/5 focus:bg-secondary/5 transition-colors font-medium text-sm text-secondary">
                                        <FaRegUser className="h-4 w-4" />
                                        <span>Meu Perfil</span>
                                    </DropdownMenuItem>

                                    <DropdownMenuItem onClick={() => signOut()} className="cursor-pointer gap-3 py-2.5 mt-1 rounded-xl focus:bg-destructive/10 hover:bg-destructive/10 transition-colors font-medium text-sm text-destructive">
                                        <FaArrowRightFromBracket className="h-4 w-4" />
                                        <span>Sair da Conta</span>
                                    </DropdownMenuItem>
                                </div>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </header>

                <main className="flex-1 overflow-y-auto w-full custom-scrollbar">
                    <div className="p-4 sm:p-6 md:p-8 lg:p-12 max-w-7xl mx-auto min-h-full">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}
