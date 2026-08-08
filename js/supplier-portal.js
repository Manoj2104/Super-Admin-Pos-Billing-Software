/* ─────────────────────────────────────────────────────────────────────────
   INFY-POS Supplier Portal — JavaScript
   ───────────────────────────────────────────────────────────────────────── */

(function () {
  'use strict';

  // ── Sidebar Toggle ─────────────────────────────────────────────────────────
  const sidebar   = document.getElementById('sp-sidebar');
  const hamburger = document.getElementById('sp-hamburger');
  const overlay   = document.getElementById('sp-overlay');

  function openSidebar()  { sidebar?.classList.add('open'); overlay?.classList.add('active'); }
  function closeSidebar() { sidebar?.classList.remove('open'); overlay?.classList.remove('active'); }

  hamburger?.addEventListener('click', () => sidebar?.classList.contains('open') ? closeSidebar() : openSidebar());
  overlay?.addEventListener('click', closeSidebar);

  // ── Active Nav ─────────────────────────────────────────────────────────────
  const currentPath = window.location.pathname;
  document.querySelectorAll('.sp-nav-item').forEach(item => {
    const href = item.getAttribute('href') || '';
    if (href && currentPath.startsWith(href) && href !== '/supplier/') {
      item.classList.add('active');
    } else if (href === '/supplier/dashboard' && currentPath === '/supplier/dashboard') {
      item.classList.add('active');
    }
  });

  // ── Notification Panel ─────────────────────────────────────────────────────
  const notifBtn   = document.getElementById('sp-notif-btn');
  const notifPanel = document.getElementById('sp-notif-panel');

  notifBtn?.addEventListener('click', (e) => {
    e.stopPropagation();
    notifPanel?.classList.toggle('active');
  });
  document.addEventListener('click', () => notifPanel?.classList.remove('active'));

  // Mark as read via AJAX
  const markReadBtn = document.getElementById('sp-mark-read');
  markReadBtn?.addEventListener('click', async () => {
    try {
      await fetch('/supplier/notifications/read', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.content || '',
        }
      });
      document.querySelectorAll('.sp-notif-dot, .sp-notif-count').forEach(el => el.remove());
      document.querySelectorAll('.sp-notif-item.unread').forEach(el => el.classList.remove('unread'));
    } catch(e) {}
  });

  // ── User Menu Dropdown ─────────────────────────────────────────────────────
  const userBtn  = document.getElementById('sp-user-btn');
  const userMenu = document.getElementById('sp-user-menu');

  userBtn?.addEventListener('click', (e) => {
    e.stopPropagation();
    userMenu?.classList.toggle('active');
  });
  document.addEventListener('click', () => userMenu?.classList.remove('active'));

  // ── Modal Helpers ──────────────────────────────────────────────────────────
  window.spOpenModal = function(id) {
    document.getElementById(id)?.classList.add('active');
    document.body.style.overflow = 'hidden';
  };
  window.spCloseModal = function(id) {
    document.getElementById(id)?.classList.remove('active');
    document.body.style.overflow = '';
  };

  // Close modal on overlay click
  document.querySelectorAll('.sp-modal-overlay').forEach(overlay => {
    overlay.addEventListener('click', function(e) {
      if (e.target === this) {
        this.classList.remove('active');
        document.body.style.overflow = '';
      }
    });
  });

  // ── Reject Modal ───────────────────────────────────────────────────────────
  const rejectBtn   = document.getElementById('sp-reject-btn');
  const rejectModal = document.getElementById('sp-reject-modal');
  const rejectClose = document.getElementById('sp-reject-close');
  const rejectForm  = document.getElementById('sp-reject-form');

  rejectBtn?.addEventListener('click', () => { spOpenModal('sp-reject-modal'); });
  rejectClose?.addEventListener('click', () => { spCloseModal('sp-reject-modal'); });

  // ── File Upload Zones ──────────────────────────────────────────────────────
  document.querySelectorAll('.sp-upload-zone').forEach(zone => {
    const input = zone.querySelector('input[type="file"]');

    zone.addEventListener('click', () => input?.click());
    zone.addEventListener('dragover', e => { e.preventDefault(); zone.classList.add('drag-over'); });
    zone.addEventListener('dragleave', () => zone.classList.remove('drag-over'));
    zone.addEventListener('drop', e => {
      e.preventDefault();
      zone.classList.remove('drag-over');
      if (input && e.dataTransfer.files.length) {
        input.files = e.dataTransfer.files;
        updateZoneLabel(zone, e.dataTransfer.files[0].name);
      }
    });

    input?.addEventListener('change', () => {
      if (input.files.length) updateZoneLabel(zone, input.files[0].name);
    });

    function updateZoneLabel(zone, filename) {
      const label = zone.querySelector('.sp-upload-text');
      if (label) label.textContent = '✅ ' + filename;
    }
  });

  // ── Login Method Tabs ──────────────────────────────────────────────────────
  document.querySelectorAll('.sp-login-method-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.sp-login-method-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const method = btn.dataset.method;
      const placeholder = method === 'email'
        ? 'Enter your email address'
        : method === 'mobile'
        ? 'Enter your mobile number'
        : 'Enter your supplier code (e.g. SUP-00001)';
      const input = document.getElementById('sp-login-input');
      if (input) {
        input.type = method === 'email' ? 'email' : 'text';
        input.placeholder = placeholder;
        input.setAttribute('inputmode', method === 'mobile' ? 'numeric' : 'text');
      }
      const label = document.getElementById('sp-login-label');
      if (label) {
        label.textContent = method === 'email' ? 'Email Address' : method === 'mobile' ? 'Mobile Number' : 'Supplier Code';
      }
    });
  });

  // ── Alert Auto Dismiss ─────────────────────────────────────────────────────
  document.querySelectorAll('.sp-alert[data-auto-dismiss]').forEach(alert => {
    const delay = parseInt(alert.dataset.autoDismiss) || 5000;
    setTimeout(() => {
      alert.style.transition = 'all 0.4s ease';
      alert.style.opacity = '0';
      alert.style.transform = 'translateY(-8px)';
      setTimeout(() => alert.remove(), 400);
    }, delay);
  });

  // ── Chart.js Dashboard ─────────────────────────────────────────────────────
  const dashChartEl = document.getElementById('sp-monthly-chart');
  if (dashChartEl && window.Chart) {
    const monthlyData = JSON.parse(dashChartEl.dataset.values || '[]');
    const labels = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

    new Chart(dashChartEl, {
      type: 'line',
      data: {
        labels,
        datasets: [{
          label: 'PO Value (₹)',
          data: monthlyData,
          borderColor: '#16A34A',
          backgroundColor: 'rgba(22,163,74,0.08)',
          borderWidth: 2.5,
          pointRadius: 4,
          pointBackgroundColor: '#16A34A',
          fill: true,
          tension: 0.45,
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: '#0F172A',
            titleFont: { size: 12, weight: '600' },
            bodyFont: { size: 12 },
            padding: 10,
            callbacks: {
              label: ctx => '₹ ' + Number(ctx.raw).toLocaleString('en-IN')
            }
          }
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: { font: { size: 11 }, color: '#94A3B8' }
          },
          y: {
            grid: { color: '#F1F5F9' },
            ticks: {
              font: { size: 11 }, color: '#94A3B8',
              callback: v => '₹' + (v >= 1000 ? (v/1000).toFixed(0) + 'k' : v)
            }
          }
        }
      }
    });
  }

  // ── Table Search Filter ─────────────────────────────────────────────────────
  const tableSearch = document.getElementById('sp-table-search');
  if (tableSearch) {
    tableSearch.addEventListener('input', function() {
      const q = this.value.toLowerCase();
      document.querySelectorAll('.sp-filterable-row').forEach(row => {
        row.style.display = row.textContent.toLowerCase().includes(q) ? '' : 'none';
      });
    });
  }

  // ── Copy to clipboard ──────────────────────────────────────────────────────
  document.querySelectorAll('[data-copy]').forEach(btn => {
    btn.addEventListener('click', () => {
      navigator.clipboard.writeText(btn.dataset.copy).then(() => {
        const orig = btn.textContent;
        btn.textContent = '✅ Copied!';
        setTimeout(() => btn.textContent = orig, 2000);
      });
    });
  });

  // ── Password toggle ────────────────────────────────────────────────────────
  document.querySelectorAll('[data-toggle-password]').forEach(btn => {
    btn.addEventListener('click', () => {
      const input = document.getElementById(btn.dataset.togglePassword);
      if (!input) return;
      if (input.type === 'password') {
        input.type = 'text';
        btn.textContent = '🙈';
      } else {
        input.type = 'password';
        btn.textContent = '👁';
      }
    });
  });

  // ── Keyboard shortcut Ctrl+K for search ───────────────────────────────────
  document.addEventListener('keydown', e => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
      e.preventDefault();
      document.querySelector('.sp-header-search input, #sp-login-input')?.focus();
    }
    if (e.key === 'Escape') {
      document.querySelectorAll('.sp-modal-overlay.active').forEach(m => {
        m.classList.remove('active');
        document.body.style.overflow = '';
      });
    }
  });

  // ── Animate KPI cards on scroll ────────────────────────────────────────────
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.style.opacity = '1';
          entry.target.style.transform = 'translateY(0)';
        }
      });
    }, { threshold: 0.1 });

    document.querySelectorAll('.sp-kpi-card').forEach((card, i) => {
      card.style.opacity = '0';
      card.style.transform = 'translateY(20px)';
      card.style.transition = `all 0.4s cubic-bezier(0.4,0,0.2,1) ${i * 0.07}s`;
      observer.observe(card);
    });
  }

  // ── Tab panel switching ────────────────────────────────────────────────────
  document.querySelectorAll('[data-tab]').forEach(tab => {
    tab.addEventListener('click', () => {
      const target = tab.dataset.tab;
      document.querySelectorAll('[data-tab]').forEach(t => t.classList.remove('active'));
      document.querySelectorAll('[data-tab-panel]').forEach(p => p.style.display = 'none');
      tab.classList.add('active');
      document.querySelector(`[data-tab-panel="${target}"]`).style.display = 'block';
    });
  });

})();
