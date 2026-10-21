// Calculadora Avícola RM · interfaz
import { DEFAULTS, CATEGORIAS, compute, semaforo, diagnostico } from './calc.js';

/* ---------- Estado guardado en el celular ---------- */
const KEY = 'calculadora-avicola-rm-v1';
const SET_DEF = { granja: 'Mi granja', nombre: '', moneda: 'COP $', linea: 'Babcock Brown', tema: 'dark', listo: false };
const MONEDAS = { 'COP $': '$', 'USD US$': 'US$', 'MXN $': '$', 'PEN S/': 'S/', 'VES Bs': 'Bs', 'BOB Bs': 'Bs', 'ARS $': '$', 'CLP $': '$', 'GTQ Q': 'Q', 'DOP RD$': 'RD$', 'Otra': '' };
const LINEAS = ['Babcock Brown', 'Hy-Line Brown', 'Lohmann Brown', 'ISA Brown', 'Hy-Line W-36', 'Otra'];
const WHATSAPP_RM = '573229521224';
const WHATSAPP_AVES = '573145182016';
const POSTURA_URL = 'https://rm-postura.expo.app/?src=calculadora';
const POSTURA_DEMO = 'https://rm-postura.expo.app/demo?src=calculadora';
const CURSOS_URL = 'https://pay.hotmart.com/I104270666R?off=ovjoq7m4&src=calculadora';
const APP_URL = 'https://marjotelles-png.github.io/calculadora-avicola-rm/';
const REDES = [
  { id: 'instagram', nombre: 'Instagram', usuario: '@rmagroinversiones', url: 'https://www.instagram.com/rmagroinversiones/' },
  { id: 'facebook', nombre: 'Facebook', usuario: 'RM Agroinversiones', url: 'https://www.facebook.com/576620952207601' },
  { id: 'youtube', nombre: 'YouTube', usuario: 'RM Agroinversiones', url: 'https://www.youtube.com/channel/UCsc1Qw4T6Btqvdwoixju0IA?sub_confirmation=1' },
  { id: 'tiktok', nombre: 'TikTok', usuario: '@rmagroinversiones', url: 'https://www.tiktok.com/@rmagroinversiones' },
];
const TEXTO_COMPARTIR = `🐔 Mira esta calculadora GRATIS para gallinas ponedoras de RM Agroinversiones: postura, alimento, costo por cubeta y ganancia en segundos. Se instala en el celular: ${APP_URL}?src=compartido`;

function load() {
  try {
    const s = JSON.parse(localStorage.getItem(KEY) || '{}');
    return { values: s.values || {}, settings: { ...SET_DEF, ...(s.settings || {}) } };
  } catch (e) { return { values: {}, settings: { ...SET_DEF } }; }
}
let state = load();
function save() { try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) { /* sin almacenamiento */ } }
const val = (k) => (k in state.values ? state.values[k] : DEFAULTS[k]);
let R = compute(state.values);
const recompute = () => { R = compute(state.values); };

/* ---------- Formatos ---------- */
const nfCache = {};
const nf = (d) => (nfCache[d] ||= new Intl.NumberFormat('es-CO', { minimumFractionDigits: d, maximumFractionDigits: d }));
function money(x, d = 0) {
  const s = MONEDAS[state.settings.moneda] ?? '';
  return (x < 0 ? '−' : '') + (s ? s + ' ' : '') + nf(d).format(Math.abs(x));
}
function fmt(x, type) {
  if (type === 'text') return x;
  if (x === null || x === undefined || !Number.isFinite(x)) return '—';
  switch (type) {
    case 'int': return nf(0).format(Math.round(x));
    case 'd1': return nf(1).format(x);
    case 'd2': return nf(2).format(x);
    case 'pct': return nf(1).format(x * 100) + ' %';
    case 'money': return money(x);
    case 'money2': return money(x, Math.abs(x) < 1000 ? 2 : 0);
    default: return nf(Number.isInteger(x) ? 0 : 2).format(x);
  }
}
function compact(x) {
  const a = Math.abs(x), s = x < 0 ? '−' : '';
  if (a >= 1e6) return s + nf(2).format(a / 1e6) + ' M';
  if (a >= 1e3) return s + nf(0).format(a / 1e3) + ' mil';
  return s + nf(0).format(a);
}
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
function parseNum(s) {
  s = String(s).trim().replace(/\s|%|\$|[A-Za-z]/g, '');
  if (!s) return NaN;
  if (s.includes(',')) s = s.replace(/\./g, '').replace(',', '.');
  else if (/^\d{1,3}(\.\d{3})+$/.test(s)) s = s.replace(/\./g, '');
  return Number(s);
}

/* ---------- Íconos (trazos propios) ---------- */
const P = {
  home: 'M3 11.5 12 4l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z',
  grid: 'M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z',
  gauge: 'M4.5 18a8.5 8.5 0 1 1 15 0M12 13.5l4-4.5M12 15.5a2 2 0 1 0 0-4 2 2 0 0 0 0 4z',
  sliders: 'M4 6h9M17 6h3M4 12h3M11 12h9M4 18h11M19 18h1M15 4v4M9 10v4M17 16v4',
  egg: 'M12 3c-3.6 0-6.5 5.2-6.5 9.7 0 4.6 2.9 8.3 6.5 8.3s6.5-3.7 6.5-8.3C18.5 8.2 15.6 3 12 3z',
  sack: 'M9 3h6l-1.6 3.2h-2.8zM8.6 7.5C6.4 9.4 5 12.4 5 15.3 5 19 8 21 12 21s7-2 7-5.7c0-2.9-1.4-5.9-3.6-7.8zM9.5 13.5c1.6 1.2 3.4 1.2 5 0',
  coins: 'M12 4.5c3.9 0 7 1.3 7 3s-3.1 3-7 3-7-1.3-7-3 3.1-3 7-3zM5 7.5v4.5c0 1.7 3.1 3 7 3s7-1.3 7-3V7.5M5 12v4.5c0 1.7 3.1 3 7 3s7-1.3 7-3V12',
  spark: 'M5 19 13 11M15 3l1.4 3.1L19.5 7.5 16.4 8.9 15 12l-1.4-3.1-3.1-1.4 3.1-1.4zM6 5l.7 1.6L8.3 7.3 6.7 8 6 9.6 5.3 8l-1.6-.7 1.6-.7z',
  chick: 'M9.3 8.2a2.8 2.8 0 1 1 5.4 0c-.1.6-.4 1.2-.9 1.7 2.6.7 4.7 3 4.7 5.9 0 3-2.9 5.2-6.5 5.2s-6.5-2.2-6.5-5.2c0-2.9 2.1-5.2 4.7-5.9-.5-.5-.8-1.1-.9-1.7zM14.8 7.4l2.2-.6M10.5 7.4h.01',
  layout: 'M4 4h16v16H4zM4 10h16M10 10v10',
  drop: 'M12 3.5c3 3.7 6 7.1 6 10.6a6 6 0 0 1-12 0c0-3.5 3-6.9 6-10.6zM9 15a3 3 0 0 0 3 3',
  pill: 'M10.6 20.4a5 5 0 0 1-7-7l6.8-6.8a5 5 0 0 1 7 7zM8.5 8.5l7 7',
  scale: 'M12 4v16M8 20h8M5.5 7.5h13M5.5 7.5 3 13a2.8 2.8 0 0 0 5 0zM18.5 7.5 16 13a2.8 2.8 0 0 0 5 0zM12 4.5h.01',
  bulb: 'M9 18.5h6M10 21h4M12 3a6 6 0 0 0-3.6 10.8c.7.5 1.1 1.3 1.1 2.2h5c0-.9.4-1.7 1.1-2.2A6 6 0 0 0 12 3z',
  down: 'M3 7l6 6 4-4 8 8M21 11v6h-6',
  cal: 'M4 6h16v14H4zM4 10h16M8 3.5v4M16 3.5v4M8 14h2M14 14h2M8 17h2',
  layers: 'M12 3.5 21 8.5l-9 5-9-5zM3 13l9 5 9-5M3 17l9 5 9-5',
  swap: 'M16.5 3.5 20 7l-3.5 3.5M4 7h16M7.5 20.5 4 17l3.5-3.5M20 17H4',
  bank: 'M3 9.5 12 4l9 5.5M5 10v8M9.7 10v8M14.3 10v8M19 10v8M3 21h18',
  tag: 'M20 12.5 12.5 20a1.4 1.4 0 0 1-2 0L3.5 13V4h9l7.5 7a1.4 1.4 0 0 1 0 1.5zM7.8 7.8h.01',
  brain: 'M9 4.5a3 3 0 0 0-3 3v.3A3 3 0 0 0 4.5 13 3 3 0 0 0 7 17.5 3 3 0 0 0 12 19V5.5A3 3 0 0 0 9 4.5zM15 4.5a3 3 0 0 1 3 3v.3a3 3 0 0 1 1.5 5.2 3 3 0 0 1-2.5 4.5A3 3 0 0 1 12 19',
  info: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM12 11v5M12 7.8h.01',
  alert: 'M12 4 2.5 20h19zM12 10v4M12 17h.01',
  search: 'M11 18a7 7 0 1 0 0-14 7 7 0 0 0 0 14zM20 20l-3.5-3.5',
  back: 'M15 5l-7 7 7 7',
  share: 'M20.5 12a8.5 8.5 0 0 1-12.6 7.4L3.5 20.5l1.2-4.2A8.5 8.5 0 1 1 20.5 12zM8.8 9.3c.3 2.8 3.1 5.6 5.9 5.9l1.2-1.3-1.9-1-1 .8a5 5 0 0 1-2.7-2.7l.8-1-1-1.9z',
  reset: 'M4 12a8 8 0 1 0 2.3-5.6M4 4v4.5h4.5',
  download: 'M12 4v11M7.5 10.5 12 15l4.5-4.5M5 20h14',
  phone: 'M8 3h8a1 1 0 0 1 1 1v16a1 1 0 0 1-1 1H8a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1zM11 18h2',
  trash: 'M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3',
  instagram: 'M7.5 3h9A4.5 4.5 0 0 1 21 7.5v9a4.5 4.5 0 0 1-4.5 4.5h-9A4.5 4.5 0 0 1 3 16.5v-9A4.5 4.5 0 0 1 7.5 3zM12 16a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM17.3 6.7h.01',
  facebook: 'M15 3h-2.5A4.5 4.5 0 0 0 8 7.5V10H5.5v4H8v7h4v-7h3l.7-4H12V7.8c0-.5.3-.8.8-.8H15z',
  youtube: 'M3 8.6A3.6 3.6 0 0 1 6.6 5h10.8A3.6 3.6 0 0 1 21 8.6v6.8a3.6 3.6 0 0 1-3.6 3.6H6.6A3.6 3.6 0 0 1 3 15.4zM10 9.3v5.4l4.6-2.7z',
  heart: 'M12 20s-7.5-4.6-7.5-10A4.2 4.2 0 0 1 12 7.4 4.2 4.2 0 0 1 19.5 10c0 5.4-7.5 10-7.5 10z',
  tiktok: 'M14 3v11.6a3.4 3.4 0 1 1-3.4-3.4M14 3c.6 2.7 2.5 4.5 5.2 4.7',
};
const ico = (n) => `<svg class="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${P[n]}"/></svg>`;

