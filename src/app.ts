import express from "express";
import { checkCert } from "./tls/checkCert";
import { addTarget, listTargets } from "./targets/store";
import { config } from "./config";
import { runPollOnce } from "./scheduler/poller";
import { renderPrometheusMetrics } from "./metrics/prom";

const app = express();
app.use(express.json());

app.get("/healthz", (_req, res) => {
  res.status(200).json({ status: "ok" });
});

app.get("/check", async (req, res) => {
  const host = String(req.query.host ?? "");
  const portRaw = String(req.query.port ?? "443");

  if (!host) {
    return res.status(400).json({ error: "Missing 'host' query parameter" });
  }

  const port = Number(portRaw);
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    return res.status(400).json({ error: "Invalid 'port' query parameter" });
  }

  try {
    const result = await checkCert(host, port);
    res.status(200).json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return res.status(502).json({ error: `TLS check failed: ${message}` });
  }
});

app.get('/targets', (_req, res) => {
  res.status(200).json(listTargets());
});

app.get('/metrics', (_req, res) => {
  res.setHeader("Content-Type", "text/plain; version=0.0.4");
  res.status(200).send(renderPrometheusMetrics());
});

app.post("/targets", (req, res) => {
  const name = req.body?.name ? String(req.body.name) : undefined;
  const host = String(req.body?.host ?? "");
  const port = Number(req.body?.port ?? 443);
  const thresholdDays =
    req.body?.thresholdDays === undefined ? undefined : Number(req.body.thresholdDays);

  if (!host) {
    return res.status(400).json({ error: "Missing body field: host" });
  }
  if (!Number.isInteger(port) || port <= 0 || port > 65535) {
    return res.status(400).json({ error: "Invalid port" });
  }
  if (thresholdDays !== undefined && (!Number.isInteger(thresholdDays) || thresholdDays < 0 || thresholdDays > 3650)) {
    return res.status(400).json({ error: "Invalid thresholdDays" });
  }

  const created = addTarget({ 
    ...(name !== undefined ? { name } : {}),
    host,
    port,
    ...(thresholdDays !== undefined ? { thresholdDays } : {}),
   });
  return res.status(201).json(created);
});

const port = process.env.PORT ? Number(process.env.PORT) : 3000;

app.listen(port, () => {
  console.log(JSON.stringify({ level: "info", msg: "server_started", port }));
});

const pollIntervalMs = 60_000; 

setInterval(() => {
  runPollOnce(config.thresholdDays).catch((err) => {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error(JSON.stringify({ level: "error", msg: "poller_failed", message }));
  });
}, pollIntervalMs);


