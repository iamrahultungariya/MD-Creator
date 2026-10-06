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

const LOCAL_STORAGE_CACHE_KEY = 'md_writer_link_previews_v2';

function loadCachedPreview(url: string): LinkPreviewData | null {
  if (previewCache.has(url)) {
    return previewCache.get(url)!;
  }
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_CACHE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed[url]) {
          previewCache.set(url, parsed[url]);
          return parsed[url];
        }
      }
    } catch {
      // Ignore localStorage parse error
    }
  }
  return null;
}

function saveCachedPreview(url: string, data: LinkPreviewData) {
  previewCache.set(url, data);
  if (typeof window !== 'undefined' && window.localStorage && data.status === 'success') {
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_CACHE_KEY);
      const parsed = stored ? JSON.parse(stored) : {};
      parsed[url] = data;
      // Keep cache bounded to last 60 entries
      const keys = Object.keys(parsed);
      if (keys.length > 60) {
        delete parsed[keys[0]];
      }
      localStorage.setItem(LOCAL_STORAGE_CACHE_KEY, JSON.stringify(parsed));
    } catch {
      // Ignore quota exceeded errors
    }
  }
}

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
 * Extract YouTube video ID if available
 */
function extractYouTubeVideoId(url: string): string | null {
  try {
    const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
    return match ? match[1] : null;
  } catch {
    return null;
  }
}

/**
 * Resolve X / Twitter profile directly via vxtwitter (CORS-enabled, zero-auth) with unavatar fallback
 */
