"use client"

import * as React from "react"
import { School, TrendingUp } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function SchoolFundPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Fonds scolaires</h1>
        <p className="text-muted-foreground mt-1">
          Gérez les fonds scolaires générés par les NFTs
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total collecté</CardTitle>
            <School className="h-5 w-5 text-[#3A8F4C]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₿ 12,345</div>
            <p className="text-xs text-muted-foreground mt-1">Depuis le début</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Enfants scolarisés</CardTitle>
            <TrendingUp className="h-5 w-5 text-[#5A3E36]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">500+</div>
            <p className="text-xs text-muted-foreground mt-1">Enfants financés</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <School className="h-5 w-5 text-[#3A8F4C]" />
            <CardTitle>Gestion des fonds scolaires</CardTitle>
          </div>
          <CardDescription>
            Interface de gestion des fonds scolaires générés par les NFTs culturels
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Cette section permet de gérer les fonds scolaires générés par la vente de NFTs culturels Lingala et de suivre leur utilisation pour financer la scolarité des enfants d'agriculteurs.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}


