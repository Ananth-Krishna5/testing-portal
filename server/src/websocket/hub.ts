import type { WebSocket } from "ws";
import { verifyToken } from "../auth/jwt.js";
import { log } from "../lib/logger.js";

const clients = new Set<WebSocket>();

export function registerClient(ws: WebSocket, token?: string): void {
  try {
    if (!token) throw new Error("missing token");
    verifyToken(token);
  } catch {
    ws.close(4001, "invalid token");
    return;
  }
  clients.add(ws);
  ws.on("close", () => clients.delete(ws));
}

export function broadcast(event: string, data: unknown): void {
  const msg = JSON.stringify({ event, data });
  for (const ws of clients) {
    if (ws.readyState === 1) {
      try {
        ws.send(msg);
      } catch (e) {
        log.warn("ws send failed", e);
      }
    }
  }
}
