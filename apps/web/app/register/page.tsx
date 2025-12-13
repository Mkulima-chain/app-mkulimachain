"use client";

import { useState } from "react";
import * as React from "react";
import { useRouter } from "next/navigation";
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
import { Field, FieldContent, FieldLabel } from "@/components/ui/field";
import { useApiPost } from "@/hooks/use-api-mutation";
import { LanguageSelector } from "@/components/language-selector";
import { ThemeToggle } from "@/components/theme-toggle";
import { signIn } from "next-auth/react";
import { toast } from "sonner";
import {
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
  Wallet,
  LogOut,
  Loader2,
  Copy,
  Check,
} from "lucide-react";
import { useWalletAtom } from "@/hooks/useWalletAtom";
import { BrowserWallet } from "@meshsdk/core";

// Types pour l'inscription
enum UserRole {
  FARMER = "farmer",
  BUYER = "buyer",
  COOPERATIVE = "cooperative",
  SCHOOL = "school",
}

interface RegisterDto {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role?: UserRole;
  walletAddress?: string;
}

interface RegisterResponse {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
    status: string;
  };
}

const STEPS = [
  {
    id: 1,
    title: "Portefeuille Cardano",
    description: "Connectez votre wallet",
  },
  {
    id: 2,
    title: "Informations du compte",
    description: "Vos informations personnelles et sécurité",
  },
];

