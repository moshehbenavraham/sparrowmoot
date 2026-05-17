/**
 * Lightweight per-route SEO helpers for the eventspark Vite + React SPA.
 *
 * The site doesn't ship with a Helmet-style provider, so we mutate the document
 * head directly inside a useEffect. The hook is idempotent: it updates the
 * existing meta tags from index.html when present and inserts them when missing,
 * so route-level overrides slot cleanly on top of the static defaults.
 */
import { useEffect } from "react";

/**
 * Canonical production URL. The hostname here is a best-effort guess based on
 * the repo slug — override it via VITE_PUBLIC_URL when the real host is known.
 */
export const SITE_URL: string =
  (import.meta.env.VITE_PUBLIC_URL as string | undefined)?.replace(/\/+$/, "") ||
  "https://eventspark.app";

export const SITE_NAME = "EventSpark";
export const SITE_DESCRIPTION =
  "Event management platform for branded registration pages, attendees, analytics, and AI-assisted copywriting.";
export const SITE_LOCALE = "en_US";

/** Default OG/Twitter card image — relative to SITE_URL. */
export const DEFAULT_OG_IMAGE_PATH = "/social-preview.svg";

export interface SeoOptions {
  /** Page-specific title. Will be templated as `${title} · ${SITE_NAME}` unless titleTemplate is overridden. */
  title?: string;
  /** Skip the `· ${SITE_NAME}` suffix when true (useful for the homepage). */
  isHome?: boolean;
  /** Per-page meta description. Falls back to SITE_DESCRIPTION. */
  description?: string;
  /** Site-relative or absolute path for canonical/OG URL. Defaults to current location.pathname. */
  path?: string;
  /** Absolute or site-relative image URL for OG/Twitter card. */
  image?: string;
  /** Open Graph type (e.g. "website", "article", "event"). */
  ogType?: string;
  /** When true, emits `<meta name="robots" content="noindex,nofollow">`. */
  noindex?: boolean;
}

function absoluteUrl(pathOrUrl: string | undefined): string | undefined {
  if (!pathOrUrl) return undefined;
  if (/^https?:\/\//i.test(pathOrUrl)) return pathOrUrl;
  const path = pathOrUrl.startsWith("/") ? pathOrUrl : `/${pathOrUrl}`;
  return `${SITE_URL}${path}`;
}

type MetaAttr = "name" | "property";

function upsertMeta(attr: MetaAttr, key: string, value: string | undefined) {
  if (typeof document === "undefined") return;
  const selector = `meta[${attr}="${key}"]`;
  let el = document.head.querySelector<HTMLMetaElement>(selector);
  if (value == null || value === "") {
    // Leave existing tags in place — only fill in / overwrite when we have a value.
    return;
  }
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute("content", value);
}

function upsertLink(rel: string, href: string | undefined) {
  if (typeof document === "undefined") return;
  const selector = `link[rel="${rel}"]`;
  let el = document.head.querySelector<HTMLLinkElement>(selector);
  if (!href) return;
  if (!el) {
    el = document.createElement("link");
    el.setAttribute("rel", rel);
    document.head.appendChild(el);
  }
  el.setAttribute("href", href);
}

/**
 * useSeo — update document.title plus key meta tags whenever the options change.
 *
 * Usage:
 *   useSeo({ title: "Register", description: "Save your spot.", noindex: true });
 */
export function useSeo(options: SeoOptions = {}): void {
  const {
    title,
    isHome = false,
    description,
    path,
    image,
    ogType = "website",
    noindex = false,
  } = options;

  useEffect(() => {
    if (typeof document === "undefined") return;

    const finalTitle = title
      ? isHome
        ? title
        : `${title} · ${SITE_NAME}`
      : SITE_NAME;
    document.title = finalTitle;

    const finalDescription = description?.trim() || SITE_DESCRIPTION;
    const finalPath =
      path ??
      (typeof window !== "undefined" ? window.location.pathname : "/");
    const canonical = absoluteUrl(finalPath);
    const finalImage = absoluteUrl(image ?? DEFAULT_OG_IMAGE_PATH);

    upsertMeta("name", "description", finalDescription);
    upsertMeta(
      "name",
      "robots",
      noindex ? "noindex,nofollow" : "index,follow",
    );

    upsertLink("canonical", canonical);

    // Open Graph
    upsertMeta("property", "og:title", finalTitle);
    upsertMeta("property", "og:description", finalDescription);
    upsertMeta("property", "og:type", ogType);
    upsertMeta("property", "og:url", canonical);
    upsertMeta("property", "og:site_name", SITE_NAME);
    upsertMeta("property", "og:locale", SITE_LOCALE);
    if (finalImage) upsertMeta("property", "og:image", finalImage);

    // Twitter
    upsertMeta("name", "twitter:card", "summary_large_image");
    upsertMeta("name", "twitter:title", finalTitle);
    upsertMeta("name", "twitter:description", finalDescription);
    if (finalImage) upsertMeta("name", "twitter:image", finalImage);
  }, [title, isHome, description, path, image, ogType, noindex]);
}

/**
 * buildSiteJsonLd — JSON-LD payload for the marketing site. Rendered inline
 * inside index.html so search engines see it without waiting for JS.
 */
export function buildSiteJsonLd(): string {
  return JSON.stringify({
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": `${SITE_URL}/#website`,
        url: SITE_URL,
        name: SITE_NAME,
        description: SITE_DESCRIPTION,
        inLanguage: "en",
      },
      {
        "@type": "Organization",
        "@id": `${SITE_URL}/#organization`,
        name: SITE_NAME,
        url: SITE_URL,
        logo: `${SITE_URL}${DEFAULT_OG_IMAGE_PATH}`,
      },
      {
        "@type": "SoftwareApplication",
        "@id": `${SITE_URL}/#app`,
        name: SITE_NAME,
        description: SITE_DESCRIPTION,
        applicationCategory: "BusinessApplication",
        operatingSystem: "Web",
        offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
      },
    ],
  });
}
