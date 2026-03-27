/* ===================================
   TÉRRI — Main JS
   =================================== */

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

document.addEventListener('DOMContentLoaded', () => {
  initLogoFallbacks();
  initThemeToggle();
  updateLogos(document.documentElement.getAttribute('data-theme'));
  initHeader();
  initMobileNav();
  initRevealAnimations();
  initCountUp();
  initSmoothScroll();
  initContactForm();
});

/* --- Logo Fallbacks --- */
function initLogoFallbacks() {
  document.querySelectorAll('.js-logo-img').forEach(img => {
    img.addEventListener('error', () => {
      img.style.display = 'none';
      img.nextElementSibling.style.display = 'block';
    });
  });
}

/* --- Theme Toggle --- */
function initThemeToggle() {
  const toggle = document.getElementById('themeToggle');
  if (!toggle) return;

  toggle.addEventListener('click', () => {
    const html = document.documentElement;
    const current = html.getAttribute('data-theme');
    const next = current === 'dark' ? 'light' : 'dark';

    html.setAttribute('data-theme', next);
    localStorage.setItem('terri-theme', next);
    updateLogos(next);

    toggle.setAttribute('aria-label',
      next === 'dark' ? 'Ativar tema claro' : 'Ativar tema escuro'
    );
  });
}

/* --- Logo swap per theme --- */
function updateLogos(theme) {
  const src = theme === 'light' ? 'src/logo-preta.png' : 'src/logo.png';
  document.querySelectorAll('.js-logo-img').forEach(img => {
    img.src = src;
  });
}

/* --- Header scroll effect --- */
function initHeader() {
  const header = document.getElementById('header');
  let scrolled = false;

  window.addEventListener('scroll', () => {
    const shouldScroll = window.scrollY > 50;
    if (shouldScroll === scrolled) return;
    scrolled = shouldScroll;
    header.classList.toggle('header--scrolled', scrolled);
  }, { passive: true });
}

/* --- Mobile Navigation --- */
function initMobileNav() {
  const menuBtn = document.getElementById('menuBtn');
  const mobileNav = document.getElementById('mobileNav');
  const links = mobileNav.querySelectorAll('.mobile-nav__link');

  function closeNav() {
    menuBtn.classList.remove('active');
    menuBtn.setAttribute('aria-expanded', 'false');
    mobileNav.classList.remove('active');
    mobileNav.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  menuBtn.addEventListener('click', () => {
    const isOpen = mobileNav.classList.contains('active');
    if (isOpen) {
      closeNav();
    } else {
      menuBtn.classList.add('active');
      menuBtn.setAttribute('aria-expanded', 'true');
      mobileNav.classList.add('active');
      mobileNav.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
    }
  });

  links.forEach(link => link.addEventListener('click', closeNav));

  // Close on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && mobileNav.classList.contains('active')) {
      closeNav();
      menuBtn.focus();
    }
  });
}

/* --- Scroll Reveal Animations --- */
function initRevealAnimations() {
  if (prefersReducedMotion) return;

  const elements = document.querySelectorAll('.reveal-up, .reveal-left, .reveal-right');

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('active');
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: '0px 0px -60px 0px'
  });

  elements.forEach(el => observer.observe(el));
}

/* --- Count Up Animation --- */
function initCountUp() {
  const numbers = document.querySelectorAll('[data-count]');

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const target = parseInt(el.dataset.count, 10);

        if (prefersReducedMotion) {
          el.textContent = target;
        } else {
          animateCount(el, 0, target, 2000);
        }
        observer.unobserve(el);
      }
    });
  }, { threshold: 0.5 });

  numbers.forEach(num => observer.observe(num));
}

function animateCount(el, start, end, duration) {
  const startTime = performance.now();

  function update(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    el.textContent = Math.round(start + (end - start) * eased);

    if (progress < 1) {
      requestAnimationFrame(update);
    }
  }

  requestAnimationFrame(update);
}

/* --- Smooth Scroll --- */
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const href = this.getAttribute('href');
      if (href === '#') return;

      const target = document.querySelector(href);
      if (!target) return;

      e.preventDefault();
      const headerOffset = 80;
      const offsetPosition = target.getBoundingClientRect().top + window.scrollY - headerOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });

      target.setAttribute('tabindex', '-1');
      target.focus({ preventScroll: true });
      target.addEventListener('blur', () => target.removeAttribute('tabindex'), { once: true });
    });
  });
}

/* --- Contact Form --- */

// ============================================================
// CONFIGURAÇÃO — edite aqui para definir como o form funciona
// ============================================================
const FORM_CONFIG = {
  // Número do WhatsApp com código do país (só números, sem +, espaços ou traços)
  // Exemplo: '5511999999999' = Brasil(55) + DDD(11) + número
  whatsappNumber: '5531994230454',
};
// ============================================================

function initContactForm() {
  const form = document.getElementById('contactForm');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    if (!validateForm(form)) return;

    const btn = form.querySelector('button[type="submit"]');
    const originalText = btn.innerHTML;
    const data = getFormData(form);

    btn.disabled = true;
    sendWhatsApp(data);

    btn.innerHTML = 'Redirecionando... &#10003;';
    btn.classList.add('btn--success');

    setTimeout(() => {
      btn.innerHTML = originalText;
      btn.classList.remove('btn--success');
      btn.disabled = false;
      form.reset();
    }, 3000);
  });

  // Clear error on input
  form.querySelectorAll('input, select, textarea').forEach(field => {
    field.addEventListener('input', () => {
      field.closest('.form-group').classList.remove('form-group--error');
    });
  });
}

function getFormData(form) {
  const serviceSelect = form.querySelector('#service');
  return {
    name: form.querySelector('#name').value.trim(),
    email: form.querySelector('#email').value.trim(),
    phone: form.querySelector('#phone').value.trim(),
    service: serviceSelect.selectedIndex > 0 ? serviceSelect.options[serviceSelect.selectedIndex].textContent : '',
    message: form.querySelector('#message').value.trim(),
  };
}

function validateForm(form) {
  let valid = true;
  const requiredFields = form.querySelectorAll('[required]');

  requiredFields.forEach(field => {
    const group = field.closest('.form-group');
    if (!field.value.trim()) {
      group.classList.add('form-group--error');
      valid = false;
    } else {
      group.classList.remove('form-group--error');
    }

    if (field.type === 'email' && field.value.trim()) {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(field.value.trim())) {
        group.classList.add('form-group--error');
        valid = false;
      }
    }
  });

  if (!valid) {
    const firstError = form.querySelector('.form-group--error input, .form-group--error select, .form-group--error textarea');
    if (firstError) firstError.focus();
  }

  return valid;
}

function sendWhatsApp(data) {
  const lines = [
    `*Nova mensagem — Térri Marketing Imobiliário*`,
    ``,
    `*Nome:* ${data.name}`,
    `*E-mail:* ${data.email}`,
  ];

  if (data.phone) lines.push(`*WhatsApp:* ${data.phone}`);
  if (data.service) lines.push(`*Serviço:* ${data.service}`);
  if (data.message) {
    lines.push(``);
    lines.push(`*Mensagem:*`);
    lines.push(data.message);
  }

  const text = encodeURIComponent(lines.join('\n'));
  window.open(`https://wa.me/${FORM_CONFIG.whatsappNumber}?text=${text}`, '_blank');
}

