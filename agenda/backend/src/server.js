// src/server.js

const app  = require('./app');
const pool = require('./db/pool');

// Redis opcional — la app NO falla si no está disponible
try {
  require('./config/redis');
} catch {
  console.warn('[Redis] No disponible, continuando sin Redis');
}

// Puerto obligatorio desde variable de entorno (requerido por Hostinger)
const PORT = process.env.PORT;
if (!PORT) {
  console.error('[Servidor] ERROR: process.env.PORT no está definido');
  process.exit(1);
}

// ── Handlers de errores no capturados ─────────────────────────────────────
process.on('uncaughtException', (err) => {
  console.error('[Servidor] uncaughtException:', err.message);
  // No terminamos el proceso por errores recuperables
});

process.on('unhandledRejection', (reason) => {
  console.error('[Servidor] unhandledRejection:', reason);
});

// ── Shutdown graceful ──────────────────────────────────────────────────────
let server;

async function cerrar(signal) {
  console.log(`[Servidor] ${signal} recibido. Cerrando...`);
  server.close(async () => {
    try {
      await pool.end();
      console.log('[MySQL] Pool cerrado');
    } catch (err) {
      console.error('[MySQL] Error al cerrar pool:', err.message);
    }
    process.exit(0);
  });
}

process.on('SIGTERM', () => cerrar('SIGTERM'));
process.on('SIGINT',  () => cerrar('SIGINT'));

// ── Inicio ─────────────────────────────────────────────────────────────────
async function iniciar() {
  // Verificar conexión a MySQL antes de levantar el servidor
  try {
    const conn = await pool.getConnection();
    await conn.execute("SET time_zone = '-05:00'");
    conn.release();
    console.log('[MySQL] Conectado y zona horaria configurada');
  } catch (err) {
    console.error('[MySQL] Error de conexión al iniciar:', err.message);
    process.exit(1);
  }

  server = app.listen(PORT, () => {
    console.log(`[Servidor] Escuchando en puerto ${PORT} (${process.env.NODE_ENV || 'development'})`);
  });

  server.on('error', (err) => {
    console.error('[Servidor] Error al escuchar:', err.message);
    process.exit(1);
  });
}

iniciar();