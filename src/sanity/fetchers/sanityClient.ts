/**
 * High-Speed Sanity HTTP Query Client
 * - Connects to Sanity Global Edge CDN (apicdn.sanity.io) for ultra-low latency (< 50ms)
 * - In-memory cache & request deduplication for zero-latency instant access
 */

export const SANITY_PROJECT_ID = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'yqweaq94';
export const SANITY_DATASET = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production';
export const SANITY_API_VERSION = process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2024-03-01';

interface SanityApiResponse<T> {
  result: T;
  ms?: number;
  query?: string;
}

// In-memory cache for zero-latency local retrieval
const memoryCache = new Map<string, { data: any; timestamp: number }>();
const pendingPromises = new Map<string, Promise<any>>();
const CACHE_TTL_MS = 60 * 1000; // 60 seconds

/**
 * Execute GROQ Query against Sanity Global Edge CDN
 */
export async function sanityFetch<T>(
  query: string,
  params: Record<string, string | number | boolean> = {},
  revalidateSeconds: number = 60
): Promise<T | null> {
  const cacheKey = `${query}_${JSON.stringify(params)}`;

  // Return from in-memory cache if fresh
  const cached = memoryCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    return cached.data as T;
  }

  // Deduplicate inflight requests to prevent redundant network roundtrips
  if (pendingPromises.has(cacheKey)) {
    return pendingPromises.get(cacheKey)!;
  }

  const fetchPromise = (async () => {
    try {
      const encodedQuery = encodeURIComponent(query);
      const paramEntries = Object.entries(params)
        .map(([key, val]) => `$$${key}=${encodeURIComponent(JSON.stringify(val))}`)
        .join('&');
      const paramQueryString = paramEntries ? `&${paramEntries}` : '';

      // Use apicdn.sanity.io for global edge distribution and near-instant response times
      const endpoint = `https://${SANITY_PROJECT_ID}.apicdn.sanity.io/v${SANITY_API_VERSION}/data/query/${SANITY_DATASET}?query=${encodedQuery}${paramQueryString}`;

      const res = await fetch(endpoint, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
        next: {
          revalidate: revalidateSeconds,
        },
      });

      if (!res.ok) {
        console.warn(`[Sanity CDN Error] Status ${res.status}: ${res.statusText}`);
        return null;
      }

      const data: SanityApiResponse<T> = await res.json();
      const result = data.result ?? null;

      if (result !== null) {
        memoryCache.set(cacheKey, { data: result, timestamp: Date.now() });
      }

      return result;
    } catch (err) {
      console.warn('[Sanity CDN Fetch Exception]:', err);
      return null;
    } finally {
      pendingPromises.delete(cacheKey);
    }
  })();

  pendingPromises.set(cacheKey, fetchPromise);
  return fetchPromise;
}
