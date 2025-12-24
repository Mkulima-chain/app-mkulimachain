"use client";

import * as React from "react";
import {
  Coins,
  TrendingUp,
  DollarSign,
  Plus,
  Edit,
  Trash2,
  MoreVertical,
  Loader2,
  CheckCircle,
  XCircle,
  Play,
  AlertTriangle,
  Eye,
  Search,
  Filter,
  RefreshCw,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { useApiQuery } from "@/hooks/use-api-query";
import { useApiMutation } from "@/hooks/use-api-mutation";
import { api } from "@/lib/api-client";
import { DatePicker } from "@/components/ui/date-picker";
import { FileUpload } from "@/components/ui/file-upload";
import { useWalletAtom } from "@/hooks/useWalletAtom";
import { WalletConnectDialog } from "@/components/wallet-connect-dialog";

enum LoanStatus {
  PENDING = "pending",
  APPROVED = "approved",
  ACTIVE = "active",
  REPAID = "repaid",
  DEFAULTED = "defaulted",
  REJECTED = "rejected",
}

type MicroLoan = {
  id: string;
  farmer: Farmer;
  amountADA: number;
  interestRate: number;
  durationDays: number;
  status: LoanStatus;
  loanContractHash: string;
  startDate?: string;
  dueDate?: string;
  repaidAt?: string;
  approvedAt?: string;
  approvedBy?: string;
  rejectionReason?: string;
  transactionHash?: string;
  // Documents
  identificationNumber?: string;
  idCardPhotoUrl?: string;
  harvestProofUrl?: string;
  guaranteeDocumentUrl?: string;
  loanPurpose?: string;
  createdAt: string;
};

type Farmer = {
  id: string;
  name: string;
  phone: string;
  city: string;
  walletAddress?: string;
};

type CreditScore = {
  id: string;
  farmer: Farmer;
  score: number;
  harvestCount: number;
  totalHarvestValue: number;
  loanRepaymentRate: number;
};

type LoanStats = {
  totalLoans: number;
  pendingLoans: number;
  approvedLoans: number;
  activeLoans: number;
  repaidLoans: number;
  defaultedLoans: number;
  rejectedLoans: number;
  totalAmountLent: number;
  totalAmountRepaid: number;
  repaymentRate: number;
};

type EligibilityResponse = {
  eligible: boolean;
  creditScore: number;
  minimumScoreRequired: number;
  maxAmountAllowed: number;
  reason?: string;
  activeLoansCount: number;
};

type CreateMicroLoanDto = {
  farmerId: string;
  amountADA: number;
  interestRate: number;
  durationDays: number;
  loanContractHash: string;
  dueDate?: string;
  // Documents
  identificationNumber?: string;
  idCardPhotoUrl?: string;
  harvestProofUrl?: string;
  guaranteeDocumentUrl?: string;
  loanPurpose?: string;
};

type UpdateMicroLoanDto = {
  status?: LoanStatus;
  loanContractHash?: string;
};

export default function FinancePage() {
  const { connected, wallet } = useWalletAtom();
  const [isWalletDialogOpen, setIsWalletDialogOpen] = React.useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = React.useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = React.useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = React.useState(false);
  const [isRejectDialogOpen, setIsRejectDialogOpen] = React.useState(false);
  const [selectedLoan, setSelectedLoan] = React.useState<MicroLoan | null>(
    null
  );
  const [rejectionReason, setRejectionReason] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<string>("all");
  const [searchQuery, setSearchQuery] = React.useState("");
  const [formData, setFormData] = React.useState<CreateMicroLoanDto>({
    farmerId: "",
    amountADA: 0,
    interestRate: 5,
    durationDays: 90,
    loanContractHash: "",
    dueDate: undefined,
    // Documents
    identificationNumber: "",
    idCardPhotoUrl: undefined,
    harvestProofUrl: undefined,
    guaranteeDocumentUrl: undefined,
    loanPurpose: "",
  });
  const [selectedDueDate, setSelectedDueDate] = React.useState<
    Date | undefined
  >(undefined);
  const [updateData, setUpdateData] = React.useState<UpdateMicroLoanDto>({
    status: LoanStatus.PENDING,
  });
  const [eligibility, setEligibility] =
    React.useState<EligibilityResponse | null>(null);
  const [checkingEligibility, setCheckingEligibility] = React.useState(false);
  const [currentStep, setCurrentStep] = React.useState(1);

  const steps = [
    { number: 1, title: "Informations du Prêt" },
    { number: 2, title: "Documents" },
  ];

  // Fetch loans
  const {
    data: microLoans = [],
    isLoading,
    refetch,
  } = useApiQuery<MicroLoan[]>(["loans"], "/loans");

  // Fetch farmers for selection
  const { data: farmers = [] } = useApiQuery<Farmer[]>(["farmers"], "/farmers");

  // Fetch stats
  const { data: stats, refetch: refetchStats } = useApiQuery<LoanStats>(
    ["loans-stats"],
    "/loans/stats"
  );

  // Create mutation
  const createMutation = useApiMutation<MicroLoan, CreateMicroLoanDto>(
    "/loans",
    "POST",
    {
      onSuccess: () => {
        toast.success("Micro-prêt créé avec succès");
        setIsAddDialogOpen(false);
        setEligibility(null);
        refetch();
        refetchStats();
      },
    }
  );

  // Update mutation
  const updateMutation = useApiMutation<MicroLoan, UpdateMicroLoanDto>(
    () => `/loans/${selectedLoan?.id}`,
    "PUT",
    {
      onSuccess: () => {
        toast.success("Micro-prêt modifié avec succès");
        setIsEditDialogOpen(false);
        setSelectedLoan(null);
        refetch();
        refetchStats();
      },
    }
  );

  // Delete mutation
  const deleteMutation = useApiMutation<void, void>(
    () => `/loans/${selectedLoan?.id}`,
    "DELETE",
    {
      onSuccess: () => {
        toast.success("Micro-prêt supprimé avec succès");
        setIsDeleteDialogOpen(false);
        setSelectedLoan(null);
        refetch();
        refetchStats();
      },
    }
  );

  // Approve mutation
  const approveMutation = useApiMutation<MicroLoan, { approvedBy?: string }>(
    () => `/loans/${selectedLoan?.id}/approve`,
    "POST",
    {
      onSuccess: () => {
        toast.success("Prêt approuvé avec succès");
        setSelectedLoan(null);
        refetch();
        refetchStats();
      },
    }
  );

  // Reject mutation
  const rejectMutation = useApiMutation<
    MicroLoan,
    { reason: string; rejectedBy?: string }
  >(() => `/loans/${selectedLoan?.id}/reject`, "POST", {
    onSuccess: () => {
      toast.success("Prêt rejeté");
      setIsRejectDialogOpen(false);
      setRejectionReason("");
      setSelectedLoan(null);
      refetch();
      refetchStats();
    },
  });

  // Repay mutation
  const repayMutation = useApiMutation<MicroLoan, void>(
    () => `/loans/${selectedLoan?.id}/repay`,
    "POST",
    {
      onSuccess: () => {
        toast.success("Prêt remboursé avec succès");
        setSelectedLoan(null);
        refetch();
        refetchStats();
      },
    }
  );

  // Default mutation
  const defaultMutation = useApiMutation<MicroLoan, void>(
    () => `/loans/${selectedLoan?.id}/default`,
    "POST",
    {
      onSuccess: () => {
        toast.success("Prêt marqué en défaut");
        setSelectedLoan(null);
        refetch();
        refetchStats();
      },
    }
  );

  // Check eligibility
  const checkEligibility = async (farmerId: string, amount: number) => {
    if (!farmerId || amount <= 0) {
      setEligibility(null);
      return;
    }
    setCheckingEligibility(true);
    try {
      const API_BASE_URL =
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:5600/api";
      const response = await fetch(`${API_BASE_URL}/loans/eligibility`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ farmerId, amountADA: amount }),
      });
      if (response.ok) {
        const data = await response.json();
        setEligibility(data);
      } else {
        console.error("Eligibility check failed:", response.status);
        setEligibility(null);
      }
    } catch (error) {
      console.error("Error checking eligibility:", error);
      setEligibility(null);
    } finally {
      setCheckingEligibility(false);
    }
  };

  const handleAdd = () => {
    setFormData({
      farmerId: "",
      amountADA: 0,
      interestRate: 5,
      durationDays: 90,
      loanContractHash: "",
      dueDate: undefined,
      // Documents
      identificationNumber: "",
      idCardPhotoUrl: undefined,
      harvestProofUrl: undefined,
      guaranteeDocumentUrl: undefined,
      loanPurpose: "",
    });
    setSelectedDueDate(undefined);
    setEligibility(null);
    setCurrentStep(1);
    setIsAddDialogOpen(true);
  };

  const handleEdit = (loan: MicroLoan) => {
    setSelectedLoan(loan);
    setUpdateData({
      status: loan.status,
      loanContractHash: loan.loanContractHash,
    });
    setIsEditDialogOpen(true);
  };

  const handleDelete = (loan: MicroLoan) => {
    setSelectedLoan(loan);
    setIsDeleteDialogOpen(true);
  };

  const handleViewDetails = (loan: MicroLoan) => {
    setSelectedLoan(loan);
    setIsDetailsDialogOpen(true);
  };

  const handleApprove = (loan: MicroLoan) => {
    setSelectedLoan(loan);
    approveMutation.mutate({});
  };

  const handleReject = (loan: MicroLoan) => {
    setSelectedLoan(loan);
    setIsRejectDialogOpen(true);
  };

  const handleActivate = async (loan: MicroLoan) => {
    if (!connected || !wallet) {
      toast.info("Connexion requise", {
        description: "Veuillez connecter votre wallet pour activer le prêt.",
      });
      setIsWalletDialogOpen(true);
      return;
    }

    if (!loan.farmer.walletAddress) {
      toast.error(
        "Impossible d'activer le prêt : Adresse wallet de l'agriculteur manquante."
      );
      return;
    }

    try {
      // Convert ADA to Lovelace (1 ADA = 1,000,000 Lovelace)
      const amountLovelace = BigInt(Math.floor(loan.amountADA * 1000000));

      const tx = await wallet
        .newTx()
        .payToAddress(loan.farmer.walletAddress, {
          lovelace: amountLovelace,
        })
        .complete();

      const signedTx = await tx.sign().complete();
      const txHash = await signedTx.submit();

      toast.success("Transaction soumise avec succès", {
        description: `Hash: ${txHash.slice(0, 10)}...${txHash.slice(-8)}`,
      });

      setSelectedLoan(loan);

      // Call API directly to avoid 'id' in body issue with useApiMutation
      await api.post(`/loans/${loan.id}/activate`, { transactionHash: txHash });

      toast.success("Prêt activé avec succès");
      setIsDetailsDialogOpen(false);
      refetch();
      refetchStats();
      setSelectedLoan(null);
    } catch (error) {
      console.error("Erreur lors de la transaction:", error);

      const errorMessage =
        error instanceof Error ? error.message : String(error);
      const errorMessageLower = errorMessage.toLowerCase();

      // Gestion spécifique pour l'annulation utilisateur
      if (
        errorMessageLower.includes("declined") ||
        errorMessageLower.includes("cancelled") ||
        errorMessageLower.includes("refused") ||
        errorMessageLower.includes("user declined") ||
        errorMessageLower.includes("user canceled")
      ) {
        toast.info("Transaction annulée", {
          description: "Vous avez annulé la signature de la transaction.",
        });
        return;
      }

      toast.error("Erreur lors du transfert de fonds", {
        description: errorMessage,
      });
    }
  };

  const handleRepay = (loan: MicroLoan) => {
    setSelectedLoan(loan);
    repayMutation.mutate(undefined);
  };

  const handleDefault = (loan: MicroLoan) => {
    setSelectedLoan(loan);
    defaultMutation.mutate(undefined);
  };

  const handleSubmitAdd = async (e: React.FormEvent) => {
    e.preventDefault();

    // Handle Step 1 transition (allow Enter key to move to next step)
    if (currentStep === 1) {
      const isStep1Valid =
        formData.farmerId &&
        formData.amountADA > 0 &&
        formData.interestRate !== undefined &&
        formData.interestRate !== null &&
        formData.durationDays > 0 &&
        formData.loanContractHash;

      if (isStep1Valid) {
        setCurrentStep(2);
      }
      return;
    }

    createMutation.mutate({
      ...formData,
      amountADA: parseFloat(formData.amountADA.toString()),
      interestRate: parseFloat(formData.interestRate.toString()),
      durationDays: parseInt(formData.durationDays.toString()),
      dueDate: selectedDueDate ? selectedDueDate.toISOString() : undefined,
    });
  };

  const handleSubmitEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLoan) return;
    updateMutation.mutate(updateData);
  };

  const handleConfirmDelete = () => {
    if (!selectedLoan) return;
    deleteMutation.mutate(undefined);
  };

  const handleConfirmReject = () => {
    if (!selectedLoan || !rejectionReason) return;
    rejectMutation.mutate({ reason: rejectionReason });
  };

  const getStatusBadge = (status: LoanStatus) => {
    const variants: Record<
      LoanStatus,
      {
        variant: "default" | "secondary" | "outline" | "destructive";
        className: string;
        label: string;
      }
    > = {
      [LoanStatus.ACTIVE]: {
        variant: "default",
        className: "bg-[#3A8F4C] text-white",
        label: "Actif",
      },
      [LoanStatus.APPROVED]: {
        variant: "default",
        className: "bg-blue-500 text-white",
        label: "Approuvé",
      },
      [LoanStatus.REPAID]: {
        variant: "secondary",
        className: "bg-[#5A3E36] text-white",
        label: "Remboursé",
      },
      [LoanStatus.PENDING]: {
        variant: "outline",
        className: "bg-yellow-100 text-yellow-800 border-yellow-300",
        label: "En attente",
      },
      [LoanStatus.DEFAULTED]: {
        variant: "destructive",
        className: "bg-red-500 text-white",
        label: "En défaut",
      },
      [LoanStatus.REJECTED]: {
        variant: "outline",
        className: "bg-gray-100 text-gray-600 border-gray-300",
        label: "Rejeté",
      },
    };
    return variants[status] || variants[LoanStatus.PENDING];
  };

  const calculateRepaymentAmount = (loan: MicroLoan) => {
    const principal = Number(loan.amountADA);
    const rate = Number(loan.interestRate) / 100;
    return principal + principal * rate;
  };

  // Filter loans
  const filteredLoans = microLoans.filter((loan) => {
    const matchesStatus =
      statusFilter === "all" || loan.status === statusFilter;
    const matchesSearch =
      !searchQuery ||
      loan.farmer?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      loan.id.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Finance</h1>
          <p className="text-muted-foreground mt-1">
            Gérez les micro-prêts, scores de crédit et transactions
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => {
              refetch();
              refetchStats();
            }}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Actualiser
          </Button>
          <Button
            onClick={handleAdd}
            className="bg-[#3A8F4C] hover:bg-[#2E7D32]"
          >
            <Plus className="h-4 w-4 mr-2" />
            Nouveau prêt
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Prêts actifs</CardTitle>
            <Coins className="h-5 w-5 text-[#3A8F4C]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading
                ? "..."
                : `₳ ${(stats?.totalAmountLent || 0).toFixed(2)}`}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {isLoading ? "..." : `${stats?.activeLoans || 0} prêts actifs`}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">En attente</CardTitle>
            <AlertTriangle className="h-5 w-5 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? "..." : stats?.pendingLoans || 0}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Demandes à traiter
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Total remboursé
            </CardTitle>
            <DollarSign className="h-5 w-5 text-[#5A3E36]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading
                ? "..."
                : `₳ ${(stats?.totalAmountRepaid || 0).toFixed(2)}`}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats?.repaidLoans || 0} prêts remboursés
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Taux de remboursement
            </CardTitle>
            <TrendingUp className="h-5 w-5 text-[#F2C94C]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? "..." : `${stats?.repaymentRate || 0}%`}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats?.defaultedLoans || 0} en défaut
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex gap-4 items-center">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher par agriculteur..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Filtrer par statut" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les statuts</SelectItem>
            <SelectItem value={LoanStatus.PENDING}>En attente</SelectItem>
            <SelectItem value={LoanStatus.APPROVED}>Approuvé</SelectItem>
            <SelectItem value={LoanStatus.ACTIVE}>Actif</SelectItem>
            <SelectItem value={LoanStatus.REPAID}>Remboursé</SelectItem>
            <SelectItem value={LoanStatus.DEFAULTED}>En défaut</SelectItem>
            <SelectItem value={LoanStatus.REJECTED}>Rejeté</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Micro Loans */}
      <Card>
        <CardHeader>
          <CardTitle>Micro-prêts</CardTitle>
          <CardDescription>
            Liste des micro-prêts ({filteredLoans.length} résultats)
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
                        Taux
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Durée
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Échéance
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
                    {filteredLoans.length === 0 ? (
                      <tr>
                        <td
                          colSpan={7}
                          className="px-6 py-8 text-center text-muted-foreground"
                        >
                          Aucun micro-prêt trouvé
                        </td>
                      </tr>
                    ) : (
                      filteredLoans.map((loan) => {
                        const statusBadge = getStatusBadge(loan.status);
                        return (
                          <tr key={loan.id} className="hover:bg-muted/50">
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              {loan.farmer?.name || "N/A"}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                              ₳ {Number(loan.amountADA).toFixed(2)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                              {loan.interestRate}%
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                              {loan.durationDays} jours
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                              {loan.dueDate
                                ? new Date(loan.dueDate).toLocaleDateString()
                                : "N/A"}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <Badge
                                variant={statusBadge.variant}
                                className={statusBadge.className}
                              >
                                {statusBadge.label}
                              </Badge>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                              <div className="flex items-center gap-1">
                                {/* Quick Actions based on status */}
                                {loan.status === LoanStatus.PENDING && (
                                  <>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleApprove(loan)}
                                      className="text-green-600 hover:text-green-700 hover:bg-green-50"
                                      title="Approuver"
                                    >
                                      <CheckCircle className="h-4 w-4" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleReject(loan)}
                                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                      title="Rejeter"
                                    >
                                      <XCircle className="h-4 w-4" />
                                    </Button>
                                  </>
                                )}
                                {(loan.status === LoanStatus.APPROVED ||
                                  loan.status === LoanStatus.PENDING) && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleActivate(loan)}
                                    className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                                    title="Activer"
                                  >
                                    <Play className="h-4 w-4" />
                                  </Button>
                                )}
                                {loan.status === LoanStatus.ACTIVE && (
                                  <>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleRepay(loan)}
                                      className="text-green-600 hover:text-green-700 hover:bg-green-50"
                                      title="Marquer remboursé"
                                    >
                                      <CheckCircle className="h-4 w-4" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleDefault(loan)}
                                      className="text-orange-600 hover:text-orange-700 hover:bg-orange-50"
                                      title="Marquer en défaut"
                                    >
                                      <AlertTriangle className="h-4 w-4" />
                                    </Button>
                                  </>
                                )}
                                {/* More actions menu */}
                                <Popover>
                                  <PopoverTrigger asChild>
                                    <Button variant="ghost" size="sm">
                                      <MoreVertical className="h-4 w-4" />
                                    </Button>
                                  </PopoverTrigger>
                                  <PopoverContent
                                    align="end"
                                    className="w-48 p-2"
                                  >
                                    <div className="space-y-1">
                                      <button
                                        onClick={() => handleViewDetails(loan)}
                                        className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm hover:bg-accent transition-colors"
                                      >
                                        <Eye className="h-4 w-4" />
                                        Voir détails
                                      </button>
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
                              </div>
                            </td>
                          </tr>
                        );
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
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Nouveau micro-prêt</DialogTitle>
            <DialogDescription>
              Étapes {currentStep} sur {steps.length}:{" "}
              {steps[currentStep - 1].title}
            </DialogDescription>
          </DialogHeader>

          {/* Stepper Indicator */}
          <div className="flex items-center justify-center mb-6 mt-2">
            {steps.map((step, index) => (
              <React.Fragment key={step.number}>
                <div className="flex flex-col items-center">
                  <div
                    className={`flex items-center justify-center w-8 h-8 rounded-full border-2 text-sm font-bold transition-colors ${
                      currentStep === step.number
                        ? "border-[#3A8F4C] bg-[#3A8F4C] text-white"
                        : currentStep > step.number
                          ? "border-[#3A8F4C] bg-[#3A8F4C] text-white"
                          : "border-muted-foreground text-muted-foreground"
                    }`}
                  >
                    {currentStep > step.number ? (
                      <CheckCircle className="h-5 w-5" />
                    ) : (
                      step.number
                    )}
                  </div>
                  <span
                    className={`text-xs mt-1 ${
                      currentStep === step.number
                        ? "font-medium text-[#3A8F4C]"
                        : "text-muted-foreground"
                    }`}
                  >
                    {step.title}
                  </span>
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`h-[2px] w-12 mx-2 mb-4 ${
                      currentStep > step.number + 1
                        ? "bg-[#3A8F4C]"
                        : "bg-muted"
                    }`}
                  />
                )}
              </React.Fragment>
            ))}
          </div>

          <form onSubmit={handleSubmitAdd}>
            <div className="grid gap-4 py-4">
              {/* Step 1: Informations du Prêt (Éligibilité + Détails) */}
              {currentStep === 1 && (
                <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                  <div className="grid gap-2">
                    <Label htmlFor="farmerId">Agriculteur *</Label>
                    <Select
                      value={formData.farmerId}
                      onValueChange={(value) => {
                        setFormData({ ...formData, farmerId: value });
                        if (formData.amountADA > 0) {
                          checkEligibility(value, formData.amountADA);
                        }
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner un agriculteur" />
                      </SelectTrigger>
                      <SelectContent>
                        {farmers.map((farmer) => (
                          <SelectItem key={farmer.id} value={farmer.id}>
                            {farmer.name} - {farmer.city}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="amountADA">Montant (₳) *</Label>
                    <Input
                      id="amountADA"
                      type="number"
                      step="0.01"
                      min="1"
                      value={formData.amountADA}
                      onChange={(e) => {
                        const amount = parseFloat(e.target.value) || 0;
                        setFormData({ ...formData, amountADA: amount });
                        if (formData.farmerId) {
                          checkEligibility(formData.farmerId, amount);
                        }
                      }}
                      required
                    />
                  </div>

                  {/* Eligibility Check Display */}
                  {formData.farmerId && formData.amountADA > 0 && (
                    <div
                      className={`p-4 rounded-lg border ${
                        checkingEligibility
                          ? "bg-gray-50"
                          : eligibility?.eligible
                            ? "bg-green-50 border-green-200"
                            : "bg-red-50 border-red-200"
                      }`}
                    >
                      {checkingEligibility ? (
                        <div className="flex items-center gap-2 text-gray-600">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Vérification de l'éligibilité...
                        </div>
                      ) : eligibility ? (
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            {eligibility.eligible ? (
                              <CheckCircle className="h-5 w-5 text-green-600" />
                            ) : (
                              <XCircle className="h-5 w-5 text-red-600" />
                            )}
                            <span
                              className={`font-medium ${
                                eligibility.eligible
                                  ? "text-green-700"
                                  : "text-red-700"
                              }`}
                            >
                              {eligibility.eligible
                                ? "Éligible pour ce prêt"
                                : "Non éligible"}
                            </span>
                          </div>
                          <div className="text-sm space-y-1">
                            <p>
                              Score de crédit:{" "}
                              <strong>{eligibility.creditScore}</strong>{" "}
                              (minimum: {eligibility.minimumScoreRequired})
                            </p>
                            <p>
                              Montant max autorisé:{" "}
                              <strong>₳ {eligibility.maxAmountAllowed}</strong>
                            </p>
                            <p>Prêts actifs: {eligibility.activeLoansCount}</p>
                            {eligibility.reason && (
                              <p className="text-red-600 mt-2">
                                ⚠️ {eligibility.reason}
                              </p>
                            )}
                          </div>
                        </div>
                      ) : null}
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4">
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
                          setFormData({
                            ...formData,
                            interestRate: parseFloat(e.target.value) || 0,
                          })
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
                          setFormData({
                            ...formData,
                            durationDays: parseInt(e.target.value) || 0,
                          })
                        }
                        required
                      />
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="loanContractHash">
                      Hash du smart contract *
                    </Label>
                    <Input
                      id="loanContractHash"
                      value={formData.loanContractHash}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          loanContractHash: e.target.value,
                        })
                      }
                      placeholder="0x..."
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label>Date d'échéance (optionnel)</Label>
                    <DatePicker
                      date={selectedDueDate}
                      onDateChange={(date) => {
                        setSelectedDueDate(date);
                        if (date) {
                          // Calculate duration in days from today
                          const today = new Date();
                          const diffTime = date.getTime() - today.getTime();
                          const diffDays = Math.ceil(
                            diffTime / (1000 * 60 * 60 * 24)
                          );
                          if (diffDays > 0) {
                            setFormData({
                              ...formData,
                              durationDays: diffDays,
                            });
                          }
                        }
                      }}
                      placeholder="Sélectionner la date d'échéance"
                      minDate={new Date()}
                    />
                    <p className="text-xs text-muted-foreground">
                      Si non sélectionnée, l'échéance sera calculée à partir de
                      la durée
                    </p>
                  </div>
                </div>
              )}

              {/* Step 2: Documents */}
              {currentStep === 2 && (
                <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                  <div className="grid gap-2">
                    <Label htmlFor="identificationNumber">
                      Numéro d'identification
                    </Label>
                    <Input
                      id="identificationNumber"
                      value={formData.identificationNumber || ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          identificationNumber: e.target.value,
                        })
                      }
                      placeholder="CNI, Passeport, etc."
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="loanPurpose">Objet du prêt</Label>
                    <Input
                      id="loanPurpose"
                      value={formData.loanPurpose || ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          loanPurpose: e.target.value,
                        })
                      }
                      placeholder="Ex: Achat de semences, engrais..."
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <FileUpload
                      label="Photo CNI/Passeport"
                      value={formData.idCardPhotoUrl}
                      onChange={(url) =>
                        setFormData({ ...formData, idCardPhotoUrl: url })
                      }
                      accept="image/*"
                      placeholder="Photo d'identité"
                    />
                    <FileUpload
                      label="Justificatif Récolte"
                      value={formData.harvestProofUrl}
                      onChange={(url) =>
                        setFormData({ ...formData, harvestProofUrl: url })
                      }
                      accept="image/*,.pdf"
                      placeholder="Justificatif"
                    />
                  </div>

                  <FileUpload
                    label="Garantie / Caution"
                    value={formData.guaranteeDocumentUrl}
                    onChange={(url) =>
                      setFormData({ ...formData, guaranteeDocumentUrl: url })
                    }
                    accept="image/*,.pdf"
                    placeholder="Document de garantie (optionnel)"
                  />
                </div>
              )}
            </div>

            <DialogFooter className="flex justify-between sm:justify-between">
              {currentStep > 1 ? (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setCurrentStep(currentStep - 1)}
                >
                  Précédent
                </Button>
              ) : (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsAddDialogOpen(false)}
                >
                  Annuler
                </Button>
              )}

              {currentStep < 2 ? (
                <Button
                  type="button"
                  onClick={() => setCurrentStep(currentStep + 1)}
                  className="bg-[#3A8F4C] hover:bg-[#2E7D32]"
                  disabled={
                    currentStep === 1 &&
                    (!formData.farmerId ||
                      formData.amountADA <= 0 ||
                      formData.interestRate === undefined ||
                      formData.interestRate === null ||
                      !formData.durationDays ||
                      !formData.loanContractHash)
                  }
                >
                  Suivant
                </Button>
              ) : (
                <Button
                  type="submit"
                  className="bg-[#3A8F4C] hover:bg-[#2E7D32]"
                  disabled={createMutation.isPending}
                >
                  {createMutation.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Création...
                    </>
                  ) : (
                    "Créer le prêt"
                  )}
                </Button>
              )}
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
                <Select
                  value={updateData.status}
                  onValueChange={(value) =>
                    setUpdateData({
                      ...updateData,
                      status: value as LoanStatus,
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={LoanStatus.PENDING}>
                      En attente
                    </SelectItem>
                    <SelectItem value={LoanStatus.APPROVED}>
                      Approuvé
                    </SelectItem>
                    <SelectItem value={LoanStatus.ACTIVE}>Actif</SelectItem>
                    <SelectItem value={LoanStatus.REPAID}>Remboursé</SelectItem>
                    <SelectItem value={LoanStatus.DEFAULTED}>
                      En défaut
                    </SelectItem>
                    <SelectItem value={LoanStatus.REJECTED}>Rejeté</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-loanContractHash">
                  Hash du smart contract
                </Label>
                <Input
                  id="edit-loanContractHash"
                  value={updateData.loanContractHash || ""}
                  onChange={(e) =>
                    setUpdateData({
                      ...updateData,
                      loanContractHash: e.target.value,
                    })
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

      {/* Details Dialog */}
      <Dialog open={isDetailsDialogOpen} onOpenChange={setIsDetailsDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Détails du prêt</DialogTitle>
            <DialogDescription>
              Informations complètes sur le micro-prêt
            </DialogDescription>
          </DialogHeader>
          {selectedLoan && (
            <div className="space-y-6">
              {/* Farmer Info */}
              <div className="bg-muted/50 rounded-lg p-4">
                <h4 className="font-medium mb-2">Agriculteur</h4>
                <p className="text-lg">{selectedLoan.farmer?.name || "N/A"}</p>
              </div>

              {/* Loan Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Montant</p>
                  <p className="text-xl font-bold">
                    ₳ {Number(selectedLoan.amountADA).toFixed(2)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">À rembourser</p>
                  <p className="text-xl font-bold text-[#3A8F4C]">
                    ₳ {calculateRepaymentAmount(selectedLoan).toFixed(2)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">
                    Taux d'intérêt
                  </p>
                  <p className="font-medium">{selectedLoan.interestRate}%</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Durée</p>
                  <p className="font-medium">
                    {selectedLoan.durationDays} jours
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Statut</p>
                  <Badge
                    variant={getStatusBadge(selectedLoan.status).variant}
                    className={getStatusBadge(selectedLoan.status).className}
                  >
                    {getStatusBadge(selectedLoan.status).label}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">
                    Date d'échéance
                  </p>
                  <p className="font-medium">
                    {selectedLoan.dueDate
                      ? new Date(selectedLoan.dueDate).toLocaleDateString()
                      : "N/A"}
                  </p>
                </div>
              </div>

              {/* Dates */}
              <div className="border-t pt-4">
                <h4 className="font-medium mb-2">Historique</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Créé le</span>
                    <span>
                      {new Date(selectedLoan.createdAt).toLocaleString()}
                    </span>
                  </div>
                  {selectedLoan.approvedAt && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Approuvé le</span>
                      <span>
                        {new Date(selectedLoan.approvedAt).toLocaleString()}
                      </span>
                    </div>
                  )}
                  {selectedLoan.startDate && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Activé le</span>
                      <span>
                        {new Date(selectedLoan.startDate).toLocaleString()}
                      </span>
                    </div>
                  )}
                  {selectedLoan.repaidAt && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        Remboursé le
                      </span>
                      <span>
                        {new Date(selectedLoan.repaidAt).toLocaleString()}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Rejection reason */}
              {selectedLoan.rejectionReason && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <h4 className="font-medium text-red-700 mb-1">
                    Raison du rejet
                  </h4>
                  <p className="text-red-600">{selectedLoan.rejectionReason}</p>
                </div>
              )}

              {/* Contract Hash */}
              <div className="border-t pt-4">
                <h4 className="font-medium mb-2">Smart Contract</h4>
                <code className="text-xs bg-muted px-2 py-1 rounded break-all">
                  {selectedLoan.loanContractHash}
                </code>
              </div>

              {/* Transaction Hash Link */}
              {selectedLoan.transactionHash && (
                <div className="border-t pt-4">
                  <h4 className="font-medium mb-2">Transaction Blockchain</h4>
                  <Button
                    variant="outline"
                    className="w-full flex items-center justify-center gap-2"
                    onClick={() =>
                      window.open(
                        `https://preprod.cardanoscan.io/transaction/${selectedLoan.transactionHash}`,
                        "_blank"
                      )
                    }
                  >
                    <Eye className="h-4 w-4" />
                    Voir sur Cardanoscan
                  </Button>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDetailsDialogOpen(false)}
            >
              Fermer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Supprimer le micro-prêt</DialogTitle>
            <DialogDescription>
              Êtes-vous sûr de vouloir supprimer le micro-prêt de{" "}
              <strong>{selectedLoan?.farmer?.name || "N/A"}</strong> ? Cette
              action est irréversible.
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

      {/* Wallet Connect Dialog */}
      <WalletConnectDialog
        open={isWalletDialogOpen}
        onOpenChange={setIsWalletDialogOpen}
      />

      {/* Reject Dialog */}
      <Dialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Rejeter le prêt</DialogTitle>
            <DialogDescription>
              Indiquez la raison du rejet du prêt de{" "}
              <strong>{selectedLoan?.farmer?.name || "N/A"}</strong>
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Label htmlFor="rejectionReason">Raison du rejet *</Label>
            <textarea
              id="rejectionReason"
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              className="mt-2 w-full min-h-[100px] px-3 py-2 border rounded-md text-sm"
              placeholder="Ex: Score de crédit insuffisant, trop de prêts actifs..."
              required
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsRejectDialogOpen(false);
                setRejectionReason("");
              }}
              disabled={rejectMutation.isPending}
            >
              Annuler
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmReject}
              disabled={rejectMutation.isPending || !rejectionReason}
            >
              {rejectMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Rejet...
                </>
              ) : (
                "Rejeter"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
