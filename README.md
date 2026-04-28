# Atlas Lab

![Version](https://img.shields.io/badge/version-0.49.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-22c55e.svg)
![Docker Compose](https://img.shields.io/badge/Docker%20Compose-v2-2496ED?logo=docker&logoColor=white)
![Gateway](https://img.shields.io/badge/Gateway-Caddy-1F2937?logo=caddy&logoColor=white)
![CLI](https://img.shields.io/badge/CLI-Node.js%20%2B%20TypeScript-3C873A?logo=nodedotjs&logoColor=white)
![Dashboard](https://img.shields.io/badge/UI-Atlas%20Dashboard-0F172A?logo=antdesign&logoColor=white)
![Security](https://img.shields.io/badge/Ingress-HTTPS%20Only-0F766E)
![Layers](https://img.shields.io/badge/Layers-core%20%7C%20ai--llm%20%7C%20workbench-7C3AED)
![Persistence](https://img.shields.io/badge/Persistence-Docker%20Volumes-CA8A04)

Atlas Lab is a localhost-first self-hosted platform made of a Node.js/TypeScript CLI, a layered Docker Compose stack, and an operational React dashboard served by Caddy.

It provides a core collaboration layer with GitLab CE, BookStack, and Penpot, plus optional AI and development layers. Everything is reachable through dedicated HTTPS ports on `localhost`, with persistent state stored in Docker volumes.

---

## Overview

### What It Gives You

- Always-on core layer with Atlas Dashboard, GitLab CE, BookStack, and Penpot.
- Optional AI LLM layer with Open WebUI, Ollama, and n8n.
- Optional workbench layer with browser-based Node and Python environments plus shared PostgreSQL.
- HTTPS-only browser ingress on `localhost`.
- Self-contained npm package that can run without a local repository checkout.
- Image and volume backup workflows through the CLI.

### Design Principles

- no internal DNS requirement
- no `hosts` file edits
- no disposable init containers in Compose
- no hard dependency on a checked-out repo after packaging
- one operational flow for startup, bootstrap, diagnostics, backup, and restore

---

## Architecture

Atlas Lab is split into three explicit layers.

| Layer | Status | Includes | Purpose |
| --- | --- | --- | --- |
| `core` | always on | gateway, Atlas Dashboard, GitLab CE, BookStack, Penpot, and backing data services | baseline self-hosted platform |
| `ai-llm` | optional | Open WebUI, Ollama, n8n, AI gateway | local AI workflows and automation |
| `workbench` | optional | Node Forge, Python Grid, shared PostgreSQL, workbench gateway | browser-based development |

The current topology uses `localhost` plus dedicated HTTPS ports. That keeps the stack predictable on a single machine and avoids local DNS maintenance.

### Bootstrap Model

Bootstrap is handled by the TypeScript CLI.

The CLI:

- starts Docker Compose
- runs host preflight checks
- validates Compose and repository assets
- bootstraps the initial BookStack admin
- aligns the Penpot root profile
- aligns the n8n owner account when the AI LLM layer is enabled
- reconciles Ollama models when the AI LLM layer is enabled

GitLab CE initializes its root account during first container boot through the GitLab Docker/Omnibus configuration.

---

## Services, Ports, and URLs

All browser entry points are exposed over HTTPS on `localhost`.

| Service | Layer | URL / Endpoint | Notes |
| --- | --- | --- | --- |
| Atlas Dashboard | `core` | `https://localhost:8443/` | operational dashboard |
| GitLab CE | `core` | `https://localhost:8444/` | repositories, issues, merge requests |
| Open WebUI | `ai-llm` | `https://localhost:8446/` | only with `--with-ai-llm` |
| Ollama | `ai-llm` | `https://localhost:8447/` | HTTPS API with gateway auth |
| Penpot | `core` | `https://localhost:8448/` | collaborative design workspace |
| BookStack | `core` | `https://localhost:8449/` | internal wiki and knowledge base |
| Node Forge | `workbench` | `https://localhost:8450/` | Node / TypeScript workspace |
| Python Grid | `workbench` | `https://localhost:8451/` | Python workspace |
| n8n | `ai-llm` | `https://localhost:8453/` | workflow automation |
| PostgreSQL | `workbench` | `localhost:15432` | host-side desktop access |

Operational rules:

- browsers always go through Caddy
- optional layers never start implicitly
- host-side PostgreSQL clients must use `localhost:15432`

---

## Docker Networks

| Network | Type | Purpose |
| --- | --- | --- |
| `edge-net` | exposed | published ingress ports |
| `apps-net` | internal | GitLab CE, BookStack, and gateway-routed browser services |
| `penpot-net` | internal | Penpot application services |
| `ai-llm-net` | internal | Open WebUI, Ollama, and n8n |
| `data-net` | internal | infrastructure databases |
| `workbench-net` | internal | workbenches and PostgreSQL |
| `workbench-host-net` | bridge | host-side PostgreSQL bind |
| `services-egress-net` | selective egress | outbound access for core services |
| `workbench-egress-net` | selective egress | outbound access for workbench services |

The gateway remains the only public browser entry point for web services.

---

## Persistence

Atlas Lab uses named Docker volumes for runtime state.

Core volumes:

- `gateway-certs`
- `gateway-config`
- `gateway-site`
- `gateway-data`
- `gitlab-config`
- `gitlab-logs`
- `gitlab-data`
- `bookstack-config`
- `bookstack-db`
- `penpot-assets`
- `penpot-postgres`

Optional layer volumes:

- `ollama-data`
- `n8n-data`
- `open-webui-data`
- `postgres-dev-data`
- Node and Python workbench home/workspace volumes

Recreating containers does not wipe state. Removing volumes does.

When migrating from an older local run, stop the stack with:

```powershell
npm run dev -- down
```

The current Compose files no longer reference removed core services. Any older unused volumes remain on disk until you inspect and delete them manually.

---

## Host Requirements

Required software:

- Docker Engine with Docker Compose v2
- Node.js >= 20
- npm

AI LLM requirements:

- NVIDIA GPU
- working `nvidia-smi`
- Docker configured with NVIDIA GPU support

Recommended resources:

- CPU: 4 vCPU or better
- RAM: 8 GB minimum, 12-16 GB preferred
- disk: 20 GB free or more
- VRAM: 8 GB or more for comfortable Ollama usage

Ports that should be free:

- `8443`
- `8444`
- `8446`
- `8447`
- `8448`
- `8449`
- `8450`
- `8451`
- `8453`
- `15432` when `workbench` is enabled

---

## Central Configuration

The main runtime configuration lives in:

- [`env/lab.env`](./env/lab.env)

Key variables include:

- `LAB_HTTPS_PORT`, `GITLAB_HTTPS_PORT`, `PENPOT_HTTPS_PORT`, `BOOKSTACK_HTTPS_PORT`
- `OPENWEBUI_HTTPS_PORT`, `OLLAMA_HTTPS_PORT`, `N8N_HTTPS_PORT`
- `NODE_DEV_HTTPS_PORT`, `PYTHON_DEV_HTTPS_PORT`, `POSTGRES_DEV_HOST_PORT`
- `GITLAB_EXTERNAL_URL`, `GITLAB_URL`
- `GITLAB_ROOT_USERNAME`, `GITLAB_ROOT_PASSWORD`, `GITLAB_ROOT_EMAIL`
- `BOOKSTACK_ROOT_NAME`, `BOOKSTACK_ROOT_EMAIL`, `BOOKSTACK_ROOT_PASSWORD`
- `PENPOT_ROOT_EMAIL`, `PENPOT_ROOT_PASSWORD`
- `N8N_ROOT_EMAIL`, `N8N_ROOT_PASSWORD`
- `OLLAMA_CHAT_MODEL`, `OLLAMA_EMBEDDING_MODEL`, `OLLAMA_RUNTIME_MODELS`

Rule of thumb:

- change ports, versions, credentials, and models in `env/lab.env`
- change routing and runtime content in `config/gateway/templates/`
- change CLI behavior in `src/`

---

## Quick Start

Check prerequisites:

```powershell
docker version
docker compose version
node --version
npm --version
```

Install dependencies:

```powershell
npm install
```

Start the core layer:

```powershell
npm run dev -- up
```

Start core plus AI LLM:

```powershell
npm run dev -- up --with-ai-llm
```

Start core plus workbench:

```powershell
npm run dev -- up --with-workbench
```

Start the full lab:

```powershell
npm run dev -- up --with-ai-llm --with-workbench
```

Run health checks:

```powershell
npm run dev -- doctor --smoke
npm run dev -- doctor --with-ai-llm --smoke
```

Stop the lab:

```powershell
npm run dev -- down
```

GitLab CE can take several minutes to finish its first boot. The configured root password is applied only when GitLab initializes an empty data volume.

---

## CLI Workflows

| Command | Role |
| --- | --- |
| `atlas-lab up` | starts `core` only |
| `atlas-lab up --with-ai-llm` | adds the AI LLM layer |
| `atlas-lab up --with-workbench` | adds the workbench layer |
| `atlas-lab up --with-ai-llm --with-workbench` | starts the full lab |
| `atlas-lab bootstrap` | reruns core bootstrap |
| `atlas-lab bootstrap --with-ai-llm` | reruns bootstrap, n8n owner alignment, and Ollama reconciliation |
| `atlas-lab doctor` | runs host and configuration checks |
| `atlas-lab doctor --smoke` | adds smoke tests for the core layer |
| `atlas-lab doctor --with-ai-llm --smoke` | adds smoke tests for the AI LLM layer |
| `atlas-lab status` | shows Compose/runtime status |
| `atlas-lab down` | stops the stack |
| `atlas-lab save-images` | exports Docker images to a single archive |
| `atlas-lab restore-images` | restores Docker images from an archive |
| `atlas-lab save-volumes` | exports Docker volumes to a single archive |
| `atlas-lab restore-volumes` | restores Docker volumes from an archive |

Self-contained packaging:

```powershell
npm run pack:local
npm install -g .\cli-node-docker-atlas-lab-<version>.tgz
atlas-lab status
```

---

## Atlas Dashboard

The dashboard frontend lives in:

- [`apps/atlas-dashboard`](./apps/atlas-dashboard)

Responsibilities:

- visualize layer state
- surface operational links
- expose local markdown briefings
- show credentials and runtime notes
- support `it/en` localization

Local dashboard development:

```powershell
npm run dev:atlas-dashboard
```

---

## Backup and Restore

Atlas Lab supports backup and restore for Docker images and Docker volumes.

Examples:

```powershell
npm run dev -- save-images --with-ai-llm --with-workbench
npm run dev -- restore-images --input .\backups\images\atlas-lab-images.tar.gz
npm run dev -- down
npm run dev -- save-volumes --with-ai-llm --with-workbench
npm run dev -- restore-volumes --input .\backups\volumes\atlas-lab-volumes.tar.gz
```

Bootstrap is idempotent for BookStack, Penpot, and the optional AI LLM services.

---

## Default Credentials

These credentials are intended for trusted local environments and are configurable through `env/lab.env`.

| Service | URL / Endpoint | Credentials |
| --- | --- | --- |
| Atlas Dashboard | `https://localhost:8443/` | no dedicated login |
| GitLab CE | `https://localhost:8444/` | `root / RootGitLab!2026` |
| Open WebUI | `https://localhost:8446/` | `root@openwebui.local / RootOpenWebUI!2026` |
| Ollama | `https://localhost:8447/` | gateway basic auth `root / RootOllama!2026` |
| Penpot | `https://localhost:8448/` | `root@penpot.local / RootPenpot!2026` |
| BookStack | `https://localhost:8449/` | `root@bookstack.local / RootBookStack!2026` |
| n8n | `https://localhost:8453/` | owner bootstrap `root@n8n.local / RootN8NApp!2026` |
| PostgreSQL host-side | `localhost:15432` | `postgres / RootPostgresDev!2026` |

For desktop PostgreSQL clients:

- host: `localhost`
- port: `15432`
- database: `lab`
- username: `postgres`
- password: `RootPostgresDev!2026`

---

## Repository Layout

| Area | Purpose | Paths |
| --- | --- | --- |
| CLI shell | entrypoint, command registration, terminal rendering | `src/cli/`, `bin/` |
| domain services | runtime orchestration, diagnostics, integrations, archive workflows | `src/services/` |
| shared contracts | config schemas, Docker helpers, utilities, shared types | `src/config/`, `src/lib/`, `src/types/`, `src/utils/` |
| dashboard | React frontend plus Vite and TS config | `apps/atlas-dashboard/` |
| runtime assets | packaged env files and gateway templates | `env/`, `config/gateway/templates/` |
| infrastructure | Compose layers, Dockerfiles, startup scripts | `infra/docker/` |
| verification and tooling | unit tests, release helpers, CI support | `tests/`, `scripts/`, `.github/` |

Key files:

- [`package.json`](./package.json)
- [`env/lab.env`](./env/lab.env)
- [`infra/docker/compose.yml`](./infra/docker/compose.yml)
- [`infra/docker/compose.ai-llm.yml`](./infra/docker/compose.ai-llm.yml)
- [`infra/docker/compose.workbench.yml`](./infra/docker/compose.workbench.yml)
- [`config/gateway/templates/Caddyfile.template`](./config/gateway/templates/Caddyfile.template)
- [`config/gateway/templates/runtime/lab-config.json.template`](./config/gateway/templates/runtime/lab-config.json.template)
- [`infra/docker/images/gateway/bootstrap-gateway.sh`](./infra/docker/images/gateway/bootstrap-gateway.sh)

---

## Troubleshooting

### Browser Certificate Warning

Expected behavior. The lab uses a self-signed certificate for `localhost`.

Certificate download URL:

```text
https://localhost:8443/assets/lab.crt
```

### `atlas-lab up` Fails During Port Preflight

One of the configured lab ports is occupied or excluded by the system.

```powershell
atlas-lab status
docker ps --format "table {{.Names}}\t{{.Ports}}\t{{.Status}}"
```

### GitLab First Boot Takes a Long Time

GitLab CE runs its Omnibus reconfiguration on first boot and can take several minutes before `https://localhost:8444/` is ready. Check status with:

```powershell
docker compose --env-file env/lab.env -f infra/docker/compose.yml ps gitlab
docker compose --env-file env/lab.env -f infra/docker/compose.yml logs -f gitlab
```

### AI LLM Startup Fails During GPU Preflight

This is usually a Docker daemon GPU pass-through issue.

```powershell
nvidia-smi -L
docker info
```

### Workbenches Do Not Start

Workbenches are not part of the core layer. Start them explicitly:

```powershell
npm run dev -- up --with-workbench
```

---

## Security Notes

Atlas Lab is intended for:

- local use
- technical lab environments
- trusted networks
- development and prototyping

It is not an internet-facing production deployment hardened out of the box.

For stronger hardening:

- move secrets into an external secret-management system
- replace the default certificate with one signed by an internal CA
- tighten network segmentation further
- define recurring backup policies
- audit logs and default credentials

---

## Official References

### GitLab CE

- Docker installation: https://docs.gitlab.com/ee/install/docker/
- Docker configuration: https://docs.gitlab.com/ee/install/docker/configuration.html
- Omnibus NGINX settings: https://docs.gitlab.com/omnibus/settings/nginx.html

### Docker

- Compose startup order: https://docs.docker.com/compose/how-tos/startup-order/
- Compose networks: https://docs.docker.com/reference/compose-file/networks/
- Docker networking drivers: https://docs.docker.com/engine/network/drivers/

### Caddy

- Caddyfile concepts: https://caddyserver.com/docs/caddyfile
- Reverse proxy: https://caddyserver.com/docs/caddyfile/directives/reverse_proxy

### n8n

- Self-hosted user management: https://docs.n8n.io/hosting/configuration/user-management-self-hosted/
- Docker install: https://docs.n8n.io/hosting/installation/docker/

### BookStack

- Installation: https://www.bookstackapp.com/docs/admin/installation
- Commands: https://www.bookstackapp.com/docs/admin/commands/

### Open WebUI

- Environment configuration: https://docs.openwebui.com/getting-started/env-configuration/

### Ollama

- FAQ: https://docs.ollama.com/faq
- API reference: https://github.com/ollama/ollama/blob/main/docs/api.md

### code-server

- Official docs: https://coder.com/docs/code-server/latest

---

## License

This project is distributed under the MIT license.
