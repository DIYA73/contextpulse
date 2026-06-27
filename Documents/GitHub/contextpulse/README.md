# contextpulse

**Real-time Next.js dashboard for [contextpulse-mcp](https://github.com/DIYA73/contextpulse-mcp).**

Watch your AI agent's context budget live — token usage bar, tool call waterfall, loop detection alerts, and full run history. No page refresh required.

---

## Features

- 📊 **Live budget bar** — updates in real time via WebSocket as tokens are consumed
- 🌊 **Tool call waterfall** — see every tool call the agent made, with token cost per call
- 🔁 **Loop detection indicator** — highlighted when the MCP server detects a repeated tool pattern
- ⚠️ **Alert feed** — warning (70%) and critical (90%) threshold events, streamed instantly
- 📋 **Run history table** — browse past agent runs, filter by session
- 🔄 **Run diff view** — compare two runs side by side to see what changed

---

## Stack

- **Next.js 14** (App Router)
- **TypeScript**
- **Tailwind CSS**
- **WebSocket** (native browser API, no extra library)
- **PostgreSQL** (reads from the same DB as the MCP server)

---

## Prerequisites

The MCP server must be running first:

```bash
git clone https://github.com/DIYA73/contextpulse-mcp
cd contextpulse-mcp
npm install && npm run build && npm start
```

---

## Getting started

```bash
git clone https://github.com/DIYA73/contextpulse
cd contextpulse
npm install
cp .env.local.example .env.local
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Environment variables

| Variable | Default | Description |
|---|---|---|
| `DATABASE_URL` | — | PostgreSQL connection (same DB as MCP server) |
| `NEXT_PUBLIC_WS_URL` | `ws://localhost:3001` | WebSocket endpoint exposed by MCP server |

---

## Dashboard views

| Route | Description |
|---|---|
| `/` | Active run — live budget bar + tool call waterfall |
| `/runs` | Run history table for the current session |
| `/runs/[id]` | Single run detail — full tool call list + budget timeline |
| `/diff/[a]/[b]` | Side-by-side comparison of two runs |

---

## How the real-time flow works
contextpulse-mcp (MCP server)

↓  emits budget + alert events over WebSocket

contextpulse (this dashboard)

↓  browser connects on mount, receives events

↓  React state updates → UI re-renders instantly
No polling. The MCP server pushes every token count update and alert to all connected dashboard clients.

---

## Related

- [contextpulse-mcp](https://github.com/DIYA73/contextpulse-mcp) — The MCP server this dashboard connects to

---

## License

MIT
