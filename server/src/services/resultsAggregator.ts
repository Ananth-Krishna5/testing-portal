import type { TestResultStatus } from "@prisma/client";

export interface NormalizedCase {
  testName: string;
  status: TestResultStatus;
  durationMs: number | null;
  errorMsg: string | null;
}

function mapStatus(raw: string): TestResultStatus {
  const s = raw.toLowerCase();
  if (s === "passed" || s === "pass") return "pass";
  if (s === "failed" || s === "fail") return "fail";
  return "skip";
}

/** Playwright JSON reporter root `{ suites: [...] }` or legacy list */
export function parsePlaywrightJsonReport(json: unknown): NormalizedCase[] {
  const out: NormalizedCase[] = [];
  if (json && typeof json === "object" && Array.isArray((json as { suites?: unknown[] }).suites)) {
    for (const suite of (json as { suites: unknown[] }).suites) {
      if (suite && typeof suite === "object") {
        walkPwSuite(suite as { suites?: unknown[]; tests?: unknown[] }, "", out);
      }
    }
    return out;
  }
  if (Array.isArray(json)) {
    for (const suite of json) {
      if (suite && typeof suite === "object") {
        walkPwSuite(suite as { suites?: unknown[]; tests?: unknown[] }, "", out);
      }
    }
  }
  return out;
}

function walkPwSuite(node: { suites?: unknown[]; tests?: unknown[] }, prefix: string, out: NormalizedCase[]): void {
  const tests = node.tests;
  if (Array.isArray(tests)) {
    for (const t of tests) {
      if (!t || typeof t !== "object") continue;
      const title = (t as { title?: string }).title ?? "test";
      const results = (t as { results?: { status?: string; duration?: number; error?: { message?: string } }[] }).results;
      const r = Array.isArray(results) && results[0] ? results[0] : undefined;
      out.push({
        testName: prefix ? `${prefix} > ${title}` : title,
        status: mapStatus(r?.status ?? "skipped"),
        durationMs: r?.duration != null ? Math.round(r.duration) : null,
        errorMsg: r?.error?.message ?? null,
      });
    }
  }
  if (Array.isArray(node.suites)) {
    for (const s of node.suites) {
      if (s && typeof s === "object") {
        const title = (s as { title?: string }).title;
        const next = prefix && title ? `${prefix} > ${title}` : title || prefix;
        walkPwSuite(s as { suites?: unknown[]; tests?: unknown[] }, next, out);
      }
    }
  }
}

/** Simulated / generic JSON array */
export function parseGenericResults(json: unknown): NormalizedCase[] {
  if (!json || typeof json !== "object") return [];
  const j = json as { tests?: { name: string; status: string; durationMs?: number; error?: string }[] };
  if (!Array.isArray(j.tests)) return [];
  return j.tests.map((t) => ({
    testName: t.name,
    status: mapStatus(t.status),
    durationMs: t.durationMs ?? null,
    errorMsg: t.error ?? null,
  }));
}
