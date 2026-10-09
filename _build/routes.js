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
  knowsAbout: ['Software Development', 'Database Architecture', 'SQL Server', 'C#', '.NET Framework', 'LabVIEW', 'Industrial Test Automation', 'AI', 'Travel'],
  description: 'Vurenuka Akash Reddy (also known as Akash Reddy, V Akash Reddy) is an AI software developer at Molex based in Detroit, MI, USA. Originally from Hyderabad, India.'
};

// The studio brand — carries the North Ladder mark as its logo.
const BRAND = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  '@id': url('/#brand'),
  name: 'Reach Akash',
  url: url('/'),
  logo: { '@type': 'ImageObject', url: url('/images/brand/reachakash-symbol.png'), width: 843, height: 2048 },
  founder: { '@id': url('/#person') }
};

const routes = [
  {
    slug: 'home', path: '/', out: 'index.html', source: 'pages/home.html', nav: 'home',
    title: 'Akash Reddy (Reach Akash) | AI Software Developer',
    description: 'Personal site of Vurenuka Akash Reddy (Reach Akash, Akash Reddy, Reddy Akash), AI Software Developer at Molex in Detroit, MI. Explore work, projects, and more.',
    ogType: 'profile',
    ogTitle: 'Akash Reddy, AI Software Developer',
    ogDesc: 'Akash Reddy (V Akash Reddy) is an AI software developer at Molex based in Detroit, MI. Explore his work, projects, and background at reachakash.com.',
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
    llms: 'Landing page for Vurenuka Akash Reddy, software developer, creator, digital native.'
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
    description: 'Career timeline and skills of Akash Reddy (V Akash Reddy), AI Software Developer at Molex. SQL Server, C#, .NET, LabVIEW, and more. MS Engineering Management, Arkansas State.',
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
    slug: 'projects', path: '/projects', out: 'projects.html', source: 'pages/projects.html', nav: 'projects', navGroup: 'about',
    title: 'Akash Reddy | Projects',
    description: 'Software projects and portfolio of V Akash Reddy (Vurenuka Akash Reddy), including a personal website built with vanilla JS, a 3D interactive logo viewer, and more.',
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
            name: 'Raptor Consultants Group, 3D Interactive Logo',
            description: '3D interactive logo viewer built with Three.js, featuring crystal and SVG extrusion modes with real-time controls.',
            creator: { '@type': 'Person', name: 'Vurenuka Akash Reddy' }
          }
        ]
      },
      crumbs(['Projects', '/projects'])
    ],
    sitemap: { changefreq: 'monthly', priority: '0.8' },
    llms: 'Software portfolio, including personal website reachakash.com (HTML/CSS/JS, GitHub Pages) and a 3D interactive logo viewer for Raptor Consultants Group (Three.js, SVG).'
  },

  {
    slug: 'socials', path: '/socials', out: 'socials.html', source: 'pages/socials.html', nav: 'socials', navGroup: 'about',
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
    slug: 'gallery', path: '/gallery', out: 'gallery.html', source: 'pages/gallery.html', nav: 'gallery',
    title: 'Akash Reddy | Gallery',
    description: 'Photos of Akash Reddy (Vurenuka Akash Reddy, V Akash Reddy), software developer based in Detroit, MI, originally from Hyderabad, India.',
    ogType: 'website',
    ogTitle: 'Akash Reddy Photo Gallery',
    ogDesc: 'Photo gallery of Vurenuka Akash Reddy (Akash Reddy, V Akash Reddy), software developer in Detroit, MI.',
    jsonld: [
      {
        '@context': 'https://schema.org',
        '@type': 'ImageGallery',
        name: 'Akash Reddy Photo Gallery',
        description: 'Photos of Vurenuka Akash Reddy (Akash Reddy, V Akash Reddy), software developer in Detroit, MI, originally from Hyderabad, India.',
        url: url('/gallery'),
        author: { '@type': 'Person', name: 'Vurenuka Akash Reddy', url: ORIGIN },
        image: [
          { '@type': 'ImageObject', contentUrl: PHOTO, name: 'Vurenuka Akash Reddy, Professional Portrait',
            description: 'Akash Reddy in professional attire outdoors, AI software developer at Molex, Detroit MI', width: 1200, height: 847 },
          { '@type': 'ImageObject', contentUrl: PORTRAIT, name: 'Akash Reddy Portrait',
            description: 'V Akash Reddy, candid outdoor portrait, smiling', width: 1200, height: 1600 }
        ]
      },
      crumbs(['Gallery', '/gallery'])
    ],
    sitemap: { changefreq: 'yearly', priority: '0.5' },
    llms: null
  },

  // ── Business routes: stubs until Phases 2–3 fill them. Drafts are noindex
  //    and stay out of the sitemap and llms.txt.
  {
    slug: 'services', path: '/services', out: 'services.html', source: 'pages/services.html', nav: 'services', draft: true,
    title: 'Services | Reach Akash',
    description: 'Software and AI tools for teams that build and test hardware: test data sprints, AI workflow sprints and a paid diagnostic.',
    ogType: 'website',
    ogTitle: 'Services | Reach Akash',
    ogDesc: 'Software and AI tools for teams that build and test hardware.',
    jsonld: [crumbs(['Services', '/services'])],
    sitemap: { changefreq: 'monthly', priority: '0.9' },
    llms: 'Services from Reach Akash, a one-person software and AI studio for teams that build and test hardware.'
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
    slug: 'privacy', path: '/privacy', out: 'privacy.html', source: 'pages/privacy.html', nav: 'privacy', draft: true,
    title: 'Privacy | Reach Akash',
    description: 'What the forms on reachakash.com collect, why, where it is stored and how to ask for it to be deleted.',
    ogType: 'website',
    ogTitle: 'Privacy | Reach Akash',
    ogDesc: 'What the forms on reachakash.com collect and how to ask for deletion.',
    jsonld: [crumbs(['Privacy', '/privacy'])],
    sitemap: { changefreq: 'yearly', priority: '0.3' },
    llms: null
  },

  // ── Not-found page. GitHub Pages serves 404.html (with a 404 status) for any
  //    unknown path, so it has no canonical and is never indexed.
  {
    slug: 'not-found', path: null, out: '404.html', source: 'pages/404.html', notFound: true,
    title: 'Page not found | Reach Akash',
    description: 'This page does not exist. Try Services, the Lab or About.',
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
  summary: 'Vurenuka Akash Reddy (also known as Akash Reddy, V Akash Reddy, V Akash, Reach Akash, Vurenuka) is an AI software developer at Molex based in Detroit, MI, USA. Originally from Hyderabad, India. His personal website is reachakash.com.',
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
    ogImage: PHOTO,
    ogImageAlt: 'Akash Reddy, AI Software Developer'
  },
  routes,
  llms
};
