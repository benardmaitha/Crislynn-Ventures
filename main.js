// ── NAVBAR: scroll effect ──
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 60);
});

// ── HERO: background zoom on load ──
window.addEventListener('load', () => {
  document.getElementById('hero').classList.add('loaded');
});

// ── SCROLL REVEAL: IntersectionObserver ──
const reveals = document.querySelectorAll('.reveal');
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.1 });
reveals.forEach(el => revealObserver.observe(el));



/* =========================================
   CLICKABLE CARDS
========================================= */

document.querySelectorAll(".exp-card").forEach(card=>{

card.addEventListener("click",()=>{

const link=card.querySelector(".exp-link");

if(!link) return;

const data={
title:link.dataset.title,
image:link.dataset.image,
video:link.dataset.video,
desc:link.dataset.desc
};

localStorage.setItem("selectedExperience",JSON.stringify(data));

window.location.href = link.getAttribute("href");

});

});

// ── MOBILE NAV ──
const navBurger = document.getElementById('navBurger');
const navLinks  = document.querySelector('.nav-links');

if (navBurger && navLinks) {
  let navOpen = false;

  navBurger.addEventListener('click', (e) => {
    e.stopPropagation();
    navOpen = !navOpen;
    navLinks.classList.toggle('nav-open', navOpen);
    navBurger.classList.toggle('burger-open', navOpen);
  });

  // Close nav when a link is clicked
  navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      navOpen = false;
      navLinks.classList.remove('nav-open');
      navBurger.classList.remove('burger-open');
    });
  });

  // Close nav on outside click
  document.addEventListener('click', (e) => {
    if (navOpen && !navBurger.contains(e.target) && !navLinks.contains(e.target)) {
      navOpen = false;
      navLinks.classList.remove('nav-open');
      navBurger.classList.remove('burger-open');
    }
  });
}

// ── FORM: submit handler ──
function handleSubmit(e) {
  e.preventDefault();
  const btn = e.target;
  btn.textContent = "Sent! We'll be in touch ✓";
  btn.style.background = '#4A7A5A';
  btn.disabled = true;
  setTimeout(() => {
    btn.textContent = "Request Services ›";
    btn.style.background = '';
    btn.disabled = false;
  }, 4000);
}

/* ═══════════════════════════════════════════════════════════
   ABOUT SECTION — Script
═══════════════════════════════════════════════════════════ */

(function () {

  /* ── 1. Scroll-reveal: add .about-visible when section enters viewport ── */
  const aboutSection = document.getElementById('about');
  if (!aboutSection) return;

  const sectionObserver = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          aboutSection.classList.add('about-visible');
          sectionObserver.unobserve(aboutSection);
          startCounters();
        }
      });
    },
    { threshold: 0.18 }
  );
  sectionObserver.observe(aboutSection);


  /* ── 2. Story slide rotation ── */
  const slides    = aboutSection.querySelectorAll('.about-slide');
  const dots      = aboutSection.querySelectorAll('.about-dot');
  let   current   = 0;
  let   autoTimer = null;

  function showSlide(idx) {
    slides.forEach(function (s, i) {
      s.classList.toggle('active', i === idx);
    });
    dots.forEach(function (d, i) {
      d.classList.toggle('active', i === idx);
    });
    current = idx;
  }

  function nextSlide() {
    showSlide((current + 1) % slides.length);
  }

  function startAuto() {
    clearInterval(autoTimer);
    autoTimer = setInterval(nextSlide, 4500);
  }

  dots.forEach(function (dot) {
    dot.addEventListener('click', function () {
      var idx = parseInt(dot.getAttribute('data-slide'), 10);
      showSlide(idx);
      startAuto();
    });
  });

  startAuto();


  /* ── 3. Animated counters (ease-out, fire once) ── */
  var countersDone = false;

  function startCounters() {
    if (countersDone) return;
    countersDone = true;

    var counters = aboutSection.querySelectorAll('.counter');
    counters.forEach(function (el) {
      var target   = parseInt(el.getAttribute('data-target'), 10);
      var duration = 1800;
      var start    = null;

      function easeOut(t) {
        return 1 - Math.pow(1 - t, 3);
      }

      function step(timestamp) {
        if (!start) start = timestamp;
        var progress = Math.min((timestamp - start) / duration, 1);
        el.textContent = Math.floor(easeOut(progress) * target);
        if (progress < 1) {
          requestAnimationFrame(step);
        } else {
          el.textContent = target;
        }
      }

      setTimeout(function () {
        requestAnimationFrame(step);
      }, 950);
    });
  }

})();

