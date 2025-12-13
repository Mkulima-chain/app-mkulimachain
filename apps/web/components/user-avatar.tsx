"use client";

import { useSession, signOut } from "next-auth/react";
import {
  User,
  Settings,
  LogOut,
  ChevronDown,
  LayoutDashboard,
} from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import Link from "next/link";

export function UserAvatar() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return <div className="size-9 rounded-full bg-muted animate-pulse" />;
  }

  if (!session?.user) {
    return null;
  }

  const user = session.user;
  const hasImage = user.image && user.image.trim() !== "";
  const initials = user.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : user.email?.[0].toUpperCase() || "U";

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          className={cn(
            "flex items-center gap-2 px-2 py-1.5 h-9 rounded-lg",
            "hover:bg-muted/50 dark:hover:bg-white/10",
            "transition-all duration-200",
            "focus-visible:ring-2 focus-visible:ring-[#3A8F4C] focus-visible:ring-offset-2"
          )}
        >
          <Avatar className="size-7 border-2 border-[#3A8F4C]/20 dark:border-white/20">
            {hasImage && (
              <AvatarImage
                src={user.image!}
                alt={user.name || "User"}
                className="object-cover"
              />
            )}
            <AvatarFallback className="bg-[#3A8F4C]/10 dark:bg-[#3A8F4C]/20 text-[#3A8F4C] dark:text-[#3A8F4C] font-semibold text-xs">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="hidden sm:flex flex-col items-start min-w-0">
            <Link
              href="/profile"
              onClick={(e) => e.stopPropagation()}
              className="text-xs font-semibold text-[#5A3E36] dark:text-white/90 truncate max-w-[120px] hover:text-[#3A8F4C] dark:hover:text-[#3A8F4C] transition-colors"
            >
              {user.name || "Utilisateur"}
            </Link>
            <span className="text-[10px] text-[#004D73]/60 dark:text-white/60 truncate max-w-[120px]">
              {user.email}
            </span>
          </div>
          <ChevronDown className="hidden sm:block size-3.5 text-[#004D73]/60 dark:text-white/60" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-2" align="end">
        <div className="space-y-1">
          {/* User Info */}
          <div className="px-3 py-2.5 rounded-lg bg-muted/50 dark:bg-white/5">
            <div className="flex items-center gap-3">
              <Avatar className="size-10 border-2 border-[#3A8F4C]/20 dark:border-white/20">
                {hasImage && (
                  <AvatarImage
                    src={user.image!}
                    alt={user.name || "User"}
                    className="object-cover"
                  />
                )}
                <AvatarFallback className="bg-[#3A8F4C]/10 dark:bg-[#3A8F4C]/20 text-[#3A8F4C] dark:text-[#3A8F4C] font-semibold">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <Link
                  href="/profile"
                  className="text-sm font-semibold text-[#5A3E36] dark:text-white truncate hover:text-[#3A8F4C] dark:hover:text-[#3A8F4C] transition-colors block"
                >
                  {user.name || "Utilisateur"}
                </Link>
                <p className="text-xs text-[#004D73]/70 dark:text-white/60 truncate">
                  {user.email}
                </p>
              </div>
            </div>
          </div>

          <Separator className="my-2" />

          {/* Menu Items */}
          <Link href="/profile">
            <Button
              variant="ghost"
              className="w-full justify-start gap-2 text-[#5A3E36] dark:text-white/90 hover:bg-[#E8F5E9] dark:hover:bg-white/10 hover:text-[#3A8F4C] dark:hover:text-[#3A8F4C]"
            >
              <User className="size-4" />
              <span>Mon profil</span>
            </Button>
          </Link>

          <Link href="/dashboard">
            <Button
              variant="ghost"
              className="w-full justify-start gap-2 text-[#5A3E36] dark:text-white/90 hover:bg-[#E8F5E9] dark:hover:bg-white/10 hover:text-[#3A8F4C] dark:hover:text-[#3A8F4C]"
            >
              <LayoutDashboard className="size-4" />
              <span>Dashboard</span>
            </Button>
          </Link>

          <Link href="/settings">
            <Button
              variant="ghost"
              className="w-full justify-start gap-2 text-[#5A3E36] dark:text-white/90 hover:bg-[#E8F5E9] dark:hover:bg-white/10 hover:text-[#3A8F4C] dark:hover:text-[#3A8F4C]"
            >
              <Settings className="size-4" />
              <span>Paramètres</span>
            </Button>
          </Link>

          <Separator className="my-2" />

          <Button
            variant="ghost"
            className="w-full justify-start gap-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 hover:text-red-700 dark:hover:text-red-300"
            onClick={() => signOut({ callbackUrl: "/" })}
          >
            <LogOut className="size-4" />
            <span>Déconnexion</span>
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
