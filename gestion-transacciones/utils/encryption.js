const { Llave } = require('../repository/llaves-datasource');
const crypto = require('crypto');

const encryptRSA = async (data, idAcceso, done) => {
  //console.log(`ID ACCESO ENCRYPT: ${idAcceso}`)

  const llave = await Llave.findOne({ idAcceso });

  if (!llave) {
    return done (Error ('Llave no encontrada'))
  }

  try {
    //console.log(`LLAVE PUBLICA: ${llave.llavePublica}`);
    //console.log(`LLAVE PRIVADA: ${llave.llavePrivada}`);
    const result = crypto.publicEncrypt("-----BEGIN PUBLIC KEY-----\n" + llave.llavePublica + "\n-----END PUBLIC KEY-----", Buffer.from(JSON.stringify(data))).toString('base64');
    return done (null, result)
  } catch (error) {
    return done (Error (error.message))
  }
};

const decryptRSA = (data, llavePrivada) => {
  //console.log(`LLAVE PRIVADA: ${llavePrivada}`);
  //return JSON.parse(crypto.privateDecrypt(llavePrivada, Buffer.from(data, 'base64')).toString());
  return JSON.parse(crypto.privateDecrypt(
	  {
	    key: `-----BEGIN PRIVATE KEY-----\n${llavePrivada}\n-----END PRIVATE KEY-----`,
          }, 
	  Buffer.from(data, 'base64')).toString());
};

// Middleware para descifrar el cuerpo de la solicitud
const decryptRequestBody = async (req, res, next) => {
  const idAcceso = req.get('x-id-acceso');
  //console.log(`ID ACCESO DECRYPT: ${idAcceso}`)

  try {
    const llave = await Llave.findOne({ idAcceso:idAcceso });

    if (!llave) {
      return res.status(404).json({ error: 'Llave no encontrada' });
    }

    try {
      if (req.body.encryptedData) {
        req.body = decryptRSA(req.body.encryptedData, llave.llavePrivada);
      }
      next();
    } catch (error) {
      console.log(error.message)
      console.log(req.body.encryptedData)
      return res.status(400).json({ error: 'Error al descifrar los datos' });
    }

  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Error al buscar la llave' });
  }

};

module.exports = { encryptRSA, decryptRequestBody };