/* ---------- Definición de las calculadoras ---------- */
const N = (k, label, unit, o = {}) => ({ k, label, unit, type: 'num', step: 1, dec: 0, ...o });
const M = (k, label, o = {}) => ({ k, label, type: 'money', step: 100, dec: 0, ...o });
const PC = (k, label, o = {}) => ({ k, label, type: 'pct', ...o });
const G = (title) => ({ group: title });
const REF = 'Referencia: ajústalo a la guía de tu línea genética.';
const row = (label, value, type, o = {}) => ({ label, value, type, ...o });
const SEM_TXT = { ok: 'Muy bien', warn: 'Atento', bad: 'Revisa' };

const CALCS = [
  {
    id: 'produccion', t: 'Producción', ico: 'egg', d: 'Postura del día, cubetas y kilos de huevo.',
    promo: '¿Quieres guardar tu postura de cada día y ver la curva de tu lote contra el estándar de tu raza?',
    inputs: [N('gallinas', 'Gallinas en el lote', 'aves', { step: 10 }), N('huevos', 'Huevos recogidos hoy', 'huevos', { step: 10 }), N('cubeta', 'Huevos por cubeta', 'huevos'), N('pesoHuevo', 'Peso promedio del huevo', 'g', { dec: 1 })],
    out: (r) => [
      row('Porcentaje de postura', r.produccion.postura, 'pct', { main: 1, sem: semaforo('postura', r.produccion.postura), bar: r.produccion.postura }),
      row('Cubetas del día', r.produccion.cubetas, 'int', { unit: 'cubetas' }),
      row('Huevos sueltos', r.produccion.sueltos, 'int', { unit: 'huevos' }),
      row('Kilos de huevo del día', r.produccion.masaKg, 'd1', { unit: 'kg' }),
      row('Huevos al mes (30 días)', r.produccion.huevosMes, 'int', { unit: 'huevos' }),
      row('Cubetas al mes', r.produccion.cubetasMes, 'd1', { unit: 'cubetas' }),
    ],
  },
  {
    id: 'alimento', t: 'Alimento', ico: 'sack', d: 'Kilos, bultos, costo y conversión.',
    promo: '¿Quieres llevar el inventario de alimento en bodega y tu conversión semana a semana?',
    inputs: [N('gallinas', 'Gallinas en el lote', 'aves', { step: 10 }), N('consumo', 'Consumo por gallina al día', 'g', { note: REF }), N('bultoKg', 'Kilos por bulto', 'kg'), M('precioBulto', 'Precio del bulto', { step: 500 }), N('huevos', 'Huevos al día', 'huevos', { step: 10 }), N('pesoHuevo', 'Peso promedio del huevo', 'g', { dec: 1 })],
    out: (r) => [
      row('Costo del alimento al mes', r.alimento.costoMes, 'money', { main: 1 }),
      row('Kilos de alimento al día', r.alimento.kgDia, 'd1', { unit: 'kg' }),
      row('Bultos al día', r.alimento.bultosDia, 'd2', { unit: 'bultos' }),
      row('Bultos a la semana', r.alimento.bultosSemana, 'd1', { unit: 'bultos' }),
      row('Bultos al mes (30 días)', r.alimento.bultosMes, 'd1', { unit: 'bultos' }),
      row('Costo del alimento al día', r.alimento.costoDia, 'money'),
      row('Conversión: kg de alimento por kg de huevo', r.alimento.conversion, 'd2', { unit: 'kg/kg', sem: semaforo('conversion', r.alimento.conversion) }),
      row('Kilos de alimento por docena', r.alimento.kgDocena, 'd2', { unit: 'kg' }),
      row('Costo de alimento por huevo', r.alimento.costoHuevo, 'money2'),
    ],
  },
  {
    id: 'costos', t: 'Costos y ganancia', ico: 'coins', d: 'Ganancia del mes y precio mínimo de la cubeta.',
    promo: '¿Quieres registrar ventas y gastos reales y ver tu utilidad de cada mes?',
    inputs: [N('gallinas', 'Gallinas en el lote', 'aves', { step: 10 }), PC('postura', 'Postura promedio'), M('precioCubeta', 'Precio de venta de la cubeta'), N('cubeta', 'Huevos por cubeta', 'huevos'),
      M('costoAlimentoMes', 'Costo del alimento al mes', { step: 10000, auto: { from: 'Alimento', get: (r) => r.alimento.costoMes } }),
      M('manoObra', 'Mano de obra al mes', { step: 10000 }), M('sanidad', 'Vacunas, vitaminas y sanidad al mes', { step: 10000 }), M('servicios', 'Energía, agua y transporte al mes', { step: 10000 }), M('otros', 'Otros costos al mes', { step: 10000 }), PC('perdida', 'Huevos rotos o de descarte', { max: 30 })],
    out: (r) => [
      row('Ganancia del mes', r.costos.ganancia, 'money', { main: 1, sem: semaforo('ganancia', r.costos.ganancia) }),
      row('Ingresos al mes', r.costos.ingresos, 'money'),
      row('Costos totales al mes', r.costos.costosTot, 'money'),
      row('Huevos vendibles al mes', r.costos.huevosVend, 'int', { unit: 'huevos' }),
      row('Cubetas vendibles al mes', r.costos.cubetasVend, 'd1', { unit: 'cubetas' }),
      row('Costo por huevo', r.costos.costoHuevo, 'money2'),
      row('Costo por cubeta', r.costos.costoCubeta, 'money'),
      row('Precio mínimo de la cubeta para no perder', r.costos.precioMin, 'money'),
      row('Margen por cubeta', r.costos.margen, 'money'),
      row('Ganancia por gallina al mes', r.costos.gananciaGallina, 'money'),
      row('Postura mínima para no perder', r.costos.posturaMin, 'pct'),
    ],
  },
  {
    id: 'simulador', t: '¿Qué pasa si…?', ico: 'spark', d: 'Simula precios del bulto, de la cubeta y la postura.',
    inputs: [M('precioBulto', 'Precio actual del bulto', { step: 500 }), M('precioCubeta', 'Precio actual de la cubeta'), PC('postura', 'Postura promedio')],
    out: (r) => [row('Ganancia del mes con tus precios', r.costos.ganancia, 'money', { main: 1, sem: semaforo('ganancia', r.costos.ganancia) })],
    extra: simuladorHTML,
    notes: ['Los demás costos de la hoja Costos y ganancia se mantienen iguales.'],
  },
  {
    id: 'levante', t: 'Levante', ico: 'chick', d: 'Cuánto te cuesta cada pollita lista para postura.',
    promo: '¿Quieres llevar el peso de tus pollitas y su plan de vacunas semana a semana?',
    inputs: [N('pollitas', 'Pollitas de un día', 'aves', { step: 10 }), M('precioPollita', 'Precio de la pollita'), N('alimentoLevante', 'Alimento por pollita hasta el traslado', 'kg', { dec: 1, step: 0.1, note: REF }), M('precioKgLevante', 'Precio del kilo de alimento de levante', { step: 50 }), M('vacunasLevante', 'Vacunas y sanidad por pollita', { step: 50 }), M('otrosLevante', 'Otros costos por pollita', { step: 50 }), PC('mortLevante', 'Mortalidad esperada en el levante', { max: 30 })],
    out: (r) => [
      row('Costo por pollita lista', r.levante.costoPollita, 'money', { main: 1 }),
      row('Pollitas que llegan a postura', r.levante.llegan, 'int', { unit: 'aves' }),
      row('Alimento total del levante', r.levante.kg, 'int', { unit: 'kg' }),
      row('Bultos de alimento', r.levante.bultos, 'd1', { unit: 'bultos' }),
      row('Costo total del levante', r.levante.costoTotal, 'money'),
    ],
  },
  {
    id: 'espacio', t: 'Espacio y equipos', ico: 'layout', d: 'Si te cabe el lote y qué equipos necesitas.',
    inputs: [N('largo', 'Largo del galpón', 'm', { dec: 1 }), N('ancho', 'Ancho del galpón', 'm', { dec: 1 }), { k: 'sistema', label: 'Sistema', type: 'seg', options: ['Piso', 'Jaula'] },
      N('avesM2', 'Gallinas por metro cuadrado', 'aves/m²', { dec: 1, note: REF, show: (v) => v.sistema !== 'Jaula' }), N('jaulaCm2', 'Espacio por gallina en jaula', 'cm²', { step: 10, note: REF, show: (v) => v.sistema === 'Jaula' }),
      N('gallinas', 'Gallinas a alojar', 'aves', { step: 10 }), G('Equipos'), N('comederoCm', 'Comedero lineal por gallina', 'cm', { note: REF }), N('tolva', 'Gallinas por comedero de tolva', 'aves', { note: REF }), N('niple', 'Gallinas por niple', 'aves', { note: REF }), N('campana', 'Gallinas por bebedero de campana', 'aves', { step: 5, note: REF }), N('nido', 'Gallinas por nido', 'aves', { note: REF })],
    out: (r) => [
      row('¿Te cabe el lote?', r.espacio.cabe ? `Sí · sobra espacio para ${fmt(r.espacio.sobran, 'int')} gallinas` : `No · te faltan ${fmt(r.espacio.faltanM2, 'd1')} m²`, 'text', { main: 1, sem: semaforo('espacio', r.espacio.cabe) }),
      row('Área del galpón', r.espacio.area, 'd1', { unit: 'm²' }),
      row('Capacidad máxima', r.espacio.capacidad, 'int', { unit: 'aves' }),
      row('Comedero lineal', r.espacio.comedero, 'd1', { unit: 'm' }),
      row('Comederos de tolva', r.espacio.tolvas, 'int', { unit: 'unid.' }),
      row('Niples', r.espacio.niples, 'int', { unit: 'unid.' }),
      row('Bebederos de campana', r.espacio.campanas, 'int', { unit: 'unid.' }),
      row('Nidos', r.espacio.nidos, 'int', { unit: 'unid.' }),
    ],
  },
  {
    id: 'agua', t: 'Agua', ico: 'drop', d: 'Litros al día y tamaño del tanque.',
    inputs: [N('gallinas', 'Gallinas en el lote', 'aves', { step: 10 }), N('consumo', 'Consumo de alimento por gallina', 'g'), N('aguaPorKg', 'Litros de agua por kilo de alimento', 'L', { dec: 1, step: 0.1, note: 'Referencia: con calor sube a 3 o más.' }), N('reservaDias', 'Días de reserva en el tanque', 'días')],
    out: (r) => [
      row('Litros de agua al día', r.agua.litros, 'int', { main: 1, unit: 'L' }),
      row('Por gallina al día', r.agua.porGallinaMl, 'int', { unit: 'ml' }),
      row('Tamaño mínimo del tanque', r.agua.tanque, 'int', { unit: 'L' }),
    ],
  },
  {
    id: 'medicamento', t: 'Medicamento en agua', ico: 'pill', d: 'Cuánto producto poner en el agua.',
    warn: 'Usa siempre la dosis de la etiqueta o la que indique tu veterinario, y respeta el tiempo de retiro de los huevos.',
    inputs: [N('litrosMed', 'Litros de agua que toman al día', 'L', { step: 10, auto: { from: 'Agua', get: (r) => r.agua.litros } }), N('dosisL', 'Dosis de la etiqueta por litro', 'ml o g', { dec: 2, step: 0.1 }), N('diasTratamiento', 'Días de tratamiento', 'días'), N('frasco', 'Contenido del frasco o sobre', 'ml o g', { step: 50 }),
      G('Si la dosis viene por kilo de peso'), N('mgKg', 'Dosis por kilo de peso', 'mg/kg', { dec: 1 }), N('pesoGallina', 'Peso promedio de la gallina', 'kg', { dec: 2, step: 0.05 }), N('gallinas', 'Gallinas a tratar', 'aves', { step: 10 }), N('concentracion', 'Concentración del producto', 'mg por ml o g', { step: 10 })],
    out: (r) => [
      row('Producto al día (por etiqueta)', r.medicamento.productoDia, 'd1', { main: 1, unit: 'ml o g' }),
      row('Producto para todo el tratamiento', r.medicamento.tratamiento, 'd1', { unit: 'ml o g' }),
      row('Frascos o sobres necesarios', r.medicamento.frascos, 'int', { unit: 'unid.' }),
      row('Miligramos al día para el lote (por peso)', r.medicamento.mgDia, 'int', { unit: 'mg' }),
      row('Producto al día (por peso)', r.medicamento.productoPeso, 'd1', { unit: 'ml o g' }),
      row('Producto por litro de agua (por peso)', r.medicamento.porLitro, 'd2', { unit: 'ml o g/L' }),
    ],
  },
  {
    id: 'mezcla', t: 'Mezcla de alimento', ico: 'scale', d: 'Cuánto de cada ingrediente para la proteína que quieres.',
    inputs: [{ k: 'nombreA', label: 'Ingrediente A', type: 'text' }, N('protA', 'Proteína del ingrediente A', '%', { dec: 1, step: 0.5 }), { k: 'nombreB', label: 'Ingrediente B', type: 'text' }, N('protB', 'Proteína del ingrediente B', '%', { dec: 1, step: 0.5 }), N('objetivoProt', 'Proteína que quieres en la mezcla', '%', { dec: 1, step: 0.5 }), N('mezclaKg', 'Kilos de mezcla a preparar', 'kg', { step: 10 })],
    out: (r) => r.mezcla.valida ? [
      row(`Kilos de ${r.v.nombreA || 'A'}`, r.mezcla.kgA, 'd1', { main: 1, unit: 'kg' }),
      row(`Kilos de ${r.v.nombreB || 'B'}`, r.mezcla.kgB, 'd1', { unit: 'kg' }),
      row(`% de ${r.v.nombreA || 'A'}`, r.mezcla.pctA, 'pct'),
      row(`% de ${r.v.nombreB || 'B'}`, r.mezcla.pctB, 'pct'),
      row(`Partes de ${r.v.nombreA || 'A'}`, r.mezcla.partesA, 'd1'),
      row(`Partes de ${r.v.nombreB || 'B'}`, r.mezcla.partesB, 'd1'),
    ] : [row('Revisa los datos', 'La proteína que quieres debe estar entre la del ingrediente A y la del B.', 'text', { main: 1, sem: 'bad' })],
    notes: ['Es una mezcla aproximada por proteína (cuadrado de Pearson). Una ración completa también necesita energía, calcio, fósforo y vitaminas.'],
  },
  {
    id: 'luz', t: 'Luz', ico: 'bulb', d: 'Horas de luz artificial y su costo.',
    inputs: [N('horasLuz', 'Horas de luz total que quieres', 'h', { dec: 1, step: 0.5, note: 'Referencia: 16 h para postura.' }), N('luzNatural', 'Horas de luz natural del día', 'h', { dec: 1, step: 0.5 }), N('bombillos', 'Bombillos', 'unid.'), N('vatios', 'Vatios por bombillo', 'W'), M('precioKwh', 'Precio del kWh', { step: 10 })],
    out: (r) => [
      row('Horas de luz artificial al día', r.luz.artificial, 'd1', { main: 1, unit: 'h' }),
      row('Consumo al día', r.luz.kwh, 'd2', { unit: 'kWh' }),
      row('Costo de la luz al día', r.luz.costoDia, 'money'),
      row('Costo de la luz al mes', r.luz.costoMes, 'money'),
    ],
  },
  {
    id: 'mortalidad', t: 'Mortalidad', ico: 'down', d: 'Mortalidad semanal, acumulada y viabilidad.',
    promo: '¿Quieres registrar las muertes de cada día y recibir alertas si la mortalidad sube?',
    inputs: [N('gallinasInicio', 'Gallinas al inicio del lote', 'aves', { step: 10 }), N('muertesSemana', 'Muertes de esta semana', 'aves'), N('muertesTotal', 'Muertes acumuladas del lote', 'aves')],
    out: (r) => [
      row('Mortalidad acumulada', r.mortalidad.acumulada, 'pct', { main: 1, sem: semaforo('mortalidad', r.mortalidad.acumulada) }),
      row('Mortalidad de la semana', r.mortalidad.semanal, 'pct'),
      row('Gallinas vivas', r.mortalidad.vivas, 'int', { unit: 'aves' }),
      row('Viabilidad', r.mortalidad.viabilidad, 'pct'),
    ],
  },
  {
    id: 'proyeccion', t: 'Proyección del lote', ico: 'cal', d: 'Huevos e ingresos de todo el ciclo.',
    promo: '¿Quieres comparar tu lote real contra esta proyección, semana por semana?',
    inputs: [N('gallinasCiclo', 'Gallinas al iniciar postura', 'aves', { step: 10 }), N('semanas', 'Semanas de postura', 'sem.'), PC('posturaCiclo', 'Postura promedio del ciclo'), PC('mortCiclo', 'Mortalidad esperada en el ciclo', { max: 30 }), M('precioCubeta', 'Precio de la cubeta'), N('cubeta', 'Huevos por cubeta', 'huevos')],
    out: (r) => [
      row('Ingresos del ciclo', r.proyeccion.ingresos, 'money', { main: 1 }),
      row('Huevos del ciclo', r.proyeccion.huevosCiclo, 'int', { unit: 'huevos' }),
      row('Cubetas del ciclo', r.proyeccion.cubetas, 'int', { unit: 'cubetas' }),
      row('Gallinas promedio', r.proyeccion.promedio, 'int', { unit: 'aves' }),
      row('Huevos por gallina', r.proyeccion.porGallina, 'int', { unit: 'huevos' }),
    ],
  },
  {
    id: 'clasificacion', t: 'Clasificación del huevo', ico: 'layers', d: 'Jumbo, AAA, AA, A, B y C: cuánto te deja cada una.',
    promo: '¿Quieres registrar la clasificación de cada día y tus ventas por tamaño?',
    inputs: [G('Huevos del día por categoría'), ...CATEGORIAS.map((c, i) => N('cat' + i, `${c.nombre} · ${c.rango}`, 'huevos', { step: 10 })),
      G('Precio de la cubeta por categoría'), ...CATEGORIAS.map((c, i) => M('pcat' + i, `Cubeta ${c.nombre}`)),
      G('Clasificador'), N('pesoClasificar', 'Peso de un huevo', 'g', { dec: 1 })],
    out: (r) => [
      row('Ingreso del día', r.clasificacion.ingresoTotal, 'money', { main: 1 }),
      row('Total de huevos', r.clasificacion.total, 'int', { unit: 'huevos' }),
      row('Precio promedio por huevo', r.clasificacion.precioHuevo, 'money2'),
      row(`Un huevo de ${fmt(r.v.pesoClasificar, 'd1')} g es`, r.clasificacion.categoria, 'text'),
    ],
    extra: clasificacionHTML,
    notes: ['Rangos de peso de referencia según la NTC 1240; verifica la norma vigente.'],
  },
  {
    id: 'conversiones', t: 'Conversiones', ico: 'swap', d: 'Cubetas, docenas, libras, arrobas y bultos.',
    inputs: [N('convHuevos', 'Huevos', 'huevos', { step: 10 }), N('convCubetas', 'Cubetas', 'cubetas'), N('convKg', 'Kilos', 'kg', { dec: 1, step: 5 }), N('convG', 'Gramos por gallina al día', 'g')],
    out: (r) => [
      row(`${fmt(r.v.convHuevos, 'int')} huevos son`, r.conversiones.cubetas, 'd1', { main: 1, unit: 'cubetas' }),
      row(`${fmt(r.v.convHuevos, 'int')} huevos en docenas`, r.conversiones.docenas, 'd1', { unit: 'docenas' }),
      row(`${fmt(r.v.convCubetas, 'int')} cubetas son`, r.conversiones.huevos, 'int', { unit: 'huevos' }),
      row(`${fmt(r.v.convKg, 'd1')} kg en libras`, r.conversiones.libras, 'd1', { unit: 'lb' }),
      row(`${fmt(r.v.convKg, 'd1')} kg en arrobas`, r.conversiones.arrobas, 'd2', { unit: '@' }),
      row(`${fmt(r.v.convKg, 'd1')} kg en bultos de ${fmt(r.v.bultoKg, 'int')} kg`, r.conversiones.bultos, 'd2', { unit: 'bultos' }),
      row(`${fmt(r.v.convG, 'int')} g por gallina = por cada 1.000 gallinas`, r.conversiones.kgPorMil, 'd1', { unit: 'kg/día' }),
    ],
    notes: ['En Colombia: 1 libra = 0,5 kg y 1 arroba = 12,5 kg. Los huevos por cubeta y los kilos por bulto salen de tus otras calculadoras.'],
  },
  {
    id: 'inversion', t: 'Inversión y retorno', ico: 'bank', d: 'En cuántos meses recuperas lo invertido.',
    inputs: [M('galpon', 'Galpón y adecuaciones', { step: 100000 }), M('equipos', 'Equipos (comederos, bebederos, nidos)', { step: 100000 }), M('pollitasInv', 'Pollitas o gallinas', { step: 100000, auto: { from: 'Levante', get: (r) => r.levante.costoTotal } }), M('capital', 'Capital de trabajo inicial', { step: 100000 }), M('gananciaInv', 'Ganancia mensual esperada', { step: 10000, auto: { from: 'Costos', get: (r) => r.costos.ganancia } })],
    out: (r) => [
      row('Recuperas la inversión en', r.inversion.meses === null ? 'No se recupera con esta ganancia' : `${fmt(r.inversion.meses, 'd1')} meses`, 'text', { main: 1, sem: r.inversion.meses === null ? 'bad' : '' }),
      row('Inversión total', r.inversion.total, 'money'),
      row('Rentabilidad anual sobre la inversión', r.inversion.rentabilidad, 'pct'),
    ],
  },
  {
    id: 'descarte', t: 'Gallina de descarte', ico: 'tag', d: 'Lo que te deja vender las gallinas al final.',
    inputs: [N('gallinasDescarte', 'Gallinas para vender', 'aves', { step: 10 }), N('pesoDescarte', 'Peso promedio', 'kg', { dec: 2, step: 0.05 }), M('precioDescarte', 'Precio del kilo en pie', { step: 100 })],
    out: (r) => [
      row('Ingreso por descarte', r.descarte.ingreso, 'money', { main: 1 }),
      row('Kilos totales', r.descarte.kilos, 'int', { unit: 'kg' }),
      row('Ingreso por gallina', r.descarte.porGallina, 'money'),
    ],
  },
];
const BY_ID = Object.fromEntries(CALCS.map((c) => [c.id, c]));

