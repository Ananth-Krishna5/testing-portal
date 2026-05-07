import { Router } from "express";
import { Prisma } from "@prisma/client";
import { z } from "zod";
import { prisma } from "../../lib/prisma.js";
import { requireAuth, requireRole } from "../../middleware/auth.js";

export const projectsRouter = Router();
projectsRouter.use(requireAuth);

projectsRouter.get("/", async (req, res) => {
  const programId = typeof req.query.programId === "string" ? req.query.programId : undefined;
  const rows = await prisma.project.findMany({
    where: programId ? { programId } : undefined,
    orderBy: { updatedAt: "desc" },
    include: { program: true, scheduledJobs: { include: { suite: true } } },
  });
  res.json(rows);
});

projectsRouter.get("/:id", async (req, res) => {
  const row = await prisma.project.findUnique({
    where: { id: String(req.params["id"]) },
    include: { program: true, scheduledJobs: { include: { suite: true } } },
  });
  if (!row) return res.status(404).json({ error: "Not found" });
  res.json(row);
});

const projectBody = z.object({
  programId: z.string().min(1),
  name: z.string().min(1),
  description: z.string().optional(),
  targetProduct: z.enum(["Sia", "Olympus", "Horus", "Valhalla"]),
  environment: z.enum(["Staging", "Dev", "Production", "UAT"]),
  status: z.enum(["draft", "active", "paused", "completed"]).optional(),
  autoCreateTickets: z.boolean().optional(),
});

projectsRouter.post("/", requireRole("admin", "tester"), async (req, res) => {
  const parsed = projectBody.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  try {
    const row = await prisma.project.create({ data: parsed.data });
    res.status(201).json(row);
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return res.status(409).json({ error: "Project name already exists" });
    }
    throw error;
  }
});

projectsRouter.patch("/:id", requireRole("admin", "tester"), async (req, res) => {
  const parsed = projectBody.partial().safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  try {
    const row = await prisma.project.update({ where: { id: String(req.params["id"]) }, data: parsed.data });
    res.json(row);
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return res.status(409).json({ error: "Project name already exists" });
    }
    res.status(404).json({ error: "Not found" });
  }
});

projectsRouter.delete("/:id", requireRole("admin"), async (req, res) => {
  try {
    await prisma.project.delete({ where: { id: String(req.params["id"]) } });
    res.status(204).send();
  } catch {
    res.status(404).json({ error: "Not found" });
  }
});
