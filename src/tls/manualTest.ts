import { checkCert } from "./checkCert";

async function main() {
  const host = process.argv[2] ?? "google.com";
  const port = Number(process.argv[3] ?? "443");

  const result = await checkCert(host, port);
  console.log(result);
}

main().catch((err) => {
  console.error("ERROR:", err.message);
  process.exit(1);
});
