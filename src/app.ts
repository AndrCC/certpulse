import express from "express";
import { checkCert } from "./tls/checkCert";

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

const port = process.env.PORT ? Number(process.env.PORT) : 3000;

app.listen(port, () => {
  console.log(JSON.stringify({ level: "info", msg: "server_started", port }));
});

