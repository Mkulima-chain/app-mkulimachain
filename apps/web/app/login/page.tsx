"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Field, FieldContent, FieldLabel } from "@/components/ui/field";
import { signIn } from "next-auth/react";
import { LanguageSelector } from "@/components/language-selector";
import { ModalWallet } from "@/components/wallet/modal-wallet";
import { ThemeToggle } from "@/components/theme-toggle";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // TODO: Implement login logic
    setTimeout(() => {
      setIsLoading(false);
    }, 1000);
  };

  const handleGoogleLogin = async () => {
    await signIn("google");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 dark:bg-[#004D73] p-4">
      {/* Language Selector - Top Right */}
      <div className="fixed top-4 right-4 z-50 flex items-center gap-2">
        <ThemeToggle />
        <LanguageSelector />
      </div>
      <div className="w-full max-w-md">
        {/* Logo and Title */}
        <div className="text-center mb-8 animate-fade-in">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-[#3A8F4C] mb-4 shadow-lg">
            <svg
              className="w-12 h-12 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
              />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-[#5A3E36] dark:text-white mb-2">
            Mkulima Chain
          </h1>
          <p className="text-[#004D73] dark:text-white/80 text-sm">
            Connectez-vous à votre compte agriculteur
          </p>
        </div>

        {/* Login Card */}
        <Card className="shadow-xl border-0 bg-white/95 dark:bg-[#003D5C]/95 backdrop-blur-sm animate-slide-up">
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-2xl font-semibold text-[#5A3E36] dark:text-white">
              Connexion
            </CardTitle>
            <CardDescription className="text-[#004D73] dark:text-white/70">
              Accédez à votre dashboard et gérez vos récoltes
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <Field>
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <FieldContent>
                  <Input
                    id="email"
                    type="email"
                    placeholder="votre@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="border-[#004D73]/20 focus:border-[#3A8F4C] focus:ring-[#3A8F4C]/20"
                  />
                </FieldContent>
              </Field>

              <Field>
                <FieldLabel htmlFor="password">Mot de passe</FieldLabel>
                <FieldContent>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="border-[#004D73]/20 focus:border-[#3A8F4C] focus:ring-[#3A8F4C]/20"
                  />
                </FieldContent>
              </Field>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <input
                    id="remember"
                    type="checkbox"
                    className="h-4 w-4 rounded border-[#004D73]/20 text-[#3A8F4C] focus:ring-[#3A8F4C]"
                  />
                  <Label
                    htmlFor="remember"
                    className="text-sm text-[#5A3E36] dark:text-white/90 cursor-pointer"
                  >
                    Se souvenir de moi
                  </Label>
                </div>
                <Link
                  href="/forgot-password"
                  className="text-sm text-[#004D73] dark:text-white/80 hover:text-[#3A8F4C] dark:hover:text-[#3A8F4C] transition-colors"
                >
                  Mot de passe oublié?
                </Link>
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-11 bg-[#3A8F4C] hover:bg-[#2E7D32] text-white font-medium shadow-md hover:shadow-lg transition-all duration-200"
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <svg
                      className="animate-spin h-4 w-4"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Connexion en cours...
                  </span>
                ) : (
                  "Se connecter"
                )}
              </Button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-[#004D73]/20 dark:border-white/20"></span>
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white dark:bg-[#003D5C] px-2 text-[#5A3E36] dark:text-white/90">
                    Ou
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleGoogleLogin}
                  disabled={isLoading}
                  className="border-[#004D73]/20 dark:border-white/20 hover:bg-[#E3F2FD] dark:hover:bg-white/10 hover:border-[#004D73]/40 dark:hover:border-white/30 text-[#5A3E36] dark:text-white/90 transition-all duration-200"
                >
                  <svg
                    className="w-4 h-4 mr-2"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      fill="#4285F4"
                    />
                    <path
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      fill="#34A853"
                    />
                    <path
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      fill="#FBBC05"
                    />
                    <path
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      fill="#EA4335"
                    />
                  </svg>
                  Google
                </Button>
                <ModalWallet
                  triggerClassName="w-full border-[#004D73]/20 dark:border-white/20 hover:bg-[#E3F2FD] dark:hover:bg-white/10 hover:border-[#004D73]/40 dark:hover:border-white/30 text-[#5A3E36] dark:text-white/90 transition-all duration-200"
                  triggerIconClassName="w-4 h-4 text-[#5A3E36] dark:text-white/90"
                  triggerTextClassName="text-[#5A3E36] dark:text-white/90"
                />
              </div>

              <div className="text-center text-sm text-[#5A3E36] dark:text-white/90">
                Pas encore de compte?{" "}
                <Link
                  href="/register"
                  className="font-medium text-[#3A8F4C] dark:text-[#3A8F4C] hover:text-[#2E7D32] dark:hover:text-[#2E7D32] transition-colors"
                >
                  Créer un compte
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="mt-8 text-center text-xs text-[#004D73]/70 dark:text-white/60 animate-fade-in animation-delay-300">
          <p>
            En vous connectant, vous acceptez nos{" "}
            <Link
              href="/terms"
              className="underline hover:text-[#3A8F4C] dark:hover:text-[#3A8F4C]"
            >
              conditions d&apos;utilisation
            </Link>{" "}
            et notre{" "}
            <Link
              href="/privacy"
              className="underline hover:text-[#3A8F4C] dark:hover:text-[#3A8F4C]"
            >
              politique de confidentialité
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
