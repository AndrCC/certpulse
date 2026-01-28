function parseIntEnv(name: string, fallback: number): number {
  const raw = process.env[name];
  if (!raw) return fallback;

  const n = Number.parseInt(raw, 10);
  if (!Number.isFinite(n) || n < 0 || n > 3650) return fallback; // limite defensivo
  return n;
}

export const config = {
  thresholdDays: parseIntEnv("CERTPULSE_THRESHOLD_DAYS", 14),
};
