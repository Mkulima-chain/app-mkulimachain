import {
  Constr,
  Data,
  Lucid,
  SpendingValidator,
  fromText,
} from "lucid-cardano";
import { AuthDatum, UserRole } from "@/types/contracts";
import { VALIDATOR_CODES } from "@/lib/contract-codes";

/**
 * Auth Contract Service using Lucid-Cardano (Admin Side)
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

    // Ensure we handle different address formats if necessary,
    // but typically paymentCredentialOf works for Bech32.
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
   * Register a FARMER on-chain (Admin Action)
   * Creates a UTxO at the script address with the Farmer's details.
   */
  async registerFarmer(params: {
    farmerAddress: string;
    metadataHash?: string;
  }): Promise<string> {
    const scriptAddress = this.getScriptAddress();
    const adminAddress = await this.lucid.wallet.address();

    console.log("Registering farmer:", params.farmerAddress);
    console.log("Admin address:", adminAddress);

    const datum: AuthDatum = {
      userAddress: params.farmerAddress,
      role: UserRole.Farmer,
      registeredAt: Math.floor(Date.now() / 1000),
      isActive: true, // Admin registers them as active immediately
      metadataHash: params.metadataHash || null,
    };

    const datumCbor = this.datumToPlutusData(datum);

    // Lock a small amount to create the registration UTxO
    const tx = await this.lucid
      .newTx()
      .payToContract(
        scriptAddress,
        { inline: datumCbor },
        { lovelace: BigInt(2000000) } // 2 ADA min deposit
      )
      .addSigner(adminAddress) // Admin signs the creation tax
      .complete();

    const signedTx = await tx.sign().complete();
    const txHash = await signedTx.submit();

    return txHash;
  }
}
