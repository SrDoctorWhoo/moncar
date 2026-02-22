"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import axios from "axios";
import { toast } from "sonner";
import {
    Send,
    ArrowLeft,
    MoreHorizontal,
    ShieldCheck,
    Clock,
    Smile,
    Image as ImageIcon
} from "lucide-react";

export default function ChatPage() {
    const { matchId } = useParams();
    const router = useRouter();
    const { data: session } = useSession();
    const [messages, setMessages] = useState<any[]>([]);
    const [matchInfo, setMatchInfo] = useState<any>(null);
    const [newMessage, setNewMessage] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [isSending, setIsSending] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (session && matchId) {
            fetchMatchInfo();
            fetchMessages();
            const interval = setInterval(fetchMessages, 4000); // Polling every 4s
            return () => clearInterval(interval);
        }
    }, [session, matchId]);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTo({
                top: scrollRef.current.scrollHeight,
                behavior: 'smooth'
            });
        }
    }, [messages]);

    const fetchMatchInfo = async () => {
        try {
            const res = await axios.get(`/api/matches/${matchId}`);
            setMatchInfo(res.data);
        } catch (err) {
            console.error("Match info error");
        }
    };

    const fetchMessages = async () => {
        try {
            const res = await axios.get(`/api/matches/${matchId}/chat`);
            // Only update if length changed or new content
            if (JSON.stringify(res.data) !== JSON.stringify(messages)) {
                setMessages(res.data);
            }
        } catch (err) {
            console.error("Chat fetch error");
        } finally {
            setIsLoading(false);
        }
    };

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || isSending) return;

        setIsSending(true);
        try {
            const res = await axios.post(`/api/matches/${matchId}/chat`, {
                conteudo: newMessage
            });
            setMessages(prev => [...prev, res.data]);
            setNewMessage("");
        } catch (err) {
            toast.error("Erro ao enviar mensagem");
        } finally {
            setIsSending(false);
        }
    };

    if (isLoading && !matchInfo) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh]">
                <div className="w-12 h-12 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin mb-4" />
                <p className="text-slate-500 font-medium">Abrindo sua conversa segura...</p>
            </div>
        );
    }

    const myId = (session?.user as any).id;
    const otherUser = matchInfo?.otherUser;

    return (
        <div className="flex flex-col h-[calc(100vh-8rem)] max-w-5xl mx-auto bg-white rounded-[2.5rem] border border-slate-200 shadow-2xl shadow-slate-200/50 overflow-hidden relative">

            {/* Chat Header */}
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-white/80 backdrop-blur-md z-20">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => router.back()}
                        className="p-2 hover:bg-slate-100 rounded-xl transition-colors text-slate-400 hover:text-slate-600"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>

                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50 flex items-center justify-center text-xl border border-white shadow-sm ring-2 ring-slate-50">
                                {otherUser?.tipo_perfil === 'DRIVER' ? '👩🏽‍app' : '👩🏻'}
                            </div>
                            <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-emerald-500 border-2 border-white rounded-full shadow-sm" />
                        </div>
                        <div>
                            <h3 className="font-bold text-slate-800 flex items-center gap-1.5">
                                {otherUser?.nome || "Mãe Momcar"}
                                {otherUser?.status_verificacao === 'VERIFIED' && (
                                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                                )}
                            </h3>
                            <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest bg-emerald-50 px-2 py-0.5 rounded-full w-fit">
                                ONLINE AGORA
                            </p>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <button className="p-2.5 hover:bg-slate-100 rounded-xl transition-colors text-slate-400">
                        <MoreHorizontal className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* Messages Area */}
            <div
                className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/30 scrollbar-hide"
                ref={scrollRef}
                style={{ backgroundImage: 'radial-gradient(#e2e8f0 1px, transparent 1px)', backgroundSize: '30px 30px' }}
            >
                {messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center space-y-4 px-8">
                        <div className="w-20 h-20 bg-emerald-50 text-emerald-400 rounded-[2rem] flex items-center justify-center opacity-60">
                            <Clock className="w-10 h-10" />
                        </div>
                        <div>
                            <h4 className="font-bold text-slate-800">Dê o primeiro passo!</h4>
                            <p className="text-sm text-slate-500 mt-1 max-w-xs">
                                Combine detalhes sobre o ponto de encontro ou tire dúvidas sobre a cadeirinha.
                            </p>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <div className="flex justify-center mb-8">
                            <span className="bg-white border border-slate-200 px-4 py-1 rounded-full text-[10px] font-bold text-slate-400 uppercase tracking-widest shadow-sm">
                                Chat Protegido por Criptografia
                            </span>
                        </div>

                        {messages.map((m, idx) => {
                            const isMe = m.sender_id === myId;
                            const showAvatar = idx === 0 || messages[idx - 1].sender_id !== m.sender_id;

                            return (
                                <div key={m.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}>
                                    <div className={`flex gap-3 max-w-[80%] ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                                        <div className={`w-8 h-8 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-xs shadow-sm flex-shrink-0
                                            ${showAvatar ? 'visible' : 'invisible'}`}>
                                            {isMe ? '👤' : '👩🏽'}
                                        </div>
                                        <div className={`group relative`}>
                                            <div className={`px-4 py-3 rounded-2xl text-sm shadow-sm transition-all
                                                ${isMe
                                                    ? 'bg-slate-900 text-white rounded-tr-none'
                                                    : 'bg-white border text-slate-700 rounded-tl-none border-slate-200'
                                                }`}>
                                                {m.conteudo}
                                                <div className={`flex items-center gap-1 mt-1 justify-end opacity-40 text-[9px] font-medium`}>
                                                    {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    {isMe && <div className="w-1 h-1 bg-emerald-400 rounded-full" />}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Input Area */}
            <div className="p-6 bg-white border-t border-slate-100">
                <form
                    onSubmit={handleSendMessage}
                    className="flex items-center gap-3 bg-slate-50 rounded-2xl p-2 pl-4 border border-slate-200 focus-within:border-emerald-500 focus-within:ring-4 focus-within:ring-emerald-50 transition-all"
                >
                    <button type="button" className="text-slate-400 hover:text-emerald-600 transition-colors p-1">
                        <ImageIcon className="w-5 h-5" />
                    </button>
                    <button type="button" className="text-slate-400 hover:text-emerald-600 transition-colors p-1 mr-1">
                        <Smile className="w-5 h-5" />
                    </button>

                    <input
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Escreva sua mensagem aqui..."
                        className="flex-1 bg-transparent border-none focus:ring-0 text-sm font-medium text-slate-700 placeholder:text-slate-400 h-10"
                    />

                    <button
                        type="submit"
                        disabled={!newMessage.trim() || isSending}
                        className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all
                            ${newMessage.trim()
                                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-200 hover:scale-105 active:scale-95'
                                : 'bg-slate-200 text-slate-400 cursor-not-allowed'}`}
                    >
                        <Send className={`w-5 h-5 ${isSending ? 'animate-pulse' : ''}`} />
                    </button>
                </form>
                <p className="text-[10px] text-center text-slate-400 mt-3 font-medium">
                    As mensagens neste chat são monitoradas para garantir a segurança da comunidade Momcar.
                </p>
            </div>

            {/* Float Decorator */}
            <div className="absolute top-1/2 left-0 w-1 h-20 bg-emerald-500 rounded-r-full -translate-y-1/2 opacity-20" />
        </div>
    );
}
