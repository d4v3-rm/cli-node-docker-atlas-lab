import { FlagOutlined } from '@ant-design/icons';
import { Button, Card, Flex, Select, Typography } from 'antd';
import { useTranslation } from 'react-i18next';
import {
  dashboardLanguages,
  resolveDashboardLanguage
} from '@/shared/config/i18n';
import { atlasDashboardPalette } from '@/shared/theme/atlas-theme';
import { overlineStyle, surfaceCardStyle } from '@/shared/ui';

const { Text } = Typography;

export function LanguageSelectCard() {
  const { i18n, t } = useTranslation();
  const currentLanguage =
    resolveDashboardLanguage(i18n.resolvedLanguage ?? i18n.language) ?? 'it';

  const handleLanguageChange = (value: string) => {
    const nextLanguage = resolveDashboardLanguage(value);

    if (!nextLanguage || nextLanguage === currentLanguage) {
      return;
    }

    void i18n.changeLanguage(nextLanguage);
  };

  return (
    <Card style={{ ...surfaceCardStyle, minWidth: 240 }} styles={{ body: { padding: 16 } }}>
      <Flex align="center" gap={12}>
        <Button
          icon={<FlagOutlined />}
          shape="circle"
          size="large"
          type="text"
          style={{
            background: atlasDashboardPalette.panelAlt,
            color: atlasDashboardPalette.signal
          }}
        />
        <Flex vertical gap={4} style={{ flex: 1 }}>
          <Text style={overlineStyle}>{t('language.selectorLabel')}</Text>
          <Select
            aria-label={t('language.ariaLabel')}
            onChange={handleLanguageChange}
            options={dashboardLanguages.map((language) => ({
              label: t(`language.options.${language}`),
              value: language
            }))}
            value={currentLanguage}
          />
        </Flex>
      </Flex>
    </Card>
  );
}
