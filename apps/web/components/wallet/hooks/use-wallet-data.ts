"use client"

import { useEffect, useState, useCallback } from "react"
import { STORAGE_KEYS, LOVELACE_TO_ADA } from "../constants"
import type { WalletData } from "../types"

interface WalletInstance {
    getLovelace?: () => Promise<string | number>
    getBalance?: () => Promise<{ lovelace?: string | number; amount?: string | number }>
    getUsedAddresses?: () => Promise<string[]>
    getChangeAddress?: () => Promise<string>
    getRewardAddresses?: () => Promise<string[]>
    getNetworkId?: () => Promise<number>
    getNetwork?: () => Promise<string>
}

interface UseWalletDataProps {
    connected: boolean
    wallet: WalletInstance | null | undefined
    saveToStorage: (key: keyof typeof STORAGE_KEYS, value: string) => void
}

/**
 * Hook pour récupérer et gérer les données du wallet (balance, adresse, réseau)
 */
export function useWalletData({ connected, wallet, saveToStorage }: UseWalletDataProps) {
    const [walletData, setWalletData] = useState<WalletData>({
        balance: null,
        address: null,
        network: null,
        isLoadingBalance: false,
        isLoadingAddress: false,
    })

    // Charger les données depuis localStorage au montage si connecté
    useEffect(() => {
        if (typeof window === "undefined" || !connected) return

        const savedAddress = localStorage.getItem(STORAGE_KEYS.WALLET_ADDRESS)
        const savedNetwork = localStorage.getItem(STORAGE_KEYS.NETWORK)
        const savedBalance = localStorage.getItem(STORAGE_KEYS.BALANCE)

        if (savedAddress || savedNetwork || savedBalance) {
            setWalletData((prev) => ({
                ...prev,
                ...(savedAddress && { address: savedAddress }),
                ...(savedNetwork && { network: savedNetwork }),
                ...(savedBalance && { balance: Number(savedBalance) }),
            }))
        }
    }, [connected])

    const updateWalletData = useCallback((updates: Partial<WalletData>) => {
        setWalletData((prev) => ({ ...prev, ...updates }))
    }, [])

    const fetchBalance = useCallback(async (walletInstance: WalletInstance) => {
        try {
            let lovelace: string | number = "0"

            if (typeof walletInstance.getLovelace === "function") {
                lovelace = await walletInstance.getLovelace()
            } else if (typeof walletInstance.getBalance === "function") {
                const balance = await walletInstance.getBalance()
                lovelace = balance.lovelace || balance.amount || "0"
            }

            const adaBalance = Number(lovelace) / LOVELACE_TO_ADA
            updateWalletData({ balance: adaBalance })
            saveToStorage("BALANCE", adaBalance.toString())
        } catch (error) {
            console.error("Error fetching balance:", error)
            updateWalletData({ balance: null })
        }
    }, [updateWalletData, saveToStorage])

    const fetchAddress = useCallback(async (walletInstance: WalletInstance) => {
        try {
            let address: string | null = null

            if (typeof walletInstance.getUsedAddresses === "function") {
                const addresses = await walletInstance.getUsedAddresses()
                if (addresses && addresses.length > 0) {
                    address = addresses[0]
                }
            } else if (typeof walletInstance.getChangeAddress === "function") {
                address = await walletInstance.getChangeAddress()
            } else if (typeof walletInstance.getRewardAddresses === "function") {
                const addresses = await walletInstance.getRewardAddresses()
                if (addresses && addresses.length > 0) {
                    address = addresses[0]
                }
            }

            if (address) {
                updateWalletData({ address })
                saveToStorage("WALLET_ADDRESS", address)
            }
        } catch (error) {
            console.error("Error fetching address:", error)
        }
    }, [updateWalletData, saveToStorage])

    const fetchNetwork = useCallback(async (walletInstance: WalletInstance) => {
        try {
            let networkName: string | null = null

            if (typeof walletInstance.getNetworkId === "function") {
                const networkId = await walletInstance.getNetworkId()
                networkName = networkId === 1 ? "Mainnet" : networkId === 0 ? "Testnet" : `Network ${networkId}`
            } else if (typeof walletInstance.getNetwork === "function") {
                networkName = await walletInstance.getNetwork()
            }

            if (networkName) {
                updateWalletData({ network: networkName })
                saveToStorage("NETWORK", networkName)
            } else {
                updateWalletData({ network: "Unknown" })
            }
        } catch (error) {
            console.error("Error fetching network:", error)
            updateWalletData({ network: "Unknown" })
        }
    }, [updateWalletData, saveToStorage])

    useEffect(() => {
        const fetchWalletInfo = async () => {
            if (!connected || !wallet) {
                setWalletData({
                    balance: null,
                    address: null,
                    network: null,
                    isLoadingBalance: false,
                    isLoadingAddress: false,
                })
                return
            }

            try {
                setWalletData((prev) => ({ ...prev, isLoadingBalance: true, isLoadingAddress: true }))

                await Promise.all([
                    fetchBalance(wallet),
                    fetchAddress(wallet),
                    fetchNetwork(wallet),
                ])
            } catch (error) {
                console.error("Error fetching wallet info:", error)
            } finally {
                setWalletData((prev) => ({ ...prev, isLoadingBalance: false, isLoadingAddress: false }))
            }
        }

        fetchWalletInfo()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [connected, wallet])

    return { walletData, updateWalletData }
}

