import { checkCert } from "../tls/checkCert";
import { listTargets, Target } from "../targets/store";
import { logEvent } from "../notify/logger";
import { inc, setLastPollNow } from "../metrics/prom";

function getThresholdDays(target: Target, defaultThresholdDays: number): number {
  return target.thresholdDays ?? defaultThresholdDays;
}

export async function runPollOnce(defaultThresholdDays: number): Promise<void> {
  
  setLastPollNow();
  const targets = listTargets();

  for (const t of targets) {
    const checkedAt = new Date().toISOString();

    inc("checks_total");

    try {
      const result = await checkCert(t.host, t.port);

      const daysRemaining = result.daysRemaining ?? Number.NaN;
      if (!Number.isFinite(daysRemaining)) {
        logEvent({
          type: "CHECK_FAILED",
          targetId: t.id,
          host: t.host,
          port: t.port,
          message: "daysRemaining missing/invalid",
          checkedAt
        });
        continue;
      }

      const thresholdDays = getThresholdDays(t, defaultThresholdDays);

      if (daysRemaining < 0) {
        inc("expired_total"); 
        logEvent({ type: "EXPIRED", targetId: t.id, host: t.host, port: t.port, daysRemaining, checkedAt });
      } else if (daysRemaining <= thresholdDays) {
        inc("expiring_total");
        logEvent({ type: "EXPIRING", targetId: t.id, host: t.host, port: t.port, daysRemaining, checkedAt });
      } else {
        inc("check_ok_total");
        logEvent({ type: "CHECK_OK", targetId: t.id, host: t.host, port: t.port, daysRemaining, checkedAt });
      }
    } catch (err) {
      inc("check_failed_total");  
      const message = err instanceof Error ? err.message : "Unknown error";
      logEvent({ type: "CHECK_FAILED", targetId: t.id, host: t.host, port: t.port, message, checkedAt });
    }
  }
}
