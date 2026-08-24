/**
 * Genera los catálogos de idioma a partir del español.
 *
 *   node scripts/translate.js --check       qué falta, sin tocar la red
 *   node scripts/translate.js               traduce lo que falte
 *   node scripts/translate.js --force       vuelve a traducir todo
 *   node scripts/translate.js --locale fr   solo ese idioma
 *
 * Traduce **aquí, una vez**, no en el teléfono. Una API de traducción en
 * tiempo de ejecución costaría por cada pantalla que alguien abre, necesitaría
 * red —y esta app se usa en sótanos de parqueaderos— y traduciría la misma
 * palabra distinto en cada sitio. Lo que se genera aquí se revisa y se
 * versiona.
 *
 * Por defecto solo rellena lo que falta, así que una corrección hecha a mano en
 * un catálogo sobrevive. `--force` la borra.
 *
 * Necesita una clave de Google Cloud Translation:
 *
 *   1. Habilitar "Cloud Translation API" en el proyecto Easy Parking:
 *      https://console.cloud.google.com/apis/library/translate.googleapis.com?project=project-bb24b33c-cba3-4349-bb5
 *   2. Crear una clave restringida a esa API.
 *   3. GOOGLE_TRANSLATE_KEY=... en .env.local
 *
 * Los primeros 500.000 caracteres al mes son gratis. Este catálogo son unos
 * 2.000, así que traducir a diez idiomas cabe de sobra.
 */

const fs = require('fs');
const path = require('path');

const LOCALES_DIR = path.join(__dirname, '..', 'src', 'i18n', 'locales');
const SOURCE = 'es';

/** Idiomas destino. Añadir uno aquí es todo lo que hace falta. */
const TARGETS = ['en'];

/* ----------------------------------------------------------- interpolaciones */

/**
 * Protege los `{{nombre}}` antes de traducir.
 *
 * Un traductor automático los ve como palabras: los traduce, les cambia el
 * orden o les mete espacios, y la interpolación deja de encontrarlos. Se
 * sustituyen por marcas que ningún idioma reconoce y se reponen después.
 */
function protect(text) {
  const slots = [];
  const masked = text.replace(/\{\{[^}]+\}\}/g, (match) => {
    slots.push(match);
    return `⟦${slots.length - 1}⟧`;
  });
  return { masked, slots };
}

function restore(text, slots) {
  return text.replace(/⟦\s*(\d+)\s*⟧/g, (_, index) => slots[Number(index)] ?? '');
}

/* -------------------------------------------------------------- traducción */

async function translateBatch(texts, target, key) {
  const response = await fetch(
    `https://translation.googleapis.com/language/translate/v2?key=${key}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ q: texts, source: SOURCE, target, format: 'text' }),
    },
  );

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`La API respondió ${response.status}: ${detail.slice(0, 300)}`);
  }

  const body = await response.json();
  return body.data.translations.map((item) => item.translatedText);
}

/* ------------------------------------------------------------------ ficheros */

const readCatalog = (locale) => {
  const file = path.join(LOCALES_DIR, `${locale}.ts`);
  if (!fs.existsSync(file)) return {};
  // Node 24 lee TypeScript directo, así que el catálogo se importa tal cual en
  // vez de parsearse con expresiones regulares.
  delete require.cache[require.resolve(file)];
  return require(file)[locale] ?? {};
};

function writeCatalog(locale, entries) {
  const body = Object.entries(entries)
    .map(([key, value]) => `  ${JSON.stringify(key)}: ${JSON.stringify(value)},`)
    .join('\n');

  const contents = `import type { TranslationKey } from './es';

/**
 * Generado por \`npm run translate\` desde \`es.ts\`.
 *
 * Se puede corregir a mano: el script solo rellena las claves que faltan, así
 * que una corrección sobrevive. \`--force\` sí las reescribe todas.
 *
 * \`Partial\` a propósito: una clave sin traducir cae al español en tiempo de
 * ejecución, que es mejor que romper la compilación por una cadena nueva.
 * \`--check\` dice qué falta.
 */
export const ${locale}: Partial<Record<TranslationKey, string>> = {
${body}
};
`;

  fs.writeFileSync(path.join(LOCALES_DIR, `${locale}.ts`), contents);
}

/* ---------------------------------------------------------------------- main */

async function main() {
  const args = process.argv.slice(2);
  const check = args.includes('--check');
  const force = args.includes('--force');
  const only = args.includes('--locale') ? args[args.indexOf('--locale') + 1] : null;

  const source = readCatalog(SOURCE);
  const sourceKeys = Object.keys(source);
  const targets = only ? [only] : TARGETS;

  console.log(`Español: ${sourceKeys.length} claves\n`);

  let missingTotal = 0;

  for (const locale of targets) {
    const existing = readCatalog(locale);
    const missing = force ? sourceKeys : sourceKeys.filter((key) => !existing[key]);
    const extra = Object.keys(existing).filter((key) => !(key in source));

    console.log(
      `${locale}: ${sourceKeys.length - missing.length}/${sourceKeys.length} traducidas` +
        (extra.length > 0 ? `, ${extra.length} sobran (claves borradas del español)` : ''),
    );

    missingTotal += missing.length;

    if (check) {
      for (const key of missing.slice(0, 10)) console.log(`   falta  ${key}`);
      if (missing.length > 10) console.log(`   … y ${missing.length - 10} más`);
      continue;
    }

    if (missing.length === 0 && extra.length === 0) continue;

    if (missing.length > 0) {
      const key = process.env.GOOGLE_TRANSLATE_KEY;
      if (!key) {
        console.error(
          '\nFalta GOOGLE_TRANSLATE_KEY. Ver las instrucciones al principio de este archivo.',
        );
        process.exit(1);
      }

      const protectedTexts = missing.map((k) => protect(source[k]));
      const translated = await translateBatch(
        protectedTexts.map((p) => p.masked),
        locale,
        key,
      );

      missing.forEach((k, index) => {
        existing[k] = restore(translated[index], protectedTexts[index].slots);
      });
    }

    // Las claves que ya no existen en español se caen solas: el catálogo se
    // reescribe siguiendo el orden del origen.
    const ordered = {};
    for (const k of sourceKeys) if (existing[k]) ordered[k] = existing[k];
    writeCatalog(locale, ordered);

    console.log(`   escrito src/i18n/locales/${locale}.ts`);
  }

  if (check && missingTotal === 0) console.log('\nTodo traducido.');
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
