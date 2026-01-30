# Module d'Authentification

Module complet d'authentification avec JWT pour l'API MkulimaChain.

## Fonctionnalités

- ✅ Inscription utilisateur
- ✅ Connexion avec email/téléphone
- ✅ **Connexion avec wallet Cardano (Web3)**
- ✅ **Connexion avec Google OAuth**
- ✅ JWT Access Token + Refresh Token
- ✅ Protection des routes avec Guards
- ✅ Rôles utilisateurs (admin, farmer, buyer, cooperative, school)
- ✅ Vérification email/téléphone
- ✅ Changement de mot de passe
- ✅ Déconnexion

## Structure

```
auth/
├── interfaces/iuser.ts          # Interface et enums
├── entities/user.entity.ts       # Entité TypeORM
├── dto/auth.dto.ts              # DTOs avec validation
├── repositories/user.repository.ts  # Accès base de données
├── services/auth.service.ts     # Logique métier
├── controllers/auth.controller.ts   # Endpoints REST
├── strategies/jwt.strategy.ts    # Strategy Passport JWT
├── guards/jwt-auth.guard.ts     # Guard de protection
├── decorators/
│   ├── public.decorator.ts      # Marquer route publique
│   └── current-user.decorator.ts # Récupérer user connecté
└── auth.module.ts               # Module NestJS
```

## Configuration

### Variables d'environnement

Ajoutez dans votre fichier `.env` :

```env
# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=1h
JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-in-production
JWT_REFRESH_EXPIRES_IN=7d

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_CALLBACK_URL=http://localhost:5600/auth/google/callback
```

### Migration

Exécutez la migration pour créer la table `users` :

```bash
cd apps/api
pnpm run migration:run
```

## Endpoints

### Public (sans authentification)

| Méthode | Route | Description |
|---------|-------|-------------|
| `POST` | `/auth/register` | Inscription |
| `POST` | `/auth/login` | Connexion email/téléphone |
| `POST` | `/auth/wallet/connect` | Connexion avec wallet Cardano |
| `GET` | `/auth/google` | Connexion Google OAuth |
| `GET` | `/auth/google/callback` | Callback Google OAuth |
| `POST` | `/auth/refresh` | Rafraîchir le token |

### Protégé (nécessite JWT)

| Méthode | Route | Description |
|---------|-------|-------------|
| `GET` | `/auth/profile` | Profil utilisateur |
| `PUT` | `/auth/profile` | Mettre à jour le profil |
| `PUT` | `/auth/change-password` | Changer le mot de passe |
| `POST` | `/auth/logout` | Déconnexion |

## Utilisation

### 1. Inscription

```bash
POST /auth/register
{
  "email": "jean.mukendi@example.com",
  "password": "SecurePass123!",
  "firstName": "Jean",
  "lastName": "Mukendi",
  "role": "farmer"
}
```

### 2. Connexion Email

```bash
POST /auth/login
{
  "identifier": "jean.mukendi@example.com",
  "password": "SecurePass123!"
}
```

### 3. Connexion Wallet Cardano

```bash
POST /auth/wallet/connect
{
  "walletAddress": "addr1qx2fxv2umyhttkxyxp8x0dlpdt3k6cwng5pxj3jhsydzer3jcu5d8ps7zex2k2xt3uqxgjqnnj83ws8lhrn648jjxtwq2ytjqp",
  "signature": "0xabc123def456...",
  "message": "Connect to MkulimaChain",
  "email": "jean.mukendi@example.com", // Optionnel
  "firstName": "Jean", // Optionnel
  "lastName": "Mukendi" // Optionnel
}
```

### 4. Connexion Google

Redirigez l'utilisateur vers :
```
GET /auth/google
```

Après authentification Google, l'utilisateur sera redirigé vers :
```
{FRONTEND_URL}/auth/callback?accessToken=...&refreshToken=...
```

Réponse :
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "refresh-token-123456",
  "user": {
    "id": "...",
    "email": "jean.mukendi@example.com",
    "firstName": "Jean",
    "lastName": "Mukendi",
    "role": "farmer",
    "status": "pending_verification"
  }
}
```

### 3. Utiliser le token

Ajoutez le header dans vos requêtes :

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 4. Protéger une route

```typescript
import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UserEntity } from '../auth/entities/user.entity';

@Controller('protected')
@UseGuards(JwtAuthGuard)
export class ProtectedController {
  @Get()
  getData(@CurrentUser() user: UserEntity) {
    return { message: `Hello ${user.firstName}!` };
  }
}
```

### 5. Route publique

```typescript
import { Controller, Get } from '@nestjs/common';
import { Public } from '../auth/decorators/public.decorator';

@Controller('public')
export class PublicController {
  @Public()
  @Get()
  getData() {
    return { message: 'This is public' };
  }
}
```

## Rôles utilisateurs

- `admin` - Administrateur système
- `farmer` - Agriculteur
- `buyer` - Acheteur
- `cooperative` - Coopérative
- `school` - École

## Statuts utilisateurs

- `pending_verification` - En attente de vérification
- `active` - Compte actif
- `inactive` - Compte inactif
- `suspended` - Compte suspendu

## Sécurité

- ✅ Mots de passe hashés avec bcrypt (10 rounds)
- ✅ JWT avec expiration
- ✅ Refresh tokens pour renouvellement
- ✅ Protection CSRF via CORS
- ✅ Validation des données avec class-validator
- ✅ Soft delete pour les utilisateurs

