"use client"

import * as React from "react"
import { useRouter, usePathname } from "next/navigation"
import { getAuth } from "@/lib/auth-storage"

interface AuthGuardProps {
  children: React.ReactNode
}

export function AuthGuard({ children }: AuthGuardProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [isChecking, setIsChecking] = React.useState(true)

  // Pages publiques qui ne nécessitent pas d'authentification
  const publicPages = ["/login", "/register"]
  const isPublicPage = publicPages.includes(pathname)

  React.useEffect(() => {
    // Ne rien faire si on est sur une page publique
    if (isPublicPage) {
      setIsChecking(false)
      return
    }

    // Vérifier l'authentification
    const auth = getAuth()

    if (!auth || !auth.accessToken) {
      // Pas de token, rediriger vers login
      router.push("/login")
      return
    }

    // Authentification valide
    setIsChecking(false)
  }, [pathname, router, isPublicPage])

  // Afficher un loader pendant la vérification
  if (isChecking && !isPublicPage) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
          <p className="mt-4 text-sm text-muted-foreground">Vérification de l'authentification...</p>
        </div>
      </div>
    )
  }

  // Afficher le contenu
  return <>{children}</>
}

