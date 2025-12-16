"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { UserPlus, Mail, Lock, User, BookOpen, Phone } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { api, ApiError } from "@/lib/api-client";
import { saveAuth } from "@/lib/auth-storage";
import { toast } from "sonner";

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = React.useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    role: "admin" as "farmer" | "cooperative" | "admin",
  });
  const [hasAdmins, setHasAdmins] = React.useState<boolean | null>(null);
  const [isCheckingAdmins, setIsCheckingAdmins] = React.useState(true);

  // Vérifier s'il existe des admins au chargement
  React.useEffect(() => {
    const checkAdmins = async () => {
      try {
        const response = await api.get<{ hasAdmins: boolean }>(
          "/auth/admin/check"
        );
        setHasAdmins(response.hasAdmins);
      } catch (error) {
        // En cas d'erreur, supposer qu'il y a des admins (sécurité)
        setHasAdmins(true);
      } finally {
        setIsCheckingAdmins(false);
      }
    };
    checkAdmins();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const registerMutation = useMutation({
    mutationFn: () => {
      // Si l'utilisateur essaie de créer un admin et qu'il n'y a pas encore d'admin
      if (formData.role === "admin" && hasAdmins === false) {
        return api.post<{
          accessToken: string;
          refreshToken: string;
          user: {
            id: string;
            email: string;
            firstName: string;
            lastName: string;
            role: string;
          };
        }>("/auth/admin/first", {
          email: formData.email,
          phone: formData.phone || undefined,
          password: formData.password,
          firstName: formData.firstName,
          lastName: formData.lastName,
          role: "admin",
        });
      }
      // Sinon, créer un compte normal (farmer ou cooperative)
      return api.post<{
        accessToken: string;
        refreshToken: string;
        user: {
          id: string;
          email: string;
          firstName: string;
          lastName: string;
          role: string;
        };
      }>("/auth/register", {
        email: formData.email,
        phone: formData.phone || undefined,
        password: formData.password,
        firstName: formData.firstName,
        lastName: formData.lastName,
        role: formData.role === "admin" ? undefined : formData.role,
      });
    },
    onSuccess: (data) => {
      saveAuth(data);
      toast.success("Compte créé avec succès");
      router.push("/");
    },
    onError: (error: ApiError) => {
      toast.error(error?.message || "Inscription impossible");
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      toast.error("Les mots de passe ne correspondent pas");
      return;
    }

    registerMutation.mutate();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#E8F5E9] via-white to-[#E3F2FD] dark:from-[#003D5C] dark:via-[#004D73] dark:to-[#003D5C] p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-[#3A8F4C] to-[#2E7D32] shadow-lg">
            <BookOpen className="h-7 w-7 text-white" />
          </div>
          <div className="flex flex-col">
            <span className="text-2xl font-bold text-foreground">Admin</span>
            <span className="text-sm text-muted-foreground">Mkulima Chain</span>
          </div>
        </div>

        <Card className="border-2 shadow-xl">
          <CardHeader className="space-y-1 text-center">
            <div className="flex justify-center mb-4">
              <div className="h-16 w-16 rounded-full bg-[#3A8F4C]/10 dark:bg-[#3A8F4C]/20 flex items-center justify-center">
                <UserPlus className="h-8 w-8 text-[#3A8F4C]" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold">
              Créer un compte
            </CardTitle>
            <CardDescription>
              {hasAdmins === false
                ? "Créez le premier compte administrateur"
                : "Créez votre compte (Agriculteur ou Coopérative)"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isCheckingAdmins ? (
              <div className="flex items-center justify-center py-8">
                <div className="text-center">
                  <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
                  <p className="mt-4 text-sm text-muted-foreground">
                    Vérification...
                  </p>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {hasAdmins === false && (
                  <div className="rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 p-4 mb-4">
                    <p className="text-sm text-blue-800 dark:text-blue-200">
                      <strong>Premier compte administrateur</strong>
                      <br />
                      Aucun compte administrateur n&apos;existe encore. Vous
                      allez créer le premier compte admin du système.
                    </p>
                  </div>
                )}

                {hasAdmins !== false && (
                  <div className="space-y-2">
                    <label htmlFor="role" className="text-sm font-medium">
                      Type de compte *
                    </label>
                    <select
                      id="role"
                      name="role"
                      value={formData.role}
                      onChange={handleChange}
                      className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors"
                      required
                    >
                      <option value="farmer">Agriculteur</option>
                      <option value="cooperative">Coopérative</option>
                    </select>
                  </div>
                )}

                <div className="space-y-2">
                  <label htmlFor="firstName" className="text-sm font-medium">
                    Prénom
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="firstName"
                      name="firstName"
                      type="text"
                      placeholder="Jean"
                      value={formData.firstName}
                      onChange={handleChange}
                      className="pl-9"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="lastName" className="text-sm font-medium">
                    Nom de famille
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="lastName"
                      name="lastName"
                      type="text"
                      placeholder="Mukendi"
                      value={formData.lastName}
                      onChange={handleChange}
                      className="pl-9"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-medium">
                    Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="admin@mkulimachain.com"
                      value={formData.email}
                      onChange={handleChange}
                      className="pl-9"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="phone" className="text-sm font-medium">
                    Téléphone (optionnel)
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      placeholder="+243812345678"
                      value={formData.phone}
                      onChange={handleChange}
                      className="pl-9"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="password" className="text-sm font-medium">
                    Mot de passe
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="password"
                      name="password"
                      type="password"
                      placeholder="••••••••"
                      value={formData.password}
                      onChange={handleChange}
                      className="pl-9"
                      required
                      minLength={8}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label
                    htmlFor="confirmPassword"
                    className="text-sm font-medium"
                  >
                    Confirmer le mot de passe
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="confirmPassword"
                      name="confirmPassword"
                      type="password"
                      placeholder="••••••••"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className="pl-9"
                      required
                      minLength={8}
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="terms"
                    className="h-4 w-4 rounded border-gray-300"
                    required
                  />
                  <label
                    htmlFor="terms"
                    className="text-sm text-muted-foreground"
                  >
                    J&apos;accepte les{" "}
                    <Link
                      href="/terms"
                      className="text-[#3A8F4C] hover:underline"
                    >
                      conditions d&apos;utilisation
                    </Link>
                  </label>
                </div>

                <Button
                  type="submit"
                  className="w-full bg-[#3A8F4C] hover:bg-[#2E7D32] text-white"
                  disabled={registerMutation.isPending}
                >
                  {registerMutation.isPending
                    ? "Création du compte..."
                    : "Créer un compte"}
                </Button>
              </form>
            )}

            <div className="mt-6 text-center">
              <p className="text-sm text-muted-foreground">
                Vous avez déjà un compte?{" "}
                <Link
                  href="/login"
                  className="text-[#3A8F4C] hover:underline font-medium"
                >
                  Se connecter
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>

        <p className="text-center text-xs text-muted-foreground mt-6">
          © 2024 Mkulima Chain. Tous droits réservés.
        </p>
      </div>
    </div>
  );
}
