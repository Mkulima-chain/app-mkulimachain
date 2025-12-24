import {
  Constr,
  Data,
  Lucid,
  SpendingValidator,
  UTxO,
  fromText,
} from "lucid-cardano";
import { LoanDatum, LoanStatus, LoanRedeemer } from "@/types/contracts";
import { VALIDATOR_CODES } from "@/lib/contract-codes";
import { adaToLovelace } from "@/lib/lucid";

/**
 * Loan Contract Service using Lucid-Cardano
 * Manages DeFi micro-loans for farmers
 */
export class LoanContractService {
  private lucid: Lucid;
  private validator: SpendingValidator;

  constructor(lucid: Lucid) {
    this.lucid = lucid;

    if (!VALIDATOR_CODES.LOAN_VALIDATOR) {
      throw new Error(
        "Loan validator code not found. Run: npm run extract-plutus"
      );
    }

    this.validator = {
      type: "PlutusV2",
      script: VALIDATOR_CODES.LOAN_VALIDATOR,
    };
  }

  /**
   * Get the script address for the loan validator
   */
  getScriptAddress(): string {
    return this.lucid.utils.validatorToAddress(this.validator);
  }

  /**
   * Convert LoanDatum to Plutus Data
   * Addresses are converted to their credential hashes for on-chain storage
   */
  private datumToPlutusData(datum: LoanDatum): string {
    const statusIndex = Object.values(LoanStatus).indexOf(datum.status);

    // Convert addresses to credentials for on-chain representation
    const farmerCredential = this.lucid.utils.paymentCredentialOf(
      datum.farmerAddress
    );
    const lenderCredential = this.lucid.utils.paymentCredentialOf(
      datum.lenderAddress
    );
    const platformCredential = this.lucid.utils.paymentCredentialOf(
      datum.platformAddress
    );

    const approvedByData = datum.approvedBy
      ? new Constr(0, [
          this.lucid.utils.paymentCredentialOf(datum.approvedBy).hash,
        ])
      : new Constr(1, []);

    const data = Data.to(
      new Constr(0, [
        farmerCredential.hash,
        datum.amountLovelace,
        BigInt(datum.interestRate),
        BigInt(datum.durationDays),
        BigInt(datum.startTimestamp),
        BigInt(datum.dueTimestamp),
        lenderCredential.hash,
        platformCredential.hash,
        new Constr(statusIndex, []),
        approvedByData,
      ])
    );

    return data;
  }

  /**
   * Convert LoanRedeemer to Plutus Data
   */
  private redeemerToPlutusData(redeemer: LoanRedeemer): string {
    const action = redeemer.action;

    let actionData;
    if ("Approve" in action) {
      actionData = new Constr(0, [fromText(action.Approve.approverSignature)]);
    } else if ("Activate" in action) {
      actionData = new Constr(1, [fromText(action.Activate.transactionHash)]);
    } else if ("Repay" in action) {
      actionData = new Constr(2, [action.Repay.paymentAmount]);
    } else if ("MarkDefaulted" in action) {
      actionData = new Constr(3, []);
    } else if ("Reject" in action) {
      actionData = new Constr(4, [fromText(action.Reject.reason)]);
    } else {
      throw new Error("Unknown action type");
    }

    return Data.to(new Constr(0, [actionData]));
  }

  /**
   * Request a new loan
   */
  async requestLoan(params: {
    amountADA: number;
    interestRate: number; // Percentage (5 = 5%)
    durationDays: number;
    lenderAddress: string;
    platformAddress: string;
  }): Promise<string> {
    const farmerAddress = await this.lucid.wallet.address();
    const scriptAddress = this.getScriptAddress();

    const amountLovelace = adaToLovelace(params.amountADA);
    const now = Math.floor(Date.now() / 1000);
    const dueTimestamp = now + params.durationDays * 24 * 60 * 60;

    const datum: LoanDatum = {
      farmerAddress,
      amountLovelace,
      interestRate: params.interestRate,
      durationDays: params.durationDays,
      startTimestamp: now,
      dueTimestamp,
      lenderAddress: params.lenderAddress,
      platformAddress: params.platformAddress,
      status: LoanStatus.Pending,
      approvedBy: null,
    };

    const datumCbor = this.datumToPlutusData(datum);

    // Lock a small amount to create the UTxO (will be returned)
    const tx = await this.lucid
      .newTx()
      .payToContract(
        scriptAddress,
        { inline: datumCbor },
        { lovelace: 2_000_000n }
      )
      .complete();

    const signedTx = await tx.sign().complete();
    const txHash = await signedTx.submit();

    return txHash;
  }

