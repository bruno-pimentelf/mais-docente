"use client";

import { useAuth } from "@/contexts/auth-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { LogOut, User } from "lucide-react";

export default function Page() {
  const { user, loading, logout } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-muted-foreground">Carregando...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Bem-vindo ao Mais Docente</CardTitle>
            <CardDescription>
              Faça login ou cadastre-se para continuar
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Link href="/login" className="block">
              <Button className="w-full">Entrar</Button>
            </Link>
            <Link href="/cadastro" className="block">
              <Button variant="outline" className="w-full">
                Criar conta
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Perfil do Usuário
            </CardTitle>
            <CardDescription>
              Informações da sua conta
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Nome</p>
              <p className="text-base font-medium">
                {user.displayName || "Não informado"}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Email</p>
              <p className="text-base font-medium">{user.email}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">ID do usuário</p>
              <p className="text-sm font-mono text-muted-foreground break-all">
                {user.uid}
              </p>
            </div>
            <div className="pt-4">
              <Button variant="destructive" onClick={logout} className="w-full sm:w-auto">
                <LogOut className="mr-2 h-4 w-4" />
                Sair
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
