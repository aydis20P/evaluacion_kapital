const { Cuenta, Transaccion } = require('../repository/transactions-datasource');
const { encryptRSA } = require('../utils/encryption');

exports.createCuenta = async (req, res) => {
  const idAcceso = req.get('x-id-acceso');

  try {
    const cuenta = await Cuenta.findOne({ nombre: req.body.nombre});
    if(cuenta)
      return res.status(400).json({ error: 'Cuenta ya existente' });
    const nuevaCuenta = new Cuenta({
      nombre: req.body.nombre,
      saldoInicial: req.body.saldoInicial,
      saldo: req.body.saldoInicial,
    });
    await nuevaCuenta.save();
    nuevaCuentaResponse = {
      id: nuevaCuenta._id,
      nombre: nuevaCuenta.nombre,
      saldo: nuevaCuenta.saldo,
    }
    encryptRSA(nuevaCuentaResponse, idAcceso, function(err, result){
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

function encryptRSAPromise(cuenta, idAcceso) {
  return new Promise((resolve, reject) => {
    encryptRSA(cuenta, idAcceso, function (err, result) {
      if (err) {
        reject(err);
      } else {
        resolve(result);
      }
    });
  });
}

exports.listCuentas = async (req, res) => {
  const idAcceso = req.get('x-id-acceso');

  try {
    const cuentas = await Cuenta.find();

    encryptedCuentas = []
    for (const cuenta of cuentas) {
      resultResponse = {
        id: cuenta._id,
        nombre: cuenta.nombre,
        saldo: cuenta.saldo,
      }
      const result = await encryptRSAPromise(resultResponse, idAcceso);
      encryptedCuentas.push(result);
    };

    res.status(200).json({ encryptedData: encryptedCuentas });
  } catch (error) {
    res.status(500).json({ error: 'Error al listar las cuentas: ' + error.message });
  }
};

exports.getCuentaById = async (req, res) => {
  const idAcceso = req.get('x-id-acceso');

  try {
    const cuenta = await Cuenta.findById(req.params.cuentaId);
    if (!cuenta) {
      return res.status(404).json({ error: 'Cuenta no encontrada' });
    }
    resultResponse = {
        id: cuenta._id,
        nombre: cuenta.nombre,
        saldo: cuenta.saldo,
    }
    const result = await encryptRSAPromise(resultResponse, idAcceso);
    res.status(200).json({ encryptedData: result });
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener la cuenta: ' + error });
  }
};

exports.updateCuenta = async (req, res) => {
  const idAcceso = req.get('x-id-acceso');

  try {
    //console.log("NOMBRE NUEVO: " + req.body.nombre);
    const cuentaActualizada = await Cuenta.findOneAndUpdate(
      { _id: req.params.cuentaId },
      { nombre: req.body.nombre },
      { new: true } // Devuelve el documento actualizado
    );
    //console.log("CUENTA ACTUALIZADA: " + cuentaActualizada)
    if (!cuentaActualizada) {
      return res.status(404).json({ error: 'Cuenta no actualizada' });
    }
    resultResponse = {
        id: cuentaActualizada._id,
        nombre: cuentaActualizada.nombre,
        saldo: cuentaActualizada.saldo,
    }

    const result = await encryptRSAPromise(resultResponse, idAcceso);
    res.status(200).json({ encryptedData: result });
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar la cuenta: ' + error.message });
  }
};

exports.createTransaccion = async (req, res) => {
  const idAcceso = req.get('x-id-acceso');

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
    resultResponse = {
        id: nuevaTransaccion._id,
        tipo: nuevaTransaccion.tipo,
        monto: nuevaTransaccion.monto,
        fecha: nuevaTransaccion.fecha,
    }

    const result = await encryptRSAPromise(resultResponse, idAcceso);
    res.status(200).json({ encryptedData: result });
  } catch (error) {
    res.status(500).json({ error: 'Error al realizar la transacción' });
  }
};

