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

  // --- Dynamic GitHub repos rendering ---
  async function fetchAndRenderRepos(username = 'xamidovamehriniso3-eng', totalLimit = 8, featuredCount = 4) {
    const featuredGrid = document.getElementById('featuredGrid');
    const grid = document.getElementById('projectsGrid');
    if (!grid) return;

    // show loading placeholder
    const loading = document.createElement('div');
    loading.className = 'col-span-full text-center text-slate-400';
    loading.textContent = 'Loyihalar yuklanmoqda...';
    if (featuredGrid) featuredGrid.innerHTML = '';
    grid.innerHTML = '';
    grid.appendChild(loading);

    try {
      const res = await fetch(`https://api.github.com/users/${username}/repos?per_page=100`);
      if (!res.ok) throw new Error('GitHub API error');
      const repos = await res.json();

      // sort by stars then updated
      repos.sort((a, b) => (b.stargazers_count || 0) - (a.stargazers_count || 0) || new Date(b.updated_at) - new Date(a.updated_at));

      const featured = repos.slice(0, featuredCount);
      const others = repos.slice(featuredCount, featuredCount + Math.max(0, totalLimit - featuredCount));

      if (featuredGrid) featuredGrid.innerHTML = '';
      grid.innerHTML = '';

      // Render featured (larger cards)
      featured.forEach((r) => {
        if (!featuredGrid) return;
        const article = document.createElement('article');
        article.className = 'fade-up group rounded-3xl border border-slate-800 bg-slate-900/80 p-8 transition hover:-translate-y-1 hover:border-brand-400/50 hover:shadow-2xl hover:shadow-brand-500/20';

        const header = document.createElement('div');
        header.className = 'flex items-start justify-between';

        const left = document.createElement('div');
        const title = document.createElement('h3');
        title.className = 'text-2xl font-bold text-white';
        title.textContent = r.name;
        const desc = document.createElement('p');
        desc.className = 'mt-3 text-sm leading-6 text-slate-300';
        desc.textContent = r.description || 'Koʻproq maʼlumot README yoki repo ichida mavjud.';

        left.appendChild(title);
        left.appendChild(desc);

        const meta = document.createElement('div');
        meta.className = 'text-right';
        const stars = document.createElement('div');
        stars.className = 'text-sm font-semibold text-amber-300';
        stars.textContent = `★ ${r.stargazers_count || 0}`;
        meta.appendChild(stars);

        header.appendChild(left);
        header.appendChild(meta);

        const tags = document.createElement('div');
        tags.className = 'mt-5 flex flex-wrap gap-2';
        if (r.language) {
          const lang = document.createElement('span');
          lang.className = 'rounded-full border border-slate-700 px-2.5 py-1 text-xs text-slate-200';
          lang.textContent = r.language;
          tags.appendChild(lang);
        }

        const links = document.createElement('div');
        links.className = 'mt-6 flex gap-3';
        const gh = document.createElement('a');
        gh.href = r.html_url;
        gh.target = '_blank';
        gh.rel = 'noreferrer';
        gh.className = 'text-sm font-semibold text-brand-300 hover:text-brand-200';
        gh.textContent = 'GitHub kodi';
        links.appendChild(gh);

        if (r.homepage) {
          const live = document.createElement('a');
          live.href = r.homepage;
          live.target = '_blank';
          live.rel = 'noreferrer';
          live.className = 'text-sm font-semibold text-slate-200 hover:text-white';
          live.textContent = 'Live Demo';
          links.appendChild(live);
        }

        article.appendChild(header);
        article.appendChild(tags);
        article.appendChild(links);

        featuredGrid.appendChild(article);
      });

      // Render remaining projects
      others.forEach((r) => {
        const article = document.createElement('article');
        article.className = 'fade-up group rounded-3xl border border-slate-800 bg-slate-900/70 p-6 transition hover:-translate-y-1 hover:border-brand-400/50 hover:shadow-xl hover:shadow-brand-500/10';

        const icon = document.createElement('div');
        icon.className = 'mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-brand-500/10 text-xl text-brand-300';
        icon.textContent = '📁';

        const title = document.createElement('h3');
        title.className = 'text-xl font-semibold text-white';
        title.textContent = r.name;

        const desc = document.createElement('p');
        desc.className = 'mt-3 text-sm leading-6 text-slate-300';
        desc.textContent = r.description || 'Koʻproq maʼlumot README yoki repo ichida mavjud.';

        const tags = document.createElement('div');
        tags.className = 'mt-5 flex flex-wrap gap-2';
        if (r.language) {
          const lang = document.createElement('span');
          lang.className = 'rounded-full border border-slate-700 px-2.5 py-1 text-xs text-slate-200';
          lang.textContent = r.language;
          tags.appendChild(lang);
        }
        const stars = document.createElement('span');
        stars.className = 'rounded-full border border-slate-700 px-2.5 py-1 text-xs text-slate-200';
        stars.textContent = `★ ${r.stargazers_count || 0}`;
        tags.appendChild(stars);

        const links = document.createElement('div');
        links.className = 'mt-6 flex gap-3';
        const gh = document.createElement('a');
        gh.href = r.html_url;
        gh.target = '_blank';
        gh.rel = 'noreferrer';
        gh.className = 'text-sm font-semibold text-brand-300 hover:text-brand-200';
        gh.textContent = 'GitHub kodi';
        links.appendChild(gh);

        if (r.homepage) {
          const live = document.createElement('a');
          live.href = r.homepage;
          live.target = '_blank';
          live.rel = 'noreferrer';
          live.className = 'text-sm font-semibold text-slate-200 hover:text-white';
          live.textContent = 'Live Demo';
          links.appendChild(live);
        }

        article.appendChild(icon);
        article.appendChild(title);
        article.appendChild(desc);
        article.appendChild(tags);
        article.appendChild(links);

        grid.appendChild(article);
      });

      // re-observe new elements for animation
      const newBlocks = document.querySelectorAll('.fade-up');
      newBlocks.forEach((b) => observer.observe(b));
    } catch (err) {
      if (featuredGrid) featuredGrid.innerHTML = '';
      grid.innerHTML = '<p class="col-span-full text-center text-red-400">Loyihalar yuklanmadi — keyinroq urinib ko‘ring.</p>';
      console.error('Error loading repos', err);
    }
  }

  // Run fetch with the user's GitHub username
  fetchAndRenderRepos();
});
