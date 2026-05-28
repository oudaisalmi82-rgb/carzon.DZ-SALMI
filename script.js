const partsDatabase = [
  {
    id: 1,
    name: 'فلتر هواء تويوتا كامري',
    oem: '17801-0P010',
    brand: 'تويوتا',
    model: 'كامري',
    year: '2021',
    engine: '2.5L',
    price: 520,
    condition: 'new',
    stock: 12,
    images: ['https://images.unsplash.com/photo-1514894789139-19bf4a0723e7?auto=format&fit=crop&w=800&q=80'],
    compatibility: ['تويوتا كامري 2021', 'تويوتا فالون 2021'],
  },
  {
    id: 2,
    name: 'شمعة ناسا للسيارة',
    oem: '90919-01247',
    brand: 'تويوتا',
    model: 'كورولا',
    year: '2020',
    engine: '1.8L',
    price: 80,
    condition: 'new',
    stock: 28,
    images: ['https://images.unsplash.com/photo-1612406076474-3bad28a5ee96?auto=format&fit=crop&w=800&q=80'],
    compatibility: ['تويوتا كورولا 2020', 'تويوتا ياريس 2020'],
  },
  {
    id: 3,
    name: 'طقم فرامل خلفي BMW X5',
    oem: '34216787483',
    brand: 'BMW',
    model: 'X5',
    year: '2022',
    engine: '3.0L',
    price: 1150,
    condition: 'used',
    stock: 4,
    images: ['https://images.unsplash.com/photo-1581091215367-6c1d41f6cff8?auto=format&fit=crop&w=800&q=80'],
    compatibility: ['BMW X5 2022', 'BMW X6 2022'],
  },
  {
    id: 4,
    name: 'مرشح زيت شفروليه كروز',
    oem: '12633470',
    brand: 'شفروليه',
    model: 'كروز',
    year: '2019',
    engine: '1.4L',
    price: 210,
    condition: 'new',
    stock: 0,
    images: ['https://images.unsplash.com/photo-1599934106343-93a4a46f34d7?auto=format&fit=crop&w=800&q=80'],
    compatibility: ['شفروليه كروز 2019'],
  },
];

const vinMappings = {
  'JTDBR32E820123456': { brand: 'تويوتا', model: 'كورولا', year: '2020', engine: '1.8L' },
  '1G1BE5SM5J7123456': { brand: 'شفروليه', model: 'كروز', year: '2019', engine: '1.4L' },
  'WBAFY7C55JDC12345': { brand: 'BMW', model: 'X5', year: '2022', engine: '3.0L' },
};

const catalog = {
  'تويوتا': {
    'كورولا': { '2020': ['1.8L'], '2021': ['1.8L', '2.5L'] },
    'كامري': { '2021': ['2.5L'] },
  },
  'شفروليه': {
    'كروز': { '2019': ['1.4L'] },
    'كورفيت': { '2023': ['V8'] },
  },
  'BMW': {
    'X5': { '2022': ['3.0L'] },
  },
};

const brandSelect = document.getElementById('brandSelect');
const modelSelect = document.getElementById('modelSelect');
const yearSelect = document.getElementById('yearSelect');
const engineSelect = document.getElementById('engineSelect');
const searchBtn = document.getElementById('searchBtn');
const vinInput = document.getElementById('vinInput');
const vinScanBtn = document.getElementById('vinScanBtn');
const searchStatus = document.getElementById('searchStatus');
const productGrid = document.getElementById('productGrid');
const conditionFilter = document.getElementById('conditionFilter');
const stockFilter = document.getElementById('stockFilter');
const brandFilter = document.getElementById('brandFilter');
const maxPriceFilter = document.getElementById('maxPriceFilter');

function populateSelect(select, values, placeholder) {
  select.innerHTML = `<option value="">${placeholder}</option>` + values.map(value => `<option value="${value}">${value}</option>`).join('');
}

function populateBrandList() {
  const brands = Object.keys(catalog);
  populateSelect(brandSelect, brands, 'اختر شركة');
  populateSelect(brandFilter, ['all', ...brands], 'الكل');
}

function updateModelOptions() {
  const brand = brandSelect.value;
  if (!brand) {
    modelSelect.innerHTML = '<option value="">اختر الموديل</option>';
    yearSelect.innerHTML = '<option value="">اختر السنة</option>';
    engineSelect.innerHTML = '<option value="">اختر المحرك</option>';
    modelSelect.disabled = yearSelect.disabled = engineSelect.disabled = true;
    return;
  }
  const models = Object.keys(catalog[brand]);
  populateSelect(modelSelect, models, 'اختر الموديل');
  modelSelect.disabled = false;
  yearSelect.disabled = engineSelect.disabled = true;
  yearSelect.innerHTML = '<option value="">اختر السنة</option>';
  engineSelect.innerHTML = '<option value="">اختر المحرك</option>';
}

