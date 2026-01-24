"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { TypographyH3 } from "@/components/ui/typography";
import { Separator } from "@/components/ui/separator";
import { Chrome, Mail, Lock, Eye, EyeOff } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { signIn, signInWithGoogle } = useAuth();
  const router = useRouter();

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await signIn(email, password);
      router.push("/");
    } catch (err: any) {
      setError(err.message || "Erro ao fazer login. Verifique suas credenciais.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError("");
    setLoading(true);

    try {
      await signInWithGoogle();
      router.push("/");
    } catch (err: any) {
      setError(err.message || "Erro ao fazer login com Google.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen flex overflow-hidden">
      {/* Lado Esquerdo - Apenas fundo */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary via-primary/90 to-primary/80"></div>

      {/* Lado Direito - Formulário */}
      <div className="flex-1 flex items-center justify-center bg-background p-4 lg:p-8 overflow-y-auto">
        <div className="w-full max-w-md py-4">
          <Card className="border-0 bg-transparent shadow-none">
            <CardHeader className="space-y-2 text-center pt-4 pb-4">
              <TypographyH3 className="flex items-center justify-center gap-2">
                <span>Bem-vindo de volta</span>
                <span>👋</span>
              </TypographyH3>
            </CardHeader>
            <CardContent className="space-y-4">
              {error && (
                <div className="p-4 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-lg animate-in fade-in">
                  {error}
                </div>
              )}

              <form onSubmit={handleEmailLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="seu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={loading}
                    className="h-11"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password" className="text-sm font-medium flex items-center gap-2">
                      <Lock className="h-4 w-4" />
                      Senha
                    </Label>
                    <Link
                      href="/recuperar-senha"
                      className="text-sm text-primary hover:underline font-medium transition-colors"
                    >
                      Esqueceu?
                    </Link>
                  </div>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      disabled={loading}
                      className="h-11 pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      tabIndex={-1}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>

                <Button 
                  type="submit" 
                  className="w-full h-11 text-base font-medium transition-all" 
                  disabled={loading}
                >
                  {loading ? "Entrando..." : "Entrar"}
                </Button>
              </form>

              <div className="relative py-4">
                <div className="absolute inset-0 flex items-center">
                  <Separator />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-3 text-muted-foreground font-medium">Ou continue com</span>
                </div>
              </div>

              <Button
                type="button"
                variant="outline"
                className="w-full h-11 text-base font-medium hover:bg-muted/50 transition-all"
                onClick={handleGoogleLogin}
                disabled={loading}
              >
                <Chrome className="mr-2 h-5 w-5" />
                Entrar com Google
              </Button>
            </CardContent>
            <CardFooter className="flex flex-col space-y-2 pt-4">
              <div className="text-sm text-center text-muted-foreground">
                Não tem uma conta?{" "}
                <Link href="/cadastro" className="text-primary hover:underline font-semibold transition-colors">
                  Cadastre-se
                </Link>
              </div>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}
