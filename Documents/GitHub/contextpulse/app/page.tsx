"use client";
import { useWebSocket } from "./hooks/useWebSocket";
import { BudgetBar } from "./components/BudgetBar";
import { Waterfall } from "./components/Waterfall";
import { AlertFeed } from "./components/AlertFeed";
import { StatCard } from "./components/StatCard";
import Link from "next/link";
import { useMemo } from "react";
import type { ToolCallEvent } from "./hooks/useWebSocket";
export default function Home() {
  const { connected, messages, activeBudgets, alerts, clearAlerts } = useWebSocket();
  const toolCallEvents = useMemo(() => messages.filter((m) => m.event === "tool_call_end").map((m) => (m as { event: "tool_call_end"; data: ToolCallEvent }).data).slice(0, 30), [messages]);
  const totalTokensLive = useMemo(() => { let s = 0; activeBudgets.forEach((b) => (s += b.used)); return s; }, [activeBudgets]);
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <header className="border-b border-zinc-800 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-emerald-500" />
          <span className="font-mono text-sm font-semibold">ContextPulse</span>
          <span className="text-zinc-600 text-xs font-mono">dashboard</span>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <div className={`w-1.5 h-1.5 rounded-full ${connected ? "bg-emerald-500 animate-pulse" : "bg-zinc-600"}`} />
            <span className="text-xs font-mono text-zinc-500">{connected ? "live" : "disconnected"}</span>
          </div>
          <Link href="/runs" className="text-xs font-mono text-zinc-500 hover:text-zinc-300 border border-zinc-800 rounded px-3 py-1.5">run history →</Link>
        </div>
      </header>
      <main className="max-w-6xl mx-auto px-6 py-8 space-y-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard label="Active runs" value={activeBudgets.size} sub="in-memory tracker" accent={activeBudgets.size > 0 ? "teal" : "zinc"} />
          <StatCard label="Live tokens" value={totalTokensLive.toLocaleString()} sub="across active runs" accent={totalTokensLive > 100000 ? "amber" : "zinc"} />
          <StatCard label="Tool calls" value={toolCallEvents.length} sub="this session" accent="zinc" />
          <StatCard label="Alerts" value={alerts.length} sub="warnings + criticals" accent={alerts.some((a) => a.type === "critical") ? "red" : alerts.length > 0 ? "amber" : "zinc"} />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <h2 className="text-xs font-mono text-zinc-500 uppercase tracking-widest">Live context budgets</h2>
            {activeBudgets.size === 0 ? (
              <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-8 text-center">
                <p className="text-zinc-600 text-sm">No active runs</p>
                <p className="text-zinc-700 text-xs mt-1 font-mono">Start an agent session to see live budget tracking</p>
              </div>
            ) : (
              <div className="space-y-3">
                {Array.from(activeBudgets.entries()).map(([runId, budget]) => (
                  <BudgetBar key={runId} runId={runId} budget={budget} animated />
                ))}
              </div>
            )}
            <div className="mt-6">
              <h2 className="text-xs font-mono text-zinc-500 uppercase tracking-widest mb-4">Tool call waterfall</h2>
              <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
                <Waterfall toolCalls={toolCallEvents} />
              </div>
            </div>
          </div>
          <div>
            <h2 className="text-xs font-mono text-zinc-500 uppercase tracking-widest mb-4">Alert feed</h2>
            <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
              <AlertFeed alerts={alerts} onClear={clearAlerts} />
            </div>
            <div className="mt-6">
              <h2 className="text-xs font-mono text-zinc-500 uppercase tracking-widest mb-4">Event log</h2>
              <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-3 space-y-1.5 max-h-64 overflow-y-auto">
                {messages.length === 0 ? (
                  <p className="text-zinc-600 text-xs font-mono text-center py-4">Waiting for events…</p>
                ) : (
                  messages.slice(0, 20).map((msg, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <span className="text-[10px] font-mono text-zinc-700 shrink-0">{new Date().toLocaleTimeString("en", { hour12: false })}</span>
                      <span className={`text-[11px] font-mono truncate ${msg.event === "budget_critical" ? "text-red-400" : msg.event === "budget_warning" ? "text-amber-400" : msg.event === "loop_detected" ? "text-violet-400" : "text-zinc-400"}`}>
                        {msg.event}{msg.event === "tool_call_end" && ` · ${(msg as { event: "tool_call_end"; data: ToolCallEvent }).data.toolName}`}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
