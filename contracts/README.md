# Contrats Intelligents Plutus pour MkulimaChain NFT

Ce répertoire contient les contrats intelligents Plutus écrits en Aiken pour gérer le mint et la vente de NFTs sur Cardano.

## Structure

- `validators/`
  - `minting_policy.ak` - Contrat pour le mint de NFTs
  - `sale_validator.ak` - Contrat pour la vente de NFTs avec distribution des revenus
  - `order_validator.ak` - **NOUVEAU** - Gestion du cycle de vie des commandes
  - `loan_validator.ak` - **NOUVEAU** - Gestion des micro-prêts DeFi
  - `payment_escrow.ak` - **NOUVEAU** - Système de paiement sécurisé (escrow)
  - `auth_validator.ak` - **NOUVEAU** - Authentification et gestion des permissions
  - `tests.ak` - Tests pour tous les validateurs
- `aiken.toml` - Configuration du projet Aiken
- `SMART_CONTRACTS_GUIDE.md` - Guide détaillé d'utilisation des contrats

## Prérequis

1. **Installer Aiken** : [Guide d'installation Aiken](https://aiken-lang.org/getting-started)

```bash
# Sur macOS/Linux
curl -sSf https://aiken-lang.org/install.sh | sh

# Ou avec Homebrew
brew install aiken-lang/tap/aiken
```

2. **Vérifier l'installation**

```bash
aiken --version
```

## Compilation

### 1. Compiler les contrats

```bash
cd contracts
aiken build
```

Cela génère un fichier `plutus.json` avec le code compilé en format CBOR.

### 2. Extraire le code CBOR

Le code compilé se trouve dans `plutus.json` :

```json
{
  "validators": [
    {
      "compiledCode": "5901a1...",  // Code CBOR en hex
      "hash": "...",
      "title": "minting_policy"
    },
    {
      "compiledCode": "5901a2...",
      "hash": "...",
      "title": "sale_validator"
    }
  ]
}
```

### 3. Utiliser les contrats dans l'application

#### Option A: Variables d'environnement

Ajoutez dans `.env.local` :

```env
NEXT_PUBLIC_PLUTUS_MINTING_POLICY_CODE=5901a1...
NEXT_PUBLIC_PLUTUS_SALE_VALIDATOR_CODE=5901a2...
```

#### Option B: Passer directement dans le code

Modifiez les services pour utiliser les codes compilés.

## Tests

```bash
aiken check
```

Pour des tests plus approfondis, créez des fichiers de test dans le dossier `tests/`.

## Contrats

### 1. Minting Policy (`minting_policy.ak`)

Ce contrat valide les transactions de mint de NFTs.

**Fonctionnalités :**
- Vérifie que la quantité mintée est exactement 1 (NFT unique)
- Valide que le créateur signe la transaction
- Vérifie la présence des métadonnées CIP-25

**Utilisation :**

```typescript
const result = await NFTMintService.mintNFT(
  wallet,
  selectedNFT,
  undefined, // policyId (sera généré depuis le script)
  undefined, // assetName (sera généré)
  undefined, // blockfrostApiKey (depuis env)
  plutusCode  // Code CBOR du contrat
);
```

### 2. Sale Validator (`sale_validator.ak`)

Ce contrat gère les ventes de NFTs avec distribution automatique des revenus.

**Fonctionnalités :**
- Valide que le NFT est transféré à l'acheteur
- Distribue automatiquement les revenus selon les pourcentages configurés :
  - Créateur (creator_percent %)
  - Fonds scolaire (school_fund_percent %)
  - Plateforme (platform_percent %)
- Permet l'annulation de la vente par le vendeur

**Datum (données stockées dans l'UTXO) :**

```aiken
type SaleDatum {
  seller_address: Address,
  nft_policy_id: ByteArray,
  nft_asset_name: ByteArray,
  price: Int, // En Lovelace
  creator_address: Address,
  school_fund_address: Address,
  platform_address: Address,
  creator_percent: Int, // 0-100
  school_fund_percent: Int, // 0-100
  platform_percent: Int, // 0-100
}
```

**Redeemer (action à effectuer) :**

```aiken
type SaleRedeemer {
  action: SaleAction,
}

type SaleAction {
  Buy { buyer_address: Address }
  Cancel
}
```

---

### 3. Order Validator (`order_validator.ak`)

Ce contrat gère le cycle de vie complet des commandes sur la blockchain.

**Fonctionnalités :**
- Création de commandes avec verrouillage du montant
- Paiement par l'acheteur (transition Pending → Paid)
- Expédition par le vendeur (transition Paid → Shipped)
- Complétion avec distribution automatique des fonds (transition Shipped → Completed)
- Annulation flexible selon le statut de la commande
- Distribution des frais de plateforme

**Datum :**

```aiken
type OrderDatum {
  buyer_address: ByteArray,
  seller_address: ByteArray,
  item_id: ByteArray,
  quantity_kg: Int,
  unit_price_lovelace: Int,
  total_lovelace: Int,
  platform_fee_percent: Int,
  platform_address: ByteArray,
  status: OrderStatus,
  created_at: Int,
}
```

**Redeemer :**

```aiken
type OrderAction {
  Pay { payment_hash: ByteArray }
  Ship { tracking_number: ByteArray }
  Complete
  Cancel
}
```

**Cycle de vie :**
1. **Pending** → L'acheteur ou le vendeur peut annuler
2. **Paid** → Seul le vendeur peut annuler ou expédier
3. **Shipped** → L'acheteur complète et les fonds sont distribués
4. **Completed** / **Cancelled** → États finaux

---

### 4. Loan Validator (`loan_validator.ak`)

Ce contrat gère les micro-prêts DeFi pour les agriculteurs.

**Fonctionnalités :**
- Demande de prêt par les agriculteurs
- Approbation/rejet par la plateforme
- Activation et déblocage des fonds
- Remboursement avec calcul automatique des intérêts
- Marquage en défaut de paiement si échéance dépassée
- Validation des taux d'intérêt (max 50%)

**Datum :**

```aiken
type LoanDatum {
  farmer_address: ByteArray,
  amount_lovelace: Int,
  interest_rate: Int,          // Base 100 (5 = 5%)
  duration_days: Int,
  start_timestamp: Int,
  due_timestamp: Int,
  lender_address: ByteArray,
  platform_address: ByteArray,
  status: LoanStatus,
  approved_by: Option<ByteArray>,
}
```

**Redeemer :**

```aiken
type LoanAction {
  Approve { approver_signature: ByteArray }
  Activate { transaction_hash: ByteArray }
  Repay { payment_amount: Int }
  MarkDefaulted
  Reject { reason: ByteArray }
}
```

**Calcul du remboursement :**
```
montant_remboursement = capital + (capital × taux_intérêt / 100)
```

---

### 5. Payment Escrow (`payment_escrow.ak`)

Ce contrat gère les paiements sécurisés en séquestre (escrow).

**Fonctionnalités :**
- Verrouillage de fonds en séquestre
- Libération au bénéficiaire
- Remboursement au payeur
- Création de litiges par les deux parties
- Résolution de litiges par un arbitre
- Partage des fonds en cas de décision split

**Datum :**

```aiken
type EscrowDatum {
  payer_address: ByteArray,
  beneficiary_address: ByteArray,
  amount_lovelace: Int,
  arbiter_address: ByteArray,
  deadline_timestamp: Int,
  description: ByteArray,
  status: EscrowStatus,
}
```

**Redeemer :**

```aiken
type EscrowAction {
  Release
  Refund
  Dispute { reason: ByteArray }
  ResolveDispute { decision: DisputeDecision }
}

type DisputeDecision {
  ReleaseToBeneficiary
  RefundToPayer
  Split { beneficiary_percent: Int }
}
```

**Cas d'usage :**
- Paiement pour des produits agricoles
- Dépôt de garantie pour des transactions
- Transactions entre parties ne se faisant pas confiance

---

### 6. Auth Validator (`auth_validator.ak`)

Ce contrat gère l'authentification et les permissions basées sur les rôles.

**Fonctionnalités :**
- Enregistrement d'utilisateurs avec signature
- Vérification des signatures pour les actions critiques
- Gestion des rôles (Farmer, Buyer, Admin, Platform)
- Activation/désactivation de comptes
- Mise à jour des rôles par les admins

**Datum :**

```aiken
type AuthDatum {
  user_address: ByteArray,
  role: UserRole,
  registered_at: Int,
  is_active: Bool,
  metadata_hash: Option<ByteArray>,
}

type UserRole {
  Farmer
  Buyer
  Admin
  Platform
}
```

**Redeemer :**

```aiken
type AuthAction {
  Register { signature: ByteArray }
  Verify { action_hash: ByteArray }
  Deactivate
  UpdateRole { new_role: UserRole }
}
```

**Note :** L'authentification principale se fait via le wallet Cardano connecté. Ce contrat sert à :
- Stocker les métadonnées utilisateur on-chain
- Vérifier les permissions pour des actions critiques
- Gérer les rôles et accès

---

## Guide Complet

Pour des instructions détaillées, des exemples de code et des diagrammes de flux, consultez le [Guide Complet des Smart Contracts](./SMART_CONTRACTS_GUIDE.md).

Le guide couvre :
- Architecture complète du système
- Exemples d'intégration avec Mesh SDK
- Gestion des erreurs et debugging
- Calcul des frais de transaction
- Sécurité et bonnes pratiques
- Diagrammes de flux pour chaque contrat

## Déploiement


### Testnet

1. Compilez les contrats
2. Déployez sur testnet en utilisant Mesh SDK ou un autre outil
3. Testez toutes les fonctionnalités

### Mainnet

⚠️ **Important** : Testez toujours sur testnet avant de déployer sur mainnet !

1. Vérifiez que tous les tests passent
2. Auditez le code des contrats
3. Déployez sur mainnet
4. Surveillez les premières transactions

## Notes Importantes

- **Frais** : Les contrats Plutus coûtent plus cher en frais de transaction que les scripts simples
- **Version** : Ces contrats utilisent Plutus V2
- **Sécurité** : Les contrats sont immutables une fois déployés
- **Tests** : Testez toujours sur testnet avant mainnet

## Dépannage

### Erreur "Invalid Plutus script"
- Vérifiez que le code CBOR est correct
- Assurez-vous que la version (V1/V2) correspond

### Erreur "Script execution failed"
- Vérifiez la logique de votre contrat
- Testez avec des données simples d'abord
- Vérifiez les logs de la transaction

### Frais trop élevés
- Les contrats Plutus sont plus coûteux
- Optimisez votre contrat pour réduire les frais
- Considérez utiliser des scripts simples pour des cas simples

## Ressources

- [Documentation Aiken](https://aiken-lang.org/)
- [Documentation Plutus](https://plutus.readthedocs.io/)
- [CIP-25 (NFT Metadata Standard)](https://cips.cardano.org/cips/cip25/)
- [Mesh SDK Documentation](https://mesh.martify.io/)
