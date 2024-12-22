const { validateJWT } = require('../utils/validateJWT');
const { body, header, param, validationResult } = require('express-validator');

// Middleware para manejar errores de validación
exports.handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

// Validaciones comunes para headers
const headerValidations = [
  validateJWT,
  header('x-id-transaccion').isUUID().withMessage('x-id-transaccion must be a valid UUID'),
];

// Validaciones específicas para cada endpoint
exports.postCuentasValidations = [
  ...headerValidations,
  header('x-id-acceso').notEmpty().withMessage('x-id-acceso header is required'),
  body('nombre').isString().notEmpty().withMessage('Nombre is required and must be a string'),
  body('saldoInicial').isFloat().withMessage('Saldo inicial must be a number'),
];

exports.getCuentasValidations = [...headerValidations];

exports.getCuentaByIdValidations = [
  ...headerValidations,
  param('cuentaId').isString().withMessage('CuentaId must be a string'),
];

exports.patchCuentaValidations = [
  ...headerValidations,
  header('x-id-acceso').notEmpty().withMessage('x-id-acceso header is required'),
  param('cuentaId').isString().withMessage('CuentaId must be a string'),
  body('nombre').optional().isString().withMessage('Nombre must be a string'),
];

exports.postTransaccionesValidations = [
  ...headerValidations,
  header('x-id-acceso').notEmpty().withMessage('x-id-acceso header is required'),
  param('cuentaId').isString().withMessage('CuentaId must be a string'),
  body('tipo')
    .isIn(['deposito', 'retiro'])
    .withMessage('Tipo must be either deposito or retiro'),
  body('monto').isFloat().withMessage('Monto must be a number'),
];

