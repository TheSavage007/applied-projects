/**
 * spa-router.js
 * Minimal hash-based single-page-app router for a no-build static site.
 *
 * Features:
 *  - Hash routing (#/, #/services, #/contact ...) — refresh-safe, no server config.
 *  - Active nav state: adds .is-active to the matching [data-route] link.
 *  - Scroll to top on navigation, unless the user prefers reduced motion.
 *  - Dynamic document.title per route.
 *  - Works as an ES module (import { initRouter }) or a plain <script> (window.initRouter).
 *
 * Usage:
 *   initRouter({
 *     routes: {
 *       '/':        { view: 'home',     title: 'Home' },
 *       '/services':{ view: 'services', title: 'Services' },
 *       '/contact': { view: 'contact',  title: 'Contact' }
 *     },
 *     titleBase: 'Business Name',
 *     onRoute: (route, path) => { ... }   // optional hook
 *   });
 *
 * Markup contract:
 *   - Nav links: <a href="#/services" data-route="/services">Services</a>
 *   - Views:     <section data-view="services"> ... </section>  (hidden unless active)
 */

function normalizePath(hash) {
  let p = (hash || "").replace(/^#/, "");
  if (!p.startsWith("/")) p = "/" + p;
  // strip trailing slash except for root
  if (p.length > 1 && p.endsWith("/")) p = p.slice(0, -1);
  return p;
}

function prefersReducedMotion() {
  return (
    typeof window !== "undefined" &&
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

function initRouter(options = {}) {
  const routes = options.routes || { "/": { view: "home", title: "Home" } };
  const titleBase = options.titleBase || document.title || "";
  const notFound = options.notFound || "/";
  const onRoute = typeof options.onRoute === "function" ? options.onRoute : null;

  function render() {
    let path = normalizePath(window.location.hash);
    let route = routes[path];

    if (!route) {
      path = notFound;
      route = routes[path] || Object.values(routes)[0];
    }

    // Toggle views
    const views = document.querySelectorAll("[data-view]");
    views.forEach((el) => {
      const match = el.getAttribute("data-view") === route.view;
      el.hidden = !match;
      if (match) el.setAttribute("aria-current", "page");
      else el.removeAttribute("aria-current");
    });

    // Active nav state
    const links = document.querySelectorAll("[data-route]");
    links.forEach((a) => {
      const active = a.getAttribute("data-route") === path;
      a.classList.toggle("is-active", active);
      if (active) a.setAttribute("aria-current", "page");
      else a.removeAttribute("aria-current");
    });

    // Title
    document.title = route.title
      ? (titleBase ? route.title + " | " + titleBase : route.title)
      : titleBase;

    // Scroll to top (respect reduced motion)
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: prefersReducedMotion() ? "auto" : "smooth"
    });

    if (onRoute) onRoute(route, path);
  }

  window.addEventListener("hashchange", render);
  window.addEventListener("DOMContentLoaded", render);

  // If the DOM is already parsed when initRouter runs, render immediately.
  if (document.readyState !== "loading") render();

  // Ensure there is always a hash so refreshes land on a known route.
  if (!window.location.hash) window.location.replace("#/");

  return { render, navigate: (p) => { window.location.hash = "#" + normalizePath(p); } };
}

if (typeof window !== "undefined") {
  window.initRouter = initRouter;
}

export { initRouter };
