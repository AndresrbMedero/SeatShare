const http = require('http');

const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/html' });
  res.end('Hola, mundo');
});

server.listen(3000, () => {
  console.log('El servidor está escuchando en el puerto 3000');
});