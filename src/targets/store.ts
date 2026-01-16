import { randomUUID } from "node:crypto";   

export type Target = {
    id: string;
    name?: string;
    host: string;
    port: number;
    thresholdDays?: number;

};

const targets: Target[] = [];

export function listTargets(): Target[] {
    return targets;
}

export function addTarget(input: Omit<Target, "id">): Target {
  const target: Target = { id: randomUUID(), ...input };
  targets.push(target);
  return target;
}

