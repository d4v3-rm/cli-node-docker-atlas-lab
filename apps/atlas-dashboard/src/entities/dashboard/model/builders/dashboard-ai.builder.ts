import type { TFunction } from 'i18next';
import type { LabRuntimeConfig } from '@/entities/runtime-config';
import type {
  OptionalLayerViewModel,
  ServiceCardViewModel
} from '@/entities/dashboard/model/dashboard-view-model.types';
import type { DashboardCredentialLabels } from './dashboard-credential-labels.builder';

export function createAiLayer(
  config: LabRuntimeConfig,
  t: TFunction
): OptionalLayerViewModel {
  const aiLlmEnabled = config.features.aiLlmEnabled;

  return {
    activationCommand: 'atlas-lab up --with-ai-llm',
    capabilities: [
      {
        icon: 'openWebUi',
        label: t('dashboard.aiLayer.capabilities.openWebUi')
      },
      {
        icon: 'ollama',
        label: t('dashboard.aiLayer.capabilities.ollama')
      },
      {
        icon: 'workflow',
        label: t('dashboard.aiLayer.capabilities.n8n')
      },
      {
        icon: 'ai',
        label: t('dashboard.aiLayer.capabilities.llmModels')
      }
    ],
    description: t('dashboard.aiLayer.description'),
    enabled: aiLlmEnabled,
    summary: t(
      aiLlmEnabled
        ? 'dashboard.aiLayer.summaryEnabled'
        : 'dashboard.aiLayer.summaryDisabled'
    ),
    title: t('dashboard.aiLayer.title'),
    tone: 'ai'
  };
}

export function createAiServices(
  config: LabRuntimeConfig,
  labels: DashboardCredentialLabels,
  t: TFunction
): ServiceCardViewModel[] {
  return [
    {
      action: {
        href: config.services.openWebUi.url,
        label: t('dashboard.aiServices.openWebUi.action')
      },
      credentials: [
        {
          label: labels.endpoint,
          value: config.services.openWebUi.url
        },
        {
          label: labels.rootName,
          value: config.services.openWebUi.rootName
        },
        {
          label: labels.rootEmail,
          value: config.services.openWebUi.rootEmail
        },
        {
          label: labels.password,
          value: config.services.openWebUi.rootPassword
        }
      ],
      description: t('dashboard.aiServices.openWebUi.description'),
      icon: 'openWebUi',
      id: 'open-webui',
      status: t('values.browserConsole'),
      title: t('dashboard.aiServices.openWebUi.title'),
      tone: 'ai'
    },
    {
      action: {
        href: config.services.ollama.url,
        label: t('dashboard.aiServices.ollama.action')
      },
      credentials: [
        {
          label: labels.endpoint,
          value: config.services.ollama.url
        },
        {
          label: labels.gatewayUser,
          value: config.services.ollama.gatewayUser
        },
        {
          label: labels.gatewayPassword,
          value: config.services.ollama.gatewayPassword
        },
        {
          label: labels.usage,
          value: t('values.localInferenceApi')
        }
      ],
      description: t('dashboard.aiServices.ollama.description'),
      icon: 'ollama',
      id: 'ollama',
      status: t('values.protectedApi'),
      title: t('dashboard.aiServices.ollama.title'),
      tone: 'ai'
    },
    {
      action: {
        href: config.services.n8n.url,
        label: t('dashboard.aiServices.n8n.action')
      },
      credentials: [
        {
          label: labels.endpoint,
          value: config.services.n8n.url
        },
        {
          label: labels.accessMode,
          value: t('values.directAppLogin')
        },
        {
          label: labels.ownerBootstrap,
          value: config.services.n8n.ownerName
        },
        {
          label: labels.ownerEmail,
          value: config.services.n8n.ownerEmail
        },
        {
          label: labels.ownerPassword,
          value: config.services.n8n.ownerPassword
        }
      ],
      description: t('dashboard.aiServices.n8n.description'),
      icon: 'workflow',
      id: 'n8n',
      status: t('values.workflowControl'),
      title: t('dashboard.aiServices.n8n.title'),
      tone: 'ai'
    }
  ];
}
