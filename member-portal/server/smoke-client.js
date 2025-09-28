// Tiny health check client
const http = require('http');

function get(path) {
  return new Promise((resolve, reject) => {
    const req = http.get({ host: '127.0.0.1', port: 5001, path }, (res) => {
      let data = '';
      res.on('data', (c) => (data += c));
      res.on('end', () => resolve({ status: res.statusCode, data }));
    });
    req.on('error', reject);
  });
}

(async () => {
  try {
    const r1 = await get('/health');
    console.log('HEALTH', r1.status, r1.data);
    const r2 = await get('/test');
    console.log('TEST', r2.status, r2.data);
  } catch (e) {
    console.error('Client error:', e.message);
    process.exit(1);
  }
})();
