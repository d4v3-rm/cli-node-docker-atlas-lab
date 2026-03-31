import type { BriefingReference } from '@/types/briefing.types';

export type DashboardIconKey =
  | 'ai'
  | 'certificate'
  | 'forge'
  | 'host'
  | 'network'
  | 'node'
  | 'ollama'
  | 'openWebUi'
  | 'postgres'
  | 'route'
  | 'secure'
  | 'spark'
  | 'terminal'
  | 'workflow';

export type DashboardTone = 'ai' | 'core' | 'neutral' | 'workbench';

export interface CredentialItem {
  label: string;
  value: string;
}

export interface LinkActionItem {
  href: string;
  label: string;
}

export interface BriefingActionItem {
  briefing: BriefingReference;
  description: string;
  icon: DashboardIconKey;
  label: string;
}

export interface HeroLinkActionItem {
  description: string;
  href: string;
  icon: DashboardIconKey;
  label: string;
}

export interface PillItem {
  icon: DashboardIconKey;
  label: string;
  tone: DashboardTone;
}

export interface MetricItem {
  caption: string;
  label: string;
  value: number;
}

export interface ServiceCardViewModel {
  action: LinkActionItem;
  briefing?: BriefingReference;
  credentials: CredentialItem[];
  description: string;
  icon: DashboardIconKey;
  id: string;
  note?: string;
  status: string;
  title: string;
  tone: DashboardTone;
}

export interface WorkbenchCardViewModel {
  action?: LinkActionItem;
  briefing: BriefingReference;
  credentials: CredentialItem[];
  description: string;
  icon: DashboardIconKey;
  id: string;
  note?: string;
  status: string;
  title: string;
  tone: DashboardTone;
}

export interface FooterCardViewModel {
  body: string;
  icon: DashboardIconKey;
  id: string;
  label: string;
}

export interface LayerCapability {
  icon: DashboardIconKey;
  label: string;
}

export interface OptionalLayerViewModel {
  activationCommand: string;
  capabilities: LayerCapability[];
  description: string;
  enabled: boolean;
  summary: string;
  title: string;
  tone: DashboardTone;
}

export interface DashboardViewModel {
  accessNotes: string[];
  aiLayer: OptionalLayerViewModel;
  aiServices: ServiceCardViewModel[];
  footerCards: FooterCardViewModel[];
  hero: {
    eyebrow: string;
    metrics: MetricItem[];
    pills: PillItem[];
    quickActions: (HeroLinkActionItem | BriefingActionItem)[];
    summary: string;
    titleLines: string[];
  };
  networkMap: BriefingReference;
  operatingCharter: string[];
  services: ServiceCardViewModel[];
  workbenchLayer: OptionalLayerViewModel;
  workbenches: WorkbenchCardViewModel[];
}
