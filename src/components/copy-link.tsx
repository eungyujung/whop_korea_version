"use client";

import { useState } from "react";

export function CopyLink({ url }: { url: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // 클립보드 권한이 없으면 사용자가 직접 선택해 복사
    }
  }

  return (
    <div className="flex min-w-0 items-center gap-2">
      <code className="min-w-0 truncate rounded bg-slate-100 px-2 py-1 text-xs">{url}</code>
      <button type="button" onClick={copy} className="shrink-0 rounded border border-slate-300 px-2 py-1 text-xs hover:bg-slate-50">
        {copied ? "복사됨" : "복사"}
      </button>
    </div>
  );
}
