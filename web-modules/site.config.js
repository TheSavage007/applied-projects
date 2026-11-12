/**
 * site.config.js
 * Single source of truth for business details, brand tokens, services,
 * and SEO metadata. Change a phone number, price, or color in one place.
 *
 * Works as an ES module (import { siteConfig } from './site.config.js')
 * or as a plain script include (window.siteConfig).
 */

const siteConfig = {
  business: {
    name: "Business Name",
    legalName: "Business Name LLC",
    tagline: "Your tagline here",
    phone: "(000) 000-0000",
    email: "hello@example.com",
    url: "https://example.com",
    address: {
      street: "0000 Example St",
      city: "Phoenix",
      region: "AZ",
      postalCode: "85000",
      country: "US"
    },
    geo: { lat: 33.4484, lng: -112.0740 },
    hours: "Mo-Fr 08:00-18:00, Sa 09:00-14:00",
    priceRange: "$$"
  },

  brand: {
    colorBg: "#12201F",
    colorSurface: "#193130",
    colorPrimary: "#5FBFB5",
    colorAccent: "#C8960C",
    colorText: "#F3F6F5",
    fontDisplay: "'Cormorant Garamond', Georgia, serif",
    fontBody: "'Inter', system-ui, sans-serif"
  },

  services: [
    { id: "service-1", name: "Service One", base: 75 },
    { id: "service-2", name: "Service Two", base: 120 },
    { id: "service-3", name: "Service Three", base: 200 }
  ],

  // Flat per-mile fee applied beyond the free radius.
  travel: { freeRadiusMiles: 10, perMile: 2.5 },

  seo: {
    title: "Business Name | Your tagline here",
    description: "Short description of what the business does and where.",
    ogImage: "https://example.com/og.jpg"
  }
};

/**
 * Travel fee for a given distance in miles.
 * Ported from the locksmith project's pricing logic.
 */
function travelFee(miles, cfg = siteConfig) {
  const { freeRadiusMiles, perMile } = cfg.travel;
  if (!Number.isFinite(miles) || miles <= freeRadiusMiles) return 0;
  return Math.round((miles - freeRadiusMiles) * perMile * 100) / 100;
}

/**
 * JSON-LD LocalBusiness schema generator.
 * Inject the return value into a <script type="application/ld+json"> tag.
 */
function localBusinessSchema(cfg = siteConfig) {
  const b = cfg.business;
  return {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: b.name,
    legalName: b.legalName,
    telephone: b.phone,
    email: b.email,
    url: b.url,
    priceRange: b.priceRange,
    openingHours: b.hours,
    address: {
      "@type": "PostalAddress",
      streetAddress: b.address.street,
      addressLocality: b.address.city,
      addressRegion: b.address.region,
      postalCode: b.address.postalCode,
      addressCountry: b.address.country
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: b.geo.lat,
      longitude: b.geo.lng
    }
  };
}

if (typeof window !== "undefined") {
  window.siteConfig = siteConfig;
  window.travelFee = travelFee;
  window.localBusinessSchema = localBusinessSchema;
}

export { siteConfig, travelFee, localBusinessSchema };
