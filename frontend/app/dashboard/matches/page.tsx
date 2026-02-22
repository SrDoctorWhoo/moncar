"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import axios from "axios";
import { toast } from "sonner";
import {
    Search,
    MapPin,
    Users,
    ShieldCheck,
    MessageSquare,
    Clock,
    ArrowRight,
    Star,
    Navigation,
    Route as RouteIcon,
    AlertCircle,
    Info
} from "lucide-react";
import { useRouter } from "next/navigation";

export default function MatchesPage() {
    const { data: session } = useSession();
    const [routes, setRoutes] = useState<any[]>([]);
    const [selectedRoute, setSelectedRoute] = useState<string>("");
    const [matches, setMatches] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isFetchingRoutes, setIsFetchingRoutes] = useState(true);

    const router = useRouter();

    useEffect(() => {
        if (session) fetchMyRoutes();
    }, [session]);

    const fetchMyRoutes = async () => {
        setIsFetchingRoutes(true);
        try {
            const res = await axios.get(`/api/routes/my-routes`);
            setRoutes(res.data);
            if (res.data.length > 0) {
                const firstRouteId = res.data[0].id;
                setSelectedRoute(firstRouteId);
                fetchMatches(firstRouteId);
            }
        } catch (err) {
            toast.error("Erro ao carregar suas rotas");
        } finally {
            setIsFetchingRoutes(false);
        }
    };

    const fetchMatches = async (routeId: string) => {
        if (!routeId) return;
        setIsLoading(true);
        try {
            const res = await axios.get(`/api/matches/route/${routeId}`);
            setMatches(res.data);
        } catch (err) {
            toast.error("Você precisa estar com o perfil VERIFICADO para buscar matches.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleRouteSelect = (routeId: string) => {
        setSelectedRoute(routeId);
        fetchMatches(routeId);
    }

    const handleStartChat = async (driverId: string, score: number) => {
        try {
            const res = await axios.post('/api/matches', { driverId, score });
            router.push(`/dashboard/chat/${res.data.id}`);
        } catch (error) {
            toast.error("Erro ao iniciar chat");
        }
    };

    if ((session?.user as any)?.role !== 'PASSENGER') {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-6">
                <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-4">
                    <Navigation className="w-8 h-8" />
                </div>
                <h2 className="text-xl font-bold text-slate-800 mb-2">Visão Direcionada</h2>
                <p className="text-slate-500 max-w-sm">
                    Como Mãetorista, seus matches aparecem conforme as passageiras solicitam. A busca ativa é reservada para Passageiras.
                </p>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto space-y-8 pb-12">

            {/* Header section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <div className="flex items-center gap-3 mb-1">
                        <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-lg shadow-emerald-200">
                            <Users className="w-5 h-5" />
                        </div>
                        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900">Encontrar Matches</h1>
                    </div>
                    <p className="text-sm md:text-base text-slate-500 mt-2 max-w-xl leading-relaxed">
                        Nosso algoritmo inteligente cruza suas rotas com Mães que fazem o mesmo trajeto.
                    </p>
                </div>
            </div>

            {/* Selection Area */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 overflow-hidden relative">
                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50 rounded-full -mr-16 -mt-16 opacity-50 pulse pointer-events-none" />

                <div className="relative z-10 space-y-4">
                    <div className="flex items-center gap-2 text-slate-800 font-semibold text-sm">
                        <RouteIcon className="w-4 h-4 text-emerald-600" />
                        Escolha um trajeto para buscar parceiras:
                    </div>

                    <div className="flex flex-wrap gap-2">
                        {isFetchingRoutes ? (
                            [1, 2].map(i => <div key={i} className="h-10 w-32 bg-slate-100 rounded-full animate-pulse" />)
                        ) : routes.length === 0 ? (
                            <div className="flex items-center gap-2 text-red-500 bg-red-50 px-4 py-2 rounded-xl border border-red-100/50 text-sm">
                                <AlertCircle className="w-4 h-4" />
                                Nenhuma rota cadastrada. Digite suas rotas primeiro.
                            </div>
                        ) : (
                            routes.map(r => (
                                <button
                                    key={r.id}
                                    onClick={() => handleRouteSelect(r.id)}
                                    className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all flex items-center gap-2 border
                                        ${selectedRoute === r.id
                                            ? "bg-slate-900 text-white border-slate-900 shadow-md shadow-slate-200"
                                            : "bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:bg-slate-50"}`}
                                >
                                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                                    {r.nome_rota || `Rota ${r.horario_ida}`}
                                </button>
                            ))
                        )}
                    </div>
                </div>
            </div>

            {/* Results Section */}
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                        <Search className="w-4 h-4 text-slate-400" />
                        Mãetoristas Compatíveis
                        {!isLoading && matches.length > 0 && (
                            <span className="bg-emerald-100 text-emerald-700 text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ml-1">
                                {matches.length} Encontradas
                            </span>
                        )}
                    </h2>
                </div>

                {isLoading ? (
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="h-72 bg-slate-100 rounded-3xl animate-pulse border border-slate-200" />
                        ))}
                    </div>
                ) : matches.length === 0 ? (
                    <div className="bg-white border text-center border-slate-200 rounded-3xl p-12 flex flex-col items-center justify-center border-dashed">
                        <div className="w-20 h-20 bg-emerald-50 text-emerald-400 rounded-full flex items-center justify-center mb-4">
                            <Users className="w-10 h-10" />
                        </div>
                        <h3 className="font-bold text-slate-800 text-lg">Nenhum match por enquanto</h3>
                        <p className="text-sm text-slate-500 mt-2 max-w-sm">
                            Ainda não encontramos Mãetoristas compatíveis com os horários (+/- 30 min) e proximidade (5km).
                            Avise outras mães para entrarem no Momcar!
                        </p>
                    </div>
                ) : (
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {matches.map((match, idx) => (
                            <div key={idx} className="bg-white rounded-[2rem] border border-slate-200 shadow-sm hover:shadow-xl hover:border-emerald-200 transition-all duration-300 group flex flex-col overflow-hidden relative">

                                {/* Badge de destaque */}
                                {idx === 0 && (
                                    <div className="absolute top-4 right-4 z-10">
                                        <div className="bg-emerald-500 text-white text-[10px] font-bold px-3 py-1 rounded-full flex items-center gap-1 shadow-sm">
                                            <Star className="w-3 h-3 fill-current" />
                                            MELHOR OPÇÃO
                                        </div>
                                    </div>
                                )}

                                <div className="p-6 pb-2">
                                    <div className="flex items-center gap-4">
                                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-50 to-emerald-50 flex items-center justify-center text-2xl border border-white shadow-sm ring-4 ring-slate-50/50">
                                            👩🏽
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">{match.driver.nome}</h3>
                                            <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full mt-1 w-fit">
                                                <ShieldCheck className="w-3 h-3" />
                                                IDENTIDADE VERIFICADA
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="p-6 space-y-4">
                                    {/* Location comparison */}
                                    <div className="space-y-3 bg-slate-50/80 p-4 rounded-2xl">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2 text-xs text-slate-500 font-medium tracking-tight">
                                                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                                                Distância da Casa
                                            </div>
                                            <span className="text-xs font-bold text-slate-700">{match.originDistanceKm} km</span>
                                        </div>
                                        <div className="w-full bg-slate-200 h-1 rounded-full overflow-hidden">
                                            <div
                                                className="bg-emerald-400 h-full rounded-full"
                                                style={{ width: `${Math.max(10, 100 - (Number(match.originDistanceKm) * 15))}%` }}
                                            />
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2 text-xs text-slate-500 font-medium tracking-tight">
                                                <Navigation className="w-3.5 h-3.5 text-slate-400" />
                                                Distância da Escola
                                            </div>
                                            <span className="text-xs font-bold text-slate-700">{match.destDistanceKm} km</span>
                                        </div>
                                    </div>

                                    {/* Time comparison */}
                                    <div className="flex items-center gap-3">
                                        <div className="flex-1 bg-indigo-50/50 rounded-2xl p-3 border border-indigo-100/30">
                                            <div className="flex items-center gap-1.5 text-indigo-700 mb-1">
                                                <Clock className="w-3.5 h-3.5" />
                                                <span className="text-[10px] font-bold uppercase tracking-wider">Diferença Ida</span>
                                            </div>
                                            <p className="text-sm font-extrabold text-indigo-900">{match.idaDifferenceMins} <span className="text-[10px] font-medium opacity-70">min</span></p>
                                        </div>
                                        <div className="flex-1 bg-indigo-50/50 rounded-2xl p-3 border border-indigo-100/30">
                                            <div className="flex items-center gap-1.5 text-indigo-700 mb-1">
                                                <Clock className="w-3.5 h-3.5" />
                                                <span className="text-[10px] font-bold uppercase tracking-wider">Diferença Volta</span>
                                            </div>
                                            <p className="text-sm font-extrabold text-indigo-900">{match.voltaDifferenceMins} <span className="text-[10px] font-medium opacity-70">min</span></p>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-auto p-6 pt-0">
                                    <button
                                        onClick={() => handleStartChat(match.driver.id, match.score_proximidade)}
                                        className="w-full group/btn relative overflow-hidden bg-emerald-600 text-white py-3.5 rounded-2xl font-bold text-sm shadow-md shadow-emerald-200 hover:bg-emerald-700 hover:shadow-lg active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                                    >
                                        <MessageSquare className="w-4 h-4" />
                                        Conversar com esta Mãe
                                        <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Footer Tip */}
                <div className="bg-slate-900 text-white rounded-3xl p-8 flex flex-col md:flex-row items-center gap-6 overflow-hidden relative">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32 blur-3xl pointer-events-none" />
                    <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center flex-shrink-0">
                        <Info className="w-8 h-8 text-emerald-400" />
                    </div>
                    <div className="space-y-1 text-center md:text-left">
                        <h4 className="font-bold text-lg">Como funcionam os Matches?</h4>
                        <p className="text-slate-400 text-sm max-w-2xl">
                            Usamos inteligência geográfica para encontrar rotas em um raio de 5km da sua casa e escola,
                            e inteligência temporal com margem de 30 minutos na ida e na volta.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
