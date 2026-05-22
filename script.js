// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ GSAP CORE
gsap.registerPlugin(ScrollTrigger);
gsap.config({ nullTargetWarn: false });
ScrollTrigger.config({ ignoreMobileResize: true });

const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const isMobileVP = window.matchMedia('(max-width: 760px)').matches;
const canHover = window.matchMedia('(hover: hover)').matches;

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ INITIAL STATE
const fadeEls = gsap.utils.toArray('[data-animate="fade-up"]');
const staggerEls = gsap.utils.toArray('[data-stagger]');
gsap.set([...fadeEls, ...staggerEls], { opacity: 0, y: 32, force3D: true });

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ HERO INTRO
// Simple, explicit timeline. No FOUC CSS — GSAP owns these elements.
const heroLineSpans = gsap.utils.toArray('.hero__title .line > span');
const heroChrome = gsap.utils.toArray('.hero__eyebrow, .hero__sub, .hero__cta > *, .hero__bottom, .hero__marquee');

gsap.set(heroLineSpans, { yPercent: 110, force3D: true });
gsap.set(heroChrome, { opacity: 0, y: 24, force3D: true });

const heroTL = gsap.timeline({ defaults: { ease: 'power3.out', force3D: true } });
heroTL
  .to('.hero__eyebrow', { y: 0, opacity: 1, duration: 0.7 }, 0.2)
  .to(heroLineSpans, { yPercent: 0, duration: 1.1, stagger: 0.1, ease: 'expo.out' }, 0.4)
  .to('.hero__sub', { y: 0, opacity: 1, duration: 0.7 }, 1.0)
  .to('.hero__cta > *', { y: 0, opacity: 1, duration: 0.6, stagger: 0.08 }, 1.2)
  .to('.hero__bottom', { y: 0, opacity: 1, duration: 0.6 }, 1.5)
  .to('.hero__marquee', { y: 0, opacity: 1, duration: 0.7 }, 1.7);

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ FADE-UP via batch (single observer, perfectly smooth)
ScrollTrigger.batch(fadeEls, {
  start: 'top 88%',
  once: true,
  onEnter: (batch) => {
    gsap.to(batch, {
      opacity: 1,
      y: 0,
      duration: 0.9,
      stagger: 0.06,
      ease: 'power3.out',
      overwrite: 'auto',
    });
  },
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ STAGGER via batch — items within shared parents
const staggerByParent = new Map();
staggerEls.forEach((el) => {
  const p = el.parentElement;
  if (!staggerByParent.has(p)) staggerByParent.set(p, []);
  staggerByParent.get(p).push(el);
});
staggerByParent.forEach((items, parent) => {
  ScrollTrigger.create({
    trigger: parent,
    start: 'top 82%',
    once: true,
    onEnter: () => {
      gsap.to(items, {
        opacity: 1,
        y: 0,
        duration: 0.85,
        stagger: 0.07,
        ease: 'power3.out',
        overwrite: 'auto',
      });
    },
  });
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ PARALLAX — desktop only, smoothed scrub
if (!prefersReduced && !isMobileVP) {
  gsap.utils.toArray('[data-parallax]').forEach((el) => {
    const speed = parseFloat(el.dataset.parallax || 0.2);
    gsap.fromTo(el,
      { yPercent: -speed * 20, force3D: true },
      {
        yPercent: speed * 20,
        ease: 'none',
        scrollTrigger: {
          trigger: el,
          start: 'top bottom',
          end: 'bottom top',
          scrub: 0.8,
          invalidateOnRefresh: true,
        },
      }
    );
  });

  // Hero media subtle scale on scroll
  gsap.fromTo('.hero__media img',
    { scale: 1 },
    {
      scale: 1.1,
      ease: 'none',
      scrollTrigger: {
        trigger: '.hero',
        start: 'top top',
        end: 'bottom top',
        scrub: 0.8,
      },
    }
  );
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ STAT COUNTERS
gsap.utils.toArray('[data-count]').forEach((el) => {
  const target = parseInt(el.dataset.count, 10);
  const suffix = el.textContent.trim().replace(/[\d,]/g, '');
  const obj = { v: 0 };
  ScrollTrigger.create({
    trigger: el,
    start: 'top 85%',
    once: true,
    onEnter: () => {
      gsap.to(obj, {
        v: target,
        duration: 2,
        ease: 'power2.out',
        onUpdate() {
          el.textContent = Math.floor(obj.v).toLocaleString('en-US') + suffix;
        },
      });
    },
  });
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ STAT BARS
gsap.utils.toArray('.stat__bar span').forEach((bar) => {
  gsap.set(bar, { scaleX: 0, transformOrigin: 'right center' });
  ScrollTrigger.create({
    trigger: bar,
    start: 'top 90%',
    once: true,
    onEnter: () => {
      gsap.to(bar, { scaleX: 1, duration: 1.2, ease: 'power3.out' });
    },
  });
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ NAV SCROLL STATE (rAF throttled)
const nav = document.getElementById('nav');
let navTicking = false;
window.addEventListener('scroll', () => {
  if (navTicking) return;
  navTicking = true;
  requestAnimationFrame(() => {
    nav.classList.toggle('is-scrolled', window.scrollY > 40);
    navTicking = false;
  });
}, { passive: true });

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ MAGNETIC BUTTONS — desktop only
if (!prefersReduced && canHover && !isMobileVP) {
  gsap.utils.toArray('[data-magnetic]').forEach((el) => {
    const xTo = gsap.quickTo(el, 'x', { duration: 0.4, ease: 'power3.out' });
    const yTo = gsap.quickTo(el, 'y', { duration: 0.4, ease: 'power3.out' });
    el.addEventListener('mousemove', (e) => {
      const r = el.getBoundingClientRect();
      xTo((e.clientX - r.left - r.width / 2) * 0.2);
      yTo((e.clientY - r.top - r.height / 2) * 0.2);
    });
    el.addEventListener('mouseleave', () => { xTo(0); yTo(0); });
  });
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ MOBILE NAV DRAWER
const navMenuBtn = document.getElementById('navMenu');
const navDrawer = document.getElementById('navDrawer');
const navClose = document.getElementById('navClose');
const navVeil = document.getElementById('navVeil');
const openDrawer = () => {
  navDrawer.classList.add('is-open');
  navDrawer.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
};
const closeDrawer = () => {
  navDrawer.classList.remove('is-open');
  navDrawer.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
};
navMenuBtn?.addEventListener('click', openDrawer);
navClose?.addEventListener('click', closeDrawer);
navVeil?.addEventListener('click', closeDrawer);
navDrawer?.querySelectorAll('.navdrawer__link, .navdrawer__cta a').forEach((a) => {
  a.addEventListener('click', closeDrawer);
});
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && navDrawer?.classList.contains('is-open')) closeDrawer();
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ AMBIENT BLOBS — autonomous drift (no scroll/mouse coupling)
// Disable CSS keyframe animations (they conflict with the JS tweens).
document.querySelectorAll('.ambient__blob').forEach((b) => { b.style.animation = 'none'; });
if (!prefersReduced) {
  gsap.utils.toArray('.ambient__blob').forEach((b, i) => {
    gsap.to(b, {
      x: (i % 2 ? 1 : -1) * 50,
      y: (i % 2 ? -1 : 1) * 40,
      duration: 20 + i * 5,
      ease: 'sine.inOut',
      yoyo: true,
      repeat: -1,
    });
  });
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ REFRESH after fonts/images load — prevents off-by-one triggers
window.addEventListener('load', () => {
  // Wait one frame so layout settles before ScrollTrigger recalculates
  requestAnimationFrame(() => ScrollTrigger.refresh());
});
if (document.fonts && document.fonts.ready) {
  document.fonts.ready.then(() => ScrollTrigger.refresh());
}
