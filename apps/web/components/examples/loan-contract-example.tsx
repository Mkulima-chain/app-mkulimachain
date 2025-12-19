"use client";

import { useState } from "react";
import { useLoanContract } from "@/hooks/use-loan-contract";
import { useCardanoWallet } from "@/hooks/use-cardano-wallet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

/**
 * Component for requesting and managing loans
 */
export function LoanContractExample() {
  const { connected } = useCardanoWallet();
  const {
    isLoading,
    error,
    txHash,
    requestLoan,
    getLoans,
    calculateRepayment,
  } = useLoanContract();

  const [formData, setFormData] = useState({
    amountADA: 0,
    interestRate: 5,
    durationDays: 30,
    lenderAddress: "",
  });

  const [repaymentAmount, setRepaymentAmount] = useState<bigint | null>(null);

  const handleRequestLoan = async () => {
    try {
      const platformAddress =
        process.env.NEXT_PUBLIC_PLATFORM_ADDRESS || "addr_test1qz...";

      const hash = await requestLoan({
        ...formData,
        platformAddress,
      });

      toast.success(`Loan requested! Tx: ${hash.slice(0, 12)}...`);
    } catch (err: any) {
      toast.error(err.message || "Failed to request loan");
    }
  };

  const handleGetLoans = async () => {
    try {
      const loans = await getLoans();
      toast.info(`Found ${loans.length} loans`);
      console.log("Loans:", loans);
    } catch (err: any) {
      toast.error(err.message || "Failed to fetch loans");
    }
  };

  const handleCalculateRepayment = async () => {
    try {
      const amount = BigInt(Math.floor(formData.amountADA * 1_000_000));
      const repayment = await calculateRepayment(amount, formData.interestRate);
      setRepaymentAmount(repayment);

      const repaymentADA = Number(repayment) / 1_000_000;
      toast.info(`Repayment: ${repaymentADA.toFixed(2)} ADA`);
    } catch (err: any) {
      toast.error(err.message || "Failed to calculate");
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Request Loan (DeFi)</h2>

        <div className="space-y-2">
          <label className="text-sm font-medium">Amount (ADA)</label>
          <Input
            type="number"
            placeholder="100"
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
          <label className="text-sm font-medium">Interest Rate (%)</label>
          <Input
            type="number"
            placeholder="5"
            value={formData.interestRate || ""}
            onChange={(e) =>
              setFormData({
                ...formData,
                interestRate: parseInt(e.target.value) || 0,
              })
            }
          />
          <p className="text-xs text-gray-500">Max 50% as per smart contract</p>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Duration (days)</label>
          <Input
            type="number"
            placeholder="30"
            value={formData.durationDays || ""}
            onChange={(e) =>
              setFormData({
                ...formData,
                durationDays: parseInt(e.target.value) || 0,
              })
            }
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Lender Address</label>
          <Input
            placeholder="addr_test1..."
            value={formData.lenderAddress}
            onChange={(e) =>
              setFormData({ ...formData, lenderAddress: e.target.value })
            }
          />
        </div>

        {repaymentAmount && (
          <div className="p-3 bg-blue-50 rounded-md">
            <p className="text-sm font-medium">Total Repayment:</p>
            <p className="text-lg font-bold text-blue-700">
              {(Number(repaymentAmount) / 1_000_000).toFixed(2)} ADA
            </p>
          </div>
        )}

        <div className="flex gap-2">
          <Button
            onClick={handleRequestLoan}
            disabled={!connected || isLoading}
            className="flex-1"
          >
            {isLoading ? "Requesting..." : "Request Loan"}
          </Button>

          <Button
            onClick={handleCalculateRepayment}
            disabled={!connected || isLoading}
            variant="outline"
          >
            Calculate
          </Button>

          <Button
            onClick={handleGetLoans}
            disabled={!connected || isLoading}
            variant="outline"
          >
            Get Loans
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
          <li>Farmer requests a loan with amount, rate, and duration</li>
          <li>Platform/Lender approves the loan</li>
          <li>Funds are released to farmer</li>
          <li>Farmer repays with interest before deadline</li>
          <li>Or loan is marked as defaulted after deadline</li>
        </ol>
      </div>
    </div>
  );
}
