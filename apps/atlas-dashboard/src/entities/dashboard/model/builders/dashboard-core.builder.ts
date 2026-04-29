import type { TFunction } from 'i18next';
import type { LabRuntimeConfig } from '@/entities/runtime-config';
import type {
  ServiceCardViewModel
} from '@/entities/dashboard/model/dashboard-view-model.types';
import type { DashboardCredentialLabels } from './dashboard-credential-labels.builder';
import type { BriefingReference } from '@/shared/types';

export function createNetworkMap(
  config: LabRuntimeConfig,
  t: TFunction
): BriefingReference {
  return {
    path: config.content.networkMapPath,
    title: t('dashboard.networkMap.title')
  };
}

export function createCoreServices(
  config: LabRuntimeConfig,
  labels: DashboardCredentialLabels,
  t: TFunction
): ServiceCardViewModel[] {
  return [
    {
      action: {
        href: config.services.gitLab.url,
        label: t('dashboard.services.gitLab.action')
      },
      credentials: [
        {
          label: labels.endpoint,
          value: config.services.gitLab.url
        },
        {
          label: labels.rootUser,
          value: config.services.gitLab.rootUsername,
          concealed: true
        },
        {
          label: labels.password,
          value: config.services.gitLab.rootPassword,
          concealed: true
        },
        {
          label: labels.email,
          value: config.services.gitLab.rootEmail,
          concealed: true
        }
      ],
      description: t('dashboard.services.gitLab.description'),
      icon: 'forge',
      id: 'gitlab',
      status: t('values.alwaysOnForge'),
      title: t('dashboard.services.gitLab.title'),
      tone: 'core'
    },
    {
      action: {
        href: config.services.obsidian.url,
        label: t('dashboard.services.obsidian.action')
      },
      credentials: [
        {
          label: labels.endpoint,
          value: config.services.obsidian.url
        },
        {
          label: labels.accessMode,
          value: t('values.directAppLogin')
        },
        {
          label: labels.usage,
          value: t('values.knowledgeVault')
        }
      ],
      description: t('dashboard.services.obsidian.description'),
      icon: 'host',
      id: 'obsidian',
      note: t('dashboard.services.obsidian.note'),
      status: t('values.knowledgeVault'),
      title: t('dashboard.services.obsidian.title'),
      tone: 'core'
    },
    {
      action: {
        href: config.services.penpot.url,
        label: t('dashboard.services.penpot.action')
      },
      credentials: [
        {
          label: labels.endpoint,
          value: config.services.penpot.url
        },
        {
          label: labels.rootName,
          value: config.services.penpot.rootName
        },
        {
          label: labels.rootEmail,
          value: config.services.penpot.rootEmail,
          concealed: true
        },
        {
          label: labels.password,
          value: config.services.penpot.rootPassword,
          concealed: true
        },
        {
          label: labels.accessMode,
          value: t('values.directAppLogin')
        }
      ],
      description: t('dashboard.services.penpot.description'),
      icon: 'host',
      id: 'penpot',
      status: t('values.designCollaboration'),
      title: t('dashboard.services.penpot.title'),
      tone: 'core'
    }
  ];
}
