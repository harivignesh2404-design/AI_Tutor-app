"use client";

import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";

export function LogoutButton() {
  const router = useRouter();
  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
    router.refresh();
  }
  return (
    <button
      type="button"
      onClick={handleLogout}
      className="flex items-center gap-1 text-ink-600 hover:text-ink-900 text-sm"
    >
      <LogOut className="w-4 h-4" /> Log out
    </button>
  );
}
