"use client"

import * as React from "react"
import { Network, Users } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function CooperativesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Coopératives</h1>
        <p className="text-muted-foreground mt-1">
          Gérez les coopératives agricoles
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <Network className="h-5 w-5 text-[#3A8F4C]" />
            <CardTitle>Gestion des coopératives</CardTitle>
          </div>
          <CardDescription>
            Interface de gestion des coopératives agricoles
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Cette section permet de gérer les coopératives, leurs membres, et leurs activités.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}


