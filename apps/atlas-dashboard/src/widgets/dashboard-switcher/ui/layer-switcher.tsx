import {
  ApiOutlined,
  AppstoreOutlined,
  CodeOutlined,
  ThunderboltOutlined
} from '@ant-design/icons';
import { Flex, Segmented, Typography } from 'antd';
import { useTranslation } from 'react-i18next';
import {
  atlasDashboardLayerSwitcherStyles,
  atlasDashboardPalette
} from '@/shared/theme/atlas-theme';
import { overlineStyle } from '@/shared/ui';
import type { DashboardLayerView } from '@/shared/types';

const { Text } = Typography;

interface LayerSwitcherProps {
  onChange: (value: DashboardLayerView) => void;
  value: DashboardLayerView;
}

export function LayerSwitcher({ onChange, value }: LayerSwitcherProps) {
  const { t } = useTranslation();

  return (
    <Flex gap={12} style={atlasDashboardLayerSwitcherStyles.container} vertical>
      <Text
        style={{
          ...overlineStyle,
          ...atlasDashboardLayerSwitcherStyles.eyebrow
        }}
      >
        {t('layerSwitcher.eyebrow')}
      </Text>

      <div style={atlasDashboardLayerSwitcherStyles.shell}>
        <Segmented<DashboardLayerView>
          onChange={(nextValue) => onChange(nextValue)}
          options={[
            {
              icon: <AppstoreOutlined />,
              label: t('layerSwitcher.options.all'),
              value: 'all'
            },
            {
              icon: <ThunderboltOutlined />,
              label: t('cards.tones.core'),
              value: 'core'
            },
            {
              icon: <ApiOutlined />,
              label: t('cards.tones.ai'),
              value: 'ai'
            },
            {
              icon: <CodeOutlined />,
              label: t('cards.tones.workbench'),
              value: 'workbench'
            }
          ]}
          shape="round"
          size="large"
          styles={atlasDashboardLayerSwitcherStyles.segmented}
          value={value}
        />
      </div>
    </Flex>
  );
}
