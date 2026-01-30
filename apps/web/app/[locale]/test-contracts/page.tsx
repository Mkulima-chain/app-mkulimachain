"use client";

import { OrderContractExample } from "@/components/examples/order-contract-example";
import { LoanContractExample } from "@/components/examples/loan-contract-example";
import { EscrowContractExample } from "@/components/examples/escrow-contract-example";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { WalletConnectionBanner } from "@/components/wallet-connection-banner";

export default function TestContractsPage() {
  return (
    <div className="container mx-auto py-10">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Smart Contracts Test Page</h1>
        <p className="text-gray-600">
          Test your Aiken smart contracts with Lucid-Cardano on Preprod Testnet
        </p>
      </div>

      <WalletConnectionBanner />

      <Tabs defaultValue="order" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="order">Orders</TabsTrigger>
          <TabsTrigger value="loan">Loans</TabsTrigger>
          <TabsTrigger value="escrow">Escrow</TabsTrigger>
        </TabsList>

        <TabsContent value="order" className="mt-6">
          <OrderContractExample />
        </TabsContent>

        <TabsContent value="loan" className="mt-6">
          <LoanContractExample />
        </TabsContent>

        <TabsContent value="escrow" className="mt-6">
          <EscrowContractExample />
        </TabsContent>
      </Tabs>

      <div className="mt-12 p-6 bg-yellow-50 border border-yellow-200 rounded-lg">
        <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
          <span>⚠️</span> Important Notes
        </h3>
        <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
          <li>
            This is <strong>Cardano Preprod Testnet</strong> - not real money
          </li>
          <li>
            You need <strong>Nami or Eternl wallet</strong> configured on
            testnet
          </li>
          <li>
            Get free test ₳ from:{" "}
            <a
              href="https://docs.cardano.org/cardano-testnet/tools/faucet"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 underline"
            >
              Cardano Faucet
            </a>
          </li>
          <li>Transactions take ~20-30 seconds to confirm</li>
          <li>Check console (F12) for detailed logs and errors</li>
        </ul>
      </div>

      <div className="mt-6 p-6 bg-blue-50 border border-blue-200 rounded-lg">
        <h3 className="text-lg font-semibold mb-2">Quick Start Guide</h3>
        <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700">
          <li>
            <strong>Connect Wallet:</strong> Make sure Nami/Eternl is installed
            and on Preprod testnet
          </li>
          <li>
            <strong>Get Test ₳:</strong> Request at least 50 t₳ from the faucet
          </li>
          <li>
            <strong>Test Order:</strong> Create an order to test the order
            lifecycle
          </li>
          <li>
            <strong>Test Loan:</strong> Request a loan and see DeFi
            functionality
          </li>
          <li>
            <strong>Test Escrow:</strong> Lock funds securely with arbitration
          </li>
        </ol>
      </div>

      <div className="mt-6 text-center text-sm text-gray-500">
        <p>
          Smart contracts powered by <strong>Aiken</strong> • Frontend with{" "}
          <strong>Lucid-Cardano</strong>
        </p>
        <p className="mt-1">
          For help, check{" "}
          <a
            href="https://github.com/your-repo/docs/TESTING_GUIDE.md"
            className="text-blue-600 underline"
          >
            Testing Guide
          </a>
        </p>
      </div>
    </div>
  );
}
