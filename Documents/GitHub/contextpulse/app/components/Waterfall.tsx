"use client";
import type { ToolCallEvent } from "../hooks/useWebSocket";
const C: Record<string, string> = { read_file: "bg-blue-500", bash: "bg-emerald-500", edit: "bg-violet-500", write: "bg-violet-500", search: "bg-amber-500" };
function gc(n: string) { return C[n] ?? "bg-sky-500"; }
export function Waterfall({ toolCalls, maxTokens }: { toolCalls: ToolCallEvent[]; maxTokens?: number }) {
  const max = maxTokens ?? Math.max(...toolCalls.map((t) => t.totalTokens), 1);
  if (toolCalls.length === 0) return <div className="flex items-center justify-center h-32 text-zinc-600 text-sm">Waiting for tool calls…</div>;
  return (
    <div className="space-y-1.5 overflow-y-auto max-h-[360px] pr-1">
      {toolCalls.map((tc) => (
        <div key={tc.toolCallId} className="flex items-center gap-3">
          <span className="text-[11px] font-mono text-zinc-500 w-28 truncate shrink-0">{tc.toolName}</span>
          <div className="flex-1 h-6 bg-zinc-800 rounded-sm relative overflow-hidden">
            <div className={`absolute inset-y-0 left-0 ${gc(tc.toolName)} opacity-80 rounded-sm transition-all duration-300`} style={{ width: `${Math.max((tc.totalTokens / max) * 100, 2)}%` }} />
          </div>
          <span className="text-[11px] font-mono text-zinc-500 w-16 text-right shrink-0">{tc.totalTokens.toLocaleString()} tk</span>
        </div>
      ))}
    </div>
  );
}
