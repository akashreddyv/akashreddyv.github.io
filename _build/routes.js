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
     llmsName    its link text there (default: the slug)
   ============================================================ */

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ORIGIN = 'https://reachakash.com';
const url = (p) => ORIGIN + p;

// js/site-config.js is the one place for switches and contact details. Run the browser's file
// here, so pages, JSON-LD and llms.txt all read the same values (build.js uses it too).
const browser = { window: {} };
vm.runInNewContext(fs.readFileSync(path.join(__dirname, '../js/site-config.js'), 'utf8'), browser, { filename: 'js/site-config.js' });
const EMAIL = browser.window.SITE_CONFIG.contactEmail;
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
const PHOTO = url('/images/home/akash-reddy-professional.jpg');
const PORTRAIT = url('/images/home/akash-reddy-portrait.jpg');

// Photos of Akash (_build/data/photos.json): shown on /gallery, and described everywhere as
// images *about* the Person entity, with a credit line (no creator or copyright claim).
const PHOTOS = require('./data/photos.json').photos;
const CREDIT = 'Akash Reddy (reachakash.com)';
const photoObject = (p, extra = {}) => ({
  '@type': 'ImageObject',
  contentUrl: url(p.file),
  url: url(p.file),
  name: p.title,
  caption: p.alt,
  width: p.width,
  height: p.height,
  creditText: CREDIT,
  about: { '@id': url('/#person') },
  ...extra
});
const photoByFile = (file) => {
  const p = PHOTOS.find((x) => x.file === file);
  if (!p) throw new Error(`${file} is not in _build/data/photos.json`);
  return p;
};

// Akash's public profiles: [name, URL]. They are the Person's sameAs links and the profile list
// in llms.txt, and build.js checks that the Socials page links to every one of them.
const PROFILES = [
  ['LinkedIn', 'https://www.linkedin.com/in/akashreddyv/'],
  ['GitHub', 'https://github.com/akashreddyv'],
  ['Instagram', 'https://www.instagram.com/ak.r48'],
  ['X', 'https://x.com/AkReddy48'],
  ['YouTube', 'https://www.youtube.com/@ak.r48'],
  ['Threads', 'https://www.threads.com/@ak.r48'],
  ['Snapchat', 'https://www.snapchat.com/@ak.r48'],
  ['Facebook', 'https://www.facebook.com/ak.r48']
];

// Latest "checked" date across published referral entries, for the Referrals page's dateModified
// and the month in its title. (sitemap.xml dates come from _build/data/page-dates.json.)
const REFERRALS_UPDATED = require('./data/referrals.json').entries
  .filter((e) => e.publish).map((e) => e.lastVerified).sort().pop();
const REFERRALS_MONTH = (() => {
  const [y, m] = REFERRALS_UPDATED.split('-').map(Number);
  return ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][m - 1] + ' ' + y;
})();

const crumbs = (...items) => ({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [['Home', '/'], ...items].map(([name, p], i) => ({
    '@type': 'ListItem', position: i + 1, name, item: url(p)
  }))
});

// One person and one studio, each under a single @id on every page, so search engines and AI
// tools see the same Akash Reddy everywhere rather than several look-alikes. The short forms
// name the entity wherever a page only refers to it (author, provider, founder).
const PERSON_REF = { '@type': 'Person', '@id': url('/#person'), name: 'Akash Reddy', url: ORIGIN };
const BRAND_REF = { '@type': 'Organization', '@id': url('/#brand'), name: 'Reach Akash', url: url('/') };

const DETROIT = { '@type': 'City', name: 'Detroit', containedInPlace: { '@type': 'State', name: 'Michigan' } };
const ADDRESS = { '@type': 'PostalAddress', addressLocality: 'Detroit', addressRegion: 'MI', addressCountry: 'US' };
const degree = (name, school) => ({
  '@type': 'EducationalOccupationalCredential', name, credentialCategory: 'degree',
  recognizedBy: { '@type': 'CollegeOrUniversity', name: school }
});

