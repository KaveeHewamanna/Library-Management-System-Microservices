require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const jwt = require('jsonwebtoken');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();
const PORT = process.env.PORT || 3000;

// ─── Middleware ───────────────────────────────────────────────────────────────
app.use(cors());
app.use(morgan('combined'));
// Removed express.json() because it consumes the body stream before the proxy can forward it!

// ─── Service URLs ─────────────────────────────────────────────────────────────
const USER_SERVICE_URL       = process.env.USER_SERVICE_URL       || 'http://localhost:3001';
const BOOK_SERVICE_URL       = process.env.BOOK_SERVICE_URL       || 'http://localhost:3002';
const RESERVATION_SERVICE_URL = process.env.RESERVATION_SERVICE_URL || 'http://localhost:3003';
const BORROW_FINE_SERVICE_URL = process.env.BORROW_FINE_SERVICE_URL || 'http://localhost:3004';

// ─── JWT Authentication Middleware (applied only to /api/* routes) ───────────
const jwtMiddleware = (req, res, next) => {
  // Allow register and login without token
  if (
    req.originalUrl.startsWith('/api/users/register') ||
    req.originalUrl.startsWith('/api/users/login')
  ) {
    return next();
  }

  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Access denied. No token provided. Please login first.',
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(403).json({
      success: false,
      message: 'Invalid or expired token. Please login again.',
    });
  }
};

// ─── Gateway Landing Page (PUBLIC — no JWT needed) ──────────────────────────
app.get('/', (req, res) => {
  res.send(`
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Library Management System — API Gateway</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      background: linear-gradient(135deg, #0f0c29, #302b63, #24243e);
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #fff;
    }
    .container { max-width: 860px; width: 100%; padding: 2rem; }
    .header { text-align: center; margin-bottom: 3rem; }
    .header h1 { font-size: 2.5rem; font-weight: 700; background: linear-gradient(90deg, #a78bfa, #60a5fa); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
    .header p { color: #94a3b8; margin-top: 0.5rem; font-size: 1rem; }
    .badge { display: inline-block; background: rgba(167,139,250,0.15); border: 1px solid rgba(167,139,250,0.4); color: #a78bfa; padding: 0.3rem 0.8rem; border-radius: 999px; font-size: 0.8rem; margin-top: 1rem; }
    .services { display: grid; grid-template-columns: repeat(auto-fit, minmax(380px, 1fr)); gap: 1.2rem; }
    .card {
      background: rgba(255,255,255,0.05);
      border: 1px solid rgba(255,255,255,0.1);
      border-radius: 16px;
      padding: 1.5rem;
      backdrop-filter: blur(10px);
      transition: transform 0.2s, border-color 0.2s;
    }
    .card:hover { transform: translateY(-4px); border-color: rgba(167,139,250,0.5); }
    .card-header { display: flex; align-items: center; gap: 1rem; margin-bottom: 1rem; }
    .icon { font-size: 2rem; }
    .card-title { font-size: 1.1rem; font-weight: 600; }
    .card-owner { font-size: 0.8rem; color: #64748b; }
    .port { display: inline-block; background: rgba(96,165,250,0.15); border: 1px solid rgba(96,165,250,0.3); color: #60a5fa; padding: 0.2rem 0.6rem; border-radius: 6px; font-size: 0.75rem; font-family: monospace; }
    .links { display: flex; gap: 0.8rem; flex-wrap: wrap; margin-top: 1rem; }
    .btn { padding: 0.5rem 1rem; border-radius: 8px; font-size: 0.85rem; text-decoration: none; font-weight: 500; transition: opacity 0.2s; }
    .btn:hover { opacity: 0.8; }
    .btn-swagger { background: #85c261; color: #1a1a1a; }
    .btn-direct { background: rgba(255,255,255,0.1); color: #e2e8f0; border: 1px solid rgba(255,255,255,0.2); }
    .info-box { background: rgba(96,165,250,0.1); border: 1px solid rgba(96,165,250,0.3); border-radius: 12px; padding: 1.2rem; margin-bottom: 2rem; font-size: 0.9rem; color: #93c5fd; }
    .info-box strong { color: #60a5fa; }
  </style>
</head>
<body>
<div class="container">
  <div class="header">
    <h1>📚 Library Management System</h1>
    <p>IT4020: Modern Topics in IT — Assignment 2 — 2026</p>
    <span class="badge">🌐 API Gateway — Port 3000</span>
  </div>

  <div class="info-box">
    <strong>How to use:</strong> All API calls are proxied through this gateway.
    First call <code>POST /api/users/login</code> to obtain a JWT token,
    then pass it as <code>Authorization: Bearer &lt;token&gt;</code> in all subsequent requests.
  </div>

  <div class="services">
    <div class="card">
      <div class="card-header">
        <span class="icon">👤</span>
        <div>
          <div class="card-title">User Management Service</div>
          <div class="card-owner">IT22563750 &nbsp; <span class="port">:3001</span></div>
        </div>
      </div>
      <div class="links">
        <a href="http://localhost:3001/api-docs" target="_blank" class="btn btn-swagger">📘 Swagger Docs</a>
        <a href="http://localhost:3001" target="_blank" class="btn btn-direct">Direct Service</a>
      </div>
    </div>

    <div class="card">
      <div class="card-header">
        <span class="icon">📗</span>
        <div>
          <div class="card-title">Book Management Service</div>
          <div class="card-owner">IT22604958 &nbsp; <span class="port">:3002</span></div>
        </div>
      </div>
      <div class="links">
        <a href="http://localhost:3002/api-docs" target="_blank" class="btn btn-swagger">📘 Swagger Docs</a>
        <a href="http://localhost:3002" target="_blank" class="btn btn-direct">Direct Service</a>
      </div>
    </div>

    <div class="card">
      <div class="card-header">
        <span class="icon">📅</span>
        <div>
          <div class="card-title">Reservation Management Service</div>
          <div class="card-owner">IT22584090 &nbsp; <span class="port">:3003</span></div>
        </div>
      </div>
      <div class="links">
        <a href="http://localhost:3003/api-docs" target="_blank" class="btn btn-swagger">📘 Swagger Docs</a>
        <a href="http://localhost:3003" target="_blank" class="btn btn-direct">Direct Service</a>
      </div>
    </div>

    <div class="card">
      <div class="card-header">
        <span class="icon">💰</span>
        <div>
          <div class="card-title">Borrow &amp; Fine Management Service</div>
          <div class="card-owner">IT22258694 &nbsp; <span class="port">:3004</span></div>
        </div>
      </div>
      <div class="links">
        <a href="http://localhost:3004/api-docs" target="_blank" class="btn btn-swagger">📘 Swagger Docs</a>
        <a href="http://localhost:3004" target="_blank" class="btn btn-direct">Direct Service</a>
      </div>
    </div>
  </div>
</div>
</body>
</html>
  `);
});

