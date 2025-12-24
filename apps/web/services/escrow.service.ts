import {
  Constr,
  Data,
  Lucid,
  SpendingValidator,
  UTxO,
  fromText,
} from "lucid-cardano";
import { NFT } from "../types/nft";
import { PaymentService } from "./payment.service";
import { initLucid } from "@/lib/lucid";

/**
 * Service to manage Escrow transactions using the sale_validator contract with Lucid.
 * Supports: Initiate (List), Complete (Buy), Cancel.
 */
export class EscrowService {
  private static getValidator(): SpendingValidator {
    const code = process.env.NEXT_PUBLIC_PLUTUS_SALE_VALIDATOR_CODE;
    if (!code) {
      throw new Error(
        "Contract code is missing. Set NEXT_PUBLIC_PLUTUS_SALE_VALIDATOR_CODE."
      );
    }
    // Simple hex validation
    if (!/^[0-9a-fA-F]+$/.test(code)) {
      throw new Error("Invalid contract code format (must be hex string).");
    }
    return {
      type: "PlutusV2",
      script: code,
    };
  }

  private static async getLucid(): Promise<Lucid> {
    // Try to get from window first
    if (typeof window !== "undefined" && (window as any).__lucidInstance) {
      return (window as any).__lucidInstance;
    }
    // Initialize new instance
    return await initLucid();
  }

  /**
   * Initiate Escrow (List NFT for Sale)
   * Locks the NFT at the script address with the SaleDatum.
   */
  static async initiateEscrow(
    lucid: Lucid,
    nft: NFT,
    priceADA: number,
    beneficiaries: {
      creator: string;
      schoolFund: string;
      platform: string;
      creatorPercent: number;
      schoolFundPercent: number;
      platformPercent: number;
    }
  ): Promise<string> {
    if (!nft.policyId || !nft.assetName) {
      throw new Error(
        "NFT must be minted (have policyId and assetName) before listing."
      );
    }

    const validator = this.getValidator();
    const scriptAddress = lucid.utils.validatorToAddress(validator);
    const sellerAddress = await lucid.wallet.address();

    // Get payment credential hashes
    const sellerCred = lucid.utils.paymentCredentialOf(sellerAddress);
    const creatorCred = lucid.utils.paymentCredentialOf(beneficiaries.creator);
    const schoolCred = lucid.utils.paymentCredentialOf(
      beneficiaries.schoolFund
    );
    const platformCred = lucid.utils.paymentCredentialOf(
      beneficiaries.platform
    );

    // Convert price to Lovelace
    const priceLovelace = BigInt(Math.floor(priceADA * 1_000_000));

    // Build the Datum matching the Aiken struct
    // SaleDatum { seller, policy, asset_name, price, creator, school, platform, c_%, s_%, p_% }
    const datum = Data.to(
      new Constr(0, [
        sellerCred.hash,
        nft.policyId,
        fromText(nft.assetName),
        priceLovelace,
        creatorCred.hash,
        schoolCred.hash,
        platformCred.hash,
        BigInt(beneficiaries.creatorPercent),
        BigInt(beneficiaries.schoolFundPercent),
        BigInt(beneficiaries.platformPercent),
      ])
    );

    // Build transaction
    const tx = await lucid
      .newTx()
      .payToContract(
        scriptAddress,
        { inline: datum },
        {
          [nft.policyId + fromText(nft.assetName)]: 1n,
          lovelace: 2_000_000n, // Min ADA
        }
      )
      .complete();

    const signedTx = await tx.sign().complete();
    const txHash = await signedTx.submit();

    return txHash;
  }

  /**
   * Complete Escrow (Buy NFT)
   * Spends the UTxO from the script, paying the seller and beneficiaries.
   */
  static async completeEscrow(
    lucid: Lucid,
    scriptUtxo: UTxO,
    beneficiaries: {
      creator: string;
      schoolFund: string;
      platform: string;
      price: bigint;
      creatorPercent: number;
      schoolPercent: number;
      platformPercent: number;
    }
  ): Promise<string> {
    const validator = this.getValidator();
    const buyerAddress = await lucid.wallet.address();
    const buyerCred = lucid.utils.paymentCredentialOf(buyerAddress);

    // Redeemer: Action::Buy { buyer_address }
    const redeemer = Data.to(new Constr(0, [buyerCred.hash]));

    // Calculate split amounts
    const { creatorAmount, schoolAmount, platformAmount } =
      PaymentService.calculateRevenueSplits(Number(beneficiaries.price), {
        creatorPercent: beneficiaries.creatorPercent,
        schoolFundPercent: beneficiaries.schoolPercent,
        platformPercent: beneficiaries.platformPercent,
      });

    // Build transaction
    const tx = await lucid
      .newTx()
      .collectFrom([scriptUtxo], redeemer)
      .attachSpendingValidator(validator)
      .payToAddress(beneficiaries.creator, {
        lovelace: BigInt(creatorAmount),
      })
      .payToAddress(beneficiaries.schoolFund, {
        lovelace: BigInt(schoolAmount),
      })
      .payToAddress(beneficiaries.platform, {
        lovelace: BigInt(platformAmount),
      })
      .addSigner(buyerAddress)
      .complete();

    const signedTx = await tx.sign().complete();
    const txHash = await signedTx.submit();

    return txHash;
  }

  /**
   * Cancel Escrow
   * Returns the NFT to the seller.
   */
  static async cancelEscrow(lucid: Lucid, scriptUtxo: UTxO): Promise<string> {
    const validator = this.getValidator();
    const ownerAddress = await lucid.wallet.address();

    // Redeemer: Cancel (Action index 1)
    const redeemer = Data.to(new Constr(1, []));

    // Build transaction
    const tx = await lucid
      .newTx()
      .collectFrom([scriptUtxo], redeemer)
      .attachSpendingValidator(validator)
      .addSigner(ownerAddress)
      .complete();

    const signedTx = await tx.sign().complete();
    const txHash = await signedTx.submit();

    return txHash;
  }
}
