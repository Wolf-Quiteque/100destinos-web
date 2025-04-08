'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { format } from "date-fns"; // For date picker
import { cn } from "@/lib/utils"; // For date picker styling
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"; // For Sexo
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"; // For Date Picker
import { Calendar } from "@/components/ui/calendar"; // For Date Picker
import { useToast } from "@/hooks/use-toast";
import { Loader2, CalendarIcon } from 'lucide-react';

// Validation Schema
const signupSchema = z.object({
  nome: z.string().min(2, { message: "O nome deve ter pelo menos 2 caracteres." }),
  sexo: z.enum(['Masculino', 'Feminino', 'Outro'], { required_error: "Selecione o sexo." }),
  numero_bi: z.string().min(10, { message: "Nº BI inválido." }).max(14, { message: "Nº BI inválido." }), // Adjust min/max as needed for Angolan BI
  data_nascimento: z.date({ required_error: "Selecione a data de nascimento." }),
  telefone: z.string()
    .min(9, { message: "O número de telefone deve ter 9 dígitos." })
    .max(9, { message: "O número de telefone deve ter 9 dígitos." })
    .regex(/^[9]\d{8}$/, { message: "Número de telefone inválido (deve começar com 9 e ter 9 dígitos)." }),
  password: z.string().min(6, { message: "A senha deve ter pelo menos 6 caracteres." }),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "As senhas não coincidem.",
  path: ["confirmPassword"], // Set error on confirmPassword field
});

