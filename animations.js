// Pure UI polish – does not touch your Supabase logic in app.js
const $ = (s, r = document) => r.querySelector(s);

// 1) Hero headline: word-by-word reveal
const h1 = $('.hero h1');
if (h1) {
  h1.innerHTML = h1.textContent.trim().split(/\s+/)
    .map((w, i) => `<span class="w"><span style="--i:${i}">${w}</span></span>`).join(' ');
}

// 2) Button ripple
document.addEventListener('click', e => {
  const b = e.target.closest('.btn');
  if (!b) return;
  const r = b.getBoundingClientRect(), d = Math.max(r.width, r.height);
  const s = document.createElement('span');
  s.className = 'ripple';
  s.style.cssText = `width:${d}px;height:${d}px;left:${e.clientX - r.left - d / 2}px;top:${e.clientY - r.top - d / 2}px`;
  b.appendChild(s);
  setTimeout(() => s.remove(), 700);
});

// 3) Cursor-follow glow on cards
document.addEventListener('pointermove', e => {
  const c = e.target.closest('.card');
  if (!c) return;
  const r = c.getBoundingClientRect();
  c.style.setProperty('--mx', e.clientX - r.left + 'px');
  c.style.setProperty('--my', e.clientY - r.top + 'px');
});

// 4) Count-up on stats whenever app.js updates them
function countUp(el) {
  if (el.textContent === el.dataset.shown) return;          // our own write -> ignore
  const m = el.textContent.match(/^([\d.]+)(.*)$/);
  if (!m) return;
  const target = el.textContent, to = parseFloat(m[1]), tail = m[2];
  const dec = (m[1].split('.')[1] || '').length;
  const from = el.dataset.tail === tail ? parseFloat(el.dataset.last || 0) : 0;
  const t0 = performance.now(), dur = 900;
  const id = (el._id = (el._id || 0) + 1);
  (function tick(t) {
    if (id !== el._id) return;                              // newer update took over
    const p = Math.min((t - t0) / dur, 1);
    const v = from + (to - from) * (1 - Math.pow(1 - p, 4));
    const txt = p < 1 ? v.toFixed(dec) + tail : target;
    el.dataset.shown = txt; el.textContent = txt;
    if (p < 1) requestAnimationFrame(tick);
    else { el.dataset.last = to; el.dataset.tail = tail; }
  })(t0);
}
['statFiles', 'statSize'].forEach(id => {
  const el = document.getElementById(id);
  if (el) new MutationObserver(() => countUp(el)).observe(el, { childList: true, characterData: true, subtree: true });
});

// 5) Stagger index for file rows + shake on error messages
const list = document.getElementById('fileList');
if (list) new MutationObserver(() =>
  [...list.children].forEach((li, i) => li.style.setProperty('--n', Math.min(i, 12)))
).observe(list, { childList: true });

document.querySelectorAll('.msg').forEach(m =>
  new MutationObserver(() => {
    if (!m.classList.contains('error')) return;
    m.classList.remove('shake'); void m.offsetWidth; m.classList.add('shake');
  }).observe(m, { childList: true, characterData: true, subtree: true })
);

// 6) Background parallax (mouse on desktop, gentle tilt follow on touch)
const bg = document.querySelector('.bg');
if (bg && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
  addEventListener('pointermove', e => {
    bg.style.setProperty('--px', (e.clientX / innerWidth - .5) * 2);
    bg.style.setProperty('--py', (e.clientY / innerHeight - .5) * 2);
  });
}
