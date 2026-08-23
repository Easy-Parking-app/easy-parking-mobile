/**
 * Arranca Expo anunciando la IP correcta de la red local.
 *
 * El problema que resuelve: `expo start --host lan` elige una de las IPs de la
 * maquina, y si hay adaptadores virtuales —VirtualBox, VMware, Docker, WSL— se
 * queda con la equivocada. El QR entonces apunta a una red que el telefono no
 * puede alcanzar y Expo Go se queda cargando para siempre, sin decir por que.
 *
 * En este equipo pasa: VirtualBox expone 192.168.56.1 y el Wi-Fi real es otro.
 *
 * Aqui se eligen las interfaces por puntuacion y se pasa la ganadora en
 * EXPO_PACKAGER_HOSTNAME, que es la variable que el CLI respeta por encima de
 * su propia deteccion.
 *
 *   node scripts/start-lan.js            # equivale a npm run start:lan
 *   node scripts/start-lan.js --clear    # los argumentos se pasan a expo
 */

const { spawn } = require('child_process');
const os = require('os');

/** Rangos que casi siempre son adaptadores virtuales, no la red de casa. */
const VIRTUAL_RANGES = [
  /^192\.168\.56\./, // VirtualBox host-only
  /^192\.168\.99\./, // Docker Machine
  /^172\.(1[6-9]|2\d|3[01])\./, // Docker / WSL
  /^10\.0\.75\./, // Docker for Windows
  /^169\.254\./, // link-local: no enruta a ningun sitio
];

const WIRELESS_HINTS = /wi-?fi|wlan|wireless|airport|^en0$/i;
const VIRTUAL_HINTS = /virtualbox|vmware|hyper-v|docker|wsl|loopback|vethernet|tailscale|zerotier/i;

/**
 * Puntua una candidata. Mas alto es mejor; negativo la descarta.
 * La heuristica prioriza lo que el telefono puede alcanzar de verdad.
 */
function score(name, address) {
  if (VIRTUAL_RANGES.some((range) => range.test(address))) return -1;
  if (VIRTUAL_HINTS.test(name)) return -1;

  let points = 0;
  if (WIRELESS_HINTS.test(name)) points += 100; // el telefono esta en el Wi-Fi
  if (/^192\.168\./.test(address)) points += 20; // red domestica tipica
  if (/^10\./.test(address)) points += 10;
  return points;
}

function findLanAddress() {
  const candidates = [];

  for (const [name, addresses] of Object.entries(os.networkInterfaces())) {
    for (const entry of addresses ?? []) {
      // Node 18+ devuelve family como numero en algunas plataformas.
      const isIPv4 = entry.family === 'IPv4' || entry.family === 4;
      if (!isIPv4 || entry.internal) continue;

      const points = score(name, entry.address);
      if (points >= 0) candidates.push({ name, address: entry.address, points });
    }
  }

  candidates.sort((a, b) => b.points - a.points);
  return candidates;
}

const candidates = findLanAddress();
const [winner, ...rest] = candidates;

if (!winner) {
  console.error(
    'No se encontro ninguna IP de red local utilizable.\n' +
      'Conectate a una red Wi-Fi, o usa el tunel:  npm run start:tunnel',
  );
  process.exit(1);
}

console.log(`Anunciando ${winner.address}  (${winner.name})`);
if (rest.length > 0) {
  const others = rest.map((c) => `${c.address} (${c.name})`).join(', ');
  console.log(`Descartadas: ${others}`);
}
console.log('El telefono tiene que estar en esa misma red.\n');

/**
 * Hay que pasar por shell —en Windows `npx` es un .cmd y Node se niega a
 * lanzarlo directamente desde el parche de CVE-2024-27980—, pero pasarle
 * ademas un array de argumentos hace que Node avise (DEP0190) de que los
 * concatena sin escapar. Se evita concatenandolos aqui, ya entrecomillados.
 */
const quote = (arg) => (/[\s"]/.test(arg) ? `"${arg.replace(/"/g, '\\"')}"` : arg);

const command = ['npx', 'expo', 'start', '--host', 'lan', ...process.argv.slice(2)]
  .map(quote)
  .join(' ');

const child = spawn(command, {
  stdio: 'inherit',
  shell: true,
  env: { ...process.env, EXPO_PACKAGER_HOSTNAME: winner.address },
});

child.on('exit', (code) => process.exit(code ?? 0));
