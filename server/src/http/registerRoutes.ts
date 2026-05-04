import type { Express } from "express";
import { authRouter } from "./routes/auth.js";
import { programsRouter } from "./routes/programs.js";
import { projectsRouter } from "./routes/projects.js";
import { suitesRouter } from "./routes/suites.js";
import { jobsRouter } from "./routes/jobs.js";
import { runsRouter } from "./routes/runs.js";
import { resultsRouter } from "./routes/results.js";
import { usersRouter } from "./routes/users.js";
import { dashboardRouter } from "./routes/dashboard.js";
import { integrationsRouter } from "./routes/integrations.js";
import { aiRouter } from "./routes/ai.js";
import { searchRouter } from "./routes/search.js";

export function registerRoutes(app: Express): void {
  app.use("/api/auth", authRouter);
  app.use("/api/programs", programsRouter);
  app.use("/api/projects", projectsRouter);
  app.use("/api/test-suites", suitesRouter);
  app.use("/api/scheduled-jobs", jobsRouter);
  app.use("/api/test-runs", runsRouter);
  app.use("/api/test-results", resultsRouter);
  app.use("/api/users", usersRouter);
  app.use("/api/dashboard", dashboardRouter);
  app.use("/api/integrations", integrationsRouter);
  app.use("/api/ai", aiRouter);
  app.use("/api/search", searchRouter);
}
