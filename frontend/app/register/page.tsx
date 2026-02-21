"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { toast } from "sonner";
import Link from "next/link";
import axios from "axios";
import { useState } from "react";

const registerSchema = z.object({
    nome: z.string().min(3, { message: "O nome deve ter pelo menos 3 caracteres" }),
    email: z.string().email({ message: "Email inválido" }),
    senha: z.string().min(6, { message: "A senha deve ter pelo menos 6 caracteres" }),
    tipo_perfil: z.enum(["PASSENGER", "DRIVER", "ADMIN"]),
});

export default function RegisterPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);

    const form = useForm<z.infer<typeof registerSchema>>({
        resolver: zodResolver(registerSchema),
        defaultValues: { nome: "", email: "", senha: "", tipo_perfil: "PASSENGER" },
    });

    async function onSubmit(values: z.infer<typeof registerSchema>) {
        setIsLoading(true);
        try {
            await axios.post(`/api/auth/register`, {
                nome: values.nome,
                email: values.email,
                senha: values.senha,
                tipo_perfil: values.tipo_perfil
            });
            toast.success("Conta criada! Redirecionando para login...");
            setTimeout(() => router.push("/login"), 1500);
        } catch (error) {
            toast.error("Erro ao registrar a conta. O email pode já estar em uso.");
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
            <Card className="w-full max-w-md">
                <CardHeader className="space-y-1">
                    <CardTitle className="text-2xl font-bold text-center text-blue-600">Criar Conta Momcar</CardTitle>
                    <CardDescription className="text-center">
                        Junte-se a nossa rede de caronas colaborativa
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                            <FormField
                                control={form.control}
                                name="nome"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Nome Completo</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Maria Silva" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
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
                            <FormField
                                control={form.control}
                                name="tipo_perfil"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Como você vai usar o Momcar?</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Selecione um perfil" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="PASSENGER">Sou Passageira (Quero caronas para escola)</SelectItem>
                                                <SelectItem value="DRIVER">Sou Mãetorista (Posso dar caronas para escola)</SelectItem>
                                                {/* Note: In a real app we'd probably hide ADMIN signup, but for MVP testing: */}
                                                <SelectItem value="ADMIN">Administradora</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 mt-2" disabled={isLoading}>
                                {isLoading ? "Criando conta..." : "Criar Conta"}
                            </Button>
                        </form>
                    </Form>
                </CardContent>
                <CardFooter className="flex justify-center flex-col gap-2">
                    <div className="text-sm text-slate-500">
                        Já tem conta?{" "}
                        <Link href="/login" className="text-blue-600 hover:underline">
                            Fazer Login
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
