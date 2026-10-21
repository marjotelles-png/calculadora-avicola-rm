// Calculadora Avícola RM · motor de cálculo (sin DOM).
// Las fórmulas son las mismas del Excel «Calculadora RM para avicultores v1», ya verificado.

export const DEFAULTS = {
  // Tu lote (se comparte entre calculadoras)
  gallinas: 1000, huevos: 870, cubeta: 30, pesoHuevo: 62,
  // Alimento
  consumo: 115, bultoKg: 40, precioBulto: 95000,
  // Costos y ganancia
  postura: 0.85, precioCubeta: 15000, costoAlimentoMes: null, manoObra: 1500000, sanidad: 300000,
  servicios: 400000, otros: 200000, perdida: 0.03,
  // Levante
  pollitas: 1000, precioPollita: 4500, alimentoLevante: 6.2, precioKgLevante: 2600, vacunasLevante: 1200,
  otrosLevante: 800, mortLevante: 0.04,
  // Espacio y equipos
  largo: 20, ancho: 8, sistema: 'Piso', avesM2: 6, jaulaCm2: 500, comederoCm: 10, tolva: 25, niple: 10,
  campana: 100, nido: 5,
  // Agua
  aguaPorKg: 2, reservaDias: 2,
  // Medicamento en agua
  litrosMed: null, dosisL: 1, diasTratamiento: 5, frasco: 500, mgKg: 10, pesoGallina: 1.9, concentracion: 100,
  // Mezcla de alimento
  nombreA: 'Maíz', protA: 8.5, nombreB: 'Torta de soya', protB: 46, objetivoProt: 17, mezclaKg: 100,
  // Luz
  horasLuz: 16, luzNatural: 12, bombillos: 10, vatios: 9, precioKwh: 900,
  // Mortalidad
  gallinasInicio: 1000, muertesSemana: 3, muertesTotal: 45,
  // Proyección del lote
  gallinasCiclo: 1000, semanas: 60, posturaCiclo: 0.83, mortCiclo: 0.08,
  // Clasificación del huevo (Jumbo, AAA, AA, A, B, C)
  cat0: 20, cat1: 180, cat2: 400, cat3: 200, cat4: 50, cat5: 20,
  pcat0: 21000, pcat1: 18000, pcat2: 16000, pcat3: 14000, pcat4: 12000, pcat5: 10000, pesoClasificar: 63,
  // Conversiones
  convHuevos: 870, convCubetas: 29, convKg: 100, convG: 115,
  // Inversión y retorno
  galpon: 15000000, equipos: 4000000, pollitasInv: null, capital: 3000000, gananciaInv: null,
  // Gallina de descarte
  gallinasDescarte: 920, pesoDescarte: 1.9, precioDescarte: 6500,
};

export const CATEGORIAS = [
  { nombre: 'Jumbo', rango: '78 g o más' },
  { nombre: 'AAA', rango: '67 a 77,9 g' },
  { nombre: 'AA', rango: '60 a 66,9 g' },
  { nombre: 'A', rango: '53 a 59,9 g' },
  { nombre: 'B', rango: '46 a 52,9 g' },
  { nombre: 'C', rango: 'menos de 46 g' },
];

const div = (a, b) => (b ? a / b : 0);
const num = (x, d) => (typeof x === 'number' && Number.isFinite(x) ? x : d);

