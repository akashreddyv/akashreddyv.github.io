/* ============================================================
   reachakash.com — chat box (bottom right, beside the terminal bar)
   Answers common questions on its own: services, prices, referral codes
   (looked up in /referrals.json, so it always matches the Referrals page),
   sending money to India, suggestions, contact. Anything else, or anything
   typed after "Message Akash", goes to Akash by email through the contact
   endpoint (js/site-config.js, formEndpoint), with the visitor's email as
   the reply address if they give one, so he answers from his inbox.
   No server of its own: the conversation lives in this tab (sessionStorage).
   ============================================================ */
(function () {
  'use strict';

  const ENDPOINT = (window.SITE_CONFIG && window.SITE_CONFIG.formEndpoint) || 'https://api.reachakash.com/contact';
  const STORE = 'chat-log';
  const MAX_LEN = 2000;

  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const a = (href, text) => `<a href="${href}">${esc(text)}</a>`;

  // ── Fixed answers (HTML written here; visitor text never goes into them) ──
  const ANSWERS = {
    greet: "Hi! 👋 I'm the Reach Akash assistant, an automatic helper for this site (not Akash himself). Ask me about his services or referral codes, or tap <b>Message Akash</b> to reach him directly.",
    bot: "I'm an automated assistant for reachakash.com, not Akash. I answer the common questions, and anything else I pass to him by email.",
    services: `Reach Akash offers custom software, custom AI agents, AI coaching (one-on-one or team) and website development, from Detroit, Michigan. ${a('/services', 'See the services')}. Want a quote? Tap <b>Message Akash</b> and tell him what you need.`,
    website: `Akash builds fast, mobile-friendly websites, from a one-page site to a full business website. The price depends on the pages and features, so tell him about your project (tap <b>Message Akash</b>) and he'll send a quote. ${a('/services', 'Services')}`,
    price: "Every project is priced on what it needs. Tell Akash what you have in mind (tap <b>Message Akash</b>) and he'll reply with a quote.",
    ai: `Akash builds custom AI agents that use your documents and tools to handle repeat tasks, and coaches people and teams on using AI in everyday work. ${a('/services', 'Services')}`,
    coaching: `AI coaching is one-on-one or team sessions on using AI tools in your own work: better prompts, automating repeat tasks, and knowing where AI helps and where it doesn't. ${a('/services', 'Services')}`,
    referrals: `Akash's referral codes cover credit cards, investing, payments, sending money to India, cash back and AI tools: ${a('/referrals', 'all referral codes')}. Ask me about a company, like "Remitly code" or "Chase referral".`,
    suggest: `Ideas welcome! Type your suggestion here and I'll drop it in Akash's suggestion box (anonymous unless you add your email). Or use the ${a('/suggestions', 'suggestion box page')}.`,
    direct: "Sure. Type your message and I'll send it to Akash. He replies by email.",
    contact: `Message Akash right here (tap <b>Message Akash</b>), use the ${a('/contact', 'contact form')}, or email ${a('mailto:mail@reachakash.com', 'mail@reachakash.com')}.`,
    about: `Akash Reddy is a software developer from Hyderabad, now in Metro Detroit. He builds manufacturing test software and AI tools, and runs Reach Akash. ${a('/personal', 'More about Akash')}`,
    location: `Akash is based in Detroit, Michigan. ${a('/contact', 'Get in touch')}`,
    gallery: `The reachAkash logos and Akash's photos are in the ${a('/gallery', 'gallery')}, and you can spin the logo in 3D ${a('/projects/logodesigns?logo=reachakash', 'here')}.`,
    thanks: 'You\'re welcome! Anything else?',
    unknown: "I don't have an answer for that one. Want me to send your message to Akash? He replies by email."
  };

  // First match wins (referral companies are checked before these).
  const RULES = [
    [/\b(are you (a )?(bot|human|real|ai)|who are you)\b/, 'bot'],
    [/\b(india|indian|inr|rupees?|remit|remittance|send money|money transfer|transfer money)\b/, 'india'],
    [/\b(price|pricing|cost|costs|quote|how much|rates?|budget|charge)\b/, 'price'],
    [/\b(website|web ?site|web design|web dev\w*|landing page|online store|e-?commerce)\b/, 'website'],
    [/\b(coach|coaching|training|teach|workshop)\b/, 'coaching'],
    [/\b(ai|agents?|automation|automate|chatbot|gpt|llm)\b/, 'ai'],
    [/\b(referrals?|refer|promo|bonus|invite|codes?|coupons?|offers?|sign ?up)\b/, 'referrals'],
    [/\b(suggest|suggestions?|ideas?|feedback|features?|improve)\b/, 'suggest'],
    [/\b(contact|email|reach|call|phone|talk to|speak to|get in touch)\b/, 'contact'],
    [/\b(logos?|gallery|photos?|pictures?)\b/, 'gallery'],
    [/\b(who is akash|about akash|about you|akash)\b/, 'about'],
    [/\b(where|location|based|detroit|michigan)\b/, 'location'],
    [/\b(services?|hire|work with|build|develop|software|app|project)\b/, 'services'],
    [/^(hi|hello|hey|yo|hola|namaste|sup|good (morning|afternoon|evening))\b/, 'greet'],
    [/\b(thanks|thank you|thx|ty)\b/, 'thanks']
  ];

  const CHIPS = [
    ['Services', 'services'],
    ['Referral codes', 'referrals'],
    ['Send money to India', 'india'],
    ['Suggest an idea', 'suggest'],
    ['Message Akash', 'direct']
  ];

  // ── Referral data, from the same file the Referrals page is built from ──
  let referrals = null;
  function loadReferrals() {
    if (!referrals) {
      referrals = fetch('/referrals.json').then((r) => r.json()).then((d) => d.entries || []).catch(() => []);
    }
    return referrals;
  }
  const pathOf = (url) => { try { return new URL(url).pathname; } catch (e) { return '/referrals'; } };
  const offerLine = (e) => `<b>${esc(e.name)}</b>: ${e.code ? `code <code>${esc(e.code)}</code>` : 'no code needed, just the link'}. ${esc(e.forYou.charAt(0).toUpperCase() + e.forYou.slice(1))}. ${a(pathOf(e.page), 'Details and sign-up')}`;
  // Words that name a company: its id ("cash app") and its first word ("remitly"), minus generic words.
  const GENERIC = new Set(['cash', 'the', 'my', 'send', 'card']);
  function companyMatches(text, entries) {
    return entries.filter((e) => {
      const keys = [e.id.replace(/-/g, ' '), e.name.split(/[\s(/]/)[0].toLowerCase()].filter((k) => k.length > 2 && !GENERIC.has(k));
      return keys.some((k) => new RegExp('\\b' + k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\b').test(text));
    });
  }

  // ── DOM ──
  let launcher, panel, log, input, chips;
  let mode = null;          // null, 'direct' (next message goes to Akash) or 'suggest'
  let history = [];         // [{ who: 'bot' | 'me', html }]

  function save() { try { sessionStorage.setItem(STORE, JSON.stringify(history.slice(-40))); } catch (e) {} }
  function restore() { try { history = JSON.parse(sessionStorage.getItem(STORE) || '[]'); } catch (e) { history = []; } }

  function bubble(who, html, keep) {
    const div = document.createElement('div');
    div.className = 'chat-msg ' + who;
    div.innerHTML = html;
    log.appendChild(div);
    log.scrollTop = log.scrollHeight;
    if (keep !== false) { history.push({ who, html }); save(); }
    return div;
  }
  const say = (html) => bubble('bot', html);

  function build() {
    launcher = document.createElement('button');
    launcher.id = 'chat-launcher';
    launcher.type = 'button';
    launcher.title = 'Chat with Reach Akash';
    launcher.setAttribute('aria-label', 'Chat with Reach Akash');
    launcher.setAttribute('aria-expanded', 'false');
    launcher.setAttribute('aria-controls', 'chat-panel');
    launcher.innerHTML = '<svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true" focusable="false"><path d="M4 5.5A2.5 2.5 0 0 1 6.5 3h11A2.5 2.5 0 0 1 20 5.5v8a2.5 2.5 0 0 1-2.5 2.5H10l-4.2 3.6c-.5.4-1.3 0-1.3-.6V16A2.5 2.5 0 0 1 4 13.5z" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/><path d="M8.5 8.5h7M8.5 11.5h4.5" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/></svg>';

    panel = document.createElement('div');
    panel.id = 'chat-panel';
    panel.hidden = true;
    panel.setAttribute('role', 'dialog');
    panel.setAttribute('aria-label', 'Chat with Reach Akash');
    panel.innerHTML = [
      '<div class="chat-head">',
      '  <div><p class="chat-title">Reach Akash</p><p class="chat-sub">Automatic answers · Akash replies by email</p></div>',
      '  <button class="chat-close" type="button" aria-label="Close chat">✕</button>',
      '</div>',
      '<div class="chat-log" role="log" aria-live="polite"></div>',
      '<div class="chat-chips"></div>',
      '<form class="chat-input" novalidate>',
      '  <label class="visually-hidden" for="chat-text">Your message</label>',
      `  <input id="chat-text" type="text" maxlength="${MAX_LEN}" autocomplete="off" placeholder="Ask something…">`,
      '  <button class="chat-send" type="submit" aria-label="Send"><svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" focusable="false"><path d="M4 12h14M12 5l7 7-7 7" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg></button>',
      '</form>'
    ].join('');

    document.body.appendChild(launcher);
    document.body.appendChild(panel);
    log = panel.querySelector('.chat-log');
    input = panel.querySelector('#chat-text');
    chips = panel.querySelector('.chat-chips');

    CHIPS.forEach(([label, key]) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'chat-chip';
      b.textContent = label;
      b.addEventListener('click', () => { bubble('me', esc(label)); answerKey(key); });
      chips.appendChild(b);
    });

    launcher.addEventListener('click', () => (panel.hidden ? open() : close()));
    panel.querySelector('.chat-close').addEventListener('click', close);
    panel.addEventListener('keydown', (e) => { if (e.key === 'Escape') { e.preventDefault(); close(); } });
    panel.querySelector('.chat-input').addEventListener('submit', (e) => {
      e.preventDefault();
      const text = input.value.trim().slice(0, MAX_LEN);
      if (!text) return;
      input.value = '';
      bubble('me', esc(text));
      respond(text);
    });
  }

  function open() {
    panel.hidden = false;
    launcher.setAttribute('aria-expanded', 'true');
    if (!log.childElementCount) {
      if (history.length) history.forEach((m) => bubble(m.who, m.html, false));
      else say(ANSWERS.greet);
    }
    input.focus();
  }
  function close() {
    panel.hidden = true;
    launcher.setAttribute('aria-expanded', 'false');
    launcher.focus();
  }

  // ── Answers ──
  async function answerKey(key) {
    mode = key === 'direct' ? 'direct' : key === 'suggest' ? 'suggest' : null;
    if (key === 'india') {
      const india = (await loadReferrals()).filter((e) => e.category === 'send-money-to-india');
      say(india.length
        ? 'Apps for sending money to India, each with a referral bonus:<br>' + india.map(offerLine).join('<br>') + `<br>${a('/referrals/send-money-to-india', 'Compare them side by side')}`
        : `See ${a('/referrals/send-money-to-india', 'apps for sending money to India')}.`);
      return;
    }
    say(ANSWERS[key]);
  }

  async function respond(raw) {
    if (mode === 'direct' || mode === 'suggest') { offerToSend(raw, mode); return; }
    const text = raw.toLowerCase();
    const companies = companyMatches(text, await loadReferrals());
    if (companies.length) { say(companies.slice(0, 4).map(offerLine).join('<br>')); return; }
    const rule = RULES.find(([re]) => re.test(text));
    if (rule) { answerKey(rule[1]); return; }
    say(ANSWERS.unknown);
    offerToSend(raw, 'direct');
  }

  // A small form inside the chat: optional email, then send to Akash (or into the suggestion box).
  function offerToSend(text, kind) {
    mode = null;
    const box = bubble('bot', '', false);
    box.classList.add('chat-send-box');
    box.innerHTML = [
      `<p>${kind === 'suggest' ? 'Send this to Akash\'s suggestion box?' : 'Send this to Akash?'}</p>`,
      '<label class="visually-hidden" for="chat-email">Your email (optional)</label>',
      '<input id="chat-email" type="email" maxlength="254" placeholder="Your email, if you\'d like a reply" autocomplete="email">',
      '<div class="chat-send-actions"><button type="button" class="chat-do-send">Send to Akash</button><button type="button" class="chat-cancel">No thanks</button></div>',
      '<p class="chat-send-status" role="status"></p>'
    ].join('');
    const email = box.querySelector('#chat-email'), status = box.querySelector('.chat-send-status');
    const sendBtn = box.querySelector('.chat-do-send');
    box.querySelector('.chat-cancel').addEventListener('click', () => { box.remove(); say('No problem, nothing was sent.'); });
    sendBtn.addEventListener('click', async () => {
      const addr = email.value.trim();
      if (addr && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(addr)) { status.textContent = 'That email doesn\'t look right. Fix it, or leave it empty.'; return; }
      sendBtn.disabled = true;
      status.textContent = 'Sending…';
      try {
        if (kind === 'suggest' && typeof window.sendSuggestion === 'function') {
          await window.sendSuggestion({ idea: text, email: addr, via: 'the chat box' });
        } else {
          await sendToAkash(text, addr);
        }
        box.remove();
        say(addr
          ? `✓ Sent. Akash will reply to <b>${esc(addr)}</b>.`
          : '✓ Sent. You didn\'t add an email, so he can\'t reply directly. Send another message with your email if you\'d like an answer.');
      } catch (err) {
        sendBtn.disabled = false;
        status.innerHTML = `Couldn't send that (${esc(err.message)}). Try again, or use the ${a('/contact', 'contact form')}.`;
      }
    });
    email.focus();
  }

  async function sendToAkash(text, addr) {
    const transcript = history.slice(-10).map((m) => (m.who === 'me' ? 'Visitor: ' : 'Bot: ') + m.html.replace(/<[^>]+>/g, '').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'")).join('\n');
    const fd = new FormData();
    fd.set('name', 'Website chat');
    fd.set('email', addr || 'no-reply@reachakash.com');
    fd.set('message',
      'Chat message · sent from the chat box on reachakash.com' + location.pathname + '\n' +
      (addr ? 'Reply to: ' + addr : '(No email given, so there is no reply address.)') +
      '\n\n' + text + '\n\n— The chat so far —\n' + transcript);
    const res = await fetch(ENDPOINT, { method: 'POST', body: fd });
    let data = {};
    try { data = await res.json(); } catch (e) { /* handled below */ }
    if (!res.ok || !data.success) throw new Error(data.error || 'the server didn\'t answer');
  }

  // The terminal's `chat` command opens this.
  window.openChat = function () { if (panel && panel.hidden) open(); };

  function init() { restore(); build(); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
