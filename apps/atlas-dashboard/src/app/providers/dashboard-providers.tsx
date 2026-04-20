import type { PropsWithChildren } from 'react';
import { App as AntdApp, ConfigProvider } from 'antd';
import { atlasTheme } from '@/shared/theme/atlas-theme';

export function DashboardProviders({ children }: PropsWithChildren) {
  return (
    <ConfigProvider theme={atlasTheme}>
      <AntdApp>{children}</AntdApp>
    </ConfigProvider>
  );
}
