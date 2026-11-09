/* ============================================================
   reachakash.com — chat box (bottom right, beside the terminal bar)
   Akash's assistant: answers common questions on its own (services,
   referral codes from /referrals.json, sending money to India, about
   Akash, suggestions), greets by time of day and page, and remembers a
   visitor's name for the visit. Anything else, or anything typed after
   "Message Akash", goes to Akash by email through the contact endpoint
   (js/site-config.js), with the visitor's email as the reply address.
   No server of its own and no AI model: fixed answers, so it never makes
   things up. The conversation lives in this tab (sessionStorage).
   ============================================================ */
(function () {
  'use strict';

  const CONFIG = window.SITE_CONFIG;
  const STORE = 'chat-log', NAME_STORE = 'chat-name';
  const MAX_LEN = 2000;

  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const a = (href, text) => `<a href="${href}">${esc(text)}</a>`;

  // The red part of the reachAkash mark (the red step and the curve), small enough for a button.
  const MARK = '<svg class="chat-mark" viewBox="231 360 614 524" aria-hidden="true" focusable="false"><path fill="var(--logo-ember)" d="M833 372L791 372L751 384L706 410L667 445L627 493L593 546L560 611L539 670L526 732L526 784L537 835L557 872L689 872L657 863L627 849L601 828L583 801L572 769L567 726L570 682L581 628L602 565L626 515L656 469L685 436L719 408L748 391L789 377L833 372Z"/><path fill="var(--logo-ember)" d="M485,720L516,691L516,666L299,666L243,694L243,720Z"/></svg>';
  // The AI touch: a sparkle.
  const SPARK = '<svg class="chat-spark" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path fill="currentColor" d="M10 3c.8 4.6 2.6 6.4 7.2 7.2C12.6 11 10.8 12.8 10 17.4 9.2 12.8 7.4 11 2.8 10.2 7.4 9.4 9.2 7.6 10 3z"/><path fill="currentColor" d="M18.5 13c.4 2.2 1.2 3 3.4 3.4-2.2.4-3 1.2-3.4 3.4-.4-2.2-1.2-3-3.4-3.4 2.2-.4 3-1.2 3.4-3.4z"/></svg>';

  // ── Fixed answers (HTML written here; visitor text never goes into them) ──
  const ANSWERS = {
    bot: "I'm Akash's assistant on this site: automatic answers, not Akash himself. Ask me anything, and whatever I can't answer I'll pass straight to his inbox.",
    services: `Akash builds custom software, custom AI agents and websites, and coaches people on using AI in their own work. By day he writes R&D and manufacturing test software, so he builds things that have to just work. ${a('/services', 'See the services')}, or tap <b>Message Akash</b> and tell him what you need.`,
    website: `Akash builds fast, mobile-friendly websites, from a one-page site to a full business site (this one is his work too). Tell him about your project with <b>Message Akash</b> and he'll send a quote. ${a('/services/website-development', 'Website development')}`,
    price: "Every project is priced on what it needs, so there's no fixed price list. Tell Akash what you have in mind (tap <b>Message Akash</b>) and he'll reply with a quote.",
    ai: `Akash is an AI enthusiast: he builds custom AI agents that work with your documents and tools to take repeat tasks off your plate, and he coaches people and teams on using AI day to day. ${a('/services/ai-agents', 'Custom AI agents')}`,
    coaching: `AI coaching with Akash is one-on-one or team sessions on using AI in your own work: better prompts, automating repeat tasks, and knowing where AI helps and where it doesn't. ${a('/services/ai-coaching', 'AI coaching')}`,
    referrals: `Akash shares his referral codes for credit cards, investing, payments, sending money to India, cash back and AI tools: ${a('/referrals', 'all referral codes')}. Ask me about a company, like "Remitly" or "Chase".`,
    suggest: `Akash would love your idea! Type it here and I'll drop it in his suggestion box (anonymous unless you add your email). Or use the ${a('/suggestions', 'suggestion box page')}.`,
    direct: "Sure, type your message and I'll send it straight to Akash. He replies by email.",
    contact: `Message Akash right here (tap <b>Message Akash</b>), use the ${a('/contact', 'contact form')}, or email ${a('mailto:' + CONFIG.contactEmail, CONFIG.contactEmail)}.`,
    about: `Akash Reddy is a software developer from Hyderabad, India, now in Metro Detroit. He's an AI Software Developer at Molex, building R&D and manufacturing test software, and Reach Akash is his own studio for software, AI agents and websites. ${a('/personal', 'More about Akash')}`,
    origin: `Akash grew up in Hyderabad, India, and now lives in Metro Detroit, Michigan. ${a('/personal', 'His story')}`,
    location: `Akash is based in Metro Detroit, Michigan. ${a('/contact', 'Get in touch')}`,
    education: `Akash has a master's in Engineering Management from Arkansas State University, and also studied at Amity University and Malla Reddy College of Engineering and Technology. ${a('/professional', 'His background')}`,
    work: `Akash is an AI Software Developer at Molex. Before that he built software at Zoetis, Raptor Consultants Group, Tata Consultancy Services and Persistent Systems. ${a('/professional', 'The full story')}`,
    fun: 'Try the terminal: tap <b>Open the terminal</b> at the bottom of the page (or press <code>~</code>), then type <code>play</code>. Akash hid a little game in there.',
    gallery: `Akash's photos and the reachAkash logos are in the ${a('/gallery', 'gallery')}, and you can spin the logo in 3D ${a('/projects/logodesigns?logo=reachakash', 'here')}.`,
    howareyou: "Doing great, thanks for asking! What can I help you with?",
    unknown: "Hmm, I don't have an answer for that one. Want me to send it to Akash? He replies by email."
  };

  // First match wins (referral companies are checked before these).
  const RULES = [
    [/\b(are you (a )?(bot|human|real|ai)|who are you)\b/, 'bot'],
    [/\bhow are (you|u)\b|\bhow'?s it going\b/, 'howareyou'],
    [/\b(where is (he|akash) from|is (he|akash) from|hometown|grew up|originally from|hyderabad)\b/, 'origin'],
    [/\b(india|indian|inr|rupees?|remit|remittance|send money|money transfer|transfer money)\b/, 'india'],
    [/\b(price|pricing|cost|costs|quote|how much|rates?|budget|charge)\b/, 'price'],
    [/\b(website|web ?site|web design|web dev\w*|landing page|online store|e-?commerce)\b/, 'website'],
    [/\b(coach|coaching|training|teach|workshop)\b/, 'coaching'],
    [/\b(ai|agents?|automation|automate|chatbot|gpt|llm)\b/, 'ai'],
    [/\b(referrals?|refer|promo|bonus|invite|codes?|coupons?|offers?|sign ?up)\b/, 'referrals'],
    [/\b(suggest|suggestions?|ideas?|feedback|features?|improve)\b/, 'suggest'],
    [/\b(contact|email|reach|call|phone|talk to|speak to|get in touch)\b/, 'contact'],
    [/\b(logos?|gallery|photos?|pictures?)\b/, 'gallery'],
    [/\b(stud(y|ied|ies)|education|degree|college|university|school|masters?|graduat\w*)\b/, 'education'],
    [/\b(experience|worked|work history|career|resume|cv|jobs?|employer|molex|background)\b/, 'work'],
    [/\b(fun|bored|joke|game|play|terminal|easter egg|secret)\b/, 'fun'],
    [/\b(who is akash|about akash|about you|akash)\b/, 'about'],
    [/\b(where|location|based|detroit|michigan)\b/, 'location'],
    [/\b(services?|hire|work with|build|develop|software|app|project)\b/, 'services'],
    [/^(hi|hello|hey|yo|hola|namaste|namaskaram|sup|good (morning|afternoon|evening))\b/, 'greet'],
    [/\b(thanks|thank you|thx|ty)\b/, 'thanks']
  ];

  const CHIPS = [
    ['About Akash', 'about'],
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

  // ── A visitor's first name, if they say it ("I'm Sam", "my name is Sam") ──
  const NOT_NAMES = new Set(['looking', 'interested', 'here', 'trying', 'not', 'good', 'fine', 'great', 'ok', 'okay', 'just',
    'new', 'from', 'in', 'a', 'an', 'the', 'so', 'very', 'really', 'sorry', 'back', 'done', 'bored', 'curious', 'wondering',
    'thinking', 'glad', 'happy', 'sure', 'well', 'doing', 'also', 'still', 'going', 'planning', 'hoping', 'working']);
  function nameIn(raw) {
    const m = raw.trim().match(/^(?:(?:hi|hello|hey)[\s,!.]+)?(?:my name is|my name's|i am|i'm|im|this is|call me)\s+([a-z][a-z'-]{1,20})(?:\s+[a-z][a-z'-]{1,20})?[\s.!]*$/i);
    if (!m || NOT_NAMES.has(m[1].toLowerCase())) return null;
    return /[A-Z]/.test(m[1]) ? m[1] : m[1].charAt(0).toUpperCase() + m[1].slice(1);
  }

  // ── DOM ──
  let launcher, panel, log, input, chips;
  let mode = null;          // null, 'direct' (next message goes to Akash) or 'suggest'
  let history = [];         // [{ who: 'bot' | 'me', html }]
  let visitor = '';         // their first name, once they've said it
  let queue = Promise.resolve();   // replies wait their turn, so they always appear in order

  function save() { try { sessionStorage.setItem(STORE, JSON.stringify(history.slice(-40))); sessionStorage.setItem(NAME_STORE, visitor); } catch (e) {} }
  function restore() {
    try { history = JSON.parse(sessionStorage.getItem(STORE) || '[]'); visitor = sessionStorage.getItem(NAME_STORE) || ''; }
    catch (e) { history = []; }
  }
  const you = () => (visitor ? ', ' + esc(visitor) : '');

  function bubble(who, html, keep) {
    const div = document.createElement('div');
    div.className = 'chat-msg ' + who;
    div.innerHTML = html;
    log.appendChild(div);
    log.scrollTop = log.scrollHeight;
    if (keep !== false) { history.push({ who, html }); save(); }
    return div;
  }
  // A reply: a short "typing" pause, then the message.
  function say(html) {
    queue = queue.then(() => new Promise((done) => {
      const dots = bubble('bot chat-typing', '<span></span><span></span><span></span>', false);
      setTimeout(() => { dots.remove(); bubble('bot', html); done(); }, 450);
    }));
    return queue;
  }

  // The first hello: by the visitor's time of day, and about the page they're on.
  function greeting() {
    const h = new Date().getHours();
    const hello = h >= 5 && h < 12 ? 'Good morning' : h >= 12 && h < 17 ? 'Good afternoon' : h >= 17 && h < 22 ? 'Good evening' : 'Hi';
    const p = location.pathname;
    const lead = /^\/referrals/.test(p) ? 'Looking for a referral code? Tell me the company (like "Remitly" or "Chase") and I\'ll pull it up.'
      : /^\/(services|contact)/.test(p) ? 'Thinking about a project? Tell me what you have in mind and I\'ll pass it straight to Akash.'
      : /^\/suggestions/.test(p) ? 'Got an idea? Type it here and I\'ll drop it in Akash\'s suggestion box.'
      : /^\/(personal|professional)/.test(p) ? 'Curious about Akash? Ask me about his work, where he studied or where he\'s from.'
      : 'I can tell you about Akash and his work, find a referral code, or pass a message straight to him.';
    return `${hello}${you()}! 👋 I'm Akash's assistant. ${lead}`;
  }

  function build() {
    launcher = document.createElement('button');
    launcher.id = 'chat-launcher';
    launcher.type = 'button';
    launcher.title = 'Chat with Akash\'s assistant';
    launcher.setAttribute('aria-label', 'Chat with Akash\'s assistant');   // no visible text: the mark and the sparkle
    launcher.setAttribute('aria-expanded', 'false');
    launcher.setAttribute('aria-controls', 'chat-panel');
    launcher.innerHTML = MARK + SPARK;

    panel = document.createElement('div');
    panel.id = 'chat-panel';
    panel.hidden = true;
    panel.setAttribute('role', 'dialog');
    panel.setAttribute('aria-label', 'Chat with Akash\'s assistant');
    panel.innerHTML = [
      '<div class="chat-head">',
      `  <div class="chat-id">${MARK}<div><p class="chat-title">Akash's assistant ${SPARK}</p><p class="chat-sub">Instant answers · Akash replies by email</p></div></div>`,
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
      else say(greeting());
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
    if (key === 'greet') { say(`Hi${you()}! What can I help you with?`); return; }
    if (key === 'thanks') { say(`You're welcome${you()}! Anything else?`); return; }
    say(ANSWERS[key]);
  }

  async function respond(raw) {
    if (mode === 'direct' || mode === 'suggest') { offerToSend(raw, mode); return; }
    const name = nameIn(raw);
    if (name) { visitor = name; save(); say(`Nice to meet you, ${esc(name)}! 😊 What can I help you with?`); return; }
    const text = raw.toLowerCase();
    const companies = companyMatches(text, await loadReferrals());
    if (companies.length) { say(companies.slice(0, 4).map(offerLine).join('<br>')); return; }
    const rule = RULES.find(([re]) => re.test(text));
    if (rule) { answerKey(rule[1]); return; }
    say(ANSWERS.unknown);
    offerToSend(raw, 'direct');
  }

  // A small form inside the chat, after any reply in progress: optional email, then send to
  // Akash (or into the suggestion box).
  function offerToSend(text, kind) {
    mode = null;
    queue = queue.then(() => showSendBox(text, kind));
  }
  function showSendBox(text, kind) {
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
          ? `✓ Sent${you()}! Akash will reply to <b>${esc(addr)}</b>.`
          : '✓ Sent. You didn\'t add an email, so he can\'t reply directly. Send another message with your email if you\'d like an answer.');
      } catch (err) {
        sendBtn.disabled = false;
        status.innerHTML = `Couldn't send that (${esc(err.message)}). Try again, or use the ${a('/contact', 'contact form')}.`;
      }
    });
    email.focus();
  }

  async function sendToAkash(text, addr) {
    const transcript = history.slice(-10).map((m) => (m.who === 'me' ? (visitor || 'Visitor') + ': ' : 'Assistant: ') + m.html.replace(/<[^>]+>/g, '').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'")).join('\n');
    const fd = new FormData();
    fd.set('name', visitor ? visitor + ' (website chat)' : 'Website chat');
    fd.set('email', addr || 'no-reply@reachakash.com');
    fd.set('message',
      'Chat message · sent from the chat box on reachakash.com' + location.pathname + '\n' +
      (addr ? 'Reply to: ' + addr : '(No email given, so there is no reply address.)') +
      '\n\n' + text + '\n\n— The chat so far —\n' + transcript);
    const res = await fetch(CONFIG.formEndpoint, { method: 'POST', body: fd });
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
