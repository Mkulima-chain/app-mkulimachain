"use client";

import type { Asset } from "@/components/wallet/types";

interface AssetItemProps {
  asset: Asset;
  balance: number;
  isAda?: boolean;
}

const ASSET_ICON_BG = "bg-white/10";
const TOKEN_ICON_BG = "bg-yellow-500/20";
const TOKEN_ICON = "⚡";
const ADA_ICON = "A";
const USD_PRICE_PLACEHOLDER = "$0.00";
const BALANCE_DECIMALS = 6;
const MAX_ASSET_NAME_LENGTH = 6;

export function AssetItem({ asset, balance, isAda = false }: AssetItemProps) {
  const displayName = asset.name || asset.unit.slice(0, MAX_ASSET_NAME_LENGTH);
  const iconBg = isAda ? ASSET_ICON_BG : TOKEN_ICON_BG;
  const icon = isAda ? ADA_ICON : TOKEN_ICON;

  return (
    <div className="bg-[#3A3F54] dark:bg-[#3A3F54] rounded-lg p-3 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div
          className={`w-10 h-10 rounded-lg ${iconBg} flex items-center justify-center`}
        >
          <span
            className={
              isAda ? "text-white font-bold text-lg" : "text-yellow-400 text-lg"
            }
          >
            {icon}
          </span>
        </div>
        <div>
          <p className="text-white font-medium text-sm">{displayName}</p>
          <p className="text-white/50 text-xs">{USD_PRICE_PLACEHOLDER}</p>
        </div>
      </div>
      <p className="text-white font-semibold">
        {balance.toFixed(BALANCE_DECIMALS)}
      </p>
    </div>
  );
}
