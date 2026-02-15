"use client";

import { useEffect, useRef, useState } from "react";
import mermaid from "mermaid";

// Simple markdown-like rendering: paragraphs, code blocks (including mermaid), bold, lists, links.
// Strips [YouTube: ...] for display (link is shown as button in ChatPanel).
function renderChunks(content: string): React.ReactNode[] {
  const parts: React.ReactNode[] = [];
  let rest = content.replace(/\[YouTube:\s*[^\]]+\]/g, "").trim();
  const codeBlockRegex = /```(\w+)?\s*([\s\S]*?)```/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  while ((match = codeBlockRegex.exec(rest)) !== null) {
    if (match.index > lastIndex) {
      parts.push(paragraphsToNodes(rest.slice(lastIndex, match.index)));
    }
    const lang = (match[1] || "").toLowerCase();
    const code = match[2].trim();
    if (lang === "mermaid") {
      parts.push(<MermaidDiagram key={parts.length} code={code} />);
    } else {
      parts.push(
        <pre key={parts.length} className="rounded-lg bg-ink-100 p-4 overflow-x-auto text-sm my-2">
          <code>{code}</code>
        </pre>
      );
    }
    lastIndex = match.index + match[0].length;
  }
  if (lastIndex < rest.length) {
    parts.push(paragraphsToNodes(rest.slice(lastIndex)));
  }
  return parts;
}

function paragraphsToNodes(text: string): React.ReactNode {
  const lines = text.split(/\n/);
  const nodes: React.ReactNode[] = [];
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    if (/^[-*]\s+/.test(line) || /^\d+\.\s+/.test(line)) {
      const list: string[] = [];
      while (i < lines.length && (/^[-*]\s+/.test(lines[i]) || /^\d+\.\s+/.test(lines[i]))) {
        list.push(lines[i].replace(/^[-*]\s+/, "").replace(/^\d+\.\s+/, ""));
        i++;
      }
      nodes.push(
        <ul key={nodes.length} className="my-2 pl-6 list-disc">
          {list.map((item, j) => (
            <li key={j} className="my-0.5">{inlineFormat(item)}</li>
          ))}
        </ul>
      );
      continue;
    }
    if (line.trim() === "") {
      i++;
      continue;
    }
    nodes.push(
      <p key={nodes.length} className="my-2">
        {inlineFormat(line)}
      </p>
    );
    i++;
  }
  return <>{nodes}</>;
}

function inlineFormat(str: string): React.ReactNode {
  const parts: (string | JSX.Element)[] = [];
  let s = str;
  const strongRegex = /\*\*([^*]+)\*\*/g;
  let lastIndex = 0;
  let m: RegExpExecArray | null;
  while ((m = strongRegex.exec(s)) !== null) {
    if (m.index > lastIndex) parts.push(s.slice(lastIndex, m.index));
    parts.push(<strong key={parts.length}>{m[1]}</strong>);
    lastIndex = m.index + m[0].length;
  }
  if (lastIndex < s.length) parts.push(s.slice(lastIndex));
  const withLinks: React.ReactNode[] = [];
  parts.forEach((p) => {
    if (typeof p !== "string") {
      withLinks.push(p);
      return;
    }
    const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
    let idx = 0;
    let lm: RegExpExecArray | null;
    while ((lm = linkRegex.exec(p)) !== null) {
      if (lm.index > idx) withLinks.push(p.slice(idx, lm.index));
      withLinks.push(
        <a key={withLinks.length} href={lm[2]} target="_blank" rel="noopener noreferrer" className="text-sage-600 underline hover:text-sage-700">
          {lm[1]}
        </a>
      );
      idx = lm.index + lm[0].length;
    }
    if (idx < p.length) withLinks.push(p.slice(idx));
  });
  return <>{withLinks.length ? withLinks : parts}</>;
}

let mermaidInit = false;
function initMermaid() {
  if (mermaidInit) return;
  mermaidInit = true;
  mermaid.initialize({ startOnLoad: false, theme: "neutral", securityLevel: "loose" });
}

function MermaidDiagram({ code }: { code: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [svg, setSvg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    initMermaid();
    let cancelled = false;
    const id = "mermaid-" + Math.random().toString(36).slice(2);
    mermaid
      .render(id, code)
      .then(({ svg: out }) => {
        if (!cancelled) setSvg(out);
      })
      .catch((e) => {
        if (!cancelled) setErr(String(e.message || "Diagram error"));
      });
    return () => {
      cancelled = true;
    };
  }, [code]);

  if (err) return <p className="text-ink-500 text-sm my-2">Diagram could not be rendered.</p>;
  if (svg) return <div className="my-4 flex justify-center" dangerouslySetInnerHTML={{ __html: svg }} />;
  return <div ref={containerRef} className="mermaid my-4">{code}</div>;
}

export function MarkdownReply({ content }: { content: string }) {
  return <>{renderChunks(content)}</>;
}
