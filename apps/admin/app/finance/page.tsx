"use client"

import * as React from "react"
import { Coins, TrendingUp, DollarSign, CreditCard } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

const microLoans = [
  {
    id: 1,
    farmer: "Jean Mukendi",
    amount: "₿ 500",
    status: "active",
    interest: "5%",
    dueDate: "2024-03-15",
  },
  {
    id: 2,
    farmer: "Marie Kabila",
    amount: "₿ 300",
    status: "repaid",
    interest: "5%",
    dueDate: "2024-02-20",
  },
  {
    id: 3,
    farmer: "Pierre Kasa",
    amount: "₿ 750",
    status: "pending",
    interest: "5%",
    dueDate: "2024-04-10",
  },
]

export default function FinancePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Finance</h1>
        <p className="text-muted-foreground mt-1">
          Gérez les micro-prêts, scores de crédit et transactions
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Micro-prêts actifs</CardTitle>
            <Coins className="h-5 w-5 text-[#3A8F4C]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₿ 45,678</div>
            <p className="text-xs text-muted-foreground mt-1">234 prêts actifs</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total remboursé</CardTitle>
            <DollarSign className="h-5 w-5 text-[#5A3E36]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₿ 123,456</div>
            <p className="text-xs text-muted-foreground mt-1">+18% ce mois</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Transactions</CardTitle>
            <CreditCard className="h-5 w-5 text-[#004D73]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,234</div>
            <p className="text-xs text-muted-foreground mt-1">Ce mois</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Taux de remboursement</CardTitle>
            <TrendingUp className="h-5 w-5 text-[#F2C94C]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">94.5%</div>
            <p className="text-xs text-muted-foreground mt-1">+2.3% ce mois</p>
          </CardContent>
        </Card>
      </div>

      {/* Micro Loans */}
      <Card>
        <CardHeader>
          <CardTitle>Micro-prêts</CardTitle>
          <CardDescription>
            Liste des micro-prêts en cours et remboursés
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Agriculteur
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Montant
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Taux d'intérêt
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Date d'échéance
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Statut
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {microLoans.map((loan) => (
                    <tr key={loan.id} className="hover:bg-muted/50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        {loan.farmer}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {loan.amount}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {loan.interest}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                        {loan.dueDate}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge
                          variant={
                            loan.status === "active"
                              ? "default"
                              : loan.status === "repaid"
                              ? "secondary"
                              : "outline"
                          }
                          className={
                            loan.status === "active"
                              ? "bg-[#3A8F4C] text-white"
                              : loan.status === "repaid"
                              ? "bg-[#5A3E36] text-white"
                              : ""
                          }
                        >
                          {loan.status === "active"
                            ? "Actif"
                            : loan.status === "repaid"
                            ? "Remboursé"
                            : "En attente"}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <button className="text-[#3A8F4C] hover:underline">
                          Voir
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}


