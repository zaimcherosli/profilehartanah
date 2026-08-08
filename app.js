// Global Agent profile fallback variables
let globalWhatsappNumber = '60108118559';
let globalAgentName = 'Zaim Rosli';

document.addEventListener('DOMContentLoaded', () => {
  // --- Cloudflare R2 Database Configuration ---
  const _cb = `?t=${Date.now()}`; // cache-busting: forces fresh fetch every page load
  const DATABASE_CSV_URL = `https://pub-c09dadbb55254873bc3e24eba89ad126.r2.dev/hartanah_database_fixed.csv${_cb}`;
  const AGENT_SETTINGS_URL = `https://pub-c09dadbb55254873bc3e24eba89ad126.r2.dev/agent_settings.json${_cb}`;

  // Helper untuk parse satu baris CSV dengan mengambil kira tanda petikan berganda
  // Robust CSV parser supporting multiline fields inside double quotes
  function parseCSV(csvText) {
    if (!csvText) return [];
    const rows = [];
    let currentRow = [];
    let currentField = '';
    let insideQuote = false;

    for (let i = 0; i < csvText.length; i++) {
      const char = csvText[i];
      const nextChar = csvText[i + 1];

      if (char === '"') {
        if (insideQuote && nextChar === '"') {
          currentField += '"';
          i++; // skip escaped quote
        } else {
          insideQuote = !insideQuote;
        }
      } else if (char === ',' && !insideQuote) {
        currentRow.push(currentField.trim());
        currentField = '';
      } else if ((char === '\r' || char === '\n') && !insideQuote) {
        if (char === '\r' && nextChar === '\n') i++; // skip \n of \r\n
        currentRow.push(currentField.trim());
        if (currentRow.some(f => f !== '')) {
          rows.push(currentRow);
        }
        currentRow = [];
        currentField = '';
      } else {
        currentField += char;
      }
    }
    if (currentField !== '' || currentRow.length > 0) {
      currentRow.push(currentField.trim());
      if (currentRow.some(f => f !== '')) {
        rows.push(currentRow);
      }
    }

    if (rows.length <= 1) return [];

    const headers = rows[0];
    const list = [];
    for (let i = 1; i < rows.length; i++) {
      const values = rows[i];
      if (values.length < headers.length) continue;
      const item = {};
      headers.forEach((header, idx) => {
        item[header] = values[idx] || '';
      });
      list.push(item);
    }
    return list;
  }

  // --- Navigation & Mobile Menu ---
  const header = document.getElementById('header');
  const menuBtn = document.getElementById('menu-btn');
  const navMenu = document.getElementById('nav-menu');
  const navLinks = document.querySelectorAll('.nav-links a');

  // Change header background on scroll
  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
    
    // Highlight active section on scroll
    let current = '';
    const sections = document.querySelectorAll('section');
    sections.forEach(section => {
      const sectionTop = section.offsetTop;
      const sectionHeight = section.clientHeight;
      if (window.scrollY >= (sectionTop - 150)) {
        current = section.getAttribute('id');
      }
    });

    navLinks.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href') === `#${current}` || (current === 'hero-sec' && link.getAttribute('href') === '#')) {
        link.classList.add('active');
      }
    });
  });

  // Toggle mobile menu
  menuBtn.addEventListener('click', () => {
    navMenu.classList.toggle('active');
    menuBtn.classList.toggle('open');
  });

  // Close mobile menu when a link is clicked
  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      navMenu.classList.remove('active');
      menuBtn.classList.remove('open');
    });
  });


  // --- Property Listings Data & Filtering ---
  // Fallback listings data
  let propertiesList = [
    {
      id: 1,
      title: "The Grand Pavilion Penthouse",
      price: 1250000,
      priceStr: "RM 1,250,000",
      location: "KLCC, Kuala Lumpur",
      region: "KL",
      type: "Kondominium",
      status: "sale",
      beds: 3,
      baths: 3,
      size: 1450,
      image: "images/listing_condo.png"
    },
    {
      id: 2,
      title: "Avana Modern Double Storey",
      price: 680000,
      priceStr: "RM 680,000",
      location: "Denai Alam, Shah Alam",
      region: "Selangor",
      type: "Teres",
      status: "sale",
      beds: 4,
      baths: 4,
      size: 2200,
      image: "images/listing_terrace.png"
    },
    {
      id: 3,
      title: "Serene Suite Apartment",
      price: 3200,
      priceStr: "RM 3,200 / bln",
      location: "Mont Kiara, Kuala Lumpur",
      region: "KL",
      type: "Kondominium",
      status: "rent",
      beds: 2,
      baths: 2,
      size: 950,
      image: "images/hero_bg.png"
    },
    {
      id: 4,
      title: "Clover Semi-D Residence",
      price: 1850000,
      priceStr: "RM 1,850,000",
      location: "Cyberjaya, Selangor",
      region: "Selangor",
      type: "Semi-D",
      status: "sale",
      beds: 5,
      baths: 5,
      size: 3200,
      image: "images/hero_bg.png"
    },
    {
      id: 5,
      title: "Skyline Premium Studio",
      price: 1800,
      priceStr: "RM 1,800 / bln",
      location: "Bangsar, Kuala Lumpur",
      region: "KL",
      type: "Kondominium",
      status: "rent",
      beds: 1,
      baths: 1,
      size: 550,
      image: "images/listing_condo.png"
    },
    {
      id: 6,
      title: "Garden Homes Double Storey",
      price: 750000,
      priceStr: "RM 750,000",
      location: "Puchong, Selangor",
      region: "Selangor",
      type: "Teres",
      status: "sale",
      beds: 4,
      baths: 3,
      size: 1800,
      image: "images/listing_terrace.png"
    }
  ];

  let activeList = [...propertiesList]; // List current visible after filters
  const propertiesContainer = document.getElementById('properties-container');
  const filterTabs = document.querySelectorAll('.filter-tab');
  const searchBtn = document.getElementById('search-submit-btn');

  // Slider controls
  const sliderPrevBtn = document.getElementById('slider-prev-btn');
  const sliderNextBtn = document.getElementById('slider-next-btn');
  let currentSlide = 0;

  // Render property cards
  function renderProperties(list) {
    propertiesContainer.innerHTML = '';
    activeList = list;
    currentSlide = 0; // reset slider index

    if (list.length === 0) {
      propertiesContainer.innerHTML = `
        <div style="grid-column: 1/-1; width: 100%; text-align: center; padding: 60px 20px; color: var(--text-muted);">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="margin-bottom: 15px;"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
          <p>Tiada hartanah ditemui. Sila cuba penapis atau carian lain.</p>
        </div>
      `;
      updateSliderControls();
      return;
    }

    list.forEach(item => {
      const waText = encodeURIComponent(`Hi ${globalAgentName}, saya berminat dengan ${item.title} (${item.priceStr}) di ${item.location}. Boleh berikan butiran lanjut?`);
      
      // Support multiple images separated by comma
      const images = item.image.split(',').map(img => img.trim()).filter(img => img);
      let imageHtml = '';
      
      if (images.length > 1) {
        imageHtml = `
          <div class="card-image-slider">
            ${images.map((img, idx) => `<img src="${img}" class="card-slide-img ${idx === 0 ? 'active' : ''}" alt="${item.title}">`).join('')}
            <button class="card-slide-nav prev-card-img" onclick="event.preventDefault(); shiftCardImage(this, -1)" aria-label="Previous Image"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg></button>
            <button class="card-slide-nav next-card-img" onclick="event.preventDefault(); shiftCardImage(this, 1)" aria-label="Next Image"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg></button>
            <div class="card-slide-dots">
              ${images.map((_, idx) => `<span class="card-slide-dot ${idx === 0 ? 'active' : ''}"></span>`).join('')}
            </div>
          </div>
        `;
      } else {
        const imgUrl = images[0] || 'images/hero_bg.png';
        imageHtml = `<img src="${imgUrl}" alt="${item.title}">`;
      }

      const card = document.createElement('div');
      card.className = 'property-card';
      card.setAttribute('data-id', item.id);
      card.innerHTML = `
        <div class="property-image-container">
          <span class="property-tag">${item.status === 'sale' ? 'FOR SALE' : 'FOR RENT'}</span>
          <span class="property-location-tag">${item.location.split(',')[1]?.trim() || item.location}</span>
          ${imageHtml}
        </div>
        <div class="property-details">
          <div class="property-price">${item.priceStr}</div>
          <h3 class="property-title">${item.title}</h3>
          <div class="property-location">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2a8 8 0 0 0-8 8c0 5.25 8 12 8 12s8-6.75 8-12a8 8 0 0 0-8-8z"></path><circle cx="12" cy="10" r="3"></circle></svg>
            ${item.location}
          </div>
          <div class="property-specs">
            <div class="spec-item">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 4v16M2 8h20M22 4v16M2 18h20M2 12h20"></path></svg>
              <span>${item.beds} Bilik</span>
            </div>
            <div class="spec-item">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16c0 1.1.9 2 2 2h12a2 2 0 0 0 2-2V8l-6-6z"></path><path d="M14 3v5h5M16 13H8M16 17H8M10 9H8"></path></svg>
              <span>${item.baths} Bilik Air</span>
            </div>
            <div class="spec-item">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 3h18v18H3V3zM9 3v18M15 3v18M3 9h18M3 15h18"></path></svg>
              <span>${item.size.toLocaleString()} sqft</span>
            </div>
          </div>
          <div class="property-cta">
            <a href="https://wa.me/${globalWhatsappNumber}?text=${waText}" target="_blank" class="btn-wa">
              <img src="images/whatsapp_icon.png" alt="WhatsApp" style="width: 20px; height: 20px; object-fit: contain;">
              Tanya Ejen
            </a>
          </div>
        </div>
      `;
      propertiesContainer.appendChild(card);
    });
    
    // Recalculate slider layout after render
    updateSliderPosition();
  }

  // --- Dynamic Slider/Carousel Implementation ---
  function getVisibleColumns() {
    if (window.innerWidth > 1024) return 3;
    if (window.innerWidth > 768) return 2;
    return 1;
  }

  function updateSliderPosition() {
    const visibleCols = getVisibleColumns();
    const maxSlideIndex = Math.max(0, activeList.length - visibleCols);
    
    // Bounds check
    if (currentSlide > maxSlideIndex) currentSlide = maxSlideIndex;
    if (currentSlide < 0) currentSlide = 0;

    const cards = propertiesContainer.querySelectorAll('.property-card');
    if (cards.length > 0) {
      const cardWidth = cards[0].clientWidth;
      const gap = 30; // matches CSS gap
      const offset = currentSlide * (cardWidth + gap);
      propertiesContainer.style.transform = `translateX(-${offset}px)`;
    } else {
      propertiesContainer.style.transform = `translateX(0px)`;
    }

    // Disable button states
    sliderPrevBtn.disabled = (currentSlide === 0);
    sliderNextBtn.disabled = (currentSlide >= maxSlideIndex || activeList.length <= visibleCols);
  }

  function updateSliderControls() {
    const visibleCols = getVisibleColumns();
    const maxSlideIndex = Math.max(0, activeList.length - visibleCols);
    
    sliderPrevBtn.disabled = (currentSlide === 0);
    sliderNextBtn.disabled = (currentSlide >= maxSlideIndex || activeList.length <= visibleCols);
  }

  // Event Listeners for Slider
  sliderPrevBtn.addEventListener('click', () => {
    if (currentSlide > 0) {
      currentSlide--;
      updateSliderPosition();
    }
  });

  sliderNextBtn.addEventListener('click', () => {
    const visibleCols = getVisibleColumns();
    const maxSlideIndex = Math.max(0, activeList.length - visibleCols);
    if (currentSlide < maxSlideIndex) {
      currentSlide++;
      updateSliderPosition();
    }
  });

  // Resize listener to adapt slider offsets
  window.addEventListener('resize', () => {
    // Re-adjust card widths in layout and re-render/re-position slider
    updateSliderPosition();
  });

  // Swipe Gestures for Mobile
  let touchStartX = 0;
  let touchEndX = 0;
  
  propertiesContainer.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].screenX;
  }, { passive: true });

  propertiesContainer.addEventListener('touchend', (e) => {
    touchEndX = e.changedTouches[0].screenX;
    const swipeDistance = touchStartX - touchEndX;
    const threshold = 50; // swipe threshold in px
    
    if (swipeDistance > threshold) {
      // Swiped Left -> Show Next
      sliderNextBtn.click();
    } else if (swipeDistance < -threshold) {
      // Swiped Right -> Show Prev
      sliderPrevBtn.click();
    }
  }, { passive: true });


  // Helper to convert Sanity Portable Text blocks to basic HTML strings
  function portableTextToHtml(blocks) {
    if (!blocks || !Array.isArray(blocks)) return '';
    return blocks.map(block => {
      if (block._type !== 'block' || !block.children) return '';
      const text = block.children.map(child => child.text || '').join('');
      return `<p>${text.replace(/\n/g, '<br>')}</p>`;
    }).join('');
  }

  // --- Render Agent Profile Dynamically ---
  function renderAgentProfile(agent) {
    if (!agent) return;
    
    // Check suspension (Auto Suspend by Renewal Date or Manual Suspend)
    const isManualSuspended = agent.isSuspended === true;
    let isExpired = false;
    
    if (agent.nextDueDate) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const dueDate = new Date(agent.nextDueDate);
      dueDate.setHours(0, 0, 0, 0);
      
      if (today > dueDate) {
        isExpired = true;
      }
    }

    if (isManualSuspended || isExpired) {
      console.warn("[Billing] Laman web ditangguhkan. Menunjukkan skrin penggantungan.");
      document.body.innerHTML = `
        <div style="display:flex; flex-direction:column; align-items:center; justify-content:center; min-height:100vh; background:#020617; color:#f8fafc; font-family:sans-serif; text-align:center; padding:30px; box-sizing:border-box;">
          <div style="max-width:550px; background:#0f172a; padding:48px 32px; border-radius:24px; border:1px solid #1e293b; box-shadow:0 25px 50px rgba(0,0,0,0.5);">
            <div style="width:70px; height:70px; background:rgba(234,179,8,0.1); border:1px solid rgba(234,179,8,0.2); border-radius:50%; display:flex; align-items:center; justify-content:center; margin:0 auto 24px; color:#eab308;">
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
            </div>
            <h1 style="font-size:2.1rem; font-weight:800; margin-bottom:16px; color:#f8fafc; letter-spacing:-0.5px;">Laman Web Ditangguhkan</h1>
            <p style="font-size:1rem; line-height:1.6; color:#94a3b8; margin-bottom:32px;">
              Akses ke laman web ini telah ditangguhkan sementara kerana tempoh langganan tahunan telah tamat atau akaun ditutup. Sila hubungi pengurus laman web anda untuk pengaktifan semula.
            </p>
            <a href="https://wa.me/60108118559?text=Saya%20mahu%20aktifkan%20semula%20laman%20web%20hartanah%20saya" target="_blank" style="display:inline-flex; align-items:center; justify-content:center; background:#eab308; color:#020617; padding:14px 28px; border-radius:10px; font-weight:700; text-decoration:none; transition:all 0.2s ease; box-shadow:0 8px 20px rgba(234,179,8,0.25);">
              Hubungi Pengurus Web
            </a>
          </div>
        </div>
      `;
      document.body.style.overflow = 'hidden';
      throw new Error("Laman web digantung.");
    }

    globalAgentName = agent.name || 'Zaim Rosli';
    globalWhatsappNumber = agent.whatsappNumber || '60108118559';

    // 1. Update WhatsApp numbers across the web
    const waFloat = document.getElementById('wa-float-btn');
    if (waFloat) {
      waFloat.href = `https://wa.me/${globalWhatsappNumber}?text=Hi%20${encodeURIComponent(globalAgentName)},%20saya%20mahu%20bertanya%20mengenai%20hartanah.`;
    }
    
    const aboutWaBtn = document.querySelector('.about-cta .btn-primary');
    if (aboutWaBtn) {
      aboutWaBtn.href = `https://wa.me/${globalWhatsappNumber}?text=Hi%20${encodeURIComponent(globalAgentName)},%20saya%20ingin%20dapatkan%20konsultasi%20hartanah.`;
    }

    // 2. Update About section content
    const aboutSection = document.getElementById('about');
    if (aboutSection) {
      const imgEl = aboutSection.querySelector('.about-image img');
      if (imgEl && agent.avatarUrl) imgEl.src = agent.avatarUrl;
      
      const titleEl = aboutSection.querySelector('.about-info h2');
      if (titleEl) titleEl.textContent = globalAgentName;
      
      const renEl = aboutSection.querySelector('.ren-tag');
      if (renEl) renEl.textContent = `${agent.renCode || 'REN39575'} - Ejen Hartanah`;
      
      const bioEl = aboutSection.querySelector('.about-info p');
      if (bioEl) bioEl.textContent = agent.bio;
      
      // Update credentials
      const credsList = aboutSection.querySelector('.credentials-list');
      if (credsList && Array.isArray(agent.credentials)) {
        credsList.innerHTML = agent.credentials.map(cred => `
          <li>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
            ${cred}
          </li>
        `).join('');
      }
    }

    // 3. Update Hero agent card
    const heroAgentImg = document.getElementById('hero-agent-img');
    if (heroAgentImg && agent.avatarUrl) heroAgentImg.src = agent.avatarUrl;

    const heroAgentName = document.getElementById('hero-agent-name');
    if (heroAgentName) heroAgentName.textContent = globalAgentName;

    const heroAgentRen = document.getElementById('hero-agent-ren');
    if (heroAgentRen) heroAgentRen.textContent = `${agent.renCode || 'REN 39575'} ΓÇó Real Estate Negotiator`;

    const heroWaBtn = document.getElementById('hero-wa-btn');
    if (heroWaBtn) {
      heroWaBtn.href = `https://wa.me/${globalWhatsappNumber}?text=Hi%20${encodeURIComponent(globalAgentName)},%20saya%20layari%20website%20anda%20dan%20mahu%20bertanya%20tentang%20servis%20hartanah.`;
    }
  }

  // --- Cloudflare R2 / Local Fetch Routine ---
  async function fetchAgentSettings() {
    try {
      console.log("[Database] Mengambil data profil ejen...");
      const response = await fetch(AGENT_SETTINGS_URL);
      if (!response.ok) throw new Error("Gagal memuat fail tetapan ejen");
      const agent = await response.json();
      renderAgentProfile(agent);
    } catch (error) {
      console.warn("[Database] Ralat menyambung ke tetapan ejen. Menggunakan profil fallback:", error);
      // Guna profil fallback statik
      renderAgentProfile({
        name: globalAgentName,
        renCode: 'REN39575',
        bio: 'Halo! Saya Zaim Rosli, Perunding Hartanah Berdaftar yang berdedikasi tinggi serta berpengalaman luas menguruskan pasaran sekitar Kuala Lumpur dan Selangor.',
        whatsappNumber: globalWhatsappNumber,
        avatarUrl: 'images/agent_avatar.jpg',
        credentials: [
          "Ahli LPPEH Berdaftar",
          "Pakar Kawasan Klang Valley",
          "Konsultasi Pembiayaan Bank",
          "Rangkaian Peguam Profesional"
        ]
      });
    }
  }

  async function fetchProperties() {
    try {
      console.log("[Database] Mengambil data hartanah daripada Cloudflare KV API...");
      const res = await fetch(`https://zaimrosli-worker.huzaimrosli.workers.dev/api/properties?t=${Date.now()}`);
      if (res.ok) {
        const remoteList = await res.json();
        if (Array.isArray(remoteList) && remoteList.length > 0) {
          propertiesList = remoteList.map(item => {
            let imgStr = item.image || "images/hero_bg.png";
            if (Array.isArray(item.images) && item.images.length > 0) {
              imgStr = item.images.join(', ');
            }
            return {
              id: item.id || String(Math.random()),
              title: item.title || "Hartanah Tanpa Tajuk",
              price: Number(item.price) || 0,
              priceStr: item.priceStr || (item.status === 'sale' 
                ? `RM ${Number(item.price).toLocaleString('en-US')}` 
                : `RM ${Number(item.price).toLocaleString('en-US')} / bln`),
              location: item.location || "Lembah Klang",
              region: item.region || "KL",
              type: item.type || "Kondominium",
              status: item.status || "sale",
              beds: Number(item.beds) || 0,
              baths: Number(item.baths) || 0,
              parking: Number(item.parking) || 1,
              size: Number(item.size) || 0,
              landSize: item.landSize || '',
              tenure: item.tenure || 'Freehold',
              lotType: item.lotType || 'Bumi Lot',
              image: imgStr,
              rawDescription: item.description || ""
            };
          });
          console.log(`[Database] Berjaya memuat ${propertiesList.length} hartanah dari Cloudflare KV API.`);
          renderProperties(propertiesList);
          return;
        }
      }
    } catch (e) {
      console.warn("[Database] Cloudflare KV API fetch fallback to CSV:", e);
    }

    try {
      console.log("[Database] Mengambil data hartanah daripada R2 CSV...");
      const response = await fetch(DATABASE_CSV_URL);
      if (!response.ok) throw new Error("Gagal memuat fail pangkalan data CSV");
      const csvText = await response.text();
      const parsedData = parseCSV(csvText);

      if (Array.isArray(parsedData) && parsedData.length > 0) {
        propertiesList = parsedData.map(item => {
          return {
            id: item.id || String(Math.random()),
            title: item.title || "Hartanah Tanpa Tajuk",
            price: Number(item.price) || 0,
            priceStr: item.priceStr || (item.status === 'sale' 
              ? `RM ${Number(item.price).toLocaleString()}` 
              : `RM ${Number(item.price).toLocaleString()} / bln`),
            location: item.location || "Lembah Klang",
            region: item.region || "KL",
            type: item.type || "Kondominium",
            status: item.status || "sale",
            beds: Number(item.beds) || 0,
            baths: Number(item.baths) || 0,
            parking: Number(item.parking) || 1,
            size: Number(item.size) || 0,
            landSize: item.landSize || '',
            tenure: item.tenure || 'Freehold',
            lotType: item.lotType || 'Bumi Lot',
            image: item.image || "images/hero_bg.png",
            rawDescription: item.description || ""
          };
        });
        console.log(`[Database] Berjaya memuat ${propertiesList.length} hartanah.`);
        renderProperties(propertiesList);
      } else {
        console.log("[Database] Fail CSV kosong. Menggunakan data fallback statik.");
        renderProperties(propertiesList);
      }
    } catch (error) {
      console.warn("[Database] Ralat membaca pangkalan data CSV. Guna data fallback statik:", error);
      renderProperties(propertiesList);
    }
  }

  // Muatkan semua data
  fetchAgentSettings();
  fetchProperties();


  // --- Filtering (Tabs & Search) ---
  const filterTabsWrapper = document.querySelector('.filter-tabs');
  if (filterTabsWrapper) {
    let isMouseDown = false;
    let startX = 0;
    let scrollLeft = 0;

    filterTabsWrapper.addEventListener('mousedown', (e) => {
      isMouseDown = true;
      startX = e.pageX - filterTabsWrapper.offsetLeft;
      scrollLeft = filterTabsWrapper.scrollLeft;
    });

    filterTabsWrapper.addEventListener('mouseleave', () => { isMouseDown = false; });
    filterTabsWrapper.addEventListener('mouseup', () => { isMouseDown = false; });

    filterTabsWrapper.addEventListener('mousemove', (e) => {
      if (!isMouseDown) return;
      e.preventDefault();
      const x = e.pageX - filterTabsWrapper.offsetLeft;
      const walk = (x - startX) * 2;
      filterTabsWrapper.scrollLeft = scrollLeft - walk;
    });
  }

  filterTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      filterTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      const filterVal = tab.getAttribute('data-filter');
      let filtered = [];

      if (filterVal === 'all') {
        filtered = propertiesList;
      } else if (filterVal === 'sale' || filterVal === 'rent') {
        filtered = propertiesList.filter(p => p.status === filterVal);
      } else if (filterVal === 'under500k') {
        filtered = propertiesList.filter(p => p.price > 0 && p.price <= 500000);
      } else if (filterVal === 'teres') {
        filtered = propertiesList.filter(p => p.type && p.type.toLowerCase().includes('teres'));
      } else {
        filtered = propertiesList.filter(p => {
          const reg = (p.region || '').toLowerCase();
          const target = filterVal.toLowerCase();
          return reg === target || (target === 'kl' && reg.includes('kuala lumpur')) || (target === 'kuala lumpur' && (reg === 'kl' || reg.includes('kuala lumpur')));
        });
      }

      renderProperties(filtered);
    });
  });

  searchBtn.addEventListener('click', () => {
    const locVal = document.getElementById('search-location').value;
    const typeVal = document.getElementById('search-type').value;
    const statusVal = document.getElementById('search-status').value;

    let filtered = propertiesList;

    if (locVal !== 'all') {
      filtered = filtered.filter(p => p.region === locVal);
    }
    if (typeVal !== 'all') {
      filtered = filtered.filter(p => p.type && (p.type === typeVal || p.type.toLowerCase().includes(typeVal.toLowerCase())));
    }
    if (statusVal !== 'all') {
      filtered = filtered.filter(p => p.status === statusVal);
    }

    renderProperties(filtered);
    
    // Smooth scroll to listings
    document.getElementById('properties').scrollIntoView({ behavior: 'smooth' });
  });


  // --- Interactive Mortgage Calculator & Sharing ---
  const priceInput = document.getElementById('calc-price');
  const dpInput = document.getElementById('calc-downpayment');
  const interestInput = document.getElementById('calc-interest');
  const tenureInput = document.getElementById('calc-tenure');

  const priceVal = document.getElementById('price-val');
  const dpVal = document.getElementById('downpayment-val');
  const interestVal = document.getElementById('interest-val');
  const tenureVal = document.getElementById('tenure-val');

  const monthlyPaymentEl = document.getElementById('monthly-payment');
  const loanAmountValEl = document.getElementById('loan-amount-val');
  const detailInterestEl = document.getElementById('detail-interest');
  const detailTenureEl = document.getElementById('detail-tenure');

  // Sharing controls
  const shareWaBtn = document.getElementById('calc-share-wa');
  const shareCopyBtn = document.getElementById('calc-share-copy');
  const notificationBanner = document.getElementById('notification-banner');

  // Helper calculations for Legal Fees & Stamp Duties
  function calcSPALegalFee(price) {
    let fee = 0;
    if (price <= 500000) {
      fee = price * 0.0125;
    } else if (price <= 1200000) {
      fee = (500000 * 0.0125) + ((price - 500000) * 0.01);
    } else {
      fee = (500000 * 0.0125) + (700000 * 0.01) + ((price - 1200000) * 0.009);
    }
    return Math.max(500, Math.round(fee));
  }

  function calcMOTStampDuty(price) {
    let duty = 0;
    if (price <= 100000) {
      duty = price * 0.01;
    } else if (price <= 500000) {
      duty = 1000 + ((price - 100000) * 0.02);
    } else if (price <= 1000000) {
      duty = 1000 + 8000 + ((price - 500000) * 0.03);
    } else {
      duty = 1000 + 8000 + 15000 + ((price - 1000000) * 0.04);
    }
    return Math.round(duty);
  }

  function calcLoanLegalFee(loanAmount) {
    if (loanAmount <= 0) return 0;
    let fee = 0;
    if (loanAmount <= 500000) {
      fee = loanAmount * 0.0125;
    } else if (loanAmount <= 1200000) {
      fee = (500000 * 0.0125) + ((loanAmount - 500000) * 0.01);
    } else {
      fee = (500000 * 0.0125) + (700000 * 0.01) + ((loanAmount - 1200000) * 0.009);
    }
    return Math.max(500, Math.round(fee));
  }

  function calcLoanStampDuty(loanAmount) {
    return Math.round(loanAmount * 0.005);
  }

  function calcValuationFee(price) {
    let fee = 0;
    if (price <= 100000) {
      fee = price * 0.0025;
    } else {
      fee = (100000 * 0.0025) + ((price - 100000) * 0.002);
    }
    return Math.max(350, Math.round(fee));
  }

  function calculateMortgage() {
    const price = parseInt(priceInput.value);
    
    // Downpayment bounds check
    dpInput.max = price;
    let dp = parseInt(dpInput.value);
    if (dp > price) {
      dp = Math.round(price * 0.1);
      dpInput.value = dp;
    }

    const interest = parseFloat(interestInput.value);
    const tenure = parseInt(tenureInput.value);

    // Update displays
    priceVal.textContent = `RM ${price.toLocaleString()}`;
    dpVal.textContent = `RM ${dp.toLocaleString()} (${Math.round((dp / price) * 100)}%)`;
    interestVal.textContent = `${interest}%`;
    tenureVal.textContent = `${tenure} Tahun`;

    const loanAmount = price - dp;
    const r = (interest / 100) / 12;
    const n = tenure * 12;

    let monthlyPayment = 0;
    if (r > 0) {
      monthlyPayment = (loanAmount * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
    } else {
      monthlyPayment = loanAmount / n;
    }

    // Fee calculations
    const spaLegal = calcSPALegalFee(price);
    const motDuty = calcMOTStampDuty(price);
    const loanLegal = calcLoanLegalFee(loanAmount);
    const loanStamp = calcLoanStampDuty(loanAmount);
    const valFee = calcValuationFee(price);
    const totalFees = spaLegal + motDuty + loanLegal + loanStamp + valFee;

    monthlyPaymentEl.innerHTML = `RM ${Math.round(monthlyPayment).toLocaleString()} <span>/ sebulan</span>`;
    loanAmountValEl.textContent = `RM ${loanAmount.toLocaleString()}`;

    const totalFeesEl = document.getElementById('total-fees-val');
    if (totalFeesEl) totalFeesEl.textContent = `RM ${totalFees.toLocaleString()}`;

    const spaLegalEl = document.getElementById('spa-legal-val');
    if (spaLegalEl) spaLegalEl.textContent = `RM ${spaLegal.toLocaleString()}`;

    const motFeeEl = document.getElementById('mot-fee-val');
    if (motFeeEl) motFeeEl.textContent = `RM ${motDuty.toLocaleString()}`;

    const loanLegalEl = document.getElementById('loan-legal-val');
    if (loanLegalEl) loanLegalEl.textContent = `RM ${loanLegal.toLocaleString()}`;

    const loanStampEl = document.getElementById('loan-stamp-val');
    if (loanStampEl) loanStampEl.textContent = `RM ${loanStamp.toLocaleString()}`;

    const valFeeEl = document.getElementById('valuation-fee-val');
    if (valFeeEl) valFeeEl.textContent = `RM ${valFee.toLocaleString()}`;
  }

  // Automatic downpayment calculation on house price sliding
  priceInput.addEventListener('input', () => {
    const price = parseInt(priceInput.value);
    dpInput.value = Math.round(price * 0.1); // default 10%
    calculateMortgage();
  });
  dpInput.addEventListener('input', calculateMortgage);
  interestInput.addEventListener('input', calculateMortgage);
  tenureInput.addEventListener('input', calculateMortgage);

  // Trigger initial calculation
  calculateMortgage();

  // Create Formatted Calculation Text for Copy/Share
  function getCalculationText() {
    const price = parseInt(priceInput.value);
    const dp = parseInt(dpInput.value);
    const dpPct = Math.round((dp / price) * 100);
    const loan = price - dp;
    const interest = interestInput.value;
    const tenure = tenureInput.value;
    const monthly = Math.round((loan * (interest/100/12) * Math.pow(1 + interest/100/12, tenure*12)) / (Math.pow(1 + interest/100/12, tenure*12) - 1));

    const spaLegal = calcSPALegalFee(price);
    const motDuty = calcMOTStampDuty(price);
    const loanLegal = calcLoanLegalFee(loan);
    const loanStamp = calcLoanStampDuty(loan);
    const valFee = calcValuationFee(price);
    const totalFees = spaLegal + motDuty + loanLegal + loanStamp + valFee;

    return `*ANGGARAN BAYARAN BULANAN & KOS GUAMAN HARTANAH*\n` +
           `_Disediakan oleh ${globalAgentName}_\n` +
           `---------------------------------------------\n` +
           `≡ƒÅá *Harga Rumah:* RM ${price.toLocaleString()}\n` +
           `≡ƒÆ░ *Downpayment (${dpPct}%):* RM ${dp.toLocaleString()}\n` +
           `≡ƒÆ╡ *Jumlah Pinjaman:* RM ${loan.toLocaleString()}\n` +
           `≡ƒôê *Kadar Faedah:* ${interest}%\n` +
           `ΓÅ▒∩╕Å *Tempoh Loan:* ${tenure} Tahun\n` +
           `---------------------------------------------\n` +
           `≡ƒöÑ *Anggaran Bulanan:* RM ${monthly.toLocaleString()} / sebulan\n` +
           `---------------------------------------------\n` +
           `≡ƒôï *PERINCIAN KOS AWAL GUAMAN & DUTI SETEM:*\n` +
           `ΓÇó Guaman SPA: RM ${spaLegal.toLocaleString()}\n` +
           `ΓÇó Duti Setem MOT: RM ${motDuty.toLocaleString()}\n` +
           `ΓÇó Guaman Pinjaman: RM ${loanLegal.toLocaleString()}\n` +
           `ΓÇó Duti Setem Pinjaman: RM ${loanStamp.toLocaleString()}\n` +
           `ΓÇó Yuran Penilaian: RM ${valFee.toLocaleString()}\n` +
           `Γ£¿ *Jumlah Kos Awal Guaman & Duti Setem:* RM ${totalFees.toLocaleString()}\n\n` +
           `Berminat untuk semak kelayakan pembiayaan penuh?\n` +
           `WhatsApp ${globalAgentName}: https://wa.me/${globalWhatsappNumber}`;
  }

  // Copy Calculation to Clipboard
  shareCopyBtn.addEventListener('click', () => {
    const text = getCalculationText();
    navigator.clipboard.writeText(text).then(() => {
      // Toast notification banner
      notificationBanner.textContent = "Pengiraan berjaya disalin ke clipboard!";
      notificationBanner.classList.add('show');
      setTimeout(() => {
        notificationBanner.classList.remove('show');
      }, 2000);
    }).catch(err => {
      console.error('Gagal menyalin:', err);
    });
  });

  // Share Calculation directly to WhatsApp Contact selection
  shareWaBtn.addEventListener('click', () => {
    const text = encodeURIComponent(getCalculationText());
    const url = `https://api.whatsapp.com/send?text=${text}`;
    window.open(url, '_blank');
  });


  // --- Contact Form Handling ---
  const contactForm = document.getElementById('contact-form-el');

  contactForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const name = document.getElementById('form-name').value;
    const phone = document.getElementById('form-phone').value;
    const serviceSelect = document.getElementById('form-service');
    const service = serviceSelect.options[serviceSelect.selectedIndex].text;
    const message = document.getElementById('form-message').value;

    const waText = encodeURIComponent(`Halo ${globalAgentName},\n\nNama saya *${name}* (${phone}). Saya berminat dengan servis *${service}*.\n\nButiran Mesej:\n"${message}"`);
    const waUrl = `https://wa.me/${globalWhatsappNumber}?text=${waText}`;

    // Success popup
    notificationBanner.textContent = "Mesej berjaya dihantar! Membuka WhatsApp...";
    notificationBanner.classList.add('show');
    
    contactForm.reset();

    setTimeout(() => {
      notificationBanner.classList.remove('show');
      window.open(waUrl, '_blank');
    }, 2500);
  });

  // --- Lightbox/Modal Event Listeners & Logic ---
  const propertyModal = document.getElementById('property-modal');
  const modalCloseBtn = document.getElementById('modal-close-btn');

  // Handle property card clicks (event delegation)
  if (propertiesContainer && propertyModal) {
    propertiesContainer.addEventListener('click', (e) => {
      const card = e.target.closest('.property-card');
      if (!card) return;

      // Ignore clicking navigation arrows or CTA button
      if (e.target.closest('.btn-wa') || e.target.closest('.card-slide-nav') || e.target.closest('.card-slide-dot')) {
        return;
      }

      e.preventDefault();
      
      const propertyId = card.getAttribute('data-id');
      const property = propertiesList.find(p => p.id === propertyId);
      if (property) {
        openPropertyModal(property);
      }
    });
  }

  function openPropertyModal(property) {
    if (!propertyModal) return;

    // Set values
    document.getElementById('modal-title').textContent = property.title;
    document.getElementById('modal-price').textContent = property.priceStr;
    document.getElementById('modal-location').innerHTML = `
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2a8 8 0 0 0-8 8c0 5.25 8 12 8 12s8-6.75 8-12a8 8 0 0 0-8-8z"></path><circle cx="12" cy="10" r="3"></circle></svg>
      ${property.location}
    `;
    
    document.querySelector('#modal-spec-beds .val').textContent = `${property.beds} Bilik`;
    document.querySelector('#modal-spec-baths .val').textContent = `${property.baths} Bilik Air`;
    
    const parkEl = document.querySelector('#modal-spec-parking .val');
    if (parkEl) parkEl.textContent = `${property.parking || 1} Parking`;

    const sizeEl = document.querySelector('#modal-spec-size .val');
    if (sizeEl) sizeEl.textContent = `Binaan: ${property.size ? property.size.toLocaleString() + ' sqft' : '-'}`;

    const landEl = document.querySelector('#modal-spec-landSize .val');
    if (landEl) landEl.textContent = `Tanah: ${property.landSize || '-'}`;

    const tenureEl = document.querySelector('#modal-spec-tenure .val');
    if (tenureEl) tenureEl.textContent = property.tenure || 'Freehold';

    const lotEl = document.querySelector('#modal-spec-lotType .val');
    if (lotEl) lotEl.textContent = property.lotType || 'Bumi Lot';

    // Tag sale/rent
    const tagEl = document.getElementById('modal-property-tag');
    if (tagEl) {
      tagEl.textContent = property.status === 'sale' ? 'FOR SALE' : 'FOR RENT';
    }

    // WA Button
    const modalWaBtn = document.getElementById('modal-wa-btn');
    if (modalWaBtn) {
      const waText = encodeURIComponent(`Hi ${globalAgentName}, saya berminat dengan hartanah "${property.title}" (${property.priceStr}) di ${property.location}. Boleh berikan maklumat lanjut?`);
      modalWaBtn.href = `https://wa.me/${globalWhatsappNumber}?text=${waText}`;
    }

    // Description text
    const descEl = document.getElementById('modal-description');
    if (descEl) {
      const descValue = property.rawDescription || property.description;
      if (descValue) {
        if (Array.isArray(descValue)) {
          descEl.innerHTML = portableTextToHtml(descValue);
        } else {
          // Sokong teks biasa (plain text) daripada pangkalan data CSV
          descEl.innerHTML = descValue.split('\n').map(line => `<p>${line}</p>`).join('');
        }
      } else {
        descEl.textContent = 'Tiada keterangan lanjut disediakan.';
      }
    }

    // Images
    const mainImg = document.getElementById('modal-main-img');
    const thumbsContainer = document.getElementById('modal-thumbs');
    thumbsContainer.innerHTML = '';

    const images = property.image ? property.image.split(',').map(img => img.trim()).filter(Boolean) : [];
    if (images.length > 0) {
      mainImg.src = images[0];
      
      if (images.length > 1) {
        thumbsContainer.style.display = 'flex';
        images.forEach((img, idx) => {
          const thumb = document.createElement('img');
          thumb.src = img;
          thumb.alt = `Thumb ${idx + 1}`;
          if (idx === 0) thumb.classList.add('active');
          
          thumb.addEventListener('click', () => {
            document.querySelectorAll('.modal-thumbs img').forEach(t => t.classList.remove('active'));
            thumb.classList.add('active');
            
            mainImg.style.opacity = '0';
            setTimeout(() => {
              mainImg.src = img;
              mainImg.style.opacity = '1';
            }, 150);
          });
          
          thumbsContainer.appendChild(thumb);
        });
      } else {
        thumbsContainer.style.display = 'none';
      }
    } else {
      mainImg.src = 'images/hero_bg.png';
      thumbsContainer.style.display = 'none';
    }

    // Show Modal
    propertyModal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  // Close Events
  if (modalCloseBtn && propertyModal) {
    modalCloseBtn.addEventListener('click', closeModal);
    
    propertyModal.addEventListener('click', (e) => {
      if (e.target === propertyModal) {
        closeModal();
      }
    });

    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && propertyModal.classList.contains('active')) {
        closeModal();
      }
    });
  }

  function closeModal() {
    if (propertyModal) {
      propertyModal.classList.remove('active');
      document.body.style.overflow = '';
    }
  }

  // Scroll-driven active color change effect for Services cards
  const serviceCards = document.querySelectorAll('.service-card');
  if (serviceCards.length > 0 && 'IntersectionObserver' in window) {
    const serviceObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('active-scroll');
        } else {
          entry.target.classList.remove('active-scroll');
        }
      });
    }, {
      root: null,
      rootMargin: '-15% 0px -15% 0px',
      threshold: 0.35
    });

    serviceCards.forEach(card => serviceObserver.observe(card));
  }

  // Real-time Auto Sync across browser tabs (when admin saves changes)
  try {
    const bc = new BroadcastChannel('hartanah_update_channel');
    bc.onmessage = () => {
      fetchProperties();
    };
  } catch (e) {}

  window.addEventListener('storage', (e) => {
    if (e.key === 'hartanah_last_updated') {
      fetchProperties();
    }
  });
});

// Global function to handle shifting images on property cards
window.shiftCardImage = (btn, direction) => {
  const container = btn.closest('.property-image-container');
  const slides = container.querySelectorAll('.card-slide-img');
  const dots = container.querySelectorAll('.card-slide-dot');
  if (slides.length <= 1) return;

  let activeIdx = -1;
  slides.forEach((slide, idx) => {
    if (slide.classList.contains('active')) activeIdx = idx;
  });

  let nextIdx = activeIdx + direction;
  if (nextIdx >= slides.length) nextIdx = 0;
  if (nextIdx < 0) nextIdx = slides.length - 1;

  slides.forEach(s => s.classList.remove('active'));
  dots.forEach(d => d.classList.remove('active'));

  slides[nextIdx].classList.add('active');
  dots[nextIdx].classList.add('active');
};
