import tls from "node:tls";

export type CertCheckResult = {
  host: string;
  port: number;
  checkedAt: string;
  validFrom?: string;
  validTo?: string;
  daysRemaining?: number;
};

export async function checkCert(host: string, port: number): Promise<CertCheckResult> {
  const checkedAt = new Date().toISOString();

  return new Promise((resolve, reject) => {
    const socket = tls.connect(
      {
        host,
        port,
        servername: host, // SNI: importante para hosts que servem vários domínios
        timeout: 8_000
      },
      () => {
        try {
          const cert = socket.getPeerCertificate();

          // Em alguns cenários, cert pode vir vazio
          if (!cert || Object.keys(cert).length === 0) {
            socket.end();
            return reject(new Error("No certificate returned by peer"));
          }

          // Essas propriedades no Node são strings em formato legível (ex.: "Jan  9 00:00:00 2026 GMT")
          const validFromRaw = cert.valid_from;
          const validToRaw = cert.valid_to;

          const validFromDate = new Date(validFromRaw);
          const validToDate = new Date(validToRaw);

          const now = new Date();

          const daysRemaining = daysBetween(now, validToDate);
          socket.end();

          resolve({
            host,
            port,
            checkedAt,
            validFrom: validFromDate.toISOString(),
            validTo: validToDate.toISOString(),
            daysRemaining
          });
        } catch (err) {
          socket.end();
          reject(err);
        }
      }
    );

    socket.on("error", (err) => reject(err));
    socket.on("timeout", () => {
      socket.destroy();
      reject(new Error("TLS connection timeout"));
    });
  });
}

function daysBetween(now: Date, future: Date): number {
  const msPerDay = 1000 * 60 * 60 * 24;
  const diffMs = future.getTime() - now.getTime();
  return Math.floor(diffMs / msPerDay);
}

