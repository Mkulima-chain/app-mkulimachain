"use client";

import { useState, useEffect } from "react";
import type { CartItem } from "@/hooks/use-cart";
import { CART_STORAGE_KEY } from "./nav-constants";

interface UseCartSyncReturn {
  cart: CartItem[];
  cartItemCount: number;
  getTotal: () => number;
}

export function useCartSync(): UseCartSyncReturn {
  const [ cart, setCart ] = useState<CartItem[]>([]);
  const [ cartItemCount, setCartItemCount ] = useState(0);

  const getTotal = () => {
    return cart.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  useEffect(() => {
    const updateCart = () => {
      if (typeof window !== "undefined") {
        try {
          const stored = localStorage.getItem(CART_STORAGE_KEY);
          if (stored) {
            const cartData = JSON.parse(stored);
            setCart(cartData);
            setCartItemCount(cartData.length);
          } else {
            setCart([]);
            setCartItemCount(0);
          }
        } catch (error) {
          console.error("Error reading cart:", error);
        }
      }
    };

    // Initialiser au montage
    updateCart();

    // Écouter l'événement personnalisé (même onglet)
    window.addEventListener("cart-updated", updateCart);
    // Écouter les changements de storage (autres onglets)
    window.addEventListener("storage", updateCart);

    return () => {
      window.removeEventListener("cart-updated", updateCart);
      window.removeEventListener("storage", updateCart);
    };
  }, []);

  return { cart, cartItemCount, getTotal };
}
