import type { ComponentType, CSSProperties } from 'react';
import { Button } from 'antd';
import { atlasDashboardPalette } from '@/shared/theme/atlas-theme';

type ActionIconComponent = ComponentType<{
  className?: string;
  style?: CSSProperties;
}>;

interface ActionButtonProps {
  block?: boolean;
  href?: string;
  icon: ActionIconComponent;
  label: string;
  onClick?: () => void;
  style?: CSSProperties;
  tone: 'brand' | 'ghost' | 'outline' | 'solid';
}

export function ActionButton({
  block = false,
  href,
  icon,
  label,
  onClick,
  style,
  tone
}: ActionButtonProps) {
  const IconGlyph = icon;
  const colors = {
    brand: {
      background: atlasDashboardPalette.core,
      color: atlasDashboardPalette.white
    },
    ghost: {
      background: atlasDashboardPalette.heroAlt,
      color: atlasDashboardPalette.white
    },
    outline: {
      background: atlasDashboardPalette.panelAlt,
      color: atlasDashboardPalette.ink
    },
    solid: {
      background: atlasDashboardPalette.panelAlt,
      color: atlasDashboardPalette.white
    }
  }[tone];

  return (
    <Button
      href={href}
      icon={<IconGlyph />}
      onClick={onClick}
      rel={href ? 'noreferrer' : undefined}
      size="large"
      style={{
        background: colors.background,
        color: colors.color,
        fontWeight: 700,
        width: block ? '100%' : undefined,
        ...style
      }}
      target={href ? '_blank' : undefined}
      type="default"
    >
      {label}
    </Button>
  );
}
