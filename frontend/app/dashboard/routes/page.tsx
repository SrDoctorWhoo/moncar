"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import axios from "axios";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import MapRouter from "@/components/MapRouter";

export default function RoutesPage() {
    const { data: session } = useSession();
    const [routes, setRoutes] = useState<any[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState({
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
        try {
            const res = await axios.get(`/api/routes/my-routes`);
            setRoutes(res.data);
        } catch (err) {
            toast.error("Erro ao puxar suas rotas");
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            await axios.post(
                `/api/routes`,
                {
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
        return <div className="p-8 text-center text-orange-600 font-bold">Você precisa ter o perfil Verificado para cadastrar rotas.</div>;
    }

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-blue-600">Minhas Rotas</h1>
                <p className="text-slate-600">Cadastre seus trajetos escolares casa-escola (Latitudes e Longitudes).</p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Nova Rota</CardTitle>
                    <CardDescription>
                        Insira as coordenadas decimais exatas (ex: -23.5505, -46.6333) e seus horários.
                    </CardDescription>
                </CardHeader>
                <CardContent>


                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid md:grid-cols-2 gap-6">

                            {/* Map Selector */}
                            <div className="space-y-4">
                                <MapRouter onRouteUpdate={handleRouteUpdate} />
                            </div>

                            {/* Coordinates Form */}
                            <div className="space-y-4">
                                <div className="p-3 bg-blue-50 border border-blue-100 rounded-md space-y-3">
                                    <h4 className="font-semibold text-blue-800 text-sm">🏠 Origem (Casa)</h4>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="space-y-1">
                                            <Label className="text-xs">Latitude</Label>
                                            <Input required type="number" step="any" value={formData.origem_lat} onChange={e => setFormData({ ...formData, origem_lat: e.target.value })} placeholder="-23.5505" className="text-sm bg-white" />
                                        </div>
                                        <div className="space-y-1">
                                            <Label className="text-xs">Longitude</Label>
                                            <Input required type="number" step="any" value={formData.origem_lng} onChange={e => setFormData({ ...formData, origem_lng: e.target.value })} placeholder="-46.6333" className="text-sm bg-white" />
                                        </div>
                                    </div>
                                </div>

                                <div className="p-3 bg-red-50 border border-red-100 rounded-md space-y-3">
                                    <h4 className="font-semibold text-red-800 text-sm">🏫 Destino (Escola)</h4>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="space-y-1">
                                            <Label className="text-xs">Latitude</Label>
                                            <Input required type="number" step="any" value={formData.destino_lat} onChange={e => setFormData({ ...formData, destino_lat: e.target.value })} placeholder="-23.5616" className="text-sm bg-white" />
                                        </div>
                                        <div className="space-y-1">
                                            <Label className="text-xs">Longitude</Label>
                                            <Input required type="number" step="any" value={formData.destino_lng} onChange={e => setFormData({ ...formData, destino_lng: e.target.value })} placeholder="-46.6559" className="text-sm bg-white" />
                                        </div>
                                    </div>
                                </div>

                                <div className="p-3 bg-slate-50 border rounded-md space-y-3">
                                    <h4 className="font-semibold text-slate-800 text-sm">⏰ Horários</h4>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="space-y-1">
                                            <Label className="text-xs">Ida</Label>
                                            <Input required type="time" value={formData.horario_ida} onChange={e => setFormData({ ...formData, horario_ida: e.target.value })} className="text-sm bg-white" />
                                        </div>
                                        <div className="space-y-1">
                                            <Label className="text-xs">Volta</Label>
                                            <Input required type="time" value={formData.horario_volta} onChange={e => setFormData({ ...formData, horario_volta: e.target.value })} className="text-sm bg-white" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700" disabled={isSubmitting}>
                            {isSubmitting ? "Cadastrando..." : "Salvar Rota"}
                        </Button>
                    </form>
                </CardContent>
            </Card>

            <section>
                <h2 className="text-xl font-semibold mb-4">Rotas Cadastradas</h2>
                {routes.length === 0 ? (
                    <p className="text-sm text-slate-500">Nenhuma rota cadastrada.</p>
                ) : (
                    <div className="grid gap-4 md:grid-cols-2">
                        {routes.map(r => (
                            <Card key={r.id}>
                                <CardHeader>
                                    <CardTitle className="text-lg">Trajeto Escolar</CardTitle>
                                    <CardDescription>
                                        Ida: {r.horario_ida} | Volta: {r.horario_volta}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="text-sm space-y-2">
                                    <div className="p-3 bg-slate-50 rounded border">
                                        <span className="font-semibold block">Origem:</span>
                                        {r.origem_lat}, {r.origem_lng}
                                    </div>
                                    <div className="p-3 bg-slate-50 rounded border">
                                        <span className="font-semibold block">Destino:</span>
                                        {r.destino_lat}, {r.destino_lng}
                                    </div>
                                    {r.polyline && (
                                        <div className="text-xs text-green-600 mt-2">✓ Caminho Mapbox Gerado</div>
                                    )}
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </section>
        </div>
    );
}
