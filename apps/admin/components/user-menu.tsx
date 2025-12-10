"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { User, LogOut, Settings } from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/hooks/use-auth"

export function UserMenu() {
  const router = useRouter()
  const { user, logout } = useAuth()
  const [open, setOpen] = React.useState(false)

  const handleLogout = () => {
    setOpen(false)
    logout()
  }

  const handleViewProfile = () => {
    setOpen(false)
    router.push("/settings")
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <User className="h-5 w-5" />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-56 p-2">
        <div className="space-y-1">
          <div className="px-3 py-2 border-b">
            <p className="text-sm font-medium">
              {user ? `${user.firstName} ${user.lastName}` : "Admin"}
            </p>
            <p className="text-xs text-muted-foreground">
              {user?.email || "admin@mkulimachain.com"}
            </p>
            {user?.role && (
              <p className="text-xs text-muted-foreground mt-1">
                Rôle: <span className="font-medium capitalize">{user.role}</span>
              </p>
            )}
          </div>

          <button
            onClick={handleViewProfile}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors hover:bg-accent hover:text-accent-foreground"
          >
            <User className="h-4 w-4" />
            <span>Voir le profil</span>
          </button>

          <button
            onClick={() => {
              setOpen(false)
              router.push("/settings")
            }}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors hover:bg-accent hover:text-accent-foreground"
          >
            <Settings className="h-4 w-4" />
            <span>Paramètres</span>
          </button>

          <div className="border-t my-1" />

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors hover:bg-destructive/10 hover:text-destructive text-red-600 dark:text-red-400"
          >
            <LogOut className="h-4 w-4" />
            <span>Se déconnecter</span>
          </button>
        </div>
      </PopoverContent>
    </Popover>
  )
}

