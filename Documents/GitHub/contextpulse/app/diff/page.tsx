"use client";
import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
interface ToolSummary { toolName: string; callCount: number; totalTokens: number; avgTokens: number; isLoop: boolean; }
interface RunDiffSide { runId: string; label: string | null; startedAt: string; totalTokens: number; totalInputTokens: number; totalOutputTokens: number; toolCallCount: number; contextLimit: number; percentUsed: number; budgetStatus: string; alertCount: number; loopCount: number; tools: ToolSummary[]; }
interface ToolDiff { toolName: string; countA: number; countB: number; tokensA: number; tokensB: number; deltaTokens: number; onlyIn: "a" | "b" | "both"; loopA: boolean; loopB: boolean; }
interface DiffResult { runA: RunDiffSide; runB: RunDiffSide; diff: { totalTokensDelta: number; totalTokensDeltaPercent: number; tokenWinner: "a" | "b" | "tie"; toolCallCountDelta: number; toolCallWinner: "a" | "b" | "tie"; percentUsedDelta: number; budgetWinner: "a" | "b" | "tie"; tools: ToolDiff[]; newLoopsInB: string[]; resolvedLoopsFromA: string[]; summary: string; }; }
const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000";
function badge(s: string) { if (s === "critical" || s === "overflow") return "text-red-400 bg-red-950/40 border-red-800"; if (s === "warning") return "text-amber-400 bg-amber-950/40 border-amber-800"; return "text-emerald-400 bg-emerald-950/20 border-emerald-900"; }
function winnerTag(w: "a" | "b" | "tie", side: "a" | "b") { if (w === "tie") return null; return w === side ? <span className="ml-1 text-[10px] font-mono text-emerald-400 bg-emerald-950/40 border border-emerald-900 rounded px-1">WINNER</span> : null; }
function delta(n: number, pct: number, lowerIsBetter = true) { const better = lowerIsBetter ? n < 0 : n > 0; const color = n === 0 ? "text-zinc-500" : better ? "text-emerald-400" : "text-red-400"; const sign = n > 0 ? "+" : ""; return <span className={`text-xs font-mono ${color}`}>{sign}{n.toLocaleString()} ({sign}{pct.toFixed(1)}%)</span>; }
function RunCard({ run, side }: { run: RunDiffSide; side: "A" | "B" }) {
  const color = side === "A" ? "border-blue-700 bg-blue-950/10" : "border-violet-700 bg-violet-950/10";
  const label = side === "A" ? "text-blue-400" : "text-violet-400";
  return (
    <div className={`border rounded-lg p-4 ${color}`}>
      <div className="flex items-center gap-2 mb-3">
        <span className={`text-xs font-mono font-bold ${label}`}>RUN {side}</span>
        <span className="text-xs font-mono text-zinc-400 truncate">{run.label ?? run.runId.slice(0, 8)}</span>
        <span className={`ml-auto text-[10px] font-mono px-2 py-0.5 rounded border ${badge(run.budgetStatus)}`}>{run.budgetStatus}</span>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {[["total tokens", run.totalTokens.toLocaleString()], ["tool calls", run.toolCallCount], ["budget used", run.percentUsed.toFixed(1) + "%"], ["alerts", run.alertCount]].map(([l, v]) => (
          <div key={String(l)} className="bg-zinc-900/60 rounded p-2">
            <p className="text-[10px] font-mono text-zinc-600 uppercase">{l}</p>
            <p className="text-sm font-mono text-zinc-200 mt-0.5">{v}</p>
          </div>
        ))}
      </div>
      <div className="mt-3 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${run.percentUsed >= 90 ? "bg-red-500" : run.percentUsed >= 70 ? "bg-amber-400" : "bg-emerald-500"}`} style={{ width: `${Math.min(run.percentUsed, 100)}%` }} />
      </div>
    </div>
  );
}
export default function DiffPage() {
  const [runAId, setRunAId] = useState("");
  const [runBId, setRunBId] = useState("");
  const [result, setResult] = useState<DiffResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [runs, setRuns] = useState<Array<{ runId: string; label: string | null; startedAt: string; budgetStatus: string }>>([]);
  useEffect(() => {
    fetch(`${API}/api/runs?limit=50`).then(r => r.json()).then((data: Array<{ runId: string; label: string | null; startedAt: string; budgetStatus: string }>) => setRuns(data)).catch(() => null);
  }, []);
  const runDiff = useCallback(async () => {
    if (!runAId || !runBId) return;
    setLoading(true); setError(null); setResult(null);
    try {
      const r = await fetch(`${API}/api/diff?runA=${runAId}&runB=${runBId}`);
      if (!r.ok) { const e = await r.json() as { message?: string }; throw new Error(e.message ?? `HTTP ${r.status}`); }
      setResult(await r.json() as DiffResult);
    } catch (e) { setError(e instanceof Error ? e.message : "Failed"); }
    finally { setLoading(false); }
  }, [runAId, runBId]);
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <header className="border-b border-zinc-800 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/" className="text-zinc-600 hover:text-zinc-400 text-xs font-mono">← live</Link>
          <span className="text-zinc-700">/</span>
          <Link href="/runs" className="text-zinc-600 hover:text-zinc-400 text-xs font-mono">runs</Link>
          <span className="text-zinc-700">/</span>
          <span className="font-mono text-sm text-zinc-300">Run Diff</span>
        </div>
        <span className="text-xs font-mono text-zinc-600">compare two agent runs</span>
      </header>
      <main className="max-w-6xl mx-auto px-6 py-8 space-y-8">
        {/* Selector */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
          <h2 className="text-xs font-mono text-zinc-500 uppercase tracking-widest mb-4">Select runs to compare</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {(["A", "B"] as const).map((side) => (
              <div key={side}>
                <label className={`text-xs font-mono mb-2 block ${side === "A" ? "text-blue-400" : "text-violet-400"}`}>RUN {side}</label>
                <select value={side === "A" ? runAId : runBId} onChange={e => side === "A" ? setRunAId(e.target.value) : setRunBId(e.target.value)} className="w-full bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-sm font-mono text-zinc-200 focus:outline-none focus:border-zinc-500">
                  <option value="">Select a run…</option>
                  {runs.map(r => <option key={r.runId} value={r.runId}>{r.label ?? r.runId.slice(0, 8)} — {new Date(r.startedAt).toLocaleString()}</option>)}
                </select>
              </div>
            ))}
          </div>
          <button onClick={runDiff} disabled={!runAId || !runBId || loading || runAId === runBId} className="mt-4 px-6 py-2 bg-zinc-100 text-zinc-900 font-mono text-sm rounded hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
            {loading ? "Computing diff…" : "Compare runs →"}
          </button>
          {runAId === runBId && runAId !== "" && <p className="text-xs font-mono text-amber-400 mt-2">Select two different runs</p>}
        </div>
        {error && <div className="bg-red-950/30 border border-red-800 rounded-lg p-4 text-sm text-red-400 font-mono">{error}</div>}
        {result && (
          <div className="space-y-6">
            {/* Summary banner */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
              <p className="text-xs font-mono text-zinc-500 uppercase tracking-widest mb-2">Summary</p>
              <p className="text-sm text-zinc-300">{result.diff.summary}</p>
            </div>
            {/* Side by side cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <RunCard run={result.runA} side="A" />
              <RunCard run={result.runB} side="B" />
            </div>
            {/* Delta table */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
              <h2 className="text-xs font-mono text-zinc-500 uppercase tracking-widest mb-4">Key metrics diff</h2>
              <div className="space-y-3">
                {[
                  { label: "Total tokens", a: result.runA.totalTokens.toLocaleString(), b: result.runB.totalTokens.toLocaleString(), w: result.diff.tokenWinner, d: result.diff.totalTokensDelta, dp: result.diff.totalTokensDeltaPercent },
                  { label: "Budget used", a: result.runA.percentUsed.toFixed(1) + "%", b: result.runB.percentUsed.toFixed(1) + "%", w: result.diff.budgetWinner, d: result.diff.percentUsedDelta, dp: result.diff.percentUsedDelta },
                  { label: "Tool calls", a: String(result.runA.toolCallCount), b: String(result.runB.toolCallCount), w: result.diff.toolCallWinner, d: result.diff.toolCallCountDelta, dp: result.runA.toolCallCount > 0 ? (result.diff.toolCallCountDelta / result.runA.toolCallCount) * 100 : 0 },
                  { label: "Alerts", a: String(result.runA.alertCount), b: String(result.runB.alertCount), w: result.runA.alertCount <= result.runB.alertCount ? "a" as const : "b" as const, d: result.runB.alertCount - result.runA.alertCount, dp: result.runA.alertCount > 0 ? ((result.runB.alertCount - result.runA.alertCount) / result.runA.alertCount) * 100 : 0 },
                ].map(row => (
                  <div key={row.label} className="grid grid-cols-4 gap-4 items-center py-2 border-b border-zinc-800 last:border-0">
                    <span className="text-xs font-mono text-zinc-500">{row.label}</span>
                    <span className="text-sm font-mono text-blue-300 flex items-center gap-1">{row.a}{winnerTag(row.w, "a")}</span>
                    <span className="text-sm font-mono text-violet-300 flex items-center gap-1">{row.b}{winnerTag(row.w, "b")}</span>
                    <span>{delta(row.d, row.dp)}</span>
                  </div>
                ))}
              </div>
            </div>
            {/* Loop changes */}
            {(result.diff.newLoopsInB.length > 0 || result.diff.resolvedLoopsFromA.length > 0) && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {result.diff.newLoopsInB.length > 0 && (
                  <div className="bg-red-950/20 border border-red-800 rounded-lg p-4">
                    <p className="text-xs font-mono text-red-400 uppercase tracking-widest mb-2">🔴 New loops in Run B</p>
                    {result.diff.newLoopsInB.map(t => <p key={t} className="text-sm font-mono text-red-300">{t}</p>)}
                  </div>
                )}
                {result.diff.resolvedLoopsFromA.length > 0 && (
                  <div className="bg-emerald-950/20 border border-emerald-800 rounded-lg p-4">
                    <p className="text-xs font-mono text-emerald-400 uppercase tracking-widest mb-2">🟢 Loops resolved in Run B</p>
                    {result.diff.resolvedLoopsFromA.map(t => <p key={t} className="text-sm font-mono text-emerald-300">{t}</p>)}
                  </div>
                )}
              </div>
            )}
            {/* Tool diff table */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
              <h2 className="text-xs font-mono text-zinc-500 uppercase tracking-widest mb-4">Tool call diff ({result.diff.tools.length} tools)</h2>
              <div className="space-y-2">
                <div className="grid grid-cols-5 gap-2 text-[10px] font-mono text-zinc-600 uppercase pb-2 border-b border-zinc-800">
                  <span>Tool</span><span className="text-blue-400/60">Count A</span><span className="text-violet-400/60">Count B</span><span className="text-blue-400/60">Tokens A</span><span className="text-violet-400/60">Tokens B / Δ</span>
                </div>
                {result.diff.tools.map(t => (
                  <div key={t.toolName} className={`grid grid-cols-5 gap-2 items-center py-1.5 border-b border-zinc-800/50 last:border-0 ${t.onlyIn === "a" ? "opacity-50" : t.onlyIn === "b" ? "opacity-50" : ""}`}>
                    <span className="text-[11px] font-mono text-zinc-400 truncate flex items-center gap-1">
                      {(t.loopA || t.loopB) && <span className="text-red-400 text-[10px]">🔁</span>}
                      {t.onlyIn !== "both" && <span className={`text-[9px] px-1 rounded ${t.onlyIn === "a" ? "bg-blue-900/40 text-blue-400" : "bg-violet-900/40 text-violet-400"}`}>only {t.onlyIn.toUpperCase()}</span>}
                      {t.toolName}
                    </span>
                    <span className="text-[11px] font-mono text-blue-300">{t.countA > 0 ? t.countA + "x" : "—"}</span>
                    <span className="text-[11px] font-mono text-violet-300">{t.countB > 0 ? t.countB + "x" : "—"}</span>
                    <span className="text-[11px] font-mono text-blue-300">{t.tokensA > 0 ? t.tokensA.toLocaleString() : "—"}</span>
                    <span className={`text-[11px] font-mono ${t.deltaTokens < 0 ? "text-emerald-400" : t.deltaTokens > 0 ? "text-red-400" : "text-zinc-500"}`}>{t.tokensB > 0 ? t.tokensB.toLocaleString() : "—"} {t.deltaTokens !== 0 ? `(${t.deltaTokens > 0 ? "+" : ""}${t.deltaTokens.toLocaleString()})` : ""}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
