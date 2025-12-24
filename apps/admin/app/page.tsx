"use client";

import * as React from "react";
import {
  Users,
  Package,
  ShoppingCart,
  Coins,
  TrendingUp,
  Activity,
  User as UserIcon,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getAuth, StoredUser } from "@/lib/auth-storage";
import { api } from "@/lib/api-client";
import { StatsSummary } from "@/types";

type Activity = {
  id: string;
  type: "order" | "product" | "farmer";
  title: string;
  description: string;
  time: string;
  status:
    | "success"
    | "info"
    | "warning"
    | "default"
    | "secondary"
    | "outline"
    | "destructive";
};

export default function DashboardPage() {
  const [user, setUser] = React.useState<StoredUser | undefined>();
  const { data: stats } = useQuery<StatsSummary>({
    queryKey: ["stats", "summary"],
    queryFn: () => api.get<StatsSummary>("/stats/summary"),
  });

  const { data: activities = [] } = useQuery<Activity[]>({
    queryKey: ["stats", "activities"],
    queryFn: () => api.get<Activity[]>("/stats/activities"),
  });

  React.useEffect(() => {
    // Lecture locale uniquement côté client
    const auth = getAuth();
    if (auth?.user) {
      setUser(auth.user);
    }
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Tableau de bord
          </h1>
          <p className="text-muted-foreground mt-1">
            Vue d'ensemble de votre plateforme Mkulima Chain
          </p>
        </div>
        <Card className="min-w-[260px]">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Utilisateur connecté
            </CardTitle>
          </CardHeader>
          <CardContent className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-[#E8F5E9] flex items-center justify-center">
              <UserIcon className="h-5 w-5 text-[#3A8F4C]" />
            </div>
            {user ? (
              <div className="space-y-0.5">
                <p className="text-sm font-semibold">
                  {user.firstName} {user.lastName}
                </p>
                <p className="text-xs text-muted-foreground">{user.email}</p>
                {user.role && (
                  <Badge variant="secondary" className="text-[11px]">
                    {user.role}
                  </Badge>
                )}
              </div>
            ) : (
              <div className="space-y-0.5">
                <p className="text-sm font-semibold">Non connecté</p>
                <p className="text-xs text-muted-foreground">
                  Connectez-vous pour voir vos infos
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[
          {
            title: "Agriculteurs",
            value: stats?.farmers ?? "...",
            icon: Users,
            color: "text-[#3A8F4C]",
            bgColor: "bg-[#E8F5E9] dark:bg-[#3A8F4C]/20",
          },
          {
            title: "Produits",
            value: stats?.products ?? "...",
            icon: Package,
            color: "text-[#5A3E36]",
            bgColor: "bg-[#F5F0ED] dark:bg-[#5A3E36]/20",
          },
          {
            title: "Commandes",
            value: stats?.orders ?? "...",
            icon: ShoppingCart,
            color: "text-[#004D73]",
            bgColor: "bg-[#E3F2FD] dark:bg-[#004D73]/20",
          },
          {
            title: "Revenus (₳)",
            value:
              stats?.revenueAda !== undefined
                ? `${stats.revenueAda.toFixed(2)} ₳`
                : "...",
            icon: Coins,
            color: "text-[#F2C94C]",
            bgColor: "bg-[#FFF8E1] dark:bg-[#F2C94C]/20",
          },
        ].map((stat) => {
          const Icon = stat.icon;
          return (
            <Card
              key={stat.title}
              className="hover:shadow-lg transition-shadow"
            >
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <div className={`${stat.bgColor} p-2 rounded-lg`}>
                  <Icon className={`h-5 w-5 ${stat.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                  <TrendingUp className="h-3 w-3 text-[#3A8F4C]" />
                  <span className="text-[#3A8F4C]">Live</span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        {/* Recent Activities */}
        <Card className="lg:col-span-4">
          <CardHeader>
            <CardTitle>Activités récentes</CardTitle>
            <CardDescription>
              Dernières actions sur la plateforme
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {activities.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Aucune activité récente
                </p>
              ) : (
                activities.map((activity) => (
                  <div
                    key={activity.id}
                    className="flex items-start gap-4 pb-4 border-b last:border-0 last:pb-0"
                  >
                    <div className="mt-1">
                      <div className="h-2 w-2 rounded-full bg-[#3A8F4C]"></div>
                    </div>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium">{activity.title}</p>
                        <Badge
                          variant={
                            activity.status === "success"
                              ? "default"
                              : activity.status === "info"
                                ? "secondary"
                                : "outline"
                          }
                          className="text-xs"
                        >
                          {activity.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {activity.description}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(activity.time).toLocaleDateString()}{" "}
                        {new Date(activity.time).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Actions rapides</CardTitle>
            <CardDescription>
              Accès rapide aux fonctionnalités principales
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <a
                href="/farmers"
                className="flex items-center gap-3 rounded-lg border p-3 hover:bg-accent transition-colors"
              >
                <Users className="h-5 w-5 text-[#3A8F4C]" />
                <div>
                  <p className="text-sm font-medium">Gérer les agriculteurs</p>
                  <p className="text-xs text-muted-foreground">
                    Voir et modifier les profils
                  </p>
                </div>
              </a>
              <a
                href="/products"
                className="flex items-center gap-3 rounded-lg border p-3 hover:bg-accent transition-colors"
              >
                <Package className="h-5 w-5 text-[#5A3E36]" />
                <div>
                  <p className="text-sm font-medium">Gérer les produits</p>
                  <p className="text-xs text-muted-foreground">
                    Ajouter ou modifier des produits
                  </p>
                </div>
              </a>
              <a
                href="/orders"
                className="flex items-center gap-3 rounded-lg border p-3 hover:bg-accent transition-colors"
              >
                <ShoppingCart className="h-5 w-5 text-[#004D73]" />
                <div>
                  <p className="text-sm font-medium">Voir les commandes</p>
                  <p className="text-xs text-muted-foreground">
                    Suivre les commandes en cours
                  </p>
                </div>
              </a>
              <a
                href="/finance"
                className="flex items-center gap-3 rounded-lg border p-3 hover:bg-accent transition-colors"
              >
                <Coins className="h-5 w-5 text-[#F2C94C]" />
                <div>
                  <p className="text-sm font-medium">Finance</p>
                  <p className="text-xs text-muted-foreground">
                    Micro-prêts et transactions
                  </p>
                </div>
              </a>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* System Status */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>État du système</CardTitle>
              <CardDescription>Statut des services et modules</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-[#3A8F4C]" />
              <span className="text-sm font-medium text-[#3A8F4C]">
                Tous les systèmes opérationnels
              </span>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {(
              stats?.systemStatus || [
                { name: "API", status: "online", value: "..." },
                { name: "Base de données", status: "online", value: "..." },
                { name: "Blockchain", status: "online", value: "..." },
                { name: "Marketplace", status: "online", value: "..." },
              ]
            ).map((service) => (
              <div
                key={service.name}
                className="flex items-center justify-between rounded-lg border p-4"
              >
                <div>
                  <p className="text-sm font-medium">{service.name}</p>
                  <p className="text-xs text-muted-foreground">
                    Disponibilité: {service.value}
                  </p>
                </div>
                <div
                  className={`h-3 w-3 rounded-full ${
                    service.status === "online"
                      ? "bg-[#3A8F4C]"
                      : service.status === "degraded"
                        ? "bg-yellow-500"
                        : "bg-red-500"
                  }`}
                ></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
