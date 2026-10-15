/* ============================================================
   Routes manifest — the single source for every page's URL, <head>
   metadata, JSON-LD, sitemap entry and llms.txt line.
   _build/build.js turns this + _build/template.html + pages/*.html into
   the HTML files at the repo root, sitemap.xml and llms.txt.

   Route fields
     path        served URL ("/personal" — no trailing slash)
     out         generated file ("personal.html": GitHub Pages serves
                 /personal from it with a 200 and no redirect)
     source      content partial in pages/
     nav         data-nav value to mark aria-current="page"
     navGroup    "about" highlights the About dropdown
     title / description / ogType / ogTitle / ogDesc
     jsonld      array of JSON-LD objects
     sitemap     { changefreq, priority, images? } or false
     draft       true → noindex, left out of sitemap.xml and llms.txt
     llms        one-line summary for llms.txt (published routes only)
   ============================================================ */

const ORIGIN = 'https://reachakash.com';
const url = (p) => ORIGIN + p;
// Brand gallery images (images/brand/gallery/): [file, name, width, height]
const GALLERY = [
  ['cover.webp', 'reachAkash.com cover banner', 1500, 500],
  ['logo-dark.webp', 'reachAkash.com logo on black', 900, 675],
  ['logo-light.webp', 'reachAkash.com logo on white', 900, 675],
  ['symbol.webp', 'reachAkash mark', 900, 675],
  ['red-mark.webp', 'reachAkash red-only mark', 900, 675],
  ['website-name.webp', 'reachAkash.com website name', 900, 675],
  ['website-name-red.webp', 'reachAkash.com website name on red', 900, 675],
  ['t-shirt.webp', 'reachAkash t-shirt', 900, 675],
  ['polo.webp', 'reachAkash polo shirt', 900, 675],
  ['cap.webp', 'reachAkash cap', 900, 675],
  ['bumper-sticker.webp', 'reachAkash.com bumper sticker', 900, 675],
  ['mug.webp', 'reachAkash.com mug', 900, 675],
  ['business-cards.webp', 'reachAkash business cards', 900, 675]
];
const PHOTO = url('/images/home/vurenuka-akash-reddy-professional.jpg');
const PORTRAIT = url('/images/home/akash-reddy-portrait.jpg');

const SAME_AS = [
  'https://www.linkedin.com/in/akashreddyv/',
  'https://github.com/akashreddyv',
  'https://www.instagram.com/ak.r48',
  'https://x.com/AkReddy48',
  'https://www.youtube.com/@ak.r48',
  'https://www.threads.com/@ak.r48',
  'https://www.snapchat.com/@ak.r48',
  'https://www.facebook.com/ak.r48'
];

// Latest "checked" date across published referral entries, for the page's dateModified.
const REFERRALS_UPDATED = require('./data/referrals.json').entries
  .filter((e) => e.publish).map((e) => e.lastVerified).sort().pop();

const crumbs = (...items) => ({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [['Home', '/'], ...items].map(([name, p], i) => ({
    '@type': 'ListItem', position: i + 1, name, item: url(p)
  }))
});

// The full Person entity. Home and About both carry it under one @id.
const PERSON = {
  '@context': 'https://schema.org',
  '@type': 'Person',
  '@id': url('/#person'),
  name: 'Vurenuka Akash Reddy',
  givenName: 'Akash',
  familyName: 'Reddy',
  additionalName: 'Vurenuka',
  alternateName: ['Akash Reddy', 'Reddy Akash', 'V Akash Reddy', 'V Akash', 'Akash', 'Reach Akash', 'Vurenuka', 'Reddy'],
  url: ORIGIN,
  image: [PHOTO, PORTRAIT],
  jobTitle: 'AI Software Developer',
  worksFor: { '@type': 'Organization', name: 'Molex', url: 'https://www.molex.com' },
  alumniOf: [
    { '@type': 'CollegeOrUniversity', name: 'Arkansas State University', sameAs: 'https://www.astate.edu' },
    { '@type': 'CollegeOrUniversity', name: 'Amity University' },
    { '@type': 'CollegeOrUniversity', name: 'Malla Reddy College of Engineering and Technology' }
  ],
  address: { '@type': 'PostalAddress', addressLocality: 'Detroit', addressRegion: 'MI', addressCountry: 'US' },
  sameAs: SAME_AS,
  knowsAbout: ['Software Development', 'AI Agents', 'AI Coaching', 'Website Design', 'Database Architecture', 'SQL Server', 'C#', '.NET Framework', 'LabVIEW', 'Industrial Test Automation', 'AI', 'Travel'],
  brand: { '@id': url('/#brand') },
  description: 'Vurenuka Akash Reddy (also known as Akash Reddy, V Akash Reddy, Reach Akash) is an AI software developer at Molex based in Detroit, MI, USA, originally from Hyderabad, India. Through Reach Akash he offers custom software, custom AI agents, AI coaching and website design.'
};

