# Packages partagés

Ce dossier contient les packages partagés utilisés par les applications du monorepo.

## Packages disponibles

### `@mkulimachain/shared-types`

Types TypeScript partagés entre le frontend et le backend.

**Utilisation :**

```typescript
import { ApiResponse, PaginatedResponse } from '@mkulimachain/shared-types';
```

### `@mkulimachain/shared-utils`

Fonctions utilitaires partagées.

**Utilisation :**

```typescript
import { formatDate, isValidEmail, generateId } from '@mkulimachain/shared-utils';
```

## Créer un nouveau package

1. Créer un nouveau dossier dans `packages/` :

```bash
mkdir packages/mon-nouveau-package
```

2. Créer un `package.json` :

```json
{
  "name": "@mkulimachain/mon-nouveau-package",
  "version": "0.1.0",
  "private": true,
  "main": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "scripts": {
    "build": "tsc",
    "dev": "tsc --watch",
    "clean": "rm -rf dist"
  },
  "devDependencies": {
    "typescript": "^5"
  }
}
```

3. Créer un `tsconfig.json` (copier depuis un package existant)

4. Créer le dossier `src/` avec votre code

5. Ajouter le package comme dépendance dans les applications qui en ont besoin :

```json
{
  "dependencies": {
    "@mkulimachain/mon-nouveau-package": "workspace:*"
  }
}
```

6. Installer les dépendances :

```bash
pnpm install
```

## Build

Pour builder tous les packages :

```bash
pnpm build
```

Pour builder un package spécifique :

```bash
cd packages/shared-types
pnpm build
```

