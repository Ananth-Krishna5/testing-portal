import { Router } from "express";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { prisma } from "../../lib/prisma.js";
import { requireAuth, requireRole } from "../../middleware/auth.js";

export const usersRouter = Router();
usersRouter.use(requireAuth);

usersRouter.get("/", requireRole("admin", "tester"), async (_req, res) => {
  const rows = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    select: { id: true, name: true, email: true, role: true, teamType: true, status: true, createdAt: true },
  });
  res.json(rows);
});

const inviteSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(8).optional(),
  role: z.enum(["admin", "tester", "viewer", "external"]).optional(),
  teamType: z.enum(["internal", "development", "external"]).optional(),
});

usersRouter.post("/", requireRole("admin"), async (req, res) => {
  const parsed = inviteSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  const tempPass = parsed.data.password ?? cryptoRandomPassword();
  const passwordHash = await bcrypt.hash(tempPass, 10);
  const row = await prisma.user.create({
    data: {
      name: parsed.data.name,
      email: parsed.data.email,
      passwordHash,
      role: parsed.data.role ?? "viewer",
      teamType: parsed.data.teamType ?? "internal",
      status: parsed.data.password ? "active" : "invited",
    },
    select: { id: true, name: true, email: true, role: true, teamType: true, status: true },
  });
  res.status(201).json({ ...row, temporaryPassword: parsed.data.password ? undefined : tempPass });
});

usersRouter.patch("/:id", requireRole("admin"), async (req, res) => {
  const schema = inviteSchema.partial().extend({ status: z.enum(["active", "invited", "disabled"]).optional() });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  const data: Record<string, unknown> = { ...parsed.data };
  if (parsed.data.password) {
    data.passwordHash = await bcrypt.hash(parsed.data.password, 10);
    delete data.password;
    data.status = "active";
  }
  try {
    const row = await prisma.user.update({
      where: { id: String(req.params["id"]) },
      data: data as never,
      select: { id: true, name: true, email: true, role: true, teamType: true, status: true },
    });
    res.json(row);
  } catch {
    res.status(404).json({ error: "Not found" });
  }
});

function cryptoRandomPassword(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@";
  let s = "";
  for (let i = 0; i < 14; i++) s += chars[Math.floor(Math.random() * chars.length)];
  return s;
}
