# Guide d'Authentification Admin

Ce guide explique comment utiliser le système d'authentification pour l'application admin de MkulimaChain.

## Vue d'ensemble

Le système d'authentification vérifie que :
1. ✅ L'utilisateur est connecté (a un token JWT valide)
2. ✅ L'utilisateur existe dans la base de données
3. ✅ L'utilisateur a le rôle `admin`
4. ✅ Le compte de l'utilisateur est actif (`status: "active"`)

## Architecture

### 1. Stockage (`lib/auth-storage.ts`)

Gère le stockage des données d'authentification dans le localStorage :

```typescript
import { saveAuth, getAuth, clearAuth, getAccessToken } from "@/lib/auth-storage"

// Sauvegarder l'authentification
saveAuth({
  accessToken: "token...",
  refreshToken: "refresh...",
  user: { id: "...", email: "...", firstName: "...", lastName: "...", role: "admin" }
})

// Récupérer l'authentification
const auth = getAuth()

// Récupérer le token d'accès
const token = getAccessToken()

// Supprimer l'authentification
clearAuth()
```

### 2. Client API (`lib/api-client.ts`)

Le client API ajoute automatiquement le token JWT dans les headers de toutes les requêtes.

### 3. Hook personnalisé (`hooks/use-auth.ts`)

Hook React pour accéder facilement à l'état d'authentification :

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

### 4. Protection des routes (`components/auth-guard.tsx`)

Le composant `AuthGuard` protège automatiquement toutes les routes (sauf `/login` et `/register`) :
- Vérifie la présence d'un token
- Vérifie que l'utilisateur a le rôle `admin`
- Redirige vers `/login` si l'authentification échoue

### 5. Page de connexion (`app/login/page.tsx`)

La page de connexion :
- Utilise `useMutation` de React Query
- Vérifie le rôle admin après connexion
- Vérifie le statut du compte
- Sauvegarde l'authentification dans le localStorage
- Redirige vers le dashboard après connexion réussie

## Utilisation

### Se connecter

La page de connexion est accessible à `/login`. L'utilisateur doit :
1. Entrer son email/téléphone et mot de passe
2. Cliquer sur "Se connecter"
3. Le système vérifie automatiquement :
   - Les identifiants
   - Le rôle admin
   - Le statut actif du compte

### Se déconnecter

```typescript
import { useAuth } from "@/hooks/use-auth"

function LogoutButton() {
  const { logout } = useAuth()
  
  return <button onClick={logout}>Se déconnecter</button>
}
```

### Accéder aux informations de l'utilisateur

```typescript
import { useAuth } from "@/hooks/use-auth"

function UserProfile() {
  const { user, isAuthenticated } = useAuth()
  
  if (!isAuthenticated) {
    return <div>Non connecté</div>
  }
  
  return (
    <div>
      <p>Nom: {user?.firstName} {user?.lastName}</p>
      <p>Email: {user?.email}</p>
      <p>Rôle: {user?.role}</p>
    </div>
  )
}
```

### Vérifier l'authentification dans un composant

```typescript
import { isAuthenticatedAdmin, getCurrentUser } from "@/lib/auth-utils"

function MyComponent() {
  if (!isAuthenticatedAdmin()) {
    return <div>Accès refusé</div>
  }
  
  const user = getCurrentUser()
  return <div>Bienvenue {user?.firstName}</div>
}
```

### Faire une requête API authentifiée

Le token est automatiquement ajouté aux requêtes :

```typescript
import { api } from "@/lib/api-client"

// Le token est automatiquement ajouté dans le header Authorization
const data = await api.get("/auth/profile")
```

## Configuration

### Variables d'environnement

Assurez-vous que `NEXT_PUBLIC_API_URL` est défini dans votre fichier `.env.local` :

```env
NEXT_PUBLIC_API_URL=http://localhost:5600
```

**Note** : L'URL doit pointer vers l'API sans le préfixe `/api` car les routes de l'API sont directement sous `/auth`, `/farmers`, etc.

### API Backend

L'API doit être configurée avec :
- ✅ Endpoint `POST /auth/login` pour la connexion
- ✅ Endpoint `GET /auth/profile` pour récupérer le profil (protégé par JWT)
- ✅ Endpoint `POST /auth/logout` pour la déconnexion (protégé par JWT)
- ✅ Protection JWT avec le guard `JwtAuthGuard`
- ✅ CORS configuré pour autoriser les requêtes depuis l'admin

## Structure des données

### AuthPayload

```typescript
type AuthPayload = {
  accessToken: string
  refreshToken: string
  user?: {
    id: string
    email: string
    firstName: string
    lastName: string
    role?: string
    status?: string
  }
}
```

