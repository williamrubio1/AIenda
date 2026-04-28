// src/app.js

process.env.TZ = 'America/Bogota';

const path      = require('path');
const express   = require('express');
const helmet    = require('helmet');
const cors      = require('cors');
const rateLimit = require('express-rate-limit');

const authRoutes           = require('./routes/auth.routes');
const citasRoutes          = require('./routes/citas.routes');
const disponibilidadRoutes = require('./routes/disponibilidad.routes');
const reportesRoutes       = require('./routes/reportes.routes');

const app = express();

// ── Seguridad ──────────────────────────────────────────────────────────────
// CSP configurado para permitir el build de Vite (scripts externos, sin inline)
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc:  ["'self'"],
      scriptSrc:   ["'self'"],
      styleSrc:    ["'self'", "'unsafe-inline'"], // Vite inyecta estilos inline en dev; en prod algunos frameworks lo usan
      imgSrc:      ["'self'", 'data:', 'blob:'],
      connectSrc:  ["'self'"],
      fontSrc:     ["'self'", 'data:'],
      objectSrc:   ["'none'"],
      upgradeInsecureRequests: [],
    },
  },
  crossOriginEmbedderPolicy: false, // Evita bloquear recursos en Hostinger
}));

// ── Entorno ────────────────────────────────────────────────────────────────
const isProduction = process.env.NODE_ENV === 'production';

// CORS solo en desarrollo local (en producción el frontend está en el mismo origen)
if (!isProduction) {
  app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
  }));
}

// ── Parseo de cuerpo (debe ir antes de rutas que usen req.body) ────────────
app.use(express.json({ limit: '1mb' }));

// ── Rate limiting global para /api ─────────────────────────────────────────
app.use('/api', rateLimit({
  windowMs: 15 * 60 * 1000,  // 15 minutos
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Demasiadas solicitudes. Intente más tarde.' },
}));

// ── Rutas de API ───────────────────────────────────────────────────────────
app.use('/api/auth',           authRoutes);
app.use('/api/citas',          citasRoutes);
app.use('/api/disponibilidad', disponibilidadRoutes);
app.use('/api/reportes',       reportesRoutes);

// Health check (no consume rate limit)
app.get('/api/health', (_req, res) => res.json({ status: 'ok', env: process.env.NODE_ENV }));

// ── Frontend estático (build de Vite en /public_html) ─────────────────────
const frontendBuild = path.join(__dirname, '..', 'public_html');
app.use(express.static(frontendBuild, {
  maxAge: isProduction ? '7d' : 0,
  etag: true,
}));

// SPA fallback — React Router maneja las rutas del cliente
app.get('*', (req, res) => {
  if (req.path.startsWith('/api')) {
    return res.status(404).json({ error: 'Ruta no encontrada' });
  }
  res.sendFile(path.join(frontendBuild, 'index.html'));
});

// ── Manejador global de errores ────────────────────────────────────────────
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, _next) => {
  const status = err.status || 500;

  // En producción no exponer detalles internos
  if (isProduction && status === 500) {
    console.error('[App] Error interno:', err.message, err.stack);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }

  res.status(status).json({ error: err.message || 'Error interno del servidor' });
});

module.exports = app;