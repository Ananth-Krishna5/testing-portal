import { Router } from "express";
import { z } from "zod";
import type { Prisma } from "@prisma/client";
import { prisma } from "../../lib/prisma.js";
import { requireAuth, requireRole } from "../../middleware/auth.js";
import { enqueueTestRun, registerJobScheduler } from "../../queues/testRunQueue.js";
import { resolveRunnerType } from "../../services/dockerOrchestrator.js";
import { log } from "../../lib/logger.js";

export const jobsRouter = Router();
jobsRouter.use(requireAuth);

jobsRouter.get("/", async (req, res) => {
  const projectId = typeof req.query.projectId === "string" ? req.query.projectId : undefined;
  const rows = await prisma.scheduledJob.findMany({
    where: projectId ? { projectId } : undefined,
    orderBy: { updatedAt: "desc" },
    include: { suite: true, project: true },
  });
  res.json(rows);
});

const jobBody = z.object({
  projectId: z.string().min(1),
  suiteId: z.string().min(1),
  fromDate: z.string(),
  toDate: z.string(),
  time: z.string().min(1),
  recurrence: z.string().min(1),
  status: z.enum(["active", "paused", "completed"]).optional(),
});

jobsRouter.post("/", requireRole("admin", "tester"), async (req, res) => {
  const parsed = jobBody.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  const d = parsed.data;
  const row = await prisma.scheduledJob.create({
    data: {
      projectId: d.projectId,
      suiteId: d.suiteId,
      fromDate: new Date(d.fromDate),
      toDate: new Date(d.toDate),
      time: d.time,
      recurrence: d.recurrence,
      status: d.status,
    },
  });
  const cron = parseCron(d.recurrence);
  if (cron) {
    try {
      await registerJobScheduler(row.id, cron);
    } catch (e) {
      log.warn("Could not register cron scheduler", e);
    }
  }
  res.status(201).json(row);
});

function parseCron(recurrence: string): string | null {
  const t = recurrence.trim();
  if (t.startsWith("cron:")) return t.slice(5).trim();
  const parts = t.split(/\s+/);
  if (parts.length >= 5 && parts.every((p) => p.length > 0)) return t;
  return null;
}

jobsRouter.patch("/:id", requireRole("admin", "tester"), async (req, res) => {
  const parsed = jobBody.partial().safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  const d = parsed.data;
  const data: Prisma.ScheduledJobUpdateInput = {};
  if (d.projectId !== undefined) data.project = { connect: { id: d.projectId } };
  if (d.suiteId !== undefined) data.suite = { connect: { id: d.suiteId } };
  if (d.fromDate !== undefined) data.fromDate = new Date(d.fromDate);
  if (d.toDate !== undefined) data.toDate = new Date(d.toDate);
  if (d.time !== undefined) data.time = d.time;
  if (d.recurrence !== undefined) data.recurrence = d.recurrence;
  if (d.status !== undefined) data.status = d.status;
  try {
    const row = await prisma.scheduledJob.update({ where: { id: String(req.params["id"]) }, data });
    if (parsed.data.recurrence) {
      const cron = parseCron(parsed.data.recurrence);
      if (cron) {
        try {
          await registerJobScheduler(row.id, cron);
        } catch (e) {
          log.warn("Cron reschedule failed", e);
        }
      }
    }
    res.json(row);
  } catch {
    res.status(404).json({ error: "Not found" });
  }
});

jobsRouter.delete("/:id", requireRole("admin", "tester"), async (req, res) => {
  try {
    await prisma.scheduledJob.delete({ where: { id: String(req.params["id"]) } });
    res.status(204).send();
  } catch {
    res.status(404).json({ error: "Not found" });
  }
});

jobsRouter.post("/:id/trigger", requireRole("admin", "tester"), async (req, res) => {
  const job = await prisma.scheduledJob.findUnique({
    where: { id: String(req.params["id"]) },
    include: { suite: true },
  });
  if (!job) return res.status(404).json({ error: "Not found" });
  const run = await prisma.testRun.create({
    data: {
      jobId: job.id,
      status: "queued",
      runnerType: resolveRunnerType(job.suite.tools),
    },
  });
  await enqueueTestRun(run.id);
  res.status(202).json(run);
});
