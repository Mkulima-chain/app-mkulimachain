# Wallet Component Architecture

Cette architecture suit les meilleures pratiques de développement senior avec une séparation claire des responsabilités.

## Structure des fichiers

```
wallet/
├── components/           # Composants UI réutilisables
│   ├── wallet-grid.tsx          # Grille de sélection des wallets
│   ├── wallet-info-card.tsx     # Carte d'information du wallet connecté
│   ├── popular-wallets.tsx      # Liste des wallets populaires à installer
│   ├── modal-header.tsx         # En-tête du modal
│   ├── modal-footer.tsx         # Pied de page du modal
│   └── wallet-trigger-button.tsx # Bouton de déclenchement du modal
├── hooks/               # Hooks personnalisés pour la logique métier
│   ├── use-wallet-storage.ts    # Gestion du localStorage
│   └── use-wallet-data.ts       # Récupération des données du wallet
├── types.ts             # Types TypeScript
├── constants.ts         # Constantes (wallets populaires, clés de stockage)
├── modal-wallet.tsx     # Composant principal orchestrateur
├── index.ts            # Exports centralisés
└── README.md           # Documentation
```

## Principes de conception

### 1. Séparation des responsabilités
- **Composants UI** : Se concentrent uniquement sur l'affichage
- **Hooks** : Contiennent toute la logique métier
- **Types** : Définitions TypeScript centralisées
- **Constantes** : Valeurs statiques isolées

### 2. Réutilisabilité
- Chaque composant peut être utilisé indépendamment
- Les hooks sont testables et réutilisables
- Les types sont partagés entre tous les modules

### 3. Maintenabilité
- Code modulaire et facile à comprendre
- Chaque fichier a une responsabilité unique
- Facile à étendre et modifier

### 4. Performance
- Utilisation de `useCallback` pour éviter les re-renders inutiles
- Mémoïsation des fonctions de gestion d'événements
- Chargement optimisé des données

## Utilisation

```tsx
import { ModalWallet } from "@/components/wallet"

function MyComponent() {
    return <ModalWallet />
}
```

## Hooks personnalisés

### `useWalletStorage`
Gère la persistance des données dans `localStorage`.

```tsx
const { saveToStorage, clearStorage } = useWalletStorage({
    connected,
    walletData,
    setWalletData,
})
```

### `useWalletData`
Récupère et gère les données du wallet (balance, adresse, réseau).

```tsx
const { walletData } = useWalletData({
    connected,
    wallet,
    saveToStorage,
})
```

## Types

```typescript
interface WalletData {
    balance: number | null
    address: string | null
    network: string | null
    isLoadingBalance: boolean
    isLoadingAddress: boolean
}
```

## Extension

Pour ajouter une nouvelle fonctionnalité :

1. **Nouveau composant UI** : Créer dans `components/`
2. **Nouvelle logique** : Créer un hook dans `hooks/`
3. **Nouveau type** : Ajouter dans `types.ts`
4. **Nouvelle constante** : Ajouter dans `constants.ts`
5. **Export** : Ajouter dans `index.ts`