async function resolveXProfile(url: string): Promise<LinkPreviewData | null> {
  try {
    const parsed = new URL(url);
    const parts = parsed.pathname.split('/').filter(Boolean);
    if (parts.length === 0) return null;

    const username = parts[0];
    const reservedWords = ['home', 'explore', 'notifications', 'messages', 'i', 'search', 'settings', 'tos', 'privacy'];
    if (reservedWords.includes(username.toLowerCase())) return null;

    // Fast-path: query vxtwitter API which returns full bio & avatar with CORS: *
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 2800);
      const res = await fetch(`https://api.vxtwitter.com/${username}`, {
        signal: controller.signal,
        headers: { Accept: 'application/json' },
      });
      clearTimeout(timeout);

      if (res.ok) {
        const data = await res.json();
        if (data && (data.name || data.screen_name)) {
          const avatarUrl = data.profile_image_url
            ? data.profile_image_url.replace('_normal.', '_400x400.')
            : `https://unavatar.io/x/${username}`;

          return {
            url,
            domain: 'X (formerly Twitter)',
            title: `${data.name || username} (@${data.screen_name || username})`,
            description: data.description || `View @${username}'s profile and posts on X.`,
            image: avatarUrl,
            platform: 'x',
            isOfflineFallback: false,
            status: 'success',
          };
        }
      }
    } catch {
      // vxtwitter timed out or failed, try unavatar fallback below
    }

    // Fallback: unavatar.io gives live Twitter profile image directly with CORS: *
    return {
      url,
      domain: 'X (formerly Twitter)',
      title: `@${username} on X`,
      description: `View @${username}'s profile, thoughts, and media on X.`,
      image: `https://unavatar.io/x/${username}`,
      platform: 'x',
      isOfflineFallback: false,
      status: 'success',
    };
  } catch {
    return null;
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

  // Check YouTube thumbnail
  const ytVideoId = extractYouTubeVideoId(url);
  if (ytVideoId) {
    return {
      url,
      domain: 'YouTube',
      title: 'YouTube Video',
      description: 'Watch video, listen to music, and explore creator channels on YouTube.',
      image: `https://i.ytimg.com/vi/${ytVideoId}/hqdefault.jpg`,
      platform: 'youtube',
      isOfflineFallback: isOffline,
      status: 'fallback',
    };
  }

  switch (platform) {
    case 'youtube':
      return {
        url,
        domain: 'YouTube',
        title: pathname.length > 1 ? `YouTube: ${pathname.replace(/^\/(watch\?v=)?/, '')}` : 'YouTube Video & Streaming',
        description: 'Watch video, listen to music, and explore creator channels on YouTube.',
        platform: 'youtube',
        isOfflineFallback: isOffline,
        status: 'fallback',
      };
    case 'x': {
      const parts = pathname.split('/').filter(Boolean);
      const user = parts.length > 0 ? parts[0] : '';
      return {
        url,
        domain: 'X (formerly Twitter)',
        title: user ? `@${user} on X` : 'X • Discover what’s happening',
        description: 'See live reactions, breaking news, threads, and media on X.',
        image: user ? `https://unavatar.io/x/${user}` : undefined,
        platform: 'x',
        isOfflineFallback: isOffline,
        status: 'fallback',
      };
    }
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
    case 'github': {
      const cleanPath = pathname.replace(/^\//, '');
      return {
        url,
        domain: 'GitHub',
        title: cleanPath ? `GitHub: ${cleanPath}` : 'GitHub • Build and Ship Software',
        description: 'Explore open source code, repositories, issues, and developer projects.',
        image: cleanPath ? `https://opengraph.githubassets.com/1/${cleanPath}` : undefined,
        platform: 'github',
        isOfflineFallback: isOffline,
        status: 'fallback',
      };
    }
    case 'generic':
    default:
      return {
        url,
        domain,
        title: pathname ? `${domain}${pathname}` : domain,
        description: isOffline
          ? 'Link saved in document. Reconnect to the internet for live page details.'
          : 'External web page. Click to open in a new browser tab.',
        favicon: `https://www.google.com/s2/favicons?domain=${domain}&sz=64`,
        platform: 'generic',
        isOfflineFallback: isOffline,
        status: 'fallback',
      };
  }
}

/**
 * Multi-Tier Link Preview Fetcher:
 * Tier 0: In-memory & Persistent localStorage Cache (0ms latency, survives reloads)
 * Tier 1: Platform-specific direct resolvers (X/Twitter via vxtwitter + unavatar, YouTube HQ thumbnails)
 * Tier 2: Live OpenGraph metadata via Microlink with 2500ms timeout
 * Tier 3: Universal fallback with Google favicon / synthetic card
 */
export async function getLinkPreview(url: string): Promise<LinkPreviewData> {
  // Check memory & persistent storage cache first
  const cached = loadCachedPreview(url);
  if (cached && cached.status !== 'loading') {
    return cached;
  }

  const platform = detectPlatform(url);
  const isOnline = typeof navigator !== 'undefined' ? navigator.onLine : true;

  // If offline, instantly return fallback
  if (!isOnline) {
    const offlinePreview = generateSyntheticPreview(url, platform, true);
    saveCachedPreview(url, offlinePreview);
    return offlinePreview;
  }

  // Tier 1: Specialized platform resolvers
  if (platform === 'x') {
    const xPreview = await resolveXProfile(url);
    if (xPreview) {
      saveCachedPreview(url, xPreview);
      return xPreview;
    }
  }

  // YouTube instant thumbnail if video ID found
  const ytVideoId = extractYouTubeVideoId(url);
  if (platform === 'youtube' && ytVideoId) {
    const ytPreview: LinkPreviewData = {
      url,
      domain: 'YouTube',
      title: 'YouTube Video',
      description: 'Watch video, listen to music, and explore creator channels on YouTube.',
      image: `https://i.ytimg.com/vi/${ytVideoId}/hqdefault.jpg`,
      platform: 'youtube',
      isOfflineFallback: false,
      status: 'success',
    };
    saveCachedPreview(url, ytPreview);
    return ytPreview;
  }

  // Tier 2: Microlink API metadata fetch for general web pages
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

    if (response.ok) {
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
          favicon: data.logo?.url || `https://www.google.com/s2/favicons?domain=${extractCleanDomain(url)}&sz=64`,
          platform,
          isOfflineFallback: false,
          status: 'success',
        };

        saveCachedPreview(url, resolvedPreview);
        return resolvedPreview;
      }
    }
  } catch {
    // Microlink timed out or rate-limited -> fall back cleanly
  }

  // Tier 3: High quality synthetic fallback with domain favicon
  const fallbackPreview = generateSyntheticPreview(url, platform, false);
  saveCachedPreview(url, fallbackPreview);
  return fallbackPreview;
}
