"use client";

import { forwardRef, ComponentPropsWithoutRef } from "react";
import { Wallet, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface WalletTriggerButtonProps
  extends ComponentPropsWithoutRef<typeof Button> {
  address: string | null;
}

const ADDRESS_PREFIX_LENGTH = 8;
const ADDRESS_SUFFIX_LENGTH = 8;
const CONNECT_WALLET_TEXT = "Connect Wallet";
const WALLET_TEXT = "Wallet";

export const WalletTriggerButton = forwardRef<
  HTMLButtonElement,
  WalletTriggerButtonProps
>(({ address, className, ...props }, ref) => {
  const truncatedAddress = address
    ? `${address.slice(0, ADDRESS_PREFIX_LENGTH)}...${address.slice(-ADDRESS_SUFFIX_LENGTH)}`
    : CONNECT_WALLET_TEXT;

  return (
    <Button
      ref={ref}
      type="button"
      className={cn(
        "bg-gradient-to-r from-[#005A87] to-[#3A8F4C]",
        "hover:from-[#006699] hover:to-[#4BA85C]",
        "dark:from-[#004D73] dark:to-[#3A8F4C]",
        "dark:hover:from-[#005A87] dark:hover:to-[#4BA85C]",
        "text-white border-0",
        "px-4 py-2 h-auto",
        "font-medium text-sm",
        "flex items-center gap-2 cursor-pointer",
        className
      )}
      aria-label={address ? `Wallet: ${truncatedAddress}` : "Connect wallet"}
      {...props}
    >
      <Wallet className="w-4 h-4" aria-hidden="true" />
      <span className="hidden sm:inline">{truncatedAddress}</span>
      <span className="sm:hidden">{WALLET_TEXT}</span>
      <ChevronDown className="w-3 h-3" aria-hidden="true" />
    </Button>
  );
});

WalletTriggerButton.displayName = "WalletTriggerButton";
