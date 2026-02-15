"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Volume2, ExternalLink, Loader2 } from "lucide-react";
import { MarkdownReply } from "./MarkdownReply";

type Message = { role: "user" | "assistant"; content: string; youtubeQuery?: string | null; hasVisual?: boolean };

export function ChatPanel({ isPremium }: { isPremium: boolean }) {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function sendMessage() {
    const text = input.trim();
    if (!text || loading) return;
    setInput("");
    setMessages((m) => [...m, { role: "user", content: text }]);
    setLoading(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Request failed");
      setMessages((m) => [
        ...m,
        {
          role: "assistant",
          content: data.reply,
          youtubeQuery: data.youtubeQuery ?? null,
          hasVisual: data.hasVisual ?? false,
        },
      ]);
    } catch (e) {
      setMessages((m) => [
        ...m,
        { role: "assistant", content: "Sorry, something went wrong. Please try again." },
      ]);
    } finally {
      setLoading(false);
    }
  }

  async function playTTS(content: string, id: string) {
    if (playingId) return;
    setPlayingId(id);
    try {
      const res = await fetch("/api/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: content.slice(0, 4096) }),
      });
      if (!res.ok) throw new Error("TTS failed");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const audio = new Audio(url);
      await audio.play();
      audio.onended = () => {
        URL.revokeObjectURL(url);
        setPlayingId(null);
      };
    } catch {
      setPlayingId(null);
    }
  }

  function openYouTube(query: string) {
    const url = `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`;
    window.open(url, "_blank");
  }

  return (
    <div className="flex flex-col flex-1 bg-white rounded-xl border border-ink-100 shadow-sm overflow-hidden">
      <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-[320px]">
        {messages.length === 0 && (
          <div className="text-center text-ink-500 py-8 text-sm">
            Ask a question about your notes. The AI answers only from your uploaded material.
            {isPremium && " As a premium user you get explained answers, visuals, and YouTube references."}
          </div>
        )}
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                msg.role === "user"
                  ? "bg-sage-600 text-white"
                  : "bg-ink-100 text-ink-900"
              }`}
            >
              {msg.role === "user" ? (
                <p className="whitespace-pre-wrap">{msg.content}</p>
              ) : (
                <>
                  <div className="chat-content">
                    <MarkdownReply content={msg.content} />
                  </div>
                  <div className="flex items-center gap-2 mt-3 flex-wrap">
                    <button
                      type="button"
                      onClick={() => playTTS(msg.content, `msg-${i}`)}
                      disabled={playingId !== null}
                      className="flex items-center gap-1.5 text-sm text-ink-600 hover:text-sage-600 disabled:opacity-50"
                    >
                      {playingId === `msg-${i}` ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Volume2 className="w-4 h-4" />
                      )}
                      Listen
                    </button>
                    {msg.youtubeQuery && isPremium && (
                      <button
                        type="button"
                        onClick={() => openYouTube(msg.youtubeQuery!)}
                        className="flex items-center gap-1.5 text-sm text-sage-600 hover:underline"
                      >
                        <ExternalLink className="w-4 h-4" /> YouTube: {msg.youtubeQuery}
                      </button>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-ink-100 rounded-2xl px-4 py-3 flex items-center gap-2 text-ink-600">
              <Loader2 className="w-4 h-4 animate-spin" /> Thinking…
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>
      <div className="p-4 border-t border-ink-100">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            sendMessage();
          }}
          className="flex gap-2"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about your notes…"
            className="flex-1 px-4 py-3 rounded-xl border border-ink-200 bg-ink-50 text-ink-900 placeholder:text-ink-400 focus:ring-2 focus:ring-sage-500 focus:border-sage-500"
          />
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-3 rounded-xl bg-sage-600 text-white font-medium hover:bg-sage-700 disabled:opacity-50 flex items-center gap-2"
          >
            <Send className="w-4 h-4" /> Send
          </button>
        </form>
      </div>
    </div>
  );
}
