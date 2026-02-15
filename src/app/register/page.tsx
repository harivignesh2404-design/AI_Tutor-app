"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, name: name || undefined }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Registration failed");
        return;
      }
      router.push("/dashboard");
      router.refresh();
    } catch {
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 bg-[#faf8f2]">
      <div className="w-full max-w-sm">
        <h1 className="text-2xl font-bold text-ink-900 mb-6 text-center">Sign up</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-ink-700 mb-1">Name (optional)</label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-ink-200 bg-white text-ink-900 focus:ring-2 focus:ring-sage-500 focus:border-sage-500"
            />
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-ink-700 mb-1">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-2 rounded-lg border border-ink-200 bg-white text-ink-900 focus:ring-2 focus:ring-sage-500 focus:border-sage-500"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-ink-700 mb-1">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="w-full px-4 py-2 rounded-lg border border-ink-200 bg-white text-ink-900 focus:ring-2 focus:ring-sage-500 focus:border-sage-500"
            />
          </div>
          {error && <p className="text-red-600 text-sm">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 rounded-lg bg-sage-600 text-white font-medium hover:bg-sage-700 disabled:opacity-50"
          >
            {loading ? "Creating account…" : "Sign up"}
          </button>
        </form>
        <p className="mt-4 text-center text-ink-600 text-sm">
          Already have an account? <Link href="/login" className="text-sage-600 hover:underline">Log in</Link>
        </p>
      </div>
    </div>
  );
}
