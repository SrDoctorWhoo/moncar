// @ts-nocheck
import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcrypt";
import prisma from "@/lib/prisma";

export const authOptions: NextAuthOptions = {
    providers: [
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                senha: { label: "Senha", type: "password" }
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.senha) return null;

                try {
                    const user = await prisma.user.findUnique({
                        where: { email: credentials.email }
                    });

                    if (!user) return null;

                    const isPasswordValid = await bcrypt.compare(credentials.senha, user.senha);
                    if (!isPasswordValid) return null;

                    return {
                        id: user.id,
                        name: user.nome,
                        email: user.email,
                        role: user.tipo_perfil,
                        verifiedStatus: user.status_verificacao
                    };
                } catch (error) {
                    console.error("Auth error", error);
                    return null;
                }
            }
        })
    ],
    callbacks: {
        async jwt({ token, user, trigger }) {
            // On initial sign-in: populate token fields from the user object
            if (user) {
                token.id = user.id;
                token.role = (user as any).role;
                token.verifiedStatus = (user as any).verifiedStatus;
                token.iat = Math.floor(Date.now() / 1000);
            }

            // Re-fetch verifiedStatus from DB on update trigger OR every 60 seconds
            // This ensures the token always reflects the current DB state
            const tokenAge = Math.floor(Date.now() / 1000) - ((token.iat as number) ?? 0);
            if (trigger === "update" || tokenAge > 60) {
                if (token.id) {
                    try {
                        const freshUser = await prisma.user.findUnique({
                            where: { id: token.id as string },
                            select: { status_verificacao: true }
                        });
                        if (freshUser) {
                            token.verifiedStatus = freshUser.status_verificacao;
                        }
                    } catch {
                        // silently ignore DB read errors — use cached value
                    }
                }
                token.iat = Math.floor(Date.now() / 1000);
            }

            return token;
        },
        async session({ session, token }) {
            if (token && session.user) {
                (session.user as any).id = token.id as string;
                (session.user as any).role = token.role as string;
                (session.user as any).verifiedStatus = token.verifiedStatus as string;
            }
            return session;
        }
    },
    pages: {
        signIn: "/login",
    },
    session: { strategy: "jwt" }
};

const handler = NextAuth(authOptions) as any;
export { handler as GET, handler as POST };