function updateYearOptions() {
  const brand = brandSelect.value;
  const model = modelSelect.value;
  if (!brand || !model) {
    yearSelect.innerHTML = '<option value="">اختر السنة</option>';
    engineSelect.innerHTML = '<option value="">اختر المحرك</option>';
    yearSelect.disabled = engineSelect.disabled = true;
    return;
  }
  const years = Object.keys(catalog[brand][model]);
  populateSelect(yearSelect, years, 'اختر السنة');
  yearSelect.disabled = false;
  engineSelect.disabled = true;
  engineSelect.innerHTML = '<option value="">اختر المحرك</option>';
}

function updateEngineOptions() {
  const brand = brandSelect.value;
  const model = modelSelect.value;
  const year = yearSelect.value;
  if (!brand || !model || !year) {
    engineSelect.innerHTML = '<option value="">اختر المحرك</option>';
    engineSelect.disabled = true;
    return;
  }
  const engines = catalog[brand][model][year];
  populateSelect(engineSelect, engines, 'اختر المحرك');
  engineSelect.disabled = false;
}

function renderProducts(products) {
  if (!products.length) {
    productGrid.innerHTML = '<div class="empty-state"><p>لا توجد نتائج مطابقة. حاول تغيير الفلاتر و استخدام VIN مختلف.</p></div>';
    return;
  }

  productGrid.innerHTML = products.map(product => {
    const stockBadge = product.stock > 0 ? 'in-stock' : 'out-stock';
    const stockText = product.stock > 0 ? 'متوفر' : 'غير متوفر';
    const conditionBadge = product.condition === 'new' ? 'new' : 'used';
    return `
      <article class="product-card">
        <img src="${product.images[0]}" alt="${product.name}">
        <div class="card-body">
          <h4 class="card-title">${product.name}</h4>
          <div class="card-meta">
            <span class="badge ${conditionBadge}">${product.condition === 'new' ? 'جديد' : 'مستعمل'}</span>
            <span class="badge ${stockBadge}">${stockText}</span>
          </div>
          <div class="card-meta">
            <span>OEM: ${product.oem}</span>
            <span>سنة: ${product.year}</span>
          </div>
          <div class="card-price">${product.price} د.ج</div>
          <div class="compatibility">
            <h5>قائمة التوافق</h5>
            <ul>${product.compatibility.map(item => `<li>${item}</li>`).join('')}</ul>
          </div>
        </div>
      </article>
    `;
  }).join('');
}

function loadBrandFilterOptions() {
  const brands = new Set(partsDatabase.map(item => item.brand));
  const options = ['all', ...brands];
  populateSelect(brandFilter, options, 'الكل');
}

function applyFilters() {
  let filtered = [...partsDatabase];

  const condition = conditionFilter.value;
  if (condition !== 'all') {
    filtered = filtered.filter(item => item.condition === condition);
  }

  const stock = stockFilter.value;
  if (stock !== 'all') {
    filtered = filtered.filter(item => stock === 'in' ? item.stock > 0 : item.stock === 0);
  }

  const brand = brandFilter.value;
  if (brand !== 'all') {
    filtered = filtered.filter(item => item.brand === brand);
  }

  const maxPrice = Number(maxPriceFilter.value);
  if (maxPrice > 0) {
    filtered = filtered.filter(item => item.price <= maxPrice);
  }

  renderProducts(filtered);
}

function searchParts() {
  const brand = brandSelect.value;
  const model = modelSelect.value;
  const year = yearSelect.value;
  const engine = engineSelect.value;

  if (!brand || !model || !year || !engine) {
    searchStatus.textContent = 'يرجى إكمال جميع الحقول قبل البحث.';
    return;
  }

  searchStatus.textContent = '';
  const matched = partsDatabase.filter(item =>
    item.brand === brand && item.model === model && item.year === year && item.engine === engine
  );

  renderProducts(matched);
}

function scanVinCode() {
  const vin = vinInput.value.trim().toUpperCase();
  if (!vin) {
    searchStatus.textContent = 'يرجى إدخال رقم VIN.';
    return;
  }

  const match = vinMappings[vin];
  if (!match) {
    searchStatus.textContent = 'لم يتم العثور على تطابق VIN. حاول رقمًا آخر.';
    return;
  }

  searchStatus.textContent = `تم تحديد السيارة: ${match.brand} ${match.model} ${match.year} ${match.engine}`;
  brandSelect.value = match.brand;
  updateModelOptions();
  modelSelect.value = match.model;
  updateYearOptions();
  yearSelect.value = match.year;
  updateEngineOptions();
  engineSelect.value = match.engine;
}

brandSelect.addEventListener('change', () => {
  updateModelOptions();
  searchStatus.textContent = '';
});
modelSelect.addEventListener('change', () => {
  updateYearOptions();
  searchStatus.textContent = '';
});
yearSelect.addEventListener('change', () => {
  updateEngineOptions();
  searchStatus.textContent = '';
});
searchBtn.addEventListener('click', searchParts);
vinScanBtn.addEventListener('click', scanVinCode);
conditionFilter.addEventListener('change', applyFilters);
stockFilter.addEventListener('change', applyFilters);
brandFilter.addEventListener('change', applyFilters);
maxPriceFilter.addEventListener('input', applyFilters);

populateBrandList();
loadBrandFilterOptions();
renderProducts(partsDatabase);
