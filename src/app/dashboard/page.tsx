"use client";

import { useEffect, useState } from "react";
import { Plus, FileText, Mic, Crown } from "lucide-react";
import { ChatPanel } from "@/components/ChatPanel";
import { AddNoteModal } from "@/components/AddNoteModal";
import { UpgradeButton } from "@/components/UpgradeButton";

type Note = { id: string; title: string; contentType: string; createdAt: string; updatedAt: string };
type User = { id: string; email: string; tier: string } | null;

export default function DashboardPage() {
  const [user, setUser] = useState<User>(null);
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [addNoteOpen, setAddNoteOpen] = useState(false);

  useEffect(() => {
    (async () => {
      const [meRes, notesRes] = await Promise.all([
        fetch("/api/auth/me"),
        fetch("/api/notes"),
      ]);
      const meData = await meRes.json();
      const notesData = await notesRes.json();
      setUser(meData.user ?? null);
      setNotes(notesData.notes ?? []);
    })().finally(() => setLoading(false));
  }, []);

  const refreshNotes = async () => {
    const res = await fetch("/api/notes");
    const data = await res.json();
    setNotes(data.notes ?? []);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="text-ink-600">Loading…</p>
      </div>
    );
  }

  return (
    <div className="grid lg:grid-cols-[320px_1fr] gap-6">
      <aside className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-ink-900">My notes</h2>
          <button
            onClick={() => setAddNoteOpen(true)}
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-sage-600 text-white text-sm font-medium hover:bg-sage-700"
          >
            <Plus className="w-4 h-4" /> Add note
          </button>
        </div>
        <div className="bg-white rounded-xl border border-ink-100 shadow-sm divide-y divide-ink-100 max-h-[60vh] overflow-y-auto">
          {notes.length === 0 ? (
            <div className="p-6 text-center text-ink-500 text-sm">
              No notes yet. Add notes so the AI can train on them and answer your questions.
            </div>
          ) : (
            notes.map((n) => (
              <div key={n.id} className="p-3 flex items-center gap-2 hover:bg-ink-50">
                <FileText className="w-4 h-4 text-sage-600 shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-ink-900 truncate">{n.title}</p>
                  <p className="text-xs text-ink-500">
                    {new Date(n.updatedAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
        <div className="rounded-xl border border-ink-100 bg-white p-4 text-sm text-ink-600">
          <p className="font-medium text-ink-800 mb-2">Your plan</p>
          {user?.tier === "premium" ? (
            <p className="flex items-center gap-2 text-amber-700">
              <Crown className="w-4 h-4" /> Premium: explained notes, perfect voice, visuals, YouTube refs
            </p>
          ) : (
            <>
              <p className="mb-3">Free: simple notes & AI voice. Upgrade for explained answers, visuals & YouTube refs.</p>
              <UpgradeButton onUpgrade={() => setUser((u) => (u ? { ...u, tier: "premium" } : null))} />
            </>
          )}
        </div>
      </aside>
      <section className="min-h-[70vh] flex flex-col">
        <div className="flex items-center gap-2 mb-4">
          <Mic className="w-5 h-5 text-sage-600" />
          <h2 className="font-semibold text-ink-900">Ask your AI teacher</h2>
        </div>
        <ChatPanel isPremium={user?.tier === "premium"} />
      </section>
      <AddNoteModal
        open={addNoteOpen}
        onClose={() => setAddNoteOpen(false)}
        onSaved={refreshNotes}
      />
    </div>
  );
}
