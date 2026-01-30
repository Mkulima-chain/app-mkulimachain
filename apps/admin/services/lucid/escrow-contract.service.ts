import {
  Constr,
  Data,
  Lucid,
  SpendingValidator,
  UTxO,
  fromText,
} from "lucid-cardano";
import {
  EscrowDatum,
  EscrowStatus,
  EscrowRedeemer,
  DisputeDecision,
} from "@/types/contracts";
import { VALIDATOR_CODES } from "@/lib/contract-codes";
import { adaToLovelace } from "@/lib/lucid";

/**
 * Escrow Contract Service using Lucid-Cardano
 * Manages secure payment escrow with arbitration
 */
export class EscrowContractService {
  private lucid: Lucid;
  private validator: SpendingValidator;

  constructor(lucid: Lucid) {
    this.lucid = lucid;

    if (!VALIDATOR_CODES.ESCROW_VALIDATOR) {
      throw new Error(
        "Escrow validator code not found. Run: npm run extract-plutus"
      );
    }

    this.validator = {
      type: "PlutusV2",
      script: VALIDATOR_CODES.ESCROW_VALIDATOR,
    };
  }

  /**
   * Get the script address for the escrow validator
   */
  getScriptAddress(): string {
    return this.lucid.utils.validatorToAddress(this.validator);
  }

  /**
   * Convert EscrowDatum to Plutus Data
   * Addresses are converted to their credential hashes for on-chain storage
   */
  private datumToPlutusData(datum: EscrowDatum): string {
    const statusIndex = Object.values(EscrowStatus).indexOf(datum.status);

    // Convert addresses to credentials
    const payerCredential = this.lucid.utils.paymentCredentialOf(
      datum.payerAddress
    );
    const beneficiaryCredential = this.lucid.utils.paymentCredentialOf(
      datum.beneficiaryAddress
    );
    const arbiterCredential = this.lucid.utils.paymentCredentialOf(
      datum.arbiterAddress
    );

    // 1. Inner record structure (7 fields)
    const datumRecord = new Constr(0, [
      payerCredential.hash,
      beneficiaryCredential.hash,
      datum.amountLovelace,
      arbiterCredential.hash,
      BigInt(datum.deadlineTimestamp),
      fromText(datum.description),
      new Constr(statusIndex, []),
    ]);

    // 2. Outer wrapper for Option<T> = Some(T) -> Constr(0, [T])
    // This is required because the Aiken validator uses spend(datum: Option<EscrowDatum>, ...)
    return Data.to(new Constr(0, [datumRecord]));
  }

  /**
   * Convert EscrowRedeemer to Plutus Data
   * Aiken: pub type EscrowRedeemer { action: EscrowAction }
   * This is a record with ONE field 'action'.
   * In Plutus Data, a record is a Constr(0, [fields...])
   */
  private redeemerToPlutusData(redeemer: EscrowRedeemer): string {
    const action = redeemer.action;

    let actionData;
    if ("Release" in action) {
      // Release is a valueless variant -> Constr(0, [])
      actionData = new Constr(0, []);
    } else if ("Refund" in action) {
      // Refund -> Constr(1, [])
      actionData = new Constr(1, []);
    } else if ("Dispute" in action) {
      // Dispute { reason } -> Constr(2, [reason_bytes])
      actionData = new Constr(2, [fromText(action.Dispute.reason)]);
    } else if ("ResolveDispute" in action) {
      const decision = action.ResolveDispute.decision;
      let decisionData;

      if ("ReleaseToBeneficiary" in decision) {
        decisionData = new Constr(0, []);
      } else if ("RefundToPayer" in decision) {
        decisionData = new Constr(1, []);
      } else if ("Split" in decision) {
        decisionData = new Constr(2, [
          BigInt(decision.Split.beneficiaryPercent),
        ]);
      } else {
        throw new Error("Unknown dispute decision");
      }

      // ResolveDispute { decision } -> Constr(3, [decision_data])
      actionData = new Constr(3, [decisionData]);
    } else {
      throw new Error("Unknown action type");
    }

    // The IMPORTANT part: EscrowRedeemer is a record, so it MUST be wrapped in Constr(0, ...)
    const redeemerStructure = new Constr(0, [actionData]);
    return Data.to(redeemerStructure);
  }

  /**
   * Lock funds in escrow
   */
  async lockFunds(params: {
    amountADA: number;
    beneficiaryAddress: string;
    arbiterAddress: string;
    deadlineHours: number;
    description: string;
  }): Promise<string> {
    const payerAddress = await this.lucid.wallet.address();
    const scriptAddress = this.getScriptAddress();

    const amountLovelace = adaToLovelace(params.amountADA);
    const now = Math.floor(Date.now() / 1000);
    const deadlineTimestamp = now + params.deadlineHours * 60 * 60;

    const datum: EscrowDatum = {
      payerAddress,
      beneficiaryAddress: params.beneficiaryAddress,
      amountLovelace,
      arbiterAddress: params.arbiterAddress,
      deadlineTimestamp,
      description: params.description,
      status: EscrowStatus.Locked,
    };

    const datumCbor = this.datumToPlutusData(datum);

    const tx = await this.lucid
      .newTx()
      .payToContract(
        scriptAddress,
        { inline: datumCbor },
        { lovelace: amountLovelace }
      )
      .complete();

    const signedTx = await tx.sign().complete();
    const txHash = await signedTx.submit();

    return txHash;
  }

