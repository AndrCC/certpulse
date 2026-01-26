import Database from "better-sqlite3";
import path from "path";

const dbPath =
  process.env.DB_PATH ?? path.join(process.cwd(), "data", "certpulse.db");

const db = new Database(dbPath);

db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");

db.exec(`
  CREATE TABLE IF NOT EXISTS targets (
    id TEXT PRIMARY KEY,
    name TEXT,
    host TEXT NOT NULL,
    port INTEGER NOT NULL,
    threshold_days INTEGER NOT NULL DEFAULT 14
  );
`);

export function insertTarget(row: {
  id: string;
  name: string | null;
  host: string;
  port: number;
  thresholdDays: number;
}): void {
  db.prepare(`
    INSERT INTO targets (id, name, host, port, threshold_days)
    VALUES (@id, @name, @host, @port, @thresholdDays)
  `).run(row);
}

export function selectTargets(): Array<{
  id: string;
  name: string | null;
  host: string;
  port: number;
  thresholdDays: number;
}> {
  return db.prepare(`
    SELECT
      id,
      name,
      host,
      port,
      threshold_days AS thresholdDays
    FROM targets
    ORDER BY rowid DESC
  `).all() as Array<{
    id: string;
    name: string | null;
    host: string;
    port: number;
    thresholdDays: number;
  }>;
}
