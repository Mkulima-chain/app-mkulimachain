# Configuration d'un Contrat Intelligent Plutus pour le Mint NFT

## Vue d'ensemble

Ce guide explique comment utiliser un contrat intelligent Plutus avec Mesh SDK pour mint des NFTs sur Cardano.

## Prérequis

1. **Aiken** (compilateur Plutus) : [Installation Aiken](https://aiken-lang.org/)
2. **Contrat Plutus compilé** : Vous devez avoir un contrat Plutus compilé en format CBOR

## Étapes

### 1. Créer un Contrat Plutus

Créez un fichier `minting_policy.ak` avec votre contrat Plutus :

```aiken
validator {
  fn minting_policy(_redeemer: Data, _context: Data) -> Bool {
    True  // Exemple simple - remplacez par votre logique
  }
}
```

### 2. Compiler le Contrat

```bash
aiken build
```

Cela génère un fichier `plutus.json` avec le code compilé.

### 3. Extraire le Code CBOR

Le code compilé se trouve dans `plutus.json` :

```json
{
  "validators": [
    {
      "compiledCode": "5901a1...",  // Code CBOR en hex
      "hash": "..."
    }
  ]
}
```

### 4. Utiliser le Contrat dans le Code

#### Option A: Variable d'environnement

Ajoutez dans `.env.local` :

```env
NEXT_PUBLIC_PLUTUS_MINTING_POLICY_CODE=5901a1...
```

#### Option B: Passer directement dans le code

Modifiez l'appel à `mintNFT` :

```typescript
const plutusCode = "5901a1..."; // Code CBOR de votre contrat

const result = await NFTMintService.mintNFT(
  wallet,
  selectedNFT,
  undefined, // policyId (sera généré depuis le script)
  undefined, // assetName (sera généré)
  undefined, // blockfrostApiKey (depuis env)
  plutusCode  // Code du contrat Plutus
);
```

## Exemple de Contrat Plutus Avancé

### Contrat avec Time Lock

```aiken
validator {
  fn minting_policy(redeemer: Data, context: Data) -> Bool {
    when context is {
      Spending(tx_info) -> {
        // Vérifier que la transaction est après une certaine date
        tx_info.valid_range.after > 1234567890
      }
      _ -> False
    }
  }
}
```

### Contrat avec Signature Requise

```aiken
validator {
  fn minting_policy(redeemer: Data, context: Data) -> Bool {
    when context is {
      Spending(tx_info) -> {
        // Vérifier qu'une signature spécifique est présente
        tx_info.signatories.contains("addr1...")
      }
      _ -> False
    }
  }
}
```

## Avantages d'un Contrat Plutus

1. **Contrôle avancé** : Logique métier complexe
2. **Sécurité** : Conditions de minting personnalisées
3. **Flexibilité** : Time locks, multi-signatures, etc.
4. **Immutabilité** : Une fois déployé, le contrat ne peut pas être modifié

## Comparaison

| Méthode | Complexité | Sécurité | Flexibilité |
|---------|-----------|----------|-------------|
| ForgeScript | Simple | Basique | Limitée |
| Plutus Contract | Complexe | Élevée | Très élevée |

## Notes Importantes

- **Frais** : Les contrats Plutus coûtent plus cher en frais de transaction
- **Compilation** : Le contrat doit être compilé avant utilisation
- **Version** : Utilisez Plutus V2 pour les contrats modernes
- **Testnet** : Testez toujours sur testnet avant mainnet

## Dépannage

### Erreur "Invalid Plutus script"
- Vérifiez que le code CBOR est correct
- Assurez-vous que la version (V1/V2) correspond

### Erreur "Script execution failed"
- Vérifiez la logique de votre contrat
- Testez avec des données simples d'abord

### Frais trop élevés
- Les contrats Plutus sont plus coûteux
- Optimisez votre contrat pour réduire les frais
