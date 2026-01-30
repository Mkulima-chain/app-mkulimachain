# Guide de Test - Smart Contracts Intégration

## Pré-requis

### 1. Wallet Cardano
- Installer [Nami Wallet](https://namiwallet.io/) ou [Eternl Wallet](https://eternl.io/)
- Configurer le wallet sur **Cardano Preprod Testnet**

### 2. Test ADA
- Obtenir des test ADA sur https://docs.cardano.org/cardano-testnet/tools/faucet
- Vous aurez besoin d'au moins **50 tADA** pour les tests

### 3. Variables d'Environnement
Copier `.env.contracts` vers `.env.local`:

```bash
cd apps/web
cat .env.contracts >> .env.local
```

Ajouter:
```env
NEXT_PUBLIC_BLOCKFROST_API_KEY=preprod_your_key_here
NEXT_PUBLIC_CARDANO_NETWORK=Preprod
NEXT_PUBLIC_PLATFORM_ADDRESS=addr_test1qz...  # Votre adresse plateforme
```

## Démarrage du Serveur

```bash
cd apps/web
npm run dev
```

Ouvrir http://localhost:5601

## Page de Test

Accéder à: **http://localhost:5601/test-contracts**

## Test 1: Connexion Wallet

1. Ouvrir la page de test
2. Le hook devrait détecter votre wallet
3. Vous devriez voir un popup de connexion Nami/Eternl
4. Approuver la connexion

**Résultat attendu:** Le wallet se connecte sans erreur

## Test 2: Créer une Commande (Order)

### Données de test:

- **Item ID**: `test_item_001`
- **Quantity (kg)**: `10`
- **Price per kg (ADA)**: `5`
- **Seller Address**: Votre propre adresse de wallet (ou une autre)  
- **Platform Fee %**: `5`

### Étapes:

1. Remplir le formulaire
2. Cliquer sur "Create Order"
3. Approuver la transaction dans votre wallet
4. Attendre la confirmation (~20 secondes sur testn et)

**Résultat attendu:**
- ✅ TX Hash affiché
- ✅ Lien CardanoScan cliquable
- ✅ Notification de succès
- ✅ 50 tADA déduits de votre wallet

## Test 3: Vérifier la Transaction

Cliquer sur le lien CardanoScan pour voir:
- Transaction confirmée
- Fond lockés à l'adresse du script
- Datum attaché

## Problèmes Possibles

### "No Cardano wallet found"
**Solution**: Installer Nami ou Eternl et actualiser la page

### "Insufficient funds"
**Solution**: Obtenir plus de test ADA depuis le faucet

### "Transaction failed"
**Solution**: 
1. Vérifier que vous êtes sur Preprod testnet
2. Vérifier les codes de contrats dans `.env.local`
3. Vérifier la console pour les erreurs

### "Script execution failed"
**Solution**:
- Le contrat Aiken peut avoir une validation qui échoue
- Vérifier que vous utilisez PlutusV2 (pas V3) dans les services

## Console de Développement

Ouvrir les DevTools du navigateur (F12) et vérifier:

```javascript
// Test de Lucid
const lucid = await initLucid();
console.log("Network:", lucid.network); // Should be "Preprod"

// Vérifier les codes
import { VALIDATOR_CODES } from '@/lib/contract-codes';
console.log("Order code length:", VALIDATOR_CODES.ORDER_VALIDATOR.length);
// Should be > 0
```

## Commandes de Debug

```bash
# Vérifier la compilation TypeScript
npx tsc --noEmit

# Build de production
npm run build

# Vérifier les variables d'environnement
cat .env.local | grep VALIDATOR

# Re-extraire les codes
node scripts/extract-plutus.ts
```

## Tests Avancés

### Test Manual avec Lucid (Console Browser)

```javascript
// 1. Importer Lucid
import { initLucid } from '@/lib/lucid';
import { OrderContractService } from '@/services/lucid/order-contract.service';

// 2. Initialiser
const lucid = await initLucid();
const walletApi = await window.cardano.nami.enable();
lucid.selectWallet(walletApi);

// 3. Créer service
const service = new OrderContractService(lucid);

// 4. Obtenir l'adresse du script
const scriptAddress = service.getScriptAddress();
console.log("Script Address:", scriptAddress);

// 5. Créer une commande
const hash = await service.createOrder({
  itemId: "test_123",
  quantityKg: 10,
  pricePerKgADA: 5,
  sellerAddress: await lucid.wallet.address(),
  platformAddress: "addr_test1...",
  platformFeePercent: 5
});

console.log("TX Hash:", hash);

// 6. Vérifier les UTxOs
const utxos = await service.getOrderUtxos();
console.log("Orders UTxOs:", utxos);
```

## Checklist de Test

- [ ] Wallet se connecte
- [ ] Codes de contrats chargés
- [ ] Script address généré correctly
- [ ] Transaction de création réussie
- [ ] TX hash reçu
- [ ] TX visible sur CardanoScan
- [ ] Fond lockés à l'adresse du script
- [ ] Datum correct
- [ ] Notification affichée

## Prochains Tests

Une fois le test de création passé:

1. **Test Pay Order** - Payer une commande existante
2. **Test Ship Order** - Marquer comme expédiée
3. **Test Complete Order** - Compléter et distribuer
4. **Test Cancel Order** - Annuler
5. **Test Loan Contract** - Micro-prêts

## Ressources

- [CardanoScan Preprod](https://preprod.cardanoscan.io/)
- [Faucet Cardano](https://docs.cardano.org/cardano-testnet/tools/faucet)
- [Lucid Documentation](https://lucid.spacebudz.io/)
- [Documentation Intégration](../docs/LUCID_INTEGRATION.md)

## Support

En cas de problème:
1. Vérifier la console browser (F12)
2. Vérifier la console terminal
3. Vérifier que vous êtes sur testnet
4. Vérifier les variables d'environnement
