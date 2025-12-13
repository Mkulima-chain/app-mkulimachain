# Configuration Cloudinary

Ce document explique comment configurer Cloudinary pour l'upload d'images dans l'API.

## Variables d'environnement requises

Ajoutez les variables suivantes dans votre fichier `.env` à la racine de `apps/api` :

```env
CLOUDINARY_CLOUD_NAME=votre_cloud_name
CLOUDINARY_API_KEY=votre_api_key
CLOUDINARY_API_SECRET=votre_api_secret
```

## Obtenir les credentials Cloudinary

1. Créez un compte sur [Cloudinary](https://cloudinary.com/)
2. Connectez-vous à votre dashboard
3. Allez dans **Settings** > **Security**
4. Copiez les valeurs suivantes :
   - **Cloud name** → `CLOUDINARY_CLOUD_NAME`
   - **API Key** → `CLOUDINARY_API_KEY`
   - **API Secret** → `CLOUDINARY_API_SECRET`

## Endpoints disponibles

### POST `/api/upload/image`
Upload une image via FormData (multipart/form-data)

**Body:**
- `file`: Fichier image (FormData)

**Response:**
```json
{
  "url": "https://res.cloudinary.com/..."
}
```

### POST `/api/upload/image/base64`
Upload une image en base64

**Body:**
```json
{
  "image": "data:image/jpeg;base64,..."
}
```

**Response:**
```json
{
  "url": "https://res.cloudinary.com/..."
}
```

## Utilisation dans le frontend

Le composant `ImageUpload` dans `apps/admin/components/ui/image-upload.tsx` utilise automatiquement l'endpoint `/api/upload/image` pour uploader les images vers Cloudinary.

Les images sont stockées dans le dossier `products` sur Cloudinary et optimisées automatiquement (max 1200x1200px, qualité auto).