export function compute(input = {}) {
  const v = { ...DEFAULTS };
  for (const [k, val] of Object.entries(input)) {
    if (!(k in DEFAULTS)) continue;
    if (typeof DEFAULTS[k] === 'string') v[k] = typeof val === 'string' ? val : DEFAULTS[k];
    else if (DEFAULTS[k] === null) v[k] = typeof val === 'number' && Number.isFinite(val) ? val : null;
    else v[k] = num(val, DEFAULTS[k]);
  }

  // Producción
  const postura = div(v.huevos, v.gallinas);
  const produccion = {
    postura,
    cubetas: v.cubeta ? Math.floor(v.huevos / v.cubeta) : 0,
    sueltos: v.cubeta ? v.huevos % v.cubeta : 0,
    masaKg: (v.huevos * v.pesoHuevo) / 1000,
    huevosMes: v.huevos * 30,
    cubetasMes: div(v.huevos * 30, v.cubeta),
  };

  // Alimento
  const kgDia = (v.gallinas * v.consumo) / 1000;
  const bultosDia = div(kgDia, v.bultoKg);
  const costoDia = bultosDia * v.precioBulto;
  const alimento = {
    kgDia, bultosDia, bultosSemana: bultosDia * 7, bultosMes: bultosDia * 30, costoDia, costoMes: costoDia * 30,
    conversion: div(kgDia, (v.huevos * v.pesoHuevo) / 1000),
    kgDocena: div(kgDia, v.huevos / 12),
    costoHuevo: div(costoDia, v.huevos),
  };

  // Costos y ganancia
  const costoAlim = v.costoAlimentoMes ?? alimento.costoMes;
  const otrosCostos = v.manoObra + v.sanidad + v.servicios + v.otros;
  const huevosVend = v.gallinas * v.postura * 30 * (1 - v.perdida);
  const cubetasVend = div(huevosVend, v.cubeta);
  const ingresos = cubetasVend * v.precioCubeta;
  const costosTot = costoAlim + otrosCostos;
  const ganancia = ingresos - costosTot;
  const costoCubeta = div(costosTot, cubetasVend);
  const costos = {
    costoAlim, huevosVend, cubetasVend, ingresos, costosTot, ganancia,
    costoHuevo: div(costosTot, huevosVend), costoCubeta, precioMin: costoCubeta,
    margen: v.precioCubeta - costoCubeta, gananciaGallina: div(ganancia, v.gallinas),
    posturaMin: div(costosTot, v.gallinas * 30 * (1 - v.perdida) * div(v.precioCubeta, v.cubeta)),
  };

  // Simulador «¿Qué pasa si…?»
  const factores = [0.8, 0.9, 1, 1.1, 1.2];
  const ganSim = (bulto, cub, p = v.postura) =>
    v.gallinas * p * 30 * (1 - v.perdida) * div(cub, v.cubeta) - (otrosCostos + costoAlim * div(bulto, v.precioBulto));
  const simulador = {
    factores,
    bultos: factores.map((f) => v.precioBulto * f),
    cubetas: factores.map((f) => v.precioCubeta * f),
    grid: factores.map((fb) => factores.map((fc) => ganSim(v.precioBulto * fb, v.precioCubeta * fc))),
    posturas: [0.7, 0.75, 0.8, 0.85, 0.9, 0.95].map((p) => ({ p, ganancia: ganSim(v.precioBulto, v.precioCubeta, p) })),
  };

  // Levante
  const llegan = v.pollitas * (1 - v.mortLevante);
  const kgLevante = v.pollitas * v.alimentoLevante;
  const costoLevante = v.pollitas * (v.precioPollita + v.alimentoLevante * v.precioKgLevante + v.vacunasLevante + v.otrosLevante);
  const levante = { llegan, kg: kgLevante, bultos: div(kgLevante, v.bultoKg), costoTotal: costoLevante, costoPollita: div(costoLevante, llegan) };

  // Espacio y equipos
  const area = v.largo * v.ancho;
  const jaula = v.sistema === 'Jaula';
  const capacidad = jaula ? div(area * 10000, v.jaulaCm2) : area * v.avesM2;
  const cabe = v.gallinas <= capacidad;
  const espacio = {
    area, capacidad, cabe,
    sobran: cabe ? Math.round(capacidad - v.gallinas) : 0,
    faltanM2: cabe ? 0 : div(v.gallinas - capacidad, jaula ? div(10000, v.jaulaCm2) : v.avesM2),
    comedero: (v.gallinas * v.comederoCm) / 100,
    tolvas: v.tolva ? Math.ceil(v.gallinas / v.tolva) : 0,
    niples: v.niple ? Math.ceil(v.gallinas / v.niple) : 0,
    campanas: v.campana ? Math.ceil(v.gallinas / v.campana) : 0,
    nidos: v.nido ? Math.ceil(v.gallinas / v.nido) : 0,
  };

  // Agua
  const litros = kgDia * v.aguaPorKg;
  const agua = { litros, porGallinaMl: div(litros, v.gallinas) * 1000, tanque: litros * v.reservaDias };

  // Medicamento en agua
  const litrosMed = v.litrosMed ?? litros;
  const productoDia = litrosMed * v.dosisL;
  const tratamiento = productoDia * v.diasTratamiento;
  const mgDia = v.mgKg * v.pesoGallina * v.gallinas;
  const productoPeso = div(mgDia, v.concentracion);
  const medicamento = {
    litrosMed, productoDia, tratamiento, frascos: v.frasco ? Math.ceil(tratamiento / v.frasco) : 0,
    mgDia, productoPeso, porLitro: div(productoPeso, litrosMed),
  };

  // Mezcla (cuadrado de Pearson)
  const partesA = Math.abs(v.protB - v.objetivoProt);
  const partesB = Math.abs(v.protA - v.objetivoProt);
  const valida = v.objetivoProt >= Math.min(v.protA, v.protB) && v.objetivoProt <= Math.max(v.protA, v.protB) && v.protA !== v.protB;
  const mezcla = {
    partesA, partesB, valida,
    pctA: div(partesA, partesA + partesB), pctB: div(partesB, partesA + partesB),
    kgA: div(partesA, partesA + partesB) * v.mezclaKg, kgB: div(partesB, partesA + partesB) * v.mezclaKg,
  };

  // Luz
  const artificial = Math.max(0, v.horasLuz - v.luzNatural);
  const kwh = (v.bombillos * v.vatios * artificial) / 1000;
  const luz = { artificial, kwh, costoDia: kwh * v.precioKwh, costoMes: kwh * v.precioKwh * 30 };

  // Mortalidad
  const vivas = Math.max(0, v.gallinasInicio - v.muertesTotal);
  const mortalidad = {
    semanal: div(v.muertesSemana, v.gallinasInicio), acumulada: div(v.muertesTotal, v.gallinasInicio),
    vivas, viabilidad: div(vivas, v.gallinasInicio),
  };

  // Proyección del lote
  const promedio = v.gallinasCiclo * (1 - v.mortCiclo / 2);
  const huevosCiclo = promedio * v.semanas * 7 * v.posturaCiclo;
  const proyeccion = {
    promedio, huevosCiclo, cubetas: div(huevosCiclo, v.cubeta),
    ingresos: div(huevosCiclo, v.cubeta) * v.precioCubeta, porGallina: div(huevosCiclo, v.gallinasCiclo),
  };

  // Clasificación del huevo (rangos de referencia NTC 1240)
  const cats = [0, 1, 2, 3, 4, 5].map((i) => v['cat' + i]);
  const total = cats.reduce((a, b) => a + b, 0);
  const filas = CATEGORIAS.map((c, i) => ({
    ...c, huevos: cats[i], pct: div(cats[i], total), ingreso: div(cats[i], v.cubeta) * v['pcat' + i],
  }));
  const ingresoTotal = filas.reduce((a, b) => a + b.ingreso, 0);
  const p = v.pesoClasificar;
  const clasificacion = {
    filas, total, ingresoTotal, precioHuevo: div(ingresoTotal, total),
    categoria: p >= 78 ? 'Jumbo' : p >= 67 ? 'AAA' : p >= 60 ? 'AA' : p >= 53 ? 'A' : p >= 46 ? 'B' : 'C',
  };

  // Conversiones
  const conversiones = {
    cubetas: div(v.convHuevos, v.cubeta), docenas: v.convHuevos / 12, huevos: v.convCubetas * v.cubeta,
    libras: v.convKg / 0.5, arrobas: v.convKg / 12.5, bultos: div(v.convKg, v.bultoKg), kgPorMil: v.convG,
  };

  // Inversión y retorno
  const pollitasInv = v.pollitasInv ?? levante.costoTotal;
  const gananciaInv = v.gananciaInv ?? costos.ganancia;
  const totalInv = v.galpon + v.equipos + pollitasInv + v.capital;
  const inversion = {
    pollitasInv, gananciaInv, total: totalInv,
    meses: gananciaInv > 0 ? totalInv / gananciaInv : null,
    rentabilidad: div(gananciaInv * 12, totalInv),
  };

  // Gallina de descarte
  const kilosDesc = v.gallinasDescarte * v.pesoDescarte;
  const descarte = { kilos: kilosDesc, ingreso: kilosDesc * v.precioDescarte, porGallina: v.pesoDescarte * v.precioDescarte };

  return { v, produccion, alimento, costos, simulador, levante, espacio, agua, medicamento, mezcla, luz, mortalidad, proyeccion, clasificacion, conversiones, inversion, descarte };
}