/* ---------- Bloques especiales ---------- */
function heatColor(t) {
  // rojo -> ámbar -> verde
  const a = [255, 69, 58], b = [255, 176, 32], c = [52, 199, 89];
  const [x, y, k] = t < 0.5 ? [a, b, t / 0.5] : [b, c, (t - 0.5) / 0.5];
  return `rgb(${x.map((v, i) => Math.round(v + (y[i] - v) * k)).join(',')})`;
}
function simuladorHTML(r) {
  const s = r.simulador;
  const all = s.grid.flat(), mn = Math.min(...all), mx = Math.max(...all);
  const head = s.cubetas.map((c) => `<th>${esc(compact(c))}</th>`).join('');
  const body = s.grid.map((fila, i) => `<tr><th class="axis">${esc(compact(s.bultos[i]))}</th>${fila.map((g, j) => `<td class="${i === 2 && j === 2 ? 'cur' : ''}" style="background:${heatColor(mx === mn ? 1 : (g - mn) / (mx - mn))}">${esc(compact(g))}</td>`).join('')}</tr>`).join('');
  const maxAbs = Math.max(...s.posturas.map((x) => Math.abs(x.ganancia)), 1);
  const bars = s.posturas.map((x) => `<div class="hbar"><span>${fmt(x.p, 'pct').replace(',0', '')}</span><span class="track"><i style="left:0;width:${(Math.abs(x.ganancia) / maxAbs) * 100}%;background:${x.ganancia > 0 ? 'var(--ok)' : 'var(--bad)'}"></i></span><b>${esc(compact(x.ganancia))}</b></div>`).join('');
  return `<section class="card"><p class="card-title">${ico('grid')} Ganancia del mes · bulto ↓ y cubeta →</p>
    <table class="heat" aria-label="Ganancia según precio del bulto y de la cubeta"><thead><tr><th></th>${head}</tr></thead><tbody>${body}</tbody></table>
    <p class="muted" style="margin:10px 2px 0">Filas: precio del bulto (−20 % a +20 %). Columnas: precio de la cubeta. El borde dorado es tu caso actual.</p></section>
    <section class="card"><p class="card-title">${ico('egg')} Ganancia del mes según la postura</p>${bars}</section>`;
}
function clasificacionHTML(r) {
  const f = r.clasificacion.filas;
  return `<section class="card"><p class="card-title">${ico('layers')} Cómo se reparten tus huevos</p>${f.map((x) => `<div class="hbar"><span><b>${esc(x.nombre)}</b></span><span class="track"><i style="left:0;width:${x.pct * 100}%;background:linear-gradient(90deg,var(--gold),var(--gold-2))"></i></span><b>${fmt(x.pct, 'pct')}</b></div>`).join('')}
    <div class="results" style="margin-top:10px">${f.map((x) => `<div class="res"><span class="res-label">Ingreso ${esc(x.nombre)}</span><span class="res-val">${esc(fmt(x.ingreso, 'money'))}</span></div>`).join('')}</div></section>`;
}

