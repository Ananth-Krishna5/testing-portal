import { PrismaClient, SuiteSeverity, UserRole, TeamType, UserAccountStatus } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const catalog = [
  { name: "E2E Smoke Test", category: "E2E", tools: "Playwright", focusAreas: "Auth, checkout", severity: SuiteSeverity.high },
  { name: "API Contract Suite", category: "CI/CD", tools: "Cypress", focusAreas: "REST, GraphQL", severity: SuiteSeverity.medium },
  { name: "Voice UX Regression", category: "Voice", tools: "Playwright", focusAreas: "ASR, TTS", severity: SuiteSeverity.medium },
  { name: "Security OWASP Scan", category: "Security", tools: "Python", focusAreas: "ZAP, headers", severity: SuiteSeverity.critical },
  { name: "Performance Baseline", category: "Performance", tools: "Python", focusAreas: "Latency, throughput", severity: SuiteSeverity.high },
  { name: "Accessibility Audit", category: "UX", tools: "Playwright", focusAreas: "WCAG 2.1 AA", severity: SuiteSeverity.low },
  { name: "Foundational Health Check", category: "Foundational", tools: "Python", focusAreas: "Uptime, probes", severity: SuiteSeverity.low },
  { name: "AI Model Evaluation", category: "AI", tools: "Python", focusAreas: "Quality, safety", severity: SuiteSeverity.high },
];

async function main() {
  const passwordHash = await bcrypt.hash("TestHub123!", 10);
  await prisma.user.upsert({
    where: { email: "admin@xmachina.digital" },
    update: {},
    create: {
      name: "System Admin",
      email: "admin@xmachina.digital",
      passwordHash,
      role: UserRole.admin,
      teamType: TeamType.internal,
      status: UserAccountStatus.active,
    },
  });
  await prisma.user.upsert({
    where: { email: "tester@xmachina.digital" },
    update: {},
    create: {
      name: "QA Tester",
      email: "tester@xmachina.digital",
      passwordHash,
      role: UserRole.tester,
      teamType: TeamType.development,
      status: UserAccountStatus.active,
    },
  });

  const integrationId = "00000000-0000-4000-8000-000000000001";
  await prisma.integrationSetting.upsert({
    where: { id: integrationId },
    update: {},
    create: {
      id: integrationId,
      supportDeskUrl: process.env.SUPPORT_DESK_URL ?? "http://localhost:3001",
      autoTicketGlobal: true,
    },
  });

  for (const s of catalog) {
    await prisma.testSuite.upsert({
      where: { id: `seed-${s.name.toLowerCase().replace(/\s+/g, "-")}` },
      update: {},
      create: {
        id: `seed-${s.name.toLowerCase().replace(/\s+/g, "-")}`,
        name: s.name,
        category: s.category,
        description: `${s.name} — catalog entry`,
        tools: s.tools,
        focusAreas: s.focusAreas,
        kpiJson: { passRateTarget: 0.95, flakinessBudget: 0.02 },
        scope: "Regression + release gates",
        standards: "Internal QA bar",
        severity: s.severity,
      },
    });
  }

  const roadmap = await prisma.roadmap.create({
    data: {
      name: "Default Compliance Roadmap",
      templateId: "iso-style",
      canvasJson: { nodes: [], edges: [] },
      isCustom: false,
    },
  });

  const program = await prisma.program.create({
    data: {
      name: "Olympus Certification 2026",
      description: "Sample program for demos",
      manager: "Program Sponsor",
      certAgency: "Internal",
      status: "active",
      roadmapId: roadmap.id,
    },
  });
  await prisma.roadmap.update({ where: { id: roadmap.id }, data: { programId: program.id } });

  console.log("Seed complete. Login: admin@xmachina.digital / TestHub123!");
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
