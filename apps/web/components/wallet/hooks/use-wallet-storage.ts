"use client"

import { STORAGE_KEYS } from "../constants"

/**
 * Hook pour gérer la persistance des données du wallet dans localStorage
 */
export function useWalletStorage() {
    // Le chargement depuis localStorage est maintenant géré par useWalletData

    // Sauvegarder les données dans localStorage
    const saveToStorage = (key: keyof typeof STORAGE_KEYS, value: string) => {
        if (typeof window !== "undefined") {
            localStorage.setItem(STORAGE_KEYS[key], value)
        }
    }

    // Supprimer toutes les données du localStorage
    const clearStorage = () => {
        if (typeof window !== "undefined") {
            Object.values(STORAGE_KEYS).forEach((key) => {
                localStorage.removeItem(key)
            })
        }
    }

    return { saveToStorage, clearStorage }
}

