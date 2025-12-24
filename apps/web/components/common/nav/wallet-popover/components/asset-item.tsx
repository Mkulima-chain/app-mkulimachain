"use client";

import type { Asset } from "@/components/wallet/types";
import {
  useAdaPrice,
  formatUsd,
  adaToUsd,
} from "@/components/ui/price-display";

interface AssetItemProps {
  asset: Asset;
  balance: number;
  isAda?: boolean;
}

const ASSET_ICON_BG = "bg-gray-200 dark:bg-white/10";
const TOKEN_ICON_BG = "bg-yellow-100 dark:bg-yellow-500/20";
const TOKEN_ICON = "⚡";
const ADA_ICON = "₳";
const BALANCE_DECIMALS = 2;
const MAX_ASSET_NAME_LENGTH = 12;

export function AssetItem({ asset, balance, isAda = false }: AssetItemProps) {
  const { adaPrice, loading } = useAdaPrice();
  const displayName = asset.name || asset.unit.slice(0, MAX_ASSET_NAME_LENGTH);
  const iconBg = isAda ? ASSET_ICON_BG : TOKEN_ICON_BG;
  const icon = isAda ? ADA_ICON : TOKEN_ICON;

  // Calculate USD value for ADA
  const usdValue = isAda && adaPrice ? adaToUsd(balance, adaPrice) : null;
  const usdDisplay = loading
    ? "Loading..."
    : usdValue !== null
      ? formatUsd(usdValue)
      : "$0.00";

  return (
    <div className="bg-gray-100 dark:bg-[#3A3F54] rounded-lg p-3 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div
          className={`w-10 h-10 rounded-lg ${iconBg} flex items-center justify-center`}
        >
          <span
            className={
              isAda
                ? "text-gray-900 dark:text-white font-bold text-lg"
                : "text-yellow-600 dark:text-yellow-400 text-lg"
            }
          >
            {icon}
          </span>
        </div>
        <div>
          <p className="text-gray-900 dark:text-white font-medium text-sm">
            {displayName}
          </p>
          <p className="text-gray-500 dark:text-white/50 text-xs">
            {usdDisplay}
          </p>
        </div>
      </div>
      <p className="text-gray-900 dark:text-white font-semibold">
        {balance.toFixed(BALANCE_DECIMALS)}
      </p>
    </div>
  );
}
