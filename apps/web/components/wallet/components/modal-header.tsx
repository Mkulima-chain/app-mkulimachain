"use client"

import { Sparkles } from "lucide-react"
import {
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog"

export function ModalHeader() {
    return (
        <DialogHeader className="pb-3">
            <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                    <div className="flex size-6 items-center justify-center">
                        <Sparkles className="size-5 text-[#004D73] dark:text-white/90" />
                    </div>
                    <div>
                        <DialogTitle className="text-lg font-semibold text-white dark:text-white">
                            Cardano Wallet
                        </DialogTitle>
                        <DialogDescription className="text-xs text-[#004D73] dark:text-white/70 mt-0.5">
                            Mkulima Chain 
                        </DialogDescription>
                    </div>
                </div>
            </div>
        </DialogHeader>
    )
}

