"use client";

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
import { toast } from "sonner";
import Link from "next/link";
import { useState } from "react";
import { MomcarLogo } from "@/components/ui/Logo";

const loginSchema = z.object({
    email: z.string().email({ message: "Email inválido" }),
    senha: z.string().min(6, { message: "A senha deve ter pelo menos 6 caracteres" }),
});

export default function LoginPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);

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
            toast.success("Bem-vinda de volta!");
            router.push("/dashboard");
            router.refresh();
        }
    }

    return (
        <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2 bg-background font-sans">
            {/* Left side: Premium Vibrant Splash */}
            <div className="hidden lg:flex flex-col justify-between bg-secondary text-white p-12 relative overflow-hidden">
                {/* Abstract decorative elements */}
                <div className="absolute top-0 right-0 w-96 h-96 bg-primary/30 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2"></div>
                <div className="absolute bottom-0 left-0 w-96 h-96 bg-accent/40 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/4"></div>

                <Link href="/">
                    <h1 className="hover:opacity-80 transition-opacity cursor-pointer relative z-10 w-fit drop-shadow-md flex items-center">
                        <span className="sr-only">Momcar</span>
                        <MomcarLogo className="h-24 w-40 sm:h-32 sm:w-48" />
                    </h1>
                </Link>

                <div className="relative z-10 max-w-lg">
                    <h2 className="text-5xl font-heading font-bold leading-tight mb-6">
                        Bem-vinda à sua <span className="text-primary">rede de apoio</span> escolar.
                    </h2>
                    <p className="text-secondary-foreground/80 font-medium text-lg leading-relaxed">
                        Acesso exclusivo para mães. Entre e organize a carona escolar das crianças com tranquilidade e total segurança.
                    </p>
                </div>
            </div>

            {/* Right side: Login Form */}
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

                <div className="w-full max-w-md space-y-8 relative z-10">
                    <div className="text-center">
                        <h2 className="text-3xl font-heading font-bold text-secondary">Acesse sua conta</h2>
                        <p className="text-muted-foreground mt-2 font-medium">
                            Não tem uma conta?{" "}
                            <Link href="/register" className="text-primary font-bold hover:underline">
                                Cadastre-se
                            </Link>
                        </p>
                    </div>

                    <div className="bg-background rounded-3xl p-8 border border-foreground/5 shadow-xl shadow-foreground/5">
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
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
                                <Button type="submit" className="w-full h-12 rounded-xl bg-primary hover:bg-primary/90 text-white font-bold text-base shadow-lg shadow-primary/30 transition-all hover:-translate-y-0.5 mt-4" disabled={isLoading}>
                                    {isLoading ? "Entrando..." : "Entrar agora"}
                                </Button>
                            </form>
                        </Form>
                    </div>
                </div>
            </div>
        </div>
    );
}
