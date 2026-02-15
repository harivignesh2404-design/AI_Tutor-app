"use client";

import { useState } from "react";

export function AddNoteModal({
  open,
  onClose,
  onSaved,
}: {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, content }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to add note");
        return;
      }
      setTitle("");
      setContent("");
      onSaved();
      onClose();
    } catch {
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink-900/50" onClick={onClose}>
      <div
        className="bg-white rounded-2xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4 border-b border-ink-100">
          <h3 className="font-semibold text-ink-900">Add note</h3>
          <p className="text-sm text-ink-600 mt-1">The AI will train on this content to answer your questions.</p>
        </div>
        <form onSubmit={handleSubmit} className="p-4 flex flex-col flex-1 min-h-0">
          <div className="mb-4">
            <label className="block text-sm font-medium text-ink-700 mb-1">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              placeholder="e.g. Biology Chapter 5"
              className="w-full px-4 py-2 rounded-lg border border-ink-200 bg-white text-ink-900 focus:ring-2 focus:ring-sage-500"
            />
          </div>
          <div className="mb-4 flex-1 min-h-0 flex flex-col">
            <label className="block text-sm font-medium text-ink-700 mb-1">Content</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
              rows={10}
              placeholder="Paste or type your notes here…"
              className="w-full px-4 py-2 rounded-lg border border-ink-200 bg-white text-ink-900 focus:ring-2 focus:ring-sage-500 resize-none"
            />
          </div>
          {error && <p className="text-red-600 text-sm mb-2">{error}</p>}
          <div className="flex gap-2 justify-end">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg border border-ink-200 text-ink-700 hover:bg-ink-50">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="px-4 py-2 rounded-lg bg-sage-600 text-white font-medium hover:bg-sage-700 disabled:opacity-50">
              {loading ? "Saving…" : "Save note"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
