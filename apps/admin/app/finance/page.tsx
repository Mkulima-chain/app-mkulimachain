"use client"

import * as React from "react"
import { Coins, TrendingUp, DollarSign, CreditCard, Plus, Edit, Trash2, MoreVertical } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { toast } from "sonner"

type MicroLoan = {
  id: number
  farmer: string
  amount: string
  status: "active" | "repaid" | "pending"
  interest: string
  dueDate: string
}

const initialMicroLoans: MicroLoan[] = [
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
  const [microLoans, setMicroLoans] = React.useState<MicroLoan[]>(initialMicroLoans)
  const [isAddDialogOpen, setIsAddDialogOpen] = React.useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = React.useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false)
  const [selectedLoan, setSelectedLoan] = React.useState<MicroLoan | null>(null)
  const [formData, setFormData] = React.useState({
    farmer: "",
    amount: "",
    interest: "5%",
    status: "pending" as "active" | "repaid" | "pending",
    dueDate: "",
  })

  const handleAdd = () => {
    setFormData({
      farmer: "",
      amount: "",
      interest: "5%",
      status: "pending",
      dueDate: "",
    })
    setIsAddDialogOpen(true)
  }

  const handleEdit = (loan: MicroLoan) => {
    setSelectedLoan(loan)
    setFormData({
      farmer: loan.farmer,
      amount: loan.amount,
      interest: loan.interest,
      status: loan.status,
      dueDate: loan.dueDate,
    })
    setIsEditDialogOpen(true)
  }

  const handleDelete = (loan: MicroLoan) => {
    setSelectedLoan(loan)
    setIsDeleteDialogOpen(true)
  }

  const handleSubmitAdd = (e: React.FormEvent) => {
    e.preventDefault()
    const newLoan: MicroLoan = {
      id: microLoans.length + 1,
      farmer: formData.farmer,
      amount: formData.amount,
      interest: formData.interest,
      status: formData.status,
      dueDate: formData.dueDate,
    }
    setMicroLoans([...microLoans, newLoan])
    setIsAddDialogOpen(false)
    toast.success("Micro-prêt ajouté avec succès")
  }

  const handleSubmitEdit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedLoan) return

    setMicroLoans(
      microLoans.map((l) =>
        l.id === selectedLoan.id
          ? {
              ...l,
              farmer: formData.farmer,
              amount: formData.amount,
              interest: formData.interest,
              status: formData.status,
              dueDate: formData.dueDate,
            }
          : l
      )
    )
    setIsEditDialogOpen(false)
    setSelectedLoan(null)
    toast.success("Micro-prêt modifié avec succès")
  }

  const handleConfirmDelete = () => {
    if (!selectedLoan) return
    setMicroLoans(microLoans.filter((l) => l.id !== selectedLoan.id))
    setIsDeleteDialogOpen(false)
    setSelectedLoan(null)
    toast.success("Micro-prêt supprimé avec succès")
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Finance</h1>
          <p className="text-muted-foreground mt-1">
            Gérez les micro-prêts, scores de crédit et transactions
          </p>
        </div>
        <Button onClick={handleAdd} className="bg-[#3A8F4C] hover:bg-[#2E7D32]">
          <Plus className="h-4 w-4 mr-2" />
          Ajouter un micro-prêt
        </Button>
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
            <p className="text-xs text-muted-foreground mt-1">{microLoans.filter(l => l.status === "active").length} prêts actifs</p>
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
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent align="end" className="w-48 p-2">
                            <div className="space-y-1">
                              <button
                                onClick={() => handleEdit(loan)}
                                className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm hover:bg-accent transition-colors"
                              >
                                <Edit className="h-4 w-4" />
                                Modifier
                              </button>
                              <button
                                onClick={() => handleDelete(loan)}
                                className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm hover:bg-destructive/10 text-destructive transition-colors"
                              >
                                <Trash2 className="h-4 w-4" />
                                Supprimer
                              </button>
                            </div>
                          </PopoverContent>
                        </Popover>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Add Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Ajouter un micro-prêt</DialogTitle>
            <DialogDescription>
              Remplissez les informations pour ajouter un nouveau micro-prêt
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmitAdd}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="farmer">Agriculteur</Label>
                <Input
                  id="farmer"
                  value={formData.farmer}
                  onChange={(e) =>
                    setFormData({ ...formData, farmer: e.target.value })
                  }
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="amount">Montant</Label>
                <Input
                  id="amount"
                  value={formData.amount}
                  onChange={(e) =>
                    setFormData({ ...formData, amount: e.target.value })
                  }
                  placeholder="₿ 500"
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="interest">Taux d'intérêt</Label>
                <Input
                  id="interest"
                  value={formData.interest}
                  onChange={(e) =>
                    setFormData({ ...formData, interest: e.target.value })
                  }
                  placeholder="5%"
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="dueDate">Date d'échéance</Label>
                <Input
                  id="dueDate"
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) =>
                    setFormData({ ...formData, dueDate: e.target.value })
                  }
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="status">Statut</Label>
                <select
                  id="status"
                  value={formData.status}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      status: e.target.value as "active" | "repaid" | "pending",
                    })
                  }
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors"
                >
                  <option value="pending">En attente</option>
                  <option value="active">Actif</option>
                  <option value="repaid">Remboursé</option>
                </select>
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsAddDialogOpen(false)}
              >
                Annuler
              </Button>
              <Button type="submit" className="bg-[#3A8F4C] hover:bg-[#2E7D32]">
                Ajouter
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Modifier le micro-prêt</DialogTitle>
            <DialogDescription>
              Modifiez les informations du micro-prêt
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmitEdit}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-farmer">Agriculteur</Label>
                <Input
                  id="edit-farmer"
                  value={formData.farmer}
                  onChange={(e) =>
                    setFormData({ ...formData, farmer: e.target.value })
                  }
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-amount">Montant</Label>
                <Input
                  id="edit-amount"
                  value={formData.amount}
                  onChange={(e) =>
                    setFormData({ ...formData, amount: e.target.value })
                  }
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-interest">Taux d'intérêt</Label>
                <Input
                  id="edit-interest"
                  value={formData.interest}
                  onChange={(e) =>
                    setFormData({ ...formData, interest: e.target.value })
                  }
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-dueDate">Date d'échéance</Label>
                <Input
                  id="edit-dueDate"
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) =>
                    setFormData({ ...formData, dueDate: e.target.value })
                  }
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-status">Statut</Label>
                <select
                  id="edit-status"
                  value={formData.status}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      status: e.target.value as "active" | "repaid" | "pending",
                    })
                  }
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors"
                >
                  <option value="pending">En attente</option>
                  <option value="active">Actif</option>
                  <option value="repaid">Remboursé</option>
                </select>
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsEditDialogOpen(false)}
              >
                Annuler
              </Button>
              <Button type="submit" className="bg-[#3A8F4C] hover:bg-[#2E7D32]">
                Enregistrer
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Supprimer le micro-prêt</DialogTitle>
            <DialogDescription>
              Êtes-vous sûr de vouloir supprimer le micro-prêt de{" "}
              <strong>{selectedLoan?.farmer}</strong> ? Cette action est
              irréversible.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Annuler
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmDelete}
            >
              Supprimer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
