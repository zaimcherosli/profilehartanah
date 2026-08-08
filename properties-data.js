/* ==========================================================================
   ZAIM ROSLI PORTAL — PROPERTY DATABASE & UTILITIES (ENGLISH)
   ========================================================================== */

const PROPERTIES_DATA = [
  {
    id: "prop-001",
    slug: "the-grand-pavilion-penthouse-klcc",
    title: "The Grand Pavilion Penthouse",
    price: 1250000,
    priceStr: "RM 1,250,000",
    location: "KLCC, Kuala Lumpur",
    region: "Kuala Lumpur",
    type: "Condominium",
    status: "sale",
    beds: 3,
    baths: 3,
    parking: 2,
    size: 1450,
    landSize: "-",
    tenure: "Freehold",
    lotType: "Non-Bumi Lot",
    image: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80",
    description: "Prestigious high-rise penthouse directly facing the iconic Petronas Twin Towers in KLCC. Contemporary modern architectural design with 5-star resort amenities including an infinity lap pool, state-of-the-art gymnasium, and 24/7 multi-tier security."
  },
  {
    id: "prop-002",
    slug: "avana-modern-double-storey-terrace-shah-alam",
    title: "Avana Modern Double Storey Terrace",
    price: 680000,
    priceStr: "RM 680,000",
    location: "Denai Alam, Shah Alam",
    region: "Selangor",
    type: "Terrace House",
    status: "sale",
    beds: 4,
    baths: 4,
    parking: 2,
    size: 2200,
    landSize: "22' x 75'",
    tenure: "Freehold",
    lotType: "Bumi Lot",
    image: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80",
    description: "Modern double-storey terrace home nestled in a serene gated & guarded neighborhood. Excellent connectivity via DASH Highway, close to international schools and family recreational parks."
  },
  {
    id: "prop-003",
    slug: "mutiara-hilltop-luxury-bungalow-bukit-jelutong",
    title: "Mutiara Hilltop Luxury Bungalow",
    price: 2450000,
    priceStr: "RM 2,450,000",
    location: "Bukit Jelutong, Shah Alam",
    region: "Selangor",
    type: "Bungalow",
    status: "sale",
    beds: 6,
    baths: 6,
    parking: 4,
    size: 4800,
    landSize: "6,500 sqft",
    tenure: "Freehold",
    lotType: "Open Title",
    image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80",
    description: "Exclusive hilltop luxury bungalow featuring expansive private gardens, swimming pool, spacious ensuite master bedrooms, and premium custom built-in kitchen cabinetry and wardrobes."
  },
  {
    id: "prop-004",
    slug: "eco-horizon-semi-d-residence-batu-kawan",
    title: "Eco Horizon Semi-D Residence",
    price: 1150000,
    priceStr: "RM 1,150,000",
    location: "Batu Kawan, Penang",
    region: "Penang",
    type: "Semi-D",
    status: "sale",
    beds: 5,
    baths: 5,
    parking: 3,
    size: 2800,
    landSize: "35' x 80'",
    tenure: "Freehold",
    lotType: "Non-Bumi Lot",
    image: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=80",
    description: "Gated resort-style Semi-Detached residence situated near IKEA Batu Kawan and Penang Second Bridge. Eco-centric architectural design with optimal natural ventilation and lighting."
  },
  {
    id: "prop-005",
    slug: "urban-studio-suite-bangsar-south",
    title: "Urban Studio Suite @ Bangsar South",
    price: 2300,
    priceStr: "RM 2,300 / mo",
    location: "Bangsar South, Kuala Lumpur",
    region: "Kuala Lumpur",
    type: "Studio Suite",
    status: "rent",
    beds: 1,
    baths: 1,
    parking: 1,
    size: 550,
    landSize: "-",
    tenure: "Leasehold",
    lotType: "Open Title",
    image: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80",
    description: "Fully furnished urban studio suite within walking distance to Kerinchi LRT Station and Mid Valley Megamall. Ideal for young corporate professionals and couples."
  },
  {
    id: "prop-006",
    slug: "taman-melawati-scenic-townhouse-kl",
    title: "Taman Melawati Scenic Townhouse",
    price: 590000,
    priceStr: "RM 590,000",
    location: "Taman Melawati, Kuala Lumpur",
    region: "Kuala Lumpur",
    type: "Townhouse",
    status: "sale",
    beds: 3,
    baths: 2,
    parking: 2,
    size: 1380,
    landSize: "-",
    tenure: "Freehold",
    lotType: "Malay Reserve",
    image: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80",
    description: "Tranquil townhouse with scenic views of Bukit Tabur quartz ridge. Strategic access to Melawati Mall, reputable schools, and MRR2 / SPE highways."
  }
];

function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-');
}

// Legal Fees & Stamp Duty Calculations (Malaysian Statutory Formulas)
function calcSPALegalFee(price) {
  let fee = 0;
  if (price <= 500000) {
    fee = price * 0.0125;
    if (fee < 500) fee = 500;
  } else if (price <= 7500000) {
    fee = (500000 * 0.0125) + ((price - 500000) * 0.01);
  } else {
    fee = (500000 * 0.0125) + (7000000 * 0.01) + ((price - 7500000) * 0.0075);
  }
  return Math.round(fee);
}

function calcMOTStampDuty(price) {
  let mot = 0;
  if (price <= 100000) {
    mot = price * 0.01;
  } else if (price <= 500000) {
    mot = (100000 * 0.01) + ((price - 100000) * 0.02);
  } else if (price <= 1000000) {
    mot = (100000 * 0.01) + (400000 * 0.02) + ((price - 500000) * 0.03);
  } else {
    mot = (100000 * 0.01) + (400000 * 0.02) + (500000 * 0.03) + ((price - 1000000) * 0.04);
  }
  return Math.round(mot);
}

function calcLoanLegalFee(loanAmount) {
  return calcSPALegalFee(loanAmount);
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
  return Math.max(300, Math.round(fee));
}

// Load custom properties saved from admin portal
try {
  const customStored = localStorage.getItem('ZAIM_ROSLI_PROPERTIES');
  if (customStored) {
    const parsed = JSON.parse(customStored);
    if (Array.isArray(parsed) && parsed.length > 0) {
      PROPERTIES_DATA.length = 0;
      PROPERTIES_DATA.push(...parsed);
    }
  }
} catch (e) {}

// Async sync with Cloudflare KV Server-side API
(async function initCloudflareKVSync() {
  try {
    const res = await fetch(`https://zaimrosli-worker.huzaimrosli.workers.dev/api/properties?t=${Date.now()}`);
    const remoteList = await res.json();
    if (Array.isArray(remoteList) && remoteList.length > 0) {
      PROPERTIES_DATA.length = 0;
      PROPERTIES_DATA.push(...remoteList);
      localStorage.setItem('ZAIM_ROSLI_PROPERTIES', JSON.stringify(remoteList));
      window.dispatchEvent(new Event('properties-updated'));
    }
  } catch(e) {}
})();
