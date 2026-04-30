import type { ComponentType, CSSProperties } from 'react';
import {
  ApiOutlined,
  BranchesOutlined,
  CloudServerOutlined,
  CodeOutlined,
  CompassOutlined,
  DatabaseOutlined,
  GlobalOutlined,
  LockOutlined,
  NodeIndexOutlined,
  ReadOutlined,
  RobotOutlined,
  SafetyCertificateOutlined,
  ThunderboltOutlined
} from '@ant-design/icons';
import type { DashboardIconKey } from '@/entities/dashboard/model/dashboard-view-model.types';

export type DashboardIconComponent = ComponentType<{
  className?: string;
  style?: CSSProperties;
}>;

export const dashboardIconMap: Record<DashboardIconKey, DashboardIconComponent> = {
  ai: ApiOutlined,
  book: ReadOutlined,
  certificate: SafetyCertificateOutlined,
  forge: BranchesOutlined,
  host: GlobalOutlined,
  network: NodeIndexOutlined,
  node: CodeOutlined,
  ollama: CloudServerOutlined,
  openWebUi: RobotOutlined,
  postgres: DatabaseOutlined,
  route: CompassOutlined,
  secure: LockOutlined,
  spark: ThunderboltOutlined,
  terminal: CodeOutlined,
  workflow: BranchesOutlined
};
