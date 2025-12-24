"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
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
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Lock,
  Bell,
  Globe,
  CreditCard,
  Shield,
  Trash2,
  Save,
  Camera,
  ArrowLeft,
  Eye,
  EyeOff,
  Key,
  Smartphone,
  Mail as MailIcon,
  Plus,
  Wallet,
  Coins,
  RefreshCw,
  Copy,
  Check,
} from "lucide-react";
import { useCardanoWallet } from "@/hooks/use-cardano-wallet";
import { useWalletData } from "@/components/wallet/hooks/use-wallet-data";
import { STORAGE_KEYS } from "@/components/wallet/constants";
import { ThemeToggle } from "@/components/theme-toggle";
import { LanguageSelector } from "@/components/language-selector";
import { cn } from "@/lib/utils";

export default function SettingsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [activeSection, setActiveSection] = useState<string>(
    searchParams.get("section") || "profile"
  );
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isBalanceVisible, setIsBalanceVisible] = useState(true);
  const [copied, setCopied] = useState(false);

  // Wallet hooks
  const {
    connected,
    wallet,
    name: walletName,
    address: walletAddress,
  } = useCardanoWallet();

  const saveToStorage = useCallback(
    (key: keyof typeof STORAGE_KEYS, value: string) => {
      if (typeof window !== "undefined") {
        localStorage.setItem(STORAGE_KEYS[key], value);
      }
    },
    []
  );

  const { walletData } = useWalletData({
    connected,
    wallet: wallet as any, // Type assertion for compatibility
    saveToStorage,
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [preferences, setPreferences] = useState({
    emailNotifications: true,
    smsNotifications: false,
    marketingEmails: false,
    orderUpdates: true,
    priceAlerts: true,
    newsletter: false,
  });

  // Initialiser les données du profil depuis la session
  const initialProfileData = session?.user
    ? {
        name: session.user.name || "",
        email: session.user.email || "",
        phone: "",
        address: "",
        city: "",
        country: "RDC",
        postalCode: "",
      }
    : {
        name: "",
        email: "",
        phone: "",
        address: "",
        city: "",
        country: "RDC",
        postalCode: "",
      };

  const [profileData, setProfileData] = useState(initialProfileData);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-white dark:bg-[#004D73] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#3A8F4C]"></div>
      </div>
    );
  }

  if (!session?.user) {
    return null;
  }

  const user = session.user;
  const initials = user.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : user.email?.[0].toUpperCase() || "U";

  const hasImage = user.image && user.image.length > 0;

  const sections = [
    { id: "profile", label: "Profil", icon: User },
    { id: "security", label: "Sécurité", icon: Lock },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "payment", label: "Paiement", icon: CreditCard },
    { id: "preferences", label: "Préférences", icon: Globe },
  ];

  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement API call to update profile
    console.log("Updating profile:", profileData);
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert("Les mots de passe ne correspondent pas");
      return;
    }
    // TODO: Implement API call to update password
    console.log("Updating password");
    setPasswordData({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
  };

  const handlePreferenceChange = (key: string, value: boolean) => {
    setPreferences((prev) => ({ ...prev, [key]: value }));
    // TODO: Implement API call to save preferences
  };

  const handleCopyAddress = () => {
    if (walletData.address) {
      navigator.clipboard.writeText(walletData.address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const formatAddress = (address: string | null | undefined): string => {
    if (!address) return "";
    if (address.length <= 12) return address;
    return `${address.slice(0, 6)}...${address.slice(-6)}`;
  };

  return (
    <div className="min-h-screen bg-white dark:bg-[#004D73]">
      {/* Settings Content */}
      <div className="pt-24 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto max-w-6xl">
          {/* Header */}
          <div className="mb-8">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 text-[#004D73] dark:text-white/70 hover:text-[#3A8F4C] dark:hover:text-[#3A8F4C] transition-colors mb-4"
            >
              <ArrowLeft className="w-4 h-4" />
              Retour au dashboard
            </Link>
            <h1 className="text-3xl font-bold text-[#5A3E36] dark:text-white mb-2">
              Paramètres
            </h1>
            <p className="text-[#004D73] dark:text-white/70">
              Gérez vos préférences et informations de compte
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Sidebar */}
            <div className="lg:col-span-1">
              <Card className="bg-white dark:bg-[#003D5C] border-[#004D73]/20 dark:border-white/20 sticky top-24">
                <CardContent className="p-0">
                  <nav className="space-y-1 p-2">
                    {sections.map((section) => {
                      const Icon = section.icon;
                      return (
                        <button
                          key={section.id}
                          onClick={() => setActiveSection(section.id)}
                          className={cn(
                            "w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all",
                            activeSection === section.id
                              ? "bg-[#3A8F4C] text-white"
                              : "text-[#5A3E36] dark:text-white/90 hover:bg-[#E8F5E9] dark:hover:bg-white/10"
                          )}
                        >
                          <Icon className="w-4 h-4" />
                          {section.label}
                        </button>
                      );
                    })}
                  </nav>
                </CardContent>
              </Card>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-3 space-y-6">
              {/* Profile Section */}
              {activeSection === "profile" && (
                <Card className="bg-white dark:bg-[#003D5C] border-[#004D73]/20 dark:border-white/20">
                  <CardHeader>
                    <CardTitle className="text-[#5A3E36] dark:text-white">
                      Informations du profil
                    </CardTitle>
                    <CardDescription className="text-[#004D73] dark:text-white/70">
                      Mettez à jour vos informations personnelles
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleProfileSubmit} className="space-y-6">
                      {/* Avatar */}
                      <div className="flex items-center gap-6">
                        <Avatar className="w-24 h-24 border-4 border-[#3A8F4C]/20 dark:border-white/20">
                          {hasImage ? (
                            <AvatarImage
                              src={user.image || undefined}
                              alt={user.name || "User"}
                              className="object-cover"
                            />
                          ) : null}
                          <AvatarFallback className="bg-[#3A8F4C]/10 dark:bg-[#3A8F4C]/20 text-[#3A8F4C] dark:text-[#3A8F4C] font-bold text-2xl">
                            {initials}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <Button
                            type="button"
                            variant="outline"
                            className="border-[#004D73]/20 dark:border-white/20 text-[#5A3E36] dark:text-white/90"
                          >
                            <Camera className="w-4 h-4 mr-2" />
                            Changer la photo
                          </Button>
                          <p className="text-xs text-[#004D73] dark:text-white/70 mt-2">
                            JPG, PNG ou GIF. Max 2MB
                          </p>
                        </div>
                      </div>

                      <Separator className="bg-[#004D73]/10 dark:bg-white/10" />

                      {/* Form Fields */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label
                            htmlFor="name"
                            className="text-[#5A3E36] dark:text-white/90"
                          >
                            Nom complet
                          </Label>
                          <div className="relative">
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#004D73]/60 dark:text-white/60" />
                            <Input
                              id="name"
                              type="text"
                              value={profileData.name}
                              onChange={(e) =>
                                setProfileData({
                                  ...profileData,
                                  name: e.target.value,
                                })
                              }
                              className="pl-10 border-[#004D73]/20 dark:border-white/20 bg-white dark:bg-[#004D73] text-[#5A3E36] dark:text-white/90"
                              placeholder="Votre nom"
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label
                            htmlFor="email"
                            className="text-[#5A3E36] dark:text-white/90"
                          >
                            Email
                          </Label>
                          <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#004D73]/60 dark:text-white/60" />
                            <Input
                              id="email"
                              type="email"
                              value={profileData.email}
                              onChange={(e) =>
                                setProfileData({
                                  ...profileData,
                                  email: e.target.value,
                                })
                              }
                              className="pl-10 border-[#004D73]/20 dark:border-white/20 bg-white dark:bg-[#004D73] text-[#5A3E36] dark:text-white/90"
                              placeholder="votre@email.com"
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label
                            htmlFor="phone"
                            className="text-[#5A3E36] dark:text-white/90"
                          >
                            Téléphone
                          </Label>
                          <div className="relative">
                            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#004D73]/60 dark:text-white/60" />
                            <Input
                              id="phone"
                              type="tel"
                              value={profileData.phone}
                              onChange={(e) =>
                                setProfileData({
                                  ...profileData,
                                  phone: e.target.value,
                                })
                              }
                              className="pl-10 border-[#004D73]/20 dark:border-white/20 bg-white dark:bg-[#004D73] text-[#5A3E36] dark:text-white/90"
                              placeholder="+243 XXX XXX XXX"
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label
                            htmlFor="country"
                            className="text-[#5A3E36] dark:text-white/90"
                          >
                            Pays
                          </Label>
                          <div className="relative">
                            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#004D73]/60 dark:text-white/60" />
                            <Input
                              id="country"
                              type="text"
                              value={profileData.country}
                              onChange={(e) =>
                                setProfileData({
                                  ...profileData,
                                  country: e.target.value,
                                })
                              }
                              className="pl-10 border-[#004D73]/20 dark:border-white/20 bg-white dark:bg-[#004D73] text-[#5A3E36] dark:text-white/90"
                              placeholder="Pays"
                            />
                          </div>
                        </div>

                        <div className="space-y-2 md:col-span-2">
                          <Label
                            htmlFor="address"
                            className="text-[#5A3E36] dark:text-white/90"
                          >
                            Adresse
                          </Label>
                          <div className="relative">
                            <MapPin className="absolute left-3 top-3 w-4 h-4 text-[#004D73]/60 dark:text-white/60" />
                            <Input
                              id="address"
                              type="text"
                              value={profileData.address}
                              onChange={(e) =>
                                setProfileData({
                                  ...profileData,
                                  address: e.target.value,
                                })
                              }
                              className="pl-10 border-[#004D73]/20 dark:border-white/20 bg-white dark:bg-[#004D73] text-[#5A3E36] dark:text-white/90"
                              placeholder="Adresse complète"
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label
                            htmlFor="city"
                            className="text-[#5A3E36] dark:text-white/90"
                          >
                            Ville
                          </Label>
                          <Input
                            id="city"
                            type="text"
                            value={profileData.city}
                            onChange={(e) =>
                              setProfileData({
                                ...profileData,
                                city: e.target.value,
                              })
                            }
                            className="border-[#004D73]/20 dark:border-white/20 bg-white dark:bg-[#004D73] text-[#5A3E36] dark:text-white/90"
                            placeholder="Ville"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label
                            htmlFor="postalCode"
                            className="text-[#5A3E36] dark:text-white/90"
                          >
                            Code postal
                          </Label>
                          <Input
                            id="postalCode"
                            type="text"
                            value={profileData.postalCode}
                            onChange={(e) =>
                              setProfileData({
                                ...profileData,
                                postalCode: e.target.value,
                              })
                            }
                            className="border-[#004D73]/20 dark:border-white/20 bg-white dark:bg-[#004D73] text-[#5A3E36] dark:text-white/90"
                            placeholder="Code postal"
                          />
                        </div>
                      </div>

                      <Separator className="bg-[#004D73]/10 dark:bg-white/10" />

                      <div className="flex justify-end">
                        <Button
                          type="submit"
                          className="bg-[#3A8F4C] hover:bg-[#2E7D32] text-white"
                        >
                          <Save className="w-4 h-4 mr-2" />
                          Enregistrer les modifications
                        </Button>
                      </div>
                    </form>
                  </CardContent>
                </Card>
              )}

              {/* Security Section */}
              {activeSection === "security" && (
                <div className="space-y-6">
                  <Card className="bg-white dark:bg-[#003D5C] border-[#004D73]/20 dark:border-white/20">
                    <CardHeader>
                      <CardTitle className="text-[#5A3E36] dark:text-white">
                        Changer le mot de passe
                      </CardTitle>
                      <CardDescription className="text-[#004D73] dark:text-white/70">
                        Mettez à jour votre mot de passe pour sécuriser votre
                        compte
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <form
                        onSubmit={handlePasswordSubmit}
                        className="space-y-4"
                      >
                        <div className="space-y-2">
                          <Label
                            htmlFor="currentPassword"
                            className="text-[#5A3E36] dark:text-white/90"
                          >
                            Mot de passe actuel
                          </Label>
                          <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#004D73]/60 dark:text-white/60" />
                            <Input
                              id="currentPassword"
                              type={showPassword ? "text" : "password"}
                              value={passwordData.currentPassword}
                              onChange={(e) =>
                                setPasswordData({
                                  ...passwordData,
                                  currentPassword: e.target.value,
                                })
                              }
                              className="pl-10 pr-10 border-[#004D73]/20 dark:border-white/20 bg-white dark:bg-[#004D73] text-[#5A3E36] dark:text-white/90"
                              placeholder="Entrez votre mot de passe actuel"
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#004D73]/60 dark:text-white/60 hover:text-[#5A3E36] dark:hover:text-white"
                            >
                              {showPassword ? (
                                <EyeOff className="w-4 h-4" />
                              ) : (
                                <Eye className="w-4 h-4" />
                              )}
                            </button>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label
                            htmlFor="newPassword"
                            className="text-[#5A3E36] dark:text-white/90"
                          >
                            Nouveau mot de passe
                          </Label>
                          <div className="relative">
                            <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#004D73]/60 dark:text-white/60" />
                            <Input
                              id="newPassword"
                              type={showNewPassword ? "text" : "password"}
                              value={passwordData.newPassword}
                              onChange={(e) =>
                                setPasswordData({
                                  ...passwordData,
                                  newPassword: e.target.value,
                                })
                              }
                              className="pl-10 pr-10 border-[#004D73]/20 dark:border-white/20 bg-white dark:bg-[#004D73] text-[#5A3E36] dark:text-white/90"
                              placeholder="Entrez votre nouveau mot de passe"
                            />
                            <button
                              type="button"
                              onClick={() =>
                                setShowNewPassword(!showNewPassword)
                              }
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#004D73]/60 dark:text-white/60 hover:text-[#5A3E36] dark:hover:text-white"
                            >
                              {showNewPassword ? (
                                <EyeOff className="w-4 h-4" />
                              ) : (
                                <Eye className="w-4 h-4" />
                              )}
                            </button>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label
                            htmlFor="confirmPassword"
                            className="text-[#5A3E36] dark:text-white/90"
                          >
                            Confirmer le mot de passe
                          </Label>
                          <div className="relative">
                            <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#004D73]/60 dark:text-white/60" />
                            <Input
                              id="confirmPassword"
                              type={showConfirmPassword ? "text" : "password"}
                              value={passwordData.confirmPassword}
                              onChange={(e) =>
                                setPasswordData({
                                  ...passwordData,
                                  confirmPassword: e.target.value,
                                })
                              }
                              className="pl-10 pr-10 border-[#004D73]/20 dark:border-white/20 bg-white dark:bg-[#004D73] text-[#5A3E36] dark:text-white/90"
                              placeholder="Confirmez votre nouveau mot de passe"
                            />
                            <button
                              type="button"
                              onClick={() =>
                                setShowConfirmPassword(!showConfirmPassword)
                              }
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#004D73]/60 dark:text-white/60 hover:text-[#5A3E36] dark:hover:text-white"
                            >
                              {showConfirmPassword ? (
                                <EyeOff className="w-4 h-4" />
                              ) : (
                                <Eye className="w-4 h-4" />
                              )}
                            </button>
                          </div>
                        </div>

                        <div className="flex justify-end">
                          <Button
                            type="submit"
                            className="bg-[#3A8F4C] hover:bg-[#2E7D32] text-white"
                          >
                            <Save className="w-4 h-4 mr-2" />
                            Mettre à jour le mot de passe
                          </Button>
                        </div>
                      </form>
                    </CardContent>
                  </Card>

                  <Card className="bg-white dark:bg-[#003D5C] border-[#004D73]/20 dark:border-white/20">
                    <CardHeader>
                      <CardTitle className="text-[#5A3E36] dark:text-white">
                        Authentification à deux facteurs
                      </CardTitle>
                      <CardDescription className="text-[#004D73] dark:text-white/70">
                        Ajoutez une couche de sécurité supplémentaire à votre
                        compte
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="p-3 rounded-lg bg-[#3A8F4C]/10 dark:bg-[#3A8F4C]/20">
                            <Shield className="w-5 h-5 text-[#3A8F4C]" />
                          </div>
                          <div>
                            <p className="font-medium text-[#5A3E36] dark:text-white">
                              2FA activé
                            </p>
                            <p className="text-sm text-[#004D73] dark:text-white/70">
                              Protection supplémentaire activée
                            </p>
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          className="border-[#004D73]/20 dark:border-white/20"
                        >
                          Configurer
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-white dark:bg-[#003D5C] border-red-200 dark:border-red-900/30">
                    <CardHeader>
                      <CardTitle className="text-red-600 dark:text-red-400">
                        Zone de danger
                      </CardTitle>
                      <CardDescription className="text-[#004D73] dark:text-white/70">
                        Actions irréversibles sur votre compte
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 rounded-lg border border-red-200 dark:border-red-900/30 bg-red-50 dark:bg-red-950/20">
                          <div>
                            <p className="font-medium text-red-600 dark:text-red-400">
                              Supprimer le compte
                            </p>
                            <p className="text-sm text-red-600/70 dark:text-red-400/70">
                              Cette action est permanente et ne peut pas être
                              annulée
                            </p>
                          </div>
                          <Button
                            variant="outline"
                            className="border-red-300 dark:border-red-800 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30"
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Supprimer
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Notifications Section */}
              {activeSection === "notifications" && (
                <Card className="bg-white dark:bg-[#003D5C] border-[#004D73]/20 dark:border-white/20">
                  <CardHeader>
                    <CardTitle className="text-[#5A3E36] dark:text-white">
                      Préférences de notification
                    </CardTitle>
                    <CardDescription className="text-[#004D73] dark:text-white/70">
                      Gérez comment et quand vous recevez des notifications
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 rounded-lg border border-[#004D73]/10 dark:border-white/10">
                        <div className="flex items-center gap-3">
                          <MailIcon className="w-5 h-5 text-[#3A8F4C]" />
                          <div>
                            <p className="font-medium text-[#5A3E36] dark:text-white">
                              Notifications par email
                            </p>
                            <p className="text-sm text-[#004D73] dark:text-white/70">
                              Recevoir des notifications par email
                            </p>
                          </div>
                        </div>
                        <Switch
                          checked={preferences.emailNotifications}
                          onCheckedChange={(checked) =>
                            handlePreferenceChange(
                              "emailNotifications",
                              checked
                            )
                          }
                        />
                      </div>

                      <div className="flex items-center justify-between p-4 rounded-lg border border-[#004D73]/10 dark:border-white/10">
                        <div className="flex items-center gap-3">
                          <Smartphone className="w-5 h-5 text-[#3A8F4C]" />
                          <div>
                            <p className="font-medium text-[#5A3E36] dark:text-white">
                              Notifications SMS
                            </p>
                            <p className="text-sm text-[#004D73] dark:text-white/70">
                              Recevoir des notifications par SMS
                            </p>
                          </div>
                        </div>
                        <Switch
                          checked={preferences.smsNotifications}
                          onCheckedChange={(checked) =>
                            handlePreferenceChange("smsNotifications", checked)
                          }
                        />
                      </div>

                      <div className="flex items-center justify-between p-4 rounded-lg border border-[#004D73]/10 dark:border-white/10">
                        <div className="flex items-center gap-3">
                          <Bell className="w-5 h-5 text-[#3A8F4C]" />
                          <div>
                            <p className="font-medium text-[#5A3E36] dark:text-white">
                              Mises à jour de commande
                            </p>
                            <p className="text-sm text-[#004D73] dark:text-white/70">
                              Notifications sur le statut de vos commandes
                            </p>
                          </div>
                        </div>
                        <Switch
                          checked={preferences.orderUpdates}
                          onCheckedChange={(checked) =>
                            handlePreferenceChange("orderUpdates", checked)
                          }
                        />
                      </div>

                      <div className="flex items-center justify-between p-4 rounded-lg border border-[#004D73]/10 dark:border-white/10">
                        <div className="flex items-center gap-3">
                          <Bell className="w-5 h-5 text-[#3A8F4C]" />
                          <div>
                            <p className="font-medium text-[#5A3E36] dark:text-white">
                              Alertes de prix
                            </p>
                            <p className="text-sm text-[#004D73] dark:text-white/70">
                              Notifications lorsque les prix de vos favoris
                              changent
                            </p>
                          </div>
                        </div>
                        <Switch
                          checked={preferences.priceAlerts}
                          onCheckedChange={(checked) =>
                            handlePreferenceChange("priceAlerts", checked)
                          }
                        />
                      </div>

                      <Separator className="bg-[#004D73]/10 dark:bg-white/10" />

                      <div className="flex items-center justify-between p-4 rounded-lg border border-[#004D73]/10 dark:border-white/10">
                        <div className="flex items-center gap-3">
                          <MailIcon className="w-5 h-5 text-[#3A8F4C]" />
                          <div>
                            <p className="font-medium text-[#5A3E36] dark:text-white">
                              Emails marketing
                            </p>
                            <p className="text-sm text-[#004D73] dark:text-white/70">
                              Recevoir des offres et promotions
                            </p>
                          </div>
                        </div>
                        <Switch
                          checked={preferences.marketingEmails}
                          onCheckedChange={(checked) =>
                            handlePreferenceChange("marketingEmails", checked)
                          }
                        />
                      </div>

                      <div className="flex items-center justify-between p-4 rounded-lg border border-[#004D73]/10 dark:border-white/10">
                        <div className="flex items-center gap-3">
                          <MailIcon className="w-5 h-5 text-[#3A8F4C]" />
                          <div>
                            <p className="font-medium text-[#5A3E36] dark:text-white">
                              Newsletter
                            </p>
                            <p className="text-sm text-[#004D73] dark:text-white/70">
                              Recevoir notre newsletter hebdomadaire
                            </p>
                          </div>
                        </div>
                        <Switch
                          checked={preferences.newsletter}
                          onCheckedChange={(checked) =>
                            handlePreferenceChange("newsletter", checked)
                          }
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Payment Section */}
              {activeSection === "payment" && (
                <div className="space-y-6">
                  <Card className="bg-white dark:bg-[#003D5C] border-[#004D73]/20 dark:border-white/20">
                    <CardHeader>
                      <CardTitle className="text-[#5A3E36] dark:text-white">
                        Méthodes de paiement
                      </CardTitle>
                      <CardDescription className="text-[#004D73] dark:text-white/70">
                        Gérez vos méthodes de paiement préférées
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {/* ADA Payment Method */}
                        <div className="p-4 rounded-lg border-2 border-[#3A8F4C]/30 dark:border-[#3A8F4C]/50 bg-[#3A8F4C]/5 dark:bg-[#3A8F4C]/10">
                          <div className="space-y-4">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-[#3A8F4C] dark:bg-[#3A8F4C]">
                                  <Coins className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                  <div className="flex items-center gap-2">
                                    <p className="font-semibold text-[#5A3E36] dark:text-white">
                                      ADA (Cardano)
                                    </p>
                                    <span className="px-2 py-0.5 text-xs font-medium rounded bg-[#3A8F4C] text-white">
                                      Par défaut
                                    </span>
                                  </div>
                                  <p className="text-sm text-[#004D73] dark:text-white/70 mt-1">
                                    Paiement en cryptomonnaie Cardano
                                  </p>
                                </div>
                              </div>
                              {!connected && (
                                <Button
                                  variant="outline"
                                  className="border-[#3A8F4C] text-[#3A8F4C] hover:bg-[#3A8F4C] hover:text-white"
                                >
                                  <Wallet className="w-4 h-4 mr-2" />
                                  Connecter Wallet
                                </Button>
                              )}
                            </div>

                            {/* Wallet Info if Connected */}
                            {connected && walletData && (
                              <>
                                <Separator className="bg-[#3A8F4C]/20 dark:bg-[#3A8F4C]/30" />

                                {/* Wallet Name */}
                                <div className="flex items-center justify-between">
                                  <div>
                                    <p className="text-xs text-[#004D73] dark:text-white/70 mb-1">
                                      Wallet connecté
                                    </p>
                                    <p className="font-medium text-[#5A3E36] dark:text-white">
                                      {walletName || "Cardano Wallet"}
                                    </p>
                                  </div>
                                  <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-[#3A8F4C]/20 dark:bg-[#3A8F4C]/30">
                                    <div className="w-2 h-2 rounded-full bg-[#3A8F4C] animate-pulse" />
                                    <span className="text-xs font-medium text-[#3A8F4C]">
                                      Connecté
                                    </span>
                                  </div>
                                </div>

                                {/* Balance */}
                                <div className="p-3 rounded-lg bg-white/50 dark:bg-[#004D73]/30 border border-[#3A8F4C]/20 dark:border-[#3A8F4C]/30">
                                  <div className="flex items-center justify-between mb-2">
                                    <p className="text-xs font-medium text-[#004D73] dark:text-white/70">
                                      Solde disponible
                                    </p>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      onClick={() =>
                                        setIsBalanceVisible(!isBalanceVisible)
                                      }
                                      className="h-6 w-6 text-[#004D73] dark:text-white/70 hover:text-[#5A3E36] dark:hover:text-white"
                                    >
                                      {isBalanceVisible ? (
                                        <EyeOff className="w-3.5 h-3.5" />
                                      ) : (
                                        <Eye className="w-3.5 h-3.5" />
                                      )}
                                    </Button>
                                  </div>
                                  {walletData.isLoadingBalance ? (
                                    <div className="flex items-center gap-2">
                                      <RefreshCw className="w-4 h-4 animate-spin text-[#3A8F4C]" />
                                      <span className="text-sm text-[#004D73] dark:text-white/70">
                                        Chargement...
                                      </span>
                                    </div>
                                  ) : (
                                    <div className="flex items-baseline gap-2">
                                      {isBalanceVisible ? (
                                        <>
                                          <p className="text-2xl font-bold text-[#3A8F4C] dark:text-[#3A8F4C]">
                                            {walletData.balance != null &&
                                            typeof walletData.balance ===
                                              "number"
                                              ? walletData.balance.toLocaleString(
                                                  "fr-FR",
                                                  {
                                                    minimumFractionDigits: 2,
                                                    maximumFractionDigits: 6,
                                                  }
                                                )
                                              : "0.00"}
                                          </p>
                                          <span className="text-sm font-medium text-[#004D73] dark:text-white/70">
                                            ADA
                                          </span>
                                        </>
                                      ) : (
                                        <p className="text-2xl font-bold text-[#3A8F4C] dark:text-[#3A8F4C]">
                                          ••••••
                                        </p>
                                      )}
                                    </div>
                                  )}
                                </div>

                                {/* Address */}
                                {walletData.address && (
                                  <div className="p-3 rounded-lg bg-white/50 dark:bg-[#004D73]/30 border border-[#3A8F4C]/20 dark:border-[#3A8F4C]/30">
                                    <div className="flex items-center justify-between mb-2">
                                      <p className="text-xs font-medium text-[#004D73] dark:text-white/70">
                                        Adresse du wallet
                                      </p>
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={handleCopyAddress}
                                        className="h-6 w-6 text-[#004D73] dark:text-white/70 hover:text-[#3A8F4C]"
                                        title="Copier l'adresse"
                                      >
                                        {copied ? (
                                          <Check className="w-3.5 h-3.5 text-[#3A8F4C]" />
                                        ) : (
                                          <Copy className="w-3.5 h-3.5" />
                                        )}
                                      </Button>
                                    </div>
                                    <p className="text-xs font-mono text-[#5A3E36] dark:text-white/90 break-all">
                                      {formatAddress(walletData.address)}
                                    </p>
                                  </div>
                                )}
                              </>
                            )}
                          </div>
                        </div>

                        {/* Mobile Money Methods */}
                        <div className="space-y-3">
                          <div className="flex items-center gap-2 mb-3">
                            <Smartphone className="w-4 h-4 text-[#004D73] dark:text-white/70" />
                            <h3 className="font-semibold text-[#5A3E36] dark:text-white">
                              Mobile Money
                            </h3>
                          </div>

                          {/* Airtel Money */}
                          <div className="p-4 rounded-lg border border-[#004D73]/10 dark:border-white/10 hover:border-[#E60012] dark:hover:border-[#E60012] transition-colors">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-[#E60012]/10 dark:bg-[#E60012]/20">
                                  <div className="w-5 h-5 rounded bg-[#E60012] flex items-center justify-center">
                                    <span className="text-white text-xs font-bold">
                                      A
                                    </span>
                                  </div>
                                </div>
                                <div>
                                  <p className="font-medium text-[#5A3E36] dark:text-white">
                                    Airtel Money
                                  </p>
                                  <p className="text-sm text-[#004D73] dark:text-white/70">
                                    +243 XXX XXX XXX
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                          </div>

                          {/* Orange Money */}
                          <div className="p-4 rounded-lg border border-[#004D73]/10 dark:border-white/10 hover:border-[#FF6600] dark:hover:border-[#FF6600] transition-colors">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-[#FF6600]/10 dark:bg-[#FF6600]/20">
                                  <div className="w-5 h-5 rounded bg-[#FF6600] flex items-center justify-center">
                                    <span className="text-white text-xs font-bold">
                                      O
                                    </span>
                                  </div>
                                </div>
                                <div>
                                  <p className="font-medium text-[#5A3E36] dark:text-white">
                                    Orange Money
                                  </p>
                                  <p className="text-sm text-[#004D73] dark:text-white/70">
                                    +243 XXX XXX XXX
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                          </div>

                          {/* Vodacom M-Pesa */}
                          <div className="p-4 rounded-lg border border-[#004D73]/10 dark:border-white/10 hover:border-[#E60000] dark:hover:border-[#E60000] transition-colors">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-[#E60000]/10 dark:bg-[#E60000]/20">
                                  <div className="w-5 h-5 rounded bg-[#E60000] flex items-center justify-center">
                                    <span className="text-white text-xs font-bold">
                                      V
                                    </span>
                                  </div>
                                </div>
                                <div>
                                  <p className="font-medium text-[#5A3E36] dark:text-white">
                                    Vodacom M-Pesa
                                  </p>
                                  <p className="text-sm text-[#004D73] dark:text-white/70">
                                    +243 XXX XXX XXX
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>

                        <Separator className="bg-[#004D73]/10 dark:bg-white/10" />

                        <Button
                          variant="outline"
                          className="w-full border-[#004D73]/20 dark:border-white/20 text-[#5A3E36] dark:text-white/90 hover:bg-[#E8F5E9] dark:hover:bg-white/10"
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Ajouter Mobile Money
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Payment Info */}
                  <Card className="bg-[#E8F5E9]/50 dark:bg-[#3A8F4C]/10 border-[#3A8F4C]/20 dark:border-[#3A8F4C]/30">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className="p-2 rounded-lg bg-[#3A8F4C]/20 dark:bg-[#3A8F4C]/30">
                          <Bell className="w-4 h-4 text-[#3A8F4C]" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-[#5A3E36] dark:text-white mb-1">
                            Méthode de paiement par défaut
                          </p>
                          <p className="text-xs text-[#004D73] dark:text-white/70">
                            ADA (Cardano) est votre méthode de paiement par
                            défaut. Vous pouvez changer cela à tout moment lors
                            du checkout.
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Preferences Section */}
              {activeSection === "preferences" && (
                <Card className="bg-white dark:bg-[#003D5C] border-[#004D73]/20 dark:border-white/20">
                  <CardHeader>
                    <CardTitle className="text-[#5A3E36] dark:text-white">
                      Préférences générales
                    </CardTitle>
                    <CardDescription className="text-[#004D73] dark:text-white/70">
                      Personnalisez votre expérience
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="flex items-center justify-between p-4 rounded-lg border border-[#004D73]/10 dark:border-white/10">
                      <div>
                        <p className="font-medium text-[#5A3E36] dark:text-white">
                          Langue
                        </p>
                        <p className="text-sm text-[#004D73] dark:text-white/70">
                          Choisissez votre langue préférée
                        </p>
                      </div>
                      <LanguageSelector />
                    </div>

                    <div className="flex items-center justify-between p-4 rounded-lg border border-[#004D73]/10 dark:border-white/10">
                      <div>
                        <p className="font-medium text-[#5A3E36] dark:text-white">
                          Thème
                        </p>
                        <p className="text-sm text-[#004D73] dark:text-white/70">
                          Choisissez entre le mode clair et sombre
                        </p>
                      </div>
                      <ThemeToggle />
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
