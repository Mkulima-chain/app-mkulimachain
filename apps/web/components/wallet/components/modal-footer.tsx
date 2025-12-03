"use client"

import { ShieldCheckIcon } from "lucide-react"

export function ModalFooter() {
    return (
        <div className="flex items-center justify-center gap-1.5 p-3 border-t border-muted bg-muted/30">
            <ShieldCheckIcon className="size-3 text-muted-foreground" />
            <p className="text-xs text-muted-foreground">
                Sécurisé par Cardano Blockchain
            </p>
        </div>
    )
}

