"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import axios from "axios";
import {
    MessageSquare,
    Search,
    Clock,
    ArrowRight,
    ShieldCheck,
    Inbox
} from "lucide-react";

export default function ChatListPage() {
    const { data: session } = useSession();
    const router = useRouter();
    const [chats, setChats] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        if (session) {
            fetchChats();
        }
    }, [session]);

    const fetchChats = async () => {
        try {
            const res = await axios.get("/api/matches");
            setChats(res.data);
        } catch (err) {
            console.error("Error fetching chats");
        } finally {
            setIsLoading(false);
        }
    };

    const filteredChats = chats.filter(chat =>
        chat.otherUser.nome.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh]">
                <div className="w-12 h-12 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin mb-4" />
                <p className="text-slate-500 font-medium">Carregando suas conversas...</p>
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto space-y-8 pb-12">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Suas Conversas</h1>
                    <p className="text-slate-500 mt-1 font-medium">Combine os detalhes das suas caronas com outras mães.</p>
                </div>

                <div className="relative w-full md:w-72 group">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
                    <input
                        type="text"
                        placeholder="Buscar conversa..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:ring-4 focus:ring-emerald-50 focus:border-emerald-500 transition-all text-sm font-medium"
                    />
                </div>
            </div>

            {filteredChats.length === 0 ? (
                <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-4 shadow-sm">
                    <div className="w-20 h-20 bg-slate-50 text-slate-300 rounded-[2rem] flex items-center justify-center mx-auto">
                        <Inbox className="w-10 h-10" />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-slate-800">Nenhuma conversa encontrada</h3>
                        <p className="text-slate-500 max-w-sm mx-auto mt-2">
                            {searchTerm
                                ? "Não encontramos nenhuma conversa com esse nome."
                                : "Você ainda não iniciou nenhuma conversa. Comece buscando por matches!"}
                        </p>
                    </div>
                    {!searchTerm && (
                        <button
                            onClick={() => router.push('/dashboard/matches')}
                            className="bg-slate-900 text-white px-6 py-2.5 rounded-xl font-bold text-sm shadow-lg shadow-slate-200 hover:scale-105 transition-all active:scale-95"
                        >
                            Buscar Matches
                        </button>
                    )}
                </div>
            ) : (
                <div className="grid gap-4">
                    {filteredChats.map((chat) => (
                        <div
                            key={chat.id}
                            onClick={() => router.push(`/dashboard/chat/${chat.id}`)}
                            className="group bg-white rounded-2xl border border-slate-200 p-4 md:p-5 flex items-center gap-4 cursor-pointer hover:border-emerald-200 hover:shadow-xl hover:shadow-emerald-500/5 transition-all active:scale-[0.99]"
                        >
                            <div className="relative flex-shrink-0">
                                <div className="w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center text-2xl border border-slate-200 shadow-sm">
                                    {chat.otherUser.tipo_perfil === 'DRIVER' ? '👩🏽‍app' : '👩🏻'}
                                </div>
                                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-white rounded-full" />
                            </div>

                            <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between mb-1">
                                    <h3 className="font-bold text-slate-800 flex items-center gap-1.5 truncate">
                                        {chat.otherUser.nome}
                                        {chat.otherUser.status_verificacao === 'VERIFIED' && (
                                            <ShieldCheck className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                                        )}
                                    </h3>
                                    <span className="text-[10px] md:text-xs font-medium text-slate-400 flex items-center gap-1 flex-shrink-0">
                                        <Clock className="w-3 h-3" />
                                        {new Date(chat.updatedAt).toLocaleDateString([], { day: '2-digit', month: 'short' })}
                                    </span>
                                </div>

                                <p className="text-sm text-slate-500 truncate font-medium">
                                    {chat.lastMessage
                                        ? `${chat.lastMessage.sender_id === (session?.user as any).id ? 'Você: ' : ''}${chat.lastMessage.conteudo}`
                                        : "Inicie a conversa..."}
                                </p>
                            </div>

                            <div className="p-2 bg-slate-50 rounded-xl text-slate-400 group-hover:bg-emerald-50 group-hover:text-emerald-600 transition-colors">
                                <ArrowRight className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" />
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <div className="bg-slate-900 rounded-[2.5rem] p-8 md:p-10 relative overflow-hidden text-white shadow-2xl">
                <div className="relative z-10 max-w-md">
                    <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center mb-6 backdrop-blur-md">
                        <MessageSquare className="w-6 h-6 text-emerald-400" />
                    </div>
                    <h2 className="text-2xl font-bold mb-3 italic tracking-tight">Segurança é o nosso foco.</h2>
                    <p className="text-slate-400 text-sm leading-relaxed font-medium">
                        Sempre combine o local exato do embarque e desembarque pelo chat. Evite compartilhar dados sensíveis como senhas ou documentos fora das abas oficiais.
                    </p>
                </div>

                {/* Decorative blobs */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/20 blur-[100px] -translate-y-1/2 translate-x-1/2" />
                <div className="absolute bottom-0 left-1/3 w-32 h-32 bg-blue-500/10 blur-[60px]" />
            </div>
        </div>
    );
}
