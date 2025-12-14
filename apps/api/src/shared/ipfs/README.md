# Module IPFS - Pinata

Ce module permet d'uploader des fichiers et métadonnées NFT sur IPFS via Pinata.

## Configuration

Ajoutez les variables d'environnement suivantes dans votre fichier `.env.local` :

```env
# Pinata API Key (votre API Key Pinata)
IPFS_PROJECT_ID=your_pinata_api_key

# Pinata Secret Key (votre Secret Key Pinata)
IPFS_PROJECT_SECRET=your_pinata_secret_key

# Pinata JWT (optionnel mais recommandé - utilisé en priorité)
IPFS_JWT=your_pinata_jwt_token

# Gateway IPFS pour accéder aux fichiers (optionnel, par défaut: https://gateway.pinata.cloud/ipfs/)
IPFS_GATEWAY=https://gateway.pinata.cloud/ipfs/
```

## Authentification

Le service utilise le JWT en priorité s'il est fourni, sinon il utilise les API keys (IPFS_PROJECT_ID et IPFS_PROJECT_SECRET).

**Recommandation** : Utilisez le JWT pour une meilleure sécurité.

## Utilisation

### Dans le service NFT

Le service NFT utilise automatiquement IPFS lors de la création d'un NFT si des fichiers sont fournis :

```typescript
// Créer un NFT avec upload automatique sur IPFS
const nft = await nftService.create(
  {
    creatorId: '...',
    type: NFTType.RECIPE,
    title: 'Recette traditionnelle',
    description: '...',
    priceADA: 50,
    revenueDistribution: { ... }
  },
  imageFile, // Fichier image (optionnel)
  audioFile  // Fichier audio (optionnel)
);
```

### Utilisation directe du service IPFS

```typescript
// Upload d'un fichier
const result = await ipfsService.uploadFile(file);
// result.cid contient le CID IPFS
// result.path contient le chemin
// result.size contient la taille

// Upload de métadonnées
const metadata = {
  name: 'Mon NFT',
  description: 'Description...',
  image: 'ipfs://...',
};
const result = await ipfsService.uploadMetadata(metadata);
const metadataURI = `ipfs://${result.cid}`;

// Upload complet d'un NFT
const result = await ipfsService.uploadNFT(
  metadata,
  imageFile,
  audioFile
);
// result.metadataURI contient l'URI IPFS des métadonnées
// result.imageHash contient le CID de l'image
// result.audioHash contient le CID de l'audio
```

## Format des métadonnées NFT

Les métadonnées suivent le standard CIP-25 de Cardano :

```json
{
  "name": "Titre du NFT",
  "description": "Description détaillée",
  "image": "ipfs://QmXoypizjW3WknFiJnKLwHCnL72vedxjQkDDP1mXWo6uco",
  "audio": "ipfs://QmXoypizjW3WknFiJnKLwHCnL72vedxjQkDDP1mXWo6uco",
  "type": "recipe",
  "attributes": [
    { "trait_type": "Type", "value": "recipe" },
    { "trait_type": "Creator ID", "value": "..." }
  ]
}
```

## API Endpoint

### POST /nfts

Crée un NFT avec upload automatique sur IPFS.

**Body (multipart/form-data):**
- `creatorId` (string, required): ID du créateur
- `type` (enum, required): Type de NFT
- `title` (string, required): Titre
- `description` (string, optional): Description
- `metadataURI` (string, optional): URI IPFS des métadonnées (si non fourni, sera généré automatiquement)
- `priceADA` (number, required): Prix en ADA
- `revenueDistribution` (object, required): Distribution des revenus
- `image` (file, optional): Fichier image
- `audio` (file, optional): Fichier audio

**Exemple avec curl:**

```bash
curl -X POST http://localhost:3000/nfts \
  -F "creatorId=123e4567-e89b-12d3-a456-426614174000" \
  -F "type=recipe" \
  -F "title=Recette traditionnelle" \
  -F "description=Une recette ancestrale" \
  -F "priceADA=50" \
  -F "revenueDistribution[creatorPercent]=70" \
  -F "revenueDistribution[schoolFundPercent]=20" \
  -F "revenueDistribution[platformPercent]=10" \
  -F "image=@/path/to/image.jpg" \
  -F "audio=@/path/to/audio.mp3"
```

## Notes importantes

1. Les fichiers sont automatiquement "pinés" sur IPFS pour garantir leur disponibilité
2. Les métadonnées sont créées automatiquement si `metadataURI` n'est pas fourni
3. Le format des métadonnées suit le standard CIP-25 de Cardano
4. Les fichiers peuvent avoir une taille maximale de 50MB par défaut
