import type { TFunction } from 'i18next';

export interface DashboardCredentialLabels {
  accessMode: string;
  authMode: string;
  database: string;
  desktopHost: string;
  desktopPort: string;
  dockerHost: string;
  dockerPort: string;
  email: string;
  endpoint: string;
  gatewayPassword: string;
  gatewayUser: string;
  ownerBootstrap: string;
  ownerEmail: string;
  ownerPassword: string;
  password: string;
  rootEmail: string;
  rootName: string;
  rootPassword: string;
  rootUser: string;
  superuser: string;
  username: string;
  usage: string;
}

export function createCredentialLabels(
  t: TFunction
): DashboardCredentialLabels {
  return {
    accessMode: t('credentials.accessMode'),
    authMode: t('credentials.authMode'),
    database: t('credentials.database'),
    desktopHost: t('credentials.desktopHost'),
    desktopPort: t('credentials.desktopPort'),
    dockerHost: t('credentials.dockerHost'),
    dockerPort: t('credentials.dockerPort'),
    email: t('credentials.email'),
    endpoint: t('credentials.endpoint'),
    gatewayPassword: t('credentials.gatewayPassword'),
    gatewayUser: t('credentials.gatewayUser'),
    ownerBootstrap: t('credentials.ownerBootstrap'),
    ownerEmail: t('credentials.ownerEmail'),
    ownerPassword: t('credentials.ownerPassword'),
    password: t('credentials.password'),
    rootEmail: t('credentials.rootEmail'),
    rootName: t('credentials.rootName'),
    rootPassword: t('credentials.rootPassword'),
    rootUser: t('credentials.rootUser'),
    superuser: t('credentials.superuser'),
    username: t('credentials.username'),
    usage: t('credentials.usage')
  };
}
