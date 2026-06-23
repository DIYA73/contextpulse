"use client";
interface Alert { type: string; runId: string; message: string; at: Date; }
function icon(t: string) { if (t === "critical") return "🚨"; if (t === "warning") return "⚠️"; if (t === "loop") return "🔁"; return "ℹ️"; }
function color(t: string) { if (t === "critical") return "border-red-800 bg-red-950/30"; if (t === "warning") return "border-amber-800 bg-amber-950/30"; if (t === "loop") return "border-violet-800 bg-violet-950/30"; return "border-zinc-700 bg-zinc-900"; }
export function AlertFeed({ alerts, onClear }: { alerts: Alert[]; onClear: () => void }) {
  if (alerts.length === 0) return <div className="flex items-center justify-center h-24 text-zinc-600 text-sm">No alerts</div>;
  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs text-zinc-500">{alerts.length} alert{alerts.length !== 1 ? "s" : ""}</span>
        <button onClick={onClear} className="text-xs text-zinc-600 hover:text-zinc-400 transition-colors">Clear</button>
      </div>
      <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
        {alerts.map((a, i) => (
          <div key={i} className={`flex items-start gap-2 p-2.5 rounded border text-xs ${color(a.type)}`}>
            <span className="text-base leading-none mt-0.5">{icon(a.type)}</span>
            <div className="flex-1 min-w-0">
              <p className="text-zinc-300 leading-snug">{a.message}</p>
              <p className="text-zinc-600 font-mono mt-0.5">run: {a.runId.slice(0, 8)} · {a.at.toLocaleTimeString()}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
