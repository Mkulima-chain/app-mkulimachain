# Guide de Débogage - Création de NFT

## Vérifications à faire

### 1. Vérifier les variables d'environnement Pinata

Assurez-vous que votre fichier `apps/api/.env.local` contient :

```env
IPFS_PROJECT_ID=0e6c1c382d4cdd32cff3
IPFS_PROJECT_SECRET=ceaabc5c17dd044c0af8a838733a4f92b8541e660f29b7a0b50c9f1973690c52
IPFS_JWT=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW5mb3JtYXRpb24iOnsiaWQiOiI4MTdiZDczYS1mYTQ2LTQ3NjMtOTBmOC02MDc4ZmY1NjQzNTEiLCJlbWFpbCI6ImdlbnRpbGFraWxpOThAZ21haWwuY29tIiwiZW1haWxfdmVyaWZpZWQiOnRydWUsInBpbl9wb2xpY3kiOnsicmVnaW9ucyI6W3siZGVzaXJlZFJlcGxpY2F0aW9uQ291bnQiOjEsImlkIjoiRlJBMSJ9LHsiZGVzaXJlZFJlcGxpY2F0aW9uQ291bnQiOjEsImlkIjoiTllDMSJ9XSwidmVyc2lvbiI6MX0sIm1mYV9lbmFibGVkIjpmYWxzZSwic3RhdHVzIjoiQUNUSVZFIn0sImF1dGhlbnRpY2F0aW9uVHlwZSI6InNjb3BlZEtleSIsInNjb3BlZEtleUtleSI6IjBlNmMxYzM4MmQ0Y2RkMzJjZmYzIiwic2NvcGVkS2V5U2VjcmV0IjoiY2VhYWJjNWMxN2RkMDQ0YzBhZjhhODM4NzMzYTRmOTJiODU0MWU2NjBmMjliN2EwYjUwYzlmMTk3MzY5MGM1MiIsImV4cCI6MTc5NzE5NjIyN30.SwNSnTD9XqjkoQvKJCTyZAptoA8TW3H7D1971AS3SHA
IPFS_GATEWAY=https://gateway.pinata.cloud/ipfs/
```

### 2. Vérifier les données du formulaire

Avant de soumettre, vérifiez que :
- ✅ `creatorId` est un UUID valide (format: `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`)
- ✅ `priceADA` est >= 0.000001
- ✅ Les pourcentages totalisent 100%
- ✅ Au moins un fichier (image ou audio) OU un `metadataURI` est fourni

### 3. Logs à vérifier

#### Côté Serveur (Terminal API)

Quand vous créez un NFT, vous devriez voir dans les logs :

```
Received FormData body: {
  creatorId: '...',
  type: 'recipe',
  title: '...',
  priceADA: '1',
  revenueDistribution: { ... },
  hasImage: true/false,
  hasAudio: true/false
}
```

Si vous voyez une erreur Pinata :
```
Error uploading file to Pinata: ...
```

#### Côté Client (Console Navigateur)

Ouvrez la console (F12) et regardez :
- `"Erreur lors de la création du NFT:"` - erreur complète
- `"Détails de l'erreur:"` - détails de l'erreur

### 4. Tester avec curl

Pour tester directement l'API :

```bash
curl -X POST http://localhost:5600/api/nfts \
  -F "creatorId=123e4567-e89b-12d3-a456-426614174000" \
  -F "type=recipe" \
  -F "title=Test NFT" \
  -F "priceADA=1" \
  -F "revenueDistribution[creatorPercent]=70" \
  -F "revenueDistribution[schoolFundPercent]=20" \
  -F "revenueDistribution[platformPercent]=10" \
  -F "image=@/path/to/image.jpg"
```

### 5. Erreurs courantes et solutions

#### "creatorId must be a UUID"
- **Cause** : Le creatorId n'est pas au format UUID
- **Solution** : Utilisez un UUID valide ou connectez-vous pour utiliser votre ID automatiquement

#### "priceADA must not be less than 0.000001"
- **Cause** : Le prix est 0 ou négatif
- **Solution** : Entrez un prix >= 0.000001

#### "Revenue distribution must total 100%"
- **Cause** : Les pourcentages ne totalisent pas 100%
- **Solution** : Vérifiez que creatorPercent + schoolFundPercent + platformPercent = 100

#### "Pinata credentials not configured"
- **Cause** : Les variables d'environnement Pinata ne sont pas configurées
- **Solution** : Ajoutez les variables dans `.env.local` et redémarrez le serveur

#### "Failed to upload file to Pinata"
- **Cause** : Problème avec l'API Pinata (credentials invalides, réseau, etc.)
- **Solution** : Vérifiez vos credentials Pinata et votre connexion internet

### 6. Vérifier les credentials Pinata

Testez vos credentials Pinata avec curl :

```bash
curl -X GET "https://api.pinata.cloud/data/testAuthentication" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

Si cela retourne une erreur, vos credentials sont invalides ou expirés.

### 7. Redémarrer le serveur

Après avoir modifié `.env.local`, **redémarrez toujours le serveur** :

```bash
cd apps/api
pnpm run dev
```
