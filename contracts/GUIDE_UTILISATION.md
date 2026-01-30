# Guide d'Utilisation des Contrats Aiken

## Installation d'Aiken

### macOS / Linux

```bash
curl -sSf https://aiken-lang.org/install.sh | sh
```

### Windows

```powershell
# Via Scoop
scoop install aiken

# Ou téléchargez depuis https://aiken-lang.org/
```

### Vérification

```bash
aiken --version
```

## Compilation des Contrats

### 1. Naviguer vers le dossier contracts

```bash
cd contracts
```

### 2. Vérifier la syntaxe

```bash
aiken check
```

### 3. Compiler les contrats

```bash
aiken build
```

Cela génère un fichier `plutus.json` avec les codes compilés.

### 4. Extraire les codes CBOR

Le fichier `plutus.json` contient :

```json
{
  "validators": [
    {
      "compiledCode": "5901a1...",
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

## Utilisation dans l'Application

### 1. Ajouter les codes dans les variables d'environnement

Créez ou modifiez `.env.local` :

```env
# Codes CBOR des contrats compilés
NEXT_PUBLIC_PLUTUS_MINTING_POLICY_CODE=5901a1...
NEXT_PUBLIC_PLUTUS_SALE_VALIDATOR_CODE=5901a2...
```

### 2. Modifier le service de mint

Dans `apps/admin/app/nft/services/nft-mint.service.ts`, ajoutez :

```typescript
// Récupérer le code du contrat depuis l'environnement
const plutusCode = process.env.NEXT_PUBLIC_PLUTUS_MINTING_POLICY_CODE;

if (plutusCode) {
  // Utiliser le contrat Plutus au lieu de ForgeScript
  const forgingScript = {
    type: "PlutusScriptV2",
    code: plutusCode,
  };
  // ... reste du code
}
```

### 3. Modifier le service de vente

Créez un nouveau service pour utiliser le contrat de vente avec le `sale_validator`.

## Structure des Données

### Minting Redeemer

```typescript
{
  asset_name: string, // Nom de l'asset en hex
  quantity: 1 // Toujours 1 pour un NFT
}
```

### Sale Datum

```typescript
{
  seller_address: string, // Adresse du vendeur
  nft_policy_id: string, // Policy ID du NFT
  nft_asset_name: string, // Nom de l'asset
  price: number, // Prix en Lovelace
  creator_address: string,
  school_fund_address: string,
  platform_address: string,
  creator_percent: number, // 0-100
  school_fund_percent: number, // 0-100
  platform_percent: number // 0-100
}
```

### Sale Redeemer

```typescript
// Pour acheter
{
  action: {
    Buy: {
      buyer_address: string
    }
  }
}

// Pour annuler
{
  action: "Cancel"
}
```

## Tests

### Test sur Testnet

1. Compilez les contrats
2. Déployez sur testnet
3. Testez le mint d'un NFT
4. Testez la vente d'un NFT
5. Vérifiez la distribution des revenus

### Test sur Mainnet

⚠️ **ATTENTION** : Ne déployez sur mainnet qu'après des tests approfondis sur testnet !

## Dépannage

### Erreur de compilation

```bash
# Vérifiez la syntaxe
aiken check

# Voir les erreurs détaillées
aiken check --verbose
```

### Erreur "Invalid script"

- Vérifiez que le code CBOR est correct
- Assurez-vous d'utiliser Plutus V2
- Vérifiez que le code n'a pas été tronqué

### Erreur "Script execution failed"

- Vérifiez que les données (datum/redeemer) sont correctement formatées
- Testez avec des données simples d'abord
- Vérifiez les logs de la transaction sur Cardano Scan

## Ressources

- [Documentation Aiken](https://aiken-lang.org/)
- [Exemples Aiken](https://github.com/aiken-lang/aiken)
- [Documentation Plutus](https://plutus.readthedocs.io/)
- [Mesh SDK](https://mesh.martify.io/)
