import { prisma } from "../lib/prisma.js";
import { log } from "../lib/logger.js";
import { broadcast } from "../websocket/hub.js";
import { runTestContainer, resolveRunnerType } from "../services/dockerOrchestrator.js";
import { parseGenericResults, parsePlaywrightJsonReport } from "../services/resultsAggregator.js";
import { processFailedTestResult } from "../services/integrationBridge.js";
import { putTextArtifact, presignGetUrl } from "../services/storageService.js";

function normalizeCases(logs: string, exitCode: number): ReturnType<typeof parseGenericResults> {
  try {
    const parsed = JSON.parse(logs) as unknown;
    if (parsed && typeof parsed === "object" && Array.isArray((parsed as { tests?: unknown }).tests)) {
      return parseGenericResults(parsed);
    }
    const pw = parsePlaywrightJsonReport(parsed);
    if (pw.length) return pw;
  } catch {
    /* fall through */
  }
  if (exitCode === 0) {
    return [{ testName: "aggregate", status: "pass", durationMs: null, errorMsg: null }];
  }
  return [
    {
      testName: "aggregate",
      status: "fail",
      durationMs: null,
      errorMsg: logs.slice(0, 4000) || "Runner exited with errors",
    },
  ];
}

export async function processTestRun(runId: string): Promise<void> {
  try {
    await executeTestRun(runId);
  } catch (e) {
    log.error("processTestRun failed", e);
    await prisma.testRun
      .update({
        where: { id: runId },
        data: { status: "error", completedAt: new Date() },
      })
      .catch(() => undefined);
    broadcast("run:updated", { runId, status: "error" });
    throw e;
  }
}

async function executeTestRun(runId: string): Promise<void> {
  const run = await prisma.testRun.findUnique({
    where: { id: runId },
    include: { job: { include: { suite: true, project: { include: { program: true } } } } },
  });
  if (!run) {
    log.warn("Run not found", runId);
    return;
  }

  await prisma.testRun.update({
    where: { id: runId },
    data: { status: "running", startedAt: new Date() },
  });
  broadcast("run:updated", { runId, status: "running" });

  const kind = resolveRunnerType(run.job.suite.tools);
  const { exitCode, logs, usedDocker } = await runTestContainer(kind, runId);

  let logUrl: string | null = null;
  try {
    const key = `runs/${runId}/runner.log`;
    await putTextArtifact(key, logs, "text/plain; charset=utf-8");
    logUrl = await presignGetUrl(key, 86400);
  } catch (e) {
    log.warn("Artifact upload skipped", e);
  }

  const cases = normalizeCases(logs, exitCode);
  const created: { id: string; status: string }[] = [];
  for (const c of cases) {
    const row = await prisma.testResult.create({
      data: {
        runId,
        testName: c.testName,
        status: c.status,
        durationMs: c.durationMs,
        errorMsg: c.errorMsg,
        logUrl,
        screenshotUrl: null,
      },
    });
    created.push({ id: row.id, status: row.status });
    if (row.status === "fail") {
      try {
        await processFailedTestResult(row.id);
      } catch (e) {
        log.error("Bridge error (queued for retry if configured)", e);
      }
    }
  }

  const anyFail = created.some((c) => c.status === "fail");
  const finalStatus = anyFail ? "failed" : exitCode === 0 ? "passed" : "failed";

  await prisma.testRun.update({
    where: { id: runId },
    data: {
      status: finalStatus,
      completedAt: new Date(),
      containerId: usedDocker ? "docker" : null,
    },
  });
  broadcast("run:updated", { runId, status: finalStatus });
}

