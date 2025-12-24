import {
  Constr,
  Data,
  Lucid,
  SpendingValidator,
  UTxO,
  fromText,
} from "lucid-cardano";
import { OrderDatum, OrderStatus, OrderRedeemer } from "@/types/contracts";
import { VALIDATOR_CODES } from "@/lib/contract-codes";
import { adaToLovelace } from "@/lib/lucid";

/**
 * Order Contract Service using Lucid-Cardano
 * Manages the full lifecycle of orders on-chain
 */
export class OrderContractService {
  private lucid: Lucid;
  private validator: SpendingValidator;

  constructor(lucid: Lucid) {
    this.lucid = lucid;

    if (!VALIDATOR_CODES.ORDER_VALIDATOR) {
      throw new Error(
        "Order validator code not found. Run: npm run extract-plutus"
      );
    }

    this.validator = {
      type: "PlutusV2",
      script: VALIDATOR_CODES.ORDER_VALIDATOR,
    };
  }

  /**
   * Get the script address for the order validator
   */
  getScriptAddress(): string {
    return this.lucid.utils.validatorToAddress(this.validator);
  }

  /**
   * Convert OrderDatum to Plutus Data
   * Addresses are converted to their credential hashes for on-chain storage
   */
  private datumToPlutusData(datum: OrderDatum): string {
    const statusIndex = Object.values(OrderStatus).indexOf(datum.status);

    // Convert addresses to credentials for on-chain representation
    const buyerCredential = this.lucid.utils.paymentCredentialOf(
      datum.buyerAddress
    );
    const sellerCredential = this.lucid.utils.paymentCredentialOf(
      datum.sellerAddress
    );
    const platformCredential = this.lucid.utils.paymentCredentialOf(
      datum.platformAddress
    );

    const datumRecord = new Constr(0, [
      buyerCredential.hash, // Use credential hash instead of full address
      sellerCredential.hash,
      fromText(datum.itemId),
      BigInt(datum.quantityKg),
      datum.unitPriceLovelace,
      datum.totalLovelace,
      BigInt(datum.platformFeePercent),
      platformCredential.hash,
      new Constr(statusIndex, []),
      BigInt(datum.createdAt),
    ]);

    return Data.to(new Constr(0, [datumRecord]));
  }

  /**
   * Convert OrderRedeemer to Plutus Data
   */
  private redeemerToPlutusData(redeemer: OrderRedeemer): string {
    const action = redeemer.action;

    let actionData;
    if ("Pay" in action) {
      actionData = new Constr(0, [fromText(action.Pay.paymentHash)]);
    } else if ("Ship" in action) {
      actionData = new Constr(1, [fromText(action.Ship.trackingNumber)]);
    } else if ("Complete" in action) {
      actionData = new Constr(2, []);
    } else if ("Cancel" in action) {
      actionData = new Constr(3, []);
    } else {
      throw new Error("Unknown action type");
    }

    return Data.to(new Constr(0, [actionData]));
  }

  /**
   * Create a new order (lock funds at script address)
   */
  async createOrder(params: {
    itemId: string;
    quantityKg: number;
    pricePerKgADA: number;
    sellerAddress: string;
    platformAddress: string;
    platformFeePercent: number;
  }): Promise<string> {
    const buyerAddress = await this.lucid.wallet.address();
    const scriptAddress = this.getScriptAddress();

    const unitPriceLovelace = adaToLovelace(params.pricePerKgADA);
    const totalLovelace =
      (unitPriceLovelace * BigInt(Math.floor(params.quantityKg * 100))) /
      BigInt(100);

    const datum: OrderDatum = {
      buyerAddress,
      sellerAddress: params.sellerAddress,
      itemId: params.itemId,
      quantityKg: params.quantityKg,
      unitPriceLovelace,
      totalLovelace,
      platformFeePercent: params.platformFeePercent,
      platformAddress: params.platformAddress,
      status: OrderStatus.Pending,
      createdAt: Math.floor(Date.now() / 1000),
    };

    const datumCbor = this.datumToPlutusData(datum);

    const tx = await this.lucid
      .newTx()
      .payToContract(
        scriptAddress,
        { inline: datumCbor },
        { lovelace: totalLovelace }
      )
      .complete();

    const signedTx = await tx.sign().complete();
    const txHash = await signedTx.submit();

    return txHash;
  }

