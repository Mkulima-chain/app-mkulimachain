"use client"

import * as React from "react"
import {
  Users,
  Package,
  ShoppingCart,
  Coins,
  TrendingUp,
  Activity,
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

const stats = [
  {
    title: "Agriculteurs",
    value: "1,234",
    change: "+12.5%",
    icon: Users,
    color: "text-[#3A8F4C]",
    bgColor: "bg-[#E8F5E9] dark:bg-[#3A8F4C]/20",
  },
  {
    title: "Produits",
    value: "5,678",
    change: "+8.2%",
    icon: Package,
    color: "text-[#5A3E36]",
    bgColor: "bg-[#F5F0ED] dark:bg-[#5A3E36]/20",
  },
  {
    title: "Commandes",
    value: "892",
    change: "+15.3%",
    icon: ShoppingCart,
    color: "text-[#004D73]",
    bgColor: "bg-[#E3F2FD] dark:bg-[#004D73]/20",
  },
  {
    title: "Revenus",
    value: "₿ 12,450",
    change: "+23.1%",
    icon: Coins,
    color: "text-[#F2C94C]",
    bgColor: "bg-[#FFF8E1] dark:bg-[#F2C94C]/20",
  },
]

const recentActivities = [
  {
    id: 1,
    type: "order",
    title: "Nouvelle commande",
    description: "Commande #1234 de Jean Mukendi",
    time: "Il y a 5 minutes",
    status: "success",
  },
  {
    id: 2,
    type: "product",
    title: "Produit ajouté",
    description: "Cacao premium ajouté par Marie Kabila",
    time: "Il y a 12 minutes",
    status: "info",
  },
  {
    id: 3,
    type: "farmer",
    title: "Nouvel agriculteur",
    description: "Pierre Kasa s'est inscrit",
    time: "Il y a 1 heure",
    status: "success",
  },
  {
    id: 4,
    type: "nft",
    title: "NFT vendu",
    description: "NFT culturel vendu pour 50 ADA",
    time: "Il y a 2 heures",
    status: "success",
  },
]

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Tableau de bord</h1>
        <p className="text-muted-foreground mt-1">
          Vue d'ensemble de votre plateforme Mkulima Chain
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <Card key={stat.title} className="hover:shadow-lg transition-shadow">
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
                  <span className="text-[#3A8F4C]">{stat.change}</span>
                  <span>vs mois dernier</span>
                </div>
              </CardContent>
            </Card>
          )
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
              {recentActivities.map((activity) => (
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
                      {activity.time}
                    </p>
                  </div>
                </div>
              ))}
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
              <CardDescription>
                Statut des services et modules
              </CardDescription>
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
            {[
              { name: "API", status: "online", value: "99.9%" },
              { name: "Base de données", status: "online", value: "100%" },
              { name: "Blockchain", status: "online", value: "99.8%" },
              { name: "Marketplace", status: "online", value: "100%" },
            ].map((service) => (
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
                <div className="h-3 w-3 rounded-full bg-[#3A8F4C]"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
