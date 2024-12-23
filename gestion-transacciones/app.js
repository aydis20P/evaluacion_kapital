var express = require('express');
const { postCuentasValidations, getCuentasValidations, getCuentaByIdValidations, patchCuentaValidations, postTransaccionesValidations, handleValidationErrors } = require('./validations/transacciones-validator');
const { validationResult } = require('express-validator');
const { createCuenta, listCuentas, getCuentaById, updateCuenta, createTransaccion } = require('./controllers/cuentas');
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
  (req, res) => {
    // Lógica para obtener detalles de una cuenta
    res.status(200).json({});
  }
);

// Ruta PATCH /cuentas/:cuentaId
app.patch(
  '/cuentas/:cuentaId',
  patchCuentaValidations,
  handleValidationErrors,
  (req, res) => {
    // Lógica para actualizar información de una cuenta
    res.status(200).json({ message: 'Cuenta actualizada exitosamente' });
  }
);

// Ruta POST /cuentas/:cuentaId/transacciones
app.post(
  '/cuentas/:cuentaId/transacciones',
  postTransaccionesValidations,
  handleValidationErrors,
  (req, res) => {
    // Lógica para realizar transacción
    res.status(200).json({ message: 'Transacción completada exitosamente' });
  }
);


app.listen(3000, function () {
  console.log('Example app listening on port 3000!');
});