  /**
   * Approve a loan (admin/platform)
   */
  async approveLoan(params: {
    loanUtxo: UTxO;
    datum: LoanDatum;
    approverSignature: string;
  }): Promise<string> {
    const platformAddress = await this.lucid.wallet.address();

    const redeemer: LoanRedeemer = {
      action: { Approve: { approverSignature: params.approverSignature } },
    };

    const redeemerData = this.redeemerToPlutusData(redeemer);

    const tx = await this.lucid
      .newTx()
      .collectFrom([params.loanUtxo], redeemerData)
      .attachSpendingValidator(this.validator)
      .addSigner(platformAddress)
      .complete();

    const signedTx = await tx.sign().complete();
    const txHash = await signedTx.submit();

    return txHash;
  }

  /**
   * Activate loan and release funds to farmer
   */
  async activateLoan(params: {
    loanUtxo: UTxO;
    datum: LoanDatum;
    transactionHash: string;
  }): Promise<string> {
    const platformAddress = await this.lucid.wallet.address();

    const redeemer: LoanRedeemer = {
      action: { Activate: { transactionHash: params.transactionHash } },
    };

    const redeemerData = this.redeemerToPlutusData(redeemer);

    const tx = await this.lucid
      .newTx()
      .collectFrom([params.loanUtxo], redeemerData)
      .attachSpendingValidator(this.validator)
      .payToAddress(params.datum.farmerAddress, {
        lovelace: params.datum.amountLovelace,
      })
      .addSigner(platformAddress)
      .complete();

    const signedTx = await tx.sign().complete();
    const txHash = await signedTx.submit();

    return txHash;
  }

  /**
   * Repay a loan with interest
   */
  async repayLoan(params: {
    loanUtxo: UTxO;
    datum: LoanDatum;
  }): Promise<string> {
    const farmerAddress = await this.lucid.wallet.address();

    const repaymentAmount = this.calculateRepaymentAmount(
      params.datum.amountLovelace,
      params.datum.interestRate
    );

    const redeemer: LoanRedeemer = {
      action: { Repay: { paymentAmount: repaymentAmount } },
    };

    const redeemerData = this.redeemerToPlutusData(redeemer);

    const tx = await this.lucid
      .newTx()
      .collectFrom([params.loanUtxo], redeemerData)
      .attachSpendingValidator(this.validator)
      .payToAddress(params.datum.lenderAddress, { lovelace: repaymentAmount })
      .addSigner(farmerAddress)
      .complete();

    const signedTx = await tx.sign().complete();
    const txHash = await signedTx.submit();

    return txHash;
  }

  /**
   * Mark loan as defaulted (admin/platform)
   */
  async markDefaulted(params: {
    loanUtxo: UTxO;
    datum: LoanDatum;
  }): Promise<string> {
    const platformAddress = await this.lucid.wallet.address();

    const redeemer: LoanRedeemer = {
      action: { MarkDefaulted: {} },
    };

    const redeemerData = this.redeemerToPlutusData(redeemer);

    const tx = await this.lucid
      .newTx()
      .collectFrom([params.loanUtxo], redeemerData)
      .attachSpendingValidator(this.validator)
      .addSigner(platformAddress)
      .complete();

    const signedTx = await tx.sign().complete();
    const txHash = await signedTx.submit();

    return txHash;
  }

  /**
   * Reject a loan request
   */
  async rejectLoan(params: {
    loanUtxo: UTxO;
    datum: LoanDatum;
    reason: string;
  }): Promise<string> {
    const platformAddress = await this.lucid.wallet.address();

    const redeemer: LoanRedeemer = {
      action: { Reject: { reason: params.reason } },
    };

    const redeemerData = this.redeemerToPlutusData(redeemer);

    const tx = await this.lucid
      .newTx()
      .collectFrom([params.loanUtxo], redeemerData)
      .attachSpendingValidator(this.validator)
      .payToAddress(params.datum.farmerAddress, { lovelace: 2_000_000n }) // Return deposit
      .addSigner(platformAddress)
      .complete();

    const signedTx = await tx.sign().complete();
    const txHash = await signedTx.submit();

    return txHash;
  }

  /**
   * Calculate total repayment amount (principal + interest)
   */
  calculateRepaymentAmount(
    amountLovelace: bigint,
    interestRate: number
  ): bigint {
    const interest = (amountLovelace * BigInt(interestRate)) / BigInt(100);
    return amountLovelace + interest;
  }

  /**
   * Get all loan UTxOs at the script address
   */
  async getLoanUtxos(): Promise<UTxO[]> {
    const scriptAddress = this.getScriptAddress();
    const utxos = await this.lucid.utxosAt(scriptAddress);
    return utxos;
  }
}
