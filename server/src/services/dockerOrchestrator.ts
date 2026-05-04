import Docker from "dockerode";
import { env } from "../config/env.js";
import { log } from "../lib/logger.js";
import fs from "fs";

export type RunnerKind = "playwright" | "cypress" | "python";

function imageFor(kind: RunnerKind): string {
  if (kind === "playwright") return env.RUNNER_IMAGE_PLAYWRIGHT;
  if (kind === "cypress") return env.RUNNER_IMAGE_CYPRESS;
  return env.RUNNER_IMAGE_PYTHON;
}

function detectKindFromTools(tools: string | null): RunnerKind {
  const t = (tools ?? "").toLowerCase();
  if (t.includes("cypress")) return "cypress";
  if (t.includes("python") || t.includes("pytest")) return "python";
  return "playwright";
}

export function resolveRunnerType(tools: string | null): RunnerKind {
  return detectKindFromTools(tools);
}

function dockerAvailable(): boolean {
  try {
    return fs.existsSync(env.DOCKER_SOCKET_PATH);
  } catch {
    return false;
  }
}

export interface DockerRunResult {
  exitCode: number;
  logs: string;
  usedDocker: boolean;
}

export async function runTestContainer(kind: RunnerKind, runId: string): Promise<DockerRunResult> {
  if (!env.USE_DOCKER_RUNNERS || !dockerAvailable()) {
    log.warn("Docker runners disabled or socket missing; using local simulation", { kind, runId });
    return simulateRunner(kind, runId);
  }
  const docker = new Docker({ socketPath: env.DOCKER_SOCKET_PATH });
  const image = imageFor(kind);
  try {
    const container = await docker.createContainer({
      Image: image,
      Env: [`RUN_ID=${runId}`, `SIMULATE_FAILURE=true`],
      HostConfig: {
        AutoRemove: true,
      },
    });
    await container.start();
    const wait = await container.wait();
    const logs = await container.logs({ stdout: true, stderr: true, tail: 5000 });
    const exitCode = wait.StatusCode ?? 1;
    return { exitCode, logs: logs.toString("utf8"), usedDocker: true };
  } catch (e) {
    log.error("Docker run failed; falling back to simulation", e);
    return simulateRunner(kind, runId);
  }
}

function simulateRunner(kind: RunnerKind, runId: string): DockerRunResult {
  const failOne = process.env.SIMULATE_FAILURE !== "false";
  const tests = [
    { name: `${kind}: health check`, status: "passed", durationMs: 120 },
    { name: `${kind}: core flow`, status: failOne ? "failed" : "passed", durationMs: 4200, error: failOne ? "TimeoutError: locator.click exceeded" : undefined },
    { name: `${kind}: teardown`, status: "passed", durationMs: 40 },
  ];
  const body = JSON.stringify({ runId, tests }, null, 2);
  return { exitCode: failOne ? 1 : 0, logs: body, usedDocker: false };
}
