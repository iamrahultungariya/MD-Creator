export type RecognizedPlatform = 'youtube' | 'x' | 'instagram' | 'threads' | 'github' | 'generic';

export interface LinkPreviewData {
  url: string;
  domain: string;
  title: string;
  description?: string;
  image?: string;
  favicon?: string;
  platform: RecognizedPlatform;
  isOfflineFallback: boolean;
  status: 'loading' | 'success' | 'fallback';
}

// In-memory cache to guarantee 0ms latency for repeated link hovers
const previewCache = new Map<string, LinkPreviewData>();

/**
 * Detect platform based on domain hostname
 */
export function detectPlatform(url: string): RecognizedPlatform {
  try {
    const parsed = new URL(url);
    const host = parsed.hostname.toLowerCase().replace(/^www\./, '');

    if (host === 'youtube.com' || host === 'youtu.be' || host.endsWith('.youtube.com')) {
      return 'youtube';
    }
    if (host === 'x.com' || host === 'twitter.com') {
      return 'x';
    }
    if (host === 'instagram.com' || host.endsWith('.instagram.com')) {
      return 'instagram';
    }
    if (host === 'threads.net' || host.endsWith('.threads.net')) {
      return 'threads';
    }
    if (host === 'github.com' || host.endsWith('.github.com')) {
      return 'github';
    }
    return 'generic';
  } catch {
    return 'generic';
  }
}

/**
 * Clean domain extractor
 */
export function extractCleanDomain(url: string): string {
  try {
    const parsed = new URL(url);
    return parsed.hostname.replace(/^www\./, '');
  } catch {
    return url;
  }
}

/**
 * Generate bespoke synthetic preview for recognized platforms or universal offline fallback
 */
export function generateSyntheticPreview(url: string, platform: RecognizedPlatform, isOffline: boolean): LinkPreviewData {
  const domain = extractCleanDomain(url);
  let pathname = '';
  try {
    const parsed = new URL(url);
    pathname = parsed.pathname !== '/' ? parsed.pathname : '';
  } catch {
    // ignore
  }

  switch (platform) {
    case 'youtube':
      return {
        url,
        domain: 'YouTube',
        title: pathname.length > 1 ? `YouTube Video: ${pathname.replace(/^\/(watch\?v=)?/, '')}` : 'YouTube Video & Streaming',
        description: 'Watch video, listen to music, and explore creator channels on YouTube.',
        platform: 'youtube',
        isOfflineFallback: isOffline,
        status: 'fallback',
      };
    case 'x':
      return {
        url,
        domain: 'X (formerly Twitter)',
        title: pathname.length > 1 ? `@${pathname.replace(/^\//, '').split('/')[0]} on X` : 'X • Discover what’s happening',
        description: 'See live reactions, breaking news, threads, and media on X.',
        platform: 'x',
        isOfflineFallback: isOffline,
        status: 'fallback',
      };
    case 'instagram':
      return {
        url,
        domain: 'Instagram',
        title: pathname.length > 1 ? `Instagram • ${pathname.replace(/^\//, '')}` : 'Instagram Profile & Media',
        description: 'View photos, reels, and stories shared on Instagram.',
        platform: 'instagram',
        isOfflineFallback: isOffline,
        status: 'fallback',
      };
    case 'threads':
      return {
        url,
        domain: 'Threads',
        title: pathname.length > 1 ? `Threads Conversation • ${pathname.replace(/^\//, '')}` : 'Threads by Instagram',
        description: 'Join real-time conversations and community discussions on Threads.',
        platform: 'threads',
        isOfflineFallback: isOffline,
        status: 'fallback',
      };
    case 'github':
      return {
        url,
        domain: 'GitHub',
        title: pathname.length > 1 ? `GitHub Repository: ${pathname.replace(/^\//, '')}` : 'GitHub • Build and Ship Software',
        description: 'Explore open source code, repositories, issues, and developer projects.',
        platform: 'github',
        isOfflineFallback: isOffline,
        status: 'fallback',
      };
    case 'generic':
    default:
      return {
        url,
        domain,
        title: pathname ? `${domain}${pathname}` : domain,
        description: isOffline
          ? 'Link saved in document. Reconnect to the internet for live page details.'
          : 'External web page. Click to open in a new browser tab.',
        platform: 'generic',
        isOfflineFallback: isOffline,
        status: 'fallback',
      };
  }
}

/**
 * Multi-Tier Link Preview Fetcher:
 * Tier 1: Live OpenGraph metadata via Microlink with 2500ms timeout
 * Tier 2: Recognized platform synthetic card (YouTube, X, Instagram, Threads, GitHub)
 * Tier 3: Universal offline card
 */
export async function getLinkPreview(url: string): Promise<LinkPreviewData> {
  // Check memory cache first
  const cached = previewCache.get(url);
  if (cached && cached.status !== 'loading') {
    return cached;
  }

  const platform = detectPlatform(url);
  const isOnline = typeof navigator !== 'undefined' ? navigator.onLine : true;

  // If offline, instantly return Tier 2/3 fallback
  if (!isOnline) {
    const offlinePreview = generateSyntheticPreview(url, platform, true);
    previewCache.set(url, offlinePreview);
    return offlinePreview;
  }

  // Attempt Tier 1: Microlink API metadata fetch
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 2500);

    const apiUrl = `https://api.microlink.io?url=${encodeURIComponent(url)}&palette=true`;
    const response = await fetch(apiUrl, {
      signal: controller.signal,
      headers: {
        Accept: 'application/json',
      },
    });

    clearTimeout(timeout);

    if (!response.ok) {
      throw new Error(`Microlink responded with status ${response.status}`);
    }

    const payload = await response.json();
    if (payload.status === 'success' && payload.data) {
      const data = payload.data;
      const cleanDomain = data.publisher || extractCleanDomain(url);
      const title = data.title || extractCleanDomain(url);

      const resolvedPreview: LinkPreviewData = {
        url,
        domain: cleanDomain,
        title: title.length > 120 ? `${title.slice(0, 117)}...` : title,
        description: data.description ? (data.description.length > 140 ? `${data.description.slice(0, 137)}...` : data.description) : undefined,
        image: data.image?.url || undefined,
        favicon: data.logo?.url || undefined,
        platform,
        isOfflineFallback: false,
        status: 'success',
      };

      previewCache.set(url, resolvedPreview);
      return resolvedPreview;
    }

    throw new Error('Incomplete metadata returned');
  } catch (err) {
    // Tier 1 failed or timed out -> Fall back to Tier 2 (Platform synthetic) or Tier 3 (Universal)
    const fallbackPreview = generateSyntheticPreview(url, platform, false);
    previewCache.set(url, fallbackPreview);
    return fallbackPreview;
  }
}