  /**
   * Pay for an order (transition from Pending to Paid)
   */
  async payOrder(params: {
    orderUtxo: UTxO;
    datum: OrderDatum;
  }): Promise<string> {
    const buyerAddress = await this.lucid.wallet.address();

    const redeemer: OrderRedeemer = {
      action: { Pay: { paymentHash: "payment_" + Date.now() } },
    };

    const redeemerData = this.redeemerToPlutusData(redeemer);

    const tx = await this.lucid
      .newTx()
      .collectFrom([params.orderUtxo], redeemerData)
      .attachSpendingValidator(this.validator)
      .addSigner(buyerAddress)
      .complete();

    const signedTx = await tx.sign().complete();
    const txHash = await signedTx.submit();

    return txHash;
  }

  /**
   * Mark order as shipped (transition from Paid to Shipped)
   */
  async shipOrder(params: {
    orderUtxo: UTxO;
    datum: OrderDatum;
    trackingNumber: string;
  }): Promise<string> {
    const sellerAddress = await this.lucid.wallet.address();

    const redeemer: OrderRedeemer = {
      action: { Ship: { trackingNumber: params.trackingNumber } },
    };

    const redeemerData = this.redeemerToPlutusData(redeemer);

    const tx = await this.lucid
      .newTx()
      .collectFrom([params.orderUtxo], redeemerData)
      .attachSpendingValidator(this.validator)
      .addSigner(sellerAddress)
      .complete();

    const signedTx = await tx.sign().complete();
    const txHash = await signedTx.submit();

    return txHash;
  }

  /**
   * Complete order and distribute funds (transition from Shipped to Completed)
   */
  async completeOrder(params: {
    orderUtxo: UTxO;
    datum: OrderDatum;
  }): Promise<string> {
    const buyerAddress = await this.lucid.wallet.address();

    // Calculate distribution
    const platformFee =
      (params.datum.totalLovelace * BigInt(params.datum.platformFeePercent)) /
      BigInt(100);
    const sellerAmount = params.datum.totalLovelace - platformFee;

    const redeemer: OrderRedeemer = {
      action: { Complete: {} },
    };

    const redeemerData = this.redeemerToPlutusData(redeemer);

    const tx = await this.lucid
      .newTx()
      .collectFrom([params.orderUtxo], redeemerData)
      .attachSpendingValidator(this.validator)
      .payToAddress(params.datum.sellerAddress, { lovelace: sellerAmount })
      .payToAddress(params.datum.platformAddress, { lovelace: platformFee })
      .addSigner(buyerAddress)
      .complete();

    const signedTx = await tx.sign().complete();
    const txHash = await signedTx.submit();

    return txHash;
  }

  /**
   * Cancel an order
   */
  async cancelOrder(params: {
    orderUtxo: UTxO;
    datum: OrderDatum;
  }): Promise<string> {
    const userAddress = await this.lucid.wallet.address();

    const redeemer: OrderRedeemer = {
      action: { Cancel: {} },
    };

    const redeemerData = this.redeemerToPlutusData(redeemer);

    const tx = await this.lucid
      .newTx()
      .collectFrom([params.orderUtxo], redeemerData)
      .attachSpendingValidator(this.validator)
      .addSigner(userAddress)
      .complete();

    const signedTx = await tx.sign().complete();
    const txHash = await signedTx.submit();

    return txHash;
  }

  /**
   * Get all order UTxOs at the script address
   */
  async getOrderUtxos(): Promise<UTxO[]> {
    const scriptAddress = this.getScriptAddress();
    const utxos = await this.lucid.utxosAt(scriptAddress);
    return utxos;
  }

  /**
   * Find a specific order by item ID
   */
  async findOrderByItemId(itemId: string): Promise<UTxO | null> {
    const utxos = await this.getOrderUtxos();

    for (const utxo of utxos) {
      if (utxo.datum) {
        try {
          // Parse datum and check itemId
          // This is simplified - you'd need to properly decode the datum
          // For now, return first UTxO
          return utxo;
        } catch (error) {
          console.error("Error parsing datum:", error);
        }
      }
    }

    return null;
  }
}
