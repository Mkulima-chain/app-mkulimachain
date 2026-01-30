"use client";

import {
  useState,
  useEffect,
  createContext,
  useContext,
  ReactNode,
} from "react";

// Context for sharing ADA price across components
interface AdaPriceContextType {
  adaPrice: number | null;
  loading: boolean;
}

const AdaPriceContext = createContext<AdaPriceContextType>({
  adaPrice: null,
  loading: true,
});

/**
 * Provider component to fetch and share ADA price
 */
export function AdaPriceProvider({ children }: { children: ReactNode }) {
  const [adaPrice, setAdaPrice] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPrice = async () => {
      try {
        const response = await fetch(
          "https://api.coingecko.com/api/v3/simple/price?ids=cardano&vs_currencies=usd"
        );
        if (response.ok) {
          const data = await response.json();
          setAdaPrice(data.cardano?.usd || null);
        }
      } catch (error) {
        console.error("Error fetching ADA price:", error);
        setAdaPrice(0.35); // Fallback price
      } finally {
        setLoading(false);
      }
    };

    fetchPrice();
    // Refresh every 5 minutes
    const interval = setInterval(fetchPrice, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <AdaPriceContext.Provider value={{ adaPrice, loading }}>
      {children}
    </AdaPriceContext.Provider>
  );
}

/**
 * Hook to get current ADA price
 */
export function useAdaPrice() {
  return useContext(AdaPriceContext);
}

/**
 * Convert ADA to USD
 */
export function adaToUsd(
  adaAmount: number,
  adaPrice: number | null
): number | null {
  if (adaPrice === null) return null;
  return adaAmount * adaPrice;
}

/**
 * Format ADA amount - shows 0-2 decimals (removes trailing zeros)
 */
export function formatAda(amount: number, maxDecimals: number = 2): string {
  return amount.toLocaleString("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: maxDecimals,
  });
}

/**
 * Format USD amount
 */
export function formatUsd(amount: number | null): string {
  if (amount === null) return "--";
  return `$${amount.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

interface PriceDisplayProps {
  adaAmount: number;
  showUsd?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
  adaClassName?: string;
  usdClassName?: string;
  layout?: "inline" | "stacked";
}

/**
 * Component to display price in ADA and USD
 */
export function PriceDisplay({
  adaAmount,
  showUsd = true,
  size = "md",
  className = "",
  adaClassName = "",
  usdClassName = "",
  layout = "stacked",
}: PriceDisplayProps) {
  const { adaPrice, loading } = useAdaPrice();
  const usdAmount = adaToUsd(adaAmount, adaPrice);

  const sizeClasses = {
    sm: { ada: "text-sm", usd: "text-xs" },
    md: { ada: "text-base", usd: "text-sm" },
    lg: { ada: "text-xl", usd: "text-base" },
  };

  const { ada: adaSizeClass, usd: usdSizeClass } = sizeClasses[size];

  if (layout === "inline") {
    return (
      <span className={`inline-flex items-center gap-1.5 ${className}`}>
        <span
          className={`font-bold text-[#3A8F4C] ${adaSizeClass} ${adaClassName}`}
        >
          {formatAda(adaAmount)} ₳
        </span>
        {showUsd && (
          <span
            className={`text-muted-foreground ${usdSizeClass} ${usdClassName}`}
          >
            ({loading ? "..." : formatUsd(usdAmount)})
          </span>
        )}
      </span>
    );
  }

  return (
    <div className={`flex flex-col ${className}`}>
      <span
        className={`font-bold text-[#3A8F4C] ${adaSizeClass} ${adaClassName}`}
      >
        {formatAda(adaAmount)} ₳
      </span>
      {showUsd && (
        <span
          className={`text-muted-foreground ${usdSizeClass} ${usdClassName}`}
        >
          {loading ? "..." : formatUsd(usdAmount)}
        </span>
      )}
    </div>
  );
}

/**
 * Simple inline price display for lists/cards
 */
export function InlinePrice({
  adaAmount,
  className = "",
}: {
  adaAmount: number;
  className?: string;
}) {
  const { adaPrice, loading } = useAdaPrice();
  const usdAmount = adaToUsd(adaAmount, adaPrice);

  return (
    <div className={`flex flex-col ${className}`}>
      <span className="text-lg font-bold text-[#3A8F4C]">
        {formatAda(adaAmount)} ₳
      </span>
      <span className="text-xs text-muted-foreground">
        ≈ {loading ? "..." : formatUsd(usdAmount)}
      </span>
    </div>
  );
}

/**
 * Component to display only the USD equivalent
 */
export function PriceInUsd({
  adaAmount,
  className = "",
}: {
  adaAmount: number;
  className?: string;
}) {
  const { adaPrice, loading } = useAdaPrice();
  const usdAmount = adaToUsd(adaAmount, adaPrice);

  return (
    <p className={`text-sm text-muted-foreground ${className}`}>
      ≈ {loading ? "..." : formatUsd(usdAmount)}
    </p>
  );
}
