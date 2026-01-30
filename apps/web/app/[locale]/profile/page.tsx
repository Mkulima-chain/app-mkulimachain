"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

export default function ProfilePage() {
  const router = useRouter();
  const { status } = useSession();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }

    // Rediriger vers settings avec la section profil active
    router.push("/settings?section=profile");
  }, [router, status]);

  return (
    <div className="min-h-screen bg-white dark:bg-[#004D73] flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#3A8F4C]"></div>
    </div>
  );
}
