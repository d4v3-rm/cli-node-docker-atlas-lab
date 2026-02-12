# Atlas Lab

![Docker Compose](https://img.shields.io/badge/Docker%20Compose-v2-2496ED?logo=docker&logoColor=white)
![Gateway](https://img.shields.io/badge/Gateway-Caddy-1F2937?logo=caddy&logoColor=white)
![Ingress](https://img.shields.io/badge/Ingress-HTTPS%20Only-0F766E)
![Routing](https://img.shields.io/badge/Routing-localhost%20multiport-7C3AED)
![CLI](https://img.shields.io/badge/CLI-Node.js%20npm-3C873A?logo=nodedotjs&logoColor=white)
![Persistence](https://img.shields.io/badge/Persistence-Docker%20Volumes-CA8A04)

> Piattaforma self-hosted locale per repository, automazione, AI e workbench browser-based, esposta interamente su `localhost` con porte HTTPS dedicate, orchestrata da Docker Compose e governata da una CLI Node.js installabile anche come comando globale.

---

## Indice

- [Panoramica](#panoramica)
- [Perche Questa Architettura](#perche-questa-architettura)
- [Catalogo Servizi](#catalogo-servizi)
- [Mappa Porte E URL](#mappa-porte-e-url)
- [Architettura Di Rete](#architettura-di-rete)
- [Persistenza E Dati](#persistenza-e-dati)
- [Requisiti Host E Dipendenze](#requisiti-host-e-dipendenze)
- [CLI Node.js](#cli-nodejs)
- [Scaffolding Del Repository](#scaffolding-del-repository)
- [Quick Start](#quick-start)
- [Accessi E Credenziali](#accessi-e-credenziali)
- [Workbench Opzionali](#workbench-opzionali)
- [File Importanti Del Repository](#file-importanti-del-repository)
- [Comandi Utili](#comandi-utili)
- [Verifiche Consigliate](#verifiche-consigliate)
- [Troubleshooting](#troubleshooting)
- [Note Di Sicurezza](#note-di-sicurezza)
- [Fonti Ufficiali](#fonti-ufficiali)

---

## Panoramica

`cli-node-docker-atlas-lab` non e una singola applicazione. E un lab infrastrutturale locale che combina:

- un index grafico iniziale del lab, servito dal gateway, da cui aprire servizi, credenziali e asset operativi
- `Gitea` per repository Git, issue tracking e code review
- `n8n` per automazione e workflow
- `Open WebUI` come interfaccia AI
- `Ollama` per modelli locali ed embeddings
- `code-server` per ambienti di sviluppo browser-based
- `PostgreSQL` condiviso per i workbench
- `Caddy` come unico ingresso HTTPS
- `TypeScript CLI` su Node.js come strato operativo locale per start, bootstrap, verifiche e packaging

L'obiettivo e avere una piattaforma:

- self-hosted
- locale
- portabile
- leggibile
- completamente HTTPS
- persistente su volumi Docker
- senza DNS custom
- senza modifiche al file `hosts`

---

## Perche Questa Architettura

Il progetto e passato attraverso tre modelli:

1. subpath dietro reverse proxy
2. host dedicati tipo `*.lab.home.arpa`
3. assetto finale `localhost + porte HTTPS dedicate`

La scelta finale e la piu pragmatica per un lab locale:

- niente DNS interno
- niente modifica del file `hosts`
- niente problemi tipici dei frontend moderni dietro subpath
- URL semplici da ricordare
- reverse proxy unico e leggibile
- comportamento coerente su una macchina singola

In parallelo, il bootstrap non usa piu container Compose di init. Al loro posto c'e una CLI Node.js che:

- avvia la stack
- riallinea Gitea e Ollama
- pulisce residui legacy
- puo essere eseguita da sorgente
- puo essere buildata
- puo essere installata globalmente in stile CLI npm

---

## Catalogo Servizi

### Servizi core

| Servizio | Ruolo | Esposto | Note |
| --- | --- | --- | --- |
| Deck | index grafico e dashboard operativa del lab | si | mostra servizi, credenziali e link |
| Gitea | forge Git interno | si | repository, issue, review |
| n8n | automazione e workflow | si | login applicativo diretto |
| Open WebUI | interfaccia AI | si | collegata a Ollama |
| Ollama | API per modelli locali | si | protetto da auth gateway |

### Workbench opzionali

| Servizio | Ruolo | Esposto | Profilo |
| --- | --- | --- | --- |
| Node Forge | sviluppo JS/TS/Node | si | `workbench` |
| Python Grid | backend Python e scripting | si | `workbench` |
| AI Reactor | AI, notebook, data work | si | `workbench` |
| C++ Foundry | toolchain C/C++ | si | `workbench` |
| Postgres Vault | database condiviso | no UI web | `workbench` |

---

## Mappa Porte E URL

Tutti gli ingressi pubblici usano HTTPS su `localhost`.

| Servizio | URL |
| --- | --- |
| Deck | `https://localhost:8443/` |
| Gitea | `https://localhost:8444/` |
| n8n | `https://localhost:8445/` |
| Open WebUI | `https://localhost:8446/` |
| Ollama | `https://localhost:8447/` |
| Node Forge | `https://localhost:8450/` |
| Python Grid | `https://localhost:8451/` |
| AI Reactor | `https://localhost:8452/` |
| C++ Foundry | `https://localhost:8453/` |

### Vantaggi pratici

- nessun `hosts`
- nessun DNS interno
- nessun subpath fragile
- debug immediato
- bookmark semplici

---

## Architettura Di Rete

La topologia e segmentata deliberatamente.

| Rete | Tipo | Scopo |
| --- | --- | --- |
| `edge-net` | esposta | collega il gateway alle porte pubblicate |
| `apps-net` | interna | Gitea, n8n, Open WebUI |
| `ai-net` | interna | Ollama e Open WebUI |
| `data-net` | interna | MariaDB e servizi dati |
| `workbench-net` | interna | Postgres e workbench |
| `services-egress-net` | egress | uscita selettiva per servizi core |
| `workbench-egress-net` | egress | uscita selettiva per i workbench |

Principio operativo:

- solo `gateway` pubblica porte sulla macchina host
- i servizi applicativi restano su reti Docker
- il browser passa sempre da Caddy

---

## Persistenza E Dati

Il progetto non usa bind mount del repository per i dati runtime. La persistenza e su volumi Docker nominati.

| Volume | Contenuto |
| --- | --- |
| `gateway-certs` | certificati TLS del lab |
| `gateway-config` | configurazione runtime del gateway |
| `gateway-site` | dashboard HTML, markdown e asset |
| `gateway-data` | dati runtime Caddy |
| `gitea-data` | dati applicativi Gitea |
| `gitea-db` | dati MariaDB |
| `n8n-data` | dati applicativi n8n |
| `ollama-data` | modelli e cache Ollama |
| `open-webui-data` | dati applicativi Open WebUI |
| `postgres-dev-data` | dati PostgreSQL |
| `node-dev-home` / `node-dev-workspace` | home e workspace Node |
| `python-dev-home` / `python-dev-workspace` | home e workspace Python |
| `ai-dev-home` / `ai-dev-workspace` | home e workspace AI |
| `cpp-dev-home` / `cpp-dev-workspace` | home e workspace C++ |

Se ricrei i container:

- i dati restano
- Gitea non perde utenti e repository
- n8n conserva i workflow
- Ollama conserva i modelli
- Open WebUI conserva il proprio stato
- i workbench mantengono home e workspace

Se rimuovi i volumi, azzeri lo stato persistente.

---

## Requisiti Host E Dipendenze

### Requisiti software obbligatori

- `Docker Desktop` con `Docker Compose v2`
- `Node.js >= 20`
- `npm`
- un terminale da cui eseguire `docker`, `node`, `npm`

### Dipendenze CLI reali

La CLI del progetto:

- vive in [package.json](./package.json), [src/bin/atlas-lab.ts](./src/bin/atlas-lab.ts) e [src/app/create-cli-app.ts](./src/app/create-cli-app.ts)
- usa TypeScript con `tsx` in sviluppo e `tsup` per la build distributable
- usa librerie dedicate per parsing, validazione, task rendering e output CLI
- si appoggia in particolare a `commander`, `listr2`, `zod`, `find-up`, `got`, `consola`, `cli-table3` e `p-wait-for`
- richiede `npm install` prima del primo `npm run dev`

### Requisiti host consigliati

- CPU: almeno `4 vCPU`
- RAM: almeno `8 GB`, meglio `12-16 GB` se usi anche workbench e Ollama
- Disco: almeno `20 GB` liberi

### Porte host richieste

Devono essere libere:

- `8443`
- `8444`
- `8445`
- `8446`
- `8447`
- `8450`
- `8451`
- `8452`
- `8453`

Se una di queste porte e occupata, `atlas-lab up` fallira subito durante il preflight host, prima di far partire Docker Compose.

### Cosa non serve sul sistema host

Non servono:

- DNS locale
- modifica del file `hosts`
- reverse proxy esterno
- PostgreSQL installato sul sistema host
- MariaDB installato sul sistema host
- pnpm o yarn installati globalmente

### Nota su PowerShell e npm

Su Windows, in shell PowerShell con execution policy restrittiva, `npm` puo essere bloccato per via dello shim `npm.ps1`.

In quel caso usa:

```powershell
npm.cmd --version
```

Lo stesso vale per il binario globale della CLI:

```powershell
atlas-lab.cmd status
```

### Nota TLS locale

Il lab usa un certificato self-signed per `localhost`.

Quindi:

- il browser puo mostrare un warning al primo accesso
- puoi proseguire temporaneamente
- oppure puoi importare il certificato del lab nel trust store locale

---

## CLI TypeScript

La CLI TypeScript sostituisce il vecchio bootstrap Python e i vecchi servizi Compose di init.

### Obiettivi

- niente container `Exited (0)` per bootstrap
- niente immagini di init tenute per errore nel runtime stabile
- flusso coerente tra sviluppo locale e uso operativo
- supporto a build e installazione globale locale

### Modalita supportate

| Modalita | Comando | Scopo |
| --- | --- | --- |
| dev mode | `npm run dev -- up` | usa `tsx` sulla CLI TypeScript sorgente |
| build | `npm run build` | bundle ESM della CLI in `dist/` con `tsup` |
| pack locale | `npm run pack:local` | crea un tarball npm locale |
| install globale | `npm install -g .` | installa `atlas-lab` globalmente dalla repo |
| link globale | `npm link` | collega la repo come CLI globale durante lo sviluppo |

### Log di sviluppo

Quando esegui la CLI da sorgente con `npm run dev`, viene creato automaticamente un log file per sessione in `logs/dev/atlas-lab-<timestamp>.log`.

La build distributable e la CLI installata globalmente non scrivono log su filesystem.

### Layout rapido della CLI

- [bin/atlas-lab](./bin/atlas-lab): launcher minimale del pacchetto npm globale
- [src/bin/atlas-lab.ts](./src/bin/atlas-lab.ts): entrypoint TypeScript della CLI
- [src/app/](./src/app): bootstrap dell'app Commander
- [src/commands/](./src/commands): registrazione dei comandi
- [src/config/lab-env.schema.ts](./src/config/lab-env.schema.ts): schema Zod della configurazione `config/env/lab.env`
- [src/config/repository-layout.ts](./src/config/repository-layout.ts): contratto dei path infrastrutturali della repo
- [src/services/](./src/services): logica operativa del lab
- [src/types/](./src/types): tipizzazioni dedicate con suffisso `*.types.ts`
- [src/ui/](./src/ui): banner, pannelli e summary grafici
- [src/utils/](./src/utils): helper HTTP e process execution

---

## Scaffolding Del Repository

La root del repository resta volutamente leggera. Le responsabilita sono separate per dominio:

| Dominio | Scopo | Percorsi principali |
| --- | --- | --- |
| codice applicativo | CLI TypeScript, command layer, servizi e tipizzazioni | `src/`, `bin/` |
| infrastruttura Docker | orchestrazione Compose, Dockerfile e script di immagine | `infra/docker/compose.yml`, `infra/docker/images/` |
| configurazione operativa | env del lab, template gateway e briefing locali | `config/env/lab.env`, `config/gateway/templates/` |
| tooling repo | packaging, build e script di supporto | `tools/`, `scripts/`, `package.json` |

Regola pratica:

- se cambi comportamento CLI o logica applicativa, lavori in `src/`
- se cambi build container o orchestrazione, lavori in `infra/docker/`
- se cambi credenziali, porte, template o contenuti gateway, lavori in `config/`

La CLI usa questo layout come contratto esplicito: risolve sempre `infra/docker/compose.yml` e `config/env/lab.env`, quindi non dipende piu da file infrastrutturali sparsi in root.

### Comandi della CLI

| Comando | Ruolo |
| --- | --- |
| `atlas-lab up` | avvia Compose, bootstrap Gitea/Ollama e pulisce residui legacy |
| `atlas-lab up --build` | rebuild + start + bootstrap |
| `atlas-lab up --with-workbench` | include anche il profilo `workbench` |
| `atlas-lab bootstrap` | riesegue solo il bootstrap |
| `atlas-lab doctor` | controlla requisiti host e configurazione Compose |
| `atlas-lab doctor --smoke` | aggiunge smoke test su endpoint e integrazioni |
| `atlas-lab status` | mostra lo stato Compose |
| `atlas-lab down` | ferma la stack |

### Cosa fa il bootstrap

1. aspetta che `gitea` sia `healthy`
2. crea o riallinea l'utente root di Gitea
3. aspetta che `ollama` sia `healthy`
4. controlla il modello embeddings configurato
5. controlla il modello chat configurato
6. esegue il pull dei modelli mancanti
7. rimuove l'eventuale immagine legacy `cli-node-docker-atlas-lab-ollama-init:latest`

Il bootstrap e idempotente.

### Come funziona la global install

La CLI installata globalmente non opera sulla directory del pacchetto npm installato. Cerca il progetto:

- nella directory corrente
- oppure in un path esplicito passato con `--project-dir`

Esempio:

```powershell
atlas-lab status --project-dir C:\Users\User\Development\repos-review\cli-node-docker-atlas-lab
```

---

## Quick Start

### 1. Verifica il minimo indispensabile

```powershell
docker version
docker compose version
node --version
npm --version
```

Se `npm` e bloccato in PowerShell:

```powershell
npm.cmd --version
```

### 2. Controlla la configurazione

La configurazione centrale e in [`config/env/lab.env`](./config/env/lab.env).

Le sezioni principali sono:

- porte pubbliche
- versioni immagini
- credenziali root
- configurazione Open WebUI / Ollama
- workbench
- PostgreSQL

### 3. Installa le dipendenze della CLI

```powershell
npm install
```

Su PowerShell restrittivo:

```powershell
npm.cmd install
```

### 4. Avvio consigliato in dev mode

```powershell
npm run dev -- up
```

Su PowerShell restrittivo:

```powershell
npm.cmd run dev -- up
```

Questo e il flusso consigliato durante lo sviluppo della CLI e della stack.

### 5. Avvio con workbench inclusi

```powershell
npm run dev -- up --with-workbench
```

### 6. Build del pacchetto

```powershell
npm run build
```

La build genera:

- `dist/bin/atlas-lab.js`
- `dist/**/*.d.ts`
- `dist/**/*.js.map`

### 7. Installazione globale locale

```powershell
npm install -g .
```

Poi puoi usare:

```powershell
atlas-lab up
atlas-lab doctor --smoke
atlas-lab status
```

Su PowerShell restrittivo:

```powershell
npm.cmd install -g .
atlas-lab.cmd up
```

### 8. Modalita separata start/bootstrap

```powershell
docker compose --file infra/docker/compose.yml --env-file config/env/lab.env up -d
npm run dev -- bootstrap
```

### 8. Apri l'index grafico del lab

```text
https://localhost:8443/
```

L'index grafico del lab e pubblicato dal gateway sulla porta `8443`.

Dal deck puoi:

- vedere i servizi attivi
- leggere la descrizione di ogni servizio
- consultare le credenziali operative
- aprire i servizi core in una nuova tab
- aprire i briefing markdown dei workbench
- scaricare il certificato del lab

---

## Accessi E Credenziali

Le credenziali operative sono in [`config/env/lab.env`](./config/env/lab.env) e sono riportate anche nel deck HTML.

### Index grafico del lab

- URL: `https://localhost:8443/`
- porta host: `8443`
- ruolo: homepage grafica del lab con link rapidi, credenziali operative e accesso ai servizi

### Gitea

- URL: `https://localhost:8444/`
- accesso: login applicativo
- bootstrap admin: `root`

### n8n

- URL: `https://localhost:8445/`
- accesso: login applicativo diretto
- owner bootstrap: `root@n8n.local`

### Open WebUI

- URL: `https://localhost:8446/`
- accesso: login applicativo
- signup: disabilitato
- admin iniziale definito via env
- usa automaticamente il modello chat configurato in `OLLAMA_CHAT_MODEL`

### Ollama

- URL: `https://localhost:8447/`
- accesso: basic auth gateway
- uso principale: API per inference e embeddings
- bootstrap iniziale: `OLLAMA_EMBEDDING_MODEL` + `OLLAMA_CHAT_MODEL`

### Workbench

Ogni workbench usa:

- `code-server`
- autenticazione `password`
- home persistente
- workspace persistente

Il deck non apre direttamente i workbench: mostra prima il briefing locale.

---

## Workbench Opzionali

I workbench non fanno parte del core obbligatorio. Stanno dietro profilo Compose `workbench`.

### Avvio

```powershell
docker compose --file infra/docker/compose.yml --env-file config/env/lab.env --profile workbench up -d
```

Oppure tramite CLI:

```powershell
npm run dev -- up --with-workbench
```

### Node Forge

- URL: `https://localhost:8450/`
- orientato a: JavaScript, TypeScript, frontend, tooling Node
- stack: Node, npm, pnpm, yarn

### Python Grid

- URL: `https://localhost:8451/`
- orientato a: backend Python, script, utility, integrazioni

### AI Reactor

- URL: `https://localhost:8452/`
- orientato a: AI, ML, data science, notebook e prototipi

### C++ Foundry

- URL: `https://localhost:8453/`
- orientato a: C/C++, toolchain native, build e debug

### Postgres Vault

- nessuna UI web pubblica
- host interno: `postgres-dev`
- porta interna: `5432`
- database condiviso dai workbench

Variabili preconfigurate nei workbench:

- `PGHOST`
- `PGPORT`
- `PGDATABASE`
- `PGUSER`
- `PGPASSWORD`
- `DATABASE_URL`

---

## File Importanti Del Repository

| File | Ruolo |
| --- | --- |
| [infra/docker/compose.yml](./infra/docker/compose.yml) | orchestrazione principale del lab |
| [infra/docker/images/](./infra/docker/images) | Dockerfile e script di build dei servizi |
| [package.json](./package.json) | metadata npm, scripts e comando binario |
| [config/env/lab.env](./config/env/lab.env) | naming, URL, versioni e credenziali operative |
| [bin/atlas-lab](./bin/atlas-lab) | launcher npm minimale che delega alla build |
| [src/bin/atlas-lab.ts](./src/bin/atlas-lab.ts) | entrypoint TypeScript della CLI |
| [src/app/create-cli-app.ts](./src/app/create-cli-app.ts) | bootstrap dell'app Commander |
| [src/commands/](./src/commands) | registrazione dei comandi CLI |
| [src/config/lab-env.schema.ts](./src/config/lab-env.schema.ts) | validazione Zod della `lab.env` |
| [src/config/repository-layout.ts](./src/config/repository-layout.ts) | contratto dei path top-level della repo |
| [src/services/](./src/services) | logica operativa del lab |
| [src/types/](./src/types) | tipizzazioni condivise `*.types.ts` |
| [src/ui/](./src/ui) | output CLI, banner e summary |
| [src/utils/](./src/utils) | helper HTTP e process execution |
| [config/gateway/templates/Caddyfile.template](./config/gateway/templates/Caddyfile.template) | routing localhost multi-porta |
| [config/gateway/templates/lab-index.html.template](./config/gateway/templates/lab-index.html.template) | dashboard HTML del lab |
| [infra/docker/images/gateway/bootstrap-gateway.sh](./infra/docker/images/gateway/bootstrap-gateway.sh) | rendering template, cert e bootstrap gateway |
| [config/gateway/templates/content/network-map.md.template](./config/gateway/templates/content/network-map.md.template) | topologia pubblica del lab |
| [config/gateway/templates/content/node-dev.md.template](./config/gateway/templates/content/node-dev.md.template) | briefing Node Forge |
| [config/gateway/templates/content/python-dev.md.template](./config/gateway/templates/content/python-dev.md.template) | briefing Python Grid |
| [config/gateway/templates/content/ai-dev.md.template](./config/gateway/templates/content/ai-dev.md.template) | briefing AI Reactor |
| [config/gateway/templates/content/cpp-dev.md.template](./config/gateway/templates/content/cpp-dev.md.template) | briefing C++ Foundry |
| [config/gateway/templates/content/postgres-dev.md.template](./config/gateway/templates/content/postgres-dev.md.template) | briefing Postgres Vault |
| [infra/docker/images/n8n/Dockerfile](./infra/docker/images/n8n/Dockerfile) | immagine custom n8n con trust store corretto |
| [infra/docker/images/n8n-runners/Dockerfile](./infra/docker/images/n8n-runners/Dockerfile) | immagine custom runners n8n |
| [infra/docker/images/ollama/Dockerfile](./infra/docker/images/ollama/Dockerfile) | immagine custom minima Ollama per probe puliti |

---

## Comandi Utili

### Dev mode

```powershell
npm run dev -- up
npm run dev -- bootstrap
npm run dev -- doctor --smoke
npm run dev -- status
```

### Build e packaging

```powershell
npm run build
npm run pack:local
```

### Installazione globale locale

```powershell
npm install -g .
atlas-lab up
atlas-lab status
atlas-lab doctor --smoke
```

### Link globale per sviluppo

```powershell
npm link
atlas-lab status
```

### Docker Compose diretto

```powershell
docker compose --file infra/docker/compose.yml --env-file config/env/lab.env ps -a
docker compose --file infra/docker/compose.yml --env-file config/env/lab.env config
docker compose --file infra/docker/compose.yml --env-file config/env/lab.env logs -f
docker compose --file infra/docker/compose.yml --env-file config/env/lab.env logs -f gateway
docker compose --file infra/docker/compose.yml --env-file config/env/lab.env logs -f open-webui
docker compose --file infra/docker/compose.yml --env-file config/env/lab.env logs -f n8n
docker compose --file infra/docker/compose.yml --env-file config/env/lab.env logs -f gitea
```

### Stop

```powershell
atlas-lab down
```

### Stop con workbench

```powershell
docker compose --file infra/docker/compose.yml --env-file config/env/lab.env --profile workbench down
```

---

## Verifiche Consigliate

### Check rapido via CLI

```powershell
npm run dev -- doctor
npm run dev -- doctor --smoke
```

### Endpoint deck

```powershell
curl.exe -sk https://localhost:8443/ -o NUL -w "%{http_code}"
```

### Endpoint Gitea

```powershell
curl.exe -sk https://localhost:8444/ -o NUL -w "%{http_code}"
```

### Endpoint n8n

```powershell
curl.exe -sk https://localhost:8445/ -o NUL -w "%{http_code}"
```

### Endpoint Open WebUI

```powershell
curl.exe -sk https://localhost:8446/ -o NUL -w "%{http_code}"
```

### Endpoint Ollama

```powershell
curl.exe -sk -u root:RootOllama!2026 https://localhost:8447/api/tags
```

### Stato health

```powershell
atlas-lab status
```

Atteso:

- `gitea`, `gitea-db`, `n8n`, `n8n-runners`, `ollama`, `open-webui` in salute
- nessun servizio di init presente

---

## Troubleshooting

### Il deck apre ma un servizio non risponde

Controlla:

1. `atlas-lab status`
2. `docker compose --file infra/docker/compose.yml --env-file config/env/lab.env logs -f <servizio>`
3. che la porta del servizio sia libera e corretta

### Il browser mostra warning certificato

Normale: il lab usa un certificato self-signed.

Puoi:

- accettarlo temporaneamente
- oppure scaricare `/assets/lab.crt` dal deck e importarlo nel trust store locale

### Non vedo l'utente root di Gitea o il modello Ollama

Rilancia il bootstrap:

```powershell
npm run dev -- bootstrap
```

Oppure con CLI globale:

```powershell
atlas-lab bootstrap
```

### `npm` non funziona in PowerShell

Usa gli shim `.cmd`:

```powershell
npm.cmd run dev -- doctor
atlas-lab.cmd status
```

### `atlas-lab up` fallisce sul preflight porte

La CLI controlla prima le porte pubbliche del gateway e dei workbench.

Se vedi un errore tipo `Host port preflight failed`, significa che una o piu porte tra `8443-8453` sono gia occupate da un'altra stack o da un altro processo locale.

Controlla:

```powershell
atlas-lab status
docker ps --format "table {{.Names}}\t{{.Ports}}\t{{.Status}}"
```

Poi libera le porte in uno di questi modi:

- ferma la stack Atlas Lab gia presente con `atlas-lab down`
- ferma l'altra stack Docker che pubblica le stesse porte
- cambia le porte in `config/env/lab.env`

### I workbench non compaiono in `docker compose up`

Normale: stanno dietro profilo Compose.

Usa:

```powershell
docker compose --file infra/docker/compose.yml --env-file config/env/lab.env --profile workbench up -d
```

Oppure:

```powershell
npm run dev -- up --with-workbench
```

### Open WebUI parte ma non vede i modelli

Controlla:

- `atlas-lab status`
- `docker compose --file infra/docker/compose.yml --env-file config/env/lab.env logs open-webui`
- `docker compose --file infra/docker/compose.yml --env-file config/env/lab.env logs ollama`
- la risposta di `https://localhost:8447/api/tags`
- che `OLLAMA_CHAT_MODEL` e `OLLAMA_EMBEDDING_MODEL` siano valorizzati in `config/env/lab.env`
- `npm run dev -- doctor --smoke`

Se hai cambiato i modelli configurati, riesegui:

```powershell
npm run dev -- bootstrap --skip-gitea
```

### n8n continua a chiedere accesso o sembra respingere il login

Controlla:

- `curl.exe -sk https://localhost:8445/ -o NUL -w "%{http_code}"` deve restituire `200`
- usa l'owner bootstrap `root@n8n.local / RootN8NApp!2026`
- se hai dati persistenti da tentativi precedenti, verifica lo stato utente in `n8n-data`

---

## Note Di Sicurezza

Questo repository e pensato per:

- uso locale
- laboratorio tecnico
- rete interna controllata

Non e un deployment internet-facing gia hardenizzato.

Punti importanti:

- credenziali locali presenti in `config/env/lab.env`
- certificato TLS self-signed
- servizi AI e automazione pensati per ambiente fidato
- gateway come singolo punto di esposizione

Se vuoi irrigidire ulteriormente il lab, i passi sensati sono:

- secret management esterno
- certificati firmati da una CA interna
- segmentazione ancora piu stretta
- backup esplicito dei volumi
- audit dei log e delle credenziali di default

---

## Fonti Ufficiali

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

- Installation with Docker: https://docs.gitea.com/installation/install-with-docker
- Command line admin: https://docs.gitea.com/administration/command-line

### n8n

- Environment variables overview: https://docs.n8n.io/hosting/configuration/environment-variables/
- Deployment variables: https://docs.n8n.io/hosting/configuration/environment-variables/deployment/
- Configuration methods: https://docs.n8n.io/hosting/configuration/configuration-methods/
- Hardening task runners: https://docs.n8n.io/hosting/securing/hardening-task-runners/
- SSL behind reverse proxy: https://docs.n8n.io/hosting/securing/set-up-ssl/

### Open WebUI

- Environment configuration: https://docs.openwebui.com/getting-started/env-configuration/
- Reverse proxy notes: https://docs.openwebui.com/tutorials/integrations/unraid

### Ollama

- FAQ and networking: https://docs.ollama.com/faq
- API reference: https://github.com/ollama/ollama/blob/main/docs/api.md

### code-server

- Official docs: https://coder.com/docs/code-server/latest

### npm e Node.js CLI

- package.json scripts: https://docs.npmjs.com/cli/v11/configuring-npm/package-json
- npm link: https://docs.npmjs.com/cli/v11/commands/npm-link
- npm pack: https://docs.npmjs.com/cli/v11/commands/npm-pack
- Node.js child_process: https://nodejs.org/api/child_process.html
- Node.js util.parseArgs: https://nodejs.org/api/util.html#utilparseargsconfig

---

In una frase: questo progetto e un lab locale self-hosted con servizi core, workbench opzionali e una CLI Node.js che consente sia sviluppo diretto sia packaging e installazione globale in stile npm.