// The full Person entity, on every page that is about Akash (Home, Personal, Professional,
// Socials, Contact). Facts only, and the same ones the pages show.
const PERSON = {
  '@context': 'https://schema.org',
  ...PERSON_REF,
  givenName: 'Akash',
  familyName: 'Reddy',
  // Name variants for search only: the pages themselves just say Akash Reddy (or Akash).
  // The last three are his handles (GitHub and LinkedIn, Instagram and others, X).
  alternateName: ['Vurenuka Akash Reddy', 'Akash Reddy Vurenuka', 'V Akash Reddy', 'Reddy Akash', 'V Akash', 'Akash', 'AK', 'AK Reddy', 'Reach Akash', 'Reddy', 'akashreddyv', 'ak.r48', 'AkReddy48'],
  disambiguatingDescription: 'AI software developer in Detroit, Michigan, and founder of Reach Akash (reachakash.com)',
  description: 'Akash Reddy (full name Vurenuka Akash Reddy, also known as V Akash Reddy and Reach Akash) is an AI software developer at Molex based in Detroit, MI, USA, originally from Hyderabad, India. Through Reach Akash he offers custom software, custom AI agents, AI coaching and website development.',
  mainEntityOfPage: url('/personal'),
  image: PHOTOS.map((p) => photoObject(p)),
  email: EMAIL,
  jobTitle: 'AI Software Developer',
  worksFor: { '@type': 'Organization', name: 'Molex', url: 'https://www.molex.com' },
  hasOccupation: {
    '@type': 'Occupation',
    name: 'AI Software Developer',
    occupationLocation: { '@type': 'City', name: 'Detroit, MI' },
    skills: 'SQL Server, T-SQL, database architecture, C#, .NET Framework, LabVIEW, .NET/LabVIEW interop, industrial test automation, data pipeline design, PostgreSQL, SQL, JavaScript, Git, GitLab'
  },
  alumniOf: [
    { '@type': 'CollegeOrUniversity', name: 'Arkansas State University', sameAs: 'https://www.astate.edu' },
    { '@type': 'CollegeOrUniversity', name: 'Amity University' },
    { '@type': 'CollegeOrUniversity', name: 'Malla Reddy Institute of Technology' }
  ],
  hasCredential: [
    degree('M.S. in Engineering Management', 'Arkansas State University'),
    degree('M.B.A. in Digital Entrepreneurship', 'Amity University'),
    degree('B.Tech in Information Technology', 'Malla Reddy Institute of Technology'),
    { '@type': 'EducationalOccupationalCredential', name: 'AWS Certified Cloud Practitioner', credentialCategory: 'certification',
      recognizedBy: { '@type': 'Organization', name: 'Amazon Web Services' } }
  ],
  address: ADDRESS,
  sameAs: PROFILES.map(([, link]) => link),
  knowsAbout: ['Software Development', 'AI Agents', 'AI Coaching', 'Website Development', 'Database Architecture', 'SQL Server', 'C#', '.NET Framework', 'LabVIEW', 'Industrial Test Automation', 'AI', 'Travel'],
  brand: BRAND_REF
};

// One Service entity per offering, each with its own page /services/<id> (no Review or rating markup).
const service = (id, name, serviceType, description) => ({
  '@context': 'https://schema.org',
  '@type': 'Service',
  '@id': url('/services/' + id + '#service'),
  name, serviceType, description,
  provider: BRAND_REF,
  areaServed: DETROIT,
  url: url('/services/' + id)
});
const SERVICES = [
  service('custom-software', 'Custom software', 'Custom software development',
    'Custom software and automation, including test data and workflow tools for teams that build and test hardware.'),
  service('website-development', 'Website development', 'Website development',
    'Fast, mobile-friendly websites built around what you need, from a one-page site to a full business website.'),
  service('ai-agents', 'Custom AI agents', 'AI agent development',
    'AI agents built around your work that use your documents and tools to handle repeat tasks.'),
  service('ai-coaching', 'AI coaching', 'AI coaching',
    'One-on-one or team coaching on using AI tools in your everyday work.')
];

