"use client"

import * as React from "react"
import { getAuth, clearAuth, type AuthPayload } from "@/lib/auth-storage"
import { useRouter } from "next/navigation"

export function useAuth() {
  const router = useRouter()
  const [auth, setAuth] = React.useState<AuthPayload | undefined>(() => {
    if (typeof window !== "undefined") {
      return getAuth()
    }
    return undefined
  })

  // Mettre à jour l'état quand le localStorage change
  React.useEffect(() => {
    const handleStorageChange = () => {
      setAuth(getAuth())
    }

    // Écouter les changements du localStorage
    window.addEventListener("storage", handleStorageChange)
    
    // Vérifier périodiquement (pour les changements dans le même onglet)
    const interval = setInterval(() => {
      const currentAuth = getAuth()
      if (JSON.stringify(currentAuth) !== JSON.stringify(auth)) {
        setAuth(currentAuth)
      }
    }, 1000)

    return () => {
      window.removeEventListener("storage", handleStorageChange)
      clearInterval(interval)
    }
  }, [auth])

  const logout = React.useCallback(() => {
    clearAuth()
    setAuth(undefined)
    router.push("/login")
  }, [router])

  const isAuthenticated = React.useMemo(() => {
    return !!auth && !!auth.accessToken && !!auth.user
  }, [auth])

  const isAdmin = React.useMemo(() => {
    return auth?.user?.role === "admin"
  }, [auth])

  const user = React.useMemo(() => {
    return auth?.user
  }, [auth])

  return {
    auth,
    user,
    isAuthenticated,
    isAdmin,
    logout,
  }
}