// ─── Proxy Routes (JWT enforced here for all /api/* except public paths) ──────
const proxyOptions = (target) => ({
  target,
  changeOrigin: true,
  on: {
    error: (err, req, res) => {
      console.error(`[Gateway] Proxy error to ${target}: ${err.message}`);
      res.status(502).json({
        success: false,
        message: `Service unavailable. Could not reach ${target}`,
        error: err.message,
      });
    },
  },
});

app.use('/api/users',        jwtMiddleware, createProxyMiddleware(proxyOptions(USER_SERVICE_URL)));
app.use('/api/books',        jwtMiddleware, createProxyMiddleware(proxyOptions(BOOK_SERVICE_URL)));
app.use('/api/reservations', jwtMiddleware, createProxyMiddleware(proxyOptions(RESERVATION_SERVICE_URL)));
app.use('/api/borrows',      jwtMiddleware, createProxyMiddleware(proxyOptions(BORROW_FINE_SERVICE_URL)));

// ─── 404 Handler ─────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.path}`,
    availableRoutes: ['/api/users', '/api/books', '/api/reservations', '/api/borrows'],
  });
});

// ─── Start Server ─────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log('\n╔══════════════════════════════════════════════════╗');
  console.log('║        Library Management System Gateway         ║');
  console.log('╚══════════════════════════════════════════════════╝');
  console.log(`  🌐 Gateway running at   : http://localhost:${PORT}`);
  console.log(`  🔀 User Service         : ${USER_SERVICE_URL}`);
  console.log(`  🔀 Book Service         : ${BOOK_SERVICE_URL}`);
  console.log(`  🔀 Reservation Service  : ${RESERVATION_SERVICE_URL}`);
  console.log(`  🔀 Borrow/Fine Service  : ${BORROW_FINE_SERVICE_URL}`);
  console.log('──────────────────────────────────────────────────\n');
});
