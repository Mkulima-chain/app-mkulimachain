# Configuration IPFS avec vos credentials Pinata

Ajoutez ces lignes dans votre fichier `apps/api/.env.local` :

```env
# IPFS Configuration - Pinata
IPFS_API_URL=https://api.pinata.cloud
IPFS_PROJECT_ID=0e6c1c382d4cdd32cff3
IPFS_PROJECT_SECRET=ceaabc5c17dd044c0af8a838733a4f92b8541e660f29b7a0b50c9f1973690c52
IPFS_JWT=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW5mb3JtYXRpb24iOnsiaWQiOiI4MTdiZDczYS1mYTQ2LTQ3NjMtOTBmOC02MDc4ZmY1NjQzNTEiLCJlbWFpbCI6ImdlbnRpbGFraWxpOThAZ21haWwuY29tIiwiZW1haWxfdmVyaWZpZWQiOnRydWUsInBpbl9wb2xpY3kiOnsicmVnaW9ucyI6W3siZGVzaXJlZFJlcGxpY2F0aW9uQ291bnQiOjEsImlkIjoiRlJBMSJ9LHsiZGVzaXJlZFJlcGxpY2F0aW9uQ291bnQiOjEsImlkIjoiTllDMSJ9XSwidmVyc2lvbiI6MX0sIm1mYV9lbmFibGVkIjpmYWxzZSwic3RhdHVzIjoiQUNUSVZFIn0sImF1dGhlbnRpY2F0aW9uVHlwZSI6InNjb3BlZEtleSIsInNjb3BlZEtleUtleSI6IjBlNmMxYzM4MmQ0Y2RkMzJjZmYzIiwic2NvcGVkS2V5U2VjcmV0IjoiY2VhYWJjNWMxN2RkMDQ0YzBhZjhhODM4NzMzYTRmOTJiODU0MWU2NjBmMjliN2EwYjUwYzlmMTk3MzY5MGM1MiIsImV4cCI6MTc5NzE5NjIyN30.SwNSnTD9XqjkoQvKJCTyZAptoA8TW3H7D1971AS3SHA
IPFS_GATEWAY=https://gateway.pinata.cloud/ipfs/
```

**Note importante** : Le service IPFS a été modifié pour supporter automatiquement Pinata. Il utilisera le JWT si disponible, sinon les API keys.

## Structure complète du fichier .env.local

Votre fichier devrait ressembler à ceci :

```env
# ... vos autres variables existantes ...

# IPFS Configuration - Pinata
IPFS_API_URL=https://api.pinata.cloud
IPFS_PROJECT_ID=0e6c1c382d4cdd32cff3
IPFS_PROJECT_SECRET=ceaabc5c17dd044c0af8a838733a4f92b8541e660f29b7a0b50c9f1973690c52
IPFS_GATEWAY=https://gateway.pinata.cloud/ipfs/

# Pinata (informations existantes - à garder pour référence)
# API Key: 0e6c1c382d4cdd32cff3
# API Secret: ceaabc5c17dd044c0af8a838733a4f92b8541e660f29b7a0b50c9f1973690c52
# JWT: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## Notes importantes

1. **IPFS_API_URL** : URL de l'API Pinata
2. **IPFS_PROJECT_ID** : Votre API Key Pinata (0e6c1c382d4cdd32cff3)
3. **IPFS_PROJECT_SECRET** : Votre API Secret Pinata (ceaabc5c17dd044c0af8a838733a4f92b8541e660f29b7a0b50c9f1973690c52)
4. **IPFS_GATEWAY** : Gateway Pinata pour accéder aux fichiers uploadés

## Vérification

Après avoir ajouté ces variables, redémarrez votre serveur API :

```bash
cd apps/api
pnpm run dev
```

Ensuite, testez l'upload d'un NFT avec un fichier image. Si tout fonctionne, vous devriez recevoir un `metadataURI` commençant par `ipfs://`.
