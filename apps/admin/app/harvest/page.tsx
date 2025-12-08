"use client"

import * as React from "react"
import { Leaf } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function HarvestPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Récoltes</h1>
        <p className="text-muted-foreground mt-1">
          Gérez les récoltes des agriculteurs
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <Leaf className="h-5 w-5 text-[#3A8F4C]" />
            <CardTitle>Gestion des récoltes</CardTitle>
          </div>
          <CardDescription>
            Interface de gestion des récoltes et proof-of-harvest
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Cette section permet de gérer les récoltes, les preuves de récolte (proof-of-harvest) et leur traçabilité blockchain.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}


