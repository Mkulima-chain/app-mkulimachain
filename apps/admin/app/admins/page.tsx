"use client";

import * as React from "react";
import { Shield, Plus, Loader2, Mail, Lock, User, Phone } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useMutation } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";

type CreateAdminDto = {
  email: string;
  phone?: string;
  password: string;
  firstName: string;
  lastName: string;
};

export default function AdminsPage() {
  const router = useRouter();
  const { isAdmin } = useAuth();
  const [formData, setFormData] = React.useState<CreateAdminDto>({
    email: "",
    phone: "",
    password: "",
    firstName: "",
    lastName: "",
  });

  // Rediriger si l'utilisateur n'est pas admin
  React.useEffect(() => {
    if (isAdmin === false) {
      router.push("/");
    }
  }, [isAdmin, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const createAdminMutation = useMutation({
    mutationFn: (data: CreateAdminDto) =>
      api.post<{
        id: string;
        email: string;
        firstName: string;
        lastName: string;
        role: string;
      }>("/auth/admin/create", data),
    onSuccess: () => {
      toast.success("Compte administrateur créé avec succès");
      setFormData({
        email: "",
        phone: "",
        password: "",
        firstName: "",
        lastName: "",
      });
    },
    onError: (error: unknown) => {
      const message =
        (error as { message?: string })?.message ||
        "Erreur lors de la création du compte";
      toast.error(message);
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.password.length < 8) {
      toast.error("Le mot de passe doit contenir au moins 8 caractères");
      return;
    }

    createAdminMutation.mutate(formData);
  };

  if (isAdmin === false) {
    return null;
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-[#3A8F4C] to-[#2E7D32]">
            <Shield className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              Créer un compte administrateur
            </h1>
            <p className="text-muted-foreground">
              Créez un nouveau compte administrateur pour accéder au panneau
              d&apos;administration
            </p>
          </div>
        </div>
      </div>

      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Informations du compte</CardTitle>
          <CardDescription>
            Remplissez les informations pour créer un nouveau compte
            administrateur
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="firstName" className="text-sm font-medium">
                  Prénom *
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
                  Nom de famille *
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
            </div>

            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">
                Email *
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
                Mot de passe *
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
              <p className="text-xs text-muted-foreground">
                Le mot de passe doit contenir au moins 8 caractères
              </p>
            </div>

            <div className="flex gap-4 pt-4">
              <Button
                type="submit"
                className="bg-[#3A8F4C] hover:bg-[#2E7D32] text-white"
                disabled={createAdminMutation.isPending}
              >
                {createAdminMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Création...
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4 mr-2" />
                    Créer le compte
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