export default function SignupPage() {
  const router = useRouter();
  const supabase = createClientComponentClient();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      nome: '',
      sexo: undefined,
      numero_bi: '',
      data_nascimento: undefined,
      telefone: '',
      password: '',
      confirmPassword: '',
    },
  });

  const onSubmit = async (values) => {
    setIsLoading(true);
    const email = `${values.telefone}@100.com`; // Construct email for auth

    // 1. Sign up the user in Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: email,
      password: values.password,
      // Options can be added here if needed, e.g., email confirmation redirect
    });

    if (authError) {
      setIsLoading(false);
      console.error("Signup auth error:", authError);
      toast({
        title: "Erro no Registo",
        description: authError.message || "Não foi possível criar a conta. Verifique os dados ou tente um número diferente.",
        variant: "destructive",
      });
      return; // Stop if auth signup failed
    }

    if (!authData.user) {
        setIsLoading(false);
        console.error("Signup error: No user data returned after signup.");
        toast({
            title: "Erro no Registo",
            description: "Ocorreu um problema inesperado ao criar a conta.",
            variant: "destructive",
        });
        return; // Stop if user data is missing
    }

    // 2. Insert additional info into the 'profiles' table
    const { error: profileError } = await supabase
      .from('profiles')
      .insert({
        id: authData.user.id, // Link to the auth user
        nome: values.nome,
        sexo: values.sexo,
        numero_bi: values.numero_bi,
        data_nascimento: values.data_nascimento.toISOString().split('T')[0], // Format date as YYYY-MM-DD
        telefone: values.telefone,
        // created_at and updated_at have default values in the DB
      });

    setIsLoading(false);

    if (profileError) {
      console.error("Profile insertion error:", profileError);
      // Note: Ideally, you might want to handle this case more gracefully,
      // maybe by deleting the auth user if profile insertion fails, but that adds complexity.
      toast({
        title: "Erro ao Guardar Perfil",
        description: profileError.message || "Conta criada, mas houve um erro ao guardar detalhes adicionais.",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Registo bem-sucedido!",
        description: "Conta criada com sucesso. Redirecionando...",
      });
      router.push('/'); // Redirect to home page after successful signup
      router.refresh(); // Refresh state
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-orange-900 to-black p-4">
      <Card className="w-full max-w-lg bg-gray-800/70 backdrop-blur-sm border-orange-700/50 text-white">
        <CardHeader className="text-center">
           <img 
            src='/logo/logoff.webp' 
            alt="Logo" 
            className="h-12 mx-auto mb-4 object-contain w-auto max-w-full"
          />
          <CardTitle className="text-2xl font-bold text-orange-400">Criar Conta</CardTitle>
          <CardDescription className="text-gray-400">Preencha os seus dados para se registar.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
            {/* Nome */}
            <div className="space-y-1">
              <Label htmlFor="nome" className="text-gray-300">Nome Completo</Label>
              <Input id="nome" placeholder="Seu nome completo" className="bg-gray-700/60 border-gray-600 text-white placeholder:text-gray-500" {...form.register('nome')} />
              {form.formState.errors.nome && <p className="text-sm text-red-500">{form.formState.errors.nome.message}</p>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {/* Sexo */}
              <div className="space-y-1">
                <Label htmlFor="sexo" className="text-gray-300">Sexo</Label>
                <Select onValueChange={(value) => form.setValue('sexo', value)} defaultValue={form.getValues('sexo')}>
                  <SelectTrigger id="sexo" className="w-full bg-gray-700/60 border-gray-600 text-white">
                    <SelectValue placeholder="Selecione..." />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 text-white border-gray-600">
                    <SelectItem value="Masculino">Masculino</SelectItem>
                    <SelectItem value="Feminino">Feminino</SelectItem>
                    <SelectItem value="Outro">Outro</SelectItem>
                  </SelectContent>
                </Select>
                {form.formState.errors.sexo && <p className="text-sm text-red-500">{form.formState.errors.sexo.message}</p>}
              </div>

              {/* Data Nascimento */}
              <div className="space-y-1">
                <Label htmlFor="data_nascimento" className="text-gray-300">Data de Nascimento</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      id="data_nascimento"
                      variant={"outline"}
                      className={cn(
                        "w-full justify-start text-left font-normal bg-gray-700/60 border-gray-600 hover:bg-gray-700/80 text-white hover:text-white",
                        !form.watch('data_nascimento') && "text-gray-500"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {form.watch('data_nascimento') ? format(form.watch('data_nascimento'), "PPP") : <span>Selecione a data</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 bg-gray-800 border-gray-600" align="start">
                    <Calendar
                      mode="single"
                      selected={form.watch('data_nascimento')}
                      onSelect={(date) => form.setValue('data_nascimento', date)}
                      initialFocus
                      className="text-white"
                      captionLayout="dropdown-buttons" // Easier year/month navigation
                      fromYear={1950} // Set reasonable year range
                      toYear={new Date().getFullYear() - 10} // Example: minimum 10 years old
                    />
                  </PopoverContent>
                </Popover>
                {form.formState.errors.data_nascimento && <p className="text-sm text-red-500">{form.formState.errors.data_nascimento.message}</p>}
              </div>
            </div>

            {/* Nº BI */}
            <div className="space-y-1">
              <Label htmlFor="numero_bi" className="text-gray-300">Nº Bilhete de Identidade</Label>
              <Input id="numero_bi" placeholder="Seu número do BI" className="bg-gray-700/60 border-gray-600 text-white placeholder:text-gray-500" {...form.register('numero_bi')} />
              {form.formState.errors.numero_bi && <p className="text-sm text-red-500">{form.formState.errors.numero_bi.message}</p>}
            </div>

            {/* Telefone */}
            <div className="space-y-1">
              <Label htmlFor="telefone" className="text-gray-300">Nº Telefone</Label>
              <Input id="telefone" type="tel" placeholder="9XX XXX XXX" className="bg-gray-700/60 border-gray-600 text-white placeholder:text-gray-500" {...form.register('telefone')} />
              {form.formState.errors.telefone && <p className="text-sm text-red-500">{form.formState.errors.telefone.message}</p>}
            </div>

            {/* Password */}
            <div className="space-y-1">
              <Label htmlFor="password">Senha</Label>
              <Input id="password" type="password" placeholder="Crie uma senha" className="bg-gray-700/60 border-gray-600 text-white placeholder:text-gray-500" {...form.register('password')} />
              {form.formState.errors.password && <p className="text-sm text-red-500">{form.formState.errors.password.message}</p>}
            </div>

            {/* Confirm Password */}
            <div className="space-y-1">
              <Label htmlFor="confirmPassword">Confirmar Senha</Label>
              <Input id="confirmPassword" type="password" placeholder="Confirme a senha" className="bg-gray-700/60 border-gray-600 text-white placeholder:text-gray-500" {...form.register('confirmPassword')} />
              {form.formState.errors.confirmPassword && <p className="text-sm text-red-500">{form.formState.errors.confirmPassword.message}</p>}
            </div>

            <Button type="submit" className="w-full bg-orange-600 hover:bg-orange-700 mt-4" disabled={isLoading}>
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Registar"}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="text-center text-sm">
          <p className="text-gray-400">
            Já tem uma conta?{' '}
            <Link href="/login" className="text-orange-400 hover:text-orange-300 font-medium">
              Inicie sessão aqui
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
