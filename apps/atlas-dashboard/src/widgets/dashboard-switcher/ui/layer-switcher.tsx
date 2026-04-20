import {
  ApiOutlined,
  AppstoreOutlined,
  CodeOutlined,
  ThunderboltOutlined
} from '@ant-design/icons';
import { Flex, Segmented, Typography } from 'antd';
import { useTranslation } from 'react-i18next';
import {
  atlasDashboardLayerSwitcherToneStyles,
  atlasDashboardLayerSwitcherStyles
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
  const options: {
    icon: typeof AppstoreOutlined;
    label: string;
    value: DashboardLayerView;
  }[] = [
    {
      icon: AppstoreOutlined,
      label: t('layerSwitcher.options.all'),
      value: 'all'
    },
    {
      icon: ThunderboltOutlined,
      label: t('cards.tones.core'),
      value: 'core'
    },
    {
      icon: ApiOutlined,
      label: t('cards.tones.ai'),
      value: 'ai'
    },
    {
      icon: CodeOutlined,
      label: t('cards.tones.workbench'),
      value: 'workbench'
    }
  ];

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
          options={options.map((option) => {
            const palette = atlasDashboardLayerSwitcherToneStyles[option.value];
            const isSelected = value === option.value;
            const IconGlyph = option.icon;

            return {
              label: (
                <span
                  style={{
                    ...atlasDashboardLayerSwitcherStyles.optionBody,
                    color: palette.accent
                  }}
                >
                  <span
                    style={{
                      ...atlasDashboardLayerSwitcherStyles.optionIcon,
                      background: isSelected ? palette.selectedBg : palette.iconBg,
                      color: palette.accent
                    }}
                  >
                    <IconGlyph />
                  </span>
                  <span>{option.label}</span>
                </span>
              ),
              value: option.value
            };
          })}
          shape="round"
          size="large"
          styles={atlasDashboardLayerSwitcherStyles.segmented}
          value={value}
        />
      </div>
    </Flex>
  );
}
