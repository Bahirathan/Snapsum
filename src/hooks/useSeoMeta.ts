import { useEffect } from 'react';

export interface SeoMetaProps {
  title: string;
  description: string;
  keywords?: string;
  canonical?: string;
  ogType?: string;
  jsonLd?: Record<string, any>;
}

const DEFAULT_DOMAIN = 'https://www.zipytiny.app';

export function useSeoMeta({
  title,
  description,
  keywords,
  canonical,
  ogType = 'website',
  jsonLd,
}: SeoMetaProps) {
  useEffect(() => {
    // 1. Title
    if (title) {
      document.title = title;
    }

    // Helper to update or create meta tag
    const updateMeta = (selector: string, attribute: string, value: string) => {
      let element = document.querySelector(selector) as HTMLMetaElement | null;
      if (!element) {
        element = document.createElement('meta');
        if (selector.startsWith('meta[name=')) {
          const nameMatch = selector.match(/name="([^"]+)"/);
          if (nameMatch) element.setAttribute('name', nameMatch[1]);
        } else if (selector.startsWith('meta[property=')) {
          const propMatch = selector.match(/property="([^"]+)"/);
          if (propMatch) element.setAttribute('property', propMatch[1]);
        }
        document.head.appendChild(element);
      }
      element.setAttribute(attribute, value);
    };

    // 2. Meta Description
    if (description) {
      updateMeta('meta[name="description"]', 'content', description);
      updateMeta('meta[property="og:description"]', 'content', description);
      updateMeta('meta[name="twitter:description"]', 'content', description);
    }

    // 3. Meta Keywords
    if (keywords) {
      updateMeta('meta[name="keywords"]', 'content', keywords);
    }

    // 4. OpenGraph & Twitter Title
    if (title) {
      updateMeta('meta[property="og:title"]', 'content', title);
      updateMeta('meta[name="twitter:title"]', 'content', title);
    }

    // 5. OpenGraph Type
    updateMeta('meta[property="og:type"]', 'content', ogType);

    // 6. Canonical URL
    const canonicalUrl = canonical || (typeof window !== 'undefined' ? window.location.href.split('?')[0] : DEFAULT_DOMAIN);
    let linkCanonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!linkCanonical) {
      linkCanonical = document.createElement('link');
      linkCanonical.setAttribute('rel', 'canonical');
      document.head.appendChild(linkCanonical);
    }
    linkCanonical.setAttribute('href', canonicalUrl);
    updateMeta('meta[property="og:url"]', 'content', canonicalUrl);
    updateMeta('meta[name="twitter:url"]', 'content', canonicalUrl);

    // 7. Structured Data (JSON-LD)
    if (jsonLd) {
      let scriptLd = document.querySelector('script[type="application/ld+json"]') as HTMLScriptElement | null;
      if (!scriptLd) {
        scriptLd = document.createElement('script');
        scriptLd.setAttribute('type', 'application/ld+json');
        document.head.appendChild(scriptLd);
      }
      scriptLd.textContent = JSON.stringify(jsonLd, null, 2);
    }
  }, [title, description, keywords, canonical, ogType, jsonLd]);
}
