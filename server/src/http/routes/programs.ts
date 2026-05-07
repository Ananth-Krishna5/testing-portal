import { Router } from "express";
import { Prisma } from "@prisma/client";
import { z } from "zod";
import { prisma } from "../../lib/prisma.js";
import { requireAuth, requireRole } from "../../middleware/auth.js";

export const programsRouter = Router();
programsRouter.use(requireAuth);

programsRouter.get("/", async (_req, res) => {
  const rows = await prisma.program.findMany({
    orderBy: { updatedAt: "desc" },
    include: { roadmap: true, _count: { select: { projects: true } } },
  });
  res.json(rows);
});

programsRouter.get("/:id", async (req, res) => {
  const row = await prisma.program.findUnique({
    where: { id: String(req.params["id"]) },
    include: { roadmap: true, projects: true },
  });
  if (!row) return res.status(404).json({ error: "Not found" });
  res.json(row);
});

const programBody = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  manager: z.string().optional(),
  budget: z.number().optional(),
  certAgency: z.string().optional(),
  startDate: z.string().optional(),
  targetEndDate: z.string().optional(),
  roadmapId: z.string().optional().nullable(),
  status: z.enum(["draft", "active", "completed", "archived"]).optional(),
});

programsRouter.post("/", requireRole("admin", "tester"), async (req, res) => {
  const parsed = programBody.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  const d = parsed.data;
  try {
    const row = await prisma.program.create({
      data: {
        name: d.name,
        description: d.description,
        manager: d.manager,
        budget: d.budget,
        certAgency: d.certAgency,
        startDate: d.startDate ? new Date(d.startDate) : undefined,
        targetEndDate: d.targetEndDate ? new Date(d.targetEndDate) : undefined,
        roadmapId: d.roadmapId ?? undefined,
        status: d.status,
      },
    });
    res.status(201).json(row);
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return res.status(409).json({ error: "Program name already exists" });
    }
    throw error;
  }
});

programsRouter.patch("/:id", requireRole("admin", "tester"), async (req, res) => {
  const parsed = programBody.partial().safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  const d = parsed.data;
  try {
    const row = await prisma.program.update({
      where: { id: String(req.params["id"]) },
      data: {
        ...d,
        startDate: d.startDate ? new Date(d.startDate) : undefined,
        targetEndDate: d.targetEndDate ? new Date(d.targetEndDate) : undefined,
      },
    });
    res.json(row);
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return res.status(409).json({ error: "Program name already exists" });
    }
    res.status(404).json({ error: "Not found" });
  }
});

programsRouter.delete("/:id", requireRole("admin"), async (req, res) => {
  try {
    await prisma.program.delete({ where: { id: String(req.params["id"]) } });
    res.status(204).send();
  } catch {
    res.status(404).json({ error: "Not found" });
  }
});

const roadmapBody = z.object({
  programId: z.string().optional().nullable(),
  templateId: z.string().optional().nullable(),
  name: z.string().min(1),
  canvasJson: z.unknown().optional(),
  isCustom: z.boolean().optional(),
});

programsRouter.post("/:id/roadmap", requireRole("admin", "tester"), async (req, res) => {
  const parsed = roadmapBody.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  const programId = String(req.params["id"]);
  const r = await prisma.roadmap.create({
    data: {
      programId: parsed.data.programId ?? programId,
      templateId: parsed.data.templateId ?? undefined,
      name: parsed.data.name,
      canvasJson: (parsed.data.canvasJson ?? {}) as object,
      isCustom: parsed.data.isCustom ?? false,
    },
  });
  await prisma.program.update({ where: { id: programId }, data: { roadmapId: r.id } });
  res.status(201).json(r);
});
