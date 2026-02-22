"use client";

import { useState, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import {
    Home,
    User,
    FileText,
    MapPin,
    Users,
    ShieldCheck,
    LogOut,
    ChevronLeft,
    ChevronRight,
    Menu,
    X,
    Activity,
    ChevronDown,
    MessageSquare
} from "lucide-react";

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { Button } from "@/components/ui/button";
import NotificationsBell from "@/components/NotificationsBell";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { data: session, status } = useSession();
    const router = useRouter();
    const pathname = usePathname();

    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    const [isMobileOpen, setIsMobileOpen] = useState(false);

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/login");
        }
    }, [status, router]);

    // Close mobile menu when pathname changes
    useEffect(() => {
        setIsMobileOpen(false);
    }, [pathname]);

    if (status === "loading" || !session) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="flex flex-col items-center gap-3">
                    <Activity className="w-8 h-8 text-blue-600 animate-pulse" />
                    <p className="text-slate-500 font-medium">Carregando painel...</p>
                </div>
            </div>
        );
    }

    const { role, verifiedStatus, name, email } = session.user as any;
    const isVerified = verifiedStatus === "VERIFIED";

    // Nav items definition
    const navItems = [
        { href: "/dashboard", label: "Início", icon: Home, show: true },
        {
            href: "/dashboard/documents",
            label: "Meus Documentos",
            icon: FileText,
            show: role !== "ADMIN"
        },
        {
            href: "/dashboard/routes",
            label: "Rotas Escolares",
            icon: MapPin,
            show: role !== "ADMIN" && isVerified
        },
        {
            href: "/dashboard/matches",
            label: "Buscar Matches",
            icon: Users,
            show: role === "PASSENGER" && isVerified
        },
        {
            href: "/dashboard/chat",
            label: "Conversas",
            icon: MessageSquare,
            show: role !== "ADMIN" && isVerified
        },
        {
            href: "/dashboard/admin",
            label: "Painel Admin",
            icon: ShieldCheck,
            show: role === "ADMIN",
            special: true
        },
    ];

    // Get initials for avatar
    const userInitials = name ? name.split(' ').slice(0, 2).map((n: string) => n[0]).join('').toUpperCase() : 'M';

    const SidebarContent = () => (
        <div className="flex flex-col h-full">
            {/* Logo Section */}
            <div className={`flex items-center h-16 border-b border-slate-100 ${isSidebarCollapsed ? 'justify-center' : 'px-6 justify-between'}`}>
                <div className="flex items-center gap-3 overflow-hidden">
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white flex-shrink-0 shadow-sm">
                        <span className="font-bold text-lg leading-none">M</span>
                    </div>
                    {!isSidebarCollapsed && (
                        <span className="text-xl font-bold tracking-tight text-slate-800 whitespace-nowrap">
                            Momcar
                        </span>
                    )}
                </div>
            </div>

            {/* Navigation links */}
            <nav className="flex-1 overflow-y-auto py-6 px-3 space-y-1.5 custom-scrollbar">
                {navItems.filter(item => item.show).map((item) => {
                    const isActive = item.href === "/dashboard"
                        ? pathname === "/dashboard"
                        : pathname === item.href || pathname.startsWith(item.href + "/");
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`flex items-center gap-3 rounded-xl transition-all duration-200 group
                                ${isSidebarCollapsed ? 'justify-center w-12 h-12 mx-auto' : 'px-3 py-3'}
                                ${isActive
                                    ? item.special
                                        ? 'bg-purple-50 text-purple-700'
                                        : 'bg-blue-50 text-blue-700 font-semibold'
                                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 font-medium'
                                }`}
                            title={isSidebarCollapsed ? item.label : undefined}
                        >
                            <item.icon className={`flex-shrink-0 transition-colors ${isSidebarCollapsed ? 'w-5 h-5' : 'w-5 h-5'} 
                                ${isActive ? (item.special ? 'text-purple-600' : 'text-blue-600') : 'text-slate-400 group-hover:text-slate-600'}`
                            } />

                            {!isSidebarCollapsed && (
                                <span className={`truncate ${item.special && !isActive ? 'text-purple-600' : ''}`}>
                                    {item.label}
                                </span>
                            )}

                            {/* Collapse Tooltip */}
                            {isSidebarCollapsed && (
                                <div className="absolute left-16 px-2.5 py-1.5 bg-slate-800 text-white text-xs font-medium rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap z-50">
                                    {item.label}
                                </div>
                            )}
                        </Link>
                    );
                })}
            </nav>

        </div>
    );

    return (
        <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">

            {/* Desktop Sidebar */}
            <aside
                className={`hidden md:block bg-white border-r border-slate-200 transition-all duration-300 ease-in-out relative z-20 
                    ${isSidebarCollapsed ? 'w-20' : 'w-72'}
                `}
            >
                <SidebarContent />

                {/* Collapse Toggle Button */}
                <button
                    onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                    className="absolute -right-3.5 top-20 w-7 h-7 bg-white border border-slate-200 rounded-full flex items-center justify-center text-slate-400 hover:text-blue-600 hover:border-blue-300 shadow-sm transition-all z-30"
                >
                    {isSidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
                </button>
            </aside>

            {/* Mobile Sidebar Overlay */}
            {isMobileOpen && (
                <div className="md:hidden fixed inset-0 z-40 flex">
                    {/* Backdrop */}
                    <div
                        className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity"
                        onClick={() => setIsMobileOpen(false)}
                    />

                    {/* Panel */}
                    <aside className="relative w-4/5 max-w-sm bg-white h-full shadow-2xl flex flex-col z-50 transform transition-transform duration-300">
                        <button
                            onClick={() => setIsMobileOpen(false)}
                            className="absolute right-4 top-4 p-2 text-slate-400 hover:bg-slate-100 rounded-full transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                        <SidebarContent />
                    </aside>
                </div>
            )}

            {/* Main Content Content Area */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">

                {/* Top Header */}
                <header className="h-16 px-4 md:px-6 flex items-center justify-between border-b border-slate-200/60 bg-white/70 backdrop-blur-md sticky top-0 z-10 transition-all">
                    <div className="flex items-center gap-3">
                        <button
                            className="md:hidden p-2 -ml-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                            onClick={() => setIsMobileOpen(true)}
                        >
                            <Menu className="w-5 h-5" />
                        </button>

                        {/* Current Page Title (Breadcrumb) */}
                        <div className="hidden sm:flex items-center gap-2 text-sm font-medium text-slate-500">
                            <span className="text-slate-400">Momcar</span>
                            <span className="text-slate-300">/</span>
                            <span className="text-slate-700">{navItems.find(i => i.href === pathname)?.label || 'Painel'}</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 md:gap-4">
                        <NotificationsBell />

                        <div className="h-6 w-px bg-slate-200 hidden sm:block mx-1"></div>

                        <DropdownMenu>
                            <DropdownMenuTrigger className="focus:outline-none">
                                <div className="flex items-center gap-3 hover:bg-slate-50 p-1.5 pr-3 rounded-full border border-transparent hover:border-slate-200 transition-all cursor-pointer">
                                    <div className="relative">
                                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 border border-indigo-200 flex items-center justify-center text-indigo-700 font-bold text-sm shadow-sm flex-shrink-0">
                                            {userInitials}
                                        </div>
                                        {/* Status Dot on avatar */}
                                        <div className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 border-2 border-white rounded-full 
                                            ${verifiedStatus === 'VERIFIED' ? 'bg-emerald-500' : verifiedStatus === 'REJECTED' ? 'bg-red-500' : 'bg-amber-400'}`}
                                        />
                                    </div>
                                    <div className="hidden sm:block text-left">
                                        <p className="text-sm font-semibold text-slate-800 leading-none">{name?.split(' ')[0]}</p>
                                        <p className="text-[11px] font-medium text-slate-500 mt-1 leading-none uppercase tracking-wider">
                                            {role === 'DRIVER' ? 'Mãetorista' : role === 'ADMIN' ? 'Admin' : 'Passageira'}
                                        </p>
                                    </div>
                                    <ChevronDown className="w-4 h-4 text-slate-400 hidden sm:block ml-1" />
                                </div>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-64 mt-2 rounded-xl shadow-lg border border-slate-100 p-2 relative z-50">
                                <div className="p-2 pb-3">
                                    <p className="text-sm font-bold text-slate-800 truncate">{name}</p>
                                    <p className="text-xs text-slate-500 truncate mt-0.5">{email}</p>
                                </div>

                                <div className="mb-2 px-1">
                                    <div className={`flex items-center justify-center gap-2.5 px-3 py-2.5 rounded-lg text-xs font-semibold border
                                        ${verifiedStatus === 'VERIFIED' ? 'bg-emerald-50 border-emerald-100 text-emerald-700' :
                                            verifiedStatus === 'REJECTED' ? 'bg-red-50 border-red-100 text-red-700' :
                                                'bg-amber-50 border-amber-100 text-amber-700'}`}
                                    >
                                        <ShieldCheck className="w-4 h-4" />
                                        <span>{verifiedStatus === 'PENDING' ? 'Conta em Análise' : verifiedStatus === 'VERIFIED' ? 'Conta Verificada' : 'Documentos Rejeitados'}</span>
                                    </div>
                                </div>

                                <DropdownMenuSeparator className="bg-slate-100" />

                                <DropdownMenuItem onClick={() => router.push('/dashboard/profile')} className="cursor-pointer gap-3 py-2.5 mt-1 rounded-lg focus:bg-slate-50 transition-colors">
                                    <User className="h-4 w-4 text-slate-500" />
                                    <span className="font-medium text-slate-700">Meu Perfil</span>
                                </DropdownMenuItem>

                                <DropdownMenuItem onClick={() => signOut()} className="cursor-pointer gap-3 py-2.5 rounded-lg text-red-600 focus:text-red-700 focus:bg-red-50 transition-colors">
                                    <LogOut className="h-4 w-4" />
                                    <span className="font-medium">Sair da conta</span>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </header>

                {/* Page Content Scrollable Area */}
                <main className="flex-1 overflow-y-auto w-full custom-scrollbar">
                    <div className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto min-h-full">
                        {children}
                    </div>
                </main>
            </div>

            {/* Global style overrides for scrollbars within layout if global.css doesn't have it */}
            <style jsx global>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 6px;
                    height: 6px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background-color: #cbd5e1;
                    border-radius: 20px;
                }
                .custom-scrollbar:hover::-webkit-scrollbar-thumb {
                    background-color: #94a3b8;
                }
            `}</style>
        </div>
    );
}