export default function RegisterPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<RegisterDto>({
    email: "",
    password: "",
    firstName: "",
    lastName: "",
    phone: "",
    role: UserRole.BUYER, // Toujours BUYER pour cette interface
    walletAddress: "",
  });
  const [fullName, setFullName] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [availableWallets, setAvailableWallets] = useState<string[]>([]);
  const [isConnecting, setIsConnecting] = useState(false);
  const [copied, setCopied] = useState(false);

  const { connected, address, connect, disconnect, walletName } =
    useWalletAtom();

  // Load available wallets
  React.useEffect(() => {
    const loadWallets = async () => {
      try {
        const wallets = await BrowserWallet.getInstalledWallets();
        setAvailableWallets(wallets.map((w) => w.name));
      } catch (error) {
        console.error("Error loading wallets:", error);
      }
    };
    if (currentStep === 1) {
      loadWallets();
    }
  }, [currentStep]);

  // Update formData with wallet address when connected and auto-advance to next step
  React.useEffect(() => {
    if (connected && address) {
      setFormData((prev) => ({
        ...prev,
        walletAddress: address,
      }));
      // Passer automatiquement à l'étape suivante quand le wallet est connecté
      if (currentStep === 1) {
        setTimeout(() => {
          setCurrentStep(2);
        }, 500);
      }
    }
  }, [connected, address, currentStep]);

  const handleWalletConnect = async (name: string) => {
    try {
      setIsConnecting(true);
      await connect(name);
      toast.success("Wallet connecté avec succès !");
    } catch (error) {
      console.error("Error connecting wallet:", error);
      toast.error("Erreur lors de la connexion du wallet");
    } finally {
      setIsConnecting(false);
    }
  };

  const handleWalletDisconnect = async () => {
    try {
      await disconnect();
      setFormData((prev) => ({
        ...prev,
        walletAddress: "",
      }));
    } catch (error) {
      console.error("Error disconnecting wallet:", error);
    }
  };

  const handleCopyAddress = async () => {
    if (address) {
      try {
        await navigator.clipboard.writeText(address);
        setCopied(true);
        toast.success("Adresse copiée dans le presse-papiers");
        setTimeout(() => setCopied(false), 2000);
      } catch (error) {
        console.error("Error copying address:", error);
        toast.error("Erreur lors de la copie");
      }
    }
  };

  const registerMutation = useApiPost<RegisterResponse, RegisterDto>(
    "auth/register",
    {
      onSuccess: () => {
        toast.success("Compte créé avec succès !", {
          description: "Vous allez être redirigé vers la page de connexion.",
        });
        // Rediriger vers la page de connexion après un court délai
        setTimeout(() => {
          router.push("/login");
        }, 1500);
      },
      onError: (error) => {
        const errorMessage =
          error.message || "Une erreur est survenue lors de l'inscription";
        toast.error("Erreur d'inscription", {
          description: errorMessage,
        });
      },
    }
  );

  // Validation des étapes
  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        if (!connected || !address) {
          toast.error("Veuillez connecter votre portefeuille Cardano");
          return false;
        }
        return true;
      case 2:
        if (!fullName.trim()) {
          toast.error("Le nom complet est requis");
          return false;
        }
        if (!formData.email.trim()) {
          toast.error("L'email est requis");
          return false;
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
          toast.error("Veuillez entrer un email valide");
          return false;
        }
        if (!formData.password) {
          toast.error("Le mot de passe est requis");
          return false;
        }
        if (formData.password.length < 8) {
          toast.error("Le mot de passe doit contenir au moins 8 caractères");
          return false;
        }
        if (formData.password !== confirmPassword) {
          toast.error("Les mots de passe ne correspondent pas");
          return false;
        }
        return true;
      default:
        return true;
    }
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      if (currentStep < STEPS.length) {
        setCurrentStep(currentStep + 1);
      }
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation finale
    if (!validateStep(2)) {
      setCurrentStep(2);
      return;
    }

    if (!connected || !address) {
      toast.error("Veuillez connecter votre portefeuille Cardano");
      setCurrentStep(1);
      return;
    }

    // Splitter le nom complet en prénom et nom
    const nameParts = fullName.trim().split(/\s+/);
    const firstName = nameParts[0] || "";
    const lastName = nameParts.slice(1).join(" ") || firstName; // Si pas de nom, utiliser le prénom

    const submitData: RegisterDto = {
      email: formData.email,
      password: formData.password,
      firstName: firstName,
      lastName: lastName,
      role: UserRole.BUYER, // Toujours BUYER
      walletAddress: address,
    };

    registerMutation.mutate(submitData);
  };

  const handleChange = (field: keyof RegisterDto, value: string | UserRole) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleGoogleSignUp = async () => {
    // Marquer que l'inscription vient de la page register pour définir le rôle BUYER
    if (typeof window !== "undefined") {
      sessionStorage.setItem("googleSignUpFromRegister", "true");
    }
    await signIn("google", { callbackUrl: "/dashboard" });
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
            Créez votre compte et rejoignez la communauté
          </p>
        </div>

        {/* Wallet Status Bar */}

        {/* Register Card */}
        <Card className="shadow-xl border-0 bg-white/95 dark:bg-[#003D5C]/95 backdrop-blur-sm animate-slide-up">
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-2xl font-semibold text-[#5A3E36] dark:text-white">
              Créer un compte
            </CardTitle>
            <CardDescription className="text-[#004D73] dark:text-white/70">
              Étape {currentStep} sur {STEPS.length}:{" "}
              {STEPS[currentStep - 1].title}
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Step 1: Wallet Connection */}
              {currentStep === 1 && (
                <div className="space-y-4 animate-fade-in">
                  <div className="text-center mb-6">
                    <div className="flex justify-center mb-4">
                      <div className="p-3 rounded-full bg-[#3A8F4C]/10">
                        <Wallet className="h-8 w-8 text-[#3A8F4C]" />
                      </div>
                    </div>
                    <h3 className="text-lg font-semibold">
                      Connectez votre portefeuille Cardano
                    </h3>
                    <p className="text-sm text-muted-foreground mt-2">
                      Connectez votre portefeuille pour sécuriser votre compte
                    </p>
                    {connected && address && (
                      <div className="mt-4 p-3 rounded-lg border bg-muted/50">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <CheckCircle2 className="h-4 w-4 text-green-500" />
                            <div>
                              <p className="text-sm font-medium">
                                Wallet connecté : {walletName}
                              </p>
                              <p className="text-xs text-muted-foreground font-mono">
                                {address.slice(0, 10)}...{address.slice(-8)}
                              </p>
                            </div>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={handleWalletDisconnect}
                            className="h-8"
                          >
                            <LogOut className="h-4 w-4 mr-1" />
                            Déconnecter
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="space-y-3">
                    {connected && address ? (
                      <div className="space-y-4">
                        <div className="text-center py-4">
                          <CheckCircle2 className="h-10 w-10 text-green-500 mx-auto mb-3" />
                          <p className="font-medium mb-1">
                            Wallet connecté avec succès !
                          </p>
                          <p className="text-sm text-muted-foreground mb-4">
                            {walletName} • {address.slice(0, 10)}...
                            {address.slice(-8)}
                          </p>
                        </div>

                        {/* Option pour changer de wallet */}
                        <div className="border-t pt-4">
                          <p className="text-sm font-medium mb-3 text-center text-muted-foreground">
                            Vous souhaitez changer de wallet ?
                          </p>
                          <div className="space-y-2">
                            {availableWallets
                              .filter((name) => name !== walletName)
                              .map((name) => (
                                <button
                                  key={name}
                                  type="button"
                                  onClick={() => handleWalletConnect(name)}
                                  disabled={isConnecting}
                                  className="w-full p-3 rounded-lg border hover:bg-accent transition-colors text-left flex items-center justify-between group disabled:opacity-50"
                                >
                                  <div className="flex items-center gap-3">
                                    <Wallet className="h-5 w-5 text-[#3A8F4C]" />
                                    <span className="font-medium">{name}</span>
                                  </div>
                                  {isConnecting ? (
                                    <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                                  ) : (
                                    <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-foreground group-hover:translate-x-1 transition-transform" />
                                  )}
                                </button>
                              ))}
                            {availableWallets.filter(
                              (name) => name !== walletName
                            ).length === 0 && (
                              <p className="text-xs text-center text-muted-foreground py-2">
                                Aucun autre wallet disponible
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    ) : availableWallets.length === 0 ? (
                      <div className="text-center py-6">
                        <Wallet className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                        <p className="text-sm font-medium mb-1">
                          Aucun portefeuille Cardano détecté
                        </p>
                        <p className="text-xs text-muted-foreground mb-4">
                          Veuillez installer un portefeuille Cardano (Nami,
                          Eternl, etc.)
                        </p>
                      </div>
                    ) : (
                      <>
                        {availableWallets.map((name) => (
                          <button
                            key={name}
                            type="button"
                            onClick={() => handleWalletConnect(name)}
                            disabled={isConnecting}
                            className="w-full p-4 rounded-lg border hover:bg-accent transition-colors text-left flex items-center justify-between group disabled:opacity-50"
                          >
                            <div className="flex items-center gap-3">
                              <Wallet className="h-5 w-5 text-[#3A8F4C]" />
                              <span className="font-medium">{name}</span>
                            </div>
                            {isConnecting ? (
                              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                            ) : (
                              <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-foreground group-hover:translate-x-1 transition-transform" />
                            )}
                          </button>
                        ))}
                      </>
                    )}
                  </div>

                  <div className="mt-4 text-center">
                    <p className="text-xs text-muted-foreground">
                      Sécurisé par la blockchain Cardano
                    </p>
                  </div>
                </div>
              )}

              {/* Step 2: Informations personnelles et sécurité */}
              {currentStep === 2 && (
                <div className="space-y-4 animate-fade-in">
                  <div className="mb-4 p-3 rounded-lg bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800">
                    <p className="text-sm text-blue-900 dark:text-blue-100">
                      💡 <strong>Astuce :</strong> Vous pourrez ajouter
                      d&apos;autres informations (téléphone, adresse, etc.) plus
                      tard dans votre profil.
                    </p>
                  </div>

                  <Field>
                    <FieldLabel htmlFor="fullName">Nom complet *</FieldLabel>
                    <FieldContent>
                      <Input
                        id="fullName"
                        type="text"
                        placeholder="Jean Mukendi"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        required
                        className="border-[#004D73]/20 focus:border-[#3A8F4C] focus:ring-[#3A8F4C]/20"
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Prénom et nom séparés par un espace
                      </p>
                    </FieldContent>
                  </Field>

                  <Field>
                    <FieldLabel htmlFor="email">Email *</FieldLabel>
                    <FieldContent>
                      <Input
                        id="email"
                        type="email"
                        placeholder="votre@email.com"
                        value={formData.email}
                        onChange={(e) => handleChange("email", e.target.value)}
                        required
                        className="border-[#004D73]/20 focus:border-[#3A8F4C] focus:ring-[#3A8F4C]/20"
                      />
                    </FieldContent>
                  </Field>

                  <div className="pt-4 border-t">
                    <h4 className="font-semibold text-sm mb-4 text-[#5A3E36] dark:text-white">
                      Sécurité
                    </h4>

                    <Field>
                      <FieldLabel htmlFor="password">Mot de passe *</FieldLabel>
                      <FieldContent>
                        <div className="relative">
                          <Input
                            id="password"
                            type={showPassword ? "text" : "password"}
                            placeholder="••••••••"
                            value={formData.password}
                            onChange={(e) =>
                              handleChange("password", e.target.value)
                            }
                            required
                            minLength={8}
                            className="border-[#004D73]/20 focus:border-[#3A8F4C] focus:ring-[#3A8F4C]/20 pr-10"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                          >
                            {showPassword ? (
                              <svg
                                className="h-4 w-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                                />
                              </svg>
                            ) : (
                              <svg
                                className="h-4 w-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                />
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                                />
                              </svg>
                            )}
                          </button>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          Minimum 8 caractères
                        </p>
                      </FieldContent>
                    </Field>

                    <Field>
                      <FieldLabel htmlFor="confirmPassword">
                        Confirmer le mot de passe *
                      </FieldLabel>
                      <FieldContent>
                        <Input
                          id="confirmPassword"
                          type={showPassword ? "text" : "password"}
                          placeholder="••••••••"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          required
                          className="border-[#004D73]/20 focus:border-[#3A8F4C] focus:ring-[#3A8F4C]/20"
                        />
                      </FieldContent>
                    </Field>
                  </div>
                </div>
              )}
              {connected && address && (
                <div className=" ">
                  <div className="flex items-center justify-between px-4  rounded-lg bg-green-500/5">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="w-2 h-2 rounded-full bg-green-300 dark:bg-green-400 shrink-0 animate-pulse" />
                      <span className="text-white text-sm font-medium truncate">
                        Wallet Connected: {address.slice(0, 10)}...
                        {address.slice(-8)}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={handleCopyAddress}
                      className="ml-3 p-1.5 rounded hover:bg-white/20 transition-colors shrink-0"
                      title="Copier l'adresse"
                    >
                      {copied ? (
                        <Check className="h-4 w-4 text-green-200" />
                      ) : (
                        <Copy className="h-4 w-4 text-white/80" />
                      )}
                    </button>
                  </div>
                </div>
              )}
              {/* Navigation Buttons */}
              <div className="flex items-center justify-between pt-6 border-t">
                {currentStep > 1 ? (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handlePrevious}
                    disabled={registerMutation.isPending}
                    className="flex items-center gap-2"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Précédent
                  </Button>
                ) : (
                  <div />
                )}

                <div className="flex items-center gap-2">
                  {currentStep === 1 && connected && address ? (
                    <Button
                      type="button"
                      onClick={handleNext}
                      disabled={registerMutation.isPending}
                      className="bg-[#3A8F4C] hover:bg-[#2E7D32] text-white flex items-center gap-2"
                    >
                      Continuer
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  ) : currentStep === 2 ? (
                    <Button
                      type="submit"
                      disabled={registerMutation.isPending}
                      className="bg-[#3A8F4C] hover:bg-[#2E7D32] text-white font-medium shadow-md hover:shadow-lg transition-all duration-200"
                    >
                      {registerMutation.isPending ? (
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
                          Création en cours...
                        </span>
                      ) : (
                        "Créer mon compte"
                      )}
                    </Button>
                  ) : null}
                </div>
              </div>

              {/* Options alternatives - seulement sur la première étape */}
              {currentStep === 1 && (
                <>
                  <div className="relative pt-4">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t border-[#004D73]/20 dark:border-white/20"></span>
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-white dark:bg-[#003D5C] px-2 text-[#5A3E36] dark:text-white/90">
                        Ou
                      </span>
                    </div>
                  </div>

                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleGoogleSignUp}
                    disabled={registerMutation.isPending}
                    className="w-full border-[#004D73]/20 dark:border-white/20 hover:bg-[#E3F2FD] dark:hover:bg-white/10 hover:border-[#004D73]/40 dark:hover:border-white/30 text-[#5A3E36] dark:text-white/90 transition-all duration-200"
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
                    S&apos;inscrire avec Google
                  </Button>

                  <div className="text-center text-sm text-[#5A3E36] dark:text-white/90">
                    Vous avez déjà un compte?{" "}
                    <Link
                      href="/login"
                      className="font-medium text-[#3A8F4C] dark:text-[#3A8F4C] hover:text-[#2E7D32] dark:hover:text-[#2E7D32] transition-colors"
                    >
                      Se connecter
                    </Link>
                  </div>
                </>
              )}
            </form>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="mt-8 text-center text-xs text-[#004D73]/70 dark:text-white/60 animate-fade-in animation-delay-300">
          <p>
            En créant un compte, vous acceptez nos{" "}
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
