import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

interface RouteMeta {
  title: string;
  description: string;
}

const ROUTE_META: Record<string, RouteMeta> = {
  '/': {
    title: 'MD Writer — Local-First Markdown Studio with Gemini 3.x AI',
    description:
      'A clean, distraction-free Markdown studio with instant offline persistence, KaTeX math, Mermaid diagrams, and Mimo Gemini 3.x AI pair writer.',
  },
  '/changelog': {
    title: 'Changelog & Releases • MD Writer',
    description:
      'Explore official version releases, token economy updates, Mimo AI benchmarks, and feature upgrades in MD Writer.',
  },
  '/feedback': {
    title: 'Product Feedback & Issue Tracker • MD Writer',
    description:
      'Share feature ideas, report software defects, and help steer MD Writer development with direct community feedback.',
  },
  '/privacy': {
    title: 'Privacy Policy • MD Writer',
    description:
      'Our privacy commitment: 100% local-first IndexedDB storage, direct local disk access, zero third-party trackers, and AI privacy controls.',
  },
  '/terms': {
    title: 'Terms of Service • MD Writer',
    description:
      'Clear, honest, and developer-friendly terms of service for MD Writer local studio and optional cloud sync.',
  },
  '/documents': {
    title: 'My Documents • MD Writer',
    description:
      'Manage offline notes, browse local filesystem directories, and organize markdown documents in MD Writer.',
  },
  '/auth': {
    title: 'Sign In & Cloud Sync • MD Writer',
    description:
      'Sign in to MD Writer to enable multi-device encrypted backup and continuous note synchronization.',
  },
  '/pricing': {
    title: 'Pricing Architecture — Free Forever & Early-Bird Lifetime • MD Writer',
    description:
      'Transparent, developer-first pricing. 100% local-first core free forever, with early-bird lifetime license and pro cloud sync.',
  },
  '/blog': {
    title: 'Engineering & Technical Writing Blog • MD Writer',
    description:
      'Deep architectural analyses, LaTeX formatting cheatsheets, Mermaid.js tutorials, and plain-text benchmarks from the MD Writer team.',
  },
};

const DEFAULT_ORIGIN = 'https://writermd.vercel.app';

export const SeoManager: React.FC = () => {
  const location = useLocation();

  useEffect(() => {
    // 1. Determine clean path without trailing slash (except root)
    const pathname = location.pathname;
    const cleanPath = pathname.length > 1 && pathname.endsWith('/') ? pathname.slice(0, -1) : pathname;

    // Do not override title on public document view, editor, or individual blog post pages
    const isPublicDoc = cleanPath.startsWith('/p/') || cleanPath.startsWith('/share/');
    const isEditor = cleanPath.startsWith('/editor');
    const isBlogPost = cleanPath.startsWith('/blog/');

    const meta = ROUTE_META[cleanPath];

    if (meta && !isPublicDoc && !isEditor && !isBlogPost) {
      document.title = meta.title;

      const setMeta = (name: string, content: string, isProp = false) => {
        const attr = isProp ? 'property' : 'name';
        let el = document.querySelector(`meta[${attr}="${name}"]`);
        if (!el) {
          el = document.createElement('meta');
          el.setAttribute(attr, name);
          document.head.appendChild(el);
        }
        el.setAttribute('content', content);
      };

      setMeta('description', meta.description);
      setMeta('og:title', meta.title, true);
      setMeta('og:description', meta.description, true);
      setMeta('twitter:title', meta.title);
      setMeta('twitter:description', meta.description);
    }

    // 2. Synchronize Canonical URL & og:url strictly to the current route
    const canonicalUrl = `${DEFAULT_ORIGIN}${cleanPath}`;

    let canonicalEl = document.querySelector('link[rel="canonical"]');
    if (!canonicalEl) {
      canonicalEl = document.createElement('link');
      canonicalEl.setAttribute('rel', 'canonical');
      document.head.appendChild(canonicalEl);
    }
    canonicalEl.setAttribute('href', canonicalUrl);

    let ogUrlEl = document.querySelector('meta[property="og:url"]');
    if (!ogUrlEl) {
      ogUrlEl = document.createElement('meta');
      ogUrlEl.setAttribute('property', 'og:url');
      document.head.appendChild(ogUrlEl);
    }
    ogUrlEl.setAttribute('content', canonicalUrl);
  }, [location.pathname]);

  return null;
};
