const mongoose = require('mongoose');

const bancoDB = mongoose.connection.useDb('banco');

const CuentaSchema = new mongoose.Schema({
  nombre: {
    type: String,
    required: true,
  },
  saldoInicial: {
    type: Number,
    required: true,
  },
  saldo: {
    type: Number,
    required: true,
  },
});

const Cuenta = bancoDB.model('Cuenta', CuentaSchema);

const TransaccionSchema = new mongoose.Schema({
  cuentaId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Cuenta',
    required: true,
  },
  tipo: {
    type: String,
    enum: ['deposito', 'retiro'],
    required: true,
  },
  monto: {
    type: Number,
    required: true,
  },
  fecha: {
    type: Date,
    default: Date.now,
  },
});

const Transaccion = bancoDB.model('Transaccion', TransaccionSchema);


module.exports.Cuenta = Cuenta;
module.exports.Transaccion = Transaccion;
