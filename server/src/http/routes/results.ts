import { Router } from "express";
import { prisma } from "../../lib/prisma.js";
import { requireAuth } from "../../middleware/auth.js";

export const resultsRouter = Router();
resultsRouter.use(requireAuth);

resultsRouter.get("/", async (req, res) => {
  const runId = typeof req.query.runId === "string" ? req.query.runId : undefined;
  const status = typeof req.query.status === "string" ? req.query.status : undefined;
  const rows = await prisma.testResult.findMany({
    where: {
      runId: runId ?? undefined,
      status: status === "pass" || status === "fail" || status === "skip" ? status : undefined,
    },
    orderBy: { createdAt: "desc" },
    take: 500,
    include: {
      run: { include: { job: { include: { project: { include: { program: true } }, suite: true } } } },
      ticketBridgeLogs: true,
    },
  });
  res.json(rows);
});

resultsRouter.get("/:id", async (req, res) => {
  const row = await prisma.testResult.findUnique({
    where: { id: String(req.params["id"]) },
    include: {
      run: { include: { job: { include: { project: { include: { program: true } }, suite: true } } } },
      ticketBridgeLogs: true,
    },
  });
  if (!row) return res.status(404).json({ error: "Not found" });
  res.json(row);
});
