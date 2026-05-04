import express from "express";
import cors from "cors";
import { registerRoutes } from "./registerRoutes.js";

export function createApp(): express.Application {
  const app = express();
  app.use(cors({ origin: true, credentials: true }));
  app.use(express.json({ limit: "2mb" }));
  app.get("/health", (_req, res) => res.json({ ok: true, service: "testhub-server" }));
  registerRoutes(app);
  app.use((err: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    console.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  });
  return app;
}
