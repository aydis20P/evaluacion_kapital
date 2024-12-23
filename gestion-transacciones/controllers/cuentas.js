const { Cuenta, Transaccion } = require('../repository/transactions-datasource');
const { encryptRSA } = require('../utils/encryption');

exports.createCuenta = async (req, res) => {
  const idAcceso = req.get('x-id-acceso');

  try {
    const nuevaCuenta = new Cuenta({
      nombre: req.body.nombre,
      saldoInicial: req.body.saldoInicial,
      saldo: req.body.saldoInicial,
    });
    await nuevaCuenta.save();
    encryptRSA(nuevaCuenta, idAcceso, function(err, result){
      if (err) {
        console.log ('error', err.message, err.stack)
        res.status(500).json({ error: err.message });
      }
      else
       res.status(201).json({ encryptedData: result });
    }) 
  } catch (error) {
    res.status(500).json({ error: 'Error al crear la cuenta' });
  }
};

exports.listCuentas = async (req, res) => {
  const { idAcceso } = req.params;

  try {
    const cuentas = await Cuenta.find();
    const encryptedCuentas = cuentas.map((cuenta) => encryptRSA(cuenta, idAcceso));
    res.status(200).json({ encryptedData: encryptedCuentas });
  } catch (error) {
    res.status(500).json({ error: 'Error al listar las cuentas' });
  }
};

exports.getCuentaById = async (req, res) => {
  const { idAcceso } = req.params;

  try {
    const cuenta = await Cuenta.findById(req.params.cuentaId);
    if (!cuenta) {
      return res.status(404).json({ error: 'Cuenta no encontrada' });
    }
    res.status(200).json({ encryptedData: encryptRSA(cuenta, idAcceso) });
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener la cuenta' });
  }
};

exports.updateCuenta = async (req, res) => {
  const { idAcceso } = req.params;

  try {
    const cuentaActualizada = await Cuenta.findByIdAndUpdate(
      req.params.cuentaId,
      { nombre: req.body.nombre },
      { new: true }
    );
    if (!cuentaActualizada) {
      return res.status(404).json({ error: 'Cuenta no encontrada' });
    }
    res.status(200).json({ encryptedData: encryptRSA(cuentaActualizada, idAcceso) });
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar la cuenta' });
  }
};

exports.createTransaccion = async (req, res) => {
  const { idAcceso } = req.params;

  try {
    const cuenta = await Cuenta.findById(req.params.cuentaId);
    if (!cuenta) {
      return res.status(404).json({ error: 'Cuenta no encontrada' });
    }
    if (req.body.tipo === 'retiro' && cuenta.saldo < req.body.monto) {
      return res.status(400).json({ error: 'Saldo insuficiente' });
    }
    const nuevoSaldo =
      req.body.tipo === 'deposito'
        ? cuenta.saldo + req.body.monto
        : cuenta.saldo - req.body.monto;
    cuenta.saldo = nuevoSaldo;
    await cuenta.save();
    const nuevaTransaccion = new Transaccion({
      cuentaId: req.params.cuentaId,
      tipo: req.body.tipo,
      monto: req.body.monto,
      fecha: new Date(),
    });
    await nuevaTransaccion.save();
    res.status(200).json({ encryptedData: encryptRSA(nuevaTransaccion, idAcceso) });
  } catch (error) {
    res.status(500).json({ error: 'Error al realizar la transacción' });
  }
};

