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

let connection: InstanceType<typeof Redis> | null = null;
let testRunQueue: Queue | null = null;

function getRedis(): InstanceType<typeof Redis> | null {
  if (!env.ENABLE_TEST_RUN_QUEUE) return null;
  if (!connection) {
    connection = new Redis(env.REDIS_URL, { maxRetriesPerRequest: null });
  }
  return connection;
}

function getQueue(): Queue | null {
  const conn = getRedis();
  if (!conn) return null;
  if (!testRunQueue) {
    testRunQueue = new Queue(QUEUE_NAME, { connection: conn });
  }
  return testRunQueue;
}

export type TestRunJobData = { runId?: string; scheduledJobId?: string };

export function startTestRunWorker(): Worker | null {
  const conn = getRedis();
  if (!conn) {
    log.info("Test run queue disabled — set ENABLE_TEST_RUN_QUEUE=true and REDIS_URL for BullMQ workers.");
    return null;
  }
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
    { connection: conn }
  );
  worker.on("failed", (job, err) => {
    log.error("Job failed", job?.id, err);
  });
  return worker;
}

export async function enqueueTestRun(runId: string): Promise<void> {
  const q = getQueue();
  if (!q) {
    log.warn("Queue disabled — executing test run in-process", { runId });
    await processTestRun(runId);
    return;
  }
  await q.add(
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
  const q = getQueue();
  if (!q) {
    log.warn("registerJobScheduler skipped (queue disabled)", { scheduledJobId });
    return;
  }
  await q.upsertJobScheduler(
    `sched-${scheduledJobId}`,
    { pattern: cronPattern },
    {
      name: "scheduled-tick",
      data: { scheduledJobId },
      opts: { attempts: 2 },
    }
  );
}