// The studio brand — carries "The Ascent" mark as its logo. On Home, Services and Contact.
const BRAND = {
  '@context': 'https://schema.org',
  ...BRAND_REF,
  alternateName: ['reachAkash', 'ReachAkash', 'reachAkash.com', 'Reach Akash by Akash Reddy'],
  logo: { '@type': 'ImageObject', url: url('/images/brand/reachakash-symbol.png'), width: 2400, height: 1681 },
  description: 'Reach Akash is the studio of Akash Reddy in Detroit, Michigan: custom software, custom AI agents, AI coaching and website development.',
  email: EMAIL,
  contactPoint: { '@type': 'ContactPoint', contactType: 'customer service', email: EMAIL, url: url('/contact') },
  address: ADDRESS,
  areaServed: DETROIT,
  knowsAbout: ['Custom Software', 'AI Agents', 'AI Coaching', 'Website Development'],
  founder: PERSON_REF,
  hasOfferCatalog: {
    '@type': 'OfferCatalog',
    name: 'Services',
    itemListElement: SERVICES.map((s) => ({ '@type': 'Offer', itemOffered: { '@type': 'Service', '@id': s['@id'], name: s.name, url: s.url } }))
  }
};

// The service pages (pages/services/<id>.html): [id, breadcrumb name, title, description].
const SERVICE_PAGES = [
  ['custom-software', 'Custom software', 'Custom Software Developer in Detroit | Akash Reddy',
    'Custom software developer in Detroit, MI: test and data acquisition software, databases, analysis tools and automation from Akash Reddy.'],
  ['website-development', 'Website development', 'Website Developer in Detroit, MI | Akash Reddy',
    'Website developer in Detroit, MI: Akash Reddy designs and builds fast, mobile-friendly websites, from one-page sites to full business websites.'],
  ['ai-agents', 'Custom AI agents', 'Custom AI Agents & Automation, Detroit | Akash Reddy',
    'Custom AI agents from Akash Reddy in Detroit, MI: agents that use your documents and tools to answer questions, draft replies and run workflows.'],
  ['ai-coaching', 'AI coaching', 'AI Coaching for People & Teams, Detroit | Akash Reddy',
    'AI coaching from Akash Reddy in Detroit, MI: one-on-one or team sessions on using ChatGPT, Claude and other AI tools in your everyday work.']
].map(([id, crumb, title, description]) => ({
  slug: 'service-' + id, path: '/services/' + id, out: 'services/' + id + '.html', source: 'pages/services/' + id + '.html',
  nav: 'services', navCurrent: 'true', faq: true,
  title, description,
  ogType: 'website',
  ogTitle: title.replace(' | Akash Reddy', ''),
  ogDesc: description,
  // build.js completes every page node with its url, the site it belongs to and dateModified.
  jsonld: [
    {
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      '@id': url('/services/' + id + '#webpage'),
      name: title,
      about: { '@id': url('/services/' + id + '#service') },
      author: PERSON_REF
    },
    SERVICES.find((s) => s.url === url('/services/' + id)),
    crumbs(['Services', '/services'], [crumb, '/services/' + id])
  ],
  sitemap: { changefreq: 'monthly', priority: '0.8' },
  llmsName: crumb,
  llms: description
}));