// Semáforos (referencias generales; se comparan con la guía de cada línea)
export function semaforo(tipo, x) {
  if (tipo === 'postura') return x >= 0.9 ? 'ok' : x >= 0.8 ? 'warn' : 'bad';
  if (tipo === 'conversion') return x <= 2.1 ? 'ok' : x <= 2.4 ? 'warn' : 'bad';
  if (tipo === 'ganancia') return x > 0 ? 'ok' : 'bad';
  if (tipo === 'mortalidad') return x <= 0.05 ? 'ok' : x <= 0.08 ? 'warn' : 'bad';
  if (tipo === 'espacio') return x ? 'ok' : 'bad';
  return '';
}

// Diagnóstico RM: frases automáticas según los resultados. `dinero` formatea montos.
export function diagnostico(r, linea, dinero) {
  const out = [];
  const p = r.produccion.postura;
  if (p < 0.8) out.push({ nivel: 'bad', texto: 'Tu postura está baja. Revisa horas de luz (16 h), consumo de alimento y agua, calor en el galpón y la edad del lote.' });
  else if (p < 0.9) out.push({ nivel: 'warn', texto: 'Postura aceptable; compárala semana a semana con la guía de tu línea.' });
  else out.push({ nivel: 'ok', texto: '¡Excelente postura! Mantén constantes la luz, el alimento y el agua.' });

  if (r.alimento.conversion > 2.4) out.push({ nivel: 'bad', texto: 'Estás gastando mucho alimento por kilo de huevo. Revisa desperdicio en comederos, roedores y el peso del huevo.' });
  else out.push({ nivel: 'ok', texto: 'Conversión de alimento dentro de lo esperado.' });

  if (r.costos.ganancia <= 0) out.push({ nivel: 'bad', texto: `Con estos números pierdes dinero: sube el precio de la cubeta al menos a ${dinero(r.costos.precioMin)} o baja costos.` });
  else out.push({ nivel: 'ok', texto: `Ganas ${dinero(r.costos.ganancia)} al mes, ${dinero(r.costos.gananciaGallina)} por gallina.` });

  if (r.mortalidad.acumulada > 0.08) out.push({ nivel: 'bad', texto: 'Mortalidad alta: revisa bioseguridad, vacunación con tu veterinario y calor.' });
  else out.push({ nivel: 'ok', texto: 'Mortalidad bajo control.' });

  if (r.luz.artificial > 0) out.push({ nivel: 'info', texto: `Necesitas ${String(Math.round(r.luz.artificial * 10) / 10).replace('.', ',')} h de luz artificial al día; cuesta ${dinero(r.luz.costoMes)} al mes.` });
  else out.push({ nivel: 'ok', texto: 'No necesitas luz artificial adicional.' });

  if (!r.espacio.cabe) out.push({ nivel: 'bad', texto: `Tu galpón no alcanza: te faltan ${String(Math.round(r.espacio.faltanM2 * 10) / 10).replace('.', ',')} m² o reduce el lote.` });
  else out.push({ nivel: 'ok', texto: 'Espacio suficiente para tu lote.' });

  if (linea && linea !== 'Otra') out.push({ nivel: 'info', texto: `Compara tus números con la guía de manejo de ${linea}.` });
  return out;
}
