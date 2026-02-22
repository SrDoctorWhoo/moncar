"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import axios from "axios";
import { toast } from "sonner";

/* ─── Types ─────────────────────────────────────────── */
interface PendingDoc {
    id: string;
    tipo_documento: string;
    url: string;
    status: string;
    numero_documento?: string;
    data_validade?: string;
    createdAt: string;
    user: { nome: string; email: string; tipo_perfil: string };
}

interface User {
    id: string;
    nome: string;
    email: string;
    tipo_perfil: string;
    status_verificacao: string;
    createdAt: string;
}

interface DocumentConfig {
    id?: string;
    tipo_documento: string;
    label: string;
    descricao?: string;
    icone?: string;
    perfil: string;
    ativo: boolean;
    ordem: number;
}

/* ─── Constants ──────────────────────────────────────── */
const DOC_LABELS: Record<string, { label: string; icon: string }> = {
    RG_CNH: { label: "Documento da Mãe", icon: "🪪" },
    CRIANCA: { label: "Documento da Criança", icon: "⭐" },
    CNH_MOTORISTA: { label: "CNH Mãetorista", icon: "🚗" },
};

const PROFILE_LABELS: Record<string, { label: string; color: string; bg: string }> = {
    DRIVER: { label: "Mãetorista", color: "text-violet-700", bg: "bg-violet-50 border-violet-200" },
    PASSENGER: { label: "Passageira", color: "text-sky-700", bg: "bg-sky-50 border-sky-200" },
    ADMIN: { label: "Admin", color: "text-amber-700", bg: "bg-amber-50 border-amber-200" },
};

const VERIFY_LABELS: Record<string, { label: string; dot: string; color: string; bg: string; border: string }> = {
    PENDING: { label: "Em Análise", dot: "bg-amber-400", color: "text-amber-700", bg: "bg-amber-50", border: "border-amber-200" },
    VERIFIED: { label: "Verificado", dot: "bg-emerald-400", color: "text-emerald-700", bg: "bg-emerald-50", border: "border-emerald-200" },
    REJECTED: { label: "Rejeitado", dot: "bg-red-400", color: "text-red-700", bg: "bg-red-50", border: "border-red-200" },
};

