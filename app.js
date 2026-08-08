/* ==========================================================================
   ZAIM ROSLI PORTAL — MAIN JAVASCRIPT LOGIC
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  initNavigation();
  initMobileDrawer();
});

// 1. Navigation Active Link Setup
function initNavigation() {
  const currentPath = window.location.pathname.split('/').pop() || 'index.html';
  
  // Set active link in desktop nav
  document.querySelectorAll('.nav-link').forEach(link => {
    const href = link.getAttribute('href');
    if (href === currentPath || (currentPath === '' && href === 'index.html')) {
      link.classList.add('active');
    }
  });

  // Set active link in mobile drawer
  document.querySelectorAll('.mobile-drawer-link').forEach(link => {
    const href = link.getAttribute('href');
    if (href === currentPath || (currentPath === '' && href === 'index.html')) {
      link.classList.add('active');
    }
  });
}

// 2. Mobile Drawer Menu Toggle
function initMobileDrawer() {
  const toggleBtn = document.getElementById('mobile-nav-toggle');
  const overlay = document.getElementById('mobile-overlay');
  const closeBtn = document.getElementById('mobile-drawer-close');

  if (toggleBtn && overlay) {
    toggleBtn.addEventListener('click', () => {
      overlay.classList.add('active');
      document.body.style.overflow = 'hidden';
    });
  }

  if (closeBtn && overlay) {
    closeBtn.addEventListener('click', () => {
      overlay.classList.remove('active');
      document.body.style.overflow = '';
    });
  }

  if (overlay) {
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        overlay.classList.remove('active');
        document.body.style.overflow = '';
      }
    });
  }
}

// 3. Property Card Generator HTML String
function createPropertyCardHTML(item) {
  const badgeClass = item.status === 'sale' ? 'badge-sale' : 'badge-rent';
  const badgeLabel = item.status === 'sale' ? 'FOR SALE' : 'FOR RENT';

  return `
    <div class="property-card">
      <div class="property-thumb-wrap">
        <img src="${item.image}" class="property-thumb" alt="${item.title}" onerror="this.src='https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=80'">
        <span class="property-badge ${badgeClass}">${badgeLabel}</span>
        <span class="property-region-badge">${item.region}</span>
      </div>
      <div class="property-content">
        <div class="property-price">${item.priceStr}</div>
        <h3 class="property-title">${item.title}</h3>
        <div class="property-location">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
          ${item.location}
        </div>
        <div class="property-specs-row">
          <span class="property-spec-item">🛏️ ${item.beds} Bilik</span>
          <span class="property-spec-item">🚿 ${item.baths} B.Air</span>
          <span class="property-spec-item">📐 ${item.size} sqft</span>
        </div>
        <a href="property-detail.html?slug=${item.slug || item.id}" class="btn btn-outline btn-sm" style="margin-top: 16px; width: 100%;">Lihat Butiran</a>
      </div>
    </div>
  `;
}

// 4. Formatting Utilities
function formatCurrency(val) {
  return new Intl.NumberFormat('ms-MY', { style: 'currency', currency: 'MYR', maximumFractionDigits: 0 }).format(val);
}
