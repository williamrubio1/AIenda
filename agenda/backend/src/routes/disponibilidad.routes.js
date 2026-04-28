// src/routes/disponibilidad.routes.js

const router   = require('express').Router();
const ctrl     = require('../controllers/disponibilidad.controller');
const auth     = require('../middlewares/auth.middleware');
const roles    = require('../middlewares/roles.middleware');
const validate = require('../middlewares/validate.middleware');
const { query } = require('express-validator');

// GET /api/disponibilidad?medicoId=&fecha=
router.get('/',
  auth,
  [
    query('medicoId').isInt({ min: 1 }).withMessage('medicoId debe ser un entero positivo'),
    query('fecha').isDate().withMessage('fecha inválida (YYYY-MM-DD)'),
  ],
  validate,
  ctrl.turnosLibres,
);

// GET /api/disponibilidad/espacios-vacios  (solo admin)
router.get('/espacios-vacios',
  auth,
  roles('administrador'),
  ctrl.espaciosVacios,
);

module.exports = router;
