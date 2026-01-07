import { colors } from './colors';

export const gradients = {
  brand: {
    primary: `linear-gradient(
      135deg,
      ${colors.brand.primary} 0%,
      ${colors.brand.secondary} 50%,
      ${colors.brand.tertiary} 100%
    )`,
  },

  accent: {
    glow: `linear-gradient(
      180deg,
      ${colors.brand.secondary} 0%,
      ${colors.brand.tertiary} 100%
    )`,
  },

  subtle: {
    surface: `linear-gradient(
      180deg,
      ${colors.neutral[800]} 0%,
      ${colors.neutral[900]} 100%
    )`,
  },
} as const;
