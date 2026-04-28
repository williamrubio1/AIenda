// src/controllers/citas.controller.js
// Los errores con .status definido son errores de negocio (4xx).
// Los errores sin .status son inesperados (5xx) y se propagan al handler global de app.js,
// que se encarga de ocultarlos en producción.

const citasService = require('../services/citas.service');

async function agendar(req, res, next) {
  try {
    const { fecha, horaInicio, medicoId, sedeId } = req.body;
    const pacienteId = req.usuario.id;
    const canal      = req.body.canal || 'plataforma_web';
    const result     = await citasService.agendarCita({
      fecha, horaInicio, medicoId, pacienteId, sedeId, canal, ip: req.ip,
    });
    res.status(201).json(result);
  } catch (err) {
    if (err.status) return res.status(err.status).json({ error: err.message });
    next(err);
  }
}

async function cancelar(req, res, next) {
  try {
    await citasService.cancelarCita({
      citaId:    req.params.id,
      usuarioId: req.usuario.id,
      ip:        req.ip,
      canal:     req.body.canal || 'plataforma_web',
    });
    res.json({ mensaje: 'Cita cancelada' });
  } catch (err) {
    if (err.status) return res.status(err.status).json({ error: err.message });
    next(err);
  }
}

async function reasignar(req, res, next) {
  try {
    const { nuevoMedicoId, nuevaFecha, nuevaHoraInicio } = req.body;
    await citasService.reasignarCita({
      citaId:          req.params.id,
      nuevoMedicoId,
      nuevaFecha,
      nuevaHoraInicio,
      usuarioId:       req.usuario.id,
      ip:              req.ip,
      canal:           req.body.canal || 'recepcion',
    });
    res.json({ mensaje: 'Cita reasignada' });
  } catch (err) {
    if (err.status) return res.status(err.status).json({ error: err.message });
    next(err);
  }
}

async function misCitas(req, res, next) {
  try {
    const citas = await citasService.citasPorPaciente(req.usuario.id);
    res.json(citas);
  } catch (err) {
    next(err);
  }
}

async function citasDiarias(req, res, next) {
  try {
    const { fecha } = req.query;
    const citas     = await citasService.citasDiariasmedico(req.usuario.id, fecha);
    res.json(citas);
  } catch (err) {
    next(err);
  }
}

async function citasRango(req, res, next) {
  try {
    const { fechaInicio, fechaFin } = req.query;
    const citas = await citasService.citasRangoMedico(req.usuario.id, fechaInicio, fechaFin);
    res.json(citas);
  } catch (err) {
    next(err);
  }
}

module.exports = { agendar, cancelar, reasignar, misCitas, citasDiarias, citasRango };
