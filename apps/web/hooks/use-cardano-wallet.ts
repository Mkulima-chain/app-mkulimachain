"use client"
import { useWallet, useWalletList } from "@meshsdk/react"

export function useCardanoWallet() {
  const { connect, disconnect, connected, wallet, name: walletName } = useWallet()
  const wallets = useWalletList()
  return { wallets, connect, disconnect, connected, wallet, name: walletName }
}