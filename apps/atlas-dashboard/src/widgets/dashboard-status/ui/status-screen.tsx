import { Card, Flex, Layout, Tag, Typography } from 'antd';
import { useTranslation } from 'react-i18next';
import { atlasDashboardPalette } from '@/shared/theme/atlas-theme';
import { overlineStyle, surfaceCardStyle } from '@/shared/ui';

const { Paragraph, Text, Title } = Typography;

interface StatusScreenProps {
  eyebrow: string;
  summary: string;
  title: string;
  tone?: 'default' | 'error';
}

export function StatusScreen({
  eyebrow,
  summary,
  title,
  tone = 'default'
}: StatusScreenProps) {
  const { t } = useTranslation();
  const accent = tone === 'error' ? '#b24a3a' : atlasDashboardPalette.core;

  return (
    <Layout
      style={{
        alignItems: 'center',
        background: atlasDashboardPalette.bg,
        justifyContent: 'center',
        minHeight: '100vh',
        padding: 24
      }}
    >
      <Card
        style={{ ...surfaceCardStyle, maxWidth: 720, width: '100%' }}
        styles={{ body: { padding: 32 } }}
      >
        <Flex vertical gap={16}>
          <Text style={overlineStyle}>{eyebrow}</Text>
          <Title
            level={1}
            style={{
              fontSize: 'clamp(2.4rem, 5vw, 4.5rem)',
              letterSpacing: '-0.06em',
              lineHeight: 0.92,
              margin: 0,
              maxWidth: 480
            }}
          >
            {title}
          </Title>
          <Paragraph
            style={{
              color: atlasDashboardPalette.muted,
              fontSize: 18,
              lineHeight: 1.75,
              margin: 0
            }}
          >
            {summary}
          </Paragraph>
          <Tag
            color={accent}
            style={{
              alignSelf: 'flex-start',
              background: `${accent}1A`,
              border: 'none',
              fontWeight: 700,
              marginInlineEnd: 0,
              padding: '6px 14px',
              textTransform: 'uppercase'
            }}
          >
            {t('status.runtimeBadge')}
          </Tag>
        </Flex>
      </Card>
    </Layout>
  );
}
