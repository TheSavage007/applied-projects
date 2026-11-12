/**
 * lead-capture.js
 * A 3-step lead/quote form with client-side validation, a configurable
 * service list, and submission via Netlify Forms or Formspree.
 *
 * No dependencies, no build step. ES module or plain <script> (window.initLeadCapture).
 *
 * Usage:
 *   initLeadCapture({
 *     mount: '#lead-form',
 *     services: ['Service One', 'Service Two', 'Service Three'],
 *     endpoint: { type: 'formspree', url: 'https://formspree.io/f/xxxxxxx' }
 *     // or { type: 'netlify', name: 'quote' }   // Netlify Forms
 *   });
 *
 * The 3 steps:
 *   1. What do you need?  (service + short description)
 *   2. When & where?      (preferred date/time + zip or address)
 *   3. Who are you?       (name, phone, email) -> submit
 */

const STEPS = ["need", "when", "who"];

function el(tag, attrs = {}, children = []) {
  const node = document.createElement(tag);
  Object.entries(attrs).forEach(([k, v]) => {
    if (k === "class") node.className = v;
    else if (k === "html") node.innerHTML = v;
    else if (k.startsWith("on") && typeof v === "function") {
      node.addEventListener(k.slice(2).toLowerCase(), v);
    } else if (v !== null && v !== undefined) {
      node.setAttribute(k, v);
    }
  });
  (Array.isArray(children) ? children : [children]).forEach((c) => {
    if (c == null) return;
    node.appendChild(typeof c === "string" ? document.createTextNode(c) : c);
  });
  return node;
}

function validEmail(v) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
}
function validPhone(v) {
  return (v.replace(/\D/g, "").length >= 10);
}

function initLeadCapture(options = {}) {
  const mount = document.querySelector(options.mount || "#lead-form");
  if (!mount) return null;

  const services = options.services || ["General inquiry"];
  const endpoint = options.endpoint || { type: "netlify", name: "quote" };
  const onSubmit = typeof options.onSubmit === "function" ? options.onSubmit : null;

  const state = {
    step: 0,
    data: { service: services[0], details: "", date: "", location: "", name: "", phone: "", email: "" }
  };

  function setError(container, msg) {
    const existing = container.querySelector(".lc-error");
    if (existing) existing.remove();
    if (msg) container.appendChild(el("p", { class: "lc-error", role: "alert" }, msg));
  }

  function validateStep() {
    const d = state.data;
    if (state.step === 0) {
      if (!d.service) return "Please choose a service.";
      if (!d.details.trim()) return "Tell us a little about what you need.";
    }
    if (state.step === 1) {
      if (!d.location.trim()) return "A zip code or address helps us quote travel.";
    }
    if (state.step === 2) {
      if (!d.name.trim()) return "Please enter your name.";
      if (!validPhone(d.phone)) return "Please enter a valid phone number.";
      if (!validEmail(d.email)) return "Please enter a valid email address.";
    }
    return null;
  }

  async function submit() {
    const d = state.data;
    try {
      let res;
      if (endpoint.type === "formspree") {
        res = await fetch(endpoint.url, {
          method: "POST",
          headers: { "Content-Type": "application/json", Accept: "application/json" },
          body: JSON.stringify(d)
        });
      } else {
        // Netlify Forms: urlencoded body with a form-name field.
        const body = new URLSearchParams({ "form-name": endpoint.name || "quote", ...d });
        res = await fetch("/", {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: body.toString()
        });
      }
      if (!res.ok) throw new Error("Request failed: " + res.status);
      if (onSubmit) onSubmit(d);
      renderDone();
    } catch (err) {
      setError(mount, "Something went wrong sending your request. Please call or try again.");
    }
  }

  function renderStep() {
    mount.innerHTML = "";
    const d = state.data;
    const wrap = el("div", { class: "lc-wrap" });

    // progress
    wrap.appendChild(
      el("div", { class: "lc-progress", "aria-label": "Step " + (state.step + 1) + " of 3" },
        STEPS.map((_, i) =>
          el("span", { class: "lc-dot" + (i <= state.step ? " is-active" : "") })
        )
      )
    );

    const fields = el("div", { class: "lc-fields" });

    if (state.step === 0) {
      fields.appendChild(el("label", {}, "What do you need?"));
      const sel = el("select", {
        onchange: (e) => { d.service = e.target.value; }
      }, services.map((s) => el("option", { value: s, selected: s === d.service ? "selected" : null }, s)));
      fields.appendChild(sel);
      fields.appendChild(el("label", {}, "Brief details"));
      fields.appendChild(el("textarea", {
        rows: "4", value: d.details,
        oninput: (e) => { d.details = e.target.value; }
      }));
      fields.querySelector("textarea").value = d.details;
    }

    if (state.step === 1) {
      fields.appendChild(el("label", {}, "Preferred date / time (optional)"));
      const dt = el("input", { type: "text", placeholder: "e.g. Tue morning", value: d.date,
        oninput: (e) => { d.date = e.target.value; } });
      fields.appendChild(dt);
      fields.appendChild(el("label", {}, "Zip code or address"));
      const loc = el("input", { type: "text", value: d.location,
        oninput: (e) => { d.location = e.target.value; } });
      fields.appendChild(loc);
    }

    if (state.step === 2) {
      fields.appendChild(el("label", {}, "Your name"));
      fields.appendChild(el("input", { type: "text", value: d.name,
        oninput: (e) => { d.name = e.target.value; } }));
      fields.appendChild(el("label", {}, "Phone"));
      fields.appendChild(el("input", { type: "tel", value: d.phone,
        oninput: (e) => { d.phone = e.target.value; } }));
      fields.appendChild(el("label", {}, "Email"));
      fields.appendChild(el("input", { type: "email", value: d.email,
        oninput: (e) => { d.email = e.target.value; } }));
    }

    wrap.appendChild(fields);

    // controls
    const controls = el("div", { class: "lc-controls" });
    if (state.step > 0) {
      controls.appendChild(el("button", { type: "button", class: "lc-back",
        onclick: () => { state.step--; renderStep(); } }, "Back"));
    }
    const nextLabel = state.step === 2 ? "Send request" : "Next";
    controls.appendChild(el("button", { type: "button", class: "lc-next",
      onclick: () => {
        const err = validateStep();
        if (err) { setError(wrap, err); return; }
        if (state.step === 2) submit();
        else { state.step++; renderStep(); }
      } }, nextLabel));
    wrap.appendChild(controls);

    mount.appendChild(wrap);
  }

  function renderDone() {
    mount.innerHTML = "";
    mount.appendChild(
      el("div", { class: "lc-done" }, [
        el("h3", {}, "Thanks — we got it."),
        el("p", {}, "We'll be in touch shortly to confirm the details.")
      ])
    );
  }

  renderStep();
  return { getData: () => ({ ...state.data }), reset: () => { state.step = 0; renderStep(); } };
}

if (typeof window !== "undefined") {
  window.initLeadCapture = initLeadCapture;
}

export { initLeadCapture };
