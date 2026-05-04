import { Router } from "express";
import { z } from "zod";
import { prisma } from "../../lib/prisma.js";
import { requireAuth, requireRole } from "../../middleware/auth.js";
import { Prisma, type SuiteSeverity } from "@prisma/client";

export const suitesRouter = Router();
suitesRouter.use(requireAuth);

const categories = [
  "Foundational",
  "AI",
  "Voice",
  "E2E",
  "Performance",
  "Security",
  "UX",
  "CI/CD",
] as const;

suitesRouter.get("/", async (req, res) => {
  const q = typeof req.query.q === "string" ? req.query.q.trim() : "";
  const category = typeof req.query.category === "string" ? req.query.category : undefined;
  const rows = await prisma.testSuite.findMany({
    where: {
      AND: [
        category ? { category } : {},
        q
          ? {
              OR: [
                { name: { contains: q, mode: "insensitive" } },
                { description: { contains: q, mode: "insensitive" } },
              ],
            }
          : {},
      ],
    },
    orderBy: { name: "asc" },
  });
  res.json(rows);
});

suitesRouter.get("/:id", async (req, res) => {
  const row = await prisma.testSuite.findUnique({ where: { id: String(req.params["id"]) } });
  if (!row) return res.status(404).json({ error: "Not found" });
  res.json(row);
});

const suiteBody = z.object({
  name: z.string().min(1),
  category: z.enum(categories),
  description: z.string().optional(),
  tools: z.string().optional(),
  focusAreas: z.string().optional(),
  kpiJson: z.record(z.string(), z.unknown()).optional(),
  scope: z.string().optional(),
  standards: z.string().optional(),
  severity: z.enum(["critical", "high", "medium", "low"]).optional(),
});

suitesRouter.post("/", requireRole("admin"), async (req, res) => {
  const parsed = suiteBody.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  const d = parsed.data;
  const row = await prisma.testSuite.create({
    data: {
      name: d.name,
      category: d.category,
      description: d.description,
      tools: d.tools,
      focusAreas: d.focusAreas,
      kpiJson: (d.kpiJson ?? {}) as Prisma.InputJsonValue,
      scope: d.scope,
      standards: d.standards,
      severity: (d.severity as SuiteSeverity | undefined) ?? "medium",
    },
  });
  res.status(201).json(row);
});

suitesRouter.patch("/:id", requireRole("admin"), async (req, res) => {
  const parsed = suiteBody.partial().safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  try {
    const row = await prisma.testSuite.update({
      where: { id: String(req.params["id"]) },
      data: {
        ...parsed.data,
        kpiJson: parsed.data.kpiJson !== undefined ? (parsed.data.kpiJson as Prisma.InputJsonValue) : undefined,
        severity: parsed.data.severity as SuiteSeverity | undefined,
      },
    });
    res.json(row);
  } catch {
    res.status(404).json({ error: "Not found" });
  }
});