const DETROIT = { '@type': 'City', name: 'Detroit', containedInPlace: { '@type': 'State', name: 'Michigan' } };

// The studio brand — carries "The Ascent" mark as its logo.
const BRAND = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  '@id': url('/#brand'),
  name: 'Reach Akash',
  alternateName: ['reachAkash.com', 'Reach Akash by Akash Reddy'],
  url: url('/'),
  logo: { '@type': 'ImageObject', url: url('/images/brand/reachakash-symbol.png'), width: 2400, height: 1681 },
  description: 'Reach Akash is the studio of Akash Reddy in Detroit, Michigan: custom software, custom AI agents, AI coaching and website design.',
  address: { '@type': 'PostalAddress', addressLocality: 'Detroit', addressRegion: 'MI', addressCountry: 'US' },
  areaServed: DETROIT,
  knowsAbout: ['Custom Software', 'AI Agents', 'AI Coaching', 'Website Design'],
  founder: { '@id': url('/#person') }
};

// One Service entity per offering on /services (no Review or rating markup).
const service = (id, name, serviceType, description, extra = {}) => ({
  '@context': 'https://schema.org',
  '@type': 'Service',
  '@id': url('/services#' + id),
  name, serviceType, description,
  provider: { '@id': url('/#brand') },
  areaServed: DETROIT,
  url: url('/services'),
  ...extra
});
const SERVICES = [
  service('software', 'Software services', 'Custom software development',
    'Custom software and automation, including test data and workflow tools for teams that build and test hardware.'),
  service('website-design', 'Website design services', 'Website design',
    'Website design starting at $499 for a fully functioning website.',
    { offers: { '@type': 'Offer', description: 'Starting at $499 for a fully functioning website.',
                priceSpecification: { '@type': 'PriceSpecification', minPrice: 499, priceCurrency: 'USD' } } }),
  service('ai-agents', 'Custom AI agents', 'AI agent development',
    'AI agents built around your work that use your documents and tools to handle repeat tasks.'),
  service('ai-coaching', 'AI coaching', 'AI coaching',
    'One-on-one or team coaching on using AI tools in your everyday work.')
];

