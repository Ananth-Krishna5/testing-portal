import { Router } from "express";
import { prisma } from "../../lib/prisma.js";
import { requireAuth } from "../../middleware/auth.js";

export const searchRouter = Router();
searchRouter.use(requireAuth);

searchRouter.get("/", async (req, res) => {
  const q = typeof req.query.q === "string" ? req.query.q.trim() : "";
  if (q.length < 2) return res.json({ programs: [], projects: [], suites: [], users: [] });
  const [programs, projects, suites, users] = await Promise.all([
    prisma.program.findMany({
      where: { OR: [{ name: { contains: q, mode: "insensitive" } }, { description: { contains: q, mode: "insensitive" } }] },
      take: 10,
      select: { id: true, name: true, status: true },
    }),
    prisma.project.findMany({
      where: { OR: [{ name: { contains: q, mode: "insensitive" } }, { description: { contains: q, mode: "insensitive" } }] },
      take: 10,
      select: { id: true, name: true, environment: true, programId: true },
    }),
    prisma.testSuite.findMany({
      where: { OR: [{ name: { contains: q, mode: "insensitive" } }, { category: { contains: q, mode: "insensitive" } }] },
      take: 10,
      select: { id: true, name: true, category: true },
    }),
    prisma.user.findMany({
      where: { OR: [{ name: { contains: q, mode: "insensitive" } }, { email: { contains: q, mode: "insensitive" } }] },
      take: 10,
      select: { id: true, name: true, email: true, role: true },
    }),
  ]);
  res.json({ programs, projects, suites, users });
});
