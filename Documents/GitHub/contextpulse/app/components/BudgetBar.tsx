"use client";
import type { Budget } from "../hooks/useWebSocket";
import { getBudgetColor, getBudgetStatusLabel } from "../lib/budget-status";
interface BudgetBarProps { budget: Budget; runId: string; label?: string | null; animated?: boolean; }
export function BudgetBar({ budget, runId, label, animated = true }: BudgetBarProps) {
  const warningPct = budget.warningThresholdPct ?? 70;
  const criticalPct = budget.criticalThresholdPct ?? 90;
  const pct = Math.min(budget.percentUsed, 100);
  const status = getBudgetStatusLabel(budget.percentUsed, warningPct, criticalPct);
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
        <div className={`absolute inset-y-0 left-0 ${getBudgetColor(pct, warningPct, criticalPct)} rounded-full ${animated ? "transition-all duration-500 ease-out" : ""}`} style={{ width: `${pct}%` }} />
        <div className="absolute inset-y-0 w-px bg-amber-400/30" style={{ left: `${warningPct}%` }} />
        <div className="absolute inset-y-0 w-px bg-red-500/30" style={{ left: `${criticalPct}%` }} />
      </div>
      <div className="flex justify-between mt-1.5">
        <span className="text-[10px] font-mono text-zinc-600">0</span>
        <span className="text-[10px] font-mono text-zinc-400 font-semibold">{pct.toFixed(1)}%</span>
        <span className="text-[10px] font-mono text-zinc-600">100%</span>
      </div>
    </div>
  );
}