/* ---------- Componentes de entrada ---------- */
function isVisible(inp) { return !inp.show || inp.show(R.v); }
function inputHTML(inp) {
  if (inp.group) return `<p class="card-title" style="margin:18px 0 4px">${esc(inp.group)}</p>`;
  if (!isVisible(inp)) return '';
  const k = inp.k, note = inp.note ? `<div class="field-note">${esc(inp.note)}</div>` : '';
  if (inp.type === 'seg') {
    return `<div class="field" data-k="${k}"><div class="field-label">${esc(inp.label)}</div><div class="seg" role="group" aria-label="${esc(inp.label)}">${inp.options.map((o) => `<button type="button" data-seg="${k}" data-v="${esc(o)}" aria-pressed="${val(k) === o}">${esc(o)}</button>`).join('')}</div></div>`;
  }
  if (inp.type === 'text') {
    return `<div class="field txt" data-k="${k}"><label class="field-label" for="f-${k}">${esc(inp.label)}</label><input id="f-${k}" data-text="${k}" value="${esc(val(k))}" maxlength="40" autocomplete="off"></div>`;
  }
  if (inp.type === 'pct') {
    const p = val(k) * 100;
    return `<div class="field" data-k="${k}"><label class="field-label" for="f-${k}">${esc(inp.label)}</label><div class="pct-row"><input type="range" min="0" max="${inp.max || 100}" step="0.5" value="${p}" data-range="${k}" aria-label="${esc(inp.label)}" style="--p:${(p / (inp.max || 100)) * 100}%"><div class="inp"><input id="f-${k}" data-pct="${k}" inputmode="decimal" value="${nf(1).format(p)}"><span class="unit">%</span></div></div>${note}</div>`;
  }
  const auto = inp.auto && state.values[k] === undefined || (inp.auto && state.values[k] === null);
  const cur = inp.auto && auto ? inp.auto.get(R) : val(k);
  const autoBtn = inp.auto ? (auto ? `<span class="auto">Tomado de ${esc(inp.auto.from)}</span>` : `<button type="button" class="auto" data-unauto="${k}">↺ Usar el de ${esc(inp.auto.from)}</button>`) : '';
  const money = inp.type === 'money';
  const cls = ['inp', money ? 'money' : '', !money && !inp.unit ? 'nounit' : ''].join(' ');
  return `<div class="field" data-k="${k}"><div class="field-label"><label for="f-${k}">${esc(inp.label)}</label>${autoBtn}</div>
    <div class="stepper"><button type="button" data-step="${k}" data-dir="-1" aria-label="Restar">−</button>
    <div class="${cls}">${money ? `<span class="cur">${esc(MONEDAS[state.settings.moneda] || '')}</span>` : ''}<input id="f-${k}" data-num="${k}" inputmode="decimal" autocomplete="off" value="${esc(nf(inp.dec).format(cur ?? 0))}">${!money && inp.unit ? `<span class="unit">${esc(inp.unit)}</span>` : ''}</div>
    <button type="button" data-step="${k}" data-dir="1" aria-label="Sumar">+</button></div>${note}</div>`;
}
function findInput(calc, k) { return calc.inputs.find((i) => i.k === k); }

