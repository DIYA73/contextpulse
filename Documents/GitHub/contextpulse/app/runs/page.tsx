"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
interface Run { runId: string; label: string | null; startedAt: string; totalTokens: number; toolCallCount: number; budget: { used: number; limit: number; percentUsed: number }; budgetStatus: string; }
const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000";
function badge(s: string) { if (s === "critical" || s === "overflow") return "bg-red-900/40 text-red-400 border-red-800"; if (s === "warning") return "bg-amber-900/40 text-amber-400 border-amber-800"; return "bg-emerald-900/20 text-emerald-400 border-emerald-900"; }
export default function RunsPage() {
  const [runs, setRuns] = useState<Run[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    fetch(`${API}/api/runs?limit=50`).then((r) => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json() as Promise<Run[]>; }).then(setRuns).catch((e: unknown) => setError(e instanceof Error ? e.message : "Failed")).finally(() => setLoading(false));
  }, []);
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <header className="border-b border-zinc-800 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/" className="text-zinc-600 hover:text-zinc-400 text-xs font-mono">← live</Link>
          <span className="text-zinc-700">/</span>
          <span className="font-mono text-sm text-zinc-300">Run history</span>
        </div>
        <span className="text-xs font-mono text-zinc-600">{runs.length} runs</span>
      </header>
      <main className="max-w-5xl mx-auto px-6 py-8">
        {loading && <div className="text-center py-16 text-zinc-600 font-mono text-sm">Loading…</div>}
        {error && <div className="bg-red-950/30 border border-red-800 rounded-lg p-4 text-sm text-red-400 font-mono">{error}</div>}
        {!loading && !error && runs.length === 0 && <div className="text-center py-16 text-zinc-600 font-mono text-sm">No runs yet.</div>}
        {!loading && runs.length > 0 && (
          <div className="space-y-2">
            {runs.map((run) => (
              <Link key={run.runId} href={`/runs/${run.runId}`} className="block bg-zinc-900 border border-zinc-800 hover:border-zinc-700 rounded-lg p-4 transition-colors group">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${badge(run.budgetStatus)}`}>{run.budgetStatus}</span>
                    <span className="text-sm font-mono text-zinc-300 group-hover:text-white">{run.label ?? run.runId.slice(0, 8)}</span>
                  </div>
                  <span className="text-xs font-mono text-zinc-600">{new Date(run.startedAt).toLocaleString()}</span>
                </div>
                <div className="mt-3 flex items-center gap-6">
                  <div><p className="text-[10px] font-mono text-zinc-600 uppercase">tokens</p><p className="text-sm font-mono text-zinc-300">{run.totalTokens.toLocaleString()}</p></div>
                  <div><p className="text-[10px] font-mono text-zinc-600 uppercase">tool calls</p><p className="text-sm font-mono text-zinc-300">{run.toolCallCount}</p></div>
                  <div><p className="text-[10px] font-mono text-zinc-600 uppercase">budget</p><p className="text-sm font-mono text-zinc-300">{run.budget.percentUsed.toFixed(1)}%</p></div>
                  <div className="flex-1"><div className="h-1 bg-zinc-800 rounded-full overflow-hidden"><div className={`h-full rounded-full ${run.budget.percentUsed >= 90 ? "bg-red-500" : run.budget.percentUsed >= 70 ? "bg-amber-400" : "bg-emerald-500"}`} style={{ width: `${Math.min(run.budget.percentUsed, 100)}%` }} /></div></div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
