import { randomUUID } from "crypto";
import { insertTarget, selectTargets } from "./db";

export type Target = {
  id: string;
  name?: string;
  host: string;
  port: number;
  thresholdDays: number;
};

type NewTarget = {
  name?: string;
  host: string;
  port: number;
  thresholdDays?: number;
};

const DEFAULT_THRESHOLD_DAYS = 14;

export function addTarget(input: NewTarget): Target {
  const created: Target = {
    id: randomUUID(),
    host: input.host,
    port: input.port,
    thresholdDays: input.thresholdDays ?? DEFAULT_THRESHOLD_DAYS,
    ...(input.name !== undefined ? { name: input.name } : {}),
  };

  insertTarget({
    id: created.id,
    name: created.name ?? null,
    host: created.host,
    port: created.port,
    thresholdDays: created.thresholdDays,
  });

  return created;
}

export function listTargets(): Target[] {
  const rows = selectTargets();
  return rows.map((r) => ({
    id: r.id,
    host: r.host,
    port: r.port,
    thresholdDays: r.thresholdDays,
    ...(r.name !== null ? { name: r.name } : {}),
  }));
}
