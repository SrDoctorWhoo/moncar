"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import axios from "axios";
import { toast } from "sonner";
import {
    MapPin,
    Navigation,
    Home,
    School,
    Clock,
    CheckCircle2,
    Info,
    Plus,
    Trash2,
    Route
} from "lucide-react";
import MapRouter from "@/components/MapRouter";

export default function RoutesPage() {
    const { data: session } = useSession();
    const [routes, setRoutes] = useState<any[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [formData, setFormData] = useState({
        nome_rota: "",
        origem_lat: "", origem_lng: "",
        destino_lat: "", destino_lng: "",
        horario_ida: "07:00", horario_volta: "12:30"
    });

    const handleRouteUpdate = (lat1: string, lng1: string, lat2: string, lng2: string) => {
        setFormData(prev => ({
            ...prev,
            origem_lat: lat1,
            origem_lng: lng1,
            destino_lat: lat2,
            destino_lng: lng2
        }));
    };

    useEffect(() => {
        if (session) fetchRoutes();
    }, [session]);

    const fetchRoutes = async () => {
        setIsLoading(true);
        try {
            const res = await axios.get(`/api/routes/my-routes`);
            setRoutes(res.data);
        } catch (err) {
            toast.error("Erro ao puxar suas rotas");
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (routeId: string) => {
        if (!confirm("Tem certeza que deseja excluir esta rota?")) return;

        try {
            await axios.delete(`/api/routes/${routeId}`);
            toast.success("Rota excluída com sucesso");
            fetchRoutes();
        } catch (err) {
            toast.error("Erro ao excluir rota");
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.origem_lat || !formData.destino_lat) {
            return toast.error("Por favor, selecione os pontos no mapa primeiro.");
        }

        setIsSubmitting(true);
        try {
            await axios.post(
                `/api/routes`,
                {
                    nome_rota: formData.nome_rota,
                    origem_lat: parseFloat(formData.origem_lat),
                    origem_lng: parseFloat(formData.origem_lng),
                    destino_lat: parseFloat(formData.destino_lat),
                    destino_lng: parseFloat(formData.destino_lng),
                    horario_ida: formData.horario_ida,
                    horario_volta: formData.horario_volta
                }
            );
            toast.success("Rota cadastrada com sucesso!");
            fetchRoutes();
            setFormData({
                nome_rota: "",
                origem_lat: "", origem_lng: "",
                destino_lat: "", destino_lng: "",
                horario_ida: "07:00", horario_volta: "12:30"
            });
        } catch (err) {
            toast.error("Erro ao cadastrar rota. Verifique as coordenadas.");
        } finally {
            setIsSubmitting(false);
        }
    };

    if ((session?.user as any)?.verifiedStatus !== 'VERIFIED') {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-6">
                <div className="w-16 h-16 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mb-4 text-3xl">
                    ⚠️
                </div>
                <h2 className="text-xl font-bold text-slate-800 mb-2">Conta não verificada</h2>
                <p className="text-slate-500 max-w-sm">
                    Você precisa enviar seus documentos e ter o perfil aprovado para poder cadastrar rotas.
                </p>
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto space-y-8 pb-12">

            {/* Header */}
            <div>
                <div className="flex items-center gap-3 mb-1">
                    <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-200">
                        <MapPin className="w-5 h-5" />
                    </div>
                    <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900">Rotas Escolares</h1>
                </div>
                <p className="text-sm md:text-base text-slate-500 mt-2 max-w-2xl leading-relaxed">
                    Configure os trajetos diários da sua casa até a escola. O Momcar usará as rotas salvas para cruzar com outras mães no mesmo caminho.
                </p>
            </div>

            <div className="grid lg:grid-cols-5 gap-8">

                {/* Left Col: Map and Form */}
                <div className="lg:col-span-3 space-y-4">
                    <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-full">
                        <div className="px-5 md:px-6 pt-5 pb-4 border-b border-slate-100 flex items-center justify-between">
                            <div>
                                <h2 className="font-bold text-slate-800 text-lg flex items-center gap-2">
                                    <Route className="w-5 h-5 text-blue-500" />
                                    Cadastrar Novo Trajeto
                                </h2>
                                <p className="text-xs text-slate-500 mt-1">
                                    Clique no mapa para marcar a <strong className="text-blue-600 font-semibold">Origem</strong> e depois o <strong className="text-red-600 font-semibold">Destino</strong>.
                                </p>
                            </div>
                        </div>

                        {/* Map Area */}
                        <div className="w-full bg-slate-50 p-3 md:p-5">
                            <div className="rounded-xl overflow-hidden border border-slate-200 shadow-inner bg-slate-100 relative">
                                <MapRouter onRouteUpdate={handleRouteUpdate} />
                            </div>
                        </div>

                        {/* Route Name Input */}
                        <div className="px-5 md:px-6 pt-2">
                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-slate-600 flex items-center gap-1.5">
                                    <Route className="w-3.5 h-3.5" />
                                    Nome Amigável para a Rota
                                </label>
                                <input
                                    required
                                    type="text"
                                    placeholder="Ex: Escola da Maria - Manhã"
                                    value={formData.nome_rota}
                                    onChange={e => setFormData({ ...formData, nome_rota: e.target.value })}
                                    className="w-full bg-slate-50 border border-slate-200 px-3 py-2 text-sm rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all font-medium text-slate-700"
                                />
                            </div>
                        </div>

                        {/* Coordinate Summaries & Time input */}
                        <div className="p-5 md:p-6 flex-1 flex flex-col">

                            {/* Selected Point Badges */}
                            <div className="grid grid-cols-2 gap-3 mb-6">
                                <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-3">
                                    <div className="flex items-center gap-1.5 mb-2">
                                        <Home className="w-4 h-4 text-blue-600" />
                                        <h4 className="font-semibold text-blue-800 text-xs uppercase tracking-wider">Origem (Casa)</h4>
                                    </div>
                                    <div className="flex flex-col gap-1 text-xs">
                                        <div className="flex justify-between">
                                            <span className="text-blue-500/80">Lat</span>
                                            <span className="font-mono text-slate-700 font-medium">{formData.origem_lat ? Number(formData.origem_lat).toFixed(5) : "—"}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-blue-500/80">Lng</span>
                                            <span className="font-mono text-slate-700 font-medium">{formData.origem_lng ? Number(formData.origem_lng).toFixed(5) : "—"}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-red-50/50 border border-red-100 rounded-xl p-3">
                                    <div className="flex items-center gap-1.5 mb-2">
                                        <School className="w-4 h-4 text-red-600" />
                                        <h4 className="font-semibold text-red-800 text-xs uppercase tracking-wider">Destino (Escola)</h4>
                                    </div>
                                    <div className="flex flex-col gap-1 text-xs">
                                        <div className="flex justify-between">
                                            <span className="text-red-500/80">Lat</span>
                                            <span className="font-mono text-slate-700 font-medium">{formData.destino_lat ? Number(formData.destino_lat).toFixed(5) : "—"}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-red-500/80">Lng</span>
                                            <span className="font-mono text-slate-700 font-medium">{formData.destino_lng ? Number(formData.destino_lng).toFixed(5) : "—"}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Times */}
                            <div className="grid grid-cols-2 gap-4 mb-6">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-slate-600 flex items-center gap-1.5">
                                        <Clock className="w-3.5 h-3.5" />
                                        Horário de Ida
                                    </label>
                                    <input
                                        required
                                        type="time"
                                        value={formData.horario_ida}
                                        onChange={e => setFormData({ ...formData, horario_ida: e.target.value })}
                                        className="w-full bg-slate-50 border border-slate-200 px-3 py-2 text-sm rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all font-medium text-slate-700"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-slate-600 flex items-center gap-1.5">
                                        <Clock className="w-3.5 h-3.5" />
                                        Horário de Volta
                                    </label>
                                    <input
                                        required
                                        type="time"
                                        value={formData.horario_volta}
                                        onChange={e => setFormData({ ...formData, horario_volta: e.target.value })}
                                        className="w-full bg-slate-50 border border-slate-200 px-3 py-2 text-sm rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all font-medium text-slate-700"
                                    />
                                </div>
                            </div>

                            <div className="mt-auto">
                                <button
                                    type="submit"
                                    disabled={isSubmitting || !formData.origem_lat || !formData.destino_lat}
                                    className={`w-full py-3 rounded-xl font-bold text-sm transition-all duration-300 shadow-sm flex items-center justify-center gap-2
                                        ${(isSubmitting || !formData.origem_lat || !formData.destino_lat)
                                            ? "bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200"
                                            : "bg-blue-600 text-white hover:bg-blue-700 active:scale-[0.98] shadow-blue-200"
                                        }`}
                                >
                                    {isSubmitting ? (
                                        <>
                                            <svg className="animate-spin h-5 w-5 text-white/50" viewBox="0 0 24 24" fill="none">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                                            </svg>
                                            Salvando rota...
                                        </>
                                    ) : (
                                        <>
                                            <Plus className="w-5 h-5" />
                                            Salvar Esta Rota
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </form>
                </div>

                {/* Right Col: Saved Routes */}
                <div className="lg:col-span-2 space-y-4">
                    <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2 mb-2">
                        <Navigation className="w-5 h-5 text-indigo-500" />
                        Rotas Salvas
                    </h2>

                    {isLoading ? (
                        <div className="space-y-3">
                            {[1, 2].map(i => (
                                <div key={i} className="h-28 rounded-2xl bg-slate-100 animate-pulse border border-slate-200" />
                            ))}
                        </div>
                    ) : routes.length === 0 ? (
                        <div className="bg-white border text-center border-slate-200 rounded-2xl p-8 flex flex-col items-center justify-center border-dashed">
                            <div className="w-12 h-12 bg-slate-50 text-slate-400 rounded-full flex items-center justify-center mb-3">
                                <Navigation className="w-6 h-6" />
                            </div>
                            <p className="font-semibold text-slate-700 text-sm">Nenhuma rota ativa</p>
                            <p className="text-xs text-slate-500 mt-1">
                                Crie sua primeira rota ao lado para começar a encontrar matches.
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {routes.map((r, index) => (
                                <div key={r.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 hover:border-indigo-200 hover:shadow-md transition-all group overflow-hidden relative">
                                    {/* Number tag */}
                                    <div className="absolute -right-6 -top-6 w-16 h-16 bg-slate-50 rounded-full flex items-end justify-start p-3 text-slate-300 font-bold group-hover:bg-indigo-50 group-hover:text-indigo-200 transition-colors pointer-events-none">
                                        #{index + 1}
                                    </div>

                                    <div className="flex items-start justify-between relative z-10">
                                        <div className="flex items-center gap-2 text-sm font-semibold text-slate-800">
                                            <MapPin className="w-4 h-4 text-indigo-500" />
                                            {r.nome_rota || `Trajeto Casa ↔ Escola`}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-3 mt-4">
                                        <div className="bg-slate-50 px-3 py-2 rounded-lg border border-slate-100">
                                            <p className="text-[10px] text-slate-500 font-semibold uppercase mb-0.5">Ida</p>
                                            <p className="text-sm font-bold text-slate-700">{r.horario_ida}</p>
                                        </div>
                                        <div className="bg-slate-50 px-3 py-2 rounded-lg border border-slate-100">
                                            <p className="text-[10px] text-slate-500 font-semibold uppercase mb-0.5">Volta</p>
                                            <p className="text-sm font-bold text-slate-700">{r.horario_volta}</p>
                                        </div>
                                    </div>

                                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                                        <div className="flex items-center gap-1.5 text-xs font-medium text-emerald-600">
                                            <CheckCircle2 className="w-4 h-4" />
                                            Rota Processada
                                        </div>
                                        <button
                                            onClick={() => handleDelete(r.id)}
                                            className="text-slate-400 hover:text-red-500 transition-colors p-1.5 hover:bg-red-50 rounded-lg"
                                            title="Excluir rota"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Information block */}
                    <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4 flex gap-3 text-indigo-800 items-start">
                        <Info className="w-5 h-5 flex-shrink-0 mt-0.5 text-indigo-500" />
                        <div className="text-xs leading-relaxed">
                            <strong className="block mb-0.5 font-semibold text-sm">Privacidade em 1º Lugar</strong>
                            Seus pontos exatos nunca são revelados para desconhecidos. Apenas as cruzes aproximadas (Matches) são geradas pelo nosso algoritmo seguro.
                        </div>
                    </div>
                </div>
            </div>

        </div>
    );
}
