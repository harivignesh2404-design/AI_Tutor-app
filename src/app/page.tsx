"use client";

import Link from "next/link";
import { BookOpen, Mic, Sparkles, Crown } from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-ink-200 bg-white/80 backdrop-blur">
        <div className="max-w-5xl mx-auto px-4 py-4 flex justify-between items-center">
          <span className="font-semibold text-ink-800">AI Teacher</span>
          <nav className="flex gap-4">
            <Link href="/login" className="text-ink-600 hover:text-ink-900">Log in</Link>
            <Link href="/register" className="bg-sage-600 text-white px-4 py-2 rounded-lg hover:bg-sage-700">Sign up</Link>
          </nav>
        </div>
      </header>
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-16">
        <h1 className="text-4xl md:text-5xl font-bold text-ink-900 text-center max-w-2xl mb-4">
          Your notes. Your teacher.
        </h1>
        <p className="text-lg text-ink-600 text-center max-w-xl mb-12">
          Upload notes, ask questions, and get answers in plain language or with voice — like NotebookLM, tailored to you.
        </p>
        <div className="grid md:grid-cols-2 gap-8 max-w-3xl w-full mb-12">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-ink-100">
            <BookOpen className="w-10 h-10 text-sage-600 mb-3" />
            <h2 className="font-semibold text-ink-900 mb-2">Train on your notes</h2>
            <p className="text-ink-600 text-sm">Add your course or study notes. The AI learns from them and answers only from your material.</p>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-ink-100">
            <Mic className="w-10 h-10 text-sage-600 mb-3" />
            <h2 className="font-semibold text-ink-900 mb-2">Voice-assisted learning</h2>
            <p className="text-ink-600 text-sm">Listen to answers with AI-generated voice. Free tier gets simple voice; premium gets higher quality.</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-4 justify-center">
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-ink-100 text-ink-700 text-sm">
            <Sparkles className="w-4 h-4" /> Free: simple notes & voice
          </div>
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-amber-50 text-amber-800 text-sm border border-amber-200">
            <Crown className="w-4 h-4" /> Premium: explained notes, perfect voice, visuals, YouTube refs
          </div>
        </div>
        <Link href="/register" className="mt-10 inline-flex items-center gap-2 bg-sage-600 text-white px-6 py-3 rounded-xl hover:bg-sage-700 font-medium">
          Get started free
        </Link>
      </main>
    </div>
  );
}
