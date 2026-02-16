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
  const aiEnabled = config.features.aiEnabled;
  const workbenchEnabled = config.features.workbenchEnabled;

  return {
    hero: {
      eyebrow: 'atlas control index',
      summary:
        'Pannello operativo unificato per repository, automazione e layer opzionali del lab. Core, AI e workbench vengono esposti separatamente su porte HTTPS dedicate di localhost.',
      titleLines: ['LAB', 'ATLAS'],
      pills: [
        { icon: FaLink, label: `deck locale ${config.lab.localUrl}` },
        { icon: FaLock, label: 'ingress solo https' },
        { icon: FaEarthEurope, label: `endpoint localhost ${config.lab.publicUrl}` },
        { icon: FaDatabase, label: 'persistenza su volumi' },
        { icon: aiEnabled ? FaBrain : FaCertificate, label: aiEnabled ? 'layer ai attivo' : 'layer ai opzionale' },
        { icon: workbenchEnabled ? FaTerminal : FaCertificate, label: workbenchEnabled ? 'workbench attivi' : 'workbench opzionali' }
      ],
      metrics: [
        { label: 'servizi core', value: 2 },
        { label: 'servizi ai', value: aiEnabled ? 2 : 0 },
        { label: 'nodi workbench', value: workbenchEnabled ? 5 : 0 },
        { label: 'gateway atlas', value: 1 }
      ]
    },
    operatingCharter: [
      'Gitea governa codice, review e flusso Git interno.',
      'n8n orchestra webhook, automazioni e job operativi.',
      "Open WebUI e Ollama restano in un layer AI opzionale, attivabile solo quando serve.",
      'I workbench code-server e Postgres vivono in un layer dedicato, separato dal core operativo.'
    ],
    accessNotes: [
      'Le credenziali root sono esposte qui e nel file config/env/lab.env.',
      'Nessun DNS o file hosts: tutti gli ingressi pubblici usano localhost con porte dedicate.',
      "n8n usa direttamente l'auth applicativa owner, senza doppio login al gateway.",
      "La CLI preinizializza l'owner, ma lascia disponibili i template ufficiali dentro l'app.",
      aiEnabled
        ? 'Il layer AI e attivo: Open WebUI e Ollama sono raggiungibili sulle loro porte dedicate.'
        : 'Il layer AI e spento: Open WebUI e Ollama non vengono avviati finche non abiliti --with-ai.',
      workbenchEnabled
        ? 'Il layer workbench e attivo: Postgres e gli ambienti code-server sono online.'
        : 'Il layer workbench e spento: gli ambienti browser-based restano opzionali e isolati.'
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
      }
    ],
    aiLayer: {
      activationCommand: 'atlas-lab up --with-ai',
      description:
        'Open WebUI e Ollama non fanno piu parte del bootstrap di default. Attivali solo quando ti servono UI conversazionale locale e inference GPU-backed.',
      enabled: aiEnabled,
      title: 'Layer AI'
    },
    aiServices: [
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
    workbenchLayer: {
      activationCommand: 'atlas-lab up --with-workbench',
      description:
        'I workbench restano in un layer distinto dal core. Attivali solo quando ti serve un ambiente browser-based o il Postgres condiviso.',
      enabled: workbenchEnabled,
      title: 'Layer Workbench'
    },
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
        body: 'Gitea e n8n restano il core sempre attivo; AI e workbench vengono invece abilitati per layer solo quando richiesti.',
        id: 'usage',
        label: 'core usage'
      },
      {
        body: 'apps-net, ai-net, data-net e workbench-net restano interne; i gateway pubblici vengono separati per layer e rimangono gli unici punti esposti verso il browser.',
        id: 'segmentation',
        label: 'segmentazione'
      }
    ]
  };
}
