const fs = require('fs');
const { JSDOM } = require('jsdom');

const html = fs.readFileSync('index.html', 'utf8');
const errores = [];

const dom = new JSDOM(html, {
  runScripts: 'dangerously',
  pretendToBeVisual: true,
  url: 'https://ronaldobtc-code.github.io/mcu-tracker/',
  beforeParse(w) {
    w.fetch = () => Promise.reject(new Error('red desactivada en la prueba'));
    w.matchMedia = () => ({ matches: false, addEventListener() {}, removeEventListener() {} });
    w.IntersectionObserver = class { observe() {} unobserve() {} disconnect() {} };
    w.ResizeObserver = class { observe() {} unobserve() {} disconnect() {} };
    w.requestAnimationFrame = cb => setTimeout(cb, 0);
    // jsdom no implementa scrollIntoView ni matchMedia completos
    w.Element.prototype.scrollIntoView = function () {};
    w.scrollTo = function () {};
    w.HTMLCanvasElement.prototype.getContext = function () { return null; };
    w.onerror = (msg, src, l, c, err) => { errores.push('ERROR: ' + msg + ' (linea ' + l + ')'); };
    w.addEventListener('unhandledrejection', () => {});
  }
});

setTimeout(() => {
  const d = dom.window.document;
  const filas = d.querySelectorAll('.row').length;
  const fases = d.querySelectorAll('.sec-block').length;
  const opsPais = d.querySelectorAll('#cbRegion option').length;
  const opsIdioma = d.querySelectorAll('#cbLang option').length;
  const done = d.getElementById('s-done') ? d.getElementById('s-done').textContent : '?';
  const total = d.getElementById('s-total') ? d.getElementById('s-total').textContent : '?';

  console.log('errores de arranque: ' + (errores.length ? errores.join(' | ') : 'ninguno'));
  console.log('filas renderizadas: ' + filas);
  console.log('bloques de fase: ' + fases);
  console.log('opciones de pais: ' + opsPais);
  console.log('opciones de idioma: ' + opsIdioma);
  console.log('stats  vistos=' + done + '  total=' + total);

  const ok = !errores.length && filas > 60 && fases > 4 && opsPais > 40 && opsIdioma === 6;
  console.log(ok ? '\nARRANCA CORRECTAMENTE' : '\nSIGUE ROTO');
  process.exit(ok ? 0 : 1);
}, 1500);
