'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast"; // Assuming use-toast hook exists
import { Loader2 } from 'lucide-react';

// Validation Schema
const loginSchema = z.object({
  telefone: z.string()
    .min(9, { message: "O número de telefone deve ter 9 dígitos." })
    .max(9, { message: "O número de telefone deve ter 9 dígitos." })
    .regex(/^[9]\d{8}$/, { message: "Número de telefone inválido (deve começar com 9 e ter 9 dígitos)." }), // Angola format
  password: z.string().min(6, { message: "A senha deve ter pelo menos 6 caracteres." }),
});

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClientComponentClient();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      telefone: '',
      password: '',
    },
  });

  const onSubmit = async (values) => {
    setIsLoading(true);
    const email = `${values.telefone}@100.com`; // Construct email

    const { error } = await supabase.auth.signInWithPassword({
      email: email,
      password: values.password,
    });

    setIsLoading(false);

    if (error) {
      console.error("Login error:", error);
      toast({
        title: "Erro no Login",
        description: error.message || "Não foi possível iniciar sessão. Verifique o seu número e senha.",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Login bem-sucedido!",
        description: "Redirecionando...",
       });
       // Redirect to home or dashboard after successful login
       router.push('/'); // Or router.push('/perfil');
       router.refresh(); // Refresh to update layout/session state
     }
   };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-orange-900 to-black p-4">
      <Card className="w-full max-w-md bg-gray-800/70 backdrop-blur-sm border-orange-700/50 text-white">
        <CardHeader className="text-center">
          <img 
            src='/logo/logoff.webp' 
            alt="Logo" 
            className="h-12 mx-auto mb-4 object-contain w-auto max-w-full"
          />
          <CardTitle className="text-2xl font-bold text-orange-400">Iniciar Sessão</CardTitle>
          <CardDescription className="text-gray-400">Use o seu número de telefone para aceder à sua conta.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="telefone" className="text-gray-300">Nº Telefone</Label>
              <Input
                id="telefone"
                type="tel"
                placeholder="9XX XXX XXX"
                className="bg-gray-700/60 border-gray-600 text-white placeholder:text-gray-500"
                {...form.register('telefone')}
              />
              {form.formState.errors.telefone && (
                <p className="text-sm text-red-500">{form.formState.errors.telefone.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                type="password"
                placeholder="********"
                className="bg-gray-700/60 border-gray-600 text-white placeholder:text-gray-500"
                {...form.register('password')}
              />
              {form.formState.errors.password && (
                <p className="text-sm text-red-500">{form.formState.errors.password.message}</p>
              )}
            </div>
            <Button type="submit" className="w-full bg-orange-600 hover:bg-orange-700" disabled={isLoading}>
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Entrar"}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="text-center text-sm">
          <p className="text-gray-400">
            Não tem uma conta?{' '}
            <Link href="/signup" className="text-orange-400 hover:text-orange-300 font-medium">
              Registe-se aqui
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
