import { Router } from "express";
import { prisma } from "../../lib/prisma.js";
import { requireAuth } from "../../middleware/auth.js";

export const dashboardRouter = Router();
dashboardRouter.use(requireAuth);

dashboardRouter.get("/kpis", async (_req, res) => {
  const [
    programs,
    projects,
    users,
    suites,
    runs,
    results,
    failedResults,
    bridgeLogs,
  ] = await Promise.all([
    prisma.program.count(),
    prisma.project.count(),
    prisma.user.count(),
    prisma.testSuite.count(),
    prisma.testRun.count(),
    prisma.testResult.count(),
    prisma.testResult.count({ where: { status: "fail" } }),
    prisma.ticketBridgeLog.count(),
  ]);

  const recentRuns = await prisma.testRun.findMany({
    orderBy: { createdAt: "desc" },
    take: 14,
    select: { id: true, status: true, createdAt: true },
  });

  const passCount = await prisma.testResult.count({ where: { status: "pass" } });
  const failCount = failedResults;
  const skipCount = await prisma.testResult.count({ where: { status: "skip" } });

  res.json({
    overview: { programs, projects, users, suites },
    runs: { total: runs, recent: recentRuns },
    results: {
      total: results,
      pass: passCount,
      fail: failCount,
      skip: skipCount,
    },
    integration: { ticketsBridged: bridgeLogs },
  });
});
