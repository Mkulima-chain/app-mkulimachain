# 🔐 Système d'Authentification Admin - Guide Rapide

## ✅ Code prêt à l'emploi

Le système d'authentification est **complètement fonctionnel** et prêt à être utilisé !

## 🚀 Utilisation rapide

### 1. Se connecter

Accédez à `/login` et connectez-vous avec :
- **Email ou téléphone** : `admin@example.com` ou `+243812345678`
- **Mot de passe** : votre mot de passe

Le système vérifie automatiquement :
- ✅ Les identifiants
- ✅ Le rôle `admin`
- ✅ Le statut `active`

### 2. Utiliser l'authentification dans vos composants

```typescript
import { useAuth } from "@/hooks/use-auth"

function MyComponent() {
  const { user, isAuthenticated, isAdmin, logout } = useAuth()
  
  if (!isAuthenticated) {
    return <div>Non connecté</div>
  }
  
  return (
    <div>
      <p>Bonjour {user?.firstName} {user?.lastName}</p>
      <button onClick={logout}>Se déconnecter</button>
    </div>
  )
}
```

### 3. Faire des requêtes API authentifiées

Le token est **automatiquement ajouté** à toutes les requêtes :

```typescript
import { api } from "@/lib/api-client"

// Le token est automatiquement dans le header Authorization
const profile = await api.get("/auth/profile")
```

## 📁 Fichiers créés

1. **`lib/auth-storage.ts`** - Gestion du localStorage
2. **`lib/auth-utils.ts`** - Fonctions utilitaires
3. **`hooks/use-auth.ts`** - Hook React pour l'authentification
4. **`components/auth-guard.tsx`** - Protection des routes
5. **`app/login/page.tsx`** - Page de connexion (mise à jour)
6. **`components/user-menu.tsx`** - Menu utilisateur (mise à jour)
7. **`components/dashboard-layout.tsx`** - Layout avec protection (mise à jour)

## 🔧 Configuration

### Variables d'environnement

Créez un fichier `.env.local` dans `apps/admin/` :

```env
NEXT_PUBLIC_API_URL=http://localhost:5600
```

**Important** : L'URL doit être `http://localhost:5600` (sans `/api` car c'est géré automatiquement).

## ✅ Vérifications automatiques

Le système vérifie automatiquement :

1. **Token présent** : Vérifie que le token existe dans le localStorage
2. **Rôle admin** : Vérifie que `user.role === "admin"`
3. **Statut actif** : Vérifie que `user.status === "active"`
4. **Protection des routes** : Toutes les routes (sauf `/login` et `/register`) sont protégées

## 🎯 Fonctionnalités

- ✅ Connexion avec email/téléphone et mot de passe
- ✅ Vérification du rôle admin
- ✅ Vérification du statut actif
- ✅ Protection automatique des routes
- ✅ Token JWT automatiquement ajouté aux requêtes API
- ✅ Déconnexion avec nettoyage du localStorage
- ✅ Menu utilisateur avec informations de l'utilisateur connecté
- ✅ Redirection automatique vers `/login` si non authentifié

## 📝 Exemple complet

```typescript
"use client"

import { useAuth } from "@/hooks/use-auth"
import { api } from "@/lib/api-client"
import { useQuery } from "@tanstack/react-query"

export default function DashboardPage() {
  const { user, isAuthenticated, logout } = useAuth()
  
  // Requête API authentifiée (token ajouté automatiquement)
  const { data: stats } = useQuery({
    queryKey: ["stats"],
    queryFn: () => api.get("/stats/dashboard"),
  })

  if (!isAuthenticated) {
    return null // AuthGuard redirige vers /login
  }

  return (
    <div>
      <h1>Bienvenue {user?.firstName} {user?.lastName}</h1>
      <p>Email: {user?.email}</p>
      <button onClick={logout}>Se déconnecter</button>
    </div>
  )
}
```

## 🐛 Dépannage

### Problème : Redirection vers `/login` après connexion

**Solution** : Vérifiez dans la base de données que :
- `users.role = 'admin'`
- `users.status = 'active'`

### Problème : Erreur "Identifiants invalides"

**Solution** : Vérifiez que :
- L'email/téléphone existe dans la base de données
- Le mot de passe est correct
- Le compte n'est pas suspendu

### Problème : Erreur CORS

**Solution** : Vérifiez que l'URL de l'admin est dans `allowedOrigins` dans `apps/api/src/main.ts`

## 📚 Documentation complète

Voir `AUTHENTICATION.md` pour la documentation détaillée.

---

**Le système est prêt ! Il suffit de se connecter avec un compte admin pour commencer.** 🎉

