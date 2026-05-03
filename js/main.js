document.addEventListener("DOMContentLoaded", function () {

  // ── Per-page SEO metadata ──────────────────────────────────────
  const PAGE_META = {
    home: {
      title:       'Vurenuka Akash Reddy | Software Developer in Durham, NC',
      description: 'Personal site of Vurenuka Akash Reddy (Akash Reddy, V Akash Reddy) — Software Developer at Zoetis in Durham, NC. Explore work, projects, and more.',
      canonical:   'https://reachakash.com/',
      ogType:      'profile',
      ogTitle:     'Vurenuka Akash Reddy — Software Developer',
      ogDesc:      'Akash Reddy (V Akash Reddy) is a software developer at Zoetis based in Durham, NC. Explore his work, projects, and background at reachakash.com.',
      jsonld: {
        '@context': 'https://schema.org',
        '@type': 'Person',
        name: 'Vurenuka Akash Reddy',
        givenName: 'Akash',
        familyName: 'Reddy',
        additionalName: 'Vurenuka',
        alternateName: ['Akash Reddy', 'V Akash Reddy', 'V Akash', 'Akash', 'Reach Akash', 'Vurenuka'],
        url: 'https://reachakash.com',
        image: [
          'https://reachakash.com/images/home/vurenuka-akash-reddy-professional.jpg',
          'https://reachakash.com/images/home/akash-reddy-portrait.jpg'
        ],
        jobTitle: 'Software Developer',
        worksFor: { '@type': 'Organization', name: 'Zoetis', url: 'https://www.zoetis.com' },
        alumniOf: [
          { '@type': 'CollegeOrUniversity', name: 'Arkansas State University', sameAs: 'https://www.astate.edu' },
          { '@type': 'CollegeOrUniversity', name: 'Amity University' },
          { '@type': 'CollegeOrUniversity', name: 'Malla Reddy College of Engineering and Technology' }
        ],
        address: { '@type': 'PostalAddress', addressLocality: 'Durham', addressRegion: 'NC', addressCountry: 'US' },
        sameAs: [
          'https://www.linkedin.com/in/akashreddyv/',
          'https://github.com/akashreddyv',
          'https://www.instagram.com/ak.r48',
          'https://x.com/AkReddy48',
          'https://www.youtube.com/@ak.r48',
          'https://www.threads.com/@ak.r48',
          'https://www.snapchat.com/@ak.r48',
          'https://www.facebook.com/ak.r48'
        ],
        knowsAbout: ['Software Development', 'Web Development', 'C#', '.NET Framework', 'AI', 'Travel'],
        description: 'Vurenuka Akash Reddy (also known as Akash Reddy, V Akash Reddy) is a software developer at Zoetis based in Durham, NC, USA.'
      }
    },

    personal: {
      title:       'Akash Reddy — Personal Life & Background | reachakash.com',
      description: 'Get to know Akash Reddy (Vurenuka Akash Reddy) — techie, software developer, and travel enthusiast based in Durham, NC, originally from Hyderabad, India.',
      canonical:   'https://reachakash.com/personal',
      ogType:      'website',
      ogTitle:     'Akash Reddy — Personal Background & Interests',
      ogDesc:      'Get to know Akash Reddy (Vurenuka Akash Reddy) — software developer, travel enthusiast, and creator based in Durham, NC, originally from Hyderabad.',
      jsonld: [
        {
          '@context': 'https://schema.org',
          '@type': 'ProfilePage',
          mainEntity: {
            '@type': 'Person',
            name: 'Vurenuka Akash Reddy',
            alternateName: ['Akash Reddy', 'V Akash Reddy'],
            url: 'https://reachakash.com',
            description: 'Techie, software developer, and AI enthusiast. Travel and adventure seeker based in Durham, NC, originally from Hyderabad, India.'
          }
        },
        {
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://reachakash.com/' },
            { '@type': 'ListItem', position: 2, name: 'Personal', item: 'https://reachakash.com/personal' }
          ]
        }
      ]
    },

    professional: {
      title:       'Akash Reddy — Professional Experience & Skills | Zoetis',
      description: 'Career timeline and skills of Akash Reddy (V Akash Reddy) — Software Developer at Zoetis. C#, .NET, PostgreSQL, and more. MS Engineering Management, Arkansas State.',
      canonical:   'https://reachakash.com/professional',
      ogType:      'website',
      ogTitle:     'Akash Reddy — Professional Experience & Skills',
      ogDesc:      'Software Developer at Zoetis, Durham NC. C#, .NET, PostgreSQL, NI-VISA. MS Engineering Management from Arkansas State University.',
      jsonld: [
        {
          '@context': 'https://schema.org',
          '@type': 'Person',
          name: 'Vurenuka Akash Reddy',
          alternateName: ['Akash Reddy', 'V Akash Reddy'],
          url: 'https://reachakash.com',
          jobTitle: 'Software Developer',
          worksFor: { '@type': 'Organization', name: 'Zoetis', url: 'https://www.zoetis.com' },
          hasOccupation: {
            '@type': 'Occupation',
            name: 'Software Developer',
            occupationLocation: { '@type': 'City', name: 'Durham, NC' },
            skills: 'C#, .NET Framework, WinForms, PostgreSQL, NI-VISA, NI-DAQmx, SQL, JavaScript, Git'
          },
          alumniOf: [
            { '@type': 'CollegeOrUniversity', name: 'Arkansas State University', sameAs: 'https://www.astate.edu' },
            { '@type': 'CollegeOrUniversity', name: 'Amity University' },
            { '@type': 'CollegeOrUniversity', name: 'Malla Reddy College of Engineering and Technology' }
          ]
        },
        {
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://reachakash.com/' },
            { '@type': 'ListItem', position: 2, name: 'Professional', item: 'https://reachakash.com/professional' }
          ]
        }
      ]
    },

    projects: {
      title:       'V Akash Reddy — Software Projects & Portfolio | reachakash.com',
      description: 'Software projects and portfolio of V Akash Reddy (Vurenuka Akash Reddy) — personal website built with vanilla JS, 3D interactive logo viewer, and more.',
      canonical:   'https://reachakash.com/projects',
      ogType:      'website',
      ogTitle:     'V Akash Reddy — Software Projects & Portfolio',
      ogDesc:      'Software projects by V Akash Reddy — personal website, 3D logo viewer built with Three.js, and more. HTML, CSS, JavaScript, and C# / .NET.',
      jsonld: [
        {
          '@context': 'https://schema.org',
          '@type': 'CollectionPage',
          name: 'Projects — Akash Reddy',
          description: 'Software projects and portfolio of Vurenuka Akash Reddy',
          author: { '@type': 'Person', name: 'Vurenuka Akash Reddy', url: 'https://reachakash.com' },
          hasPart: [
            {
              '@type': 'CreativeWork',
              name: 'reachakash.com — Personal Portfolio Website',
              description: 'A multi-page personal portfolio built with HTML, CSS, and vanilla JavaScript. Hosted on GitHub Pages with History API routing.',
              url: 'https://reachakash.com',
              creator: { '@type': 'Person', name: 'Vurenuka Akash Reddy' }
            },
            {
              '@type': 'CreativeWork',
              name: 'Raptor Consultants Group — 3D Interactive Logo',
              description: '3D interactive logo viewer built with Three.js, featuring crystal and SVG extrusion modes with real-time controls.',
              creator: { '@type': 'Person', name: 'Vurenuka Akash Reddy' }
            }
          ]
        },
        {
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://reachakash.com/' },
            { '@type': 'ListItem', position: 2, name: 'Projects', item: 'https://reachakash.com/projects' }
          ]
        }
      ]
    },

    socials: {
      title:       'Find Akash Reddy Online — Social Media Profiles',
      description: 'Social media profiles of Akash Reddy (V Akash Reddy / Vurenuka Akash Reddy) — Instagram, LinkedIn, X, YouTube, Snapchat, Discord, Threads, and Facebook.',
      canonical:   'https://reachakash.com/socials',
      ogType:      'website',
      ogTitle:     'Find Akash Reddy Online — Social Media Profiles',
      ogDesc:      'All social profiles of Akash Reddy — Instagram @ak.r48, LinkedIn @akashreddyv, X @AkReddy48, YouTube @ak.r48 and more.',
      jsonld: [
        {
          '@context': 'https://schema.org',
          '@type': 'Person',
          name: 'Vurenuka Akash Reddy',
          alternateName: ['Akash Reddy', 'V Akash Reddy'],
          url: 'https://reachakash.com',
          sameAs: [
            'https://www.linkedin.com/in/akashreddyv/',
            'https://github.com/akashreddyv',
            'https://www.instagram.com/ak.r48',
            'https://x.com/AkReddy48',
            'https://www.youtube.com/@ak.r48',
            'https://www.threads.com/@ak.r48',
            'https://www.snapchat.com/@ak.r48',
            'https://www.facebook.com/ak.r48'
          ]
        },
        {
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://reachakash.com/' },
            { '@type': 'ListItem', position: 2, name: 'Socials', item: 'https://reachakash.com/socials' }
          ]
        }
      ]
    },

    contact: {
      title:       'Contact Akash Reddy — Get In Touch | reachakash.com',
      description: 'Contact Vurenuka Akash Reddy (Akash Reddy, V Akash Reddy) — reach out for work, collaboration, or just to connect. Based in Durham, NC.',
      canonical:   'https://reachakash.com/contact',
      ogType:      'website',
      ogTitle:     'Contact Akash Reddy — Get In Touch',
      ogDesc:      'Reach Akash Reddy (V Akash Reddy / Vurenuka Akash Reddy) for work, collaboration, or to connect. LinkedIn, Instagram, or the contact form.',
      jsonld: [
        {
          '@context': 'https://schema.org',
          '@type': 'ContactPage',
          name: 'Contact Akash Reddy',
          description: 'Contact page for Vurenuka Akash Reddy — software developer in Durham, NC',
          url: 'https://reachakash.com/contact',
          mainEntity: {
            '@type': 'Person',
            name: 'Vurenuka Akash Reddy',
            url: 'https://reachakash.com'
          }
        },
        {
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://reachakash.com/' },
            { '@type': 'ListItem', position: 2, name: 'Contact', item: 'https://reachakash.com/contact' }
          ]
        }
      ]
    }
  };

  // ── Slideshow ──────────────────────────────────────────────────
  let _slideshowTimer = null;

  function startSlideshow() {
    if (_slideshowTimer) clearInterval(_slideshowTimer);
    const slides = document.querySelectorAll('.home-slide');
    const dots   = document.querySelectorAll('.ss-dot');
    if (slides.length < 2) return;
    let cur = 0;
    function advance() {
      slides[cur].classList.remove('active');
      dots[cur]  && dots[cur].classList.remove('active');
      cur = (cur + 1) % slides.length;
      slides[cur].classList.add('active');
      dots[cur]  && dots[cur].classList.add('active');
    }
    _slideshowTimer = setInterval(advance, 15000);
  }

  function stopSlideshow() {
    if (_slideshowTimer) { clearInterval(_slideshowTimer); _slideshowTimer = null; }
  }

  const ROUTE_MAP = {
    '/':             'home',
    '/home':         'home',
    '/personal':     'personal',
    '/professional': 'professional',
    '/projects':     'projects',
    '/socials':      'socials',
    '/contact':      'contact',
  };

  // ── Update all head meta tags for the current page ──
  function updateMeta(name) {
    const m = PAGE_META[name];
    if (!m) return;

    document.title = m.title;
    setMeta('meta-description', 'content', m.description);
    setHref('canonical-url', m.canonical);
    setMeta('og-type',    'content', m.ogType);
    setMeta('og-url',     'content', m.canonical);
    setMeta('og-title',   'content', m.ogTitle);
    setMeta('og-desc',    'content', m.ogDesc);
    setMeta('tw-title',   'content', m.ogTitle);
    setMeta('tw-desc',    'content', m.ogDesc);

    // Replace JSON-LD script
    const old = document.getElementById('page-jsonld');
    if (old) old.remove();
    const s = document.createElement('script');
    s.type = 'application/ld+json';
    s.id   = 'page-jsonld';
    s.textContent = JSON.stringify(m.jsonld);
    document.head.appendChild(s);
  }

  function setMeta(id, attr, val) {
    const el = document.getElementById(id);
    if (el) el.setAttribute(attr, val);
  }

  function setHref(id, val) {
    const el = document.getElementById(id);
    if (el) el.setAttribute('href', val);
  }

  // ── Show Page ──
  window.showPage = async function (name, push = true) {
    const contentDiv = document.getElementById('content');

    try {
      const response = await fetch(`pages/${name}.html`);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      const htmlText = await response.text();
      const cleaned  = name === 'RCG' ? htmlText : htmlText.replace(/<script[\s\S]*?<\/script>/gi, '');

      const temp = document.createElement('div');
      temp.innerHTML = cleaned;
      contentDiv.innerHTML = '';
      while (temp.firstChild) contentDiv.appendChild(temp.firstChild);

      if (name === 'RCG') {
        contentDiv.querySelectorAll('script').forEach(script => {
          const s = document.createElement('script');
          if (script.src) { s.src = script.src; } else { s.textContent = script.textContent; }
          document.head.appendChild(s);
        });
      }

      const path = name === 'home' ? '/' : `/${name}`;
      if (push) history.pushState({ page: name }, '', path);

      updateMeta(name);
      stopSlideshow();
      if (name === 'home') startSlideshow();
      window.scrollTo({ top: 0, behavior: 'smooth' });

      document.querySelectorAll('.nav-links [data-page]').forEach(el => {
        el.classList.toggle('active', el.dataset.page === name);
      });

      document.getElementById('navLinks').classList.remove('open');
      attachCursorEvents();

    } catch (err) {
      console.error('Routing Error:', err);
      contentDiv.innerHTML = `<div style="padding:2rem;color:#cc0000;"><h2>Error Loading Page</h2><p>Could not load pages/${name}.html.</p></div>`;
    }
  };

  // ── Navigate (called from onclick handlers in partials) ──
  window.navigate = function (path) {
    showPage(ROUTE_MAP[path] || 'home', true);
  };

  // ── Global click interceptor for internal <a> tags ──
  document.addEventListener('click', function (e) {
    const link = e.target.closest('a');
    if (!link) return;
    const href = link.getAttribute('href');
    if (href && href.startsWith('/') && !href.startsWith('//')) {
      e.preventDefault();
      showPage(ROUTE_MAP[href] || 'home', true);
    }
  });

  // ── Browser back / forward ──
  window.addEventListener('popstate', function () {
    showPage(ROUTE_MAP[location.pathname] || 'home', false);
  });

  // ── Mobile Menu ──
  window.toggleMenu = function () {
    document.getElementById('navLinks').classList.toggle('open');
  };

  // ── Contact Form ──
  window.handleForm = function (e) {
    e.preventDefault();
    const name  = document.getElementById('form-name').value;
    const email = document.getElementById('form-email').value;
    const msg   = document.getElementById('form-msg').value;
    window.location.href = `mailto:akashreddyvurenuka@gmail.com?subject=Message from ${encodeURIComponent(name)}&body=${encodeURIComponent(msg + '\n\nFrom: ' + email)}`;
  };

  // ── Custom Cursor ──
  const cursor    = document.getElementById('cursor');
  const cursorRing = document.getElementById('cursorRing');
  let mx = 0, my = 0, rx = 0, ry = 0;

  document.addEventListener('mousemove', e => {
    mx = e.clientX; my = e.clientY;
    cursor.style.left = mx + 'px';
    cursor.style.top  = my + 'px';
  });

  document.addEventListener('mouseleave', () => {
    cursor.style.opacity = '0'; cursorRing.style.opacity = '0';
  });
  document.addEventListener('mouseenter', () => {
    cursor.style.opacity = '1'; cursorRing.style.opacity = '1';
  });

  (function animateRing() {
    rx += (mx - rx) * 0.12; ry += (my - ry) * 0.12;
    cursorRing.style.left = rx + 'px'; cursorRing.style.top = ry + 'px';
    requestAnimationFrame(animateRing);
  })();

  function attachCursorEvents() {
    document.querySelectorAll('a, button, .home-card, .social-card, .project-card').forEach(el => {
      el.onmouseenter = () => { cursor.style.width='16px'; cursor.style.height='16px'; cursorRing.style.width='54px'; cursorRing.style.height='54px'; };
      el.onmouseleave = () => { cursor.style.width='10px'; cursor.style.height='10px'; cursorRing.style.width='36px'; cursorRing.style.height='36px'; };
    });
  }

  attachCursorEvents();

  // ── Initial route ──
  const initialName = ROUTE_MAP[location.pathname] || 'home';
  showPage(initialName, false);
});
