"use client"

import * as React from "react"
import { FileText } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function BatchPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Lots</h1>
        <p className="text-muted-foreground mt-1">
          Gérez les lots de produits
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <FileText className="h-5 w-5 text-[#3A8F4C]" />
            <CardTitle>Gestion des lots</CardTitle>
          </div>
          <CardDescription>
            Interface de gestion des lots de produits
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Cette section permet de gérer les lots de produits, leur traçabilité et leur certification blockchain.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}


