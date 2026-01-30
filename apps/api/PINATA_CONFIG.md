# Configuration Pinata IPFS

Ce service utilise **uniquement Pinata** pour l'upload IPFS.

## Variables d'environnement requises

Ajoutez ces lignes dans votre fichier `apps/api/.env.local` :

```env
# Pinata API Key
IPFS_PROJECT_ID=0e6c1c382d4cdd32cff3

# Pinata Secret Key
IPFS_PROJECT_SECRET=ceaabc5c17dd044c0af8a838733a4f92b8541e660f29b7a0b50c9f1973690c52

# Pinata JWT (recommandé - utilisé en priorité)
IPFS_JWT=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW5mb3JtYXRpb24iOnsiaWQiOiI4MTdiZDczYS1mYTQ2LTQ3NjMtOTBmOC02MDc4ZmY1NjQzNTEiLCJlbWFpbCI6ImdlbnRpbGFraWxpOThAZ21haWwuY29tIiwiZW1haWxfdmVyaWZpZWQiOnRydWUsInBpbl9wb2xpY3kiOnsicmVnaW9ucyI6W3siZGVzaXJlZFJlcGxpY2F0aW9uQ291bnQiOjEsImlkIjoiRlJBMSJ9LHsiZGVzaXJlZFJlcGxpY2F0aW9uQ291bnQiOjEsImlkIjoiTllDMSJ9XSwidmVyc2lvbiI6MX0sIm1mYV9lbmFibGVkIjpmYWxzZSwic3RhdHVzIjoiQUNUSVZFIn0sImF1dGhlbnRpY2F0aW9uVHlwZSI6InNjb3BlZEtleSIsInNjb3BlZEtleUtleSI6IjBlNmMxYzM4MmQ0Y2RkMzJjZmYzIiwic2NvcGVkS2V5U2VjcmV0IjoiY2VhYWJjNWMxN2RkMDQ0YzBhZjhhODM4NzMzYTRmOTJiODU0MWU2NjBmMjliN2EwYjUwYzlmMTk3MzY5MGM1MiIsImV4cCI6MTc5NzE5NjIyN30.SwNSnTD9XqjkoQvKJCTyZAptoA8TW3H7D1971AS3SHA

# Gateway Pinata (optionnel, par défaut: https://gateway.pinata.cloud/ipfs/)
IPFS_GATEWAY=https://gateway.pinata.cloud/ipfs/
```

**Note** : `IPFS_API_URL` n'est plus nécessaire car le service utilise uniquement Pinata.

## Explication des variables

- **IPFS_API_URL** : URL de l'API Pinata (`https://api.pinata.cloud`)
- **IPFS_PROJECT_ID** : Votre API Key Pinata (0e6c1c382d4cdd32cff3)
- **IPFS_PROJECT_SECRET** : Votre Secret Key Pinata
- **IPFS_JWT** : Votre JWT Pinata (optionnel mais recommandé - utilisé en priorité)
- **IPFS_GATEWAY** : Gateway Pinata pour accéder aux fichiers (`https://gateway.pinata.cloud/ipfs/`)

## Comment ça fonctionne

Le service IPFS détecte automatiquement que vous utilisez Pinata quand `IPFS_API_URL` contient `pinata.cloud`.

1. **Authentification** : Le service utilise le JWT en priorité, sinon les API keys
2. **Upload de fichiers** : Utilise l'endpoint `/pinning/pinFileToIPFS` de Pinata
3. **Upload de métadonnées** : Utilise l'endpoint `/pinning/pinJSONToIPFS` de Pinata

## Test

Après avoir ajouté ces variables :

1. Redémarrez le serveur API :
   ```bash
   cd apps/api
   pnpm run dev
   ```

2. Testez l'upload d'un NFT avec une image via l'interface admin ou l'API

3. Vérifiez les logs - vous devriez voir : `Using Pinata IPFS service`

## Vérification

Si tout fonctionne correctement :
- Les fichiers seront uploadés sur Pinata IPFS
- Vous recevrez un `metadataURI` commençant par `ipfs://`
- Les fichiers seront accessibles via `https://gateway.pinata.cloud/ipfs/[CID]`

## Support

En cas de problème, vérifiez :
- Que les variables sont bien dans `.env.local` (pas `.env`)
- Que le serveur a été redémarré après l'ajout des variables
- Les logs de l'application pour les erreurs détaillées
