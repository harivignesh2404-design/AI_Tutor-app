import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import Link from "next/link";
import { BookOpen, Crown } from "lucide-react";
import { LogoutButton } from "@/components/LogoutButton";

export const dynamic = "force-dynamic";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  if (!session) redirect("/login");

  return (
    <div className="min-h-screen flex flex-col bg-[#faf8f2]">
      <header className="border-b border-ink-200 bg-white/80 backdrop-blur sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-3 flex justify-between items-center">
          <Link href="/dashboard" className="font-semibold text-ink-800 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-sage-600" /> AI Teacher
          </Link>
          <div className="flex items-center gap-4">
            <span className="text-sm text-ink-600">{session.user.email}</span>
            {session.user.tier === "premium" && (
              <span className="flex items-center gap-1 text-amber-600 text-sm font-medium">
                <Crown className="w-4 h-4" /> Premium
              </span>
            )}
            <LogoutButton />
          </div>
        </div>
      </header>
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-6">
        {children}
      </main>
    </div>
  );
}
