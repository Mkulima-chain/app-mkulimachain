"use client"

import { useEffect, useRef } from "react"
import { useCardanoWallet } from "@/hooks"
import { STORAGE_KEYS } from "@/components/wallet/constants"

/**
 * Composant pour gérer la reconnexion automatique du wallet après un rafraîchissement
 * Vérifie si un wallet était connecté et tente de se reconnecter automatiquement
 */
export function WalletAutoReconnect() {
  const { connect, connected, wallets } = useCardanoWallet()
  const reconnectAttemptedRef = useRef(false)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    // Ne rien faire si déjà connecté
    if (connected) {
      reconnectAttemptedRef.current = false
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
        timeoutRef.current = null
      }
      return
    }

    // Ne rien faire si on a déjà tenté la reconnexion
    if (reconnectAttemptedRef.current) {
      return
    }

    // Vérifier si un wallet était sauvegardé
    if (typeof window === "undefined") {
      return
    }

    const savedWalletName = localStorage.getItem(STORAGE_KEYS.WALLET_NAME)
    
    if (!savedWalletName) {
      reconnectAttemptedRef.current = true
      return
    }

    // Attendre que les wallets soient chargés
    if (wallets.length === 0) {
      // Les wallets ne sont pas encore chargés, attendre un peu
      return
    }

    // Vérifier si le wallet est disponible dans la liste des wallets
    const isWalletAvailable = wallets.some((w) => w.name === savedWalletName)
    
    if (!isWalletAvailable) {
      // Le wallet n'est plus disponible (extension désinstallée, etc.)
      // Nettoyer le localStorage
      localStorage.removeItem(STORAGE_KEYS.WALLET_NAME)
      reconnectAttemptedRef.current = true
      return
    }

    // Tenter de se reconnecter automatiquement
    const attemptReconnect = async () => {
      if (reconnectAttemptedRef.current) {
        return
      }

      reconnectAttemptedRef.current = true

      try {
        await connect(savedWalletName)
        // La connexion réussit, le wallet sera connecté
        console.log(`Wallet ${savedWalletName} reconnected automatically`)
      } catch (error) {
        // Erreur lors de la reconnexion (utilisateur a refusé, wallet verrouillé, etc.)
        console.log("Auto-reconnect failed:", error)
        // Ne pas nettoyer le localStorage ici car l'utilisateur peut vouloir réessayer
        // Le localStorage sera nettoyé lors d'une déconnexion manuelle
        // Réinitialiser le flag pour permettre une nouvelle tentative si nécessaire
        reconnectAttemptedRef.current = false
      }
    }

    // Attendre un peu pour s'assurer que tout est prêt
    timeoutRef.current = setTimeout(() => {
      attemptReconnect()
    }, 1000)

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
        timeoutRef.current = null
      }
    }
  }, [connect, connected, wallets])

  // Réinitialiser le flag si on se déconnecte manuellement
  useEffect(() => {
    if (!connected) {
      // Si on se déconnecte, on peut réessayer la prochaine fois
      // Mais seulement si le wallet est toujours dans localStorage
      const savedWalletName = localStorage.getItem(STORAGE_KEYS.WALLET_NAME)
      if (!savedWalletName) {
        reconnectAttemptedRef.current = false
      } else {
        // Réinitialiser pour permettre une nouvelle tentative
        reconnectAttemptedRef.current = false
      }
    }
  }, [connected])

  return null
}

