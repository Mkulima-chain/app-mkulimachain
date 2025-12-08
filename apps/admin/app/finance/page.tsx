"use client"

import * as React from "react"
import { Coins, TrendingUp, DollarSign, CreditCard, Plus, Edit, Trash2, MoreVertical, Loader2 } from "lucide-react"
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
import { useApiQuery } from "@/hooks/use-api-query"
import { useApiMutation } from "@/hooks/use-api-mutation"

enum LoanStatus {
  PENDING = "pending",
  ACTIVE = "active",
  REPAID = "repaid",
  DEFAULTED = "defaulted",
}

type MicroLoan = {
  id: string
  farmer: {
    id: string
    name: string
  }
  amountADA: number
  interestRate: number
  durationDays: number
  status: LoanStatus
  loanContractHash: string
  startDate?: string
  dueDate?: string
  repaidAt?: string
  createdAt: string
}

type CreateMicroLoanDto = {
  farmerId: string
  amountADA: number
  interestRate: number
  durationDays: number
  loanContractHash: string
}

type UpdateMicroLoanDto = {
  status?: LoanStatus
  loanContractHash?: string
}

export default function FinancePage() {
  const [isAddDialogOpen, setIsAddDialogOpen] = React.useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = React.useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false)
  const [selectedLoan, setSelectedLoan] = React.useState<MicroLoan | null>(null)
  const [formData, setFormData] = React.useState<CreateMicroLoanDto>({
    farmerId: "",
    amountADA: 0,
    interestRate: 5,
    durationDays: 90,
    loanContractHash: "",
  })
  const [updateData, setUpdateData] = React.useState<UpdateMicroLoanDto>({
    status: LoanStatus.PENDING,
  })

  // Fetch loans
  const { data: microLoans = [], isLoading, refetch } = useApiQuery<MicroLoan[]>(
    ["loans"],
    "/loans"
  )

  // Create mutation
  const createMutation = useApiMutation<MicroLoan, CreateMicroLoanDto>(
    "/loans",
    "POST",
    {
      onSuccess: () => {
        toast.success("Micro-prêt ajouté avec succès")
        setIsAddDialogOpen(false)
        refetch()
      },
    }
  )

  // Update mutation
  const updateMutation = useApiMutation<MicroLoan, UpdateMicroLoanDto>(
    () => `/loans/${selectedLoan?.id}`,
    "PUT",
    {
      onSuccess: () => {
        toast.success("Micro-prêt modifié avec succès")
        setIsEditDialogOpen(false)
        setSelectedLoan(null)
        refetch()
      },
    }
  )

  // Delete mutation
  const deleteMutation = useApiMutation<void, void>(
    () => `/loans/${selectedLoan?.id}`,
    "DELETE",
    {
      onSuccess: () => {
        toast.success("Micro-prêt supprimé avec succès")
        setIsDeleteDialogOpen(false)
        setSelectedLoan(null)
        refetch()
      },
    }
  )

  const handleAdd = () => {
    setFormData({
      farmerId: "",
      amountADA: 0,
      interestRate: 5,
      durationDays: 90,
      loanContractHash: "",
    })
    setIsAddDialogOpen(true)
  }

  const handleEdit = (loan: MicroLoan) => {
    setSelectedLoan(loan)
    setUpdateData({
      status: loan.status,
      loanContractHash: loan.loanContractHash,
    })
    setIsEditDialogOpen(true)
  }

  const handleDelete = (loan: MicroLoan) => {
    setSelectedLoan(loan)
    setIsDeleteDialogOpen(true)
  }

  const handleSubmitAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    createMutation.mutate({
      ...formData,
      amountADA: parseFloat(formData.amountADA.toString()),
      interestRate: parseFloat(formData.interestRate.toString()),
      durationDays: parseInt(formData.durationDays.toString()),
    })
  }

  const handleSubmitEdit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedLoan) return
    updateMutation.mutate(updateData)
  }

  const handleConfirmDelete = () => {
    if (!selectedLoan) return
    deleteMutation.mutate(undefined)
  }

  const getStatusBadge = (status: LoanStatus) => {
    const variants: Record<LoanStatus, { variant: "default" | "secondary" | "outline"; className: string; label: string }> = {
      [LoanStatus.ACTIVE]: { variant: "default", className: "bg-[#3A8F4C] text-white", label: "Actif" },
      [LoanStatus.REPAID]: { variant: "secondary", className: "bg-[#5A3E36] text-white", label: "Remboursé" },
      [LoanStatus.PENDING]: { variant: "outline", className: "", label: "En attente" },
      [LoanStatus.DEFAULTED]: { variant: "outline", className: "bg-red-500 text-white", label: "En défaut" },
    }
    return variants[status] || variants[LoanStatus.PENDING]
  }

  const activeLoans = microLoans.filter((l) => l.status === LoanStatus.ACTIVE)
  const totalActive = activeLoans.reduce((sum, l) => sum + l.amountADA, 0)

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
            <div className="text-2xl font-bold">
              {isLoading ? "..." : `₿ ${totalActive.toFixed(2)}`}
            </div>
            <p className="text-xs text-muted-foreground mt-1">{isLoading ? "..." : `${activeLoans.length} prêts actifs`}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total remboursé</CardTitle>
            <DollarSign className="h-5 w-5 text-[#5A3E36]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? "..." : `₿ ${microLoans.filter(l => l.status === LoanStatus.REPAID).reduce((sum, l) => sum + l.amountADA, 0).toFixed(2)}`}
            </div>
            <p className="text-xs text-muted-foreground mt-1">+18% ce mois</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Transactions</CardTitle>
            <CreditCard className="h-5 w-5 text-[#004D73]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{isLoading ? "..." : microLoans.length}</div>
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
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-[#3A8F4C]" />
            </div>
          ) : (
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
                        Durée
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
                    {microLoans.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="px-6 py-8 text-center text-muted-foreground">
                          Aucun micro-prêt trouvé
                        </td>
                      </tr>
                    ) : (
                      microLoans.map((loan) => {
                        const statusBadge = getStatusBadge(loan.status)
                        return (
                          <tr key={loan.id} className="hover:bg-muted/50">
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              {loan.farmer?.name || "N/A"}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                              ₿ {loan.amountADA.toFixed(2)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                              {loan.interestRate}%
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                              {loan.durationDays} jours
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                              {loan.dueDate ? new Date(loan.dueDate).toLocaleDateString() : "N/A"}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <Badge variant={statusBadge.variant} className={statusBadge.className}>
                                {statusBadge.label}
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
                        )
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
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
                <Label htmlFor="farmerId">ID de l'agriculteur *</Label>
                <Input
                  id="farmerId"
                  value={formData.farmerId}
                  onChange={(e) =>
                    setFormData({ ...formData, farmerId: e.target.value })
                  }
                  placeholder="UUID de l'agriculteur"
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="amountADA">Montant (ADA) *</Label>
                <Input
                  id="amountADA"
                  type="number"
                  step="0.01"
                  min="1"
                  value={formData.amountADA}
                  onChange={(e) =>
                    setFormData({ ...formData, amountADA: parseFloat(e.target.value) || 0 })
                  }
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="interestRate">Taux d'intérêt (%) *</Label>
                <Input
                  id="interestRate"
                  type="number"
                  step="0.1"
                  min="0"
                  max="100"
                  value={formData.interestRate}
                  onChange={(e) =>
                    setFormData({ ...formData, interestRate: parseFloat(e.target.value) || 0 })
                  }
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="durationDays">Durée (jours) *</Label>
                <Input
                  id="durationDays"
                  type="number"
                  min="1"
                  max="365"
                  value={formData.durationDays}
                  onChange={(e) =>
                    setFormData({ ...formData, durationDays: parseInt(e.target.value) || 0 })
                  }
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="loanContractHash">Hash du smart contract *</Label>
                <Input
                  id="loanContractHash"
                  value={formData.loanContractHash}
                  onChange={(e) =>
                    setFormData({ ...formData, loanContractHash: e.target.value })
                  }
                  placeholder="0x..."
                  required
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsAddDialogOpen(false)}
                disabled={createMutation.isPending}
              >
                Annuler
              </Button>
              <Button
                type="submit"
                className="bg-[#3A8F4C] hover:bg-[#2E7D32]"
                disabled={createMutation.isPending}
              >
                {createMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Ajout...
                  </>
                ) : (
                  "Ajouter"
                )}
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
                <Label htmlFor="edit-status">Statut</Label>
                <select
                  id="edit-status"
                  value={updateData.status}
                  onChange={(e) =>
                    setUpdateData({ ...updateData, status: e.target.value as LoanStatus })
                  }
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors"
                >
                  <option value={LoanStatus.PENDING}>En attente</option>
                  <option value={LoanStatus.ACTIVE}>Actif</option>
                  <option value={LoanStatus.REPAID}>Remboursé</option>
                  <option value={LoanStatus.DEFAULTED}>En défaut</option>
                </select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-loanContractHash">Hash du smart contract</Label>
                <Input
                  id="edit-loanContractHash"
                  value={updateData.loanContractHash || ""}
                  onChange={(e) =>
                    setUpdateData({ ...updateData, loanContractHash: e.target.value })
                  }
                  placeholder="0x..."
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsEditDialogOpen(false)}
                disabled={updateMutation.isPending}
              >
                Annuler
              </Button>
              <Button
                type="submit"
                className="bg-[#3A8F4C] hover:bg-[#2E7D32]"
                disabled={updateMutation.isPending}
              >
                {updateMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Enregistrement...
                  </>
                ) : (
                  "Enregistrer"
                )}
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
              <strong>{selectedLoan?.farmer?.name || "N/A"}</strong> ? Cette action est
              irréversible.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
              disabled={deleteMutation.isPending}
            >
              Annuler
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmDelete}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Suppression...
                </>
              ) : (
                "Supprimer"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
