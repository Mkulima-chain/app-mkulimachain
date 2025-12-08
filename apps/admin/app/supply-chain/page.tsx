"use client"

import * as React from "react"
import { Network } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function SupplyChainPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Chaîne d'approvisionnement</h1>
        <p className="text-muted-foreground mt-1">
          Gérez la traçabilité de la chaîne d'approvisionnement
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <Network className="h-5 w-5 text-[#3A8F4C]" />
            <CardTitle>Gestion de la chaîne d'approvisionnement</CardTitle>
          </div>
          <CardDescription>
            Interface de gestion de la traçabilité blockchain
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Cette section permet de suivre et gérer la chaîne d'approvisionnement complète, de la récolte à l'acheteur final, avec traçabilité blockchain.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}


