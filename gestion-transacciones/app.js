var express = require('express');
const { postCuentasValidations, getCuentasValidations, getCuentaByIdValidations, patchCuentaValidations, postTransaccionesValidations, handleValidationErrors, getHistorialTransaccionesValidations } = require('./validations/transacciones-validator');
const { validationResult } = require('express-validator');
const { createCuenta, listCuentas, getCuentaById, updateCuenta, createTransaccion, getHistorialTransacciones } = require('./controllers/cuentas');
const { decryptRequestBody } = require('./utils/encryption');

var app = express();
app.use(express.json());
app.use((err, req, res, next) => {
  // format error
  res.status(err.status || 500).json({
    message: err.message,
    errors: err.errors,
  });
});


// Endpoints
app.get('/', function (req, res) {
  res.send('Hello World!');
});

// Ruta POST /cuentas
app.post(
  '/cuentas',
  decryptRequestBody,
  postCuentasValidations,
  handleValidationErrors,
  createCuenta
);

// Ruta GET /cuentas
app.get(
  '/cuentas',
  getCuentasValidations,
  handleValidationErrors,
  listCuentas,
);

// Ruta GET /cuentas/:cuentaId
app.get(
  '/cuentas/:cuentaId',
  getCuentaByIdValidations,
  handleValidationErrors,
  getCuentaById,
);

// Ruta PATCH /cuentas/:cuentaId
app.patch(
  '/cuentas/:cuentaId',
  decryptRequestBody,
  patchCuentaValidations,
  handleValidationErrors,
  updateCuenta,
);

// Ruta POST /cuentas/:cuentaId/transacciones
app.post(
  '/cuentas/:cuentaId/transacciones',
  decryptRequestBody,
  postTransaccionesValidations,
  handleValidationErrors,
  createTransaccion
);

// Ruta GET /cuentas/:cuentaId/transacciones
app.get(
  '/cuentas/:cuentaId/transacciones',
  getHistorialTransaccionesValidations,
  handleValidationErrors,
  getHistorialTransacciones
);


app.listen(3000, function () {
  console.log('Transacciones APP running on port 9000:3000!');
});
