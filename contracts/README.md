# Contrats Intelligents Plutus pour MkulimaChain NFT

Ce répertoire contient les contrats intelligents Plutus écrits en Aiken pour gérer le mint et la vente de NFTs sur Cardano.

## Structure

- `minting_policy.ak` - Contrat pour le mint de NFTs
- `sale_validator.ak` - Contrat pour la vente de NFTs avec distribution des revenus
- `aiken.toml` - Configuration du projet Aiken

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
