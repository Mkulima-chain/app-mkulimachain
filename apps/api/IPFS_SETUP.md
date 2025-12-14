# Guide de Configuration IPFS

Ce guide vous explique comment obtenir et configurer les credentials IPFS pour votre application.

## Option 1: Infura IPFS (Recommandé pour la production) ⭐

Infura offre un service IPFS gratuit avec des limites généreuses.

### Étapes pour obtenir les credentials Infura :

1. **Créer un compte Infura**
   - Allez sur https://infura.io
   - Cliquez sur "Get Started" ou "Sign Up"
   - Créez un compte (gratuit)

2. **Créer un nouveau projet**
   - Une fois connecté, allez dans le Dashboard
   - Cliquez sur "Create New Key"
   - Sélectionnez "IPFS" comme type de service
   - Donnez un nom à votre projet (ex: "MkulimaChain NFT")

3. **Récupérer les credentials**
   - Après la création, vous verrez :
     - **Project ID** : Une chaîne de caractères (ex: `2AbC3dEf4GhI5JkL`)
     - **Project Secret** : Une chaîne secrète (ex: `a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6`)
   - ⚠️ **Important** : Copiez le Project Secret immédiatement, il ne sera plus visible après !

4. **Configuration dans votre `.env`**
   ```env
   IPFS_API_URL=https://ipfs.infura.io:5001/api/v0
   IPFS_PROJECT_ID=2AbC3dEf4GhI5JkL
   IPFS_PROJECT_SECRET=a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6
   IPFS_GATEWAY=https://ipfs.io/ipfs/
   ```

### Limites Infura (Plan Gratuit) :
- 5 GB de stockage
- 5 GB de bande passante par mois
- Fichiers jusqu'à 100 MB

---

## Option 2: Pinata (Alternative populaire)

Pinata est spécialisé dans le stockage IPFS pour les NFTs.

### Étapes pour obtenir les credentials Pinata :

1. **Créer un compte Pinata**
   - Allez sur https://pinata.cloud
   - Cliquez sur "Sign Up" (gratuit)
   - Vérifiez votre email

2. **Créer une API Key**
   - Connectez-vous au Dashboard
   - Allez dans "Account" → "API Keys"
   - Cliquez sur "New Key"
   - Donnez un nom (ex: "MkulimaChain")
   - Sélectionnez les permissions : "pinFileToIPFS", "pinJSONToIPFS"
   - Cliquez sur "Create"

3. **Récupérer les credentials**
   - Vous verrez :
     - **API Key** : (ex: `Pk1234567890abcdef`)
     - **Secret Key** : (ex: `Sk9876543210fedcba`)
   - ⚠️ **Important** : Copiez la Secret Key immédiatement !

4. **Configuration dans votre `.env`**
   ```env
   IPFS_API_URL=https://api.pinata.cloud
   IPFS_PROJECT_ID=Pk1234567890abcdef
   IPFS_PROJECT_SECRET=Sk9876543210fedcba
   IPFS_GATEWAY=https://gateway.pinata.cloud/ipfs/
   ```

### Limites Pinata (Plan Gratuit) :
- 1 GB de stockage
- Bandes passante illimitée
- Fichiers jusqu'à 100 MB

---

## Option 3: Node IPFS Local (Pour le développement)

Pour tester localement sans credentials externes.

### Installation :

1. **Installer IPFS**
   ```bash
   # macOS
   brew install ipfs
   
   # Linux
   wget https://dist.ipfs.io/go-ipfs/v0.20.0/go-ipfs_v0.20.0_linux-amd64.tar.gz
   tar -xvzf go-ipfs_v0.20.0_linux-amd64.tar.gz
   cd go-ipfs
   sudo ./install.sh
   ```

2. **Initialiser IPFS**
   ```bash
   ipfs init
   ```

3. **Démarrer le daemon IPFS**
   ```bash
   ipfs daemon
   ```

4. **Configuration dans votre `.env`**
   ```env
   IPFS_API_URL=http://localhost:5001/api/v0
   # Pas besoin de PROJECT_ID et PROJECT_SECRET pour le local
   IPFS_GATEWAY=http://localhost:8080/ipfs/
   ```

⚠️ **Note** : Les fichiers uploadés sur un node local ne seront accessibles que depuis votre machine. Pour la production, utilisez Infura ou Pinata.

---

## Option 4: Web3.Storage (Alternative simple)

Web3.Storage est un service gratuit de Protocol Labs.

### Étapes :

1. **Créer un compte**
   - Allez sur https://web3.storage
   - Cliquez sur "Get Started"
   - Connectez-vous avec GitHub ou Email

2. **Créer un API Token**
   - Allez dans "Account" → "Create API Token"
   - Donnez un nom au token
   - Copiez le token généré

3. **Configuration**
   ```env
   IPFS_API_URL=https://api.web3.storage
   IPFS_PROJECT_ID=votre_token_web3_storage
   IPFS_PROJECT_SECRET=  # Pas nécessaire pour Web3.Storage
   IPFS_GATEWAY=https://w3s.link/ipfs/
   ```

⚠️ **Note** : Web3.Storage utilise une API différente, vous devrez peut-être adapter le service IPFS.

---

## Configuration Recommandée pour la Production

Pour la production, je recommande **Infura** car :
- ✅ Gratuit avec des limites généreuses
- ✅ Fiable et stable
- ✅ Facile à configurer
- ✅ Supporte l'authentification Basic Auth (comme dans notre code)

### Fichier `.env` recommandé :

```env
# IPFS Configuration (Infura)
IPFS_API_URL=https://ipfs.infura.io:5001/api/v0
IPFS_PROJECT_ID=votre_project_id_infura
IPFS_PROJECT_SECRET=votre_project_secret_infura
IPFS_GATEWAY=https://ipfs.io/ipfs/
```

---

## Test de la Configuration

Après avoir configuré vos credentials, testez avec :

```bash
# Dans le dossier apps/api
curl -X POST http://localhost:5600/api/nfts \
  -F "creatorId=test-id" \
  -F "type=recipe" \
  -F "title=Test NFT" \
  -F "priceADA=10" \
  -F "revenueDistribution[creatorPercent]=70" \
  -F "revenueDistribution[schoolFundPercent]=20" \
  -F "revenueDistribution[platformPercent]=10" \
  -F "image=@/path/to/test-image.jpg"
```

Si l'upload fonctionne, vous devriez recevoir une réponse avec un `metadataURI` commençant par `ipfs://`.

---

## Sécurité

⚠️ **IMPORTANT** :
- Ne commitez **JAMAIS** votre fichier `.env` dans Git
- Ajoutez `.env` à votre `.gitignore`
- Les credentials IPFS sont sensibles, gardez-les secrets
- Pour la production, utilisez des variables d'environnement sécurisées (ex: Vercel, AWS Secrets Manager)

---

## Support

Si vous rencontrez des problèmes :
1. Vérifiez que les credentials sont corrects
2. Vérifiez que le service IPFS est accessible (pas de firewall)
3. Consultez les logs de l'application pour les erreurs détaillées
4. Testez avec un node IPFS local d'abord pour isoler le problème
