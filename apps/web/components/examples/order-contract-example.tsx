"use client";

import { useState } from "react";
import { useOrderContract } from "@/hooks/use-order-contract";
import { useCardanoWallet } from "@/hooks/use-cardano-wallet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

/**
 * Example component demonstrating Order Contract usage
 */
export function OrderContractExample() {
  const { connected } = useCardanoWallet();
  const { isLoading, error, txHash, createOrder, getOrders } =
    useOrderContract();

  const [formData, setFormData] = useState({
    itemId: "",
    quantityKg: 0,
    pricePerKgADA: 0,
    sellerAddress: "",
    platformFeePercent: 5,
  });

  const handleCreateOrder = async () => {
    try {
      // Platform address should come from configuration
      const platformAddress =
        process.env.NEXT_PUBLIC_PLATFORM_ADDRESS || "addr_test1qz...";

      const hash = await createOrder({
        ...formData,
        platformAddress,
      });

      toast.success(`Order created! Tx: ${hash.slice(0, 12)}...`);
    } catch (err: any) {
      toast.error(err.message || "Failed to create order");
    }
  };

  const handleGetOrders = async () => {
    try {
      const orders = await getOrders();
      toast.info(`Found ${orders.length} orders`);
      console.log("Orders:", orders);
    } catch (err: any) {
      toast.error(err.message || "Failed to fetch orders");
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Create Order (On-Chain)</h2>

        <div className="space-y-2">
          <label className="text-sm font-medium">Item ID</label>
          <Input
            placeholder="item_123"
            value={formData.itemId}
            onChange={(e) =>
              setFormData({ ...formData, itemId: e.target.value })
            }
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Quantity (kg)</label>
          <Input
            type="number"
            placeholder="10"
            value={formData.quantityKg || ""}
            onChange={(e) =>
              setFormData({
                ...formData,
                quantityKg: parseFloat(e.target.value) || 0,
              })
            }
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Price per kg (\u20b3)</label>
          <Input
            type="number"
            step="0.01"
            placeholder="5.00"
            value={formData.pricePerKgADA || ""}
            onChange={(e) =>
              setFormData({
                ...formData,
                pricePerKgADA: parseFloat(e.target.value) || 0,
              })
            }
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Seller Address</label>
          <Input
            placeholder="addr_test1..."
            value={formData.sellerAddress}
            onChange={(e) =>
              setFormData({ ...formData, sellerAddress: e.target.value })
            }
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Platform Fee (%)</label>
          <Input
            type="number"
            placeholder="5"
            value={formData.platformFeePercent || ""}
            onChange={(e) =>
              setFormData({
                ...formData,
                platformFeePercent: parseInt(e.target.value) || 0,
              })
            }
          />
        </div>

        <div className="flex gap-2">
          <Button
            onClick={handleCreateOrder}
            disabled={!connected || isLoading}
            className="flex-1"
          >
            {isLoading ? "Creating..." : "Create Order"}
          </Button>

          <Button
            onClick={handleGetOrders}
            disabled={!connected || isLoading}
            variant="outline"
          >
            Get Orders
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
          <li>Connect your Cardano wallet (Nami, Eternl, etc.)</li>
          <li>Fill in the order details</li>
          <li>Click "Create Order" to lock funds on-chain</li>
          <li>The smart contract validates and creates the order</li>
          <li>Order status can be tracked and updated on-chain</li>
        </ol>
      </div>

      <div className="mt-4 p-4 bg-yellow-50 rounded-md text-sm">
        <p className="font-semibold mb-1">⚠️ Testnet Only</p>
        <p className="text-gray-700">
          This is configured for Cardano Preprod testnet. Make sure your wallet
          is on testnet and you have test ADA.
        </p>
      </div>
    </div>
  );
}