/* ---------- Vistas ---------- */
const view = document.getElementById('view');
let current = { name: 'inicio', id: null };

function resultsHTML(calc) {
  const rows = calc.out(R);
  return rows.map((x) => `<div class="res${x.main ? ' main' : ''}"><span class="res-label">${esc(x.label)}${x.sem ? ` <span class="dot ${x.sem}"></span>` : ''}</span><span class="res-val">${esc(fmt(x.value, x.type))}${x.unit ? `<small>${esc(x.unit)}</small>` : ''}</span></div>`).join('');
}
function summaryHTML(calc) {
  const m = calc.out(R).find((x) => x.main) || calc.out(R)[0];
  const chip = m.sem ? `<span class="chip ${m.sem}"><span class="dot ${m.sem}"></span>${SEM_TXT[m.sem]}</span>` : '';
  const bar = m.bar !== undefined ? `<div class="bar"><i style="width:${Math.min(100, m.bar * 100)}%"></i></div>` : '';
  return `<div style="min-width:0;flex:1"><div class="sum-label">${esc(m.label)}</div><div class="sum-value">${esc(fmt(m.value, m.type))}${m.unit ? ` <small style="font-size:14px;color:var(--txt-2)">${esc(m.unit)}</small>` : ''}</div>${bar}</div>${chip}`;
}
function calcView(id) {
  const c = BY_ID[id];
  if (!c) return renderTab('calculadoras');
  view.innerHTML = `<div class="view-enter">
    <button class="back" data-go="calculadoras">${ico('back')} Calculadoras</button>
    <div class="calc-head"><span class="tile-ico">${ico(c.ico)}</span><div><h1>${esc(c.t)}</h1><p class="lead" style="margin:2px 0 0">${esc(c.d)}</p></div></div>
    ${c.warn ? `<div class="note warn">${ico('alert')}<span>${esc(c.warn)}</span></div>` : ''}
    <div class="sum" id="sum">${summaryHTML(c)}</div>
    <section class="card"><p class="card-title">${ico('sliders')} Tus datos</p><div id="inputs">${c.inputs.map(inputHTML).join('')}</div></section>
    <section class="card"><p class="card-title">${ico('gauge')} Resultados</p><div class="results" id="results">${resultsHTML(c)}</div></section>
    ${promoMini(c.promo || '¿Quieres guardar estos números y llevar registros más completos de tu galpón?')}
    <div id="extra">${c.extra ? c.extra(R) : ''}</div>
    ${(c.notes || []).map((n) => `<div class="note">${ico('info')}<span>${esc(n)}</span></div>`).join('')}
    <div class="actions"><button class="btn wa" data-share="${c.id}">${ico('share')} Compartir</button><button class="btn" data-reset="${c.id}">${ico('reset')} Restablecer</button></div>
    ${footer()}</div>`;
}
function refreshCalc() {
  const c = BY_ID[current.id]; if (!c) return;
  const sum = document.getElementById('sum'), res = document.getElementById('results'), extra = document.getElementById('extra');
  if (sum) sum.innerHTML = summaryHTML(c);
  if (res) res.innerHTML = resultsHTML(c);
  if (extra && c.extra) extra.innerHTML = c.extra(R);
  // Actualiza los campos automáticos que no se están editando
  for (const inp of c.inputs) {
    if (!inp.auto) continue;
    const el = document.getElementById('f-' + inp.k);
    if (el && document.activeElement !== el && (state.values[inp.k] === undefined || state.values[inp.k] === null)) el.value = nf(inp.dec).format(inp.auto.get(R));
  }
}

