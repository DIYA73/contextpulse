"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { use } from "react";
import { LoopGraph } from "../../components/LoopGraph";
interface ToolCall { toolCallId: string; toolName: string; inputTokens: number; outputTokens: number; totalTokens: number; durationMs: number | null; startedAt: string; }
interface Alert { id: number; alertType: string; toolName: string | null; tokensUsed: number | null; percentUsed: number | null; firedAt: string; }
interface RunDetail { runId: string; label: string | null; startedAt: string; totalTokens: number; totalInputTokens: number; totalOutputTokens: number; toolCallCount: number; budget: { used: number; limit: number; percentUsed: number }; budgetStatus: string; }
const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000";
export default function RunDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [run, setRun] = useState<RunDetail | null>(null);
  const [toolCalls, setToolCalls] = useState<ToolCall[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    if (!id) return;
    Promise.all([fetch(`${API}/api/runs/${id}`).then((r) => r.json() as Promise<RunDetail>), fetch(`${API}/api/runs/${id}/tool-calls`).then((r) => r.json() as Promise<ToolCall[]>), fetch(`${API}/api/runs/${id}/alerts`).then((r) => r.json() as Promise<Alert[]>)]).then(([r, tc, al]) => { setRun(r); setToolCalls(tc); setAlerts(al); }).finally(() => setLoading(false));
  }, [id]);
  const max = Math.max(...toolCalls.map((t) => t.totalTokens), 1);
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <header className="border-b border-zinc-800 px-6 py-4 flex items-center gap-3">
        <Link href="/runs" className="text-zinc-600 hover:text-zinc-400 text-xs font-mono">← runs</Link>
        <span className="text-zinc-700">/</span>
        <span className="font-mono text-sm text-zinc-300">{run?.label ?? id.slice(0, 8)}</span>
      </header>
      {loading ? <div className="text-center py-16 text-zinc-600 font-mono text-sm">Loading…</div> : run === null ? <div className="text-center py-16 text-zinc-600 font-mono text-sm">Not found</div> : (
        <main className="max-w-5xl mx-auto px-6 py-8 space-y-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[["total tokens", run.totalTokens.toLocaleString()], ["input", run.totalInputTokens.toLocaleString()], ["output", run.totalOutputTokens.toLocaleString()], ["tool calls", run.toolCallCount]].map(([l, v]) => (
              <div key={String(l)} className="bg-zinc-900 border border-zinc-800 rounded-lg p-4"><p className="text-[11px] font-mono text-zinc-500 uppercase tracking-widest">{l}</p><p className="text-xl font-mono font-semibold text-zinc-200 mt-1">{v}</p></div>
            ))}
          </div>
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
            <p className="text-xs font-mono text-zinc-500 uppercase tracking-widest mb-3">Context budget</p>
            <div className="relative h-3 bg-zinc-800 rounded-full overflow-hidden">
              <div className={`absolute inset-y-0 left-0 rounded-full ${run.budget.percentUsed >= 90 ? "bg-red-500" : run.budget.percentUsed >= 70 ? "bg-amber-400" : "bg-emerald-500"}`} style={{ width: `${Math.min(run.budget.percentUsed, 100)}%` }} />
            </div>
            <div className="flex justify-between mt-2 text-xs font-mono text-zinc-500">
              <span>{run.budget.used.toLocaleString()} used</span><span>{run.budget.percentUsed.toFixed(1)}%</span><span>{run.budget.limit.toLocaleString()} limit</span>
            </div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <h2 className="text-xs font-mono text-zinc-500 uppercase tracking-widest mb-4">Tool calls ({toolCalls.length})</h2>
              <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4 space-y-2">
                {toolCalls.length === 0 ? <p className="text-zinc-600 text-sm text-center py-4">No tool calls</p> : toolCalls.map((tc) => (
                  <div key={tc.toolCallId} className="flex items-center gap-3">
                    <span className="text-[11px] font-mono text-zinc-500 w-32 truncate shrink-0">{tc.toolName}</span>
                    <div className="flex-1 h-5 bg-zinc-800 rounded-sm overflow-hidden relative"><div className="absolute inset-y-0 left-0 bg-sky-500 opacity-70 rounded-sm" style={{ width: `${Math.max((tc.totalTokens / max) * 100, 2)}%` }} /></div>
                    <span className="text-[11px] font-mono text-zinc-500 w-16 text-right shrink-0">{tc.totalTokens.toLocaleString()} tk</span>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h2 className="text-xs font-mono text-zinc-500 uppercase tracking-widest mb-4">Alerts ({alerts.length})</h2>
              <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4 space-y-2 max-h-96 overflow-y-auto">
                {alerts.length === 0 ? <p className="text-zinc-600 text-sm text-center py-4">No alerts</p> : alerts.map((a) => (
                  <div key={a.id} className={`p-2.5 rounded border text-xs ${a.alertType === "critical" ? "bg-red-950/30 border-red-800 text-red-400" : a.alertType === "loop_detected" ? "bg-violet-950/30 border-violet-800 text-violet-400" : "bg-amber-950/30 border-amber-800 text-amber-400"}`}>
                    <p className="font-mono font-semibold">{a.alertType}</p>
                    {a.percentUsed !== null && <p className="font-mono text-[10px] mt-0.5 opacity-70">{a.percentUsed.toFixed(1)}% · {a.tokensUsed?.toLocaleString()} tokens</p>}
                    <p className="font-mono text-[10px] opacity-50 mt-0.5">{new Date(a.firedAt).toLocaleTimeString()}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        <div className="max-w-5xl mx-auto px-6 pb-8">
            <h2 className="text-xs font-mono text-zinc-500 uppercase tracking-widest mb-4">Tool call frequency</h2>
            <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
              <LoopGraph toolCalls={toolCalls} loopThreshold={3} />
            </div>
          </div>
        </main>
      )}
    </div>
  );
}
