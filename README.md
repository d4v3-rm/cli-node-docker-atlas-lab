# Atlas Lab 🚀

![Version](https://img.shields.io/badge/version-0.35.7-blue.svg)
![License](https://img.shields.io/badge/license-MIT-22c55e.svg)
![Docker Compose](https://img.shields.io/badge/Docker%20Compose-v2-2496ED?logo=docker&logoColor=white)
![Gateway](https://img.shields.io/badge/Gateway-Caddy-1F2937?logo=caddy&logoColor=white)
![CLI](https://img.shields.io/badge/CLI-Node.js%20%2B%20TypeScript-3C873A?logo=nodedotjs&logoColor=white)
![Dashboard](https://img.shields.io/badge/UI-Atlas%20Dashboard-0F172A?logo=antdesign&logoColor=white)
![Security](https://img.shields.io/badge/Ingress-HTTPS%20Only-0F766E)
![Profiles](https://img.shields.io/badge/Layers-core%20%7C%20ai--agents%20%7C%20ai--llm%20%7C%20ai--image%20%7C%20ai--video%20%7C%20workbench-7C3AED)
![Persistence](https://img.shields.io/badge/Persistence-Docker%20Volumes-CA8A04)

> 🧭 **Atlas Lab** is a localhost-first self-hosted platform made of a Node.js/TypeScript CLI, a layered Docker Compose stack, and an operational React dashboard served by the gateway.
> It is designed to provide Git hosting, optional automation agents, optional local AI LLM services, optional AI image and video generation, browser-based development workbenches, and structured image/volume backup workflows on a single machine.

---

## ✨ Overview

Atlas Lab is built for a practical goal: run a repeatable local engineering platform without depending on custom DNS, hosts-file edits, scattered bootstrap scripts, or ad hoc reverse-proxy plumbing.

### What it gives you

- 🧱 An always-on **core layer** with Gitea, the gateway, and Atlas Dashboard
- 🧠 An optional **AI LLM layer** with Open WebUI and Ollama
- 🛠️ An optional **workbench layer** with browser-based Node, Python, AI, and C++ environments plus shared PostgreSQL
- 🔐 HTTPS-only ingress on `localhost`
- 📦 A self-contained npm package that can run without a local repository checkout
- 💾 Persistent state stored in named Docker volumes
- 💽 Single-file backup and restore for Docker images and volumes

### Design principles

- no internal DNS
- no `hosts` file edits
- no disposable init containers in Compose
- no hard dependency on a checked-out repo
- one coherent operational flow across development, packaging, and day-to-day use

---

## 🗂️ Table of Contents

- [🏗️ Architecture](#️-architecture)
- [🌐 Services, Ports, and URLs](#-services-ports-and-urls)
- [🕸️ Docker Networks](#️-docker-networks)
- [💾 Persistence](#-persistence)
- [🧪 Host Requirements](#-host-requirements)
- [⚙️ Central Configuration](#️-central-configuration)
- [🚀 Quick Start](#-quick-start)
- [🛠️ CLI Workflows](#️-cli-workflows)
- [🖥️ Atlas Dashboard](#️-atlas-dashboard)
- [💽 Backup and Restore](#-backup-and-restore)
- [🔐 Default Credentials](#-default-credentials)
- [📁 Repository Layout](#-repository-layout)
- [🩺 Troubleshooting](#-troubleshooting)
- [🛡️ Security Notes](#️-security-notes)
- [📜 License](#-license)
- [🔗 Official References](#-official-references)

---

## 🏗️ Architecture

Atlas Lab is split into **six explicit layers**:

| Layer | Status | Includes | Purpose |
| --- | --- | --- | --- |
| `core` | always on | gateway, Atlas Dashboard, Gitea, Gitea DB | baseline platform |
| `ai-llm` | optional | Open WebUI, Ollama, AI LLM gateway | local LLM workflows |
| `workbench` | optional | Node Forge, Python Grid, AI Reactor, C++ Foundry, shared PostgreSQL, workbench gateway | browser-based development |

### Why the current topology

The project went through three shapes:

1. subpath-based reverse proxying
2. custom hostnames such as `*.lab.home.arpa`
3. the current `localhost + dedicated HTTPS ports` model

The current model is the most pragmatic for a single-machine lab:

- predictable URLs
- fewer frontend issues than subpath routing
- no local DNS to maintain
- no `hosts` file maintenance

### Bootstrap model

Bootstrap is handled by the TypeScript CLI rather than by throwaway Compose init containers.

The CLI:

- starts the stack
- runs host preflight checks
- reconciles runtime state
- bootstraps Gitea
- reconciles Ollama only when the AI LLM layer is enabled
- cleans up legacy runtime artifacts

---

## 🌐 Services, Ports, and URLs

All public web entry points are exposed over **HTTPS on `localhost`**.
The only host-level TCP service exposed directly is PostgreSQL from the workbench layer.

| Service | Layer | URL / Endpoint | Notes |
| --- | --- | --- | --- |
| Atlas Dashboard | `core` | `https://localhost:8443/` | operational dashboard |
| Gitea | `core` | `https://localhost:8444/` | Git forge, issues, reviews |
| Open WebUI | `ai-llm` | `https://localhost:8446/` | only with `--with-ai-llm` |
| Ollama | `ai-llm` | `https://localhost:8447/` | HTTPS API |
| Node Forge | `workbench` | `https://localhost:8450/` | Node / TypeScript workspace |
| Python Grid | `workbench` | `https://localhost:8451/` | Python workspace |
| AI Reactor | `workbench` | `https://localhost:8452/` | AI / notebook workspace |
| C++ Foundry | `workbench` | `https://localhost:8453/` | C/C++ workspace |
| PostgreSQL | `workbench` | `localhost:15432` | host-side desktop access |

### Operational rules

- browsers always go through the gateway
- optional layers never start implicitly
- host-side PostgreSQL clients must use `localhost:15432`, not `postgres-dev`

---

## 🕸️ Docker Networks

| Network | Type | Purpose |
| --- | --- | --- |
| `edge-net` | exposed | published ingress ports |
| `apps-net` | internal | Gitea and shared browser-facing services |
| `ai-llm-net` | internal | Open WebUI and Ollama |
| `data-net` | internal | data services and infrastructure databases |
| `workbench-net` | internal | workbenches and PostgreSQL |
| `workbench-host-net` | bridge | host-side PostgreSQL bind |
| `services-egress-net` | selective egress | outbound access for core services |
| `workbench-egress-net` | selective egress | outbound access for workbench services |

### Practical implications

- `postgres-dev` exists only inside Docker networking
- desktop tools should connect to `localhost:15432`
- the gateway remains the only public browser entry point

---

## 💾 Persistence

Atlas Lab uses **named Docker volumes** for runtime state.

Key volumes include:

- `gateway-certs`
- `gateway-config`
- `gateway-site`
- `gateway-data`
- `gitea-data`
- `gitea-db`
- `ollama-data`
- `open-webui-data`
- `postgres-dev-data`
- workbench home/workspace volumes for Node, Python, AI, and C++

Recreating containers does not wipe state. Removing the volumes does.

---

## 🧪 Host Requirements

### Required software

- `Docker Engine` with `Docker Compose v2`
- `Node.js >= 20`
- `npm`

### AI requirements

The AI LLM and AI image layers require:

- an `NVIDIA` GPU
- a working `nvidia-smi` on the host
- Docker configured with NVIDIA GPU support

### Recommended resources

- CPU: `4 vCPU` or better
- RAM: `8 GB` minimum, `12-16 GB` preferred
- disk: `20 GB` free or more
- VRAM: `8 GB` or more for comfortable Ollama usage

### Ports that should be free

- `8443`
- `8444`
- `8445`
- `8446`
- `8447`
- `8448`
- `8449`
- `8450`
- `8451`
- `8452`
- `8453`
- `15432` when `workbench` is enabled

### Windows PowerShell note

On restrictive PowerShell setups, prefer the `.cmd` shims:

```powershell
npm.cmd --version
atlas-lab.cmd status
```

### TLS note

The lab uses a **self-signed** certificate for `localhost`.

Certificate download URL:

```text
https://localhost:8443/assets/lab.crt
```

Git for Windows with `schannel` may require importing that certificate into the Windows trust store.

---

## ⚙️ Central Configuration

The main runtime configuration lives in:

- [`env/lab.env`](./env/lab.env)

Key variables include:

- `APP_VERSION`
- `LAB_HTTPS_PORT`, `GITEA_HTTPS_PORT`
- `OPENWEBUI_HTTPS_PORT`, `OLLAMA_HTTPS_PORT`
- `NODE_DEV_HTTPS_PORT`, `PYTHON_DEV_HTTPS_PORT`, `AI_DEV_HTTPS_PORT`, `CPP_DEV_HTTPS_PORT`
- `POSTGRES_DEV_HOST_PORT`
- `OLLAMA_CHAT_MODEL`, `OLLAMA_EMBEDDING_MODEL`, `OLLAMA_RUNTIME_MODELS`
- `GITEA_ROOT_USERNAME`, `GITEA_ROOT_PASSWORD`
- `OPENWEBUI_ROOT_EMAIL`, `OPENWEBUI_ROOT_PASSWORD`

Rule of thumb:

- change **ports**, **versions**, **credentials**, and **models** in `env/lab.env`
- change **routing** and **runtime content** in `config/gateway/templates/`
- change **CLI behavior** in `src/`

---

## 🚀 Quick Start

### 1. Check prerequisites

```powershell
docker version
docker compose version
node --version
npm --version
```

### 2. Install dependencies

```powershell
npm install
```

### 3. Start the core layer

```powershell
npm run dev -- up
```

### 4. Start core + AI LLM

```powershell
npm run dev -- up --with-ai-llm
```

### 5. Start core + workbench

```powershell
npm run dev -- up --with-workbench
```

### 6. Start the full lab

```powershell
npm run dev -- up --with-ai-llm --with-workbench
```

### 7. Check status

```powershell
npm run dev -- status
```

### 8. Run health checks

```powershell
npm run dev -- doctor --smoke
npm run dev -- doctor --with-ai-llm --smoke
```

### 9. Stop the lab

```powershell
npm run dev -- down
```

---

## 🛠️ CLI Workflows

### Supported modes

| Mode | Command | Purpose |
| --- | --- | --- |
| dev mode | `npm run dev -- up` | runs the TypeScript source with `tsx` |
| CLI build | `npm run build` | bundles the CLI into `dist/` |
| dashboard build | `npm run build:atlas-dashboard` | typechecks and builds the dashboard |
| dashboard typecheck | `npm run typecheck:atlas-dashboard` | checks dashboard TypeScript |
| local dashboard dev | `npm run dev:atlas-dashboard` | starts local dashboard development |
| versioning | `npm run set:version` | updates managed version files and creates the release commit |
| local pack | `npm run pack:local` | creates a self-contained npm tarball |
| global install | `npm install -g .` | installs `atlas-lab` globally |

### Main CLI commands

| Command | Role |
| --- | --- |
| `atlas-lab up` | starts `core` only |
| `atlas-lab up --with-ai-llm` | adds the AI LLM layer |
| `atlas-lab up --with-workbench` | adds the workbench layer |
| `atlas-lab up --with-ai-llm --with-workbench` | starts the full lab |
| `atlas-lab bootstrap` | reruns core bootstrap |
| `atlas-lab bootstrap --with-ai-llm` | reruns bootstrap and Ollama reconciliation |
| `atlas-lab doctor` | runs host and configuration checks |
| `atlas-lab doctor --smoke` | adds smoke tests for the core layer |
| `atlas-lab doctor --with-ai-llm --smoke` | adds smoke tests for the AI LLM layer |
| `atlas-lab status` | shows Compose/runtime status |
| `atlas-lab down` | stops the stack |
| `atlas-lab save-images` | exports Docker images to a single archive |
| `atlas-lab restore-images` | restores Docker images from an archive |
| `atlas-lab save-volumes` | exports Docker volumes to a single archive |
| `atlas-lab restore-volumes` | restores Docker volumes from an archive |

### Self-contained packaging

The global npm package already includes:

- Compose files
- `env/lab.env`
- gateway templates
- custom Dockerfiles
- dashboard sources
- bootstrap scripts

This allows `atlas-lab` to run without a local repository checkout.

```powershell
npm run pack:local
npm install -g .\cli-node-docker-atlas-lab-<version>.tgz
atlas-lab status
```

---

## 🖥️ Atlas Dashboard

The dashboard frontend lives in:

- [`apps/atlas-dashboard`](./apps/atlas-dashboard)

Its toolchain config lives in:

- [`config/atlas-dashboard/vite.config.ts`](./config/atlas-dashboard/vite.config.ts)
- [`config/atlas-dashboard/tsconfig.json`](./config/atlas-dashboard/tsconfig.json)

### Responsibilities

- visualize layer state
- surface operational links
- expose local markdown briefings
- show credentials and runtime notes
- support `it/en` localization

### Local dashboard development

```powershell
npm run dev:atlas-dashboard
```

Optional layers can be simulated with:

- `ATLAS_DASHBOARD_DEV_AI_LLM_ENABLED`
- `ATLAS_DASHBOARD_DEV_AI_IMAGE_ENABLED`
- `ATLAS_DASHBOARD_DEV_WORKBENCH_ENABLED`

---

## 💽 Backup and Restore

Atlas Lab supports backup and restore for both **Docker images** and **Docker volumes**.

### Features

- one `.tar.gz` archive for selected images
- one `.tar.gz` archive for selected volumes
- embedded manifest metadata
- realtime progress logs during export and restore
- support for `core`, `ai-llm`, and `workbench` layer selection

### Examples

```powershell
npm run dev -- save-images --with-ai-llm --with-workbench
npm run dev -- restore-images --input .\backups\images\atlas-lab-images.tar.gz
npm run dev -- down
npm run dev -- save-volumes --with-ai-llm --with-workbench
npm run dev -- restore-volumes --input .\backups\volumes\atlas-lab-volumes.tar.gz
```

Bootstrap is idempotent and reconciles Gitea plus Ollama when `ai-llm` is enabled.

---

## 🔐 Default Credentials

> ⚠️ These credentials are intended for trusted local environments and are configurable through `env/lab.env`.

| Service | URL / Endpoint | Credentials |
| --- | --- | --- |
| Atlas Dashboard | `https://localhost:8443/` | no dedicated login |
| Gitea | `https://localhost:8444/` | `root / RootGitea!2026` |
| Open WebUI | `https://localhost:8446/` | `root@openwebui.local / RootOpenWebUI!2026` |
| Ollama | `https://localhost:8447/` | gateway basic auth `root / RootOllama!2026` |
| PostgreSQL host-side | `localhost:15432` | `postgres / RootPostgresDev!2026` |

For DBeaver and other desktop PostgreSQL clients:

- host: `localhost`
- port: `15432`
- database: `lab`
- username: `postgres`
- password: `RootPostgresDev!2026`

---

## 📁 Repository Layout

| Area | Purpose | Paths |
| --- | --- | --- |
| CLI | application logic and commands | `src/`, `bin/` |
| dashboard | React frontend | `apps/atlas-dashboard`, `config/atlas-dashboard/` |
| Compose | layer orchestration | `infra/docker/compose*.yml` |
| images | Dockerfiles and startup scripts | `infra/docker/images/` |
| gateway | runtime templates and briefings | `config/gateway/templates/` |
| env | operational configuration | `env/lab.env` |
| repo scripts | versioning and support tooling | `scripts/` |

Key files:

- [`package.json`](./package.json)
- [`LICENSE`](./LICENSE)
- [`env/lab.env`](./env/lab.env)
- [`infra/docker/compose.yml`](./infra/docker/compose.yml)
- [`infra/docker/compose.ai-llm.yml`](./infra/docker/compose.ai-llm.yml)
- [`infra/docker/compose.workbench.yml`](./infra/docker/compose.workbench.yml)
- [`src/bin/atlas-lab.ts`](./src/bin/atlas-lab.ts)
- [`src/app/create-cli-app.ts`](./src/app/create-cli-app.ts)
- [`src/services/`](./src/services)
- [`config/gateway/templates/Caddyfile.template`](./config/gateway/templates/Caddyfile.template)
- [`config/gateway/templates/runtime/lab-config.json.template`](./config/gateway/templates/runtime/lab-config.json.template)
- [`infra/docker/images/gateway/bootstrap-gateway.sh`](./infra/docker/images/gateway/bootstrap-gateway.sh)

---

## 🩺 Troubleshooting

### Browser certificate warning

Expected behavior. The lab uses a self-signed certificate.

### `atlas-lab up` fails during port preflight

One of the configured lab ports (`8443-8447`, `8450-8453`, or `15432`) is occupied or excluded by the system.

```powershell
atlas-lab status
docker ps --format "table {{.Names}}\t{{.Ports}}\t{{.Status}}"
```

### `atlas-lab up --with-ai-llm` fails during GPU preflight

This is usually a Docker daemon GPU pass-through issue, not an Ollama issue.

```powershell
nvidia-smi -L
docker info
```

### Workbenches do not start

Workbenches are not part of the core layer. Start them explicitly:

```powershell
npm run dev -- up --with-workbench
```

### Open WebUI cannot see models

Verify:

- the AI LLM layer is enabled
- `OLLAMA_CHAT_MODEL`, `OLLAMA_EMBEDDING_MODEL`, and `OLLAMA_RUNTIME_MODELS` are set
- `https://localhost:8447/api/tags` responds
- the AI LLM bootstrap has run

---

## 🛡️ Security Notes

Atlas Lab is intended for:

- local use
- technical lab environments
- trusted networks
- development and prototyping

It is **not** an internet-facing production deployment hardened out of the box.

If you want to harden it further:

- move secrets into an external secret-management system
- replace the default certificate with one signed by an internal CA
- tighten network segmentation further
- define recurring backup policies
- audit logs and default credentials

---

## 📜 License

This project is distributed under the **MIT** license.

- license file: [`LICENSE`](./LICENSE)
- npm metadata: [`package.json`](./package.json)

---

## 🔗 Official References

### Docker

- Compose startup order: https://docs.docker.com/compose/how-tos/startup-order/
- Compose profiles: https://docs.docker.com/compose/how-tos/profiles/
- Compose networks: https://docs.docker.com/reference/compose-file/networks/
- Docker networking drivers: https://docs.docker.com/engine/network/drivers/

### Caddy

- Caddyfile concepts: https://caddyserver.com/docs/caddyfile
- Global options: https://caddyserver.com/docs/caddyfile/options
- Reverse proxy: https://caddyserver.com/docs/caddyfile/directives/reverse_proxy

### Gitea

- Install with Docker: https://docs.gitea.com/installation/install-with-docker
- Admin CLI: https://docs.gitea.com/administration/command-line

### Open WebUI

- Environment configuration: https://docs.openwebui.com/getting-started/env-configuration/
- Reverse proxy notes: https://docs.openwebui.com/tutorials/integrations/unraid

### Ollama

- FAQ: https://docs.ollama.com/faq
- API reference: https://github.com/ollama/ollama/blob/main/docs/api.md

### code-server

- Official docs: https://coder.com/docs/code-server/latest

### npm / Node.js

- package.json scripts: https://docs.npmjs.com/cli/v11/configuring-npm/package-json
- npm link: https://docs.npmjs.com/cli/v11/commands/npm-link
- npm pack: https://docs.npmjs.com/cli/v11/commands/npm-pack
- child_process: https://nodejs.org/api/child_process.html

---

## 🧾 In Short

Atlas Lab is a **complete local platform** with:

- an always-on core plane
- optional AI LLM and workbench layers
- a dark-first React dashboard
- a globally installable TypeScript CLI
- self-contained npm packaging
- structured backup and restore workflows
- MIT licensing
