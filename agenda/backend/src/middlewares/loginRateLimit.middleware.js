// src/middlewares/loginRateLimit.middleware.js
// Controla intentos de login por usuario: máx. 5 intentos, bloqueo de 10 minutos.
// El conteo se almacena en memoria (Map).

const MAX_INTENTOS = 5;
const BLOQUEO_MS   = 10 * 60 * 1000; // 10 minutos en ms

const intentosMap  = new Map(); // usuarioId -> { count, expira }
const bloqueadoMap = new Map(); // usuarioId -> expira

function incrementarIntentos(usuarioId) {
  const ahora  = Date.now();
  const actual = intentosMap.get(usuarioId);
  if (!actual || ahora > actual.expira) {
    intentosMap.set(usuarioId, { count: 1, expira: ahora + BLOQUEO_MS });
    return 1;
  }
  actual.count += 1;
  return actual.count;
}

function bloquearUsuario(usuarioId) {
  bloqueadoMap.set(usuarioId, Date.now() + BLOQUEO_MS);
}

function estaBloquado(usuarioId) {
  const expira = bloqueadoMap.get(usuarioId);
  if (!expira) return false;
  if (Date.now() > expira) {
    bloqueadoMap.delete(usuarioId);
    return false;
  }
  return true;
}

function resetearIntentos(usuarioId) {
  intentosMap.delete(usuarioId);
  bloqueadoMap.delete(usuarioId);
}

// Middleware que se aplica en el endpoint POST /auth/login
function loginRateLimitMiddleware(req, res, next) {
  const { usuarioId } = req.body;
  if (!usuarioId) return next();

  if (estaBloquado(usuarioId)) {
    return res.status(429).json({
      error: 'Usuario bloqueado por múltiples intentos fallidos. Intente en 10 minutos.',
    });
  }
  next();
}

module.exports = {
  loginRateLimitMiddleware,
  incrementarIntentos,
  bloquearUsuario,
  resetearIntentos,
  estaBloquado,
  MAX_INTENTOS,
};
