"use client"

import * as React from "react"
import { Settings, Bell, Shield, Database } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Paramètres</h1>
        <p className="text-muted-foreground mt-1">
          Configurez les paramètres de la plateforme
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <Bell className="h-5 w-5 text-[#3A8F4C]" />
              <CardTitle>Notifications</CardTitle>
            </div>
            <CardDescription>
              Configurez les notifications du système
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Notifications email</p>
                  <p className="text-xs text-muted-foreground">
                    Recevoir des notifications par email
                  </p>
                </div>
                <Button variant="outline" size="sm">
                  Activer
                </Button>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Notifications push</p>
                  <p className="text-xs text-muted-foreground">
                    Recevoir des notifications push
                  </p>
                </div>
                <Button variant="outline" size="sm">
                  Activer
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <Shield className="h-5 w-5 text-[#5A3E36]" />
              <CardTitle>Sécurité</CardTitle>
            </div>
            <CardDescription>
              Paramètres de sécurité et authentification
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Authentification à deux facteurs</p>
                  <p className="text-xs text-muted-foreground">
                    Activer la 2FA pour plus de sécurité
                  </p>
                </div>
                <Button variant="outline" size="sm">
                  Configurer
                </Button>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Sessions actives</p>
                  <p className="text-xs text-muted-foreground">
                    Gérer les sessions actives
                  </p>
                </div>
                <Button variant="outline" size="sm">
                  Voir
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <Database className="h-5 w-5 text-[#004D73]" />
              <CardTitle>Base de données</CardTitle>
            </div>
            <CardDescription>
              Gestion et sauvegarde de la base de données
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Dernière sauvegarde</p>
                  <p className="text-xs text-muted-foreground">
                    2024-01-17 14:30:00
                  </p>
                </div>
                <Button variant="outline" size="sm">
                  Sauvegarder
                </Button>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Taille de la base</p>
                  <p className="text-xs text-muted-foreground">
                    2.5 GB
                  </p>
                </div>
                <Button variant="outline" size="sm">
                  Optimiser
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <Settings className="h-5 w-5 text-[#F2C94C]" />
              <CardTitle>Général</CardTitle>
            </div>
            <CardDescription>
              Paramètres généraux de la plateforme
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Langue</p>
                  <p className="text-xs text-muted-foreground">
                    Langue de l'interface
                  </p>
                </div>
                <Button variant="outline" size="sm">
                  Français
                </Button>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Thème</p>
                  <p className="text-xs text-muted-foreground">
                    Apparence de l'interface
                  </p>
                </div>
                <Button variant="outline" size="sm">
                  Configurer
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}


