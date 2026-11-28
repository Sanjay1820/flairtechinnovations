/* ==========================================================================
   FLAIRTECH INNOVATIONS — Interactive Behavior & UI Logic
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  // 1. Sticky navbar shadow on scroll
  const navbar = document.querySelector('.ft-navbar');
  if (navbar) {
    const onScroll = () => {
      navbar.classList.toggle('scrolled', window.scrollY > 24);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  // 2. Smooth Bottom-to-Top Staggered Scroll Reveal across all pages
  const heroAnimateSelectors = [
    '.ft-split-hero-left > *',
    '.ft-page-banner .container > *'
  ];
  heroAnimateSelectors.forEach((sel) => {
    document.querySelectorAll(sel).forEach((el, idx) => {
      el.classList.add('ft-reveal-up');
      el.style.setProperty('--ft-reveal-delay', `${idx * 95}ms`);
    });
  });

  // Automatically attach bottom-to-top reveal & stagger to section content, cards, lists, and footer
  const sectionTargets = document.querySelectorAll(
    'section .brand-kicker, section h2, section h3, section .col-lg-5 > p, section .col-lg-6 > p, section .col-lg-7 > p, section .col-lg-8 > p, section .text-center > p, section .ft-card, section .ft-service-card, section .ft-quote-card, section .ft-circle-card, section .ft-trust-col, section .ft-form-card, section .ft-cta-banner, section .ft-network-panel, section .accordion-item, section .ft-check-list li, footer .row > div'
  );
  sectionTargets.forEach((el) => {
    if (!el.classList.contains('reveal') && !el.classList.contains('ft-reveal-up')) {
      el.classList.add('ft-reveal-up');
    }
  });

  // Stagger sibling items inside rows, lists, and grids cleanly
  document.querySelectorAll('.row, .ft-check-list, .accordion').forEach((group) => {
    const children = Array.from(group.children);
    let step = 0;
    children.forEach((child) => {
      const target = child.matches('.reveal, .ft-reveal-up')
        ? child
        : child.querySelector('.reveal, .ft-reveal-up');
      if (target) {
        target.style.setProperty('--ft-reveal-delay', `${Math.min(step, 5) * 85}ms`);
        step += 1;
      }
    });
  });

  const revealEls = document.querySelectorAll('.reveal, .ft-reveal-up');
  if ('IntersectionObserver' in window && revealEls.length) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.08, rootMargin: '0px 0px -36px 0px' }
    );

    revealEls.forEach((el) => {
      const rect = el.getBoundingClientRect();
      if (rect.top < window.innerHeight * 0.92) {
        requestAnimationFrame(() => el.classList.add('visible'));
      } else {
        observer.observe(el);
      }
    });
  } else {
    revealEls.forEach((el) => el.classList.add('visible'));
  }

  // 3. Animated metric counters
  const counters = document.querySelectorAll('[data-counter]');
  if (counters.length && 'IntersectionObserver' in window) {
    const cObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const el = entry.target;
          const target = parseInt(el.dataset.counter, 10);
          const suffix = el.dataset.suffix || '';
          const duration = 1200;
          const start = performance.now();

          const step = (now) => {
            const progress = Math.min((now - start) / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            el.textContent = Math.round(eased * target) + suffix;
            if (progress < 1) requestAnimationFrame(step);
          };
          requestAnimationFrame(step);
          cObserver.unobserve(el);
        });
      },
      { threshold: 0.4 }
    );
    counters.forEach((c) => cObserver.observe(c));
  }

  // 4. Terminal Hub Interactive Filter & Detail Panel
  const hubFilterBtns = document.querySelectorAll('[data-hub-filter]');
  const hubItems = document.querySelectorAll('[data-hub-region]');
  const hubDetailTitle = document.getElementById('hubDetailTitle');
  const hubDetailRegion = document.getElementById('hubDetailRegion');
  const hubDetailDesc = document.getElementById('hubDetailDesc');
  const hubDetailServices = document.getElementById('hubDetailServices');

  if (hubFilterBtns.length && hubItems.length) {
    hubFilterBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        hubFilterBtns.forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
        const filter = btn.dataset.hubFilter;
        hubItems.forEach((item) => {
          const match = filter === 'all' || item.dataset.hubRegion === filter;
          item.classList.toggle('d-none', !match);
        });
      });
    });

    hubItems.forEach((item) => {
      item.addEventListener('click', () => {
        hubItems.forEach((h) => h.classList.remove('active'));
        const pill = item.querySelector('.ft-hub-pill');
        document.querySelectorAll('.ft-hub-pill').forEach((p) => p.classList.remove('active'));
        if (pill) pill.classList.add('active');
        item.classList.add('active');
        if (hubDetailTitle && item.dataset.hubName) {
          hubDetailTitle.textContent = item.dataset.hubName;
          hubDetailRegion.textContent = item.dataset.hubBadge || 'Active Terminal';
          hubDetailDesc.textContent = item.dataset.hubDesc || '';
          if (hubDetailServices) {
            hubDetailServices.textContent = item.dataset.hubServices || 'FTL • LTL • Cross-Border';
          }
        }
      });
    });
  }

  // 5. Service Quick-Filter on Services Page
  const serviceTabs = document.querySelectorAll('[data-service-tab]');
  const serviceSections = document.querySelectorAll('[data-service-panel]');
  if (serviceTabs.length && serviceSections.length) {
    serviceTabs.forEach((tab) => {
      tab.addEventListener('click', () => {
        serviceTabs.forEach((t) => t.classList.remove('active'));
        tab.classList.add('active');
        const target = tab.dataset.serviceTab;
        serviceSections.forEach((sec) => {
          const show = target === 'all' || sec.dataset.servicePanel === target;
          sec.classList.toggle('d-none', !show);
        });
      });
    });
  }

  // 6. Quote Modal Pre-fill from Service Cards
  const quoteModalEl = document.getElementById('quoteModal');
  if (quoteModalEl) {
    quoteModalEl.addEventListener('show.bs.modal', (event) => {
      const trigger = event.relatedTarget;
      const serviceSelect = quoteModalEl.querySelector('#modalServiceType');
      if (trigger && trigger.dataset.service && serviceSelect) {
        serviceSelect.value = trigger.dataset.service;
      }
    });
  }

  // 7. Interactive Form Handling -> Sends directly to info@flairtechinnovations.com via FormSubmit AJAX
  const TARGET_EMAIL = 'info@flairtechinnovations.com';
  const FORMSUBMIT_ENDPOINT = `https://formsubmit.co/ajax/${TARGET_EMAIL}`;

  const handleQuoteForm = (form, feedbackEl) => {
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalBtnHtml = submitBtn ? submitBtn.innerHTML : '';

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (!form.checkValidity()) {
        form.classList.add('was-validated');
        return;
      }

      const refId = 'FTI-' + Math.floor(100000 + Math.random() * 900000);
      const formData = new FormData(form);
      const payload = {
        reference_id: refId,
        _subject: `${form.dataset.subject || 'New Website Inquiry'} [${refId}] — Flairtech Innovations`,
        _template: 'table',
        _captcha: 'false'
      };

      formData.forEach((value, key) => {
        if (value !== '') {
          payload[key] = value;
        }
      });

      if (payload.email) {
        payload._replyto = payload.email;
      }

      const urlSvc = new URLSearchParams(window.location.search).get('service');
      if (urlSvc && !payload.service) {
        payload.requested_service = urlSvc;
      }

      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>Sending Inquiry...';
      }

      const errBox = form.querySelector('.ft-form-error');
      if (errBox) errBox.classList.add('d-none');

      try {
        const response = await fetch(FORMSUBMIT_ENDPOINT, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify(payload)
        });

        const result = await response.json().catch(() => ({}));
        if (!response.ok || result.success === 'false') {
          throw new Error(result.message || 'Unable to send right now.');
        }

        form.reset();
        form.classList.remove('was-validated');
        form.classList.add('d-none');

        if (feedbackEl) {
          feedbackEl.classList.remove('d-none');
          const refSpan = feedbackEl.querySelector('.ref-code');
          if (refSpan) refSpan.textContent = refId;
          const sentEmailSpan = feedbackEl.querySelector('.sent-to-email');
          if (sentEmailSpan) sentEmailSpan.textContent = TARGET_EMAIL;
          feedbackEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
      } catch (err) {
        if (errBox) {
          const mailSubject = encodeURIComponent(`${payload._subject}`);
          const lines = Object.entries(payload)
            .filter(([k]) => !k.startsWith('_'))
            .map(([k, v]) => `${k.replace(/_/g, ' ')}: ${v}`)
            .join('\n');
          const mailBody = encodeURIComponent(lines);
          const mailLink = errBox.querySelector('.ft-mailto-fallback');
          if (mailLink) mailLink.href = `mailto:${TARGET_EMAIL}?subject=${mailSubject}&body=${mailBody}`;
          errBox.classList.remove('d-none');
        }
      } finally {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.innerHTML = originalBtnHtml;
        }
      }
    });

    // Reset button inside Thank You card
    if (feedbackEl) {
      const resetBtn = feedbackEl.querySelector('.ft-reset-form-btn');
      if (resetBtn) {
        resetBtn.addEventListener('click', () => {
          feedbackEl.classList.add('d-none');
          form.classList.remove('d-none');
        });
      }
    }
  };

  document.querySelectorAll('.ft-interactive-form').forEach((form) => {
    const targetId = form.dataset.feedback;
    const feedbackEl = targetId ? document.getElementById(targetId) : form.nextElementSibling;
    handleQuoteForm(form, feedbackEl);
  });

  // 8. Hero Instant Freight Lane Estimator
  const laneForm = document.getElementById('heroLaneEstimator');
  const laneResult = document.getElementById('laneEstimatorResult');
  if (laneForm && laneResult) {
    laneForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const mode = laneForm.querySelector('#estMode').value;
      const origin = laneForm.querySelector('#estOrigin').value;
      const dest = laneForm.querySelector('#estDest').value;

      const transitMap = {
        'FTL': 'Direct Dedicated Transit • 1–4 Business Days (Coast-to-Coast)',
        'LTL': 'Scheduled Hub Consolidation • 2–5 Business Days w/ Real-Time Track & Trace',
        'Expedited': 'Priority Team Drivers / Same-Day Dispatch • Immediate Departure',
        'Warehousing': 'Immediate Pallet / Cross-Docking Intake at BC & Ontario Facilities'
      };

      laneResult.innerHTML = `
        <div class="d-flex align-items-start gap-2">
          <i class="bi bi-check-circle-fill text-success fs-5 mt-1"></i>
          <div>
            <div class="fw-bold text-forest">${mode}: ${origin} → ${dest}</div>
            <div class="small text-muted-brand">${transitMap[mode] || 'Custom Logistics Corridor Available'}</div>
            <button type="button" class="btn btn-sm btn-ft-primary mt-2" data-bs-toggle="modal" data-bs-target="#quoteModal" data-service="${mode}">
              Lock In Rate Quote <i class="bi bi-arrow-right"></i>
            </button>
          </div>
        </div>
      `;
      laneResult.classList.remove('d-none');
    });
  }

  // 9. Pre-select service radio chip on Contact page from URL query param (?service=...)
  const params = new URLSearchParams(window.location.search);
  const serviceParam = params.get('service');
  if (serviceParam) {
    const needle = serviceParam.trim().toLowerCase();
    const radios = Array.from(document.querySelectorAll('input[name="need"]'));
    const matchRadio = radios.find((r) => r.value.toLowerCase().includes(needle));
    if (matchRadio) matchRadio.checked = true;
  }

  // 10. Hero Auto-Slide Carousel Sync (updates headline kicker/title/badge smoothly)
  const heroCarousel = document.getElementById('heroBannerCarousel');
  if (heroCarousel) {
    const slideBadge = document.getElementById('heroSlideBadge');
    const slideTitle = document.getElementById('heroSlideTitle');
    const slideDesc = document.getElementById('heroSlideDesc');
    const slideCounter = document.getElementById('heroSlideCounter');

    heroCarousel.addEventListener('slide.bs.carousel', (e) => {
      const nextItem = e.relatedTarget;
      if (!nextItem) return;
      if (slideBadge && nextItem.dataset.badge) slideBadge.textContent = nextItem.dataset.badge;
      if (slideTitle && nextItem.dataset.title) slideTitle.textContent = nextItem.dataset.title;
      if (slideDesc && nextItem.dataset.desc) slideDesc.textContent = nextItem.dataset.desc;
      if (slideCounter) slideCounter.textContent = `0${e.to + 1} / 04`;
    });
  }

  // 11. Floating Speed-Dial Contact Widget (WhatsApp, Call, Email) across all pages
  const initFloatingContactFab = () => {
    if (document.getElementById('ftFabWrapper')) return;
    const waText = encodeURIComponent('Hello Flairtech Innovations, I would like to request a quote / inquiry.');
    const wrapper = document.createElement('div');
    wrapper.id = 'ftFabWrapper';
    wrapper.className = 'ft-fab-wrapper';
    wrapper.innerHTML = `
      <div class="ft-fab-menu" role="menu" aria-label="Quick Contact Options">
        <a href="mailto:info@flairtechinnovations.com?subject=Freight%20Inquiry%20-%20Flairtech%20Innovations" class="ft-fab-item" role="menuitem">
          <span class="ft-fab-label">Email Dispatch</span>
          <span class="ft-fab-icon email"><i class="bi bi-envelope-fill"></i></span>
        </a>
        <a href="tel:+12267570705" class="ft-fab-item" role="menuitem">
          <span class="ft-fab-label">Call +1 226 757 0705</span>
          <span class="ft-fab-icon call"><i class="bi bi-telephone-fill"></i></span>
        </a>
        <a href="https://wa.me/12267570705?text=${waText}" target="_blank" rel="noopener" class="ft-fab-item" role="menuitem">
          <span class="ft-fab-label">WhatsApp Chat</span>
          <span class="ft-fab-icon whatsapp"><i class="bi bi-whatsapp"></i></span>
        </a>
      </div>
      <button type="button" id="ftFabTrigger" class="ft-fab-trigger" aria-expanded="false" aria-label="Open WhatsApp and Call Quick Connect">
        <i class="bi bi-chat-dots-fill fab-icon-open"></i>
        <span class="fab-trigger-text">Quick Connect</span>
        <i class="bi bi-x-lg fab-icon-close"></i>
      </button>
    `;
    document.body.appendChild(wrapper);

    const trigger = document.getElementById('ftFabTrigger');
    const toggleFab = (forceState) => {
      const next = typeof forceState === 'boolean' ? forceState : !wrapper.classList.contains('open');
      wrapper.classList.toggle('open', next);
      trigger.setAttribute('aria-expanded', String(next));
    };

    trigger.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleFab();
    });

    document.addEventListener('click', (e) => {
      if (wrapper.classList.contains('open') && !wrapper.contains(e.target)) {
        toggleFab(false);
      }
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && wrapper.classList.contains('open')) {
        toggleFab(false);
      }
    });
  };
  initFloatingContactFab();

  // 12. Floating Back-to-Top Button with Live Scroll Progress Ring across all pages
  const initBackToTop = () => {
    if (document.getElementById('ftBackToTop')) return;
    const btn = document.createElement('button');
    btn.id = 'ftBackToTop';
    btn.type = 'button';
    btn.className = 'ft-back-to-top';
    btn.setAttribute('aria-label', 'Back to top');
    btn.title = 'Back to Top';

    const radius = 23;
    const circumference = 2 * Math.PI * radius;
    btn.innerHTML = `
      <svg class="progress-ring" viewBox="0 0 52 52" aria-hidden="true">
        <circle class="ring-track" cx="26" cy="26" r="${radius}"></circle>
        <circle class="ring-fill" cx="26" cy="26" r="${radius}" stroke-dasharray="${circumference}" stroke-dashoffset="${circumference}"></circle>
      </svg>
      <i class="bi bi-arrow-up"></i>
    `;
    document.body.appendChild(btn);

    const ringFill = btn.querySelector('.ring-fill');
    const updateScrollProgress = () => {
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = docHeight > 0 ? Math.min(scrollTop / docHeight, 1) : 0;
      if (ringFill) {
        ringFill.style.strokeDashoffset = circumference * (1 - progress);
      }
      btn.classList.toggle('show', scrollTop > 280);
    };

    window.addEventListener('scroll', updateScrollProgress, { passive: true });
    updateScrollProgress();

    btn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  };
  initBackToTop();

  // 13. Auto-Sliding Stacked Testimonial Deck (front card cycles behind, next rises forward)
  const initTestimonialDeck = () => {
    const deck = document.getElementById('testimonialDeck');
    if (!deck) return;

    const cards = Array.from(deck.querySelectorAll('.ft-deck-card'));
    const dots = Array.from(document.querySelectorAll('.ft-deck-dot'));
    const counter = document.getElementById('deckCounter');
    const prevBtn = document.getElementById('deckPrevBtn');
    const nextBtn = document.getElementById('deckNextBtn');
    const total = cards.length;
    if (total < 2) return;

    let activeIdx = 0;
    let timer = null;
    let isAnimating = false;

    const applyDeckPositions = (leavingIdx = -1) => {
      cards.forEach((card, i) => {
        card.classList.remove('is-front', 'is-next', 'is-third', 'is-back', 'is-leaving');
        if (i === leavingIdx) {
          card.classList.add('is-leaving');
          return;
        }
        const offset = (i - activeIdx + total) % total;
        if (offset === 0) card.classList.add('is-front');
        else if (offset === 1) card.classList.add('is-next');
        else if (offset === 2) card.classList.add('is-third');
        else card.classList.add('is-back');
      });

      dots.forEach((d, idx) => d.classList.toggle('active', idx === activeIdx));
      if (counter) counter.textContent = `0${activeIdx + 1} / 0${total}`;
    };

    const goTo = (nextIdx) => {
      if (isAnimating) return;
      const target = (nextIdx + total) % total;
      if (target === activeIdx) return;

      isAnimating = true;
      const prevIdx = activeIdx;
      activeIdx = target;
      applyDeckPositions(prevIdx);

      setTimeout(() => {
        applyDeckPositions(-1);
        isAnimating = false;
      }, 480);
    };

    const startAuto = () => {
      stopAuto();
      timer = setInterval(() => goTo(activeIdx + 1), 4200);
    };
    const stopAuto = () => {
      if (timer) clearInterval(timer);
      timer = null;
    };

    if (nextBtn) nextBtn.addEventListener('click', () => { goTo(activeIdx + 1); startAuto(); });
    if (prevBtn) prevBtn.addEventListener('click', () => { goTo(activeIdx - 1); startAuto(); });
    dots.forEach((d) => d.addEventListener('click', () => {
      goTo(parseInt(d.dataset.deckIndex, 10));
      startAuto();
    }));
    cards.forEach((c) => c.addEventListener('click', () => {
      if (c.classList.contains('is-front')) {
        goTo(activeIdx + 1);
        startAuto();
      }
    }));

    deck.addEventListener('mouseenter', stopAuto);
    deck.addEventListener('mouseleave', startAuto);

    applyDeckPositions(-1);
    startAuto();
  };
  initTestimonialDeck();

  // 14. Contact Page Interactive Google Map Hub Switcher
  const initContactMapSwitcher = () => {
    const mapFrame = document.getElementById('contactLocationMap');
    const mapBtns = document.querySelectorAll('[data-map-query]');
    if (!mapFrame || !mapBtns.length) return;

    const labelEl = document.getElementById('mapActiveLabel');
    const addrEl = document.getElementById('mapActiveAddr');
    const externalLink = document.getElementById('mapOpenExternal');

    mapBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        mapBtns.forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
        const q = btn.dataset.mapQuery;
        mapFrame.src = `https://maps.google.com/maps?q=${q}&t=&z=14&ie=UTF8&iwloc=&output=embed`;
        if (labelEl && btn.dataset.mapLabel) labelEl.textContent = btn.dataset.mapLabel;
        if (addrEl && btn.dataset.mapAddr) addrEl.textContent = btn.dataset.mapAddr;
        if (externalLink) externalLink.href = `https://maps.google.com/?q=${q}`;
      });
    });
  };
  initContactMapSwitcher();

  // 15. Footer Quick Links "Our Services" Dropdown Toggle across all pages
  document.querySelectorAll('.ft-footer-dropdown-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      const submenu = btn.nextElementSibling;
      if (!submenu) return;
      const isOpen = btn.getAttribute('aria-expanded') === 'true';
      btn.setAttribute('aria-expanded', String(!isOpen));
      submenu.classList.toggle('show', !isOpen);
    });
  });

  // 16. Navbar "Our Services": on desktop (>= 992px), hover opens dropdown and direct click opens services.html; on mobile, tap toggles dropdown
  document.querySelectorAll('.ft-navbar .nav-item.dropdown > a.dropdown-toggle').forEach((link) => {
    link.addEventListener('click', (e) => {
      if (window.innerWidth >= 992) {
        e.preventDefault();
        window.location.href = link.getAttribute('href');
      }
    });
  });
});
