"use client";

import Link from "next/link";

export function NavLogo() {
  return (
    <Link href="/" className="flex items-center space-x-2">
      <div className="flex items-center gap-2">
        <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-[#3A8F4C] to-[#2E7D32] flex items-center justify-center">
          <span className="text-white font-bold text-lg">M</span>
        </div>
        <span className="text-xl font-bold text-[#5A3E36] dark:text-white">
          Mkulima Chain
        </span>
      </div>
    </Link>
  );
}
