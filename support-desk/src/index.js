import express from "express";
import cors from "cors";
import Database from "better-sqlite3";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataDir = process.env.SQLITE_DATA_DIR || path.join(__dirname, "..", "data");
const dbPath = path.join(dataDir, "support-desk.db");

fs.mkdirSync(dataDir, { recursive: true });
const db = new Database(dbPath);
db.pragma("journal_mode = WAL");

db.exec(`
  CREATE TABLE IF NOT EXISTS sd_tickets (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    subject TEXT NOT NULL,
    description TEXT,
    status TEXT NOT NULL DEFAULT 'open',
    priority TEXT NOT NULL DEFAULT 'medium',
    category TEXT,
    customer_name TEXT,
    customer_email TEXT,
    assigned_to TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );
  CREATE TABLE IF NOT EXISTS sd_messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    ticket_id INTEGER NOT NULL,
    sender_type TEXT NOT NULL,
    sender_name TEXT NOT NULL,
    content TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (ticket_id) REFERENCES sd_tickets(id)
  );
  CREATE TABLE IF NOT EXISTS sd_kb_articles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    category TEXT,
    tags TEXT
  );
`);

const app = express();
app.use(cors());
app.use(express.json({ limit: "2mb" }));

app.get("/health", (_req, res) => {
  res.json({ ok: true, service: "support-desk-stub" });
});

app.post("/api/query", (req, res) => {
  const sql = req.body?.sql;
  if (typeof sql !== "string" || !sql.trim()) {
    return res.status(400).json({ error: "Missing sql" });
  }
  const trimmed = sql.trim();
  const upper = trimmed.toUpperCase();
  try {
    if (upper.startsWith("SELECT") || upper.startsWith("WITH")) {
      const stmt = db.prepare(trimmed);
      const rows = stmt.all();
      return res.json({ rows });
    }
    const run = db.prepare(trimmed).run();
    return res.json({
      changes: run.changes,
      lastInsertRowid: Number(run.lastInsertRowid),
    });
  } catch (e) {
    console.error("SQLite error:", e.message);
    return res.status(500).json({ error: e.message });
  }
});

const port = Number(process.env.PORT || 3001);
app.listen(port, "0.0.0.0", () => {
  console.log(`Support Desk stub listening on ${port}, db=${dbPath}`);
});
