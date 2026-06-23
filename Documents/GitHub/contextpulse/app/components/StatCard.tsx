interface StatCardProps { label: string; value: string | number; sub?: string; accent?: 'teal' | 'amber' | 'red' | 'zinc'; }
const accents = { teal: 'text-emerald-400', amber: 'text-amber-400', red: 'text-red-400', zinc: 'text-zinc-300' };
export function StatCard({ label, value, sub, accent = 'zinc' }: StatCardProps) {
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
      <p className="text-[11px] font-mono text-zinc-500 uppercase tracking-widest mb-1">{label}</p>
      <p className={`text-2xl font-mono font-semibold ${accents[accent]}`}>{value}</p>
      {sub && <p className="text-[11px] font-mono text-zinc-600 mt-0.5">{sub}</p>}
    </div>
  );
}
