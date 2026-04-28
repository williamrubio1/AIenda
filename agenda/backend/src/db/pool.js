// src/db/pool.js
// Pool de conexiones MySQL. Todo acceso a la BD pasa por este módulo.

const mysql = require('mysql2/promise');
const { DB } = require('../config/env');

const pool = mysql.createPool({
  // ── Credenciales ────────────────────────────────────────────────────────
  host:     DB.host,
  port:     DB.port,
  user:     DB.user,
  password: DB.password,
  database: DB.database,

  // ── Charset y zona horaria ───────────────────────────────────────────────
  charset:  'utf8mb4',
  timezone: '-05:00',             // GMT-5 Bogotá

  // ── Pool — optimizado para hosting compartido ────────────────────────────
  waitForConnections: true,       // Encola en vez de rechazar cuando no hay conexión libre
  connectionLimit:    8,          // 5–10 recomendado para Hostinger (balance rendimiento/recursos)
  queueLimit:         0,          // Cola ilimitada (las peticiones esperan en vez de fallar)
  connectTimeout:     10_000,     // 10 s máximo para establecer una conexión nueva

  // ── Keep-alive (evita que el servidor MySQL cierre conexiones ociosas) ───
  enableKeepAlive:       true,
  keepAliveInitialDelay: 30_000, // Primer ping a los 30 s de inactividad

  // ── Comportamiento de queries ────────────────────────────────────────────
  namedPlaceholders:  true,       // Permite parámetros con nombre (:param) además de ?
  decimalNumbers:     true,       // Retorna DECIMAL/NUMERIC como number, no como string
  multipleStatements: false,      // Deshabilitado por seguridad (previene SQLi de múltiples sentencias)
});

// ── Eventos del pool ─────────────────────────────────────────────────────────
pool.on('connection', (conn) => {
  // Configura zona horaria en cada conexión nueva que crea el pool
  conn.query("SET time_zone = '-05:00'").catch((err) => {
    console.error('[MySQL] Error al configurar time_zone en conexión nueva:', err.message);
  });
});

pool.on('enqueue', () => {
  console.warn('[MySQL] Todas las conexiones ocupadas. Request en cola...');
});

// ── Wrapper seguro para transacciones ────────────────────────────────────────
// Garantiza conn.release() incluso si ocurre un error, evitando fugas de conexión.
// Uso: await pool.withTransaction(async (conn) => { ... })
pool.withTransaction = async function withTransaction(fn) {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const result = await fn(conn);
    await conn.commit();
    return result;
  } catch (err) {
    await conn.rollback().catch(() => {}); // rollback nunca debe tirar otro error
    throw err;
  } finally {
    conn.release();                        // siempre se libera, incluso con error
  }
};

// ── Wrapper seguro para queries simples ───────────────────────────────────────
// Obtiene conexión, ejecuta el query y la libera garantizadamente.
// Uso: await pool.withConnection(async (conn) => conn.execute(sql, params))
pool.withConnection = async function withConnection(fn) {
  const conn = await pool.getConnection();
  try {
    return await fn(conn);
  } finally {
    conn.release();
  }
};

module.exports = pool;