function kpi(label, value, sem, note, go) {
  return `<button class="kpi" ${go ? `data-go="c/${go}"` : ''} style="text-align:left;cursor:pointer"><div class="kpi-label"><span>${esc(label)}</span>${sem ? `<span class="dot ${sem}"></span>` : ''}</div><div class="kpi-value">${esc(value)}</div>${note ? `<div class="kpi-note">${esc(note)}</div>` : ''}</button>`;
}
function diagHTML() {
  const items = diagnostico(R, state.settings.linea, (x) => money(x));
  return `<ul class="diag">${items.map((d) => `<li><span class="dot ${d.nivel}"></span><span>${esc(d.texto)}</span></li>`).join('')}</ul>
    <p class="muted" style="margin:12px 2px 0">Diagnóstico orientativo con referencias generales. Para salud y vacunas, consulta a tu veterinario.</p>`;
}
/* ---------- Publicidad de RM ---------- */
function promoPostura() {
  return `<section class="promo" aria-label="Publicidad de RM Postura">
    <div class="promo-head"><img src="icons/rm-postura.png" alt="RM Postura" width="56" height="56"><div><span class="promo-tag">App de RM Agroinversiones</span><p class="promo-title">RM POSTURA</p></div></div>
    <p class="promo-txt">Esta calculadora hace las cuentas rápidas. <b>Si quieres llevar registros más completos, descarga la app RM Postura:</b> registro diario de tu lote, tu curva de postura contra el estándar de tu raza, alertas antes de que caiga la producción y cuánto te cuesta cada panal.</p>
    <ul class="promo-list"><li>Registro diario en segundos</li><li>Curva oficial de 10 razas</li><li>Plan sanitario por país</li><li>Funciona sin internet</li></ul>
    <div class="promo-actions"><a class="btn gold" href="${POSTURA_URL}" target="_blank" rel="noopener">${ico('download')} Descargar RM Postura</a><a class="btn" href="${POSTURA_DEMO}" target="_blank" rel="noopener">Ver la demo</a></div>
    <p class="promo-fine">5 días gratis para probarla. Para Android y iPhone.</p>
  </section>`;
}
function promoMini(texto) {
  return `<a class="promo-mini" href="${POSTURA_URL}" target="_blank" rel="noopener"><img src="icons/rm-postura.png" alt="" width="40" height="40"><span>${esc(texto)} <b>Descarga la app RM Postura →</b></span></a>`;
}
function vitrinaHTML() {
  return `<h2>Vitrina RM</h2><div class="vitrina">
    <a class="vit" href="${POSTURA_URL}" target="_blank" rel="noopener"><img src="icons/rm-postura.png" alt=""><span><b>RM Postura</b>Registro diario, curva de tu raza y costo por panal. 5 días gratis.</span></a>
    <a class="vit" href="${CURSOS_URL}" target="_blank" rel="noopener"><img class="vit-cover" src="icons/novato.png" alt="Curso De Novato a Experto con gallinas ponedoras"><span><b>Cursos online de gallinas</b>De Novato a Experto + Cría y Levante, con 2 Monitores en Excel.</span></a>
    <a class="vit" href="https://wa.me/${WHATSAPP_AVES}" target="_blank" rel="noopener"><img class="vit-logo" src="icons/logo-rm.png" alt="RM Agroinversiones"><span><b>Pollitas y gallinas</b>Ventas en Colombia. Escríbenos al +57 314 518 2016.</span></a>
  </div>`;
}
function redesHTML(titulo = 'Síguenos en redes') {
  return `<section class="card social"><p class="card-title">${ico("heart")} ${esc(titulo)}</p>
    <p class="lead" style="margin-bottom:12px">Consejos, clases gratis y novedades de RM Agroinversiones.</p>
    <div class="social-grid">${REDES.map((r) => `<a class="soc soc-${r.id}" href="${r.url}" target="_blank" rel="noopener">${ico(r.id)}<span><b>${esc(r.nombre)}</b>${esc(r.usuario)}</span></a>`).join('')}</div>
    <a class="btn wa block" style="margin-top:12px" href="https://wa.me/?text=${encodeURIComponent(TEXTO_COMPARTIR)}" target="_blank" rel="noopener">${ico('share')} Compártela con un amigo</a>
  </section>`;
}
function sigueView(nombre) {
  view.innerHTML = `<div class="welcome">
    <img class="welcome-logo" src="icons/logo-calculadora-avicola-1024.png" alt="Calculadora Avícola RM" style="width:120px;height:120px">
    <h1>¡Listo, ${esc(nombre)}!</h1>
    <p class="lead">Tu calculadora es un regalo de RM Agroinversiones. Solo te pedimos dos cosas: <b>síguenos en nuestras redes</b> y <b>compártela con un amigo avicultor</b>. Así nos ayudas a seguir creando herramientas gratis.</p>
    ${redesHTML('1 · Síguenos')}
    <button class="btn gold block" style="margin-top:16px" data-start>Empezar a calcular</button>
  </div>`;
}
function footer() {
  return `<div class="footer"><img src="icons/logo-rm.png" alt="">Calculadora Avícola RM · RM Agroinversiones<br>Cursos online de gallinas ponedoras</div>`;
}
function installCard() {
  if (isStandalone()) return '';
  if (deferredPrompt) return `<section class="card" style="margin-top:14px"><p class="card-title">${ico('phone')} Llévala en tu celular</p><p class="lead">Instálala como app: queda con el ícono de RM y funciona sin internet.</p><button class="btn gold block" data-install>${ico('download')} Instalar la app</button></section>`;
  if (isIOS()) return `<section class="card" style="margin-top:14px"><p class="card-title">${ico('phone')} Llévala en tu iPhone</p><p class="lead">Toca el botón <b>Compartir</b> de Safari y luego <b>«Agregar a pantalla de inicio»</b>. Queda con el ícono de RM y funciona sin internet.</p></section>`;
  return `<section class="card" style="margin-top:14px"><p class="card-title">${ico('phone')} Llévala en tu celular</p><p class="lead">Abre el menú del navegador (⋮) y toca <b>«Instalar app»</b> o <b>«Agregar a pantalla principal»</b>.</p></section>`;
}

