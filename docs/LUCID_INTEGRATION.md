# Lucid-Cardano Integration Guide

This document explains how to use the Aiken smart contracts with Lucid-Cardano in the MkulimaChain frontend.

## Overview

The integration provides TypeScript services for interacting with 4 main smart contracts:

1. **Order Contract** - Manage order lifecycle on-chain
2. **Loan Contract** - Handle DeFi micro-loans
3. **Escrow Contract** - Secure payments with arbitration
4. **Auth Contract** - On-chain authentication

## Quick Start

### 1. Install Dependencies

```bash
cd apps/web
npm install lucid-cardano@^0.10.7
```

### 2. Extract Contract Codes

```bash
node scripts/extract-plutus.ts
```

This generates:
- `.env.contracts` - Environment variables
- `lib/contract-codes.ts` - TypeScript constants

### 3. Configure Environment

Copy `.env.contracts` to `.env.local`:

```bash
cat .env.contracts >> .env.local
```

Add these additional variables:

```env
NEXT_PUBLIC_BLOCKFROST_API_KEY=your_preprod_api_key
NEXT_PUBLIC_CARDANO_NETWORK=Preprod
NEXT_PUBLIC_PLATFORM_ADDRESS=addr_test1...
```

## Usage Examples

### Order Contract

```typescript
import { useOrderContract } from "@/hooks/use-order-contract";

function MyComponent() {
  const { createOrder, isLoading, error, txHash } = useOrderContract();

  const handleCreate = async () => {
    try {
      const hash = await createOrder({
        itemId: "item_123",
        quantityKg: 10,
        pricePerKgADA: 5.0,
        sellerAddress: "addr_test1...",
        platformAddress: "addr_test1...",
        platformFeePercent: 5,
      });

      console.log("Order created:", hash);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <button onClick={handleCreate} disabled={isLoading}>
      {isLoading ? "Creating..." : "Create Order"}
    </button>
  );
}
```

### Loan Contract

```typescript
import { Lucid } from "lucid-cardano";
import { LoanContractService } from "@/services/lucid/loan-contract.service";
import { initLucid } from "@/lib/lucid";

async function requestLoan() {
  // Initialize Lucid
  const lucid = await initLucid();

  // Connect wallet
  const walletApi = await window.cardano.nami.enable();
  lucid.selectWallet(walletApi);

  // Create service
  const loanService = new LoanContractService(lucid);

  // Request loan
  const txHash = await loanService.requestLoan({
    amountADA: 100,
    interestRate: 5, // 5%
    durationDays: 30,
    lenderAddress: "addr_test1...",
    platformAddress: "addr_test1...",
  });

  console.log("Loan requested:", txHash);
}
```

## Wallet Integration

### Connect Wallet

```typescript
import { initLucid } from "@/lib/lucid";

async function connectWallet() {
  const lucid = await initLucid();

  // Nami Wallet
  if (window.cardano?.nami) {
    const api = await window.cardano.nami.enable();
    lucid.selectWallet(api);
    return lucid;
  }

  // Eternl Wallet
  if (window.cardano?.eternl) {
    const api = await window.cardano.eternl.enable();
    lucid.selectWallet(api);
    return lucid;
  }

  throw new Error("No wallet found");
}
```

### Get Wallet Address

```typescript
const address = await lucid.wallet.address();
console.log("Wallet address:", address);
```

### Get UTxOs

```typescript
const utxos = await lucid.wallet.getUtxos();
console.log("Available UTxOs:", utxos);
```

## Contract Services API

### OrderContractService

**Methods:**
- `createOrder(params)` - Create new order
- `payOrder(params)` - Pay for order
- `shipOrder(params)` - Mark as shipped
- `completeOrder(params)` - Complete and distribute funds
- `cancelOrder(params)` - Cancel order
- `getOrderUtxos()` - Get all orders

**Example:**

