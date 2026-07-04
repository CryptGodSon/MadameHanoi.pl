'use strict';

/* ---------- nav: tło po przewinięciu ---------- */
const nav = document.getElementById('nav');
addEventListener('scroll', () => {
  nav.classList.toggle('solid', scrollY > 40);
}, { passive: true });

/* ---------- hero: żarzące się lampiony (canvas) ---------- */
(function () {
  const canvas = document.getElementById('embers');
  const ctx = canvas.getContext('2d');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let W, H, parts = [];

  function resize() {
    W = canvas.width = canvas.offsetWidth;
    H = canvas.height = canvas.offsetHeight;
  }
  resize();
  addEventListener('resize', resize);

  const N = 90;
  for (let i = 0; i < N; i++) {
    parts.push({
      x: Math.random(), y: Math.random(),
      r: 0.6 + Math.random() * 2.2,
      s: 0.12 + Math.random() * 0.5,          // prędkość unoszenia
      w: Math.random() * Math.PI * 2,          // faza kołysania
      hue: 30 + Math.random() * 22,            // złoto-pomarańcz
      a: 0.15 + Math.random() * 0.5
    });
  }

  function tick() {
    ctx.clearRect(0, 0, W, H);
    ctx.globalCompositeOperation = 'lighter';
    for (const p of parts) {
      p.y -= p.s / H;
      p.w += 0.01;
      if (p.y < -0.05) { p.y = 1.05; p.x = Math.random(); }
      const x = p.x * W + Math.sin(p.w) * 14;
      const y = p.y * H;
      const g = ctx.createRadialGradient(x, y, 0, x, y, p.r * 5);
      g.addColorStop(0, `hsla(${p.hue},85%,65%,${p.a})`);
      g.addColorStop(1, 'hsla(30,85%,60%,0)');
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(x, y, p.r * 5, 0, 7);
      ctx.fill();
    }
    requestAnimationFrame(tick);
  }
  if (!reduced) requestAnimationFrame(tick);
})();

/* ---------- reveal przy przewijaniu ---------- */
const io = new IntersectionObserver(es => {
  es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
}, { threshold: 0.12 });
document.querySelectorAll('.rv').forEach(el => io.observe(el));

/* ---------- lightbox (galeria + karty menu) ---------- */
const lb = document.getElementById('lb');
const lbImg = lb.querySelector('img');
const lbCap = lb.querySelector('.lb-cap');
let list = [], idx = 0;

const galLinks = [...document.querySelectorAll('#gal a')];
const galList = galLinks.map(a => ({ src: a.getAttribute('href'), cap: a.dataset.t }));
const cardsList = Array.from({ length: 10 }, (_, i) => ({
  src: `img/menu-${String(i + 1).padStart(2, '0')}.jpg`,
  cap: `Karta menu — strona ${i + 1} / 10`
}));

function show(i) {
  idx = (i + list.length) % list.length;
  lbImg.src = list[idx].src;
  lbCap.textContent = list[idx].cap;
  lb.classList.add('open');
}
galLinks.forEach((a, i) => a.addEventListener('click', e => { e.preventDefault(); list = galList; show(i); }));
document.getElementById('open-cards').addEventListener('click', e => { e.preventDefault(); list = cardsList; show(0); });

lb.querySelector('.lb-x').addEventListener('click', () => lb.classList.remove('open'));
lb.querySelector('.lb-p').addEventListener('click', e => { e.stopPropagation(); show(idx - 1); });
lb.querySelector('.lb-n').addEventListener('click', e => { e.stopPropagation(); show(idx + 1); });
lb.addEventListener('click', e => { if (e.target === lb) lb.classList.remove('open'); });
addEventListener('keydown', e => {
  if (!lb.classList.contains('open')) return;
  if (e.key === 'Escape') lb.classList.remove('open');
  if (e.key === 'ArrowLeft') show(idx - 1);
  if (e.key === 'ArrowRight') show(idx + 1);
});

