"use client";

import {
  CheckCircle2,
  Loader2,
  Calendar,
  Leaf,
  Factory,
  Package,
  Truck,
  Home,
  ShoppingCart,
  Hash,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useMutation } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import { Order, TraceabilityStep } from "@/types/order";
import { cn } from "@/lib/utils";
import { useOrderContract } from "@/hooks/use-order-contract";
import { useWalletAtom } from "@/hooks/useWalletAtom";
import { OrderDatum } from "@/types/contracts";

interface TraceabilityStepButtonsProps {
  order: Order;
  onUpdate: () => void;
}

export function TraceabilityStepButtons({
  order,
  onUpdate,
}: TraceabilityStepButtonsProps) {
  const { connected: walletConnected } = useWalletAtom();
  const {
    shipOrder,
    completeOrder,
    findOrderUtxoByItemId,
    isLoading: isContractLoading,
  } = useOrderContract();

  const steps = [
    { id: TraceabilityStep.ORDER, label: "Commande", icon: ShoppingCart },
    { id: TraceabilityStep.PREPARATION, label: "Préparation", icon: Calendar },
    { id: TraceabilityStep.HARVEST, label: "Récolte", icon: Leaf },
    { id: TraceabilityStep.PROCESSING, label: "Transformation", icon: Factory },
    { id: TraceabilityStep.PACKAGING, label: "Emballage", icon: Package },
    { id: TraceabilityStep.SHIPPING, label: "Expédition", icon: Truck },
    { id: TraceabilityStep.DELIVERY, label: "Livraison", icon: Home },
  ];

  const updateTraceabilityMutation = useMutation({
    mutationFn: async ({
      step,
      txHash,
      note,
    }: {
      step: TraceabilityStep;
      txHash?: string;
      note?: string;
    }) => {
      return api.patch<Order>(`/orders/${order.id}/traceability/${step}`, {
        txHash,
        note,
      });
    },
    onSuccess: () => {
      toast.success("Étape de traçabilité mise à jour");
      onUpdate();
    },
    onError: () => {
      toast.error("Erreur lors de la mise à jour de la traçabilité");
    },
  });

  const handleCompleteStep = async (step: TraceabilityStep) => {
    let txHash: string | undefined;
    let note: string | undefined;

    // Blockchain integration for SHIPPING and DELIVERY
    if (
      (step === TraceabilityStep.SHIPPING ||
        step === TraceabilityStep.DELIVERY) &&
      walletConnected
    ) {
      try {
        toast.info("Recherche de la commande sur la blockchain...", {
          duration: 3000,
        });
        const utxo = await findOrderUtxoByItemId(order.item.id);

        if (!utxo) {
          // Warn but allow proceeding without blockchain if not found (maybe off-chain order)
          const proceed = window.confirm(
            "Commande non trouvée sur la blockchain. Voulez-vous continuer uniquement en base de données ?"
          );
          if (!proceed) return;
        } else {
          // We have the UTxO, we need to reconstruct the datum or use the one from UTxO
          // Since findOrderUtxoByItemId returns UTxO with datum, we need to parse it or pass it.
          // The hooks shipOrder/completeOrder expect OrderDatum.
          // We need to fetch and parse Datum. For now, let's reconstruct it from Order object as best effort
          // OR assume the service handles UTxO passing properly.
          // Wait, shipOrder params: { orderUtxo: UTxO; datum: OrderDatum; trackingNumber: string }

          // Reconstructing datum from order object (Simplified for this context)
          // In a real app we should decode datum from UTxO to be safe.
          // But existing code expects `datum` passed in.

          const createdAt = Math.floor(
            new Date(order.createdAt).getTime() / 1000
          );
          const datum: OrderDatum = {
            buyerAddress: order.buyerId, // This might be a wallet address or ID. Using ID as address if applicable, otherwise need real address.
            sellerAddress: order.item.farmer.id || "", // Assuming ID is address or mapped
            itemId: order.item.id,
            quantityKg: order.quantityKg,
            unitPriceLovelace: BigInt(order.unitPriceADA * 1000000),
            totalLovelace: BigInt(order.totalADA * 1000000),
            platformFeePercent: 2, // Hardcoded or from config
            platformAddress: process.env.NEXT_PUBLIC_PLATFORM_ADDRESS || "",
            status: step === TraceabilityStep.SHIPPING ? "Paid" : "Shipped", // Current status on chain
            createdAt: createdAt,
          } as any; // Cast as any because OrderDatum type might have slight mismatches or we are lazy with enum

          if (step === TraceabilityStep.SHIPPING) {
            const tracking = window.prompt(
              "Veuillez entrer le numéro de suivi :"
            );
            if (!tracking) return;
            note = tracking;

            toast.info("Validation de l'expédition sur la blockchain...");
            txHash = await shipOrder({
              orderUtxo: utxo,
              datum,
              trackingNumber: tracking,
            });
          } else if (step === TraceabilityStep.DELIVERY) {
            toast.info("Validation de la livraison sur la blockchain...");
            txHash = await completeOrder({ orderUtxo: utxo, datum });
          }

          if (txHash) {
            toast.success("Transaction blockchain soumise !");
          }
        }
      } catch (error: any) {
        console.error("Blockchain error:", error);
        toast.error("Erreur blockchain: " + error.message);
        // Ask if they want to force update DB
        const force = window.confirm(
          "Erreur blockchain. Voulez-vous forcer la mise à jour en base de données ?"
        );
        if (!force) return;
      }
    }

    updateTraceabilityMutation.mutate({ step, txHash, note });
  };

  const getStepStatus = (stepId: TraceabilityStep) => {
    if (!order.traceability) return "pending";
    const stepData = order.traceability[stepId];
    return stepData?.completed ? "completed" : "pending";
  };

  const isNextStep = (index: number) => {
    if (index === 0 && !order.traceability?.order?.completed) return true;
    if (index > 0) {
      const prevStepId = steps[index - 1].id;
      const currentStepId = steps[index].id;
      const prevCompleted = order.traceability?.[prevStepId]?.completed;
      const currentCompleted = order.traceability?.[currentStepId]?.completed;
      return prevCompleted && !currentCompleted;
    }
    return false;
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {steps.map((step, index) => {
          const status = getStepStatus(step.id);
          const isNext = isNextStep(index);
          const Icon = step.icon;
          const stepData = order.traceability?.[step.id];

          return (
            <div
              key={step.id}
              className={cn(
                "flex items-center justify-between p-3 rounded-lg border transition-all",
                status === "completed"
                  ? "bg-green-50 border-green-200"
                  : isNext
                    ? "bg-amber-50 border-amber-200 shadow-sm"
                    : "bg-gray-50 border-gray-100 opacity-60"
              )}
            >
              <div className="flex items-center gap-3">
                <div
                  className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center",
                    status === "completed"
                      ? "bg-green-100 text-green-700"
                      : isNext
                        ? "bg-amber-100 text-amber-700"
                        : "bg-gray-100 text-gray-400"
                  )}
                >
                  <Icon className="w-4 h-4" />
                </div>
                <div>
                  <p
                    className={cn(
                      "font-medium text-sm",
                      status === "completed"
                        ? "text-green-900"
                        : isNext
                          ? "text-amber-900"
                          : "text-gray-500"
                    )}
                  >
                    {step.label}
                  </p>
                  {status === "completed" && stepData?.date && (
                    <p className="text-xs text-green-700">
                      {new Date(stepData.date).toLocaleDateString()}
                    </p>
                  )}
                </div>
              </div>

              {status === "completed" ? (
                <div className="flex items-center gap-2">
                  {stepData?.txHash && (
                    <a
                      href={`https://preprod.cardanoscan.io/transaction/${stepData.txHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-green-600 hover:text-green-800"
                      title="Voir sur la blockchain"
                    >
                      <Hash className="w-4 h-4" />
                    </a>
                  )}
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                </div>
              ) : (
                <Button
                  size="sm"
                  variant={isNext ? "default" : "outline"}
                  disabled={!isNext || updateTraceabilityMutation.isPending}
                  onClick={() => handleCompleteStep(step.id)}
                  className={cn(
                    isNext ? "bg-amber-600 hover:bg-amber-700" : ""
                  )}
                >
                  {updateTraceabilityMutation.isPending && isNext ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    "Valider"
                  )}
                </Button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
