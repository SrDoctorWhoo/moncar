"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { toast } from "sonner";
import Link from "next/link";
import { useState as useStateReact } from "react";

const loginSchema = z.object({
    email: z.string().email({ message: "Email inválido" }),
    senha: z.string().min(6, { message: "A senha deve ter pelo menos 6 caracteres" }),
});

export default function LoginPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useStateReact(false);

    const form = useForm<z.infer<typeof loginSchema>>({
        resolver: zodResolver(loginSchema),
        defaultValues: { email: "", senha: "" },
    });

    async function onSubmit(values: z.infer<typeof loginSchema>) {
        setIsLoading(true);
        const result = await signIn("credentials", {
            email: values.email,
            senha: values.senha,
            redirect: false,
        });
        setIsLoading(false);

        if (result?.error) {
            toast.error("Credenciais inválidas");
        } else {
            toast.success("Login realizado com sucesso!");
            router.push("/dashboard");
            router.refresh();
        }
    }

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
            <Card className="w-full max-w-md">
                <CardHeader className="space-y-1">
                    <CardTitle className="text-2xl font-bold text-center text-blue-600">Entrar no Momcar</CardTitle>
                    <CardDescription className="text-center">
                        Insira suas credenciais corporativas ou de mãe para acessar a rede
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                            <FormField
                                control={form.control}
                                name="email"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Email</FormLabel>
                                        <FormControl>
                                            <Input placeholder="seu@email.com" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="senha"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Senha</FormLabel>
                                        <FormControl>
                                            <Input type="password" placeholder="••••••••" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700" disabled={isLoading}>
                                {isLoading ? "Entrando..." : "Entrar"}
                            </Button>
                        </form>
                    </Form>
                </CardContent>
                <CardFooter className="flex justify-center flex-col gap-2">
                    <div className="text-sm text-slate-500">
                        Ainda não tem conta?{" "}
                        <Link href="/register" className="text-blue-600 hover:underline">
                            Crie uma agora
                        </Link>
                    </div>
                    <div className="text-sm text-slate-500">
                        <Link href="/" className="text-slate-400 hover:underline">
                            Voltar ao Início
                        </Link>
                    </div>
                </CardFooter>
            </Card>
        </div>
    );
}
