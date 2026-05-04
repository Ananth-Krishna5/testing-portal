import { createServer } from "http";
import { WebSocketServer } from "ws";
import { parse as parseUrl } from "url";
import { createApp } from "./http/app.js";
import { env } from "./config/env.js";
import { log } from "./lib/logger.js";
import { registerClient } from "./websocket/hub.js";
import { startTestRunWorker } from "./queues/testRunQueue.js";

const app = createApp();
const server = createServer(app);

const wss = new WebSocketServer({ server, path: "/ws" });
wss.on("connection", (ws, req) => {
  const { query } = parseUrl(req.url ?? "", true);
  const token = typeof query.token === "string" ? query.token : undefined;
  registerClient(ws, token);
});

startTestRunWorker();

server.listen(env.PORT, () => {
  log.info(`Test Hub API listening on :${env.PORT}`);
});
