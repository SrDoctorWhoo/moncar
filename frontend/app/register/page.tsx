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
import { toast } from "sonner";
import Link from "next/link";
import axios from "axios";
import { useState } from "react";
import { MomcarLogo } from "@/components/ui/Logo";

const registerSchema = z.object({
    nome: z.string().min(3, { message: "O nome deve ter pelo menos 3 caracteres" }),
    email: z.string().email({ message: "Formato de email inválido" }),
    senha: z.string().min(6, { message: "A senha deve conter no mínimo 6 caracteres" }),
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
            toast.success("Conta criada com sucesso! Faça seu login.");
            setTimeout(() => router.push("/login"), 1500);
        } catch (error) {
            toast.error("Este email já está cadastrado em nossa rede.");
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2 bg-background font-sans">
            {/* Left side: Premium Vibrant Splash */}
            <div className="hidden lg:flex flex-col justify-between bg-primary text-white p-12 relative overflow-hidden">
                {/* Abstract decorative elements */}
                <div className="absolute top-1/2 left-1/2 w-[800px] h-[800px] bg-accent/30 rounded-full blur-[120px] -translate-y-1/2 -translate-x-1/2 pointer-events-none"></div>
                <div className="absolute bottom-0 right-0 w-96 h-96 bg-secondary/40 rounded-full blur-[100px] translate-y-1/2 translate-x-1/2 pointer-events-none"></div>

                <Link href="/">
                    <h1 className="hover:opacity-80 transition-opacity cursor-pointer relative z-10 w-fit drop-shadow-sm flex items-center">
                        <span className="sr-only">Momcar</span>
                        <MomcarLogo className="h-24 w-40 sm:h-32 sm:w-48" />
                    </h1>
                </Link>

                <div className="relative z-10 max-w-lg">
                    <h2 className="text-5xl font-heading font-bold leading-tight mb-6 drop-shadow-sm">
                        Junte-se à <span className="text-accent">rede mater</span> de segurança viária.
                    </h2>
                    <p className="text-white/90 font-medium text-lg leading-relaxed">
                        Crie seu perfil, verifique seus documentos e faça parte de um ecossistema 100% voltado para a tranquilidade de quem você mais ama.
                    </p>
                </div>
            </div>

            {/* Right side: Register Form */}
            <div className="flex items-center justify-center p-6 lg:p-12 relative bg-white">
                {/* Mobile header */}
                <div className="flex lg:hidden absolute top-6 left-6">
                    <Link href="/">
                        <h1 className="flex items-center">
                            <span className="sr-only">Momcar</span>
                            <MomcarLogo className="h-16 w-28" />
                        </h1>
                    </Link>
                </div>

                <div className="w-full max-w-md space-y-6 relative z-10">
                    <div className="text-center mb-8">
                        <h2 className="text-3xl font-heading font-bold text-secondary">Crie sua Conta</h2>
                        <p className="text-muted-foreground mt-2 font-medium">
                            Já faz parte da rede?{" "}
                            <Link href="/login" className="text-primary font-bold hover:underline">
                                Fazer Login
                            </Link>
                        </p>
                    </div>

                    <div className="bg-background rounded-3xl p-8 border border-foreground/5 shadow-xl shadow-foreground/5">
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                                <FormField
                                    control={form.control}
                                    name="nome"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="font-semibold text-secondary">Nome Completo</FormLabel>
                                            <FormControl>
                                                <Input className="h-12 bg-white border-foreground/10 focus-visible:ring-primary/20 focus-visible:border-primary rounded-xl" placeholder="Maria Silva" {...field} />
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
                                            <FormLabel className="font-semibold text-secondary">Email</FormLabel>
                                            <FormControl>
                                                <Input className="h-12 bg-white border-foreground/10 focus-visible:ring-primary/20 focus-visible:border-primary rounded-xl" placeholder="seu@email.com" {...field} />
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
                                            <FormLabel className="font-semibold text-secondary">Senha</FormLabel>
                                            <FormControl>
                                                <Input className="h-12 bg-white border-foreground/10 focus-visible:ring-primary/20 focus-visible:border-primary rounded-xl" type="password" placeholder="••••••••" {...field} />
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
                                            <FormLabel className="font-semibold text-secondary">Como você quer usar o aplicativo?</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl>
                                                    <SelectTrigger className="h-12 bg-white border-foreground/10 focus:ring-primary/20 rounded-xl">
                                                        <SelectValue placeholder="Selecione um perfil" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent className="rounded-xl border-foreground/5 shadow-lg">
                                                    <SelectItem className="font-medium hover:bg-primary/5 rounded-lg" value="PASSENGER">Sou Passageira (Quero carona)</SelectItem>
                                                    <SelectItem className="font-medium hover:bg-primary/5 rounded-lg" value="DRIVER">Sou Mãetorista (Vou dar carona)</SelectItem>
                                                    <SelectItem className="font-medium hover:bg-primary/5 rounded-lg" value="ADMIN">Administradora do Sistema</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <Button type="submit" className="w-full h-12 rounded-xl bg-primary hover:bg-primary/90 text-white font-bold text-base shadow-lg shadow-primary/30 transition-all hover:-translate-y-0.5 mt-6" disabled={isLoading}>
                                    {isLoading ? "Processando..." : "Finalizar Cadastro"}
                                </Button>
                            </form>
                        </Form>
                    </div>
                </div>
            </div>
        </div>
    );
}