const routes = [
  {
    slug: 'home', path: '/', out: 'index.html', source: 'pages/home.html', nav: 'home',
    title: 'Akash Reddy | AI Software & Website Developer, Detroit',
    description: 'Akash Reddy, AI software and website developer in Detroit, MI: custom software, AI agents, AI coaching and websites. Projects, work history and contact.',
    ogType: 'profile',
    // Kept short and name-only on purpose: this is the card people see when the link itself
    // is shared (iMessage, WhatsApp, Slack...). The job-title-rich text above is for search
    // engines and stays in <title>/description, which this doesn't touch.
    ogTitle: 'Akash Reddy · Reach Akash',
    ogDesc: 'reachAkash.com',
    jsonld: [
      {
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        '@id': url('/#website'),
        url: url('/'),
        name: 'Reach Akash',
        alternateName: ['reachAkash', 'reachAkash.com', 'Akash Reddy', 'Reddy Akash', 'Reach Akash Reddy'],
        inLanguage: 'en',
        publisher: BRAND_REF,
        about: PERSON_REF
      },
      {
        '@context': 'https://schema.org',
        '@type': 'WebPage',
        '@id': url('/#webpage'),
        name: 'Akash Reddy | AI Software & Website Developer, Detroit',
        about: { '@id': url('/#person') },
        primaryImageOfPage: photoObject(photoByFile('/images/home/akash-reddy-professional.jpg'), { representativeOfPage: true })
      },
      BRAND,
      PERSON
    ],
    sitemap: {
      changefreq: 'weekly', priority: '1.0',
      images: [
        [PHOTO, 'Akash Reddy Professional Portrait'],
        [PORTRAIT, 'Akash Reddy Portrait']
      ]
    },
    // The LCP image on Home, plus the redirect for old /?p=/route links that the
    // previous 404 trick created.
    headExtra: [
      // Same choices as the <img> in pages/home.html, so phones fetch only the 800px WebP.
      '  <link rel="preload" as="image" href="/images/home/akash-reddy-professional.jpg" imagesrcset="/images/home/akash-reddy-professional-800.webp 800w, /images/home/akash-reddy-professional.jpg 1200w" imagesizes="(max-width: 622px) 90vw, 560px" fetchpriority="high">',
      '  <script>',
      "    (function () { var p = new URLSearchParams(location.search).get('p');",
      "      if (p && /^\\/(?!\\/)[a-z0-9\\-\\/]*$/i.test(p)) location.replace(p); })();",
      '  </script>'
    ].join('\n') + '\n',
    llms: 'Landing page for Akash Reddy (Reach Akash), software developer in Detroit, MI, with links to his services, projects, work history, social profiles and contact.'
  },

  // About and Personal are one page now: /personal. /about redirects to it.
  {
    slug: 'personal', path: '/personal', out: 'personal.html', source: 'pages/personal.html', nav: 'personal', navGroup: 'about',
    title: 'About Akash Reddy | Software Developer in Detroit',
    description: 'Akash Reddy is a software developer from Hyderabad, now in Metro Detroit: AI Software Developer at Molex and founder of Reach Akash. Bio and quick facts.',
    ogType: 'profile',
    ogTitle: 'About Akash Reddy',
    ogDesc: 'Software developer from Hyderabad, now in Metro Detroit. Builds manufacturing test software and uses AI to get from idea to working tool fast.',
    jsonld: [
      {
        '@context': 'https://schema.org',
        '@type': 'ProfilePage',
        '@id': url('/personal#webpage'),
        name: 'About Akash Reddy',
        mainEntity: { '@id': url('/#person') },
        primaryImageOfPage: photoObject(photoByFile('/images/home/akash-reddy-portrait.jpg'), { representativeOfPage: true })
      },
      PERSON,
      crumbs(['About', '/personal'])
    ],
    sitemap: { changefreq: 'monthly', priority: '0.9', images: [[PORTRAIT, 'Akash Reddy Portrait']] },
    llms: 'About Akash Reddy: bio, photo and quick facts. Software developer from Hyderabad, now in Metro Detroit; AI Software Developer at Molex and founder of Reach Akash; techie, AI enthusiast, travel and adventure seeker. Links to his professional history, projects and social profiles.'
  },
  { slug: 'about', path: '/about', out: 'about.html', redirectTo: '/personal' },

  {
    slug: 'professional', path: '/professional', out: 'professional.html', source: 'pages/professional.html', nav: 'professional', navGroup: 'about',
    title: 'Akash Reddy | Experience, Skills & Education',
    description: 'Career and skills of Akash Reddy, AI Software Developer at Molex: SQL Server, C#, .NET, LabVIEW. MS Engineering Management, Arkansas State.',
    ogType: 'website',
    ogTitle: 'Akash Reddy, Professional Experience and Skills',
    ogDesc: 'AI Software Developer at Molex, Detroit MI. SQL Server, C#, .NET, LabVIEW. Previously Zoetis. MS Engineering Management from Arkansas State University.',
    jsonld: [
      {
        '@context': 'https://schema.org',
        '@type': 'WebPage',
        '@id': url('/professional#webpage'),
        name: 'Akash Reddy: experience, skills and education',
        mainEntity: { '@id': url('/#person') }
      },
      PERSON,
      crumbs(['Professional', '/professional'])
    ],
    sitemap: { changefreq: 'monthly', priority: '0.8' },
    llms: 'Career and education. AI Software Developer at Molex (Jun 2026-present) on the GRTS team, building database systems for connector reliability test stations (SQL Server, C#, .NET Framework, LabVIEW). Previously Software Developer at Zoetis (Jan 2026-Jun 2026), building ZAHM (.NET 4.8, C#, WinForms, PostgreSQL, NI-VISA); Software Developer at Raptor Consultants Group (Nov 2024-Dec 2025); Software Engineer at Tata Consultancy Services (Aug 2022-Aug 2023); and Associate Software Developer at Persistent Systems Ltd. Education: MS Engineering Management (Arkansas State University, 2023-2024), MBA Digital Entrepreneurship (Amity University, 2023-2025), B.Tech Information Technology (Malla Reddy Institute of Technology, 2018-2022).'
  },

  {
    slug: 'projects', path: '/projects', out: 'projects.html', source: 'pages/projects.html', nav: 'projects',
    title: 'Projects by Akash Reddy | Websites, Software & 3D',
    description: 'Software projects by Akash Reddy: this website, generated from one template with vanilla JS, a 3D logo viewer and more.',
    ogType: 'website',
    ogTitle: 'Akash Reddy, Software Projects and Portfolio',
    ogDesc: 'Software projects by Akash Reddy: personal website, 3D logo viewer built with Three.js, and more. HTML, CSS, JavaScript, and C# / .NET.',
    jsonld: [
      {
        '@context': 'https://schema.org',
        '@type': 'CollectionPage',
        '@id': url('/projects#webpage'),
        name: 'Projects by Akash Reddy',
        description: 'Software projects and portfolio of Akash Reddy',
        author: PERSON_REF,
        hasPart: [
          {
            '@type': 'CreativeWork',
            name: 'reachakash.com, Personal Portfolio Website',
            description: 'A multi-page personal portfolio built with HTML, CSS, and vanilla JavaScript: static pages generated from one shared template by a small build script, with no framework and no client-side router. Hosted on GitHub Pages.',
            url: url('/projects/reachakash-website'),
            creator: PERSON_REF
          },
          {
            '@type': 'CreativeWork',
            name: 'Logo Designs, 3D Interactive Viewer',
            description: '3D interactive logo viewer built with Three.js: the reachAkash mark and a crystal variant, with a play button, front/back/top/bottom views, and real-time material controls.',
            url: url('/projects/logodesigns'),
            creator: PERSON_REF
          }
        ]
      },
      crumbs(['Projects', '/projects'])
    ],
    sitemap: { changefreq: 'monthly', priority: '0.8' },
    llms: 'Software portfolio, including personal website reachakash.com (HTML/CSS/JS, GitHub Pages) and a 3D interactive logo viewer (Three.js, SVG).'
  },
  {
    // The write-up of this site. Keep it true: when the site changes, update pages/projects/reachakash-website.html.
    slug: 'project-website', path: '/projects/reachakash-website', out: 'projects/reachakash-website.html', source: 'pages/projects/reachakash-website.html',
    nav: 'projects', navCurrent: 'true',
    title: 'How reachakash.com Is Built | Akash Reddy',
    description: 'How Akash Reddy built reachakash.com: fast pages with no framework, an admin page that works from a phone, serverless contact forms and search-ready data.',
    ogType: 'article',
    ogTitle: 'How reachakash.com is built',
    ogDesc: 'Fast pages with no framework, an admin page that works from a phone, serverless contact forms and search-ready data.',
    jsonld: [
      {
        '@context': 'https://schema.org',
        '@type': 'TechArticle',
        '@id': url('/projects/reachakash-website#article'),
        headline: 'How reachakash.com is built',
        description: 'How reachakash.com works: static pages generated from one template with no framework, an admin page built on Decap CMS, contact forms on a Cloudflare Worker, and structured data, a sitemap and IndexNow for search.',
        author: PERSON_REF,
        publisher: BRAND_REF,
        datePublished: '2026-11-13',
        image: url('/images/brand/og-image.png'),
        about: { '@type': 'WebSite', '@id': url('/#website'), name: 'Reach Akash', url: url('/') },
        inLanguage: 'en'
      },
      crumbs(['Projects', '/projects'], ['How this site is built', '/projects/reachakash-website'])
    ],
    sitemap: { changefreq: 'monthly', priority: '0.7' },
    llmsName: 'How reachakash.com is built',
    llms: 'How the site works: plain HTML, CSS and JavaScript generated from one template by a small Node.js build script (no framework), hosted on GitHub Pages; an admin page built on Decap CMS with automatic builds on GitHub Actions; contact form, suggestion box and chat box that email through a Cloudflare Worker; structured data, a sitemap with dates and images, IndexNow pings and llms.txt; cookieless analytics; a 3D logo viewer built with Three.js.'
  },

  {
    slug: 'socials', path: '/socials', out: 'socials.html', source: 'pages/socials.html', nav: 'socials',
    title: 'Akash Reddy on Instagram, LinkedIn, X, YouTube & GitHub',
    description: 'The official social media profiles of Akash Reddy: LinkedIn, GitHub, Instagram @ak.r48, X @AkReddy48, YouTube, Threads, Snapchat, Discord and Facebook.',
    ogType: 'website',
    ogTitle: 'Find Akash Reddy Online, Social Media Profiles',
    ogDesc: 'All social profiles of Akash Reddy: Instagram @ak.r48, LinkedIn @akashreddyv, X @AkReddy48, YouTube @ak.r48 and more.',
    jsonld: [
      {
        '@context': 'https://schema.org',
        '@type': 'WebPage',
        '@id': url('/socials#webpage'),
        name: 'Akash Reddy on social media',
        mainEntity: { '@id': url('/#person') }
      },
      PERSON,
      crumbs(['Socials', '/socials'])
    ],
    sitemap: { changefreq: 'yearly', priority: '0.6' },
    llms: 'Social media profiles. LinkedIn @akashreddyv, GitHub @akashreddyv, Instagram @ak.r48, X @AkReddy48, YouTube @ak.r48, Snapchat @ak.r48, Discord @ak.r48, Threads @ak.r48, Facebook @ak.r48.'
  },

  {
    slug: 'contact', path: '/contact', out: 'contact.html', source: 'pages/contact.html', nav: 'contact',
    title: 'Contact Akash Reddy | Reach Akash, Detroit',
    description: `Contact Akash Reddy at Reach Akash in Detroit, MI: send a message, email ${EMAIL}, or connect on LinkedIn, Instagram or X.`,
    ogType: 'website',
    ogTitle: 'Contact Akash Reddy, Get In Touch',
    ogDesc: 'Reach Akash Reddy for work, collaboration, or to connect. LinkedIn, Instagram, or the contact form.',
    jsonld: [
      {
        '@context': 'https://schema.org',
        '@type': 'ContactPage',
        '@id': url('/contact#webpage'),
        name: 'Contact Akash Reddy',
        description: 'Contact page for Akash Reddy, AI software developer in Detroit, MI',
        mainEntity: { '@id': url('/#person') },
        about: { '@id': url('/#brand') }
      },
      PERSON,
      BRAND,
      crumbs(['Contact', '/contact'])
    ],
    sitemap: { changefreq: 'yearly', priority: '0.6' },
    llms: `Contact Akash Reddy: the contact form, email ${EMAIL}, LinkedIn, Instagram or X. Located in Detroit, MI, USA.`
  },

  {
    slug: 'gallery', path: '/gallery', out: 'gallery.html', source: 'pages/gallery.html', nav: 'gallery',
    title: 'Akash Reddy Photos & reachAkash Logos | Gallery',
    description: 'Photos of Akash Reddy, software developer in Detroit, MI, and every version of the reachAkash logo, including on merch.',
    ogType: 'website',
    ogTitle: 'Akash Reddy: Photos & Logos',
    ogDesc: 'Photos of Akash Reddy, and every version of the reachAkash logo.',
    jsonld: [
      {
        '@context': 'https://schema.org',
        '@type': 'ImageGallery',
        '@id': url('/gallery#gallery'),
        name: 'Akash Reddy: photos and logos',
        description: 'Photos of Akash Reddy, software developer in Detroit, MI, and the reachAkash logos and brand mockups.',
        about: PERSON_REF,
        author: PERSON_REF,
        image: [
          ...PHOTOS.map((p) => photoObject(p)),
          ...GALLERY.map(([file, name, w, h]) => ({ '@type': 'ImageObject', contentUrl: url('/images/brand/gallery/' + file), name, width: w, height: h, creditText: CREDIT }))
        ]
      },
      crumbs(['Gallery', '/gallery'])
    ],
    sitemap: {
      changefreq: 'monthly', priority: '0.7',
      images: [
        ...PHOTOS.map((p) => [url(p.file), p.title]),
        ...GALLERY.map(([file, name]) => [url('/images/brand/gallery/' + file), name])
      ]
    },
    llms: 'Gallery: photos of Akash Reddy, and the reachAkash logo in every version (cover banner, logo on black and on white, the mark, a red-only mark, the website name), including on a t-shirt, polo, cap, bumper sticker, mug and business cards.'
  },

  // ── Referral codes. Cards come from _build/data/referrals.json (see
  //    _build/referrals.js), which also generates a page per offer and per
  //    category under /referrals/. WebPage, ItemList and BreadcrumbList only:
  //    no Offer, Product, Review or rating markup.
  {
    slug: 'referrals', path: '/referrals', out: 'referrals.html', source: 'pages/referrals.html', nav: 'referrals',
    title: `Referral Codes & Sign-Up Bonuses (${REFERRALS_MONTH}) | Akash Reddy`,
    description: `Referral codes and sign-up links for Chase, Amex, Robinhood, Remitly, Abound, CRED, Rakuten and more, checked ${REFERRALS_MONTH}. Akash Reddy earns a reward.`,
    ogType: 'website',
    ogTitle: 'Referral codes & sign-up bonuses | Akash Reddy',
    ogDesc: 'All of Akash Reddy’s referral codes and links in one place, with official terms. He earns a reward when you sign up through them.',
    jsonld: [
      {
        '@context': 'https://schema.org',
        '@type': 'CollectionPage',
        '@id': url('/referrals#webpage'),
        name: 'Referral codes and sign-up bonuses',
        description: 'Referral codes and links from Akash Reddy for credit cards, investing, payments, sending money to India, cash back and AI tools, with a disclosure that he earns a reward and links to each program’s official terms.',
        author: PERSON_REF,
        dateModified: REFERRALS_UPDATED
      },
      crumbs(['Referrals', '/referrals'])
    ],
    sitemap: { changefreq: 'weekly', priority: '0.9' },
    llms: 'Referral codes and links of Akash Reddy (credit cards, investing and trading, payments, sending money to India, shopping and cash back, AI tools), each with its own page, a disclosure that he earns a reward and links to official terms. Machine-readable copy: https://reachakash.com/referrals.json'
  },

  // ── Business routes. Lab is retired (no links point to it) and stays a noindex
  //    draft; drafts stay out of the sitemap and llms.txt.
  {
    // faq: build.js adds FAQPage JSON-LD from the page's .faq-item blocks.
    slug: 'services', path: '/services', out: 'services.html', source: 'pages/services.html', nav: 'services', faq: true,
    title: 'Web Development & AI Services, Detroit | Akash Reddy',
    description: 'Custom software, AI agents, AI coaching and website development in Detroit, MI from Akash Reddy at Reach Akash. Tell me what you need for a quote.',
    ogType: 'website',
    ogTitle: 'Services from Akash Reddy, Detroit',
    ogDesc: 'Custom software, custom AI agents, AI coaching and website development in Detroit, Michigan.',
    jsonld: [
      {
        '@context': 'https://schema.org',
        '@type': 'WebPage',
        '@id': url('/services#webpage'),
        name: 'Services from Akash Reddy at Reach Akash',
        description: 'Custom software, custom AI agents, AI coaching and website development in Detroit, Michigan.',
        about: { '@id': url('/#brand') },
        author: PERSON_REF
      },
      BRAND,
      ...SERVICES,
      crumbs(['Services', '/services'])
    ],
    sitemap: { changefreq: 'monthly', priority: '0.9' },
    llms: 'Services from Akash Reddy at Reach Akash in Detroit, Michigan: custom software (including test data and workflow tools for teams that build and test hardware), custom AI agents, AI coaching (one-on-one or team) and website development (fast, mobile-friendly websites built around what each client needs). Each service has its own page under /services/. Contact: https://reachakash.com/contact'
  },
  ...SERVICE_PAGES,
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

// llms.txt: a plain summary of the site for AI tools. Facts only, the same ones the pages show.
const llms = {
  title: 'Akash Reddy',
  summary: 'Akash Reddy (full name Vurenuka Akash Reddy; also known as V Akash Reddy, V Akash and Reach Akash) is an AI software developer at Molex based in Detroit, MI, USA. Originally from Hyderabad, India. Through Reach Akash (reachakash.com) he offers custom software, custom AI agents, AI coaching and website development in Detroit, Michigan.',
  sections: [
    ['Identity', [
      'Name: Akash Reddy',
      'Full name: Vurenuka Akash Reddy (also written Akash Reddy Vurenuka)',
      'Also known as: V Akash Reddy, V Akash, Akash, AK, AK Reddy, Reach Akash',
      'Handles: akashreddyv (GitHub, LinkedIn), ak.r48 (Instagram, YouTube, Threads, Snapchat, Facebook, Discord), AkReddy48 (X)',
      'Role: AI Software Developer',
      'Employer: Molex (GRTS team)',
      'Previous employers: Zoetis (Veterinary Medicine Research & Development department), Raptor Consultants Group, Tata Consultancy Services, Persistent Systems Ltd.',
      'Education: M.S. in Engineering Management, Arkansas State University (2023-2024); M.B.A. in Digital Entrepreneurship, Amity University (2023-2025); B.Tech in Information Technology, Malla Reddy Institute of Technology (2018-2022)',
      'Certification: AWS Certified Cloud Practitioner',
      'Location: Detroit, Michigan, USA',
      'Origin: Hyderabad, Telangana, India',
      'Website: https://reachakash.com'
    ]],
    ['Services', [
      'Business name: Reach Akash (reachakash.com), the studio of Akash Reddy in Detroit, Michigan',
      ...SERVICES.map((s) => `${s.name}: ${s.description} ${s.url}`),
      'All services: https://reachakash.com/services'
    ]],
    ['Contact', [
      `Email: ${EMAIL}`,
      'Contact form: https://reachakash.com/contact',
      'Every page also has a chat box that can pass a message to Akash by email'
    ]],
    ['Social Profiles', PROFILES.map(([name, link]) => `${name}: ${link}`)]
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
  llms,
  profiles: PROFILES,
  browser: browser.window
};
