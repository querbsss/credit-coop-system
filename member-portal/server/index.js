const express = require('express');
const app = express();
const cors = require('cors');
require('dotenv').config({ path: require('path').join(__dirname, '.env') });

//middlewares
app.use(express.json());

app.use(cors({
  origin: [/^http:\/\/localhost:\d+$/],
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization', 'token']
}));

// Add request logging
app.use((req, res, next) => {
  console.log(`📥 ${req.method} ${req.path}`, { body: req.body, headers: req.headers });
  next();
});

//routes

// Simple test route
app.get('/test', (req, res) => {
  res.json({ message: 'Server is working!', timestamp: new Date() });
});

// Very simple health route (no JSON parsing needed)
app.get('/health', (req, res) => {
  res.type('text/plain').send('OK');
});

// Root ping
app.get('/', (req, res) => {
  res.type('text/plain').send('Member API up');
});

//login route
app.use('/auth', require('./routes/coopauth'));

app.use('/dashboard', require('./routes/dashboard'));
app.use('/transactions', require('./routes/transactions'));

const PORT = process.env.PORT || 5002;
const HOST = process.env.HOST || '0.0.0.0';
// Ensure minimal schema for dashboard routes on startup (non-fatal if fails)
try {
  const { ensureDashboardSchema } = require('./bootstrap');
  ensureDashboardSchema().catch(() => {});
} catch {}

const server = app.listen(PORT, HOST, () => {
  console.log(`Server is running on port ${PORT}`);
});

server.on('listening', () => {
  try {
    const addr = server.address();
    console.log('Listening on:', addr);
  } catch {}
});

process.on('uncaughtException', (err) => {
  console.error('Uncaught exception:', err && (err.stack || err.message || err));
});

process.on('unhandledRejection', (reason) => {
  console.error('Unhandled rejection:', reason && (reason.stack || reason.message || reason));
});

process.on('exit', (code) => {
  console.log('Process exiting with code', code);
});