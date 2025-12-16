"use client";

import { useState, useEffect } from "react";

export interface CartItem {
  productId: string;
  productName: string;
  productImage: string;
  price: number;
  currency: string;
  quantity: number;
}

const CART_STORAGE_KEY = "mkulima-cart";

export function useCart() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Charger le panier depuis localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem(CART_STORAGE_KEY);
        if (stored) {
          setCart(JSON.parse(stored));
        }
      } catch (error) {
        console.error("Error loading cart:", error);
      } finally {
        setIsLoaded(true);
      }
    }
  }, []);

  // Sauvegarder le panier dans localStorage et émettre un événement
  useEffect(() => {
    if (isLoaded && typeof window !== "undefined") {
      try {
        localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
        // Émettre un événement personnalisé pour notifier les changements
        window.dispatchEvent(new CustomEvent("cart-updated", { detail: cart }));
      } catch (error) {
        console.error("Error saving cart:", error);
      }
    }
  }, [cart, isLoaded]);

  const addToCart = (
    item: Omit<CartItem, "quantity">,
    quantity: number = 1
  ) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((i) => i.productId === item.productId);

      if (existingItem) {
        return prevCart.map((i) =>
          i.productId === item.productId
            ? { ...i, quantity: i.quantity + quantity }
            : i
        );
      }

      return [...prevCart, { ...item, quantity }];
    });
  };

  const removeFromCart = (productId: string) => {
    setCart((prevCart) =>
      prevCart.filter((item) => item.productId !== productId)
    );
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }

    setCart((prevCart) =>
      prevCart.map((item) =>
        item.productId === productId ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  const getTotal = () => {
    return cart.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  const getItemCount = () => {
    return cart.reduce((count, item) => count + item.quantity, 0);
  };

  return {
    cart,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getTotal,
    getItemCount,
    isLoaded,
  };
}