function inicioView() {
  const s = state.settings, g = R.costos.ganancia, semG = semaforo('ganancia', g);
  const quick = ['produccion', 'alimento', 'costos', 'simulador'].map((id) => tileHTML(BY_ID[id])).join('');
  view.innerHTML = `<div class="view-enter">
    <section class="hero">
      <p class="hero-hi">Hola, ${esc(s.nombre || 'avicultor')} 👋</p>
      <p class="hero-name">${esc(s.granja || 'Mi granja')}</p>
      <div class="hero-label">Ganancia del mes</div>
      <div class="hero-main"><span class="hero-value">${esc(money(g))}</span><span class="chip ${semG}"><span class="dot ${semG}"></span>${SEM_TXT[semG]}</span></div>
      <div class="hero-grid">
        ${kpi('Postura', fmt(R.produccion.postura, 'pct'), semaforo('postura', R.produccion.postura), '', 'produccion')}
        ${kpi('Costo por cubeta', money(R.costos.costoCubeta), '', 'Vendes a ' + money(R.v.precioCubeta), 'costos')}
        ${kpi('Conversión', fmt(R.alimento.conversion, 'd2') + ' kg/kg', semaforo('conversion', R.alimento.conversion), '', 'alimento')}
        ${kpi('Mortalidad', fmt(R.mortalidad.acumulada, 'pct'), semaforo('mortalidad', R.mortalidad.acumulada), 'acumulada', 'mortalidad')}
      </div>
    </section>
    <h2>Lleva tu galpón día a día</h2>${promoPostura()}
    <h2>Accesos rápidos</h2><div class="grid">${quick}</div>
    <h2>Diagnóstico RM</h2><section class="card">${diagHTML()}</section>
    ${promoMini('El diagnóstico de hoy es una foto. ¿Quieres ver la película completa de tu lote, con alertas automáticas?')}
    <button class="btn block" style="margin-top:14px" data-go="calculadoras">${ico('grid')} Ver las 16 calculadoras</button>
    ${vitrinaHTML()}
    <div style="margin-top:14px">${redesHTML()}</div>
    ${footer()}</div>`;
}
function tileHTML(c) {
  const m = c.out(R).find((x) => x.main);
  return `<button class="tile" data-go="c/${c.id}"><span class="tile-ico">${ico(c.ico)}</span><span class="tile-name">${esc(c.t)}</span><span class="tile-desc">${esc(c.d)}</span>${m && m.type !== 'text' ? `<span class="tile-val">${esc(fmt(m.value, m.type))}</span>` : ''}</button>`;
}
function calculadorasView(q = '') {
  view.innerHTML = `<div class="view-enter"><h1>Calculadoras</h1><p class="lead">16 herramientas para las cuentas de tu galpón.</p>
    <label class="search">${ico('search')}<input id="q" placeholder="Buscar: alimento, agua, luz…" value="${esc(q)}" autocomplete="off" aria-label="Buscar calculadora"></label>
    <div class="grid" id="tiles">${tilesFor(q)}</div>${footer()}</div>`;
}
function tilesFor(q) {
  const n = (s) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
  const list = CALCS.filter((c) => !q || n(c.t + ' ' + c.d).includes(n(q)));
  return list.length ? list.map(tileHTML).join('') : `<p class="muted">No encontré «${esc(q)}».</p>`;
}
function panelView() {
  const r = R;
  view.innerHTML = `<div class="view-enter"><h1>Panel</h1><p class="lead">Tu granja de un vistazo. Toca un indicador para abrir su calculadora.</p>
    <section class="card"><p class="card-title">${ico('egg')} Postura del día</p><div style="display:flex;align-items:baseline;justify-content:space-between;gap:12px"><span class="hero-value" style="font-size:34px">${esc(fmt(r.produccion.postura, 'pct'))}</span><span class="chip ${semaforo('postura', r.produccion.postura)}"><span class="dot ${semaforo('postura', r.produccion.postura)}"></span>${SEM_TXT[semaforo('postura', r.produccion.postura)]}</span></div><div class="bar"><i style="width:${Math.min(100, r.produccion.postura * 100)}%"></i></div></section>
    <h2>Indicadores</h2><div class="kpis">
      ${kpi('Ganancia del mes', money(r.costos.ganancia), semaforo('ganancia', r.costos.ganancia), '', 'costos')}
      ${kpi('Conversión', fmt(r.alimento.conversion, 'd2') + ' kg/kg', semaforo('conversion', r.alimento.conversion), 'alimento por kg de huevo', 'alimento')}
      ${kpi('Costo por huevo', fmt(r.costos.costoHuevo, 'money2'), '', '', 'costos')}
      ${kpi('Costo por cubeta', money(r.costos.costoCubeta), '', '', 'costos')}
      ${kpi('Precio mínimo de la cubeta', money(r.costos.precioMin), '', 'para no perder', 'costos')}
      ${kpi('Costo por pollita lista', money(r.levante.costoPollita), '', '', 'levante')}
      ${kpi('Mortalidad acumulada', fmt(r.mortalidad.acumulada, 'pct'), semaforo('mortalidad', r.mortalidad.acumulada), '', 'mortalidad')}
      ${kpi('Huevos del ciclo', fmt(r.proyeccion.huevosCiclo, 'int'), '', fmt(r.proyeccion.cubetas, 'int') + ' cubetas', 'proyeccion')}
      ${kpi('Alimento al mes', money(r.alimento.costoMes), '', fmt(r.alimento.bultosMes, 'd1') + ' bultos', 'alimento')}
    </div>
    <h2>${ico('brain')} Diagnóstico RM</h2><section class="card">${diagHTML()}</section>
    ${promoMini('¿Quieres ver estos indicadores semana a semana, con gráficas, alertas y registros completos?')}
    <div class="note">${ico('info')}<span><b>Colores:</b> <span class="dot ok"></span> muy bien · <span class="dot warn"></span> atento · <span class="dot bad"></span> revisa. Postura: 90 % o más es muy bien; conversión: 2,1 kg/kg o menos. Son referencias generales: compáralas con la guía de ${esc(state.settings.linea)}.</span></div>
    ${footer()}</div>`;
}
function ajustesView() {
  const s = state.settings;
  view.innerHTML = `<div class="view-enter"><h1>Ajustes</h1><p class="lead">Personaliza tu calculadora. Todo se guarda solo en tu celular.</p>
    <section class="card set"><p class="card-title">${ico('home')} Tu granja</p>
      <div class="field txt"><label class="field-label" for="s-granja">Nombre de tu granja</label><input id="s-granja" data-set="granja" value="${esc(s.granja)}" maxlength="40" autocomplete="off"></div>
      <div class="field txt"><label class="field-label" for="s-nombre">Tu nombre</label><input id="s-nombre" data-set="nombre" value="${esc(s.nombre)}" maxlength="30" autocomplete="off"></div>
      <div class="field"><label class="field-label" for="s-moneda">Moneda</label><div class="inp nounit"><select id="s-moneda" data-set="moneda">${Object.keys(MONEDAS).map((m) => `<option ${m === s.moneda ? 'selected' : ''}>${esc(m)}</option>`).join('')}</select></div></div>
      <div class="field"><label class="field-label" for="s-linea">Línea genética</label><div class="inp nounit"><select id="s-linea" data-set="linea">${LINEAS.map((m) => `<option ${m === s.linea ? 'selected' : ''}>${esc(m)}</option>`).join('')}</select></div></div>
      <div class="field"><div class="field-label">Apariencia</div><div class="seg"><button type="button" data-theme-set="dark" aria-pressed="${s.tema !== 'light'}">Oscuro</button><button type="button" data-theme-set="light" aria-pressed="${s.tema === 'light'}">Claro</button></div></div>
    </section>
    ${installCard()}
    <section class="card" style="margin-top:14px"><p class="card-title">${ico('download')} Más herramientas</p>
      <a class="btn block" href="Calculadora-Avicola-RM.xlsx" download>${ico('download')} Descargar la versión en Excel</a>
      <a class="btn wa block" style="margin-top:10px" href="https://wa.me/${WHATSAPP_RM}" target="_blank" rel="noopener">${ico('share')} WhatsApp de RM: +57 322 952 1224</a>
      <button class="btn block" style="margin-top:10px" data-clear>${ico('trash')} Borrar mis datos</button>
    </section>
    ${vitrinaHTML()}
    <div style="margin-top:14px">${redesHTML()}</div>
    <div class="note">${ico('info')}<span>Los valores de referencia son orientativos. Ajústalos a la guía de tu línea genética y consulta a tu veterinario para vacunas y medicamentos.</span></div>
    <p class="muted" style="text-align:center;margin-top:14px">Versión 1.0 · octubre 2026</p>${footer()}</div>`;
}

const NAV = [['inicio', 'home', 'Inicio'], ['calculadoras', 'grid', 'Calculadoras'], ['panel', 'gauge', 'Panel'], ['ajustes', 'sliders', 'Ajustes']];
function renderNav() {
  for (const [name, ic, label] of NAV) {
    const b = document.querySelector(`.tabs [data-tab="${name}"]`);
    b.innerHTML = `${ico(ic)}<span>${label}</span>`;
    const active = current.name === name || (current.name === 'calc' && name === 'calculadoras');
    if (active) b.setAttribute('aria-current', 'page'); else b.removeAttribute('aria-current');
  }
}
function renderTab(name) {
  current = { name, id: null };
  if (name === 'calculadoras') calculadorasView(); else if (name === 'panel') panelView(); else if (name === 'ajustes') ajustesView(); else { current.name = 'inicio'; inicioView(); }
  renderNav();
}
/* ---------- Bienvenida: la primera vez pide el nombre ---------- */
function bienvenidaView() {
  document.body.classList.add('onboarding');
  const s = state.settings;
  view.innerHTML = `<div class="welcome">
    <img class="welcome-logo" src="icons/logo-calculadora-avicola-1024.png" alt="Calculadora Avícola RM">
    <h1>¡Bienvenido!</h1>
    <p class="lead">Haz en segundos las cuentas de tu galpón de gallinas ponedoras. Primero, cuéntanos cómo te llamas.</p>
    <form id="welcomeForm" class="card set" autocomplete="on">
      <div class="field txt"><label class="field-label" for="w-nombre">Tu nombre</label><input id="w-nombre" name="nombre" value="${esc(s.nombre)}" maxlength="30" autocomplete="given-name" required placeholder="Ej.: Marcelo"></div>
      <div class="field txt"><label class="field-label" for="w-granja">Nombre de tu granja <span class="muted">(opcional)</span></label><input id="w-granja" name="granja" value="${esc(s.granja === 'Mi granja' ? '' : s.granja)}" maxlength="40" placeholder="Ej.: Granja La Esperanza"></div>
      <div class="field"><label class="field-label" for="w-moneda">Moneda</label><div class="inp nounit"><select id="w-moneda" name="moneda">${Object.keys(MONEDAS).map((m) => `<option ${m === s.moneda ? 'selected' : ''}>${esc(m)}</option>`).join('')}</select></div></div>
      <button class="btn gold block" type="submit" style="margin-top:8px">Empezar</button>
    </form>
    <p class="muted" style="text-align:center;margin-top:14px">Tus datos se guardan solo en tu celular.</p>
  </div>`;
  setTimeout(() => { const i = document.getElementById('w-nombre'); if (i && !i.value) i.focus(); }, 400);
}
document.addEventListener('submit', (e) => {
  if (e.target.id !== 'welcomeForm') return;
  e.preventDefault();
  const f = new FormData(e.target);
  const nombre = String(f.get('nombre') || '').trim().slice(0, 30);
  if (!nombre) { toast('Escribe tu nombre para empezar'); return; }
  const granja = String(f.get('granja') || '').trim().slice(0, 40);
  Object.assign(state.settings, { nombre, granja: granja || 'Mi granja', moneda: String(f.get('moneda') || 'COP $'), listo: true });
  save(); recompute(); applyFarm();
  sigueView(nombre); window.scrollTo(0, 0);
});