```typescript
const service = new OrderContractService(lucid);
const scriptAddress = service.getScriptAddress();
console.log("Script address:", scriptAddress);
```

### LoanContractService

**Methods:**
- `requestLoan(params)` - Request new loan
- `approveLoan(params)` - Approve loan (admin)
- `activateLoan(params)` - Activate and release funds
- `repayLoan(params)` - Repay with interest
- `markDefaulted(params)` - Mark as defaulted
- `rejectLoan(params)` - Reject loan request
- `calculateRepaymentAmount(amount, rate)` - Calculate repayment

##Error Handling

### Common Errors

| Error | Cause | Solution |
|-------|-------|----------|
| "No wallet found" | Wallet not installed | Install Nami/Eternl |
| "Insufficient funds" | Not enough ADA | Add test ADA |
| "Script execution failed" | Contract validation failed | Check datum/redeemer |
| "UTxO not found" | Already spent | Refresh UTxOs |

### Error Handling Pattern

```typescript
try {
  const hash = await createOrder(params);
  toast.success(`Success! Tx: ${hash}`);
} catch (error: any) {
  if (error.message.includes("insufficient funds")) {
    toast.error("Not enough ADA in wallet");
  } else if (error.message.includes("user declined")) {
    toast.info("Transaction cancelled");
  } else {
    toast.error(error.message || "Transaction failed");
  }
}
```

## Testing on Testnet

### 1. Get Test ADA

Visit Cardano Testnet Faucet:
- https://docs.cardano.org/cardano-testnet/tools/faucet

### 2. Switch Wallet to Testnet

In Nami/Eternl settings:
- Network: Preprod Testnet

### 3. Verify Contract Addresses

```typescript
const lucid = await initLucid();
const service = new OrderContractService(lucid);
const address = service.getScriptAddress();

console.log("Order contract address:", address);
// Should start with "addr_test1"
```

## Transaction Lifecycle

### 1. Build Transaction

```typescript
const tx = await lucid.newTx()
  .payToContract(scriptAddress, { inline: datum }, { lovelace: amount })
  .complete();
```

### 2. Sign Transaction

```typescript
const signedTx = await tx.sign().complete();
```

### 3. Submit Transaction

```typescript
const txHash = await signedTx.submit();
```

### 4. Wait for Confirmation

```typescript
await lucid.awaitTx(txHash);
console.log("Confirmed!");
```

## Best Practices

### ✅ Do

- Always validate input data before transactions
- Handle all errors with user-friendly messages
- Show loading states during transactions
- Verify contract addresses before use
- Test on testnet extensively
- Use toast notifications for feedback
- Store TX hashes for tracking

### ❌ Don't

- Don't hardcode private keys
- Don't ignore error handling
- Don't skip testnet testing
- Don't use mainnet for testing
- Don't assume wallet is connected
- Don't forget collateral for Plutus scripts

## Troubleshooting

### Wallet Not Connecting

```typescript
// Check if wallet is available
if (!window.cardano) {
  console.error("No Cardano wallet extension found");
  // Prompt user to install wallet
}
```

### Transaction Timeout

```typescript
// Increase timeout
await lucid.awaitTx(txHash, 90000); // 90 seconds
```

### Datum Parsing Errors

```typescript
// Ensure datum structure matches Aiken exactly
const datum = Data.to(
  new Constr(0, [
    // Fields must match order in Aiken contract
    field1,
    field2,
    // ...
  ])
);
```

## Resources

- [Lucid Documentation](https://lucid.spacebudz.io/)
- [Aiken Documentation](https://aiken-lang.org/)
- [Cardano Developer Portal](https://developers.cardano.org/)
- [MeshJS Documentation](https://meshjs.dev/) (for comparison)

## Support

For issues or questions:
1. Check the error handling section
2. Review contract documentation in `contracts/SMART_CONTRACTS_GUIDE.md`
3. Test on Cardano Preprod testnet
4. Contact the development team
