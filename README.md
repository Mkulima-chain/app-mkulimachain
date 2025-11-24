# App MKulimaChain

Monorepo configuré avec Turborepo contenant une application Next.js (frontend) et une API NestJS (backend).

## Structure du projet

```
.
├── apps/
│   ├── web/          # Application Next.js (frontend)
│   └── api/          # API NestJS (backend)
├── packages/
│   ├── shared-types/ # Types TypeScript partagés
│   └── shared-utils/ # Utilitaires partagés
├── turbo.json        # Configuration Turborepo
└── package.json      # Configuration racine du monorepo
```

## Prérequis

- Node.js >= 18
- pnpm >= 9

## Installation

Installer pnpm (si ce n'est pas déjà fait) :

```bash
npm install -g pnpm
```

Installer toutes les dépendances :

```bash
pnpm install
```

## Scripts disponibles

### Développement

Lancer toutes les applications en mode développement :

```bash
pnpm dev
```

Cela démarre :
- Frontend Next.js sur `http://localhost:5601`
- Backend NestJS sur `http://localhost:5600`

### Build

Construire toutes les applications :

```bash
pnpm build
```

### Production

Démarrer toutes les applications en mode production :

```bash
pnpm start
```

### Lint

Lancer le linting sur tous les packages :

```bash
pnpm lint
```

### Nettoyage

Nettoyer les fichiers de build :

```bash
pnpm clean
```

## Scripts par application

### Frontend (apps/web)

```bash
cd apps/web
pnpm dev      # Développement
pnpm build    # Build
pnpm start    # Production
pnpm lint     # Lint
```

### Backend (apps/api)

```bash
cd apps/api
pnpm dev      # Développement avec watch
pnpm build    # Build
pnpm start:prod # Production
pnpm lint     # Lint
```

## Configuration

### pnpm Workspaces

Le fichier `pnpm-workspace.yaml` définit les workspaces du monorepo. Les packages dans `apps/*` sont gérés comme des workspaces pnpm.

**Note** : Le fichier `pnpm-lock.yaml` doit être commité dans le dépôt pour garantir des installations reproductibles.

### Turborepo

La configuration Turborepo se trouve dans `turbo.json`. Elle définit les pipelines de build, dev, lint, etc.

### Packages partagés

Le dossier `packages/` contient les packages partagés entre les applications :

- **`@mkulimachain/shared-types`** - Types TypeScript partagés (interfaces, types, etc.)
- **`@mkulimachain/shared-utils`** - Fonctions utilitaires partagées

Pour utiliser un package partagé dans une application :

```json
{
  "dependencies": {
    "@mkulimachain/shared-types": "workspace:*",
    "@mkulimachain/shared-utils": "workspace:*"
  }
}
```

Puis dans votre code :

```typescript
import { ApiResponse } from '@mkulimachain/shared-types';
import { formatDate } from '@mkulimachain/shared-utils';
```

### Variables d'environnement

Créez des fichiers `.env.local` dans chaque application si nécessaire :

- `apps/web/.env.local` - Variables pour Next.js
- `apps/api/.env.local` - Variables pour NestJS

#### Configuration de la base de données (apps/api/.env.local)

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_NAME=mkulimachain
DB_SSL=false

# Application
PORT=5600
NODE_ENV=development
FRONTEND_URL=http://localhost:5601
```

**Note** : Assurez-vous que PostgreSQL est installé et en cours d'exécution avant de démarrer l'API.

#### Tester la connexion à la base de données

Une fois l'API démarrée, vous pouvez tester la connexion à la base de données :

```bash
curl http://localhost:5600/db/status
```

## Technologies utilisées

- **Turborepo** - Build system pour monorepo
- **Next.js 16** - Framework React pour le frontend
- **NestJS 10** - Framework Node.js pour le backend
- **TypeScript** - Langage de programmation
- **Tailwind CSS** - Framework CSS

## Documentation

- [Turborepo](https://turbo.build/repo/docs)
- [Next.js](https://nextjs.org/docs)
- [NestJS](https://docs.nestjs.com)
