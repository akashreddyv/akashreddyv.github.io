document.addEventListener("DOMContentLoaded", function () {

  // ── Per-page SEO metadata ──────────────────────────────────────
  const PAGE_META = {
    home: {
      title:       'Akash Reddy | Software Developer',
      description: 'Personal site of Vurenuka Akash Reddy (Akash Reddy, V Akash Reddy), Software Developer at Zoetis in Durham, NC. Explore work, projects, and more.',
      canonical:   'https://reachakash.com/',
      ogType:      'profile',
      ogTitle:     'Akash Reddy, Software Developer',
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
      title:       'Akash Reddy | Personal',
      description: 'Get to know Akash Reddy (Vurenuka Akash Reddy), techie, software developer, and travel enthusiast based in Durham, NC, originally from Hyderabad, India.',
      canonical:   'https://reachakash.com/personal',
      ogType:      'website',
      ogTitle:     'Akash Reddy, Personal Background and Interests',
      ogDesc:      'Get to know Akash Reddy (Vurenuka Akash Reddy), software developer, travel enthusiast, and creator based in Durham, NC, originally from Hyderabad.',
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
      title:       'Akash Reddy | Professional',
      description: 'Career timeline and skills of Akash Reddy (V Akash Reddy), Software Developer at Zoetis. C#, .NET, PostgreSQL, and more. MS Engineering Management, Arkansas State.',
      canonical:   'https://reachakash.com/professional',
      ogType:      'website',
      ogTitle:     'Akash Reddy, Professional Experience and Skills',
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
      title:       'Akash Reddy | Projects',
      description: 'Software projects and portfolio of V Akash Reddy (Vurenuka Akash Reddy), including a personal website built with vanilla JS, a 3D interactive logo viewer, and more.',
      canonical:   'https://reachakash.com/projects',
      ogType:      'website',
      ogTitle:     'V Akash Reddy, Software Projects and Portfolio',
      ogDesc:      'Software projects by V Akash Reddy: personal website, 3D logo viewer built with Three.js, and more. HTML, CSS, JavaScript, and C# / .NET.',
      jsonld: [
        {
          '@context': 'https://schema.org',
          '@type': 'CollectionPage',
          name: 'Projects by Akash Reddy',
          description: 'Software projects and portfolio of Vurenuka Akash Reddy',
          author: { '@type': 'Person', name: 'Vurenuka Akash Reddy', url: 'https://reachakash.com' },
          hasPart: [
            {
              '@type': 'CreativeWork',
              name: 'reachakash.com, Personal Portfolio Website',
              description: 'A multi-page personal portfolio built with HTML, CSS, and vanilla JavaScript. Hosted on GitHub Pages with History API routing.',
              url: 'https://reachakash.com',
              creator: { '@type': 'Person', name: 'Vurenuka Akash Reddy' }
            },
            {
              '@type': 'CreativeWork',
              name: 'Raptor Consultants Group, 3D Interactive Logo',
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
      title:       'Akash Reddy | Socials',
      description: 'Social media profiles of Akash Reddy (V Akash Reddy / Vurenuka Akash Reddy): Instagram, LinkedIn, X, YouTube, Snapchat, Discord, Threads, and Facebook.',
      canonical:   'https://reachakash.com/socials',
      ogType:      'website',
      ogTitle:     'Find Akash Reddy Online, Social Media Profiles',
      ogDesc:      'All social profiles of Akash Reddy: Instagram @ak.r48, LinkedIn @akashreddyv, X @AkReddy48, YouTube @ak.r48 and more.',
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
      title:       'Akash Reddy | Contact',
      description: 'Contact Vurenuka Akash Reddy (Akash Reddy, V Akash Reddy). Reach out for work, collaboration, or just to connect. Based in Durham, NC.',
      canonical:   'https://reachakash.com/contact',
      ogType:      'website',
      ogTitle:     'Contact Akash Reddy, Get In Touch',
      ogDesc:      'Reach Akash Reddy (V Akash Reddy / Vurenuka Akash Reddy) for work, collaboration, or to connect. LinkedIn, Instagram, or the contact form.',
      jsonld: [
        {
          '@context': 'https://schema.org',
          '@type': 'ContactPage',
          name: 'Contact Akash Reddy',
          description: 'Contact page for Vurenuka Akash Reddy, software developer in Durham, NC',
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
    },

    gallery: {
      title:       'Akash Reddy | Gallery',
      description: 'Photos of Akash Reddy (Vurenuka Akash Reddy, V Akash Reddy), software developer based in Durham, NC, originally from Hyderabad, India.',
      canonical:   'https://reachakash.com/gallery',
      ogType:      'website',
      ogTitle:     'Akash Reddy Photo Gallery',
      ogDesc:      'Photo gallery of Vurenuka Akash Reddy (Akash Reddy, V Akash Reddy), software developer in Durham, NC.',
      jsonld: [
        {
          '@context': 'https://schema.org',
          '@type': 'ImageGallery',
          name: 'Akash Reddy Photo Gallery',
          description: 'Photos of Vurenuka Akash Reddy (Akash Reddy, V Akash Reddy), software developer in Durham, NC, originally from Hyderabad, India.',
          url: 'https://reachakash.com/gallery',
          author: { '@type': 'Person', name: 'Vurenuka Akash Reddy', url: 'https://reachakash.com' },
          image: [
            {
              '@type': 'ImageObject',
              contentUrl: 'https://reachakash.com/images/home/vurenuka-akash-reddy-professional.jpg',
              name: 'Vurenuka Akash Reddy, Professional Portrait',
              description: 'Akash Reddy in professional attire outdoors, software developer at Zoetis, Durham NC',
              width: 1200, height: 847
            },
            {
              '@type': 'ImageObject',
              contentUrl: 'https://reachakash.com/images/home/akash-reddy-portrait.jpg',
              name: 'Akash Reddy Portrait',
              description: 'V Akash Reddy, candid outdoor portrait, smiling',
              width: 1200, height: 1600
            }
          ]
        },
        {
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://reachakash.com/' },
            { '@type': 'ListItem', position: 2, name: 'Gallery', item: 'https://reachakash.com/gallery' }
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
    '/gallery':      'gallery',
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
      if (name === 'contact') attachContactForm();

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


  function attachCursorEvents() {}

  // ── Contact Form ──
  function attachContactForm() {
    const form = document.getElementById('contact-form');
    if (!form) return;
    form.addEventListener('submit', async function (e) {
      e.preventDefault();
      const btn    = document.getElementById('form-submit');
      const status = document.getElementById('form-status');

      btn.disabled    = true;
      btn.textContent = 'Sending…';
      status.style.display = 'none';

      try {
        const res  = await fetch(form.action, { method: 'POST', body: new FormData(form) });
        let data;
        try { data = await res.json(); } catch { throw new Error('Could not reach the server. Please email mail@reachakash.com directly.'); }

        if (data.success) {
          status.textContent         = "Message sent! I'll get back to you soon.";
          status.style.background    = 'rgba(232,201,126,0.12)';
          status.style.border        = '1px solid rgba(232,201,126,0.4)';
          status.style.color         = '#e8c97e';
          status.style.display       = 'block';
          form.reset();
        } else {
          throw new Error(data.error || 'Something went wrong.');
        }
      } catch (err) {
        status.textContent         = err.message || 'Failed to send. Please try again.';
        status.style.background    = 'rgba(220,50,50,0.1)';
        status.style.border        = '1px solid rgba(220,50,50,0.4)';
        status.style.color         = '#ff6b6b';
        status.style.display       = 'block';
      } finally {
        btn.disabled    = false;
        btn.textContent = 'Send Message';
      }
    });
  }

  // ── AR logo → toggle 90s retro theme ──
  (function () {
    if (localStorage.getItem('retro-theme') === '1') {
      document.body.classList.add('theme-retro');
    }

    const navLogo = document.querySelector('.nav-logo');
    if (!navLogo) return;

    navLogo.addEventListener('click', function (e) {
      e.preventDefault();
      e.stopPropagation();
      const on = document.body.classList.toggle('theme-retro');
      localStorage.setItem('retro-theme', on ? '1' : '');
      showPage('home', true);
    });
  })();

  // ── Logo hint tooltip ──
  window.dismissLogoHint = function () {
    const hint = document.getElementById('logo-hint');
    if (hint) hint.style.display = 'none';
  };

  document.getElementById('logo-hint-close').addEventListener('click', dismissLogoHint);

  // Always show hint after a short delay (X hides it for the session only)
  setTimeout(function () {
    const hint = document.getElementById('logo-hint');
    if (hint) hint.style.display = 'flex';
  }, 1200);

  // ── Initial route ──
  const initialName = ROUTE_MAP[location.pathname] || 'home';
  showPage(initialName, false);
});