### Réponse de l'API `/auth/login`

```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "refresh-token-123456",
  "user": {
    "id": "uuid",
    "email": "admin@example.com",
    "firstName": "Admin",
    "lastName": "User",
    "role": "admin",
    "status": "active"
  }
}
```

## Sécurité

1. **Vérification du rôle** : Seuls les utilisateurs avec `role: "admin"` peuvent accéder
2. **Vérification du statut** : Seuls les comptes avec `status: "active"` peuvent se connecter
3. **Tokens JWT** : Les tokens sont stockés dans le localStorage et envoyés dans le header `Authorization: Bearer <token>`
4. **Protection des routes** : Toutes les routes (sauf `/login` et `/register`) sont protégées par `AuthGuard`
5. **Validation côté serveur** : L'API vérifie également le token et le rôle à chaque requête

## Flux d'authentification

1. L'utilisateur saisit ses identifiants sur `/login`
2. La mutation `loginMutation` appelle l'API `POST /auth/login`
3. L'API vérifie les identifiants et retourne les tokens JWT + données utilisateur
4. Le système vérifie que `user.role === "admin"` et `user.status === "active"`
5. Les données sont sauvegardées dans le localStorage via `saveAuth()`
6. L'utilisateur est redirigé vers le dashboard (`/`)
7. Le `AuthGuard` vérifie l'authentification à chaque navigation
8. Si l'authentification échoue, redirection vers `/login`

## Dépannage

### L'utilisateur est redirigé vers `/login` même après connexion

**Causes possibles :**
- L'utilisateur n'a pas le rôle `admin` dans la base de données
- Le statut du compte n'est pas `active`
- L'URL de l'API est incorrecte dans `.env.local`
- Le token n'est pas sauvegardé correctement

**Solutions :**
1. Vérifier dans la base de données que `users.role = 'admin'` et `users.status = 'active'`
2. Vérifier la console du navigateur pour les erreurs
3. Vérifier que `NEXT_PUBLIC_API_URL` est correct dans `.env.local`

### Erreur "Identifiants invalides"

**Causes possibles :**
- Email/téléphone ou mot de passe incorrect
- L'utilisateur n'existe pas dans la base de données
- Le compte est suspendu ou inactif

**Solutions :**
1. Vérifier les identifiants
2. Vérifier que l'utilisateur existe dans la base de données
3. Vérifier le statut du compte

### Le token n'est pas envoyé dans les requêtes

**Causes possibles :**
- Le token n'est pas sauvegardé dans le localStorage
- Le localStorage est bloqué par le navigateur

**Solutions :**
1. Vérifier dans les DevTools > Application > Local Storage que `mkulima-admin-auth` existe
2. Vérifier que le localStorage n'est pas bloqué
3. Essayer de se reconnecter

### Erreur CORS

**Causes possibles :**
- L'URL de l'admin n'est pas autorisée dans la configuration CORS de l'API

**Solutions :**
1. Vérifier la configuration CORS dans `apps/api/src/main.ts`
2. Ajouter l'URL de l'admin dans `allowedOrigins`

## Exemples complets

### Exemple 1 : Page protégée avec vérification d'authentification

```typescript
"use client"

import { useAuth } from "@/hooks/use-auth"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

export default function ProtectedPage() {
  const { isAuthenticated, isAdmin } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isAuthenticated || !isAdmin) {
      router.push("/login")
    }
  }, [isAuthenticated, isAdmin, router])

  if (!isAuthenticated || !isAdmin) {
    return null
  }

  return <div>Contenu protégé</div>
}
```

### Exemple 2 : Faire une requête API authentifiée

```typescript
"use client"

import { api } from "@/lib/api-client"
import { useQuery } from "@tanstack/react-query"

export default function ProfilePage() {
  const { data, isLoading } = useQuery({
    queryKey: ["profile"],
    queryFn: () => api.get("/auth/profile"),
  })

  if (isLoading) return <div>Chargement...</div>

  return (
    <div>
      <h1>Profil</h1>
      <p>Email: {data?.email}</p>
      <p>Nom: {data?.firstName} {data?.lastName}</p>
    </div>
  )
}
```

### Exemple 3 : Bouton de déconnexion

```typescript
"use client"

import { useAuth } from "@/hooks/use-auth"
import { Button } from "@/components/ui/button"

export function LogoutButton() {
  const { logout, user } = useAuth()

  return (
    <div>
      <p>Connecté en tant que {user?.email}</p>
      <Button onClick={logout}>Se déconnecter</Button>
    </div>
  )
}
```

