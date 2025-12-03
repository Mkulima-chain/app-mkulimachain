"use client"

import { cn } from "@/lib/utils"

interface StatusBadgeProps {
  status: "pending" | "certified" | "sold" | "active" | "repaid" | "available"
  className?: string
}

const statusConfig = {
  pending: {
    label: "En attente",
    className: "bg-[#004D73]/10 text-[#004D73] border-[#004D73]/20",
  },
  certified: {
    label: "Certifié",
    className: "bg-[#3A8F4C] text-white border-transparent",
  },
  sold: {
    label: "Vendu",
    className: "bg-[#F2C94C]/10 text-[#F2C94C] border-[#F2C94C]/20",
  },
  active: {
    label: "Actif",
    className: "bg-[#3A8F4C]/10 text-[#3A8F4C] border-[#3A8F4C]/20",
  },
  repaid: {
    label: "Remboursé",
    className: "bg-[#3A8F4C]/20 text-[#2E7D32] border-[#3A8F4C]/30",
  },
  available: {
    label: "Disponible",
    className: "bg-[#3A8F4C]/10 text-[#3A8F4C] border-[#3A8F4C]/20",
  },
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status]

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border transition-all duration-300",
        config.className,
        className
      )}
    >
      {status === "certified" && (
        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
        </svg>
      )}
      {config.label}
    </span>
  )
}

