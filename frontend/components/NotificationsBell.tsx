"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import Link from "next/link";

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
                className="relative p-2"
                onClick={() => {
                    setIsOpen(!isOpen);
                    if (!isOpen && unreadCount > 0) markAllAsRead();
                }}
            >
                🔔
                {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 bg-red-500 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center">
                        {unreadCount}
                    </span>
                )}
            </Button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white border border-slate-200 rounded-lg shadow-xl z-50">
                    <div className="p-3 border-b flex justify-between items-center">
                        <span className="font-bold text-sm text-slate-800">Notificações</span>
                        <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-slate-600">×</button>
                    </div>
                    <div className="max-h-64 overflow-y-auto">
                        {notifications.length === 0 ? (
                            <div className="p-4 text-center text-slate-400 text-sm">Nenhuma notificação por enquanto.</div>
                        ) : (
                            notifications.map(n => (
                                <Link
                                    key={n.id}
                                    href={n.link || "#"}
                                    onClick={() => setIsOpen(false)}
                                    className={`block p-3 border-b last:border-0 hover:bg-slate-50 transition-colors ${!n.lida ? 'bg-blue-50/50' : ''}`}
                                >
                                    <p className="text-sm font-semibold text-slate-900">{n.titulo}</p>
                                    <p className="text-xs text-slate-600 mt-1">{n.mensagem}</p>
                                    <p className="text-[10px] text-slate-400 mt-1">
                                        {new Date(n.createdAt).toLocaleString('pt-BR')}
                                    </p>
                                </Link>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
