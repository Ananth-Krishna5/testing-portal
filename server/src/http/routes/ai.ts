import { Router } from "express";
import { z } from "zod";
import { requireAuth } from "../../middleware/auth.js";
import { env } from "../../config/env.js";
import { log } from "../../lib/logger.js";

export const aiRouter = Router();
aiRouter.use(requireAuth);

const chatSchema = z.object({
  message: z.string().min(1),
  context: z.record(z.string(), z.unknown()).optional(),
});

aiRouter.post("/chat", async (req, res) => {
  const parsed = chatSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  try {
    const r = await fetch(`${env.AI_AGENT_URL.replace(/\/$/, "")}/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message: parsed.data.message,
        context: parsed.data.context ?? {},
      }),
    });
    if (!r.ok) {
      const t = await r.text();
      log.warn("AI agent error", r.status, t);
      return res.status(502).json({ error: "AI agent unavailable", detail: t });
    }
    const data = (await r.json()) as { reply: string };
    res.json(data);
  } catch (e) {
    log.error("AI proxy failed", e);
    res.status(502).json({ error: "AI agent unreachable" });
  }
});
