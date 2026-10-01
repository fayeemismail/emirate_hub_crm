/**
 * Emirate Hub CRM palette — light warm cream + brand red.
 * Keep in sync with sanity/schemaTypes/documents/themeSettings.ts initialValues.
 */
export const CLEAN_CRM_THEME = {
  bgMain: '#F7F5F1',
  bgGradientTop: '#F7F5F1',
  bgGradientMiddle: '#F7F5F1',
  bgGradientBottom: '#F7F5F1',
  headerBg: '#FFFFFF',
  sidebarBgStart: '#FFFFFF',
  sidebarBgMiddle: '#FFFFFF',
  sidebarBgEnd: '#FFFFFF',
  sidebarBorder: '#E7E5E4',
  sidebarActiveItemBgStart: '#E02126',
  sidebarActiveItemBgEnd: '#E02126',
  cardBg: '#FFFFFF',
  cardBorder: '#E7E5E4',
  cardHoverBorder: '#E0212666',
  innerCardBg: '#FAF9F6',
  textPrimary: '#1C1917',
  textSecondary: '#78716C',
  textMuted: '#A8A29E',
  accentPrimary: '#E02126',
  accentSky: '#E02126',
  successColor: '#15803D',
  warningColor: '#B45309',
  dangerColor: '#E02126',
  priorityHighColor: '#B91C1C',
  priorityHighBg: '#FEE2E2',
  priorityMediumColor: '#B45309',
  priorityMediumBg: '#FEF3C7',
  priorityLowColor: '#57534E',
  priorityLowBg: '#F5F5F4',
  primaryButtonBg: '#E02126',
  primaryButtonTxt: '#FFFFFF',
  primaryButtonHover: '#C8191E',
  secondaryButtonBg: '#F5F5F4',
  secondaryButtonTxt: '#57534E',
  pillBg: '#FEE2E2',
  pillBorder: '#FECACA',
  pillTxtColor: '#B91C1C',
} as const;

export type CleanCrmTheme = typeof CLEAN_CRM_THEME;

export function buildPageBackground(theme: {
  bgMain?: string;
  bgGradientTop?: string;
  bgGradientMiddle?: string;
  bgGradientBottom?: string;
}): string {
  const top = theme.bgGradientTop || CLEAN_CRM_THEME.bgGradientTop;
  const mid = theme.bgGradientMiddle || theme.bgGradientTop || CLEAN_CRM_THEME.bgGradientMiddle;
  const bot = theme.bgGradientBottom || theme.bgGradientTop || CLEAN_CRM_THEME.bgGradientBottom;
  if (top === mid && mid === bot) return top;
  return `linear-gradient(180deg, ${top} 0%, ${mid} 45%, ${bot} 100%)`;
}
