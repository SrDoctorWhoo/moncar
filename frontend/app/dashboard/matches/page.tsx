"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import axios from "axios";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";

export default function MatchesPage() {
    const { data: session } = useSession();
    const [routes, setRoutes] = useState<any[]>([]);
    const [selectedRoute, setSelectedRoute] = useState<string>("");
    const [matches, setMatches] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (session) fetchMyRoutes();
    }, [session]);

    const fetchMyRoutes = async () => {
        try {
            const res = await axios.get(`/api/routes/my-routes`);
            setRoutes(res.data);
            if (res.data.length > 0) {
                setSelectedRoute(res.data[0].id);
                fetchMatches(res.data[0].id);
            }
        } catch (err) {
            toast.error("Erro ao puxar suas rotas");
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

    const router = useRouter();

    const handleRouteSelect = (val: string) => {
        setSelectedRoute(val);
        fetchMatches(val);
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
        return <div className="p-8 text-center text-orange-600 font-bold">Apenas contas do tipo PASSAGEIRA podem buscar ativamente Mãetoristas.</div>;
    }

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-green-600">Encontrar Caronas</h1>
                <p className="text-slate-600">Cruze suas rotas com Mães que dirigem pela região.</p>
            </div>

            <Card className="bg-slate-50 border-none shadow-sm">
                <CardContent className="p-6">
                    <div className="space-y-2 max-w-sm">
                        <Label>Selecione a sua rota cadastrada:</Label>
                        <Select value={selectedRoute} onValueChange={handleRouteSelect}>
                            <SelectTrigger className="bg-white">
                                <SelectValue placeholder="Selecione uma rota..." />
                            </SelectTrigger>
                            <SelectContent>
                                {routes.map(r => (
                                    <SelectItem key={r.id} value={r.id}>
                                        Trajeto (Ida {r.horario_ida} / Volta {r.horario_volta})
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {routes.length === 0 && (
                            <p className="text-xs text-red-500 mt-2">Você precisa cadastrar uma rota primeiro!</p>
                        )}
                    </div>
                </CardContent>
            </Card>

            <section>
                <h2 className="text-xl font-semibold mb-4">Mãetoristas Próximas ({matches.length})</h2>

                {isLoading ? (
                    <p className="text-slate-500">Buscando na sua região...</p>
                ) : matches.length === 0 ? (
                    <p className="text-slate-500 p-8 border border-dashed rounded-lg text-center">
                        Não encontramos Mãetoristas compatíveis com os horários (+/- 30 min) e distância (5km) da sua rota no momento.
                    </p>
                ) : (
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {matches.map((match, idx) => (
                            <Card key={idx} className="border-green-100 relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-2 text-xs font-bold text-green-700 bg-green-100 rounded-bl-lg border-b border-l border-green-200">
                                    {idx === 0 ? '✨ Melhor Match' : `Compatibilidade #${idx + 1}`}
                                </div>
                                <CardHeader>
                                    <CardTitle className="text-lg flex items-center gap-2">
                                        👩🏻 {match.driver.nome}
                                    </CardTitle>
                                    <CardDescription>
                                        <span className="text-green-600 font-medium tracking-tight bg-green-50 px-2 py-0.5 rounded-full inline-flex items-center gap-1 mt-1">
                                            ✓ Identidade Verificada
                                        </span>
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4 text-sm">

                                    <div className="space-y-2 bg-slate-50 p-3 rounded-md">
                                        <p className="font-semibold text-slate-700 mb-2">Comparações de Distância:</p>
                                        <div className="flex justify-between items-center text-slate-600 border-b pb-2">
                                            <span>Proximidade das Casas:</span>
                                            <strong className={Number(match.originDistanceKm) < 2 ? 'text-green-600' : ''}>
                                                {match.originDistanceKm} km
                                            </strong>
                                        </div>
                                        <div className="flex justify-between items-center text-slate-600 pt-1">
                                            <span>Proximidade das Escolas:</span>
                                            <strong className={Number(match.destDistanceKm) < 2 ? 'text-green-600' : ''}>
                                                {match.destDistanceKm} km
                                            </strong>
                                        </div>
                                    </div>

                                    <div className="space-y-2 bg-slate-50 p-3 rounded-md">
                                        <p className="font-semibold text-slate-700 mb-2">Diferença de Horários:</p>
                                        <div className="flex justify-between items-center text-slate-600 border-b pb-2">
                                            <span>Horário de Ida:</span>
                                            <strong>{match.idaDifferenceMins} mins</strong>
                                        </div>
                                        <div className="flex justify-between items-center text-slate-600 pt-1">
                                            <span>Horário de Volta:</span>
                                            <strong>{match.voltaDifferenceMins} mins</strong>
                                        </div>
                                    </div>

                                    <Button
                                        onClick={() => handleStartChat(match.driver.id, match.score_proximidade)}
                                        className="w-full bg-green-600 hover:bg-green-700"
                                    >
                                        💬 Iniciar Conversa
                                    </Button>

                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </section>
        </div>
    );
}
