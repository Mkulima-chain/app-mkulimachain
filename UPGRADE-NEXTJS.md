# Guide de mise à niveau Next.js 16.0.3 → 16.0.7

## ✅ Modifications effectuées

Les fichiers `package.json` ont été mis à jour :
- **apps/admin/package.json** : `next` et `eslint-config-next` → `^16.0.7`
- **apps/web/package.json** : `next` et `eslint-config-next` → `^16.0.7`

## 📦 Installation

Exécutez la commande suivante à la racine du projet :

```bash
pnpm install
```

Ou si vous préférez mettre à jour uniquement les dépendances Next.js :

```bash
pnpm update next eslint-config-next --latest
```

## 🔍 Vérifications après mise à niveau

### 1. Vérifier les versions installées

```bash
cd apps/admin && pnpm list next
cd ../web && pnpm list next
```

### 2. Tester le build

```bash
# Build de l'application admin
cd apps/admin
pnpm build

# Build de l'application web
cd ../web
pnpm build
```

### 3. Tester en développement

```bash
# Depuis la racine
pnpm dev

# Ou individuellement
cd apps/admin && pnpm dev
cd apps/web && pnpm dev
```

## 📝 Notes de version

### Next.js 16.0.7 (Décembre 2025)

Cette version est une mise à jour de patch qui inclut :
- ✅ Corrections de bugs
- ✅ Améliorations de sécurité
- ✅ Améliorations de performance

### Changements depuis 16.0.3

Pas de breaking changes majeurs entre 16.0.3 et 16.0.7. C'est une mise à jour de patch, donc compatible avec votre code existant.

## ⚠️ Points d'attention

1. **React 19** : Vous utilisez déjà React 19.2.0, ce qui est compatible avec Next.js 16.

2. **Turbopack** : Next.js 16 utilise Turbopack par défaut. Si vous rencontrez des problèmes, vous pouvez revenir à Webpack :
   ```bash
   next dev --webpack
   ```

3. **Cache** : Après la mise à niveau, il est recommandé de nettoyer le cache :
   ```bash
   cd apps/admin && pnpm clean
   cd ../web && pnpm clean
   ```

## 🐛 En cas de problème

1. **Nettoyer les node_modules et réinstaller** :
   ```bash
   rm -rf node_modules apps/*/node_modules
   pnpm install
   ```

2. **Vérifier les logs** :
   - Consultez les erreurs dans la console
   - Vérifiez les logs du serveur de développement

3. **Rollback si nécessaire** :
   Si vous rencontrez des problèmes critiques, vous pouvez revenir à la version précédente :
   ```bash
   pnpm add next@16.0.3 eslint-config-next@16.0.3 --workspace-root
   ```

## 📚 Ressources

- [Documentation Next.js 16](https://nextjs.org/docs)
- [Changelog Next.js](https://github.com/vercel/next.js/releases)
- [Guide de migration](https://nextjs.org/docs/app/building-your-application/upgrading)
