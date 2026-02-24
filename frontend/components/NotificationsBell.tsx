"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { FaBell, FaCheck, FaXmark } from "react-icons/fa6";

export default function NotificationsBell() {
    const [notifications, setNotifications] = useState<any[]>([]);
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        fetchNotifications();
        const interval = setInterval(fetchNotifications, 10000); // Check every 10s
        return () => clearInterval(interval);
    }, []);

    const fetchNotifications = async () => {
        try {
            const res = await axios.get("/api/notifications");
            setNotifications(res.data);
        } catch (error) {
            console.error("Notif fetch error");
        }
    };

    const markAllAsRead = async () => {
        try {
            await axios.patch("/api/notifications", {});
            fetchNotifications();
        } catch (error) {
            console.error("Notif mark error");
        }
    };

    const unreadCount = notifications.filter(n => !n.lida).length;

    return (
        <div className="relative">
            <Button
                variant="ghost"
                size="sm"
                className="relative p-2 hover:bg-secondary/10 text-secondary transition-colors rounded-full h-10 w-10"
                onClick={() => {
                    setIsOpen(!isOpen);
                    if (!isOpen && unreadCount > 0) markAllAsRead();
                }}
            >
                <FaBell className="w-5 h-5" />
                {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 bg-destructive text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center border-2 border-white font-bold">
                        {unreadCount}
                    </span>
                )}
            </Button>

            {isOpen && (
                <div className="absolute -right-2 sm:right-0 mt-3 w-[calc(100vw-2rem)] sm:w-80 max-w-[360px] bg-white border border-foreground/5 rounded-2xl shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200 origin-top-right">
                    <div className="p-4 border-b border-foreground/5 flex justify-between items-center bg-slate-50">
                        <span className="font-bold text-sm text-secondary flex items-center gap-2">
                            <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center">
                                <FaBell className="text-primary w-3.5 h-3.5" />
                            </div>
                            Notificações
                        </span>
                        <button onClick={() => setIsOpen(false)} className="text-secondary/50 hover:text-secondary bg-secondary/5 hover:bg-secondary/10 w-7 h-7 flex items-center justify-center rounded-full transition-colors">
                            <FaXmark className="w-3.5 h-3.5" />
                        </button>
                    </div>

                    <div className="max-h-[60vh] sm:max-h-80 overflow-y-auto custom-scrollbar">
                        {notifications.length === 0 ? (
                            <div className="p-8 text-center flex flex-col items-center justify-center space-y-3">
                                <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center text-xl">📭</div>
                                <p className="text-slate-500 text-sm font-medium">Você está em dia!</p>
                            </div>
                        ) : (
                            notifications.map(n => (
                                <Link
                                    key={n.id}
                                    href={n.link || "#"}
                                    onClick={() => setIsOpen(false)}
                                    className={`block p-4 border-b border-slate-50 last:border-0 hover:bg-slate-50 transition-colors ${!n.lida ? 'bg-blue-50/40 relative' : ''}`}
                                >
                                    {!n.lida && <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500 rounded-r"></div>}
                                    <div className="flex justify-between items-start gap-2">
                                        <p className="text-sm font-bold text-slate-800 leading-tight pr-4">{n.titulo}</p>
                                        <span className="text-[10px] text-slate-400 font-medium shrink-0 whitespace-nowrap">
                                            {new Date(n.createdAt).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
                                        </span>
                                    </div>
                                    <p className="text-xs text-slate-600 mt-1.5 leading-relaxed line-clamp-2">{n.mensagem}</p>
                                </Link>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
