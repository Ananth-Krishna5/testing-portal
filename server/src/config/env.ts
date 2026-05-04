import "dotenv/config";

function req(name: string, fallback?: string): string {
  const v = process.env[name] ?? fallback;
  if (v === undefined || v === "") throw new Error(`Missing env ${name}`);
  return v;
}

export const env = {
  NODE_ENV: process.env.NODE_ENV ?? "development",
  PORT: Number(process.env.PORT ?? 3002),
  DATABASE_URL: req("DATABASE_URL", "postgres://testhub:secret@localhost:5432/testhub"),
  REDIS_URL: req("REDIS_URL", "redis://localhost:6379"),
  JWT_SECRET: req("JWT_SECRET", "dev-secret-change-me"),
  SUPPORT_DESK_URL: process.env.SUPPORT_DESK_URL ?? "http://localhost:3001",
  MINIO_ENDPOINT: process.env.MINIO_ENDPOINT ?? "localhost",
  MINIO_PORT: Number(process.env.MINIO_PORT ?? 9000),
  MINIO_USE_SSL: process.env.MINIO_USE_SSL === "true",
  MINIO_ACCESS_KEY: process.env.MINIO_ACCESS_KEY ?? "minioadmin",
  MINIO_SECRET_KEY: process.env.MINIO_SECRET_KEY ?? "minioadmin",
  MINIO_BUCKET: process.env.MINIO_BUCKET ?? "testhub-artifacts",
  DOCKER_SOCKET_PATH: process.env.DOCKER_SOCKET_PATH ?? "/var/run/docker.sock",
  USE_DOCKER_RUNNERS: process.env.USE_DOCKER_RUNNERS === "true",
  RUNNER_IMAGE_PLAYWRIGHT: process.env.RUNNER_IMAGE_PLAYWRIGHT ?? "testing-portal-v3-playwright-runner",
  RUNNER_IMAGE_CYPRESS: process.env.RUNNER_IMAGE_CYPRESS ?? "testing-portal-v3-cypress-runner",
  RUNNER_IMAGE_PYTHON: process.env.RUNNER_IMAGE_PYTHON ?? "testing-portal-v3-python-runner",
  AI_AGENT_URL: process.env.AI_AGENT_URL ?? "http://localhost:8000",
  PUBLIC_APP_URL: process.env.PUBLIC_APP_URL ?? "http://localhost:5173",
};
