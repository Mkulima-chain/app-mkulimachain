import {
  Constr,
  Data,
  Lucid,
  SpendingValidator,
  UTxO,
  fromText,
} from "lucid-cardano";
import { AuthDatum, UserRole, AuthRedeemer } from "@/types/contracts";
import { VALIDATOR_CODES } from "@/lib/contract-codes";

/**
 * Auth Contract Service using Lucid-Cardano
 * Manages user authentication and role-based permissions on-chain
 */
export class AuthContractService {
  private lucid: Lucid;
  private validator: SpendingValidator;

  constructor(lucid: Lucid) {
    this.lucid = lucid;

    if (!VALIDATOR_CODES.AUTH_VALIDATOR) {
      throw new Error(
        "Auth validator code not found. Run: npm run extract-plutus"
      );
    }

    this.validator = {
      type: "PlutusV2",
      script: VALIDATOR_CODES.AUTH_VALIDATOR,
    };
  }

  /**
   * Get the script address for the auth validator
   */
  getScriptAddress(): string {
    return this.lucid.utils.validatorToAddress(this.validator);
  }

  /**
   * Convert UserRole to Plutus constructor index
   */
  private roleToIndex(role: UserRole): number {
    const roles: Record<UserRole, number> = {
      [UserRole.Farmer]: 0,
      [UserRole.Buyer]: 1,
      [UserRole.Admin]: 2,
      [UserRole.Platform]: 3,
    };
    return roles[role];
  }

  /**
   * Convert AuthDatum to Plutus Data
   */
  private datumToPlutusData(datum: AuthDatum): string {
    const roleIndex = this.roleToIndex(datum.role);

    const userCredential = this.lucid.utils.paymentCredentialOf(
      datum.userAddress
    );

    const metadataHashData = datum.metadataHash
      ? new Constr(0, [fromText(datum.metadataHash)])
      : new Constr(1, []);

    // Plutus represents booleans as Constr: False = Constr(0, []), True = Constr(1, [])
    const isActiveData = datum.isActive ? new Constr(1, []) : new Constr(0, []);

    const data = Data.to(
      new Constr(0, [
        userCredential.hash,
        new Constr(roleIndex, []),
        BigInt(datum.registeredAt),
        isActiveData,
        metadataHashData,
      ])
    );

    return data;
  }

  /**
   * Convert AuthRedeemer to Plutus Data
   */
  private redeemerToPlutusData(redeemer: AuthRedeemer): string {
    const action = redeemer.action;

    let actionData;
    if ("Register" in action) {
      actionData = new Constr(0, [fromText(action.Register.signature)]);
    } else if ("Verify" in action) {
      actionData = new Constr(1, [fromText(action.Verify.actionHash)]);
    } else if ("Deactivate" in action) {
      actionData = new Constr(2, []);
    } else if ("UpdateRole" in action) {
      const newRoleIndex = this.roleToIndex(action.UpdateRole.newRole);
      actionData = new Constr(3, [new Constr(newRoleIndex, [])]);
    } else {
      throw new Error("Unknown action type");
    }

    return Data.to(new Constr(0, [actionData]));
  }

  /**
   * Register a new user on-chain
   */
  async registerUser(params: {
    role: UserRole;
    metadataHash?: string;
    signature: string;
  }): Promise<string> {
    const userAddress = await this.lucid.wallet.address();
    const scriptAddress = this.getScriptAddress();

    const datum: AuthDatum = {
      userAddress,
      role: params.role,
      registeredAt: Math.floor(Date.now() / 1000),
      isActive: false, // Will be activated after registration
      metadataHash: params.metadataHash || null,
    };

    const datumCbor = this.datumToPlutusData(datum);

    // Lock a small amount to create the registration UTxO
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
   * Verify a signed action
   */
  async verifyAction(params: {
    authUtxo: UTxO;
    datum: AuthDatum;
    actionHash: string;
  }): Promise<string> {
    const userAddress = await this.lucid.wallet.address();

    const redeemer: AuthRedeemer = {
      action: { Verify: { actionHash: params.actionHash } },
    };

    const redeemerData = this.redeemerToPlutusData(redeemer);

    const tx = await this.lucid
      .newTx()
      .collectFrom([params.authUtxo], redeemerData)
      .attachSpendingValidator(this.validator)
      .addSigner(userAddress)
      .complete();

    const signedTx = await tx.sign().complete();
    const txHash = await signedTx.submit();

    return txHash;
  }

  /**
   * Deactivate a user account
   */
  async deactivateUser(params: {
    authUtxo: UTxO;
    datum: AuthDatum;
  }): Promise<string> {
    const userAddress = await this.lucid.wallet.address();

    const redeemer: AuthRedeemer = {
      action: { Deactivate: {} },
    };

    const redeemerData = this.redeemerToPlutusData(redeemer);

    const tx = await this.lucid
      .newTx()
      .collectFrom([params.authUtxo], redeemerData)
      .attachSpendingValidator(this.validator)
      .payToAddress(params.datum.userAddress, { lovelace: 2_000_000n }) // Return deposit
      .addSigner(userAddress)
      .complete();

    const signedTx = await tx.sign().complete();
    const txHash = await signedTx.submit();

    return txHash;
  }

  /**
   * Update user role (admin/platform only)
   */
  async updateUserRole(params: {
    authUtxo: UTxO;
    datum: AuthDatum;
    newRole: UserRole;
  }): Promise<string> {
    const adminAddress = await this.lucid.wallet.address();
    const scriptAddress = this.getScriptAddress();

    const redeemer: AuthRedeemer = {
      action: { UpdateRole: { newRole: params.newRole } },
    };

    const redeemerData = this.redeemerToPlutusData(redeemer);

    // Create new datum with updated role
    const newDatum: AuthDatum = {
      ...params.datum,
      role: params.newRole,
    };

    const newDatumCbor = this.datumToPlutusData(newDatum);

    const tx = await this.lucid
      .newTx()
      .collectFrom([params.authUtxo], redeemerData)
      .attachSpendingValidator(this.validator)
      .payToContract(
        scriptAddress,
        { inline: newDatumCbor },
        { lovelace: 2_000_000n }
      )
      .addSigner(adminAddress)
      .complete();

    const signedTx = await tx.sign().complete();
    const txHash = await signedTx.submit();

    return txHash;
  }

  /**
   * Get all auth UTxOs at the script address
   */
  async getAuthUtxos(): Promise<UTxO[]> {
    const scriptAddress = this.getScriptAddress();
    const utxos = await this.lucid.utxosAt(scriptAddress);
    return utxos;
  }

  /**
   * Find a user's auth UTxO by their address
   */
  async findUserAuth(userAddress: string): Promise<UTxO | null> {
    const utxos = await this.getAuthUtxos();

    for (const utxo of utxos) {
      if (utxo.datum) {
        try {
          // Parse datum and check userAddress
          // Simplified - would need proper datum decoding
          return utxo;
        } catch (error) {
          console.error("Error parsing auth datum:", error);
        }
      }
    }

    return null;
  }
}
