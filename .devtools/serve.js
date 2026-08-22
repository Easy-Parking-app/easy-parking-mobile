const http = require('http');
const fs = require('fs');
const path = require('path');
http.createServer((req, res) => {
  const file = path.join(__dirname, 'device.html');
  res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
  res.end(fs.readFileSync(file));
}).listen(8090, () => console.log('device preview on http://localhost:8090'));
