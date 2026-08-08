const fs = require('fs');
const { JSDOM } = require('jsdom');
const html = fs.readFileSync(process.argv[2] || 'index.html', 'utf8');
const err = [];

console.log('=== 1. PESO Y ESTRUCTURA ===');
console.log('peso: ' + (html.length / 1024).toFixed(1) + ' KB');
console.log('lineas: ' + html.split('\n').length);

console.log('\n=== 2. SEGURIDAD ===');
const sec = {
  'sin clave secreta': !/sb_secret/.test(html),
  'sin service_role': !/service_role/.test(html),
  'clave publica correcta': /sb_publishable_/.test(html),
  'sin enlaces pirata': !/(putlocker|123movies|fmovies|cuevana|pelisplus)/i.test(html),
  'atribucion TMDB': /no esta avalado ni certificado|not endorsed or certified/i.test(html),
  'aviso no oficial': /Sin relacion con Marvel/i.test(html),
  'sin hosting de video': /no aloja ni reproduce/i.test(html)
};
for (const k in sec) console.log((sec[k] ? 'OK   ' : 'FALLA ') + k);

const dom = new JSDOM(html, {
  runScripts: 'dangerously', pretendToBeVisual: true,
  url: 'https://ronaldobtc-code.github.io/mcu-tracker/',
  beforeParse(w) {
    w.fetch = () => Promise.reject(new Error('sin red'));
    w.matchMedia = () => ({ matches: false, addEventListener() {}, removeEventListener() {} });
    w.IntersectionObserver = class { observe() {} unobserve() {} disconnect() {} };
    w.ResizeObserver = class { observe() {} unobserve() {} disconnect() {} };
    w.requestAnimationFrame = cb => setTimeout(cb, 0);
    w.onerror = (m, s, l) => err.push(m + ' (linea ' + l + ')');
    w.addEventListener('unhandledrejection', () => {});
  }
});

setTimeout(() => {
  const w = dom.window, d = w.document;
  console.log('\n=== 3. ARRANQUE ===');
  console.log('errores: ' + (err.length ? err.join(' | ') : 'ninguno'));
  console.log('filas: ' + d.querySelectorAll('.row').length);
  console.log('fases: ' + d.querySelectorAll('.sec-block').length);
  console.log('paises: ' + d.querySelectorAll('#cbRegion option').length);
  console.log('idiomas: ' + d.querySelectorAll('#cbLang option').length);

  console.log('\n=== 4. DATOS ===');
  const L = eval(html.slice(html.indexOf('const LIST = ['), html.indexOf('\n];') + 2).replace('const LIST =', ''));
  const niv = {}; L.forEach(m => niv[m.imp] = (niv[m.imp] || 0) + 1);
  console.log('titulos: ' + L.length + '  ' + JSON.stringify(niv));
  const ids = L.map(m => m.id);
  console.log('ids duplicados: ' + (ids.filter((x, i) => ids.indexOf(x) !== i).join(',') || 'ninguno'));
  const ti = L.map(m => m.title);
  console.log('titulos duplicados: ' + (ti.filter((x, i) => ti.indexOf(x) !== i).join(',') || 'ninguno'));
  console.log('campos incompletos: ' + L.filter(m => !m.id || !m.title || !m.phase || !m.imp || !m.year).length);

  console.log('\n=== 5. MODULOS ===');
  ['Lang', 'Titles', 'Guide', 'WorldMap', 'ZoomMap', 'Places', 'Reviews', 'Backdrop', 'Analytics', 'Region', 'Providers', 'CloudSync']
    .forEach(m => console.log((w[m] ? 'OK   ' : 'FALLA ') + m));

  console.log('\n=== 6. IDIOMAS ===');
  ['es', 'en', 'pt', 'ru', 'fr', 'de'].forEach(l => {
    w.Lang.set(l);
    const bt = d.querySelector('.fb[data-f="all"]').textContent;
    const mp = d.getElementById('mapOpen').textContent;
    console.log((bt && mp ? 'OK   ' : 'FALLA ') + l + '  "' + bt + '" / "' + mp + '"');
  });
  w.Lang.set('es');

  console.log('\n=== 7. ACCESIBILIDAD ===');
  const imgs = d.querySelectorAll('img');
  const sinAlt = [...imgs].filter(i => !i.getAttribute('alt')).length;
  console.log('imagenes sin alt: ' + sinAlt + ' de ' + imgs.length);
  console.log('lang del documento: ' + d.documentElement.lang);
  console.log('botones sin texto: ' + [...d.querySelectorAll('button')].filter(b => !b.textContent.trim() && !b.getAttribute('aria-label')).length);

  const todoOk = !err.length && !sinAlt && L.length > 80;
  console.log(todoOk ? '\n>>> AUDITORIA OK' : '\n>>> REVISAR');
}, 1800);
