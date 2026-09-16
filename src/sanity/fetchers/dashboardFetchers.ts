/**
 * High-Performance Sanity Data Fetchers
 * Queries Sanity documents using single-flight unified GROQ requests for maximum speed and zero lag.
 */

import { sanityFetch } from './sanityClient';
import {
  SanityDashboardConfig,
  SanitySiteSettings,
  SanityFooter,
  SanityThemeSettings,
  SanityService,
} from '../types/documents';

export interface UnifiedSanityData {
  dashboardConfig: SanityDashboardConfig | null;
  siteSettings: SanitySiteSettings | null;
  footer: SanityFooter | null;
  themeSettings: SanityThemeSettings | null;
  services: SanityService[] | null;
}

/**
 * Single-flight unified fetcher
 * Retrieves all Sanity documents in a SINGLE roundtrip over the edge CDN for sub-second speed.
 */
export async function fetchUnifiedSanityDashboardData(): Promise<UnifiedSanityData | null> {
  const query = `{
    "dashboardConfig": *[_type == "dashboardConfig"][0] {
      _id,
      _type,
      dashboardTabTitle,
      dashboardTabSubtitle,
      inquiriesTabTitle,
      inquiriesTabSubtitle,
      bannerTitle,
      bannerDescription,
      bannerButtonText,
      bannerBgStart,
      bannerBgEnd,
      bannerBorderColor,
      chartPrimaryColor,
      chartSecondaryColor,
      metricCards,
      serviceSeriesColors,
      inquiriesEmptyTitle,
      inquiriesEmptyDescription,
      inquiriesNoMatchTitle,
      inquiriesNoMatchDescription,
      inquiriesSearchPlaceholder,
      inquiriesClearFilterButton,
      simulatorTitle,
      simulatorEyebrow,
      simulatorNotice,
      simulatorSuccessTitle,
      simulatorSuccessMessage,
      modalReplyButton,
      modalDeleteButton
    },
    "siteSettings": *[_type == "siteSettings"][0] {
      _id,
      _type,
      siteTitle,
      siteUrl,
      companyName,
      companyTagline,
      logoIcon,
      logoImage,
      primaryBrandColor,
      secondaryBrandColor,
      accentBrandColor
    },
    "footer": *[_type == "footer"][0] {
      _id,
      _type,
      portalFooterText,
      copyright,
      tagline,
      footerBgColor,
      footerBorderColor,
      footerTextColor
    },
    "themeSettings": *[_type == "themeSettings"][0] {
      _id,
      _type,
      bgMain,
      bgGradientTop,
      bgGradientMiddle,
      bgGradientBottom,
      headerBg,
      cardBg,
      cardBorder,
      cardHoverBorder,
      innerCardBg,
      sidebarBgStart,
      sidebarBgMiddle,
      sidebarBgEnd,
      sidebarBorder,
      sidebarActiveItemBgStart,
      sidebarActiveItemBgEnd,
      textPrimary,
      textSecondary,
      textMuted,
      accentPrimary,
      accentSky,
      successColor,
      warningColor,
      dangerColor,
      primaryButtonBg,
      primaryButtonHover,
      primaryButtonTxt,
      secondaryButtonBg,
      secondaryButtonTxt,
      pillBg,
      pillBorder,
      pillTxtColor,
      priorityHighBg,
      priorityHighColor,
      priorityMediumBg,
      priorityMediumColor,
      priorityLowBg,
      priorityLowColor
    },
    "services": *[_type == "service"] | order(featured desc, title asc) {
      _id,
      _type,
      title,
      slug,
      tagline,
      icon,
      featured
    }
  }`;

  return sanityFetch<UnifiedSanityData>(query);
}

/**
 * Fetch Dashboard and Portal configuration from Sanity
 */
export async function fetchDashboardConfig(): Promise<SanityDashboardConfig | null> {
  const query = `*[_type == "dashboardConfig"][0]`;
  return sanityFetch<SanityDashboardConfig>(query);
}

/**
 * Fetch Site Settings and Branding from Sanity
 */
export async function fetchSiteSettings(): Promise<SanitySiteSettings | null> {
  const query = `*[_type == "siteSettings"][0]`;
  return sanityFetch<SanitySiteSettings>(query);
}

/**
 * Fetch Footer Configuration from Sanity
 */
export async function fetchFooter(): Promise<SanityFooter | null> {
  const query = `*[_type == "footer"][0]`;
  return sanityFetch<SanityFooter>(query);
}

/**
 * Fetch Theme & Color System Settings from Sanity
 */
export async function fetchThemeSettings(): Promise<SanityThemeSettings | null> {
  const query = `*[_type == "themeSettings"][0]`;
  return sanityFetch<SanityThemeSettings>(query);
}

/**
 * Fetch Services from Sanity (returns empty if none created in Studio)
 */
export async function fetchServices(): Promise<SanityService[] | null> {
  const query = `*[_type == "service"] | order(featured desc, title asc)`;
  return sanityFetch<SanityService[]>(query);
}
