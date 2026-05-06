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
const MAX_PORT_RETRIES = 20;

const wss = new WebSocketServer({ server, path: "/ws" });
wss.on("error", (err: NodeJS.ErrnoException) => {
  // WebSocketServer re-emits HTTP server listen errors; handle to avoid process crash during fallback retries.
  if (err.code !== "EADDRINUSE") {
    log.error("WebSocket server error", err);
  }
});
wss.on("connection", (ws, req) => {
  const { query } = parseUrl(req.url ?? "", true);
  const token = typeof query.token === "string" ? query.token : undefined;
  registerClient(ws, token);
});

startTestRunWorker();

function listenWithFallback(port: number, retriesLeft = MAX_PORT_RETRIES): void {
  const onError = (err: NodeJS.ErrnoException) => {
    server.off("listening", onListening);
    if (err.code === "EADDRINUSE" && retriesLeft > 0) {
      const nextPort = port + 1;
      log.warn(`Port ${port} is in use. Retrying on ${nextPort}...`);
      listenWithFallback(nextPort, retriesLeft - 1);
      return;
    }

    throw err;
  };

  const onListening = () => {
    server.off("error", onError);
    const address = server.address();
    const activePort = typeof address === "object" && address ? address.port : port;
    log.info(`Test Hub API listening on :${activePort}`);
  };

  server.once("error", onError);
  server.once("listening", onListening);
  server.listen(port);
}

listenWithFallback(env.PORT);
