/* MK Plastic Surgery, breast reduction landing page */
(() => {
  'use strict';
  document.documentElement.classList.add('js');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------------------------------------------------------
     CONTENT SETTINGS: edit these, nothing else needs to change
     --------------------------------------------------------- */

  // Google rating shown in the hero. Leave rating as null to hide the chip.
  const GOOGLE_STATS = { rating: null, count: null }; // e.g. { rating: '5.0', count: 48 }

  // "From" price. Leave as null to show "Personalised quote after consultation".
  const PRICE_FROM = null; // e.g. '£7,950'

  // Reviews for the ticker. Replace the placeholders with the real Google
  // reviews (name + full text). Set placeholder: false on real ones.
  const REVIEWS = [
    { name: 'Patient name', meta: 'Google review', placeholder: true,
      text: 'Paste the full text of a real Google review here. Long reviews are trimmed to five lines automatically and a Read more link appears so visitors can open the full text.' },
    { name: 'Patient name', meta: 'Google review', placeholder: true,
      text: 'Paste the full text of a real Google review here.' },
    { name: 'Patient name', meta: 'Google review', placeholder: true,
      text: 'Paste the full text of a real Google review here. Reviews that mention breast reduction, the consultation and recovery work best on this page, because they mirror what visitors searched for and answer the questions they have before booking.' },
    { name: 'Patient name', meta: 'Google review', placeholder: true,
      text: 'Paste the full text of a real Google review here.' },
    { name: 'Patient name', meta: 'Google review', placeholder: true,
      text: 'Paste the full text of a real Google review here. Keep the patient\'s first name or initials only, and only publish reviews the patient left publicly.' },
    { name: 'Patient name', meta: 'Google review', placeholder: true,
      text: 'Paste the full text of a real Google review here.' }
  ];

  // Location variants via URL, e.g. ?loc=hertfordshire (used by the Herts ad campaign)
  const LOCATIONS = {
    london: { name: 'London', clinics: 'Clinics in Chelsea, Marylebone &amp; St John\'s Wood' },
    hertfordshire: { name: 'Hertfordshire', clinics: 'Clinics in Harpenden &amp; Hatfield, near St Albans, Watford &amp; Stevenage' }
  };

  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];

  /* ---------- location ---------- */
  const locKey = (new URLSearchParams(location.search).get('loc') || '').toLowerCase();
  const loc = LOCATIONS[locKey.startsWith('herts') ? 'hertfordshire' : locKey];
  if (loc) {
    $$('[data-loc="name"]').forEach(el => { el.textContent = loc.name; });
    $$('[data-loc="clinics"]').forEach(el => { el.innerHTML = loc.clinics; });
    $$('[data-loc-input]').forEach(el => { el.value = loc.name; });
    document.title = document.title.replace('London &amp; Hertfordshire', loc.name).replace('London & Hertfordshire', loc.name);
  }

  /* ---------- year ---------- */
  $$('[data-year]').forEach(el => { el.textContent = new Date().getFullYear(); });

  /* ---------- header ---------- */
  const header = $('.site-header');
  const toTop = $('.to-top');
  const onScroll = () => {
    const y = window.scrollY;
    header.classList.toggle('is-stuck', y > 40);
    toTop.classList.toggle('show', y > window.innerHeight * 0.9);
  };
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  const nav = $('#main-nav');
  const toggle = $('.menu-toggle');
  const setMenu = open => {
    nav.classList.toggle('is-open', open);
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    document.body.classList.toggle('menu-open', open);
  };
  toggle.addEventListener('click', () => setMenu(!nav.classList.contains('is-open')));
  $$('a', nav).forEach(a => a.addEventListener('click', () => setMenu(false)));
  document.addEventListener('keydown', e => { if (e.key === 'Escape') setMenu(false); });

  // active menu item
  const navLinks = $$('.main-nav ul a');
  const sections = navLinks.map(a => $(a.getAttribute('href'))).filter(Boolean);
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(entries => {
      entries.forEach(en => {
        if (en.isIntersecting) {
          navLinks.forEach(a => a.classList.toggle('is-active', a.getAttribute('href') === '#' + en.target.id));
        }
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    sections.forEach(s => io.observe(s));
  }

  /* ---------- Google chip ---------- */
  if (GOOGLE_STATS.rating) {
    const chip = $('#google-chip');
    $('.js-rating', chip).textContent = GOOGLE_STATS.rating;
    $('.js-count', chip).textContent = GOOGLE_STATS.count ? `${GOOGLE_STATS.count} Google reviews` : 'on Google';
    chip.hidden = false;
  }

  /* ---------- price ---------- */
  if (PRICE_FROM) {
    $('[data-price-label]').textContent = 'From';
    $('[data-price-amount]').textContent = PRICE_FROM;
  }

  /* ---------- compare sliders ---------- */
  const initCompare = el => {
    const range = $('.compare-range', el);
    const set = v => el.style.setProperty('--pos', v + '%');
    range.addEventListener('input', () => set(range.value));
    // allow click/drag anywhere for pointer users
    let dragging = false;
    const fromEvent = e => {
      const r = el.getBoundingClientRect();
      const v = Math.min(100, Math.max(0, ((e.clientX - r.left) / r.width) * 100));
      range.value = v; set(v);
    };
    el.addEventListener('pointerdown', e => { dragging = true; fromEvent(e); });
    window.addEventListener('pointermove', e => { if (dragging) fromEvent(e); });
    window.addEventListener('pointerup', () => { dragging = false; });
  };
  $$('[data-compare]').forEach(initCompare);

  /* ---------- hero mini before/after ---------- */
  const mini = $('.compare-mini');
  const miniDots = $$('.hero-ba-dots button');
  let miniIndex = 0, miniTimer;
  const showMini = i => {
    miniIndex = i;
    const c = miniDots[i].dataset.case;
    $('.compare-after', mini).src = `assets/img/ba-${c}-after.webp`;
    $('.compare-before img', mini).src = `assets/img/ba-${c}-before.webp`;
    miniDots.forEach((d, j) => d.setAttribute('aria-selected', String(j === i)));
  };
  const sweep = () => {
    if (reduceMotion) return;
    // gentle demo sweep so people see it is interactive
    let t = 0;
    const range = $('.compare-range', mini);
    const step = () => {
      t += 0.02;
      const v = 50 + Math.sin(t * Math.PI) * 28;
      range.value = v; mini.style.setProperty('--pos', v + '%');
      if (t < 2) requestAnimationFrame(step); else { range.value = 50; mini.style.setProperty('--pos', '50%'); }
    };
    requestAnimationFrame(step);
  };
  const autoMini = () => {
    clearInterval(miniTimer);
    if (reduceMotion) return;
    miniTimer = setInterval(() => { showMini((miniIndex + 1) % miniDots.length); sweep(); }, 6000);
  };
  miniDots.forEach((d, i) => d.addEventListener('click', () => { showMini(i); autoMini(); }));
  mini.addEventListener('pointerdown', () => clearInterval(miniTimer));
  setTimeout(sweep, 1800);
  autoMini();

  /* ---------- before/after carousel ---------- */
  const baTrack = $('[data-ba-track]');
  const baCards = $$('.ba-card', baTrack);
  const baDots = $('[data-ba-dots]');
  const prev = $('[data-ba-prev]'), next = $('[data-ba-next]');
  let baIndex = 0;
  const perView = () => (window.innerWidth < 900 ? 1 : 2);
  const maxIndex = () => Math.max(0, baCards.length - perView());
  const renderDots = () => {
    baDots.innerHTML = '';
    const pages = Math.ceil(baCards.length / perView());
    const active = baIndex >= maxIndex() ? pages - 1 : Math.floor(baIndex / perView());
    for (let i = 0; i < pages; i++) {
      const s = document.createElement('span');
      if (i === active) s.className = 'on';
      baDots.appendChild(s);
    }
  };
  const goBa = i => {
    baIndex = Math.max(0, Math.min(maxIndex(), i));
    const gap = parseFloat(getComputedStyle(baTrack).columnGap) || 28;
    const w = baCards[0].getBoundingClientRect().width + gap;
    baTrack.style.transform = `translateX(${-baIndex * w}px)`;
    prev.disabled = baIndex === 0;
    next.disabled = baIndex === maxIndex();
    baCards.forEach((c, j) => {
      const visible = j >= baIndex && j < baIndex + perView();
      c.toggleAttribute('inert', !visible);
      c.setAttribute('aria-hidden', String(!visible));
    });
    renderDots();
  };
  prev.addEventListener('click', () => goBa(baIndex - perView()));
  next.addEventListener('click', () => goBa(baIndex + perView()));
  // swipe on the viewport edges (outside the compare handle)
  let sx = null;
  baTrack.addEventListener('touchstart', e => { if (!e.target.closest('.compare')) sx = e.touches[0].clientX; }, { passive: true });
  baTrack.addEventListener('touchend', e => {
    if (sx === null) return;
    const dx = e.changedTouches[0].clientX - sx; sx = null;
    if (Math.abs(dx) > 40) goBa(baIndex + (dx < 0 ? 1 : -1));
  });
  window.addEventListener('resize', () => goBa(baIndex));
  goBa(0);

  /* ---------- reviews ticker ---------- */
  const tickerTrack = $('[data-ticker-track]');
  const gLogo = $('.g-logo').outerHTML;
  const esc = s => s.replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const card = (r, clone) => `
    <article class="review${r.placeholder ? ' is-placeholder' : ''}"${clone ? ' aria-hidden="true"' : ''}>
      ${gLogo}
      <div class="review-stars" aria-label="5 out of 5 stars">★★★★★</div>
      <p class="review-text">${esc(r.text)}</p>
      <button class="review-more" type="button" hidden${clone ? ' tabindex="-1"' : ''}>Read more</button>
      <div class="review-author">
        <span class="review-avatar" aria-hidden="true">${esc(r.name.charAt(0))}</span>
        <span>${esc(r.name)}<small>${esc(r.meta || 'Google review')}</small></span>
      </div>
    </article>`;
  const realReviews = REVIEWS.filter(r => !r.placeholder);
  if (realReviews.length) $('[data-ticker]').hidden = false;
  tickerTrack.innerHTML = realReviews.map(r => card(r, false)).join('') + realReviews.map(r => card(r, true)).join('');
  tickerTrack.style.setProperty('--ticker-dur', `${Math.max(realReviews.length, 3) * 9}s`);
  const ticker = $('[data-ticker]');
  const setupMore = () => {
    $$('.review', tickerTrack).forEach(rv => {
      const txt = $('.review-text', rv), btn = $('.review-more', rv);
      if (!rv.classList.contains('is-open')) btn.hidden = txt.scrollHeight <= txt.clientHeight + 2;
    });
  };
  tickerTrack.addEventListener('click', e => {
    const btn = e.target.closest('.review-more');
    if (!btn) return;
    const rv = btn.closest('.review');
    const open = rv.classList.toggle('is-open');
    btn.textContent = open ? 'Read less' : 'Read more';
    ticker.classList.toggle('is-paused', !!$('.review.is-open', tickerTrack));
  });
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(setupMore); else setupMore();
  window.addEventListener('resize', setupMore);

  /* ---------- Doctify widget (official script, loads when the section nears view) ---------- */
  const doctify = $('[data-doctify]');
  if (doctify) {
    const loadDoctify = () => {
      const sc = document.createElement('script');
      sc.src = 'https://www.doctify.com/get-script?widget_container_id=0wqq6urx&type=carousel-widget&tenant=athena-uk&language=en&profileType=specialist&layoutType=layoutA&slugs=manaf-khatib&background=white&itemBackground=ffffff&outerFrame=true&itemFrame=true';
      sc.defer = true;
      sc.onerror = () => { $('[data-doctify-fallback]').hidden = false; doctify.hidden = true; };
      document.body.appendChild(sc);
      setTimeout(() => { if (!doctify.children.length) { $('[data-doctify-fallback]').hidden = false; doctify.hidden = true; } }, 8000);
    };
    if ('IntersectionObserver' in window) {
      const dio = new IntersectionObserver(en => { if (en[0].isIntersecting) { dio.disconnect(); loadDoctify(); } }, { rootMargin: '600px' });
      dio.observe(doctify);
    } else loadDoctify();
  }

  /* ---------- video testimonial ---------- */
  $$('[data-video]').forEach(card => {
    const v = $('video', card), btn = $('.video-play', card);
    btn.addEventListener('click', () => {
      v.controls = true; card.classList.add('is-playing');
      const pr = v.play(); if (pr && pr.catch) pr.catch(() => {});
      v.focus();
    });
    v.addEventListener('ended', () => { card.classList.remove('is-playing'); v.controls = false; v.load(); });
  });

  /* ---------- scar tabs ---------- */
  $$('[data-tabs]').forEach(box => {
    const tabs = $$('[role="tab"]', box);
    const select = t => {
      tabs.forEach(x => {
        const on = x === t;
        x.setAttribute('aria-selected', String(on));
        x.tabIndex = on ? 0 : -1;
        const panel = document.getElementById(x.getAttribute('aria-controls'));
        panel.hidden = !on;
        if (on) $$('.scar-svg path:not(.body), .scar-svg circle', panel).forEach(p => { p.style.animation = 'none'; void p.offsetWidth; p.style.animation = ''; });
      });
    };
    tabs.forEach((t, i) => {
      t.addEventListener('click', () => select(t));
      t.addEventListener('keydown', e => {
        const d = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
        if (d) { const n = tabs[(i + d + tabs.length) % tabs.length]; select(n); n.focus(); }
      });
    });
  });

  /* ---------- journey track ---------- */
  const jTrack = $('[data-j-track]'), jBar = $('[data-j-bar]');
  const jStep = () => ($('.step', jTrack).getBoundingClientRect().width + 26);
  const jUpdate = () => {
    const max = jTrack.scrollWidth - jTrack.clientWidth;
    jBar.style.width = (max > 0 ? Math.max(8, (jTrack.scrollLeft / max) * 100) : 100) + '%';
    $('[data-j-prev]').disabled = jTrack.scrollLeft < 4;
    $('[data-j-next]').disabled = jTrack.scrollLeft > max - 4;
  };
  $('[data-j-prev]').addEventListener('click', () => jTrack.scrollBy({ left: -jStep(), behavior: reduceMotion ? 'auto' : 'smooth' }));
  $('[data-j-next]').addEventListener('click', () => jTrack.scrollBy({ left: jStep(), behavior: reduceMotion ? 'auto' : 'smooth' }));
  jTrack.addEventListener('scroll', jUpdate, { passive: true });
  window.addEventListener('resize', jUpdate);
  jUpdate();

  /* ---------- image reveal + parallax ---------- */
  if ('IntersectionObserver' in window && !reduceMotion) {
    const rio = new IntersectionObserver(entries => {
      entries.forEach(en => { if (en.isIntersecting) { en.target.classList.add('in'); rio.unobserve(en.target); } });
    }, { threshold: 0.2 });
    $$('.reveal-img').forEach(el => rio.observe(el));

    const para = $$('.parallax');
    let ticking = false;
    const run = () => {
      const vh = window.innerHeight;
      para.forEach(el => {
        const r = el.getBoundingClientRect();
        if (r.bottom < -100 || r.top > vh + 100) return;
        const offset = (r.top + r.height / 2 - vh / 2) * parseFloat(el.dataset.speed || 0.05);
        el.style.transform = `translate3d(0, ${offset.toFixed(1)}px, 0)`;
      });
      ticking = false;
    };
    window.addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(run); } }, { passive: true });
    run();
  } else {
    $$('.reveal-img').forEach(el => el.classList.add('in'));
  }

  /* ---------- booking form ---------- */
  const form = $('#book-form');
  const msgs = {
    first_name: 'Enter your first name',
    last_name: 'Enter your last name',
    email: 'Enter an email address like name@example.com',
    phone: 'Enter a phone number we can call you on',
    source: 'Choose how you heard about us'
  };
  const validate = input => {
    const field = input.closest('.field');
    let ok = input.checkValidity();
    if (ok && input.name === 'phone') ok = input.value.replace(/\D/g, '').length >= 10;
    field.classList.toggle('has-error', !ok);
    $('.field-error', field).textContent = ok ? '' : msgs[input.name];
    input.setAttribute('aria-invalid', String(!ok));
    return ok;
  };
  $$('input[required], select[required]', form).forEach(i => i.addEventListener('blur', () => { if (i.value) validate(i); }));
  form.addEventListener('submit', async e => {
    e.preventDefault();
    const fields = $$('input[required], select[required]', form);
    const results = fields.map(validate);
    const firstBad = fields[results.indexOf(false)];
    if (firstBad) { firstBad.focus(); return; }
    const btn = $('button[type="submit"]', form);
    btn.disabled = true; btn.textContent = 'Sending…';
    const data = Object.fromEntries(new FormData(form));
    // TODO: connect to the clinic's CRM or email service. Set form action, or POST here:
    // await fetch('https://YOUR-ENDPOINT', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({ event: 'consultation_request', location: data.location });
    $('.form-success', form).hidden = false;
    $('.form-success h3', form).focus?.();
  });
})();
