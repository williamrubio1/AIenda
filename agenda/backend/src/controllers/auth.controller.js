// src/controllers/auth.controller.js

const authService = require('../services/auth.service');

async function login(req, res, next) {
  try {
    const { usuarioId, contrasena } = req.body;
    const ip     = req.ip;
    const canal  = req.body.canal || 'plataforma_web';
    const result = await authService.login({ usuarioId, contrasena, ip, canal });
    res.json(result);
  } catch (err) {
    if (err.status) return res.status(err.status).json({ error: err.message });
    next(err);
  }
}

async function cambiarContrasena(req, res, next) {
  try {
    const { nuevaContrasena } = req.body;
    const usuarioId = req.usuario.id;
    await authService.cambiarContrasena({ usuarioId, nuevaContrasena, ip: req.ip });
    res.json({ mensaje: 'Contraseña actualizada' });
  } catch (err) {
    if (err.status) return res.status(err.status).json({ error: err.message });
    next(err);
  }
}

async function obtenerContrasena(req, res, next) {
  try {
    const contrasena = await authService.obtenerContrasenaActual(req.params.id);
    res.json({ contrasena });
  } catch (err) {
    if (err.status) return res.status(err.status).json({ error: err.message });
    next(err);
  }
}

async function recuperarContrasena(req, res, next) {
  try {
    const { email, canal } = req.body;
    await authService.iniciarRecuperacion({ email, canal });
    res.json({ mensaje: 'Si el correo existe, recibirá instrucciones' });
  } catch (err) {
    if (err.status) return res.status(err.status).json({ error: err.message });
    next(err);
  }
}

module.exports = { login, cambiarContrasena, obtenerContrasena, recuperarContrasena };