/* ─── Component ──────────────────────────────────────── */
export default function AdminDashboardPage() {
    const { data: session } = useSession();
    const [pendingDocs, setPendingDocs] = useState<PendingDoc[]>([]);
    const [users, setUsers] = useState<User[]>([]);
    const [observations, setObservations] = useState<Record<string, string>>({});
    const [activeTab, setActiveTab] = useState<"docs" | "users" | "settings">("docs");
    const [actionLoading, setActionLoading] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [expandedDoc, setExpandedDoc] = useState<string | null>(null);
    const [documentConfigs, setDocumentConfigs] = useState<DocumentConfig[]>([]);
    const [isSavingConfig, setIsSavingConfig] = useState(false);

    const defaultConfigs: DocumentConfig[] = [
        { tipo_documento: "RG_CNH", label: "Documento da Mãe", descricao: "RG, CNH ou Passaporte", icone: "🪪", perfil: "PASSENGER", ativo: true, ordem: 0 },
        { tipo_documento: "CRIANCA", label: "Documento da Criança", descricao: "Certidão ou RG do menor", icone: "⭐", perfil: "PASSENGER", ativo: true, ordem: 1 },
        { tipo_documento: "RG_CNH", label: "Documento da Mãe", descricao: "RG, CNH ou Passaporte", icone: "🪪", perfil: "DRIVER", ativo: true, ordem: 0 },
        { tipo_documento: "CRIANCA", label: "Documento da Criança", descricao: "Certidão ou RG do menor", icone: "⭐", perfil: "DRIVER", ativo: true, ordem: 1 },
        { tipo_documento: "CNH_MOTORISTA", label: "CNH Mãetorista", descricao: "CNH válida (obrigatório)", icone: "🚗", perfil: "DRIVER", ativo: true, ordem: 2 },
    ];

    useEffect(() => { if (session) fetchData(); }, [session]);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const [docsRes, usersRes, configRes] = await Promise.all([
                axios.get("/api/admin/documents/pending"),
                axios.get("/api/admin/users"),
                axios.get("/api/admin/document-config"),
            ]);
            setPendingDocs(docsRes.data);
            setUsers(usersRes.data);
            setDocumentConfigs(configRes.data.length > 0 ? configRes.data : defaultConfigs);
        } catch {
            toast.error("Erro ao carregar dados do painel.");
        } finally {
            setIsLoading(false);
        }
    };

    const saveConfigs = async () => {
        setIsSavingConfig(true);
        try {
            await axios.put("/api/admin/document-config", documentConfigs);
            toast.success("Configurações salvas com sucesso!");
            fetchData();
        } catch {
            toast.error("Erro ao salvar configurações.");
        } finally {
            setIsSavingConfig(false);
        }
    };

    const handleAction = async (docId: string, status: "APPROVED" | "REJECTED") => {
        const obs = observations[docId] || "";
        if (status === "REJECTED" && !obs.trim()) {
            return toast.error("Insira uma observação para rejeitar o documento.");
        }

        setActionLoading(docId + status);
        try {
            await axios.patch(`/api/admin/documents/${docId}`, {
                status,
                observacao_admin: obs,
            });
            toast.success(status === "APPROVED" ? "✅ Documento aprovado!" : "❌ Documento rejeitado.");
            setPendingDocs((prev) => prev.filter((d) => d.id !== docId));
            fetchData();
        } catch {
            toast.error("Erro ao processar documento.");
        } finally {
            setActionLoading(null);
        }
    };

    if ((session?.user as any)?.role !== "ADMIN") {
        return (
            <div className="flex flex-col items-center justify-center min-h-64 gap-3">
                <div className="text-5xl">🚫</div>
                <p className="text-lg font-semibold text-red-600">Acesso Negado</p>
                <p className="text-sm text-slate-400">Esta área é exclusiva para administradores.</p>
            </div>
        );
    }

    /* ── derived stats ── */
    const verifiedCount = users.filter((u) => u.status_verificacao === "VERIFIED").length;
    const pendingCount = users.filter((u) => u.status_verificacao === "PENDING").length;
    const driverCount = users.filter((u) => u.tipo_perfil === "DRIVER").length;
    const passengerCount = users.filter((u) => u.tipo_perfil === "PASSENGER").length;

    const filteredUsers = users.filter(
        (u) =>
            u.nome.toLowerCase().includes(search.toLowerCase()) ||
            u.email.toLowerCase().includes(search.toLowerCase())
    );

    /* ── render ── */
    return (
        <div className="max-w-5xl mx-auto space-y-7 pb-12">
            {/* ─── Header ──────────────────────────────── */}
            <div className="flex items-start justify-between flex-wrap gap-4">
                <div>
                    <div className="flex items-center gap-3 mb-1">
                        <div className="w-9 h-9 rounded-xl bg-violet-600 flex items-center justify-center text-white text-lg shadow">
                            🛡️
                        </div>
                        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Painel Administrativo</h1>
                    </div>
                    <p className="text-sm text-slate-500 mt-1">
                        Gerencie documentos pendentes e acompanhe as mães cadastradas na plataforma.
                    </p>
                </div>
                <button
                    onClick={fetchData}
                    className="text-xs text-slate-500 flex items-center gap-1.5 border border-slate-200 rounded-lg px-3 py-1.5 hover:bg-slate-50 transition-colors"
                >
                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Atualizar
                </button>
            </div>

            {/* ─── KPI Cards ───────────────────────────── */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                    { label: "Usuárias", value: users.length, icon: "👩‍👧", color: "text-slate-700", bg: "bg-white", border: "border-slate-200" },
                    { label: "Verificadas", value: verifiedCount, icon: "✅", color: "text-emerald-700", bg: "bg-emerald-50", border: "border-emerald-100" },
                    { label: "Em Análise", value: pendingCount, icon: "⏳", color: "text-amber-700", bg: "bg-amber-50", border: "border-amber-100" },
                    { label: "Docs Pendentes", value: pendingDocs.length, icon: "📋", color: "text-violet-700", bg: "bg-violet-50", border: "border-violet-100" },
                ].map((s) => (
                    <div key={s.label} className={`rounded-xl border ${s.border} ${s.bg} p-4 shadow-sm`}>
                        <div className="text-xl mb-1">{s.icon}</div>
                        <p className={`text-2xl font-bold ${s.color}`}>{isLoading ? "—" : s.value}</p>
                        <p className="text-xs text-slate-400 mt-0.5">{s.label}</p>
                    </div>
                ))}
            </div>

            {/* ─── Tabs ────────────────────────────────── */}
            <div className="flex border-b border-slate-200 gap-1">
                {(
                    [
                        { id: "docs", label: "Documentos Pendentes", badge: pendingDocs.length },
                        { id: "users", label: "Mães Cadastradas", badge: users.length },
                        { id: "settings", label: "Configurações", badge: "" },
                    ] as const
                ).map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`relative flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-colors rounded-t-lg
              ${activeTab === tab.id
                                ? "text-violet-700 border-b-2 border-violet-600 -mb-px bg-white"
                                : "text-slate-500 hover:text-slate-700 hover:bg-slate-50"
                            }`}
                    >
                        {tab.label}
                        {!isLoading && (
                            <span
                                className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full
                  ${activeTab === tab.id ? "bg-violet-100 text-violet-700" : "bg-slate-100 text-slate-500"}`}
                            >
                                {tab.badge}
                            </span>
                        )}
                    </button>
                ))}
            </div>

            {/* ─── Tab: Documentos Pendentes ───────────── */}
            {activeTab === "docs" && (
                <div>
                    {isLoading ? (
                        <div className="space-y-3">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="h-32 rounded-xl bg-slate-100 animate-pulse" />
                            ))}
                        </div>
                    ) : pendingDocs.length === 0 ? (
                        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50 py-16 text-center">
                            <div className="text-5xl mb-3">🎉</div>
                            <p className="text-sm font-semibold text-slate-600">Nenhum documento pendente!</p>
                            <p className="text-xs text-slate-400 mt-1">Todos os documentos foram analisados.</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {pendingDocs.map((doc) => {
                                const isExpanded = expandedDoc === doc.id;
                                const docInfo = DOC_LABELS[doc.tipo_documento] ?? { label: doc.tipo_documento, icon: "📄" };
                                const profileInfo = PROFILE_LABELS[doc.user.tipo_perfil];
                                const isApproving = actionLoading === doc.id + "APPROVED";
                                const isRejecting = actionLoading === doc.id + "REJECTED";

                                return (
                                    <div
                                        key={doc.id}
                                        className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden transition-shadow hover:shadow-md"
                                    >
                                        {/* Card Header — always visible */}
                                        <button
                                            className="w-full text-left flex items-center gap-4 px-5 py-4"
                                            onClick={() => setExpandedDoc(isExpanded ? null : doc.id)}
                                        >
                                            {/* Doc icon */}
                                            <div className="w-11 h-11 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-xl flex-shrink-0">
                                                {docInfo.icon}
                                            </div>

                                            {/* Info */}
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <p className="text-sm font-semibold text-slate-800">{docInfo.label}</p>
                                                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${profileInfo?.bg} ${profileInfo?.color}`}>
                                                        {profileInfo?.label ?? doc.user.tipo_perfil}
                                                    </span>
                                                </div>
                                                <p className="text-xs text-slate-400 mt-0.5 truncate">
                                                    {doc.user.nome} · {doc.user.email}
                                                </p>
                                            </div>

                                            {/* Date + chevron */}
                                            <div className="flex-shrink-0 flex items-center gap-3">
                                                <span className="text-xs text-slate-400 hidden sm:block">
                                                    {new Date(doc.createdAt).toLocaleDateString("pt-BR", {
                                                        day: "2-digit", month: "short", year: "numeric",
                                                    })}
                                                </span>
                                                <svg
                                                    className={`w-4 h-4 text-slate-400 transition-transform ${isExpanded ? "rotate-180" : ""}`}
                                                    viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                                                >
                                                    <path d="M19 9l-7 7-7-7" />
                                                </svg>
                                            </div>
                                        </button>

                                        {/* Expanded area */}
                                        {isExpanded && (
                                            <div className="border-t border-slate-100 px-5 py-4 space-y-4 bg-slate-50/50">
                                                {/* File preview */}
                                                <div className="rounded-lg border border-slate-200 bg-white p-4 flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center text-lg flex-shrink-0">
                                                        📎
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-xs font-medium text-slate-600 truncate">{doc.url}</p>
                                                        <p className="text-xs text-slate-400 mt-0.5">Arquivo enviado pela usuária</p>
                                                    </div>
                                                    <a
                                                        href={doc.url}
                                                        target="_blank"
                                                        rel="noreferrer"
                                                        onClick={(e) => e.stopPropagation()}
                                                        className="text-xs font-semibold text-violet-600 hover:text-violet-800 flex-shrink-0 underline"
                                                    >
                                                        Abrir ↗
                                                    </a>
                                                </div>

                                                {/* Document Data Details */}
                                                {(doc.numero_documento || doc.data_validade) && (
                                                    <div className="grid grid-cols-2 gap-3">
                                                        {doc.numero_documento && (
                                                            <div className="bg-white border border-slate-200 rounded-lg p-3">
                                                                <p className="text-[10px] uppercase tracking-wider font-bold text-slate-400 mb-1">Número Infomado</p>
                                                                <p className="text-sm font-mono font-semibold text-slate-700">{doc.numero_documento}</p>
                                                            </div>
                                                        )}
                                                        {doc.data_validade && (
                                                            <div className="bg-white border border-slate-200 rounded-lg p-3">
                                                                <p className="text-[10px] uppercase tracking-wider font-bold text-slate-400 mb-1">Data de Validade</p>
                                                                <p className={`text-sm font-semibold ${new Date(doc.data_validade) < new Date() ? 'text-red-600' : 'text-slate-700'}`}>
                                                                    {new Date(doc.data_validade).toLocaleDateString("pt-BR")}
                                                                    {new Date(doc.data_validade) < new Date() && <span className="ml-2 text-[10px] bg-red-100 px-1.5 py-0.5 rounded text-red-700">EXPERADO</span>}
                                                                </p>
                                                            </div>
                                                        )}
                                                    </div>
                                                )}

                                                {/* Observation */}
                                                <div className="space-y-1.5">
                                                    <label className="text-xs font-medium text-slate-600">
                                                        Observação{" "}
                                                        <span className="text-red-400 font-normal">(obrigatório ao rejeitar)</span>
                                                    </label>
                                                    <textarea
                                                        rows={2}
                                                        placeholder="Escreva um feedback para a usuária..."
                                                        value={observations[doc.id] || ""}
                                                        onChange={(e) =>
                                                            setObservations((prev) => ({ ...prev, [doc.id]: e.target.value }))
                                                        }
                                                        className="w-full text-sm rounded-lg border border-slate-200 bg-white px-3 py-2 text-slate-700 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-violet-300 focus:border-transparent resize-none transition"
                                                    />
                                                </div>

                                                {/* Actions */}
                                                <div className="flex gap-2 pt-1">
                                                    <button
                                                        onClick={() => handleAction(doc.id, "REJECTED")}
                                                        disabled={!!actionLoading}
                                                        className={`flex-1 py-2 rounded-lg text-sm font-semibold border transition-all duration-150
                              ${isRejecting
                                                                ? "bg-red-50 border-red-200 text-red-400 cursor-not-allowed"
                                                                : "border-red-200 text-red-600 hover:bg-red-50 active:scale-[0.98]"
                                                            }`}
                                                    >
                                                        {isRejecting ? (
                                                            <span className="flex items-center justify-center gap-1.5">
                                                                <svg className="animate-spin h-3.5 w-3.5" viewBox="0 0 24 24" fill="none">
                                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                                                                </svg>
                                                                Rejeitando...
                                                            </span>
                                                        ) : "❌ Rejeitar"}
                                                    </button>
                                                    <button
                                                        onClick={() => handleAction(doc.id, "APPROVED")}
                                                        disabled={!!actionLoading}
                                                        className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all duration-150
                              ${isApproving
                                                                ? "bg-emerald-400 text-white cursor-not-allowed"
                                                                : "bg-emerald-600 text-white hover:bg-emerald-700 active:scale-[0.98] shadow-sm shadow-emerald-200"
                                                            }`}
                                                    >
                                                        {isApproving ? (
                                                            <span className="flex items-center justify-center gap-1.5">
                                                                <svg className="animate-spin h-3.5 w-3.5" viewBox="0 0 24 24" fill="none">
                                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                                                                </svg>
                                                                Aprovando...
                                                            </span>
                                                        ) : "✅ Aprovar"}
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            )}

            {/* ─── Tab: Usuárias ───────────────────────── */}
            {activeTab === "users" && (
                <div className="space-y-4">
                    {/* Search + summary */}
                    <div className="flex items-center gap-3 flex-wrap">
                        <div className="relative flex-1 min-w-48">
                            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />
                            </svg>
                            <input
                                type="text"
                                placeholder="Buscar por nome ou e-mail..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-slate-200 bg-white text-slate-700 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-violet-300 focus:border-transparent transition"
                            />
                        </div>
                        <div className="flex gap-2 text-xs text-slate-500">
                            <span className="bg-violet-50 border border-violet-100 text-violet-700 px-2.5 py-1.5 rounded-lg font-medium">
                                🚗 {driverCount} Mãetoristas
                            </span>
                            <span className="bg-sky-50 border border-sky-100 text-sky-700 px-2.5 py-1.5 rounded-lg font-medium">
                                👩‍👧 {passengerCount} Passageiras
                            </span>
                        </div>
                    </div>

                    {/* Table */}
                    {isLoading ? (
                        <div className="space-y-2">
                            {[1, 2, 3, 4].map((i) => (
                                <div key={i} className="h-14 rounded-xl bg-slate-100 animate-pulse" />
                            ))}
                        </div>
                    ) : filteredUsers.length === 0 ? (
                        <div className="flex flex-col items-center py-14 text-center">
                            <div className="text-4xl mb-3">🔍</div>
                            <p className="text-sm font-medium text-slate-600">Nenhuma usuária encontrada</p>
                        </div>
                    ) : (
                        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                            <table className="w-full text-sm text-left">
                                <thead>
                                    <tr className="bg-slate-50 border-b border-slate-100">
                                        <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Usuária</th>
                                        <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide hidden md:table-cell">Perfil</th>
                                        <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Verificação</th>
                                        <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide hidden lg:table-cell">Cadastro</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {filteredUsers.map((u) => {
                                        const profileInfo = PROFILE_LABELS[u.tipo_perfil];
                                        const verifyInfo = VERIFY_LABELS[u.status_verificacao] ?? VERIFY_LABELS.PENDING;
                                        const initials = u.nome.split(" ").slice(0, 2).map((n) => n[0]).join("").toUpperCase();

                                        return (
                                            <tr key={u.id} className="hover:bg-slate-50/80 transition-colors">
                                                {/* Name + email */}
                                                <td className="px-4 py-3">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 rounded-full bg-violet-100 flex items-center justify-center text-xs font-bold text-violet-700 flex-shrink-0">
                                                            {initials}
                                                        </div>
                                                        <div className="min-w-0">
                                                            <p className="font-medium text-slate-800 truncate">{u.nome}</p>
                                                            <p className="text-xs text-slate-400 truncate">{u.email}</p>
                                                        </div>
                                                    </div>
                                                </td>

                                                {/* Profile type */}
                                                <td className="px-4 py-3 hidden md:table-cell">
                                                    <span className={`inline-flex items-center text-xs font-semibold px-2.5 py-1 rounded-full border ${profileInfo?.bg} ${profileInfo?.color}`}>
                                                        {profileInfo?.label ?? u.tipo_perfil}
                                                    </span>
                                                </td>

                                                {/* Verification */}
                                                <td className="px-4 py-3">
                                                    <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border ${verifyInfo.bg} ${verifyInfo.color} ${verifyInfo.border}`}>
                                                        <span className={`w-1.5 h-1.5 rounded-full ${verifyInfo.dot}`} />
                                                        {verifyInfo.label}
                                                    </span>
                                                </td>

                                                {/* Date */}
                                                <td className="px-4 py-3 text-xs text-slate-400 hidden lg:table-cell">
                                                    {new Date(u.createdAt).toLocaleDateString("pt-BR", {
                                                        day: "2-digit", month: "short", year: "numeric",
                                                    })}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>

                            {/* Table footer */}
                            <div className="px-4 py-3 border-t border-slate-100 text-xs text-slate-400 bg-slate-50/50">
                                Exibindo {filteredUsers.length} de {users.length} usuárias
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* ─── Tab: Configurações ───────────────────────── */}
            {activeTab === "settings" && (
                <div className="space-y-6">
                    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden p-6">
                        <h2 className="text-lg font-semibold text-slate-800 mb-2">Documentos Obrigatórios</h2>
                        <p className="text-sm text-slate-500 mb-6">Configure quais documentos cada perfil precisa enviar para ter a conta verificada.</p>

                        {(["PASSENGER", "DRIVER"] as const).map(perfil => (
                            <div key={perfil} className="mb-8 last:mb-0">
                                <h3 className="text-md font-semibold text-slate-700 mb-3 flex items-center gap-2">
                                    {perfil === "DRIVER" ? "🚗 Mãetorista" : "👩‍👧 Passageira"}
                                </h3>
                                <div className="space-y-3">
                                    {documentConfigs.filter(c => c.perfil === perfil).map(config => (
                                        <div key={config.tipo_documento + perfil} className="flex items-center justify-between p-4 rounded-xl border border-slate-100 bg-slate-50">
                                            <div className="flex items-center gap-3 w-full">
                                                <div className="w-10 h-10 rounded-lg bg-white shadow-sm flex items-center justify-center text-xl flex-shrink-0">
                                                    {config.icone}
                                                </div>
                                                <div className="flex-1">
                                                    <p className="font-semibold text-sm text-slate-800">{config.label}</p>
                                                    <p className="text-xs text-slate-500 mt-0.5">{config.descricao}</p>
                                                </div>
                                                <div className="flex-shrink-0">
                                                    <label className="relative inline-flex items-center cursor-pointer">
                                                        <input
                                                            type="checkbox"
                                                            className="sr-only peer"
                                                            checked={config.ativo}
                                                            onChange={(e) => {
                                                                setDocumentConfigs(prev => prev.map(c =>
                                                                    c.tipo_documento === config.tipo_documento && c.perfil === perfil
                                                                        ? { ...c, ativo: e.target.checked } : c
                                                                ));
                                                            }}
                                                        />
                                                        <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                                                    </label>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}

                        <div className="mt-8 flex justify-end pt-5 border-t border-slate-100">
                            <button
                                onClick={saveConfigs}
                                disabled={isSavingConfig}
                                className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200
                                    ${isSavingConfig
                                        ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                                        : "bg-violet-600 text-white hover:bg-violet-700 active:scale-[0.98] shadow-sm shadow-violet-200"
                                    }`}
                            >
                                {isSavingConfig ? (
                                    <span className="flex items-center gap-2">
                                        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" /></svg>
                                        Salvando...
                                    </span>
                                ) : "Salvar Configurações"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
