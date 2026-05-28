const PRODUCTS_URL = 'products.json';

let products = [];
let cart = JSON.parse(localStorage.getItem('cart') || '{}');

const $ = sel => document.querySelector(sel);
const $$ = sel => Array.from(document.querySelectorAll(sel));

async function loadProducts(){
  const res = await fetch(PRODUCTS_URL);
  products = await res.json();
  renderProducts(products);
}

function renderProducts(list){
  const container = document.getElementById('products');
  container.innerHTML = '';
  list.forEach(p=>{
    const card = document.createElement('article');
    card.className = 'card';
    card.innerHTML = `
      <img src="${p.image}" alt="${p.name}">
      <h3>${p.name}</h3>
      <div class="price">${p.price.toFixed(2)} د.ج</div>
      <button data-id="${p.id}">أضف إلى السلة</button>
    `;
    card.querySelector('button').addEventListener('click', ()=> addToCart(p.id));
    container.appendChild(card);
  });
}

function addToCart(id){
  cart[id] = (cart[id]||0) + 1;
  saveCart();
  renderCart();
}

function saveCart(){
  localStorage.setItem('cart', JSON.stringify(cart));
}

function renderCart(){
  const itemsDiv = document.getElementById('cart-items');
  itemsDiv.innerHTML = '';
  let total = 0;
  Object.keys(cart).forEach(id=>{
    const qty = cart[id];
    const p = products.find(x=>String(x.id) === String(id));
    if(!p) return;
    total += p.price * qty;
    const el = document.createElement('div');
    el.className = 'cart-item';
    el.innerHTML = `
      <img src="${p.image}" alt="${p.name}">
      <div class="meta">
        <div>${p.name}</div>
        <div>${p.price.toFixed(2)} د.ج × ${qty}</div>
      </div>
      <div>
        <button data-op="inc" data-id="${id}">+</button>
        <button data-op="dec" data-id="${id}">−</button>
      </div>
    `;
    itemsDiv.appendChild(el);
  });
  document.getElementById('cart-total').textContent = total.toFixed(2);
  document.getElementById('cart-count').textContent = Object.values(cart).reduce((a,b)=>a+b,0);
}

function changeQty(id, delta){
  if(!cart[id]) return;
  cart[id] += delta;
  if(cart[id] <= 0) delete cart[id];
  saveCart();
  renderCart();
}

function clearCart(){ cart = {}; saveCart(); renderCart(); }

function toggleCart(){
  const c = document.getElementById('cart');
  c.classList.toggle('hidden');
}

function openCheckout(){
  document.getElementById('checkout-modal').classList.remove('hidden');
}
function closeCheckout(){
  document.getElementById('checkout-modal').classList.add('hidden');
}

function finalizeOrder(details){
  // Mock order processing
  console.log('Order', {details, cart});
  alert('تم استلام الطلب. شكرًا لشرائك!');
  clearCart();
  closeCheckout();
}

// Event wiring
window.addEventListener('DOMContentLoaded', async ()=>{
  await loadProducts();
  renderCart();

  document.getElementById('cart-toggle').addEventListener('click', toggleCart);
  document.getElementById('clear-cart').addEventListener('click', clearCart);
  document.getElementById('checkout').addEventListener('click', ()=>{
    if(Object.keys(cart).length===0){ alert('السلة فارغة'); return; }
    openCheckout();
  });

  document.getElementById('cart-items').addEventListener('click', e=>{
    const id = e.target.dataset.id;
    const op = e.target.dataset.op;
    if(!id || !op) return;
    if(op==='inc') changeQty(id, 1);
    if(op==='dec') changeQty(id, -1);
  });

  document.getElementById('cancel-checkout').addEventListener('click', closeCheckout);
  document.getElementById('checkout-form').addEventListener('submit', e=>{
    e.preventDefault();
    const form = new FormData(e.target);
    const details = Object.fromEntries(form.entries());
    finalizeOrder(details);
  });

  document.getElementById('search').addEventListener('input', e=>{
    const q = e.target.value.trim().toLowerCase();
    if(!q) return renderProducts(products);
    renderProducts(products.filter(p=>p.name.toLowerCase().includes(q)));
  });
});