function route() {
  if (!state.settings.listo) { current = { name: 'bienvenida', id: null }; bienvenidaView(); window.scrollTo(0, 0); return; }
  document.body.classList.remove('onboarding');
  const h = location.hash.replace(/^#\/?/, '');
  if (h.startsWith('c/')) { current = { name: 'calc', id: h.slice(2) }; calcView(current.id); renderNav(); }
  else renderTab(h || 'inicio');
  window.scrollTo(0, 0);
}
const go = (to) => { if (location.hash === '#/' + to) route(); else location.hash = '#/' + to; };

/* ---------- Invitación a RM Postura (una vez al día, tras varios cálculos) ---------- */
let cambios = 0;
function invitarApp() {
  const hoy = new Date().toISOString().slice(0, 10);
  let ultima = '';
  try { ultima = localStorage.getItem(KEY + '-invitacion') || ''; } catch (e) { /* sin almacenamiento */ }
  if (ultima === hoy || document.getElementById('sheet')) return;
  try { localStorage.setItem(KEY + '-invitacion', hoy); } catch (e) { /* sin almacenamiento */ }
  const s = document.createElement('div');
  s.id = 'sheet'; s.className = 'sheet-wrap';
  s.innerHTML = `<div class="sheet" role="dialog" aria-modal="true" aria-label="RM Postura">
    <img src="icons/rm-postura.png" alt="RM Postura" width="72" height="72">
    <p class="promo-title" style="text-align:center">Lleva esto todos los días</p>
    <p class="promo-txt" style="text-align:center">Con <b>RM Postura</b> registras tu lote en segundos y la app hace estas cuentas sola, todos los días, con gráficas, alertas y tu curva comparada con el estándar de tu raza.</p>
    <a class="btn gold block" href="${POSTURA_URL}" target="_blank" rel="noopener">${ico('download')} Descargar RM Postura</a>
    <button class="btn block" style="margin-top:10px" data-close-sheet>Ahora no</button>
    <p class="promo-fine" style="text-align:center">5 días gratis para probarla.</p></div>`;
  document.body.appendChild(s);
}

/* ---------- Eventos ---------- */
let raf = 0;
function changed() { recompute(); save(); cancelAnimationFrame(raf); raf = requestAnimationFrame(refreshCalc); if (++cambios === 8) setTimeout(invitarApp, 900); }
function setVal(k, x) { state.values[k] = x; changed(); }

document.addEventListener('click', (e) => {
  if (e.target.classList && e.target.classList.contains('sheet-wrap')) { e.target.remove(); return; }
  const t = e.target.closest('button, a'); if (!t) return;
  if ('closeSheet' in t.dataset) { const s = document.getElementById('sheet'); if (s) s.remove(); return; }
  if ('start' in t.dataset) { document.body.classList.remove('onboarding'); location.hash = '#/inicio'; route(); toast(`¡Hola, ${state.settings.nombre}!`); return; }
  if (t.closest('#sheet') && t.tagName === 'A') { setTimeout(() => { const s = document.getElementById('sheet'); if (s) s.remove(); }, 300); return; }
  if (t.dataset.tab) return go(t.dataset.tab);
  if (t.dataset.go) return go(t.dataset.go);
  if (t.dataset.step) {
    const c = BY_ID[current.id], inp = findInput(c, t.dataset.step), el = document.getElementById('f-' + inp.k);
    const base = (inp.auto && (state.values[inp.k] === undefined || state.values[inp.k] === null)) ? inp.auto.get(R) : val(inp.k);
    const nx = Math.max(0, Math.round((base + Number(t.dataset.dir) * inp.step) * 1e6) / 1e6);
    setVal(inp.k, nx); el.value = nf(inp.dec).format(nx);
    if (inp.auto) document.querySelector(`[data-k="${inp.k}"]`).outerHTML = inputHTML(inp);
    return;
  }
  if (t.dataset.seg) { setVal(t.dataset.seg, t.dataset.v); document.getElementById('inputs').innerHTML = BY_ID[current.id].inputs.map(inputHTML).join(''); return; }
  if (t.dataset.unauto) { state.values[t.dataset.unauto] = null; changed(); const c = BY_ID[current.id], inp = findInput(c, t.dataset.unauto); document.querySelector(`[data-k="${inp.k}"]`).outerHTML = inputHTML(inp); return; }
  if (t.dataset.reset) { for (const i of BY_ID[t.dataset.reset].inputs) if (i.k) delete state.values[i.k]; recompute(); save(); calcView(t.dataset.reset); toast('Valores restablecidos'); return; }
  if (t.dataset.share) { share(BY_ID[t.dataset.share]); setTimeout(invitarApp, 1500); return; }
  if (t.dataset.themeSet) { state.settings.tema = t.dataset.themeSet; save(); applyTheme(); ajustesView(); return; }
  if ('install' in t.dataset) return doInstall();
  if ('clear' in t.dataset) { if (confirm('¿Borrar todos tus datos de la calculadora?')) { state = { values: {}, settings: { ...SET_DEF } }; save(); recompute(); applyTheme(); applyFarm(); route(); toast('Datos borrados'); } }
});
document.addEventListener('input', (e) => {
  const t = e.target;
  if (t.dataset.num) { const x = parseNum(t.value); if (Number.isFinite(x) && x >= 0) { setVal(t.dataset.num, x); const c = BY_ID[current.id], inp = findInput(c, t.dataset.num); if (inp && inp.auto) { const lbl = t.closest('.field').querySelector('.auto'); if (lbl && lbl.tagName !== 'BUTTON') lbl.outerHTML = `<button type="button" class="auto" data-unauto="${inp.k}">↺ Usar el de ${esc(inp.auto.from)}</button>`; } } return; }
  if (t.dataset.range) { const p = Number(t.value); t.style.setProperty('--p', (p / Number(t.max)) * 100 + '%'); const box = document.getElementById('f-' + t.dataset.range); if (box) box.value = nf(1).format(p); setVal(t.dataset.range, p / 100); return; }
  if (t.dataset.pct) { const p = parseNum(t.value); if (Number.isFinite(p) && p >= 0 && p <= 100) { const rg = document.querySelector(`[data-range="${t.dataset.pct}"]`); if (rg) { rg.value = p; rg.style.setProperty('--p', (p / Number(rg.max)) * 100 + '%'); } setVal(t.dataset.pct, p / 100); } return; }
  if (t.dataset.text) { setVal(t.dataset.text, t.value.slice(0, 40)); return; }
  if (t.dataset.set) { state.settings[t.dataset.set] = t.value; save(); applyFarm(); if (t.dataset.set === 'moneda' || t.dataset.set === 'linea') recompute(); return; }
  if (t.id === 'q') { document.getElementById('tiles').innerHTML = tilesFor(t.value); }
});
document.addEventListener('focusin', (e) => {
  const t = e.target; if (!t.dataset || !t.dataset.num) return;
  const c = BY_ID[current.id], inp = c && findInput(c, t.dataset.num); if (!inp) return;
  const x = parseNum(t.value); if (Number.isFinite(x)) t.value = String(x).replace('.', ',');
  setTimeout(() => t.select && t.select(), 0);
});
document.addEventListener('focusout', (e) => {
  const t = e.target;
  if (t.dataset && t.dataset.num) { const c = BY_ID[current.id], inp = c && findInput(c, t.dataset.num); if (!inp) return; const x = parseNum(t.value); t.value = nf(inp.dec).format(Number.isFinite(x) ? x : val(inp.k)); }
  if (t.dataset && t.dataset.pct) { const x = parseNum(t.value); t.value = nf(1).format(Number.isFinite(x) ? x : val(t.dataset.pct) * 100); }
});
document.addEventListener('keydown', (e) => { if (e.key === 'Enter' && e.target.matches('input')) e.target.blur(); });
window.addEventListener('hashchange', route);

/* ---------- Compartir por WhatsApp ---------- */
function share(c) {
  const rows = c.out(R);
  const lines = rows.map((x) => `• ${x.label}: ${fmt(x.value, x.type)}${x.unit ? ' ' + x.unit : ''}`);
  const text = `*${c.t}* · ${state.settings.granja || 'Mi granja'}\n${lines.join('\n')}\n\nCalculado con la Calculadora Avícola RM · RM Agroinversiones`;
  window.open('https://wa.me/?text=' + encodeURIComponent(text), '_blank', 'noopener');
}

/* ---------- Tema, granja y aviso ---------- */
function applyTheme() {
  const t = state.settings.tema === 'light' ? 'light' : 'dark';
  document.documentElement.dataset.theme = t;
  const m = document.querySelector('meta[name="theme-color"]'); if (m) m.content = t === 'light' ? '#F6F5F0' : '#0B0B0B';
}
function applyFarm() { document.getElementById('topFarm').textContent = state.settings.granja || 'Mi granja'; }
let toastT = 0;
function toast(msg) { const el = document.getElementById('toast'); el.textContent = msg; el.classList.add('show'); clearTimeout(toastT); toastT = setTimeout(() => el.classList.remove('show'), 1800); }

/* ---------- Instalación como app ---------- */
let deferredPrompt = null;
const isStandalone = () => window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
const isIOS = () => /iphone|ipad|ipod/i.test(navigator.userAgent) && !window.MSStream;
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault(); deferredPrompt = e;
  if (current.name === 'ajustes') renderTab(current.name);
});
window.addEventListener('appinstalled', () => { deferredPrompt = null; toast('¡Listo! La calculadora quedó instalada'); });
async function doInstall() {
  if (!deferredPrompt) return;
  deferredPrompt.prompt();
  try { await deferredPrompt.userChoice; } catch (e) { /* cancelado */ }
  deferredPrompt = null;
}
if ('serviceWorker' in navigator) window.addEventListener('load', () => navigator.serviceWorker.register('sw.js').catch(() => {}));

/* ---------- Arranque ---------- */
applyTheme(); applyFarm(); route();
setTimeout(() => { const sp = document.getElementById('splash'); if (!sp) return; sp.classList.add('out'); setTimeout(() => sp.remove(), 600); }, 650);
