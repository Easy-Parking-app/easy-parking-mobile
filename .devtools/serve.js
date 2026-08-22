/**
 * Servidor mínimo para la vista de dispositivo.
 *
 * Sirve `device.html`, que mete la app de Expo Web dentro de un marco de
 * teléfono. Pensado para abrirse en el Simple Browser de VS Code, de modo que
 * la vista previa quede dentro del editor, junto al código.
 */

const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = Number(process.env.PORT ?? 8090);
const FILE = path.join(__dirname, 'device.html');

const server = http.createServer((req, res) => {
  if (req.url === '/health') {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('ok');
    return;
  }

  // Se lee en cada petición para que editar el marco no obligue a reiniciar.
  fs.readFile(FILE, (error, body) => {
    if (error) {
      res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('No se pudo leer device.html: ' + error.message);
      return;
    }
    res.writeHead(200, {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'no-store',
    });
    res.end(body);
  });
});

server.on('error', (error) => {
  if (error.code === 'EADDRINUSE') {
    console.log(`El puerto ${PORT} ya está ocupado — probablemente la vista ya está corriendo.`);
    process.exit(0);
  }
  throw error;
});

server.listen(PORT, () => {
  console.log(`Vista de dispositivo lista en http://localhost:${PORT}`);
  console.log('En VS Code: Ctrl+Shift+P → "Simple Browser: Show" → pega esa URL.');
});
