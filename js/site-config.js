/* ============================================================
   reachakash.com — site configuration
   One place for every switch and external link. CTAs read it via
   data attributes (data-cta="primary", data-service="…"), so changing a
   value here updates the whole site. The page generator
   (_build/build.js) runs this same file, so pages built without
   JavaScript show the same CTA text and links.
   No secrets here — this file is public.
   ============================================================ */
window.SITE_CONFIG = {
  acceptingClients: false, // false: CTAs say "Contact me"; true: "Start a project" (bookingUrl)
  bookingUrl: "",          // [EDIT] booking link; empty -> /contact
  paymentLinks: {          // Phase 5: Stripe Payment Links by service id; empty -> no pay button
    "diagnostic": "",
    "test-data-sprint": "",
    "workflow-sprint": ""
  },
  waitlistEndpoint: "",    // Phase 4 Worker URL; empty -> /contact
  formEndpoint: "https://api.reachakash.com/contact", // the contact Worker; the suggestion box and the terminal's `suggest` post here too
  contactEmail: "",        // [EDIT] e.g. mail@reachakash.com once Email Routing is verified
  analyticsToken: ""       // Phase 4: Cloudflare Web Analytics
};

/* CTA rules live here, next to the config, so the browser and the page
   generator always agree on what a CTA says and where it goes. */
window.siteCta = function (kind, config) {
  var c = config || window.SITE_CONFIG;
  if (kind === "primary") {
    return c.acceptingClients
      ? { text: "Start a project",  href: c.bookingUrl || "/contact" }
      : { text: "Contact me",      href: "/contact" };
  }
  return null;
};
