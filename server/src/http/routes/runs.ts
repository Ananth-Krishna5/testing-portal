import { Router } from "express";
import { prisma } from "../../lib/prisma.js";
import { requireAuth } from "../../middleware/auth.js";

export const runsRouter = Router();
runsRouter.use(requireAuth);

runsRouter.get("/", async (req, res) => {
  const jobId = typeof req.query.jobId === "string" ? req.query.jobId : undefined;
  const status = typeof req.query.status === "string" ? req.query.status : undefined;
  const runStatuses = ["queued", "running", "passed", "failed", "cancelled", "error"] as const;
  const statusFilter =
    status && (runStatuses as readonly string[]).includes(status)
      ? (status as (typeof runStatuses)[number])
      : undefined;
  const rows = await prisma.testRun.findMany({
    where: {
      jobId: jobId ?? undefined,
      status: statusFilter,
    },
    orderBy: { createdAt: "desc" },
    take: 200,
    include: { job: { include: { suite: true, project: true } }, testResults: true },
  });
  res.json(rows);
});

runsRouter.get("/:id", async (req, res) => {
  const row = await prisma.testRun.findUnique({
    where: { id: String(req.params["id"]) },
    include: { job: { include: { suite: true, project: { include: { program: true } } } }, testResults: true },
  });
  if (!row) return res.status(404).json({ error: "Not found" });
  res.json(row);
});
