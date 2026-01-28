type CounterName = "checks_total" | "check_ok_total" | "expiring_total" | "expired_total" | "check_failed_total";

const counters: Record<CounterName, number> = {
    checks_total: 0,
    check_ok_total: 0,
    expiring_total: 0,
    expired_total: 0,
    check_failed_total: 0,
};

let lastPollEpochSeconds: number | null = null;

export function inc(name: CounterName, by = 1) {
  counters[name] += by;
}

export function setLastPollNow() {
  lastPollEpochSeconds = Math.floor(Date.now() / 1000);
}

export function renderPrometheusMetrics(): string {
    const lines: string[] = [];

  lines.push("# HELP certpulse_checks_total Total number of certificate checks attempted");
  lines.push("# TYPE certpulse_checks_total counter");
  lines.push(`certpulse_checks_total ${counters.checks_total}`);

  lines.push("# HELP certpulse_check_ok_total Total number of successful checks (not expiring soon)");
  lines.push("# TYPE certpulse_check_ok_total counter");
  lines.push(`certpulse_check_ok_total ${counters.check_ok_total}`);

  lines.push("# HELP certpulse_expiring_total Total number of checks that were expiring soon");
  lines.push("# TYPE certpulse_expiring_total counter");
  lines.push(`certpulse_expiring_total ${counters.expiring_total}`);

  lines.push("# HELP certpulse_expired_total Total number of checks that were expired");
  lines.push("# TYPE certpulse_expired_total counter");
  lines.push(`certpulse_expired_total ${counters.expired_total}`);

  lines.push("# HELP certpulse_check_failed_total Total number of failed checks");
  lines.push("# TYPE certpulse_check_failed_total counter");
  lines.push(`certpulse_check_failed_total ${counters.check_failed_total}`);

  lines.push("# HELP certpulse_last_poll_timestamp Unix timestamp (seconds) of last poll run");
  lines.push("# TYPE certpulse_last_poll_timestamp gauge");
  lines.push(`certpulse_last_poll_timestamp ${lastPollEpochSeconds ?? 0}`);

  return lines.join("\n") + "\n";

}