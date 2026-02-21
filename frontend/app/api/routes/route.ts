import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";
import axios from "axios";

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ message: "Não autorizado" }, { status: 401 });
        }

        const { origem_lat, origem_lng, destino_lat, destino_lng, horario_ida, horario_volta } = await req.json();

        let polyline = "no_polyline";
        // If you have Mapbox Token, otherwise we generate a mock for MVP
        const mapboxToken = process.env.MAPBOX_ACCESS_TOKEN;
        if (mapboxToken) {
            try {
                const mapboxUrl = `https://api.mapbox.com/directions/v5/mapbox/driving/${origem_lng},${origem_lat};${destino_lng},${destino_lat}?overview=full&access_token=${mapboxToken}`;
                const mapboxRes = await axios.get(mapboxUrl);
                if (mapboxRes.data.routes && mapboxRes.data.routes.length > 0) {
                    polyline = mapboxRes.data.routes[0].geometry;
                }
            } catch (mapError) {
                console.error("Erro no mapbox:", mapError);
            }
        }

        const newRoute = await prisma.route.create({
            data: {
                user_id: session.user.id,
                origem_lat,
                origem_lng,
                destino_lat,
                destino_lng,
                polyline,
                horario_ida,
                horario_volta
            },
        });

        return NextResponse.json(newRoute, { status: 201 });
    } catch (error) {
        console.error("Create Route Error:", error);
        return NextResponse.json({ message: "Erro interno do servidor." }, { status: 500 });
    }
}
