/**
 * Genera los iconos de la app a partir del mark de Easy Parking.
 *
 * El mark es el mismo que dibuja `src/components/Logo.tsx`: una "P" geométrica
 * y un punto de acento — el espacio que se acaba de ocupar. Se genera por código
 * para que cambiar la marca sea cambiar una constante y volver a correr esto,
 * en vez de editar seis PNG a mano.
 *
 *   node scripts/generate-icons.js
 *
 * Usa `pngjs`, que llega como dependencia transitiva del toolchain de Expo. Si
 * algún día desaparece, `npm i -D pngjs` y listo.
 */

const fs = require('fs');
const path = require('path');

let PNG;
try {
  ({ PNG } = require('pngjs'));
} catch {
  console.error('Falta pngjs. Instálalo con:  npm i -D pngjs');
  process.exit(1);
}

/* --------------------------------------------------------------- la marca */

const INK = [0x0a, 0x0d, 0x12];
const WHITE = [0xff, 0xff, 0xff];
const ACCENT = [0x3d, 0x3b, 0xe8];

const OUT = path.join(__dirname, '..', 'assets');

/* ------------------------------------------------------------- geometría */

const clamp01 = (v) => Math.min(1, Math.max(0, v));

/** Distancia con signo a un rectángulo redondeado; negativa dentro. */
function sdRoundedRect(px, py, cx, cy, hw, hh, r) {
  const qx = Math.abs(px - cx) - (hw - r);
  const qy = Math.abs(py - cy) - (hh - r);
  const outside = Math.hypot(Math.max(qx, 0), Math.max(qy, 0));
  return outside + Math.min(Math.max(qx, qy), 0) - r;
}

/**
 * Métricas del glifo, en unidades donde la altura de la "P" es 1 y el origen
 * es su esquina superior izquierda.
 *
 * La panza se construye como rectángulo recto + semicírculo, no como un
 * rectángulo redondeado: si el lado izquierdo lleva radio, choca con el astil y
 * deja un escalón visible en la unión.
 */
const GLYPH = {
  stemW: 0.215,
  bowlH: 0.560,
  bowlW: 0.740,
  counterH: 0.235,
  counterRight: 0.440,
  dot: { cx: 0.575, cy: 0.885, r: 0.105 },
};

/** Distancia con signo a un rectángulo recto. */
function sdBox(px, py, cx, cy, hw, hh) {
  const qx = Math.abs(px - cx) - hw;
  const qy = Math.abs(py - cy) - hh;
  return Math.hypot(Math.max(qx, 0), Math.max(qy, 0)) + Math.min(Math.max(qx, qy), 0);
}

const sdCircle = (px, py, cx, cy, r) => Math.hypot(px - cx, py - cy) - r;

/**
 * Semicírculo derecho: el círculo intersecado con `x >= cx`.
 *
 * Hace falta porque cuando el radio supera la distancia entre el centro y el
 * borde izquierdo del rectángulo, la mitad izquierda del círculo asoma y deja
 * una cuña en la unión. Recortarlo garantiza un remate limpio.
 */
const sdRightCap = (px, py, cx, cy, r) => Math.max(sdCircle(px, py, cx, cy, r), cx - px);

/** Silueta de la "P" sin la contra: astil ∪ panza. */
function sdGlyphSolid(x, y) {
  const { stemW, bowlH, bowlW } = GLYPH;
  const capR = bowlH / 2;
  const capCx = bowlW - capR;

  const stem = sdBox(x, y, stemW / 2, 0.5, stemW / 2, 0.5);
  const bowlBody = sdBox(x, y, capCx / 2, capR, capCx / 2, capR);
  const bowlCap = sdRightCap(x, y, capCx, capR, capR);

  return Math.min(stem, Math.min(bowlBody, bowlCap));
}

/** La contra: el hueco de la panza, con la misma construcción. */
function sdGlyphCounter(x, y) {
  const { stemW, bowlH, counterH, counterRight } = GLYPH;
  const r = counterH / 2;
  const capCx = counterRight - r;
  const cy = bowlH / 2;

  const body = sdBox(x, y, (stemW + capCx) / 2, cy, (capCx - stemW) / 2, r);
  const cap = sdRightCap(x, y, capCx, cy, r);

  return Math.min(body, cap);
}

/* -------------------------------------------------------------- pintura */

function createCanvas(size) {
  const png = new PNG({ width: size, height: size });
  png.data.fill(0);
  return png;
}

/** Mezcla `color` sobre el píxel con la cobertura dada. */
function blend(png, x, y, color, coverage) {
  if (coverage <= 0) return;
  const i = (png.width * y + x) << 2;
  const a = clamp01(coverage);
  const dstA = png.data[i + 3] / 255;
  const outA = a + dstA * (1 - a);
  if (outA === 0) return;

  for (let c = 0; c < 3; c += 1) {
    const src = color[c] / 255;
    const dst = png.data[i + c] / 255;
    png.data[i + c] = Math.round(((src * a + dst * dstA * (1 - a)) / outA) * 255);
  }
  png.data[i + 3] = Math.round(outA * 255);
}

