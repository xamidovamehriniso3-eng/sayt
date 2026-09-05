document.addEventListener('DOMContentLoaded', () => {
  const yearNode = document.getElementById('year');
  if (yearNode) {
    yearNode.textContent = new Date().getFullYear();
  }

  const navToggle = document.querySelector('[data-nav-toggle]');
  const mobileMenu = document.querySelector('[data-mobile-menu]');

  if (navToggle && mobileMenu) {
    navToggle.addEventListener('click', () => {
      const isOpen = !mobileMenu.classList.contains('hidden');
      mobileMenu.classList.toggle('hidden', isOpen);
      navToggle.setAttribute('aria-expanded', String(!isOpen));
    });
  }

  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener('click', (event) => {
      const targetId = link.getAttribute('href');
      if (!targetId || targetId === '#') return;

      const target = document.querySelector(targetId);
      if (!target) return;

      event.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });

      if (mobileMenu && !mobileMenu.classList.contains('hidden')) {
        mobileMenu.classList.add('hidden');
      }
    });
  });

  const animatedBlocks = document.querySelectorAll('.fade-up');

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.12,
      rootMargin: '0px 0px -30px 0px'
    }
  );

  animatedBlocks.forEach((block) => observer.observe(block));

  const telegramStatusNode = document.getElementById('telegramStatus');

  if (telegramStatusNode) {
    fetch('/api/telegram-status')
      .then((response) => response.json())
      .then((result) => {
        const data = result?.data || {};

        if (data.configured) {
          telegramStatusNode.textContent = `Telegram bot: ${data.username ? '@' + data.username : 'u yebga tayyor'}`;
          telegramStatusNode.classList.add('border-emerald-500/30', 'bg-emerald-500/10', 'text-emerald-300');
        } else {
          telegramStatusNode.textContent = 'Telegram bot: config not set';
          telegramStatusNode.classList.add('border-yellow-500/30', 'bg-yellow-500/10', 'text-yellow-300');
        }
      })
      .catch(() => {
        telegramStatusNode.textContent = 'Telegram bot: status unavailable';
        telegramStatusNode.classList.add('border-slate-700', 'bg-slate-900/60', 'text-slate-300');
      });
  }

  const contactForm = document.getElementById('contactForm');
  const formStatus = document.getElementById('formStatus');

  if (contactForm && formStatus) {
    contactForm.addEventListener('submit', async (event) => {
      event.preventDefault();

      const name = document.getElementById('name')?.value.trim();
      const email = document.getElementById('email')?.value.trim();
      const message = document.getElementById('message')?.value.trim();

      if (!name || !email || !message) {
        formStatus.textContent = 'Iltimos, barcha maydonlarni to‘ldiring.';
        formStatus.classList.remove('hidden');
        formStatus.classList.add('border-red-500/30', 'bg-red-500/10', 'text-red-300');
        return;
      }

      try {
        const response = await fetch('/api/contact', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ name, email, message })
        });

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.message || 'Xatolik yuz berdi.');
        }

        formStatus.textContent = result.message;
        formStatus.classList.remove('hidden', 'border-red-500/30', 'bg-red-500/10', 'text-red-300');
        formStatus.classList.add('border-emerald-500/30', 'bg-emerald-500/10', 'text-emerald-300');
        contactForm.reset();
      } catch (error) {
        formStatus.textContent = error.message || 'Xatolik yuz berdi.';
        formStatus.classList.remove('hidden');
        formStatus.classList.add('border-red-500/30', 'bg-red-500/10', 'text-red-300');
      }
    });
  }
});
