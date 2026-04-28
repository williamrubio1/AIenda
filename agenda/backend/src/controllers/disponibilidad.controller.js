// src/controllers/disponibilidad.controller.js

const cacheDisponibilidad   = require('../services/cacheDisponibilidad.service');
const espaciosVaciosService = require('../services/espaciosVacios.service');

async function turnosLibres(req, res, next) {
  try {
    const { medicoId, fecha } = req.query;
    const turnos = await cacheDisponibilidad.obtener(medicoId, fecha);
    res.json(turnos);
  } catch (err) {
    next(err);
  }
}

async function espaciosVacios(req, res, next) {
  try {
    const espacios = await espaciosVaciosService.obtenerEspaciosVacios();
    res.json(espacios);
  } catch (err) {
    next(err);
  }
}

module.exports = { turnosLibres, espaciosVacios };
