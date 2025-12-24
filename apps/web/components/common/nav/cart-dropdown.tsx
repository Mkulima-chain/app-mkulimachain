"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { useCartSync } from "./use-cart-sync";
import {
  useAdaPrice,
  formatAda,
  formatUsd,
  adaToUsd,
} from "@/components/ui/price-display";

export function CartDropdown() {
  const pathname = usePathname();
  const { cart, cartItemCount, getTotal } = useCartSync();
  const { adaPrice } = useAdaPrice();

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            "relative h-9 w-9",
            pathname === "/cart"
              ? "bg-[#3A8F4C]/10 text-[#3A8F4C] dark:bg-[#3A8F4C]/20 dark:text-[#3A8F4C]"
              : "text-[#5A3E36] dark:text-white/80 hover:text-[#3A8F4C] dark:hover:text-white"
          )}
        >
          <ShoppingCart className="h-5 w-5" />
          {cartItemCount > 0 && (
            <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-[#3A8F4C] dark:bg-[#3A8F4C] text-white text-xs font-bold flex items-center justify-center">
              {cartItemCount > 99 ? "99+" : cartItemCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="p-4">
          <h3 className="font-bold text-lg text-[#5A3E36] dark:text-white mb-4">
            Panier
          </h3>

          {cart.length === 0 ? (
            <div className="text-center py-8">
              <ShoppingCart className="w-12 h-12 text-[#004D73]/40 dark:text-white/40 mx-auto mb-2" />
              <p className="text-sm text-[#004D73] dark:text-white/70">
                Votre panier est vide
              </p>
            </div>
          ) : (
            <>
              <div className="max-h-64 overflow-y-auto space-y-3 mb-4">
                {cart.map((item) => (
                  <div
                    key={item.productId}
                    className="flex items-center gap-3 pb-3 border-b border-[#004D73]/10 dark:border-white/10 last:border-0"
                  >
                    <div className="w-16 h-16 rounded-lg bg-[#3A8F4C]/10 dark:bg-[#3A8F4C]/20 flex items-center justify-center shrink-0 overflow-hidden">
                      {item.productImage.startsWith("http") ||
                      item.productImage.startsWith("/") ? (
                        <img
                          src={item.productImage}
                          alt={item.productName}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-2xl">{item.productImage}</span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm text-[#5A3E36] dark:text-white truncate">
                        {item.productName}
                      </p>
                      <p className="text-xs text-[#004D73] dark:text-white/70">
                        {formatAda(item.price)} ₳ x {item.quantity}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-sm text-[#3A8F4C] dark:text-[#3A8F4C]">
                        {formatAda(item.price * item.quantity)} ₳
                      </p>
                      <p className="text-xs text-muted-foreground">
                        ≈{" "}
                        {formatUsd(
                          adaToUsd(item.price * item.quantity, adaPrice)
                        )}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-2 mb-4 p-3 bg-muted/30 rounded-lg">
                <div className="flex justify-between text-sm">
                  <span className="text-[#004D73] dark:text-white/70">
                    Total
                  </span>
                  <div className="text-right">
                    <span className="font-bold text-[#3A8F4C]">
                      {formatAda(getTotal())} ₳
                    </span>
                    <p className="text-xs text-muted-foreground">
                      ≈ {formatUsd(adaToUsd(getTotal(), adaPrice))}
                    </p>
                  </div>
                </div>
              </div>

              <Link href="/cart" className="block">
                <Button className="w-full bg-[#3A8F4C] hover:bg-[#2E7D32] text-white">
                  Voir le panier
                </Button>
              </Link>
            </>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