const SAMPLES = 4;

/**
 * Recorre el lienzo evaluando `sdf` con supermuestreo de 4×4. Devuelve la
 * cobertura por píxel, que es lo que da el antialiasing.
 */
function rasterize(png, sdf, onPixel) {
  const step = 1 / SAMPLES;
  const offset = step / 2;

  for (let y = 0; y < png.height; y += 1) {
    for (let x = 0; x < png.width; x += 1) {
      let hits = 0;
      for (let sy = 0; sy < SAMPLES; sy += 1) {
        for (let sx = 0; sx < SAMPLES; sx += 1) {
          const px = x + offset + sx * step;
          const py = y + offset + sy * step;
          if (sdf(px, py) <= 0) hits += 1;
        }
      }
      if (hits > 0) onPixel(x, y, hits / (SAMPLES * SAMPLES));
    }
  }
}

/* -------------------------------------------------------------- el mark */

/**
 * Dibuja el mark centrado.
 *
 * @param {number} scale  altura del glifo como fracción del lienzo
 * @param {number[]|null} background  color de fondo, o null para transparente
 * @param {boolean} withDot  incluir el punto de acento
 * @param {number} cornerRadius  radio del fondo, en fracción del lienzo
 */
function drawMark(png, { scale, background, glyphColor, withDot, cornerRadius }) {
  const size = png.width;

  if (background) {
    const r = cornerRadius * size;
    rasterize(
      png,
      (x, y) => sdRoundedRect(x, y, size / 2, size / 2, size / 2, size / 2, r),
      (x, y, coverage) => blend(png, x, y, background, coverage),
    );
  }

  const glyphH = size * scale;
  const glyphW = glyphH * GLYPH.bowlW;
  const originX = (size - glyphW) / 2;
  const originY = (size - glyphH) / 2;

  const toGlyph = (x, y) => [(x - originX) / glyphH, (y - originY) / glyphH];

  // La contra se resta analíticamente, en la misma pasada que el relleno.
  // Pintarla aparte dejaba una costura: el borde compartido entre el astil y el
  // hueco recibía antialiasing dos veces. Así cada píxel tiene una sola
  // cobertura, y el hueco queda transparente sin tener que borrar nada.
  rasterize(
    png,
    (x, y) => {
      const [nx, ny] = toGlyph(x, y);
      return Math.max(sdGlyphSolid(nx, ny), -sdGlyphCounter(nx, ny));
    },
    (x, y, coverage) => blend(png, x, y, glyphColor, coverage),
  );

  if (withDot) {
    const { cx, cy, r } = GLYPH.dot;
    rasterize(
      png,
      (x, y) => {
        const [nx, ny] = toGlyph(x, y);
        return sdCircle(nx, ny, cx, cy, r);
      },
      (x, y, coverage) => blend(png, x, y, ACCENT, coverage),
    );
  }
}

function write(name, png) {
  const file = path.join(OUT, name);
  fs.writeFileSync(file, PNG.sync.write(png));
  console.log(`  ${name}  ${png.width}×${png.height}`);
}

/* ------------------------------------------------------------------ main */

console.log('Generando iconos de Easy Parking…');

// icon.png — iOS aplica su propia máscara, así que va a sangre y sin redondear.
{
  const png = createCanvas(1024);
  drawMark(png, {
    scale: 0.46,
    background: INK,
    glyphColor: WHITE,
    withDot: true,
    cornerRadius: 0,
  });
  write('icon.png', png);
}

// favicon.png — aquí sí redondeamos, porque nadie lo enmascara por nosotros.
{
  const png = createCanvas(96);
  drawMark(png, {
    scale: 0.5,
    background: INK,
    glyphColor: WHITE,
    withDot: true,
    cornerRadius: 0.22,
  });
  write('favicon.png', png);
}

// splash-icon.png — sobre el blanco del splash, el mark completo.
{
  const png = createCanvas(512);
  drawMark(png, {
    scale: 0.46,
    background: INK,
    glyphColor: WHITE,
    withDot: true,
    cornerRadius: 0.22,
  });
  write('splash-icon.png', png);
}

// Android adaptativo: fondo y primer plano van separados, y el sistema recorta.
// El glifo se queda dentro del 66 % central para sobrevivir a cualquier máscara.
{
  const png = createCanvas(1024);
  drawMark(png, {
    scale: 1,
    background: INK,
    glyphColor: INK,
    withDot: false,
    cornerRadius: 0,
  });
  write('android-icon-background.png', png);
}

{
  const png = createCanvas(1024);
  drawMark(png, {
    scale: 0.30,
    background: null,
    glyphColor: WHITE,
    withDot: true,
    cornerRadius: 0,
  });
  write('android-icon-foreground.png', png);
}

{
  const png = createCanvas(1024);
  drawMark(png, {
    scale: 0.30,
    background: null,
    glyphColor: WHITE,
    withDot: false,
    cornerRadius: 0,
  });
  write('android-icon-monochrome.png', png);
}

console.log('Listo.');
