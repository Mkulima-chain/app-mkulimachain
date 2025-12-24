"use client";

import { useState } from "react";
import { useEscrowContract } from "@/hooks/use-escrow-contract";
import { useCardanoWallet } from "@/hooks/use-cardano-wallet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

/**
 * Component for managing escrow payments
 */
export function EscrowContractExample() {
  const { connected } = useCardanoWallet();
  const { isLoading, error, txHash, lockFunds, getEscrows } =
    useEscrowContract();

  const [formData, setFormData] = useState({
    amountADA: 0,
    beneficiaryAddress: "",
    arbiterAddress: "",
    deadlineHours: 24,
    description: "",
  });

  const handleLockFunds = async () => {
    try {
      const hash = await lockFunds(formData);

      toast.success(`Funds locked! Tx: ${hash.slice(0, 12)}...`);
    } catch (err: any) {
      toast.error(err.message || "Failed to lock funds");
    }
  };

  const handleGetEscrows = async () => {
    try {
      const escrows = await getEscrows();
      toast.info(`Found ${escrows.length} escrows`);
      console.log("Escrows:", escrows);
    } catch (err: any) {
      toast.error(err.message || "Failed to fetch escrows");
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Escrow Payment (Secure)</h2>

        <div className="space-y-2">
          <label className="text-sm font-medium">Amount (\u20b3)</label>
          <Input
            type="number"
            placeholder="50"
            value={formData.amountADA || ""}
            onChange={(e) =>
              setFormData({
                ...formData,
                amountADA: parseFloat(e.target.value) || 0,
              })
            }
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Beneficiary Address</label>
          <Input
            placeholder="addr_test1..."
            value={formData.beneficiaryAddress}
            onChange={(e) =>
              setFormData({ ...formData, beneficiaryAddress: e.target.value })
            }
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Arbiter Address</label>
          <Input
            placeholder="addr_test1..."
            value={formData.arbiterAddress}
            onChange={(e) =>
              setFormData({ ...formData, arbiterAddress: e.target.value })
            }
          />
          <p className="text-xs text-gray-500">
            Platform or trusted third party
          </p>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Deadline (hours)</label>
          <Input
            type="number"
            placeholder="24"
            value={formData.deadlineHours || ""}
            onChange={(e) =>
              setFormData({
                ...formData,
                deadlineHours: parseInt(e.target.value) || 0,
              })
            }
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Description</label>
          <Input
            placeholder="Payment for order #123"
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
          />
        </div>

        <div className="flex gap-2">
          <Button
            onClick={handleLockFunds}
            disabled={!connected || isLoading}
            className="flex-1"
          >
            {isLoading ? "Locking..." : "Lock Funds"}
          </Button>

          <Button
            onClick={handleGetEscrows}
            disabled={!connected || isLoading}
            variant="outline"
          >
            Get Escrows
          </Button>
        </div>

        {!connected && (
          <p className="text-sm text-orange-600 dark:text-orange-400">
            Please connect your wallet to interact with the contract
          </p>
        )}

        {error && (
          <div className="p-3 bg-red-50 text-red-700 rounded-md text-sm">
            {error}
          </div>
        )}

        {txHash && (
          <div className="p-3 bg-green-50 text-green-700 rounded-md text-sm">
            <p className="font-medium">Success!</p>
            <p className="break-all">Transaction: {txHash}</p>
            <a
              href={`https://preprod.cardanoscan.io/transaction/${txHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 underline"
            >
              View on CardanoScan
            </a>
          </div>
        )}
      </div>

      <div className="mt-8 p-4 bg-blue-50 rounded-md">
        <h3 className="font-semibold mb-2">How it works:</h3>
        <ol className="list-decimal list-inside space-y-1 text-sm text-gray-700">
          <li>Payer locks funds in escrow contract</li>
          <li>Beneficiary can claim after service delivery</li>
          <li>Payer or beneficiary can create dispute</li>
          <li>Arbiter resolves disputes (release, refund, or split)</li>
          <li>Funds automatically released after deadline if no dispute</li>
        </ol>
      </div>
    </div>
  );
}
