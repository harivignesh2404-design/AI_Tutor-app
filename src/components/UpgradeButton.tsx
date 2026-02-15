"use client";

import { useState } from "react";
import { Crown } from "lucide-react";

export function UpgradeButton({ onUpgrade }: { onUpgrade: () => void }) {
  const [loading, setLoading] = useState(false);
  async function handleUpgrade() {
    setLoading(true);
    try {
      const res = await fetch("/api/auth/upgrade", { method: "POST" });
      if (res.ok) onUpgrade();
    } finally {
      setLoading(false);
    }
  }
  return (
    <button
      type="button"
      onClick={handleUpgrade}
      disabled={loading}
      className="flex items-center gap-2 px-3 py-2 rounded-lg bg-amber-100 text-amber-800 text-sm font-medium hover:bg-amber-200 disabled:opacity-50"
    >
      <Crown className="w-4 h-4" /> {loading ? "Upgrading…" : "Upgrade to Premium (demo)"}
    </button>
  );
}
