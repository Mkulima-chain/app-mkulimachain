"use client"

import { WalletIcon } from "lucide-react"
import {
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog"

export function ModalHeader() {
    return (
        <DialogHeader className="pb-2 border-b border-muted">
            <div className="flex items-center gap-2 justify-center">
                <div className="flex size-8 items-center justify-center rounded-lg bg-[#3A8F4C]">
                    <WalletIcon className="size-4 text-white" />
                </div>
                <div className="text-center">
                    <DialogTitle className="text-lg font-semibold text-foreground">
                        Cardano Wallet
                    </DialogTitle>
                    <DialogDescription className="text-xs text-muted-foreground">
                        Mkulima Chain
                    </DialogDescription>
                </div>
            </div>
        </DialogHeader>
    )
}

