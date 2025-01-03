const { check, header, validationResult } = require('express-validator');
const { validateJWT } = require('../utils/validateJWT');

// Middleware para manejar errores de validación
exports.handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

exports.validateGetLlaves = [
  validateJWT,
  header('x-id-transaccion')
    .exists().withMessage('x-id-transaccion header is required')
    .isUUID().withMessage('x-id-transaccion must be a valid UUID'),
];

exports.validateGetLlavesById = [
  validateJWT,
  header('x-id-transaccion')
    .exists().withMessage('x-id-transaccion header is required')
    .isUUID().withMessage('x-id-transaccion must be a valid UUID'),
  check('idAcceso')
    .exists().withMessage('idAcceso parameter is required')
    .isString().withMessage('idAcceso must be a string'),
];

exports.validatePostToken = [
  header('x-id-transaccion')
    .exists().withMessage('x-id-transaccion header is required')
    .isUUID().withMessage('x-id-transaccion must be a valid UUID'),
  check('grant_type')
    .exists().withMessage('grant_type field is required')
    .isString().withMessage('grant_type must be a string')
    .equals('client_credentials').withMessage('grant_type must be "client_credentials"'),
];

