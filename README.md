# Applied Projects: Generative AI and Web Engineering

A collection of production work built for real clients and real classrooms. Each project includes its own README with the problem, the approach, and how to run it.

| Project | Focus | Stack |
|---|---|---|
| [STEM Study Builder](stem-study-builder) | Generative AI application with schema validated LLM output | React, Anthropic API |
| [Web Modules](web-modules) | Reusable, dependency free front end modules for client sites | JavaScript (ES modules), Netlify |

## STEM Study Builder

A generative AI application that converts a topic, grade level, and difficulty into a structured practice set with an answer key. The engineering focus is reliability: strict JSON prompting, schema checks on every response, and handled failure states. See the [project README](stem-study-builder/README.md).

## Web Modules

These modules came out of two client engagements, a locksmith company site and the Oasis International site. The same core code now powers several related client builds, with project specific configuration layered on top. Every file drops into a static HTML site with no build step and no external dependencies.

**spa-router.js:** A lightweight single page navigation system using hash based routing. Handles active state styling on navigation links, scroll to top on route change (respecting reduced motion preferences), dynamic page titles, and works as both an ES module and a plain script include.

**lead-capture.js:** A three step lead capture flow (contact information, service details, review and submit) that qualifies leads before they reach the inbox. Includes client side validation, a configurable service list, and submission support for Netlify Forms or Formspree.

**concierge.js:** A rules based chat assistant that answers common visitor questions (pricing, hours, location, booking, contact) through ordered pattern matching, with no API key and no network calls. The same engine runs themed assistants across multiple client sites.

**site.config.js:** A single source of truth for business details, brand tokens, services, and SEO metadata, so a phone number, price, or color changes in one place. Includes a JSON-LD LocalBusiness schema generator and a travel fee calculator ported from the locksmith project's pricing logic.

## Deployment

**netlify.toml:** Netlify deployment settings with a single page app fallback so deep links resolve, security headers (X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy), and separate cache rules for static assets and HTML.
