"use client";
import type { Budget } from "../hooks/useWebSocket";
interface BudgetBarProps { budget: Budget; runId: string; label?: string | null; animated?: boolean; }
function getColor(pct: number) { if (pct >= 90) return "bg-red-500"; if (pct >= 70) return "bg-amber-400"; return "bg-emerald-500"; }
function getStatus(pct: number) { if (pct >= 100) return { text: "OVERFLOW", color: "text-red-400" }; if (pct >= 90) return { text: "CRITICAL", color: "text-red-400" }; if (pct >= 70) return { text: "WARNING", color: "text-amber-400" }; return { text: "OK", color: "text-emerald-400" }; }
export function BudgetBar({ budget, runId, label, animated = true }: BudgetBarProps) {
  const pct = Math.min(budget.percentUsed, 100);
  const status = getStatus(budget.percentUsed);
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-zinc-500 truncate max-w-[120px]">{label ?? runId.slice(0, 8)}</span>
          <span className={`text-xs font-mono font-semibold ${status.color}`}>{status.text}</span>
        </div>
        <span className="text-xs font-mono text-zinc-400">{budget.used.toLocaleString()} / {budget.limit.toLocaleString()}</span>
      </div>
      <div className="relative h-2 bg-zinc-800 rounded-full overflow-hidden">
        <div className={`absolute inset-y-0 left-0 ${getColor(pct)} rounded-full ${animated ? "transition-all duration-500 ease-out" : ""}`} style={{ width: `${pct}%` }} />
        <div className="absolute inset-y-0 left-[70%] w-px bg-amber-400/30" />
        <div className="absolute inset-y-0 left-[90%] w-px bg-red-500/30" />
      </div>
      <div className="flex justify-between mt-1.5">
        <span className="text-[10px] font-mono text-zinc-600">0</span>
        <span className="text-[10px] font-mono text-zinc-400 font-semibold">{pct.toFixed(1)}%</span>
        <span className="text-[10px] font-mono text-zinc-600">100%</span>
      </div>
    </div>
  );
}
