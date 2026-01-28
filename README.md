# CertPulse

CertPulse é um serviço backend simples para monitorar certificados TLS (SSL), registrar eventos em log, expor métricas no padrão Prometheus e visualizar dados via Grafana. O projeto foi desenhado como exercício técnico para demonstrar arquitetura de backend, observabilidade e trade-offs operacionais claros — não como produto final.

## Visão geral

- Verifica certificados TLS sob demanda (`/check`) e de forma periódica via poller interno.
- Mantém alvos monitorados em SQLite local.
- Expõe métricas Prometheus em memória no endpoint `/metrics`.
- Loga eventos de checks em JSON no stdout.

## Stack

- Node.js + TypeScript
- Express
- SQLite (better-sqlite3)
- Prometheus
- Grafana
- Docker + Docker Compose

## Funcionalidades

- **Check pontual de certificado** via TLS com SNI e timeout configurado.
- **Cadastro e listagem de alvos** (host/porta/threshold).
- **Poller periódico** a cada 60s para revalidar alvos registrados.
- **Métricas Prometheus** para checks, expirados, expiração próxima e falhas.

## Endpoints principais

- `GET /healthz` — Health check simples.
- `GET /check?host=example.com&port=443` — Verificação imediata de certificado.
- `POST /targets` — Cadastro de alvo para monitoramento.
- `GET /targets` — Lista de alvos cadastrados.
- `GET /metrics` — Métricas no formato Prometheus.

### Exemplo de payload para `POST /targets`

```json
{
  "name": "api-prod",
  "host": "example.com",
  "port": 443,
  "thresholdDays": 14
}
```

## Métricas expostas

- `certpulse_checks_total`
- `certpulse_check_ok_total`
- `certpulse_expiring_total`
- `certpulse_expired_total`
- `certpulse_check_failed_total`
- `certpulse_last_poll_timestamp`

As métricas são mantidas em memória e reiniciam junto com o processo.

## Configuração

Variáveis de ambiente suportadas:

- `PORT`: porta do serviço (default `3000`).
- `CERTPULSE_THRESHOLD_DAYS`: dias antes do vencimento para considerar “expirando”.
- `DB_PATH`: caminho do SQLite (default `./data/certpulse.db`).

## Executando localmente (modo recomendado)

### Pré-requisitos

- Docker
- Docker Compose

### Subir a stack

```bash
docker compose up
```

Isso iniciará:

- CertPulse (porta **3000**)
- Prometheus (porta **9090**)
- Grafana (porta **3001**)

### Acessos

- API: <http://localhost:3000>
- Métricas: <http://localhost:3000/metrics>
- Prometheus: <http://localhost:9090>
- Grafana: <http://localhost:3001>

## Estrutura do projeto

```
.
├── src/
│   ├── app.ts            # API HTTP + agendamento do poller
│   ├── config.ts         # Configuração por env
│   ├── metrics/          # Exportação Prometheus
│   ├── notify/           # Logger de eventos
│   ├── scheduler/        # Poller periódico
│   ├── targets/          # SQLite + store de alvos
│   └── tls/              # Check TLS
├── ops/                  # Config do Prometheus
├── docker-compose.yml
└── data/                 # Banco SQLite local
```

## Decisões arquiteturais

- Poller simples com `setInterval` (não distribuído).
- Métricas em memória (sem persistência).
- SQLite local (sem migrations formais).
- Sem autenticação ou idempotência para targets.

Essas escolhas reduzem complexidade e deixam o foco em fundamentos observáveis e explicáveis.


