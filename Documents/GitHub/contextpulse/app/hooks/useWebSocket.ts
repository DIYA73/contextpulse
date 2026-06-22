"use client";
import { useEffect, useRef, useState, useCallback } from "react";
import { io, Socket } from "socket.io-client";
export type BudgetStatus = "ok" | "warning" | "critical" | "overflow";
export interface Budget { used: number; limit: number; percentUsed: number; }
export interface ToolCallEvent { toolCallId: string; runId: string; toolName: string; inputTokens: number; outputTokens: number; totalTokens: number; durationMs: number | null; startedAt: string; completedAt: string | null; budget: Budget; budgetStatus: string; }
export interface BudgetEvent { runId: string; budget: Budget; }
export interface LoopEvent { runId: string; toolName: string; count: number; }
export interface RunEvent { runId: string; sessionId?: string; label?: string | null; }
export type WsMessage = | { event: "tool_call_end"; data: ToolCallEvent } | { event: "budget_warning"; data: BudgetEvent } | { event: "budget_critical"; data: BudgetEvent } | { event: "loop_detected"; data: LoopEvent } | { event: "run_started"; data: RunEvent } | { event: "run_ended"; data: RunEvent } | { event: "connected"; data: { timestamp: string } };
export interface WsState { connected: boolean; messages: WsMessage[]; lastToolCall: ToolCallEvent | null; activeBudgets: Map<string, Budget>; alerts: Array<{ type: string; runId: string; message: string; at: Date }>; }
const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000";
export function useWebSocket() {
  const socketRef = useRef<Socket | null>(null);
  const [state, setState] = useState<WsState>({ connected: false, messages: [], lastToolCall: null, activeBudgets: new Map(), alerts: [] });
  const addAlert = useCallback((type: string, runId: string, message: string) => {
    setState((prev) => ({ ...prev, alerts: [{ type, runId, message, at: new Date() }, ...prev.alerts.slice(0, 49)] }));
  }, []);
  useEffect(() => {
    const socket = io(`${API_URL}/events`, { transports: ["websocket"], reconnectionAttempts: 10, reconnectionDelay: 1000 });
    socketRef.current = socket;
    socket.on("connect", () => setState((prev) => ({ ...prev, connected: true })));
    socket.on("disconnect", () => setState((prev) => ({ ...prev, connected: false })));
    socket.on("tool_call_end", (data: ToolCallEvent) => {
      setState((prev) => { const b = new Map(prev.activeBudgets); b.set(data.runId, data.budget); return { ...prev, lastToolCall: data, activeBudgets: b, messages: [{ event: "tool_call_end", data }, ...prev.messages.slice(0, 99)] }; });
    });
    socket.on("budget_warning", (data: BudgetEvent) => { setState((prev) => { const b = new Map(prev.activeBudgets); b.set(data.runId, data.budget); return { ...prev, activeBudgets: b }; }); addAlert("warning", data.runId, `Budget at ${data.budget.percentUsed.toFixed(1)}% — ${data.budget.used.toLocaleString()} tokens used`); });
    socket.on("budget_critical", (data: BudgetEvent) => { setState((prev) => { const b = new Map(prev.activeBudgets); b.set(data.runId, data.budget); return { ...prev, activeBudgets: b }; }); addAlert("critical", data.runId, `Budget critical — ${data.budget.percentUsed.toFixed(1)}% used`); });
    socket.on("loop_detected", (data: LoopEvent) => { addAlert("loop", data.runId, `Loop: "${data.toolName}" called ${data.count}x in a row`); });
    socket.on("run_started", (data: RunEvent) => setState((prev) => ({ ...prev, messages: [{ event: "run_started", data }, ...prev.messages.slice(0, 99)] })));
    socket.on("run_ended", (data: RunEvent) => { setState((prev) => { const b = new Map(prev.activeBudgets); b.delete(data.runId); return { ...prev, activeBudgets: b, messages: [{ event: "run_ended", data }, ...prev.messages.slice(0, 99)] }; }); });
    return () => { socket.disconnect(); };
  }, [addAlert]);
  const clearAlerts = useCallback(() => setState((prev) => ({ ...prev, alerts: [] })), []);
  return { ...state, clearAlerts };
}
