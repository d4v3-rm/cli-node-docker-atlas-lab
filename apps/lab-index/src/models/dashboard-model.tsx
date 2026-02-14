import {
  FaBrain,
  FaCertificate,
  FaCodeBranch,
  FaDatabase,
  FaDiagramProject,
  FaEarthEurope,
  FaLink,
  FaLock,
  FaMicrochip,
  FaPython,
  FaRobot,
  FaTerminal
} from 'react-icons/fa6';
import { FaNodeJs } from 'react-icons/fa';
import type { DashboardViewModel } from '@/types/dashboard.types';
import type { LabRuntimeConfig } from '@/types/lab-config.types';

/**
 * Builds the UI view model from the gateway runtime configuration.
 */
export function createDashboardViewModel(config: LabRuntimeConfig): DashboardViewModel {
  return {
    hero: {
      eyebrow: 'atlas control index',
      summary:
        'Pannello operativo unificato per repository, automazione, AI locale e workbench opzionali. Il gateway espone ogni servizio su una porta HTTPS dedicata di localhost.',
      titleLines: ['LAB', 'ATLAS'],
      pills: [
        { icon: FaLink, label: `deck locale ${config.lab.localUrl}` },
        { icon: FaLock, label: 'ingress solo https' },
        { icon: FaEarthEurope, label: `endpoint localhost ${config.lab.publicUrl}` },
        { icon: FaDatabase, label: 'persistenza su volumi' },
        { icon: FaCertificate, label: 'certificato e credenziali in chiaro' }
      ],
      metrics: [
        { label: 'servizi core', value: 4 },
        { label: 'nodi workbench', value: 5 },
        { label: 'gateway atlas', value: 1 }
      ]
    },
    operatingCharter: [
      'Gitea governa codice, review e flusso Git interno.',
      'n8n orchestra webhook, automazioni e job operativi.',
      "Open WebUI e Ollama coprono interfaccia e inference locale per l'AI.",
      'I workbench code-server e Postgres restano su profilo dedicato e raggiungibili tramite briefing locale.'
    ],
    accessNotes: [
      'Le credenziali root sono esposte qui e nel file config/env/lab.env.',
      'Nessun DNS o file hosts: tutti gli ingressi pubblici usano localhost con porte dedicate.',
      "n8n usa direttamente l'auth applicativa owner, senza doppio login al gateway.",
      "La CLI preinizializza l'owner, ma lascia disponibili i template ufficiali dentro l'app.",
      'Ollama usa la GPU NVIDIA del host come backend predefinito per l inference locale.',
      'Postgres non ha UI pubblica e viene consumato soltanto dai workbench.'
    ],
    networkMap: {
      path: config.content.networkMapPath,
      title: 'Network Map'
    },
    services: [
      {
        action: {
          href: config.services.gitea.url,
          label: 'entra'
        },
        credentials: [
          { label: 'endpoint', value: config.services.gitea.url },
          { label: 'root user', value: config.services.gitea.rootUsername },
          { label: 'password', value: config.services.gitea.rootPassword },
          { label: 'email', value: config.services.gitea.rootEmail }
        ],
        description:
          'Repository Git, issue tracking e collaborazione tecnica interna. Punto di ingresso per codice, review e governance del progetto.',
        icon: FaCodeBranch,
        id: 'gitea',
        status: 'online',
        title: 'Gitea Forge'
      },
      {
        action: {
          href: config.services.n8n.url,
          label: 'entra'
        },
        credentials: [
          { label: 'endpoint', value: config.services.n8n.url },
          { label: 'accesso', value: 'login applicativo diretto' },
          { label: 'owner bootstrap', value: config.services.n8n.ownerName },
          { label: 'owner email', value: config.services.n8n.ownerEmail },
          { label: 'owner password', value: config.services.n8n.ownerPassword }
        ],
        description:
          'Motore di workflow e integrazione. Ideale per orchestrare webhook, job, pipeline applicative e connessioni tra servizi del lab.',
        icon: FaDiagramProject,
        id: 'n8n',
        note:
          "Primo accesso: entra direttamente con l'utente owner bootstrap senza Basic Auth al gateway. Il setup wizard iniziale viene saltato, ma i template restano disponibili dopo il login.",
        status: 'online',
        title: 'n8n Automation'
      },
      {
        action: {
          href: config.services.openWebUi.url,
          label: 'entra'
        },
        credentials: [
          { label: 'endpoint', value: config.services.openWebUi.url },
          { label: 'root name', value: config.services.openWebUi.rootName },
          { label: 'root email', value: config.services.openWebUi.rootEmail },
          { label: 'password', value: config.services.openWebUi.rootPassword }
        ],
        description:
          'Console conversazionale per modelli locali eseguiti tramite Ollama sulla GPU NVIDIA del host. Espone una UI operativa per prompt, test e flussi AI dal browser.',
        icon: FaRobot,
        id: 'open-webui',
        status: 'online',
        title: 'Open WebUI'
      },
      {
        action: {
          href: config.services.ollama.url,
          label: 'apri api'
        },
        credentials: [
          { label: 'endpoint', value: config.services.ollama.url },
          { label: 'gateway user', value: config.services.ollama.gatewayUser },
          { label: 'gateway password', value: config.services.ollama.gatewayPassword },
          { label: 'uso', value: 'API locale GPU-backed per modelli' }
        ],
        description:
          'Endpoint locale per inference LLM ed embeddings con accelerazione GPU NVIDIA. Serve i modelli consumati dal lab e puo essere interrogato direttamente come API protetta dal gateway.',
        icon: FaBrain,
        id: 'ollama',
        status: 'api',
        title: 'Ollama Core'
      }
    ],
    workbenches: [
      {
        briefing: {
          path: config.workbenches.node.briefingPath,
          title: 'Node Forge'
        },
        credentials: [
          { label: 'auth mode', value: 'password' },
          { label: 'root password', value: config.workbenches.node.password }
        ],
        description:
          'Workbench code-server dedicato a JavaScript, TypeScript, frontend e tooling npm, pnpm e yarn.',
        icon: FaNodeJs,
        id: 'node',
        status: 'code',
        title: 'Node Forge'
      },
      {
        briefing: {
          path: config.workbenches.python.briefingPath,
          title: 'Python Grid'
        },
        credentials: [
          { label: 'auth mode', value: 'password' },
          { label: 'root password', value: config.workbenches.python.password }
        ],
        description:
          'Workbench code-server per backend Python, automazioni, script operativi e tooling di progetto.',
        icon: FaPython,
        id: 'python',
        status: 'code',
        title: 'Python Grid'
      },
      {
        briefing: {
          path: config.workbenches.ai.briefingPath,
          title: 'AI Reactor'
        },
        credentials: [
          { label: 'auth mode', value: 'password' },
          { label: 'root password', value: config.workbenches.ai.password }
        ],
        description:
          'Workbench code-server con stack AI e data science per notebook, prototipi ML e pipeline locali.',
        icon: FaMicrochip,
        id: 'ai',
        status: 'code',
        title: 'AI Reactor'
      },
      {
        briefing: {
          path: config.workbenches.cpp.briefingPath,
          title: 'C++ Foundry'
        },
        credentials: [
          { label: 'auth mode', value: 'password' },
          { label: 'root password', value: config.workbenches.cpp.password }
        ],
        description:
          'Workbench code-server per sviluppo C/C++, compilazione nativa, debugging e profiling toolchain.',
        icon: FaTerminal,
        id: 'cpp',
        status: 'code',
        title: 'C++ Foundry'
      },
      {
        briefing: {
          path: config.workbenches.postgres.briefingPath,
          title: 'Postgres Vault'
        },
        credentials: [
          { label: 'host', value: config.workbenches.postgres.host },
          { label: 'porta', value: config.workbenches.postgres.port },
          { label: 'database', value: config.workbenches.postgres.database },
          { label: 'superuser', value: config.workbenches.postgres.superuser },
          { label: 'password', value: config.workbenches.postgres.password }
        ],
        description:
          'Server PostgreSQL dedicato a schema design, migrazioni, seed data, test relazionali e storage locale per i workbench.',
        icon: FaDatabase,
        id: 'postgres',
        note:
          'Nessuna UI web pubblica: i workbench ricevono gia PGHOST, PGPORT, PGDATABASE, PGUSER, PGPASSWORD e DATABASE_URL.',
        status: 'db',
        title: 'Postgres Vault'
      }
    ],
    footerCards: [
      {
        body: `Il deck resta raggiungibile da ${config.lab.localUrl}, mentre ogni servizio usa una porta HTTPS dedicata instradata dal gateway Caddy.`,
        id: 'routing',
        label: 'routing'
      },
      {
        body: 'Database, workspace, modelli, UI e certificati usano solo volumi Docker nominati.',
        id: 'persistence',
        label: 'persistenza'
      },
      {
        body: 'Gitea per codice, n8n per automazione, Open WebUI per chat AI, Ollama per inference locale e Postgres per il data plane dei workbench.',
        id: 'usage',
        label: 'core usage'
      },
      {
        body: 'apps-net, ai-net, data-net e workbench-net restano interne; il gateway rimane l\'unico punto esposto verso il browser.',
        id: 'segmentation',
        label: 'segmentazione'
      }
    ]
  };
}
