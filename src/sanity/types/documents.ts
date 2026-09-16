/**
 * Sanity Document Types Definitions
 * Strictly maps to Sanity CMS schemas in `sanity-template/schemaTypes/documents`
 */

export interface SanityKpiCardItem {
  _key: string;
  _type: 'kpiCardItem';
  metricKey: 'total' | 'pending' | 'inProgress' | 'resolved' | string;
  label: string;
  subtext?: string;
  badgeText?: string;
  badgeColor?: string;
  badgeBgColor?: string;
  icon?: string;
  iconColor?: string;
  iconBgColor?: string;
}

export interface SanityServiceColorMapping {
  _key: string;
  _type: 'serviceColorMapping';
  serviceName: string;
  color: string;
}

export interface SanityDashboardConfig {
  _id: string;
  _type: 'dashboardConfig';
  _createdAt?: string;
  _updatedAt?: string;
  dashboardTabTitle?: string;
  dashboardTabSubtitle?: string;
  inquiriesTabTitle?: string;
  inquiriesTabSubtitle?: string;
  bannerTitle?: string;
  bannerDescription?: string;
  bannerButtonText?: string;
  bannerBgStart?: string;
  bannerBgEnd?: string;
  bannerBorderColor?: string;
  chartPrimaryColor?: string;
  chartSecondaryColor?: string;
  metricCards?: SanityKpiCardItem[];
  serviceSeriesColors?: SanityServiceColorMapping[];
  inquiriesEmptyTitle?: string;
  inquiriesEmptyDescription?: string;
  inquiriesNoMatchTitle?: string;
  inquiriesNoMatchDescription?: string;
  inquiriesSearchPlaceholder?: string;
  inquiriesClearFilterButton?: string;
  simulatorTitle?: string;
  simulatorEyebrow?: string;
  simulatorNotice?: string;
  simulatorSuccessTitle?: string;
  simulatorSuccessMessage?: string;
  modalReplyButton?: string;
  modalDeleteButton?: string;
}

export interface SanitySiteSettings {
  _id: string;
  _type: 'siteSettings';
  _createdAt?: string;
  _updatedAt?: string;
  siteTitle?: string;
  siteUrl?: string;
  companyName?: string;
  companyTagline?: string;
  logoIcon?: string;
  logoImage?: {
    _type: 'imageWithAlt';
    alt?: string;
    asset?: {
      _ref: string;
      _type: 'reference';
    };
  };
  primaryBrandColor?: string;
  secondaryBrandColor?: string;
  accentBrandColor?: string;
}

export interface SanityFooter {
  _id: string;
  _type: 'footer';
  _createdAt?: string;
  _updatedAt?: string;
  tagline?: string;
  copyright?: string;
  portalFooterText?: string;
  footerBgColor?: string;
  footerBorderColor?: string;
  footerTextColor?: string;
}

export interface SanityThemeSettings {
  _id: string;
  _type: 'themeSettings';
  _createdAt?: string;
  _updatedAt?: string;
  bgMain?: string;
  bgGradientTop?: string;
  bgGradientMiddle?: string;
  bgGradientBottom?: string;
  headerBg?: string;
  cardBg?: string;
  cardBorder?: string;
  cardHoverBorder?: string;
  innerCardBg?: string;
  sidebarBgStart?: string;
  sidebarBgMiddle?: string;
  sidebarBgEnd?: string;
  sidebarBorder?: string;
  sidebarActiveItemBgStart?: string;
  sidebarActiveItemBgEnd?: string;
  textPrimary?: string;
  textSecondary?: string;
  textMuted?: string;
  accentPrimary?: string;
  accentSky?: string;
  successColor?: string;
  warningColor?: string;
  dangerColor?: string;
  primaryButtonBg?: string;
  primaryButtonHover?: string;
  primaryButtonTxt?: string;
  secondaryButtonBg?: string;
  secondaryButtonTxt?: string;
  pillBg?: string;
  pillBorder?: string;
  pillTxtColor?: string;
  priorityHighBg?: string;
  priorityHighColor?: string;
  priorityMediumBg?: string;
  priorityMediumColor?: string;
  priorityLowBg?: string;
  priorityLowColor?: string;
}

export interface SanityService {
  _id: string;
  _type: 'service';
  _createdAt?: string;
  _updatedAt?: string;
  title: string;
  slug?: {
    current: string;
  };
  tagline?: string;
  icon?: string;
  featured?: boolean;
}