  /**
   * Release funds to beneficiary
   * Uses the inline datum from the UTxO for script validation
   */
  async releaseFunds(params: {
    escrowUtxo: UTxO;
    datum: EscrowDatum;
  }): Promise<string> {
    const signerAddress = await this.lucid.wallet.address();

    const redeemer: EscrowRedeemer = {
      action: { Release: {} },
    };

    const redeemerData = this.redeemerToPlutusData(redeemer);

    // Get the amount from the UTxO
    const utxoLovelace = params.escrowUtxo.assets?.lovelace || BigInt(0);

    const tx = await this.lucid
      .newTx()
      .collectFrom([params.escrowUtxo], redeemerData)
      .attachSpendingValidator(this.validator)
      .payToAddress(signerAddress, {
        lovelace: utxoLovelace,
      })
      .addSigner(signerAddress)
      .complete();

    const signedTx = await tx.sign().complete();
    const txHash = await signedTx.submit();

    return txHash;
  }

  /**
   * Refund to payer
   * Uses the inline datum from the UTxO for script validation
   */
  async refundPayer(params: {
    escrowUtxo: UTxO;
    datum: EscrowDatum;
  }): Promise<string> {
    const signerAddress = await this.lucid.wallet.address();

    const redeemer: EscrowRedeemer = {
      action: { Refund: {} },
    };

    const redeemerData = this.redeemerToPlutusData(redeemer);

    // Get the amount from the UTxO
    const utxoLovelace = params.escrowUtxo.assets?.lovelace || BigInt(0);

    const tx = await this.lucid
      .newTx()
      .collectFrom([params.escrowUtxo], redeemerData)
      .attachSpendingValidator(this.validator)
      .payToAddress(signerAddress, {
        lovelace: utxoLovelace,
      })
      .addSigner(signerAddress)
      .complete();

    const signedTx = await tx.sign().complete();
    const txHash = await signedTx.submit();

    return txHash;
  }

  /**
   * Create a dispute
   */
  async createDispute(params: {
    escrowUtxo: UTxO;
    datum: EscrowDatum;
    reason: string;
  }): Promise<string> {
    const userAddress = await this.lucid.wallet.address();

    const redeemer: EscrowRedeemer = {
      action: { Dispute: { reason: params.reason } },
    };

    const redeemerData = this.redeemerToPlutusData(redeemer);

    const tx = await this.lucid
      .newTx()
      .collectFrom([params.escrowUtxo], redeemerData)
      .attachSpendingValidator(this.validator)
      .addSigner(userAddress)
      .complete();

    const signedTx = await tx.sign().complete();
    const txHash = await signedTx.submit();

    return txHash;
  }

  /**
   * Resolve a dispute (arbiter only)
   */
  async resolveDispute(params: {
    escrowUtxo: UTxO;
    datum: EscrowDatum;
    decision: DisputeDecision;
  }): Promise<string> {
    const arbiterAddress = await this.lucid.wallet.address();

    const redeemer: EscrowRedeemer = {
      action: { ResolveDispute: { decision: params.decision } },
    };

    const redeemerData = this.redeemerToPlutusData(redeemer);

    let tx = this.lucid
      .newTx()
      .collectFrom([params.escrowUtxo], redeemerData)
      .attachSpendingValidator(this.validator);

    // Calculate amounts based on decision
    if ("ReleaseToBeneficiary" in params.decision) {
      tx = tx.payToAddress(params.datum.beneficiaryAddress, {
        lovelace: params.datum.amountLovelace,
      });
    } else if ("RefundToPayer" in params.decision) {
      tx = tx.payToAddress(params.datum.payerAddress, {
        lovelace: params.datum.amountLovelace,
      });
    } else if ("Split" in params.decision) {
      const beneficiaryPercent = params.decision.Split.beneficiaryPercent;
      const beneficiaryAmount =
        (params.datum.amountLovelace * BigInt(beneficiaryPercent)) /
        BigInt(100);
      const payerAmount = params.datum.amountLovelace - beneficiaryAmount;

      tx = tx
        .payToAddress(params.datum.beneficiaryAddress, {
          lovelace: beneficiaryAmount,
        })
        .payToAddress(params.datum.payerAddress, { lovelace: payerAmount });
    }

    const completedTx = await tx.addSigner(arbiterAddress).complete();

    const signedTx = await completedTx.sign().complete();
    const txHash = await signedTx.submit();

    return txHash;
  }

  /**
   * Get all escrow UTxOs
   */
  async getEscrowUtxos(): Promise<UTxO[]> {
    const scriptAddress = this.getScriptAddress();
    const utxos = await this.lucid.utxosAt(scriptAddress);
    return utxos;
  }
}
