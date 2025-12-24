"use client";

import Link from "next/link";
import Image from "next/image";

export function NavLogo() {
  return (
    <Link href="/" className="flex items-center space-x-2">
      <div className="flex items-center gap-2">
        <Image
          src="/logo-mkulima-leaf.png"
          alt="Mkulima Chain Logo"
          width={32}
          height={32}
          className="h-8 w-8 object-contain"
        />
        <span className="text-xl font-bold text-[#5A3E36] dark:text-white">
          Mkulima Chain
        </span>
      </div>
    </Link>
  );
}
