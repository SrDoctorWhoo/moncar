"use client";

import { useState, useEffect, useRef } from "react";
import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import axios from "axios";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function ChatPage() {
    const { matchId } = useParams();
    const { data: session } = useSession();
    const [messages, setMessages] = useState<any[]>([]);
    const [newMessage, setNewMessage] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (session && matchId) {
            fetchMessages();
            const interval = setInterval(fetchMessages, 3000); // Polling every 3s
            return () => clearInterval(interval);
        }
    }, [session, matchId]);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const fetchMessages = async () => {
        try {
            const res = await axios.get(`/api/matches/${matchId}/chat`);
            setMessages(res.data);
        } catch (err) {
            console.error("Chat fetch error");
        } finally {
            setIsLoading(false);
        }
    };

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim()) return;

        try {
            const res = await axios.post(`/api/matches/${matchId}/chat`, {
                conteudo: newMessage
            });
            setMessages([...messages, res.data]);
            setNewMessage("");
        } catch (err) {
            toast.error("Erro ao enviar mensagem");
        }
    };

    if (isLoading) return <div className="p-8 text-center">Carregando conversa...</div>;

    const myId = (session?.user as any).id;

    return (
        <div className="h-[calc(100vh-12rem)] flex flex-col max-w-4xl mx-auto">
            <Card className="flex-1 flex flex-col overflow-hidden border-none shadow-lg">
                <CardHeader className="border-b bg-white z-10">
                    <CardTitle className="text-xl flex items-center gap-2">
                        💬 Chat da Carona
                    </CardTitle>
                </CardHeader>

                <CardContent className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50" ref={scrollRef}>
                    {messages.length === 0 && (
                        <div className="text-center text-slate-400 py-20">
                            Comece a conversa! Pergunte sobre os horários ou o ponto de encontro.
                        </div>
                    )}
                    {messages.map((m) => {
                        const isMe = m.sender_id === myId;
                        return (
                            <div key={m.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                <div className={`flex gap-2 max-w-[80%] ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                                    <Avatar className="w-8 h-8 border">
                                        <AvatarImage src={m.sender.imagem_url} />
                                        <AvatarFallback className="bg-purple-100 text-purple-700 text-xs">
                                            {m.sender.nome.charAt(0)}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className={`p-3 rounded-2xl text-sm ${isMe
                                            ? 'bg-purple-600 text-white rounded-tr-none'
                                            : 'bg-white border text-slate-700 rounded-tl-none border-slate-200 shadow-sm'
                                        }`}>
                                        <p className="font-bold text-[10px] mb-1 opacity-70">
                                            {isMe ? 'Você' : m.sender.nome}
                                        </p>
                                        {m.conteudo}
                                        <p className={`text-[9px] mt-1 text-right opacity-60`}>
                                            {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </CardContent>

                <div className="p-4 border-t bg-white">
                    <form onSubmit={handleSendMessage} className="flex gap-2">
                        <Input
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            placeholder="Escreva sua mensagem..."
                            className="flex-1"
                        />
                        <Button type="submit" className="bg-purple-600 hover:bg-purple-700">
                            Enviar
                        </Button>
                    </form>
                </div>
            </Card>
        </div>
    );
}
