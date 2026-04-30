import type { TFunction } from 'i18next';
import type { DashboardTone } from '@/entities/dashboard';
import type { LabRuntimeConfig } from '@/entities/runtime-config';
import type {
  NetworkGraphLinkViewModel,
  NetworkGraphNodeViewModel,
  NetworkGraphViewModel
} from './network-graph.types';

const networkGraphPositionSpread = Object.freeze({
  x: 1.34,
  y: 1.16,
  z: 1.52
});

export function createNetworkGraphViewModel(
  config: LabRuntimeConfig,
  t: TFunction
): NetworkGraphViewModel {
  const aiActive = config.features.aiLlmEnabled;
  const workbenchActive = config.features.workbenchEnabled;
  const nodes: NetworkGraphNodeViewModel[] = [
    createNode({
      active: true,
      description: t('networkMapDialog.gatewayBody'),
      id: 'gateway',
      kind: 'gateway',
      labels: [
        t('networkMapDialog.labels.edge'),
        t('networkMapDialog.labels.https'),
        config.lab.publicUrl
      ],
      position: [0, 0, 0],
      title: t('networkMapDialog.gatewayTitle'),
      tone: 'neutral'
    }),
    createNode({
      active: true,
      description: t('networkMapDialog.deckBody'),
      id: 'deck',
      kind: 'service',
      labels: [
        config.lab.localUrl,
        t('networkMapDialog.labels.browser'),
        t('networkMapDialog.labels.controlRoom')
      ],
      position: [0, 0, 34],
      title: t('networkMapDialog.deckTitle'),
      tone: 'core'
    }),
    createNode({
      active: true,
      description: t('networkMapDialog.coreLayerBody'),
      id: 'core-layer',
      kind: 'layer',
      labels: [
        t('networkMapDialog.labels.alwaysOn'),
        t('networkMapDialog.labels.controlLayer'),
        t('cards.tones.core')
      ],
      position: [-46, 8, -14],
      title: t('cards.tones.core'),
      tone: 'core'
    }),
    createNode({
      active: true,
      description: t('dashboard.services.gitLab.description'),
      id: 'gitlab',
      kind: 'service',
      labels: [
        config.services.gitLab.url,
        t('values.alwaysOnForge'),
        t('networkMapDialog.labels.https')
      ],
      position: [-82, 28, 8],
      title: t('dashboard.services.gitLab.title'),
      tone: 'core'
    }),
    createNode({
      active: true,
      description: t('dashboard.services.bookStack.description'),
      id: 'bookstack',
      kind: 'service',
      labels: [
        config.services.bookStack.url,
        t('values.knowledgeBase'),
        t('networkMapDialog.labels.browser')
      ],
      position: [-44, -42, 28],
      title: t('dashboard.services.bookStack.title'),
      tone: 'core'
    }),
    createNode({
      active: true,
      description: t('dashboard.services.penpot.description'),
      id: 'penpot',
      kind: 'service',
      labels: [
        config.services.penpot.url,
        t('values.designCollaboration'),
        t('networkMapDialog.labels.browser')
      ],
      position: [-22, -4, -38],
      title: t('dashboard.services.penpot.title'),
      tone: 'core'
    }),
    createNode({
      active: aiActive,
      description: t('networkMapDialog.aiLayerBody'),
      id: 'ai-layer',
      kind: 'layer',
      labels: [
        aiActive
          ? t('networkMapDialog.statusActive')
          : t('networkMapDialog.statusOptional'),
        t('networkMapDialog.labels.optional'),
        t('cards.tones.ai')
      ],
      position: [48, 28, -12],
      title: t('cards.tones.ai'),
      tone: 'ai'
    }),
    createNode({
      active: aiActive,
      description: t('dashboard.aiServices.openWebUi.description'),
      id: 'open-webui',
      kind: 'service',
      labels: [
        config.services.openWebUi.url,
        t('values.browserConsole'),
        t('networkMapDialog.labels.browser')
      ],
      position: [82, 36, 10],
      title: t('dashboard.aiServices.openWebUi.title'),
      tone: 'ai'
    }),
    createNode({
      active: aiActive,
      description: t('dashboard.aiServices.ollama.description'),
      id: 'ollama',
      kind: 'service',
      labels: [
        config.services.ollama.url,
        t('values.localInferenceApi'),
        t('networkMapDialog.labels.gpu')
      ],
      position: [56, 52, -34],
      title: t('dashboard.aiServices.ollama.title'),
      tone: 'ai'
    }),
    createNode({
      active: aiActive,
      description: t('dashboard.aiServices.n8n.description'),
      id: 'n8n',
      kind: 'service',
      labels: [
        config.services.n8n.url,
        t('values.workflowControl'),
        t('networkMapDialog.labels.automation')
      ],
      position: [24, 8, -34],
      title: t('dashboard.aiServices.n8n.title'),
      tone: 'ai'
    }),
    createNode({
      active: workbenchActive,
      description: t('networkMapDialog.workbenchLayerBody'),
      id: 'workbench-layer',
      kind: 'layer',
      labels: [
        workbenchActive
          ? t('networkMapDialog.statusActive')
          : t('networkMapDialog.statusOptional'),
        t('networkMapDialog.labels.optional'),
        t('cards.tones.workbench')
      ],
      position: [42, -34, -12],
      title: t('cards.tones.workbench'),
      tone: 'workbench'
    }),
    createNode({
      active: workbenchActive,
      description: t('dashboard.workbenches.node.description'),
      id: 'node-workbench',
      kind: 'service',
      labels: [
        config.workbenches.node.url,
        t('values.browserWorkspace'),
        t('networkMapDialog.labels.workspace')
      ],
      position: [76, -8, 12],
      title: t('dashboard.workbenches.node.title'),
      tone: 'workbench'
    }),
    createNode({
      active: workbenchActive,
      description: t('dashboard.workbenches.python.description'),
      id: 'python-workbench',
      kind: 'service',
      labels: [
        config.workbenches.python.url,
        t('values.browserWorkspace'),
        t('networkMapDialog.labels.workspace')
      ],
      position: [64, -58, -24],
      title: t('dashboard.workbenches.python.title'),
      tone: 'workbench'
    }),
    createNode({
      active: workbenchActive,
      description: t('dashboard.workbenches.postgres.description'),
      id: 'postgres',
      kind: 'service',
      labels: [
        `${config.workbenches.postgres.host}:${config.workbenches.postgres.port}`,
        t('values.sharedDatabase'),
        t('networkMapDialog.labels.hostTcp')
      ],
      position: [18, -54, 20],
      title: t('dashboard.workbenches.postgres.title'),
      tone: 'workbench'
    }),
    createNode({
      active: workbenchActive,
      description: t('networkMapDialog.hostAccessBody'),
      id: 'host-access',
      kind: 'host',
      labels: [
        `${config.workbenches.postgres.internalHost}:${config.workbenches.postgres.internalPort}`,
        `${config.workbenches.postgres.host}:${config.workbenches.postgres.port}`,
        t('networkMapDialog.labels.sharedData')
      ],
      position: [74, -78, 42],
      title: t('networkMapDialog.hostAccessTitle'),
      tone: 'neutral'
    })
  ];
  const links: NetworkGraphLinkViewModel[] = [
    createLink('gateway', 'deck', 'core', true),
    createLink('gateway', 'core-layer', 'core', true),
    createLink('core-layer', 'gitlab', 'core', true),
    createLink('core-layer', 'bookstack', 'core', true),
    createLink('core-layer', 'penpot', 'core', true),
    createLink('gateway', 'ai-layer', 'ai', aiActive),
    createLink('ai-layer', 'open-webui', 'ai', aiActive),
    createLink('ai-layer', 'ollama', 'ai', aiActive),
    createLink('ai-layer', 'n8n', 'ai', aiActive),
    createLink('gateway', 'workbench-layer', 'workbench', workbenchActive),
    createLink('workbench-layer', 'node-workbench', 'workbench', workbenchActive),
    createLink('workbench-layer', 'python-workbench', 'workbench', workbenchActive),
    createLink('workbench-layer', 'postgres', 'workbench', workbenchActive),
    createLink('postgres', 'host-access', 'neutral', workbenchActive)
  ];
  const publishedSurfaces = nodes.filter((node) => node.active && node.kind !== 'layer').length;

  return {
    instructions: t('networkMapDialog.instructions'),
    links,
    nodes,
    stats: [
      {
        id: 'nodes',
        label: t('networkMapDialog.stats.nodes'),
        tone: 'neutral',
        value: String(nodes.length)
      },
      {
        id: 'links',
        label: t('networkMapDialog.stats.links'),
        tone: 'neutral',
        value: String(links.length)
      },
      {
        id: 'published',
        label: t('networkMapDialog.stats.published'),
        tone: 'core',
        value: String(publishedSurfaces)
      }
    ],
    summary: t('networkMapDialog.summary'),
    title: t('networkMapDialog.title')
  };
}

function createLink(
  sourceId: string,
  targetId: string,
  tone: DashboardTone,
  active: boolean
): NetworkGraphLinkViewModel {
  return {
    active,
    sourceId,
    targetId,
    tone
  };
}

function createNode(node: NetworkGraphNodeViewModel): NetworkGraphNodeViewModel {
  return {
    ...node,
    position: spreadNetworkGraphPosition(node.position)
  };
}

function spreadNetworkGraphPosition(
  position: NetworkGraphNodeViewModel['position']
): NetworkGraphNodeViewModel['position'] {
  const [x, y, z] = position;

  return [
    x * networkGraphPositionSpread.x,
    y * networkGraphPositionSpread.y,
    z * networkGraphPositionSpread.z
  ];
}
