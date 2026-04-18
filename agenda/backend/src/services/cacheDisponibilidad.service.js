// src/services/cacheDisponibilidad.service.js
// Caché en memoria para disponibilidad de médicos. TTL = 90 segundos.

const pool           = require('../db/pool');
const DISPONIBILIDAD = require('../db/queries/disponibilidad.queries');

const TTL   = 90 * 1000; // 90 segundos en ms
const cache = new Map();

function clave(medicoId, fecha) {
  return `disponibilidad:${medicoId}:${fecha}`;
}

/**
 * Retorna los turnos libres de un médico en una fecha.
 * Primero busca en la caché en memoria; si no existe o expiró, consulta MySQL.
 */
async function obtener(medicoId, fecha) {
  const k   = clave(medicoId, fecha);
  const hit = cache.get(k);

  if (hit && Date.now() < hit.expira) {
    return hit.datos;
  }

  const [rows] = await pool.execute(
    DISPONIBILIDAD.TURNOS_LIBRES_POR_MEDICO_Y_FECHA,
    [medicoId, fecha],
  );

  cache.set(k, { datos: rows, expira: Date.now() + TTL });
  return rows;
}

/** Invalida el caché de un médico/fecha al modificar disponibilidad o citas. */
function invalidar(medicoId, fecha) {
  cache.delete(clave(medicoId, fecha));
}

module.exports = { obtener, invalidar };
