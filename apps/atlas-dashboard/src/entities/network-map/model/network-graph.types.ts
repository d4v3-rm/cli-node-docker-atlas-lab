import type { DashboardTone } from '@/entities/dashboard';

export type NetworkGraphNodeKind = 'gateway' | 'host' | 'plane' | 'service';

export interface NetworkGraphNodeViewModel {
  active: boolean;
  description: string;
  id: string;
  kind: NetworkGraphNodeKind;
  labels: string[];
  position: [number, number, number];
  title: string;
  tone: DashboardTone;
}

export interface NetworkGraphLinkViewModel {
  active: boolean;
  sourceId: string;
  targetId: string;
  tone: DashboardTone;
}

export interface NetworkGraphStatViewModel {
  id: string;
  label: string;
  tone: DashboardTone;
  value: string;
}

export interface NetworkGraphViewModel {
  instructions: string;
  links: NetworkGraphLinkViewModel[];
  nodes: NetworkGraphNodeViewModel[];
  stats: NetworkGraphStatViewModel[];
  summary: string;
  title: string;
}