const routes = [
  {
    slug: 'home', path: '/', out: 'index.html', source: 'pages/home.html', nav: 'home',
    title: 'Akash Reddy (Reach Akash) | AI Software Developer',
    description: 'Personal site of Vurenuka Akash Reddy (Reach Akash, Akash Reddy), AI software developer in Detroit, MI. Services, projects, work history and contact.',
    ogType: 'profile',
    // Kept short and name-only on purpose: this is the card people see when the link itself
    // is shared (iMessage, WhatsApp, Slack...). The job-title-rich text above is for search
    // engines and stays in <title>/description, which this doesn't touch.
    ogTitle: 'Reach Akash (Akash Reddy)',
    ogDesc: 'reachAkash.com',
    jsonld: [
      {
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        '@id': url('/#website'),
        url: url('/'),
        name: 'Reach Akash',
        alternateName: ['Akash Reddy', 'Reddy Akash', 'Reach Akash Reddy'],
        publisher: { '@id': url('/#brand') }
      },
      {
        '@context': 'https://schema.org',
        '@type': 'WebPage',
        '@id': url('/#webpage'),
        url: url('/'),
        name: 'Akash Reddy (Reach Akash) | AI Software Developer',
        primaryImageOfPage: { '@type': 'ImageObject', url: PHOTO }
      },
      BRAND,
      PERSON
    ],
    sitemap: {
      changefreq: 'weekly', priority: '1.0',
      images: [
        [PHOTO, 'Vurenuka Akash Reddy Professional Portrait'],
        [PORTRAIT, 'Akash Reddy Portrait']
      ]
    },
    // The LCP image on Home, plus the redirect for old /?p=/route links that the
    // previous 404 trick created.
    headExtra: [
      '  <link rel="preload" as="image" href="/images/home/vurenuka-akash-reddy-professional.jpg" fetchpriority="high">',
      '  <script>',
      "    (function () { var p = new URLSearchParams(location.search).get('p');",
      "      if (p && /^\\/(?!\\/)[a-z0-9\\-\\/]*$/i.test(p)) location.replace(p); })();",
      '  </script>'
    ].join('\n') + '\n',
    llms: 'Landing page for Vurenuka Akash Reddy (Akash Reddy, Reach Akash), software developer in Detroit, MI, with links to his services, projects, work history and contact.'
  },

  {
    slug: 'about', path: '/about', out: 'about.html', source: 'pages/about.html', nav: 'about', navGroup: 'about',
    title: 'Akash Reddy (V Akash Reddy) | About',
    description: 'Akash Reddy (V Akash Reddy) is a software developer from Hyderabad, now in Metro Detroit, who builds manufacturing test software and AI tools.',
    ogType: 'profile',
    ogTitle: 'About Akash Reddy (V Akash Reddy)',
    ogDesc: 'Software developer from Hyderabad, now in Metro Detroit. Builds manufacturing test software and uses AI to get from idea to working tool fast.',
    jsonld: [
      {
        '@context': 'https://schema.org',
        '@type': 'ProfilePage',
        url: url('/about'),
        name: 'About Akash Reddy (V Akash Reddy)',
        mainEntity: { '@id': url('/#person') }
      },
      PERSON,
      crumbs(['About', '/about'])
    ],
    sitemap: { changefreq: 'monthly', priority: '0.9' },
    llms: 'About Akash Reddy (V Akash Reddy): short bio, with links to his personal background, professional history, projects and social profiles.'
  },

  {
    slug: 'personal', path: '/personal', out: 'personal.html', source: 'pages/personal.html', nav: 'personal', navGroup: 'about',
    title: 'Akash Reddy | Personal',
    description: 'Get to know Akash Reddy (Vurenuka Akash Reddy), techie, software developer, and travel enthusiast based in Detroit, MI, originally from Hyderabad, India.',
    ogType: 'profile',
    ogTitle: 'Akash Reddy, Personal Background and Interests',
    ogDesc: 'Get to know Akash Reddy (Vurenuka Akash Reddy), software developer, travel enthusiast, and creator based in Detroit, MI, originally from Hyderabad.',
    jsonld: [
      {
        '@context': 'https://schema.org',
        '@type': 'ProfilePage',
        mainEntity: {
          '@type': 'Person',
          name: 'Vurenuka Akash Reddy',
          alternateName: ['Akash Reddy', 'V Akash Reddy'],
          url: ORIGIN,
          description: 'Techie, software developer, and AI enthusiast. Travel and adventure seeker based in Detroit, MI, originally from Hyderabad, India.'
        }
      },
      crumbs(['Personal', '/personal'])
    ],
    sitemap: { changefreq: 'monthly', priority: '0.8' },
    llms: 'Personal background. Techie, software developer, AI enthusiast, travel and adventure seeker. Based in Detroit, MI; originally from Hyderabad, India.'
  },

  {
    slug: 'professional', path: '/professional', out: 'professional.html', source: 'pages/professional.html', nav: 'professional', navGroup: 'about',
    title: 'Akash Reddy | Professional',
    description: 'Career and skills of Akash Reddy (V Akash Reddy), AI Software Developer at Molex: SQL Server, C#, .NET, LabVIEW. MS Engineering Management, Arkansas State.',
    ogType: 'website',
    ogTitle: 'Akash Reddy, Professional Experience and Skills',
    ogDesc: 'AI Software Developer at Molex, Detroit MI. SQL Server, C#, .NET, LabVIEW. Previously Zoetis. MS Engineering Management from Arkansas State University.',
    jsonld: [
      {
        '@context': 'https://schema.org',
        '@type': 'Person',
        name: 'Vurenuka Akash Reddy',
        alternateName: ['Akash Reddy', 'V Akash Reddy'],
        url: ORIGIN,
        jobTitle: 'AI Software Developer',
        worksFor: { '@type': 'Organization', name: 'Molex', url: 'https://www.molex.com' },
        hasOccupation: {
          '@type': 'Occupation',
          name: 'AI Software Developer',
          occupationLocation: { '@type': 'City', name: 'Detroit, MI' },
          skills: 'SQL Server, T-SQL, database architecture, C#, .NET Framework, LabVIEW, .NET/LabVIEW interop, industrial test automation, data pipeline design, PostgreSQL, SQL, JavaScript, Git, GitLab'
        },
        alumniOf: PERSON.alumniOf
      },
      crumbs(['Professional', '/professional'])
    ],
    sitemap: { changefreq: 'monthly', priority: '0.8' },
    llms: 'Career and education. AI Software Developer at Molex (Jun 2026-present) on the GRTS team, building database systems for connector reliability test stations (SQL Server, C#, .NET Framework, LabVIEW). Previously Software Developer at Zoetis (Jan 2026-Jun 2026), building ZAHM (.NET 4.8, C#, WinForms, PostgreSQL, NI-VISA); Software Developer at Raptor Consultants Group (Nov 2024-Dec 2025); Software Engineer at Tata Consultancy Services (Aug 2022-Aug 2023); and Associate Software Developer at Persistent Systems Ltd. Education: MS Engineering Management (Arkansas State University, 2023-2024), MBA Digital Entrepreneurship (Amity University, 2023-2025), B.Tech Information Technology (Malla Reddy Institute of Technology, 2018-2022).'
  },

  {
    slug: 'projects', path: '/projects', out: 'projects.html', source: 'pages/projects.html', nav: 'projects',
    title: 'Akash Reddy | Projects',
    description: 'Software projects by V Akash Reddy (Vurenuka Akash Reddy): this website, generated from one template with vanilla JS, a 3D logo viewer and more.',
    ogType: 'website',
    ogTitle: 'V Akash Reddy, Software Projects and Portfolio',
    ogDesc: 'Software projects by V Akash Reddy: personal website, 3D logo viewer built with Three.js, and more. HTML, CSS, JavaScript, and C# / .NET.',
    jsonld: [
      {
        '@context': 'https://schema.org',
        '@type': 'CollectionPage',
        name: 'Projects by Akash Reddy',
        description: 'Software projects and portfolio of Vurenuka Akash Reddy',
        author: { '@type': 'Person', name: 'Vurenuka Akash Reddy', url: ORIGIN },
        hasPart: [
          {
            '@type': 'CreativeWork',
            name: 'reachakash.com, Personal Portfolio Website',
            description: 'A multi-page personal portfolio built with HTML, CSS, and vanilla JavaScript: static pages generated from one shared template by a small build script, with no framework and no client-side router. Hosted on GitHub Pages.',
            url: ORIGIN,
            creator: { '@type': 'Person', name: 'Vurenuka Akash Reddy' }
          },
          {
            '@type': 'CreativeWork',
            name: 'Logo Designs, 3D Interactive Viewer',
            description: '3D interactive logo viewer built with Three.js: the reachAkash mark and a crystal variant, with a play button, front/back/top/bottom views, and real-time material controls.',
            creator: { '@type': 'Person', name: 'Vurenuka Akash Reddy' }
          }
        ]
      },
      crumbs(['Projects', '/projects'])
    ],
    sitemap: { changefreq: 'monthly', priority: '0.8' },
    llms: 'Software portfolio, including personal website reachakash.com (HTML/CSS/JS, GitHub Pages) and a 3D interactive logo viewer (Three.js, SVG).'
  },

  {
    slug: 'socials', path: '/socials', out: 'socials.html', source: 'pages/socials.html', nav: 'socials',
    title: 'Akash Reddy | Socials',
    description: 'Social media profiles of Akash Reddy (V Akash Reddy / Vurenuka Akash Reddy): Instagram, LinkedIn, X, YouTube, Snapchat, Discord, Threads, and Facebook.',
    ogType: 'website',
    ogTitle: 'Find Akash Reddy Online, Social Media Profiles',
    ogDesc: 'All social profiles of Akash Reddy: Instagram @ak.r48, LinkedIn @akashreddyv, X @AkReddy48, YouTube @ak.r48 and more.',
    jsonld: [
      {
        '@context': 'https://schema.org',
        '@type': 'Person',
        name: 'Vurenuka Akash Reddy',
        alternateName: ['Akash Reddy', 'V Akash Reddy'],
        url: ORIGIN,
        sameAs: SAME_AS
      },
      crumbs(['Socials', '/socials'])
    ],
    sitemap: { changefreq: 'yearly', priority: '0.5' },
    llms: 'Social media profiles. Instagram @ak.r48, LinkedIn @akashreddyv, X @AkReddy48, YouTube @ak.r48, Snapchat @ak.r48, Discord @ak.r48, Threads @ak.r48, Facebook @ak.r48.'
  },

  {
    slug: 'contact', path: '/contact', out: 'contact.html', source: 'pages/contact.html', nav: 'contact',
    title: 'Akash Reddy | Contact',
    description: 'Contact Vurenuka Akash Reddy (Akash Reddy, V Akash Reddy). Reach out for work, collaboration, or just to connect. Based in Detroit, MI.',
    ogType: 'website',
    ogTitle: 'Contact Akash Reddy, Get In Touch',
    ogDesc: 'Reach Akash Reddy (V Akash Reddy / Vurenuka Akash Reddy) for work, collaboration, or to connect. LinkedIn, Instagram, or the contact form.',
    jsonld: [
      {
        '@context': 'https://schema.org',
        '@type': 'ContactPage',
        name: 'Contact Akash Reddy',
        description: 'Contact page for Vurenuka Akash Reddy, AI software developer in Detroit, MI',
        url: url('/contact'),
        mainEntity: { '@type': 'Person', name: 'Vurenuka Akash Reddy', url: ORIGIN }
      },
      crumbs(['Contact', '/contact'])
    ],
    sitemap: { changefreq: 'yearly', priority: '0.5' },
    llms: 'Contact Akash Reddy via LinkedIn, Instagram, or the contact form. Located in Detroit, MI, USA.'
  },

  {
    slug: 'gallery', path: '/gallery', out: 'gallery.html', source: 'pages/gallery.html', nav: 'gallery', navGroup: 'about',
    title: 'Gallery: reachAkash Logos, Merch & Photos | Reach Akash',
    description: 'The reachAkash logo in every version, the brand on a t-shirt, polo, cap, bumper sticker, mug and business cards, and photos of Akash Reddy.',
    ogType: 'website',
    ogTitle: 'reachAkash Gallery: Logos, Merch & Photos',
    ogDesc: 'Every version of the reachAkash logo, the brand on merch, and photos of Akash Reddy.',
    jsonld: [
      {
        '@context': 'https://schema.org',
        '@type': 'ImageGallery',
        name: 'reachAkash Gallery',
        description: 'Logos and brand mockups for reachAkash.com, and photos of Vurenuka Akash Reddy (Akash Reddy), software developer in Detroit, MI.',
        url: url('/gallery'),
        author: { '@type': 'Person', name: 'Vurenuka Akash Reddy', url: ORIGIN },
        image: [
          ...GALLERY.map(([file, name, w, h]) => ({ '@type': 'ImageObject', contentUrl: url('/images/brand/gallery/' + file), name, width: w, height: h })),
          { '@type': 'ImageObject', contentUrl: PHOTO, name: 'Vurenuka Akash Reddy, Professional Portrait',
            description: 'Akash Reddy in professional attire outdoors, AI software developer at Molex, Detroit MI', width: 1200, height: 847 },
          { '@type': 'ImageObject', contentUrl: PORTRAIT, name: 'Akash Reddy Portrait',
            description: 'V Akash Reddy, candid outdoor portrait, smiling', width: 1200, height: 1600 }
        ]
      },
      crumbs(['About', '/about'], ['Gallery', '/gallery'])
    ],
    sitemap: {
      changefreq: 'monthly', priority: '0.6',
      images: [
        ...GALLERY.map(([file, name]) => [url('/images/brand/gallery/' + file), name]),
        [PHOTO, 'Vurenuka Akash Reddy Professional Portrait'],
        [PORTRAIT, 'Akash Reddy Portrait']
      ]
    },
    llms: 'Gallery: the reachAkash logo in every version (cover banner, logo on black and on white, the mark, a red-only mark, the website name) and the brand on a t-shirt, polo, cap, bumper sticker, mug and business cards, plus photos of Akash Reddy.'
  },

  // ── Referral codes. Cards come from _build/data/referrals.json (see
  //    _build/referrals.js). WebPage + BreadcrumbList only: no Offer,
  //    Product or Review markup.
  {
    slug: 'referrals', path: '/referrals', out: 'referrals.html', source: 'pages/referrals.html', nav: 'referrals',
    title: "Akash Reddy's referral codes: Chase, Robinhood & more",
    description: "Akash Reddy's referral codes and links for Chase, Amex, Robinhood, Kraken, Cash App, Remitly, Rakuten, Claude and more. He earns a reward if you sign up.",
    ogType: 'website',
    ogTitle: "Akash Reddy's referral codes",
    ogDesc: 'All of Akash Reddy’s referral codes and links in one place, with official terms. He earns a reward when you sign up through them.',
    jsonld: [
      {
        '@context': 'https://schema.org',
        '@type': 'WebPage',
        '@id': url('/referrals#webpage'),
        url: url('/referrals'),
        name: "Akash Reddy's referral codes",
        description: 'Referral codes and links from Akash Reddy, with a disclosure that he earns a reward and links to each program’s official terms.',
        isPartOf: { '@id': url('/#website') },
        about: { '@id': url('/#person') },
        dateModified: REFERRALS_UPDATED
      },
      crumbs(['Referrals', '/referrals'])
    ],
    sitemap: { changefreq: 'weekly', priority: '0.6' },
    llms: 'Referral codes and links of Akash Reddy (credit cards, investing and trading, payments, sending money to India, shopping and cash back, AI tools), with a disclosure that he earns a reward and links to official terms. Machine-readable copy: https://reachakash.com/referrals.json'
  },

  // ── Business routes. Lab is retired (no links point to it) and stays a noindex
  //    draft; drafts stay out of the sitemap and llms.txt.
  {
    // faq: build.js adds FAQPage JSON-LD from the page's .faq-item blocks.
    slug: 'services', path: '/services', out: 'services.html', source: 'pages/services.html', nav: 'services', faq: true,
    title: 'AI Coaching, AI Agents & Web Design, Detroit | Akash Reddy',
    description: 'Custom software, AI agents, AI coaching and website design services in Detroit, MI from Akash Reddy (Reach Akash). Websites start at $499.',
    ogType: 'website',
    ogTitle: 'Services from Akash Reddy (Reach Akash), Detroit',
    ogDesc: 'Custom software, custom AI agents, AI coaching and website design (from $499) in Detroit, Michigan.',
    jsonld: [
      {
        '@context': 'https://schema.org',
        '@type': 'WebPage',
        '@id': url('/services#webpage'),
        url: url('/services'),
        name: 'Services from Akash Reddy (Reach Akash)',
        description: 'Custom software, custom AI agents, AI coaching and website design services in Detroit, Michigan.',
        isPartOf: { '@id': url('/#website') },
        about: { '@id': url('/#brand') }
      },
      ...SERVICES,
      crumbs(['Services', '/services'])
    ],
    sitemap: { changefreq: 'monthly', priority: '0.9' },
    llms: 'Services from Akash Reddy (Reach Akash) in Detroit, Michigan: custom software (including test data and workflow tools for teams that build and test hardware), custom AI agents, AI coaching (one-on-one or team) and website design starting at $499 for a fully functioning website. Contact: https://reachakash.com/contact'
  },
  {
    slug: 'lab', path: '/lab', out: 'lab.html', source: 'pages/lab.html', nav: 'lab', draft: true,
    title: 'Lab | Reach Akash',
    description: 'What Reach Akash is building: open-source and AI tools for manufacturing and test teams, from early experiments to live products.',
    ogType: 'website',
    ogTitle: 'Lab | Reach Akash',
    ogDesc: 'Tools in progress for manufacturing and test teams.',
    jsonld: [crumbs(['Lab', '/lab'])],
    sitemap: { changefreq: 'weekly', priority: '0.8' },
    llms: 'The Lab: tools Reach Akash is building for manufacturing and test teams.'
  },
  {
    slug: 'notes', path: '/notes', out: 'notes.html', source: 'pages/notes.html', nav: 'notes', draft: true,
    title: 'Notes | Reach Akash',
    description: 'Notes from Reach Akash on test data, manufacturing software and building tools with AI.',
    ogType: 'website',
    ogTitle: 'Notes | Reach Akash',
    ogDesc: 'Writing on test data, manufacturing software and building with AI.',
    jsonld: [crumbs(['Notes', '/notes'])],
    sitemap: { changefreq: 'weekly', priority: '0.7' },
    llms: 'Notes: writing on test data, manufacturing software and building tools with AI.'
  },
  {
    slug: 'suggestions', path: '/suggestions', out: 'suggestions.html', source: 'pages/suggestions.html', nav: 'suggestions',
    title: 'Suggestion Box | Reach Akash',
    description: 'Got an idea for reachakash.com, a project or a referral to add? Drop it in Akash Reddy\'s suggestion box. Your name and email are optional.',
    ogType: 'website',
    ogTitle: 'Suggestion Box | Reach Akash',
    ogDesc: 'Drop an idea in the box. Your name and email are optional.',
    jsonld: [crumbs(['Suggestions', '/suggestions'])],
    sitemap: { changefreq: 'yearly', priority: '0.4' },
    llms: 'Suggestion box: send Akash Reddy an idea for the site, a project, a service or a referral to add. Name and email are optional.'
  },
  {
    slug: 'privacy', path: '/privacy', out: 'privacy.html', source: 'pages/privacy.html', nav: 'privacy',
    title: 'Privacy & Cookies | Reach Akash',
    description: 'What reachakash.com collects, what it stores in your browser (cookies and local storage), and how to ask for your data to be deleted.',
    ogType: 'website',
    ogTitle: 'Privacy & Cookies | Reach Akash',
    ogDesc: 'What this site collects, what it stores in your browser, and how to ask for deletion.',
    jsonld: [crumbs(['Privacy', '/privacy'])],
    sitemap: { changefreq: 'yearly', priority: '0.3' },
    llms: null
  },

  // ── Not-found page. GitHub Pages serves 404.html (with a 404 status) for any
  //    unknown path, so it has no canonical and is never indexed.
  {
    slug: 'not-found', path: null, out: '404.html', source: 'pages/404.html', notFound: true,
    title: 'Page not found | Reach Akash',
    description: 'This page does not exist. Try Services, Referrals or About.',
    ogType: 'website',
    ogTitle: 'Page not found | Reach Akash',
    ogDesc: 'This page does not exist.',
    jsonld: [],
    sitemap: false,
    llms: null
  },

  // ── Old alias. /home used to render the home page; send it to /.
  { slug: 'home-alias', path: '/home', out: 'home.html', redirectTo: '/' }
];