/* ════════════════════════════════════════════════════
   EXPERIENCES SECTION — Luxury v4 Script
   Smooth scroll: CSS snap does all the snapping.
   JS only reads position after scrollend (or fallback
   timeout) — never fights the browser mid-scroll.
════════════════════════════════════════════════════ */

(function () {

  var CARD_GAP = 18;

  var state = [
    { idx:0, dragging:false, startX:0, scrollStart:0, scrollTimer:null },
    { idx:0, dragging:false, startX:0, scrollStart:0, scrollTimer:null },
    { idx:0, dragging:false, startX:0, scrollStart:0, scrollTimer:null },
  ];

  function getTrack(cat)     { return document.getElementById('track-' + cat); }
  function getCardCount(cat) { var t = getTrack(cat); return t ? t.querySelectorAll('.exp-card').length : 0; }

  /* Measure real rendered card width every time — respects mobile flex-basis */
  function getStep(cat) {
    var t = getTrack(cat); if (!t) return 308;
    var card = t.querySelector('.exp-card');
    if (!card) return 308;
    return card.offsetWidth + CARD_GAP;
  }

  function getVisible(cat) {
    var t = getTrack(cat); if (!t) return 1;
    return Math.max(1, Math.floor(t.clientWidth / getStep(cat)));
  }

  /* ── UI updates ── */
  function updateProgress(cat) {
    var bar = document.getElementById('prog-' + cat); if (!bar) return;
    var max = Math.max(1, getCardCount(cat) - getVisible(cat));
    var pct = max > 0 ? ((state[cat].idx / max) * 75 + 25) : 100;
    bar.style.width = pct + '%';
  }

  function buildDots(cat) {
    var el = document.getElementById('dots-' + cat); if (!el) return;
    el.innerHTML = '';
    for (var i = 0; i < getCardCount(cat); i++) {
      var d = document.createElement('div');
      d.className = 'exp-dot' + (i === 0 ? ' active' : '');
      (function(idx){ d.addEventListener('click', function(){ goTo(cat, idx); }); })(i);
      el.appendChild(d);
    }
  }

  function updateDots(cat) {
    document.querySelectorAll('#dots-' + cat + ' .exp-dot').forEach(function(d,i){
      d.classList.toggle('active', i === state[cat].idx);
    });
  }

  /* ── Core navigation: let CSS smooth-scroll + snap do the work ── */
  function goTo(cat, idx) {
    var max = getCardCount(cat) - 1;
    idx = Math.max(0, Math.min(idx, max));
    state[cat].idx = idx;
    var t    = getTrack(cat);
    var step = getStep(cat);
    /* CSS scroll-behavior:smooth + scroll-snap-type handles the animation.
       We just set the target position. */
    t.scrollTo({ left: idx * step, behavior: 'smooth' });
    updateDots(cat);
    updateProgress(cat);
  }

  window.slide = function(cat, dir){ goTo(cat, state[cat].idx + dir); };

  /* ── Mouse drag (desktop only) ──
     During drag: temporarily disable scroll-snap so the track
     follows the finger freely. Re-enable and snap on release. */
  window.dragStart = function(e, cat){
    if (window.innerWidth <= 600) return;
    var t = getTrack(cat);
    state[cat].dragging    = true;
    state[cat].startX      = e.pageX;
    state[cat].scrollStart = t.scrollLeft;
    /* Disable snap while dragging so it doesn't fight the mouse */
    t.style.scrollSnapType = 'none';
    t.style.scrollBehavior = 'auto';
    t.classList.add('dragging');
  };

  window.dragMove = function(e, cat){
    if (!state[cat].dragging) return;
    e.preventDefault();
    getTrack(cat).scrollLeft = state[cat].scrollStart - (e.pageX - state[cat].startX);
  };

  window.dragEnd = function(cat){
    if (!state[cat].dragging) return;
    state[cat].dragging = false;
    var t    = getTrack(cat);
    var step = getStep(cat);
    var idx  = Math.round(t.scrollLeft / step);
    /* Re-enable snap, then animate to the snapped position */
    t.style.scrollSnapType = '';
    t.style.scrollBehavior = '';
    t.classList.remove('dragging');
    goTo(cat, idx);
  };

  /* ── Touch (mobile): let native scroll-snap handle everything ──
     We don't manually move scrollLeft on touch — the browser's
     momentum scroll + snap is silky on iOS/Android by itself. */
  window.touchStart = function(e, cat){
    /* Just record for potential swipe detection — no scrollLeft overrides */
    state[cat].startX      = e.touches[0].pageX;
    state[cat].scrollStart = getTrack(cat).scrollLeft;
    state[cat].dragging    = true;
  };

  window.touchMove = function(e, cat){
    /* Do nothing — let the browser handle touch scrolling natively.
       Overriding scrollLeft here is what caused the glitch. */
  };

  /* ── Read index after scroll settles ──
     'scrollend' is modern; timeout fallback for older browsers.
     We only READ here — never write scrollLeft — so no fighting. */
  [0,1,2].forEach(function(cat){
    var t = getTrack(cat); if (!t) return;

    function onScrollSettle() {
      var step = getStep(cat);
      var idx  = Math.round(t.scrollLeft / step);
      idx = Math.max(0, Math.min(idx, getCardCount(cat) - 1));
      if (state[cat].idx !== idx) {
        state[cat].idx = idx;
        updateDots(cat);
        updateProgress(cat);
      }
    }

    /* Modern browsers: fires once scroll animation fully ends */
    if ('onscrollend' in t) {
      t.addEventListener('scrollend', onScrollSettle, { passive: true });
    }

    /* Fallback: debounce the scroll event — wait 120ms of silence */
    t.addEventListener('scroll', function(){
      clearTimeout(state[cat].scrollTimer);
      state[cat].scrollTimer = setTimeout(onScrollSettle, 120);
    }, { passive: true });
  });

  /* ── 3D tilt (desktop only) ── */
  window.tiltCard = function(e, card){
    if (window.innerWidth <= 600) return;
    var r  = card.getBoundingClientRect();
    var dx = (e.clientX - (r.left + r.width/2))  / (r.width/2);
    var dy = (e.clientY - (r.top  + r.height/2)) / (r.height/2);
    card.style.transform  = 'perspective(1200px) rotateX('+(-dy*5)+'deg) rotateY('+(dx*5)+'deg) translateZ(8px)';
    card.style.transition = 'box-shadow 0.3s, transform 0.08s ease';
  };
  window.resetTilt = function(card){
    card.style.transform  = 'perspective(1200px) rotateX(0) rotateY(0) translateZ(0)';
    card.style.transition = 'box-shadow 0.5s, transform 0.5s ease';
  };

  /* ── Tab ink + scroll-spy ── */
  var tabs = document.querySelectorAll('.exp-tab');
  var ink  = document.getElementById('expTabInk');

  function moveInk(tab){
    if (!ink || !tab) return;
    ink.style.left  = tab.offsetLeft + 'px';
    ink.style.width = tab.offsetWidth + 'px';
  }

  tabs.forEach(function(tab){
    tab.addEventListener('click', function(){
      tabs.forEach(function(t){ t.classList.remove('active'); });
      tab.classList.add('active'); moveInk(tab);
    });
  });

  requestAnimationFrame(function(){
    var a = document.querySelector('.exp-tab.active');
    if (a) moveInk(a);
  });

  window.expScrollTo = function(idx){
    var cat = document.getElementById('expCat' + idx);
    if (!cat) return;
    window.scrollTo({ top: cat.getBoundingClientRect().top + window.scrollY - 80, behavior: 'smooth' });
    tabs.forEach(function(t,i){ t.classList.toggle('active', i === idx); });
    moveInk(tabs[idx]);
  };

  var catEls = [0,1,2].map(function(i){ return document.getElementById('expCat'+i); });
  window.addEventListener('scroll', function(){
    catEls.forEach(function(el,i){
      if (!el) return;
      var r = el.getBoundingClientRect();
      if (r.top <= 160 && r.bottom > 160){
        tabs.forEach(function(t,ti){ t.classList.toggle('active', ti===i); });
        if (tabs[i]) moveInk(tabs[i]);
      }
    });
  }, { passive:true });

  /* ── Scroll reveal ── */
  var section = document.getElementById('experiences');
  if (section) {
    new IntersectionObserver(function(e,o){ if(e[0].isIntersecting){ section.classList.add('exp-in'); o.disconnect(); }},{ threshold:0.06 }).observe(section);
  }
  document.querySelectorAll('.exp-category').forEach(function(el){
    new IntersectionObserver(function(e,o){ if(e[0].isIntersecting){ el.classList.add('exp-cat-in'); o.disconnect(); }},{ threshold:0.1 }).observe(el);
  });

  /* ── Init ── */
  [0,1,2].forEach(function(cat){ buildDots(cat); updateProgress(cat); });

})();

