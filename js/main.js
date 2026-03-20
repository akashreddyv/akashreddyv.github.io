document.addEventListener("DOMContentLoaded", function () {

  // ── Show Page (UPDATED TO FETCH EXTERNAL FILES) ──
  window.showPage = async function (name) {
    const contentDiv = document.getElementById('content');
    
    try {
      // Fetch the HTML file from the 'pages' folder asynchronously
      const response = await fetch(`pages/${name}.html`);
      
      if (!response.ok) {
        throw new Error(`Failed to load page: ${response.status}`);
      }
      
      const htmlText = await response.text();

      console.log(`Fetched pages/${name}.html length:`, htmlText.length);
      // Keep our markup safe: strip <script> tags from included fragments
      const cleaned = htmlText.replace(/<script[\s\S]*?<\/script>/gi, '');

      // Use temp container to force browser to parse all HTML before injecting
      const temp = document.createElement('div');
      temp.innerHTML = cleaned;
      
      // Clear and append parsed nodes
      contentDiv.innerHTML = '';
      while (temp.firstChild) {
        contentDiv.appendChild(temp.firstChild);
      }

      const cardCount = contentDiv.querySelectorAll('a.social-card').length;
      if (name === 'socials') {
        console.log('socials cards found in DOM:', cardCount);
      }

      // Scroll back to the top smoothly
      window.scrollTo({ top: 0, behavior: 'smooth' });

      // Update active state on nav buttons
      document.querySelectorAll('.nav-links button').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.page === name);
      });

      // Close mobile menu if open
      document.getElementById('navLinks').classList.remove('open');

      // Re-attach custom cursor hover events to the newly injected elements
      attachCursorEvents();

    } catch (error) {
      console.error("Routing Error:", error);
      contentDiv.innerHTML = `<div style="padding: 2rem; color: #cc0000;">
                                <h2>Error Loading Page</h2>
                                <p>Could not load pages/${name}.html.</p>
                                <p>Ensure the file exists and you are running via Live Server.</p>
                              </div>`;
    }
  };

  // ── Mobile Menu (UNCHANGED) ──
  window.toggleMenu = function () {
    document.getElementById('navLinks').classList.toggle('open');
  };

  // ── Contact Form (UNCHANGED) ──
  window.handleForm = function (e) {
    e.preventDefault();
    const name  = document.getElementById('form-name').value;
    const email = document.getElementById('form-email').value;
    const msg   = document.getElementById('form-msg').value;

    const to = 'your@email.com'; // CHANGE THIS
    window.location.href = `mailto:${to}?subject=Message from ${encodeURIComponent(name)}&body=${encodeURIComponent(msg + '\n\nFrom: ' + email)}`;
  };

  // ── Custom Cursor (UNCHANGED) ──
  const cursor = document.getElementById('cursor');
  const cursorRing = document.getElementById('cursorRing');

  let mx = 0, my = 0, rx = 0, ry = 0;

  document.addEventListener('mousemove', e => {
    mx = e.clientX;
    my = e.clientY;
    cursor.style.left = mx + 'px';
    cursor.style.top  = my + 'px';
  });

  (function animateRing() {
    rx += (mx - rx) * 0.12;
    ry += (my - ry) * 0.12;
    cursorRing.style.left = rx + 'px';
    cursorRing.style.top  = ry + 'px';
    requestAnimationFrame(animateRing);
  })();

  // ── Cursor Event Binder (NEW) ──
  // Wrapped in a function so it can be called after new HTML is injected
  function attachCursorEvents() {
    document.querySelectorAll('a, button, .home-card, .social-card').forEach(el => {
      // Using onmouseenter instead of addEventListener to prevent duplicate events on page swap
      el.onmouseenter = () => {
        cursor.style.width = '16px';
        cursor.style.height = '16px';
        cursorRing.style.width = '54px';
        cursorRing.style.height = '54px';
      };
      el.onmouseleave = () => {
        cursor.style.width = '10px';
        cursor.style.height = '10px';
        cursorRing.style.width = '36px';
        cursorRing.style.height = '36px';
      };
    });
  }

  // Bind cursor events for the navigation bar
  attachCursorEvents();

  // Load the home page automatically when the application starts
  window.showPage('home');
});