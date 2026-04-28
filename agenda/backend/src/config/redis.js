// src/config/redis.js
// Cliente Redis (ioredis) — completamente opcional.
// Si REDIS_HOST no está configurado, este módulo exporta null y la app sigue funcionando.

const { REDIS } = require('./env');

// Si Redis no está configurado en variables de entorno, no intentar conectar
if (!REDIS) {
  console.warn('[Redis] REDIS_HOST no configurado. Redis desactivado.');
  module.exports = null;
  return; // Node.js permite return a nivel de módulo (CommonJS)
}

const Redis = require('ioredis');

const redis = new Redis({
  host:          REDIS.host,
  port:          REDIS.port,
  password:      REDIS.password,
  retryStrategy: (times) => {
    if (times > 3) {
      console.warn('[Redis] Sin conexión tras 3 intentos. Desactivando reintentos.');
      return null; // Deja de reintentar
    }
    return Math.min(times * 200, 2000);
  },
  lazyConnect:   true, // No conecta hasta que se use
  enableOfflineQueue: false, // No encolar comandos si está desconectado
});

redis.on('connect', () => console.log('[Redis] Conectado'));
redis.on('error',   (err) => console.error('[Redis] Error:', err.message));

module.exports = redis;
