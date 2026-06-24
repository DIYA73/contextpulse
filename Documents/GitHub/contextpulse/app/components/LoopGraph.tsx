"use client";

interface ToolFrequency {
  toolName: string;
  count: number;
  isLoop: boolean;
}

interface LoopGraphProps {
  toolCalls: Array<{ toolName: string }>;
  loopThreshold?: number;
}

export function LoopGraph({ toolCalls, loopThreshold = 3 }: LoopGraphProps) {
  if (toolCalls.length === 0) {
    return (
      <div className="flex items-center justify-center h-24 text-zinc-600 text-sm">
        No tool calls yet
      </div>
    );
  }

  // Count frequency per tool
  const freq = new Map<string, number>();
  for (const tc of toolCalls) {
    freq.set(tc.toolName, (freq.get(tc.toolName) ?? 0) + 1);
  }

  const data: ToolFrequency[] = Array.from(freq.entries())
    .map(([toolName, count]) => ({ toolName, count, isLoop: count >= loopThreshold }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 12);

  const max = Math.max(...data.map((d) => d.count), 1);
  const loopCount = data.filter((d) => d.isLoop).length;

  return (
    <div>
      {loopCount > 0 && (
        <div className="flex items-center gap-2 mb-4 px-3 py-2 rounded bg-red-950/30 border border-red-800">
          <span className="text-base">🔁</span>
          <span className="text-xs font-mono text-red-400">
            {loopCount} tool{loopCount !== 1 ? "s" : ""} called {loopThreshold}+ times — possible loop
          </span>
        </div>
      )}

      <div className="space-y-2">
        {data.map((d) => (
          <div key={d.toolName} className="flex items-center gap-3 group">
            <span
              className={`text-[11px] font-mono w-28 truncate shrink-0 ${
                d.isLoop ? "text-red-400" : "text-zinc-500"
              }`}
            >
              {d.toolName}
            </span>

            <div className="flex-1 h-6 bg-zinc-800 rounded-sm relative overflow-hidden">
              <div
                className={`absolute inset-y-0 left-0 rounded-sm transition-all duration-300 ${
                  d.isLoop ? "bg-red-500 opacity-80" : "bg-sky-500 opacity-60"
                }`}
                style={{ width: `${(d.count / max) * 100}%` }}
              />
              {d.isLoop && (
                <div className="absolute inset-y-0 left-0 w-full flex items-center pl-2">
                  <span className="text-[10px] font-mono text-red-200 font-semibold">
                    LOOP
                  </span>
                </div>
              )}
            </div>

            <span
              className={`text-[11px] font-mono w-8 text-right shrink-0 ${
                d.isLoop ? "text-red-400 font-semibold" : "text-zinc-500"
              }`}
            >
              {d.count}x
            </span>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-4 mt-4 pt-3 border-t border-zinc-800">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-sm bg-sky-500 opacity-60" />
          <span className="text-[10px] font-mono text-zinc-600">normal</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-sm bg-red-500 opacity-80" />
          <span className="text-[10px] font-mono text-zinc-600">loop ({loopThreshold}+ calls)</span>
        </div>
        <span className="text-[10px] font-mono text-zinc-700 ml-auto">
          {toolCalls.length} total calls · {data.length} unique tools
        </span>
      </div>
    </div>
  );
}
