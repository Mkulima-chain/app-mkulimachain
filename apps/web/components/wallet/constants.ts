import { PopularWallet } from "./types"

export const POPULAR_WALLETS: PopularWallet[] = [
    {
        name: "Nami",
        installUrl: "https://chrome.google.com/webstore/detail/nami/lpfcbjknijpeeillifnkikgncikgfhdo",
        description: "Wallet Cardano simple et sécurisé",
    },
    {
        name: "Eternl",
        installUrl: "https://chrome.google.com/webstore/detail/eternl/kmhcihpebfmpgkihlkefiiinmahnnfkch",
        description: "Wallet avancé avec staking",
    },
    {
        name: "Lace",
        installUrl: "https://chrome.google.com/webstore/detail/lace/iokeahhegpjmeaobpgbchhlklddklpll",
        description: "Wallet officiel IOG",
    },
    {
        name: "Flint",
        installUrl: "https://chrome.google.com/webstore/detail/flint-wallet/hnhobjmcibchnchjogbeckcochjbohde",
        description: "Wallet rapide et moderne",
    },
]

export const STORAGE_KEYS = {
    WALLET_NAME: "mkulima_wallet_name",
    WALLET_ADDRESS: "mkulima_wallet_address",
    NETWORK: "mkulima_wallet_network",
    BALANCE: "mkulima_wallet_balance",
} as const

export const LOVELACE_TO_ADA = 1_000_000

