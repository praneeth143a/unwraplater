const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const PORT = 3000;
const MIME_TYPES = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'text/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
};

const server = http.createServer((req, res) => {
  console.log(`${req.method} ${req.url}`);
  
  // Parse the URL
  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;
  
  // Handle root URL or capsule parameter
  let filePath;
  if (pathname === '/' || pathname === '/index.html' || pathname === '') {
    filePath = path.join(__dirname, 'index.html');
  } else {
    filePath = path.join(__dirname, pathname);
  }
  
  // Get file extension
  const extname = path.extname(filePath).toLowerCase();
  const contentType = MIME_TYPES[extname] || 'application/octet-stream';
  
  // Read file
  fs.readFile(filePath, (err, content) => {
    if (err) {
      if (err.code === 'ENOENT') {
        // If path not found but has capsule parameter, serve index.html
        if (parsedUrl.query.capsule) {
          fs.readFile(path.join(__dirname, 'index.html'), (indexErr, indexContent) => {
            if (indexErr) {
              res.writeHead(404);
              res.end('404 - File Not Found');
            } else {
              res.writeHead(200, { 'Content-Type': 'text/html' });
              res.end(indexContent, 'utf-8');
            }
          });
        } else {
          // File not found
          res.writeHead(404);
          res.end('404 - File Not Found');
        }
      } else {
        // Server error
        res.writeHead(500);
        res.end(`Server Error: ${err.code}`);
      }
    } else {
      // Success
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content, 'utf-8');
    }
  });
});

server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}/`);
}); 