/* ════════════════════════════════════════════════════
   CONTACT SECTION — Script
════════════════════════════════════════════════════ */

(function () {

  var section = document.getElementById('contact');
  if (!section) return;

  /* ── Scroll reveal ── */
  new IntersectionObserver(function (entries, obs) {
    if (entries[0].isIntersecting) {
      section.classList.add('ct-in');
      obs.disconnect();
    }
  }, { threshold: 0.1 }).observe(section);


  /* ── Experience tile selection ── */
  var tiles   = section.querySelectorAll('.ct-tile');
  var expHid  = document.getElementById('ctExp');

  tiles.forEach(function (tile) {
    tile.addEventListener('click', function () {
      tiles.forEach(function (t) { t.classList.remove('ct-sel'); });
      tile.classList.add('ct-sel');
      if (expHid) expHid.value = tile.getAttribute('data-value');
      var wrap = document.getElementById('ctTiles');
      if (wrap) wrap.classList.remove('ct-err');
    });
  });


  /* ── Guest counter ── */
  var gCount = 2;

  window.ctAdjGuests = function (d) {
    gCount = Math.max(1, Math.min(50, gCount + d));
    var valEl = document.getElementById('ctGuestVal');
    var hidEl = document.getElementById('ctGuestsH');
    if (valEl) {
      valEl.textContent = gCount;
      valEl.classList.add('ct-bump');
      setTimeout(function () { valEl.classList.remove('ct-bump'); }, 200);
    }
    if (hidEl) hidEl.value = gCount + (gCount === 1 ? ' guest' : ' guests');
  };


  /* ── Step navigation ── */
  function setStep(n) {
    var p1   = document.getElementById('ctPanel1');
    var p2   = document.getElementById('ctPanel2');
    var fill = document.getElementById('ctFill');
    var lbl  = document.getElementById('ctStepLbl');

    if (n === 1) {
      if (p2) p2.classList.add('ct-step-panel--hidden');
      if (p1) { p1.classList.remove('ct-step-panel--hidden'); p1.style.animation = 'none'; p1.offsetHeight; p1.style.animation = ''; }
      if (fill) fill.style.width = '50%';
      if (lbl)  lbl.textContent  = '01 / 02';
    } else {
      if (p1) p1.classList.add('ct-step-panel--hidden');
      if (p2) { p2.classList.remove('ct-step-panel--hidden'); p2.style.animation = 'none'; p2.offsetHeight; p2.style.animation = ''; }
      if (fill) fill.style.width = '100%';
      if (lbl)  lbl.textContent  = '02 / 02';
      var card = section.querySelector('.ct-form-card');
      if (card && window.innerWidth < 960) {
        card.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  }

  window.ctNext = function () {
    var nameEl  = document.getElementById('ctName');
    var emailEl = document.getElementById('ctEmail');
    var expEl   = document.getElementById('ctExp');
    var valid   = true;

    if (!nameEl || !nameEl.value.trim()) {
      markErr(nameEl); valid = false;
    } else { clearErr(nameEl); }

    if (!emailEl || !emailEl.value.trim() || !/\S+@\S+\.\S+/.test(emailEl.value)) {
      markErr(emailEl); valid = false;
    } else { clearErr(emailEl); }

    if (!expEl || !expEl.value) {
      var wrap = document.getElementById('ctTiles');
      if (wrap) { wrap.classList.add('ct-err'); wrap.style.animation = 'none'; wrap.offsetHeight; wrap.style.animation = ''; }
      valid = false;
    }

    if (valid) setStep(2);
  };

  window.ctBack = function () { setStep(1); };

  function markErr(input) {
    if (!input) return;
    var field = input.closest('.ct-field');
    if (field) {
      field.classList.add('ct-err');
      field.style.animation = 'none';
      field.offsetHeight;
      field.style.animation = '';
    }
    input.addEventListener('input', function () { clearErr(input); }, { once: true });
  }

  function clearErr(input) {
    if (!input) return;
    var field = input.closest('.ct-field');
    if (field) field.classList.remove('ct-err');
  }


  /* ── Form submission ── */
  var form = document.getElementById('ctForm');
  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();

      var msgEl = document.getElementById('ctMsg');
      if (!msgEl || !msgEl.value.trim()) {
        markErr(msgEl); return;
      }

      var btn   = document.getElementById('ctSubBtn');
      var label = document.getElementById('ctSubLbl');
      if (btn)   btn.classList.add('ct-loading');
      if (label) label.textContent = 'Sending…';

      fetch(form.action, {
        method: 'POST',
        body: new FormData(form),
        headers: { 'Accept': 'application/json' }
      })
      .then(function () {
        showSuccess();
      })
      .catch(function () {
        form.submit();
      });
    });
  }


  /* ── Success screen ── */
  function showSuccess() {
    var formEl = document.getElementById('ctForm');
    var sucEl  = document.getElementById('ctSuccess');
    var fill   = document.getElementById('ctFill');
    var lbl    = document.getElementById('ctStepLbl');
    if (formEl) formEl.style.display = 'none';
    if (sucEl)  sucEl.classList.add('ct-show');
    if (fill)   fill.style.width = '100%';
    if (lbl)    lbl.textContent  = 'Complete';
  }

  window.ctReset = function () {
    var formEl = document.getElementById('ctForm');
    var sucEl  = document.getElementById('ctSuccess');
    if (formEl) { formEl.reset(); formEl.style.display = ''; }
    if (sucEl)  sucEl.classList.remove('ct-show');

    tiles.forEach(function (t) { t.classList.remove('ct-sel'); });
    if (expHid) expHid.value = '';

    gCount = 2;
    ctAdjGuests(0);

    setStep(1);
  };

})();

/* ════════════════════════════════════════════════
   FOOTER — Scroll reveal
════════════════════════════════════════════════ */

(function () {
  var footer = document.getElementById('footer');
  if (!footer) return;

  new IntersectionObserver(function (entries, obs) {
    if (entries[0].isIntersecting) {
      footer.classList.add('ft-in');
      obs.disconnect();
    }
  }, { threshold: 0.08 }).observe(footer);
})();

/* ════════════════════════════════════════════
   SERVICES SECTION — Scroll reveal
════════════════════════════════════════════ */

(function () {
  var section = document.getElementById('services');
  if (!section) return;

  new IntersectionObserver(function (entries, obs) {
    if (entries[0].isIntersecting) {
      section.classList.add('sv-in');
      obs.disconnect();
    }
  }, { threshold: 0.12 }).observe(section);
})();