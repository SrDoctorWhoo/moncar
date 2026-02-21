"use client";

import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-routing-machine/dist/leaflet-routing-machine.css";
import "leaflet-routing-machine";

interface MapRouterProps {
    onRouteUpdate: (
        origemLat: string,
        origemLng: string,
        destinoLat: string,
        destinoLng: string,
        distanceStr?: string,
        durationStr?: string
    ) => void;
}

export default function MapRouter({ onRouteUpdate }: MapRouterProps) {
    const mapRef = useRef<HTMLDivElement>(null);
    const mapInstance = useRef<L.Map | null>(null);
    const routingControl = useRef<any>(null);
    const [mode, setMode] = useState<"start" | "end">("start");

    // Fallback: Goiânia
    const defaultLocation = { lat: -16.6869, lng: -49.2648, zoom: 13 };

    const startPoint = useRef<{ lat: number, lng: number } | null>(null);
    const endPoint = useRef<{ lat: number, lng: number } | null>(null);
    const startMarker = useRef<L.Marker | null>(null);
    const endMarker = useRef<L.Marker | null>(null);
    const [statusMsg, setStatusMsg] = useState("Clique no mapa para definir a ORIGEM");

    useEffect(() => {
        if (typeof window === "undefined" || !mapRef.current || mapInstance.current) return;

        // Fix default icons for leaflet in Webpack/Nextjs
        const DefaultIcon = L.Icon.Default as any;
        delete DefaultIcon.prototype._getIconUrl;
        L.Icon.Default.mergeOptions({
            iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
            iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
            shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png'
        });

        const map = L.map(mapRef.current).setView([defaultLocation.lat, defaultLocation.lng], defaultLocation.zoom);
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
            maxZoom: 19, attribution: "&copy; OpenStreetMap"
        }).addTo(map);

        mapInstance.current = map;

        const routing = (L.Routing as any).control({
            waypoints: [],
            addWaypoints: false,
            draggableWaypoints: true,
            routeWhileDragging: true,
            router: (L.Routing as any).osrmv1({ serviceUrl: "https://router.project-osrm.org/route/v1" }),
            show: true
        }).addTo(map);

        routingControl.current = routing;

        routing.on("routesfound", function (e: any) {
            const r = e.routes[0];
            const km = (r.summary.totalDistance / 1000).toFixed(2);
            const min = Math.round(r.summary.totalTime / 60);
            setStatusMsg(`Rota pronta: ${km} km • ~${min} min`);

            // Notify parent form
            if (startPoint.current && endPoint.current) {
                onRouteUpdate(
                    startPoint.current.lat.toFixed(6),
                    startPoint.current.lng.toFixed(6),
                    endPoint.current.lat.toFixed(6),
                    endPoint.current.lng.toFixed(6),
                    km,
                    min.toString()
                );
            }
        });

        map.on("click", (e: L.LeafletMouseEvent) => {
            handleMapClick(e.latlng);
        });

        // Setup my location initial load
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (pos) => {
                    const latlng = L.latLng(pos.coords.latitude, pos.coords.longitude);
                    map.setView([latlng.lat, latlng.lng], 16);
                    setPointInternal("start", latlng);
                    setMode("end");
                    setStatusMsg("Clique no mapa para definir o DESTINO");
                },
                () => console.warn("Geo denied")
            );
        }

        return () => {
            map.remove();
            mapInstance.current = null;
        };
    }, []);

    const modeRef = useRef(mode);
    useEffect(() => {
        modeRef.current = mode;
        setStatusMsg(mode === "start" ? "Clique no mapa para definir a ORIGEM" : "Clique no mapa para definir o DESTINO");
    }, [mode]);

    const handleMapClick = (latlng: L.LatLng) => {
        setPointInternal(modeRef.current, latlng);
        if (modeRef.current === "start") {
            setMode("end");
        }
    };

    const setPointInternal = (pointMode: "start" | "end", latlng: L.LatLng) => {
        if (!mapInstance.current) return;

        if (pointMode === "start") {
            startPoint.current = { lat: latlng.lat, lng: latlng.lng };
            if (!startMarker.current) {
                startMarker.current = L.marker(latlng, { draggable: true }).addTo(mapInstance.current);
                startMarker.current.on("dragend", () => {
                    if (startMarker.current) setPointInternal("start", startMarker.current.getLatLng());
                });
            } else {
                startMarker.current.setLatLng(latlng);
            }
        } else {
            endPoint.current = { lat: latlng.lat, lng: latlng.lng };
            if (!endMarker.current) {
                endMarker.current = L.marker(latlng, { draggable: true }).addTo(mapInstance.current);
                endMarker.current.on("dragend", () => {
                    if (endMarker.current) setPointInternal("end", endMarker.current.getLatLng());
                });
            } else {
                endMarker.current.setLatLng(latlng);
            }
        }
        updateRouteInternal();
    };

    const updateRouteInternal = () => {
        if (!routingControl.current) return;
        const wps = [];
        if (startPoint.current) wps.push(L.latLng(startPoint.current.lat, startPoint.current.lng));
        if (endPoint.current) wps.push(L.latLng(endPoint.current.lat, endPoint.current.lng));
        routingControl.current.setWaypoints(wps);
    };

    const clearMap = () => {
        startPoint.current = null;
        endPoint.current = null;
        if (startMarker.current && mapInstance.current) {
            mapInstance.current.removeLayer(startMarker.current);
            startMarker.current = null;
        }
        if (endMarker.current && mapInstance.current) {
            mapInstance.current.removeLayer(endMarker.current);
            endMarker.current = null;
        }
        if (routingControl.current) routingControl.current.setWaypoints([]);
        setMode("start");
        onRouteUpdate("", "", "", "");
    };

    return (
        <div className="space-y-2 border rounded-md p-2 bg-slate-50">
            <div className="flex flex-col sm:flex-row items-center justify-between text-sm gap-2">
                <span className="font-semibold text-slate-700 bg-white border px-3 py-1 rounded-full">{statusMsg}</span>
                <div className="flex gap-2">
                    <button type="button" onClick={() => setMode("start")} className={`px-3 py-1 border rounded-full transition-colors ${mode === 'start' ? 'bg-blue-600 text-white' : 'bg-white text-slate-700'}`}>1. Origem</button>
                    <button type="button" onClick={() => setMode("end")} className={`px-3 py-1 border rounded-full transition-colors ${mode === 'end' ? 'bg-red-600 text-white' : 'bg-white text-slate-700'}`}>2. Destino</button>
                    <button type="button" onClick={clearMap} className="px-3 py-1 border rounded-full bg-slate-200 text-slate-700 hover:bg-slate-300">Limpar</button>
                </div>
            </div>

            <div ref={mapRef} className="w-full h-[350px] rounded-md relative z-10" />
        </div>
    );
}
