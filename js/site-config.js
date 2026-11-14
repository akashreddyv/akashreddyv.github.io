/* ============================================================
   reachakash.com — site configuration
   One place for every switch and external link. CTAs read it via
   data attributes (data-cta="primary"), so changing a
   value here updates the whole site. The page generator
   (_build/build.js) runs this same file, so pages built without
   JavaScript show the same CTA text and links.
   No secrets here — this file is public.
   ============================================================ */
window.SITE_CONFIG = {
  acceptingClients: true,  // false: CTAs say "Contact me"; true: "Start a project" (bookingUrl)
  bookingUrl: "",          // [EDIT] booking link; empty -> /contact
  formEndpoint: "https://api.reachakash.com/contact", // the contact Worker; the suggestion box, the chat and the terminal's `suggest` post here too
  contactEmail: "mail@reachakash.com", // shown by the chat and the terminal, and in the contact form's error message
  analyticsToken: "e8f6cb904e3b4b36ad5e98abffe5f860"       // Cloudflare Web Analytics token (from its snippet); the build adds the beacon to every page. Empty -> no analytics
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
