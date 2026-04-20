import { Col, Flex, Row, Typography } from 'antd';
import { atlasDashboardPalette } from '@/shared/theme/atlas-theme';
import { overlineStyle } from '@/shared/ui';

const { Paragraph, Text, Title } = Typography;

interface SectionBandProps {
  body: string;
  kicker: string;
  title: string;
}

export function SectionBand({ body, kicker, title }: SectionBandProps) {
  return (
    <Row align="bottom" gutter={[24, 12]}>
      <Col xs={24} lg={10}>
        <Flex vertical gap={6}>
          <Text style={overlineStyle}>{kicker}</Text>
          <Title level={2} style={{ letterSpacing: '-0.05em', lineHeight: 0.98, margin: 0 }}>
            {title}
          </Title>
        </Flex>
      </Col>
      <Col xs={24} lg={14}>
        <Paragraph
          style={{
            color: atlasDashboardPalette.muted,
            fontSize: 18,
            lineHeight: 1.78,
            margin: 0,
            maxWidth: 760
          }}
        >
          {body}
        </Paragraph>
      </Col>
    </Row>
  );
}
