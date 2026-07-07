/**
 * Single source of truth for turning a budget percentage into a color/label.
 *
 * Defaults (70/90) match the backend's generic fallback, but the backend now
 * calibrates thresholds per model (e.g. tighter 60/85 for Claude — see
 * contextpulse-mcp's README, "Accuracy & limitations"). Always pass the real
 * thresholds from the API/WS payload when you have them so the dashboard
 * doesn't silently disagree with the server that's firing the alerts.
 */
export function getBudgetColor(percentUsed: number, warningPct = 70, criticalPct = 90): string {
  if (percentUsed >= criticalPct) return "bg-red-500";
  if (percentUsed >= warningPct) return "bg-amber-400";
  return "bg-emerald-500";
}

export function getBudgetStatusLabel(
  percentUsed: number,
  warningPct = 70,
  criticalPct = 90
): { text: string; color: string } {
  if (percentUsed >= 100) return { text: "OVERFLOW", color: "text-red-400" };
  if (percentUsed >= criticalPct) return { text: "CRITICAL", color: "text-red-400" };
  if (percentUsed >= warningPct) return { text: "WARNING", color: "text-amber-400" };
  return { text: "OK", color: "text-emerald-400" };
}
