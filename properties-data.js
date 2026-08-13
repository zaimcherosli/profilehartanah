const PROPERTIES_DATA = [
  {
    "id": "prop-146291",
    "slug": "factory-with-2-storey-office-taman-industri-sijangkang-utama-teluk-panglima-garang",
    "title": "Factory With 2 Storey Office In Taman Industri Sijangkang Utama, Teluk Panglima Garang For Rent",
    "price": 86000,
    "priceStr": "RM 86,000 / bln",
    "location": "Taman Industri Sijangkang Utama, 42500 Telok Panglima Garang, Daerah Kuala Langat",
    "region": "Selangor",
    "type": "Kilang",
    "status": "rent",
    "beds": 0,
    "baths": 4,
    "parking": 10,
    "size": 50407,
    "landSize": "2.1157 Acres",
    "tenure": "Freehold",
    "lotType": "Non-Bumi Lot",
    "refUrl": "https://propmall.co/share/eezmfo1hta",
    "image": "https://cdn.propmall.net/media/img-property/list-146291/list-146291-01-69eb366f39d399.50503260.jpg",
    "images": [
      "https://cdn.propmall.net/media/img-property/list-146291/list-146291-01-69eb366f39d399.50503260.jpg"
    ],
    "description": "Factory With Office In Taman Industri Sijangkang Utama, Teluk Panglima Garang For Rent:\n\nFactory/Warehouse Information:\n\nLocation / address : Taman Industri Sijangkang Utama, 42500 Telok Panglima Garang, Daerah Kuala Langat\n\nLand Area : 2.1157 Acres\n\nBuilt Up : 4,683 m2 / 50,407 sqft\n\nDimension : 174.87m x 25.45m / 574 ft x 83.5 ft\n\nOffice Area : 478 m2 / 5,145 sqft\n\nFactory Area: 4,205 m2 / 45,262 sqft\n\nRear Road : 30 ft wide\n\nOpen Space for Front : 50 ft\n\nHeight : 12.2 m / 40 ft\n\nFloor Loading : 4 ton/m2\n\nPower Supply : 1000 amp\n\nLoading Dock : No\n\nFactory Category : Light Industrial\n\nCF/CCC : Obtained\n\nAutomatic Sprinkler System : Yes\n\nNumber of MS. Sliding Door : 8 Nos\n\nCurrent Status: Tenanted\n\nFeatures & Access:\n\u2022 Well connected to Port Klang\n\u2022 Well kept factory\n\u2022 Easy access to Shah Alam Highway (KESAS) and SKVE"
  }
];

// Auto-sync with Cloudflare Worker KV API on page load for all public pages & visitors
(async function syncLiveProperties() {
  try {
    const res = await fetch('https://zaimrosli-worker.huzaimrosli.workers.dev/api/properties?t=' + Date.now());
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        window.PROPERTIES_DATA = data;
        if (typeof PROPERTIES_DATA !== 'undefined' && Array.isArray(PROPERTIES_DATA)) {
          PROPERTIES_DATA.length = 0;
          PROPERTIES_DATA.push(...data);
        }
        window.dispatchEvent(new CustomEvent('properties-updated', { detail: data }));
      }
    }
  } catch (e) {
    console.warn('Live KV sync warning:', e);
  }
})();
