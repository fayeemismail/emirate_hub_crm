/**
 * Runtime Type Guards and Data Checkers for Sanity CMS Responses
 * Strictly verifies whether actual incoming data exists before rendering.
 */

import {
  SanityDashboardConfig,
  SanitySiteSettings,
  SanityFooter,
  SanityThemeSettings,
  SanityService,
} from './documents';

/**
 * Verifies if an object is non-null, non-empty, and has actual content
 */
export function hasIncomingData<T>(value: T | null | undefined): value is NonNullable<T> {
  if (value === null || value === undefined) return false;
  if (typeof value === 'object') {
    return Object.keys(value).length > 0;
  }
  return true;
}

/**
 * Type guard for Sanity Dashboard Config
 */
export function isValidDashboardConfig(data: unknown): data is SanityDashboardConfig {
  if (!data || typeof data !== 'object') return false;
  const config = data as Record<string, unknown>;
  return (
    config._type === 'dashboardConfig' &&
    typeof config._id === 'string' &&
    (Boolean(config.bannerTitle) || Boolean(config.dashboardTabTitle) || Array.isArray(config.metricCards))
  );
}

/**
 * Type guard for Sanity Site Settings
 */
export function isValidSiteSettings(data: unknown): data is SanitySiteSettings {
  if (!data || typeof data !== 'object') return false;
  const settings = data as Record<string, unknown>;
  return (
    settings._type === 'siteSettings' &&
    typeof settings._id === 'string' &&
    (Boolean(settings.companyName) || Boolean(settings.siteTitle))
  );
}

/**
 * Type guard for Sanity Footer
 */
export function isValidFooter(data: unknown): data is SanityFooter {
  if (!data || typeof data !== 'object') return false;
  const footer = data as Record<string, unknown>;
  return (
    footer._type === 'footer' &&
    typeof footer._id === 'string' &&
    (Boolean(footer.portalFooterText) || Boolean(footer.copyright))
  );
}

/**
 * Type guard for Sanity Theme Settings
 */
export function isValidThemeSettings(data: unknown): data is SanityThemeSettings {
  if (!data || typeof data !== 'object') return false;
  const theme = data as Record<string, unknown>;
  return (
    theme._type === 'themeSettings' &&
    typeof theme._id === 'string' &&
    (Boolean(theme.bgMain) || Boolean(theme.accentPrimary) || Boolean(theme.cardBg))
  );
}

/**
 * Type guard for Sanity Services array
 */
export function hasValidSanityServices(data: unknown): data is SanityService[] {
  return Array.isArray(data) && data.length > 0 && data.every(item => item && typeof item === 'object' && item._type === 'service');
}