/* ---------- i18n: PL (domyślnie) / EN ---------- */
const chipDict = {
  'kurczak': 'chicken',
  'wołowina': 'beef',
  'krewetki': 'shrimp',
  'kaczka': 'duck',
  'tofu': 'tofu',
  'dorsz': 'cod',
  'jesiotr': 'sturgeon',
  'wołowa': 'beef salad',
  'mango z krewetkami': 'mango shrimp',
  'pierś kurczaka': 'chicken breast',
  'udko kurczaka': 'chicken thigh',
  'łosoś grillowany': 'grilled salmon',
  'wołowina smażona': 'stir-fried beef',
  'wołowina sốt vang': 'sốt vang beef'
};
const galCapsEN = {
  'img/goi-cuon.jpg': 'Gỏi Cuốn — fresh spring rolls',
  'img/combo-madame.jpg': 'Combo Madame Hà Nội',
  'img/cha-ca.jpg': 'Chả Cá Lã Vọng',
  'img/vit-cuon.jpg': 'Vịt Cuốn Hoisin — sliced duck',
  'img/losos.jpg': 'Grilled salmon',
  'img/kaczka.jpg': 'Roasted duck',
  'img/bun-cha.jpg': 'Bún Chả Hà Nội',
  'img/pho-tron.jpg': 'Phở Trộn',
  'img/com-tho.jpg': 'Cơm Thố — clay pot rice',
  'img/bo-ong-tre.jpg': 'Bò Nướng Ống Tre — beef in bamboo',
  'img/padthai.jpg': 'Pad Thai with shrimps',
  'img/tom-chien-com.jpg': 'Tôm Chiên Cốm — green-rice shrimps'
};
const pageTitles = {
  pl: 'Madame Hanoi — Restauracja Wietnamska · Warszawa, Chmielna 6',
  en: 'Madame Hanoi — Vietnamese Restaurant · Warsaw, Chmielna 6'
};

// zrzut oryginałów PL, żeby dało się wrócić z EN
document.querySelectorAll('[data-en]').forEach(el => { el.dataset.pl = el.innerHTML; });
const chipSpans = [...document.querySelectorAll('.mi-var span')].map(s => ({
  node: s.firstChild, pl: s.firstChild.nodeValue.trim()
}));
const emUnits = [...document.querySelectorAll('.mi-name em')].map(e => ({ el: e, pl: e.textContent }));
const priceEls = [...document.querySelectorAll('.mi-price')].map(e => ({ el: e, pl: e.textContent }));

function setLang(l) {
  const en = l === 'en';
  document.documentElement.lang = l;
  document.body.classList.toggle('en', en);
  document.querySelectorAll('[data-en]').forEach(el => {
    el.innerHTML = en ? el.dataset.en : el.dataset.pl;
  });
  chipSpans.forEach(c => { c.node.nodeValue = (en ? (chipDict[c.pl] || c.pl) : c.pl) + ' '; });
  emUnits.forEach(u => { u.el.textContent = en ? u.pl.replace('szt.', 'pcs') : u.pl; });
  priceEls.forEach(p => { p.el.textContent = en ? p.pl.replace('od ', 'from ') : p.pl; });
  galList.forEach((g, i) => { g.cap = en ? (galCapsEN[g.src] || g.cap) : galLinks[i].dataset.t; });
  cardsList.forEach((c, i) => {
    c.cap = en ? `Menu card — page ${i + 1} / 10` : `Karta menu — strona ${i + 1} / 10`;
  });
  document.title = pageTitles[l];
  document.getElementById('lang-pl').classList.toggle('on', !en);
  document.getElementById('lang-en').classList.toggle('on', en);
  if (lb.classList.contains('open') && list[idx]) lbCap.textContent = list[idx].cap;
  try { localStorage.setItem('mh-lang', l); } catch (e) { /* tryb prywatny */ }
}
document.getElementById('lang-pl').addEventListener('click', () => setLang('pl'));
document.getElementById('lang-en').addEventListener('click', () => setLang('en'));

let savedLang = 'pl';
try { savedLang = localStorage.getItem('mh-lang') || 'pl'; } catch (e) { /* domyślnie PL */ }
if (savedLang === 'en') setLang('en');
