import type { TFunction } from 'i18next';
import type { LabRuntimeConfig } from '@/entities/runtime-config';
import type {
  OptionalLayerViewModel,
  WorkbenchCardViewModel
} from '@/entities/dashboard/model/dashboard-view-model.types';
import type { DashboardCredentialLabels } from './dashboard-credential-labels.builder';

export function createWorkbenchLayer(
  config: LabRuntimeConfig,
  t: TFunction
): OptionalLayerViewModel {
  const workbenchEnabled = config.features.workbenchEnabled;

  return {
    activationCommand: 'atlas-lab up --with-workbench',
    capabilities: [
      {
        icon: 'node',
        label: t('dashboard.workbenchLayer.capabilities.node')
      },
      {
        icon: 'terminal',
        label: t('dashboard.workbenchLayer.capabilities.codeServer')
      },
      {
        icon: 'postgres',
        label: t('dashboard.workbenchLayer.capabilities.postgres')
      }
    ],
    description: t('dashboard.workbenchLayer.description'),
    enabled: workbenchEnabled,
    summary: t(
      workbenchEnabled
        ? 'dashboard.workbenchLayer.summaryEnabled'
        : 'dashboard.workbenchLayer.summaryDisabled'
    ),
    title: t('dashboard.workbenchLayer.title'),
    tone: 'workbench'
  };
}

export function createWorkbenches(
  config: LabRuntimeConfig,
  labels: DashboardCredentialLabels,
  t: TFunction
): WorkbenchCardViewModel[] {
  return [
    {
      action: {
        href: config.workbenches.node.url,
        label: t('dashboard.workbenches.common.openWorkspace')
      },
      briefing: {
        path: config.workbenches.node.briefingPath,
        title: t('dashboard.workbenches.node.briefingTitle')
      },
      credentials: [
        {
          label: labels.endpoint,
          value: config.workbenches.node.url
        },
        {
          label: labels.authMode,
          value: t('values.password')
        },
        {
          label: labels.rootPassword,
          value: config.workbenches.node.password,
          concealed: true
        }
      ],
      description: t('dashboard.workbenches.node.description'),
      icon: 'node',
      id: 'node',
      status: t('values.browserWorkspace'),
      title: t('dashboard.workbenches.node.title'),
      tone: 'workbench'
    },
    {
      action: {
        href: config.workbenches.python.url,
        label: t('dashboard.workbenches.common.openWorkspace')
      },
      briefing: {
        path: config.workbenches.python.briefingPath,
        title: t('dashboard.workbenches.python.briefingTitle')
      },
      credentials: [
        {
          label: labels.endpoint,
          value: config.workbenches.python.url
        },
        {
          label: labels.authMode,
          value: t('values.password')
        },
        {
          label: labels.rootPassword,
          value: config.workbenches.python.password,
          concealed: true
        }
      ],
      description: t('dashboard.workbenches.python.description'),
      icon: 'terminal',
      id: 'python',
      status: t('values.browserWorkspace'),
      title: t('dashboard.workbenches.python.title'),
      tone: 'workbench'
    },
    {
      briefing: {
        path: config.workbenches.postgres.briefingPath,
        title: t('dashboard.workbenches.postgres.briefingTitle')
      },
      credentials: [
        {
          label: labels.desktopHost,
          value: config.workbenches.postgres.host
        },
        {
          label: labels.desktopPort,
          value: config.workbenches.postgres.port
        },
        {
          label: labels.dockerHost,
          value: config.workbenches.postgres.internalHost
        },
        {
          label: labels.dockerPort,
          value: config.workbenches.postgres.internalPort
        },
        {
          label: labels.database,
          value: config.workbenches.postgres.database
        },
        {
          label: labels.superuser,
          value: config.workbenches.postgres.superuser,
          concealed: true
        },
        {
          label: labels.password,
          value: config.workbenches.postgres.password,
          concealed: true
        }
      ],
      description: t('dashboard.workbenches.postgres.description'),
      icon: 'postgres',
      id: 'postgres',
      note: t('dashboard.workbenches.postgres.note'),
      status: t('values.sharedDatabase'),
      title: t('dashboard.workbenches.postgres.title'),
      tone: 'workbench'
    }
  ];
}
