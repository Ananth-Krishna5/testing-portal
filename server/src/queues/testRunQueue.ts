import { createRequire } from "node:module";
import { Queue, Worker } from "bullmq";
import { env } from "../config/env.js";
import { processTestRun } from "../workers/runProcessor.js";
import { log } from "../lib/logger.js";
import { prisma } from "../lib/prisma.js";
import { resolveRunnerType } from "../services/dockerOrchestrator.js";

export const QUEUE_NAME = "testhub-test-runs";

const require = createRequire(import.meta.url);
// ioredis CJS default export — constructable at runtime; TS types disagree under NodeNext.
const Redis = require("ioredis") as new (url: string, opts?: { maxRetriesPerRequest?: number | null }) => import("ioredis").default;
const connection = new Redis(env.REDIS_URL, { maxRetriesPerRequest: null });

export const testRunQueue = new Queue(QUEUE_NAME, { connection });

export type TestRunJobData = { runId?: string; scheduledJobId?: string };

export function startTestRunWorker(): Worker {
  const worker = new Worker<TestRunJobData>(
    QUEUE_NAME,
    async (job) => {
      if (job.data.runId) {
        await processTestRun(job.data.runId);
        return { runId: job.data.runId };
      }
      if (job.data.scheduledJobId) {
        const sj = await prisma.scheduledJob.findUnique({
          where: { id: job.data.scheduledJobId },
          include: { suite: true },
        });
        if (!sj || sj.status !== "active") return { skipped: true };
        const run = await prisma.testRun.create({
          data: {
            jobId: sj.id,
            status: "queued",
            runnerType: resolveRunnerType(sj.suite.tools),
          },
        });
        await processTestRun(run.id);
        return { runId: run.id };
      }
      throw new Error("Invalid job payload");
    },
    { connection }
  );
  worker.on("failed", (job, err) => {
    log.error("Job failed", job?.id, err);
  });
  return worker;
}

export async function enqueueTestRun(runId: string): Promise<void> {
  await testRunQueue.add(
    "execute",
    { runId },
    {
      attempts: 3,
      backoff: { type: "exponential", delay: 5000 },
      removeOnComplete: 100,
      removeOnFail: 50,
    }
  );
}

/** Register BullMQ repeatable scheduler when recurrence is a cron pattern (e.g. <code>0 9 * * *</code>). */
export async function registerJobScheduler(scheduledJobId: string, cronPattern: string): Promise<void> {
  await testRunQueue.upsertJobScheduler(
    `sched-${scheduledJobId}`,
    { pattern: cronPattern },
    {
      name: "scheduled-tick",
      data: { scheduledJobId },
      opts: { attempts: 2 },
    }
  );
}
