/**
 * concierge.js
 * A tiny rules-based concierge/assistant widget. Ordered pattern matching
 * against a configurable rule set — NO API key, NO network calls, fully offline.
 *
 * Good for a lightweight site helper that answers common questions
 * (hours, pricing, service area, how to book) without an LLM backend.
 *
 * ES module or plain <script> (window.initConcierge).
 *
 * Usage:
 *   initConcierge({
 *     mount: '#concierge',
 *     greeting: 'Hi! Ask me about hours, pricing, or booking.',
 *     rules: [
 *       { patterns: [/hour|open|close/i], reply: 'We're open Mon-Fri 8-6, Sat 9-2.' },
 *       { patterns: [/price|cost|quote/i], reply: 'Most jobs start at $75. Tell me what you need for a quote.' },
 *       { patterns: [/area|where|travel/i], reply: 'We serve the Phoenix metro. Travel beyond 10 miles adds a small fee.' }
 *     ],
 *     fallback: 'I'm not sure about that — tap "Get a quote" and a human will follow up.'
 *   });
 *
 * Rules are evaluated top to bottom; the FIRST rule whose any pattern matches wins,
 * so put more specific rules first.
 */

function ce(tag, cls, text) {
  const n = document.createElement(tag);
  if (cls) n.className = cls;
  if (text != null) n.textContent = text;
  return n;
}

function matchRule(input, rules) {
  const text = String(input || "");
  for (const rule of rules) {
    const pats = rule.patterns || [];
    for (const p of pats) {
      if (p instanceof RegExp ? p.test(text) : text.toLowerCase().includes(String(p).toLowerCase())) {
        return rule;
      }
    }
  }
  return null;
}

function initConcierge(options = {}) {
  const mount = document.querySelector(options.mount || "#concierge");
  if (!mount) return null;

  const rules = options.rules || [];
  const greeting = options.greeting || "Hi! How can I help?";
  const fallback = options.fallback || "I'm not sure about that one. Try rephrasing, or reach out directly.";
  const onMessage = typeof options.onMessage === "function" ? options.onMessage : null;

  mount.innerHTML = "";
  const panel = ce("div", "cg-panel");
  const log = ce("div", "cg-log");
  log.setAttribute("role", "log");
  log.setAttribute("aria-live", "polite");
  panel.appendChild(log);

  function addMsg(text, who) {
    const row = ce("div", "cg-msg cg-" + who);
    row.appendChild(ce("span", "cg-bubble", text));
    log.appendChild(row);
    log.scrollTop = log.scrollHeight;
  }

  addMsg(greeting, "bot");

  const form = ce("form", "cg-form");
  const input = ce("input", "cg-input");
  input.type = "text";
  input.placeholder = "Type a question...";
  input.setAttribute("aria-label", "Ask the concierge");
  const send = ce("button", "cg-send", "Send");
  send.type = "submit";
  form.appendChild(input);
  form.appendChild(send);

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const q = input.value.trim();
    if (!q) return;
    addMsg(q, "user");
    input.value = "";
    const rule = matchRule(q, rules);
    const reply = rule ? rule.reply : fallback;
    // small delay feels conversational, still synchronous logic
    setTimeout(() => addMsg(reply, "bot"), 150);
    if (onMessage) onMessage(q, rule ? reply : null);
  });

  panel.appendChild(form);
  mount.appendChild(panel);

  return {
    ask: (q) => {
      const rule = matchRule(q, rules);
      return rule ? rule.reply : fallback;
    }
  };
}

if (typeof window !== "undefined") {
  window.initConcierge = initConcierge;
}

export { initConcierge };
