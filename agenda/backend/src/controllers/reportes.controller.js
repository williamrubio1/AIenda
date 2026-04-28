// src/controllers/reportes.controller.js

const reportesService = require('../services/reportes.service');

async function porMedico(req, res, next) {
  try {
    const { fechaInicio, fechaFin } = req.query;
    res.json(await reportesService.ocupacionPorMedico(fechaInicio, fechaFin));
  } catch (err) { next(err); }
}

async function porSede(req, res, next) {
  try {
    const { fechaInicio, fechaFin } = req.query;
    res.json(await reportesService.ocupacionPorSede(fechaInicio, fechaFin));
  } catch (err) { next(err); }
}

async function inasistencias(req, res, next) {
  try {
    const { fechaInicio, fechaFin } = req.query;
    res.json(await reportesService.inasistencias(fechaInicio, fechaFin));
  } catch (err) { next(err); }
}

async function cancelaciones(req, res, next) {
  try {
    const { fechaInicio, fechaFin } = req.query;
    res.json(await reportesService.cancelaciones(fechaInicio, fechaFin));
  } catch (err) { next(err); }
}

async function porCanal(req, res, next) {
  try {
    const { fechaInicio, fechaFin } = req.query;
    res.json(await reportesService.citasPorCanal(fechaInicio, fechaFin));
  } catch (err) { next(err); }
}

module.exports = { porMedico, porSede, inasistencias, cancelaciones, porCanal };
