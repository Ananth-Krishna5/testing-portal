import { Router } from "express";
import { z } from "zod";
import { prisma } from "../../lib/prisma.js";
import { requireAuth, requireRole } from "../../middleware/auth.js";
import { supportDeskHealth } from "../../services/integrationBridge.js";

export const integrationsRouter = Router();
integrationsRouter.use(requireAuth);

integrationsRouter.get("/settings", requireRole("admin", "tester"), async (_req, res) => {
  const row = await prisma.integrationSetting.findFirst({ orderBy: { updatedAt: "desc" } });
  res.json(row ?? {});
});

const settingsSchema = z.object({
  supportDeskUrl: z.string().min(1).optional().nullable(),
  autoTicketGlobal: z.boolean().optional(),
});

integrationsRouter.patch("/settings", requireRole("admin"), async (req, res) => {
  const parsed = settingsSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  const existing = await prisma.integrationSetting.findFirst({ orderBy: { updatedAt: "desc" } });
  if (!existing) {
    const row = await prisma.integrationSetting.create({
      data: {
        id: crypto.randomUUID(),
        supportDeskUrl: parsed.data.supportDeskUrl ?? undefined,
        autoTicketGlobal: parsed.data.autoTicketGlobal ?? true,
      },
    });
    return res.json(row);
  }
  const row = await prisma.integrationSetting.update({
    where: { id: existing.id },
    data: {
      supportDeskUrl: parsed.data.supportDeskUrl ?? undefined,
      autoTicketGlobal: parsed.data.autoTicketGlobal,
    },
  });
  res.json(row);
});

integrationsRouter.post("/health", requireRole("admin", "tester"), async (_req, res) => {
  const ok = await supportDeskHealth();
  const row = await prisma.integrationSetting.findFirst({ orderBy: { updatedAt: "desc" } });
  if (row) {
    await prisma.integrationSetting.update({
      where: { id: row.id },
      data: { lastHealthCheckAt: new Date(), lastHealthCheckOk: ok },
    });
  }
  res.json({ ok, checkedAt: new Date().toISOString() });
});

integrationsRouter.get("/bridge-log", requireRole("admin", "tester"), async (_req, res) => {
  const rows = await prisma.ticketBridgeLog.findMany({
    orderBy: { createdAt: "desc" },
    take: 200,
    include: { result: { include: { run: true } } },
  });
  res.json(rows);
});