const llms = {
  title: 'Vurenuka Akash Reddy',
  summary: 'Vurenuka Akash Reddy (also known as Akash Reddy, V Akash Reddy, V Akash, Reach Akash, Vurenuka) is an AI software developer at Molex based in Detroit, MI, USA. Originally from Hyderabad, India. Through Reach Akash (reachakash.com) he offers custom software, custom AI agents, AI coaching and website design (from $499) in Detroit, Michigan.',
  sections: [
    ['Identity', [
      'Full legal name: Vurenuka Akash Reddy',
      'Common names: Akash Reddy, V Akash Reddy, V Akash, Akash, Reach Akash, Vurenuka',
      'Role: AI Software Developer',
      'Employer: Molex (GRTS team)',
      'Previous employers: Zoetis (Veterinary Medicine Research & Development department), Raptor Consultants Group, Tata Consultancy Services, Persistent Systems Ltd.',
      'Location: Detroit, Michigan, USA',
      'Origin: Hyderabad, Telangana, India',
      'Website: https://reachakash.com'
    ]],
    ['Services', [
      'Business name: Reach Akash (reachakash.com), run by Akash Reddy in Detroit, Michigan',
      'Software services: custom software and automation, including test data and workflow tools for teams that build and test hardware',
      'Website design services: starting at $499 for a fully functioning website',
      'Custom AI agents: agents built around a client’s documents, tools and repeat tasks',
      'AI coaching: one-on-one or team coaching on using AI tools in everyday work',
      'Details: https://reachakash.com/services',
      'Contact: https://reachakash.com/contact'
    ]],
    ['Social Profiles', [
      'LinkedIn: https://www.linkedin.com/in/akashreddyv/',
      'GitHub: https://github.com/akashreddyv',
      'Instagram: https://www.instagram.com/ak.r48',
      'X / Twitter: https://x.com/AkReddy48',
      'YouTube: https://www.youtube.com/@ak.r48',
      'Threads: https://www.threads.com/@ak.r48'
    ]]
  ]
};

module.exports = {
  site: {
    origin: ORIGIN,
    // The logo, not a photo, is what should show up when any page on this site is shared
    // as a link preview (iMessage, WhatsApp, Slack, etc.) — see images/brand/og-image.png.
    ogImage: url('/images/brand/og-image.png'),
    ogImageAlt: 'reachAkash.com — Reach Akash (Akash Reddy)'
  },
  routes,
  llms
};
