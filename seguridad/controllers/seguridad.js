const NodeRSA = require('node-rsa');
const { Llave, Credential } = require('../repository/datasource');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const bcrypt = require('bcrypt');

exports.getLlaves = async (req, res) => {
  try {
    // Generar par de llaves RSA
    const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
      modulusLength: 2048, // Longitud de la llave en bits
      publicKeyEncoding: {
        type: 'spki', // Public Key Cryptography Standards
        format: 'pem',
      },
      privateKeyEncoding: {
        type: 'pkcs8', // Public-Key Cryptography Standards
        format: 'pem',
      },
    });

    // Limpiar llaves eliminando las leyendas y saltos de línea
    const llavePublica = publicKey.replace(/-----[A-Z\s]+-----|\n/g, '');
    const llavePrivada = privateKey.replace(/-----[A-Z\s]+-----|\n/g, '');    const idAcceso = new Date().toISOString().replace(/[-:.TZ]/g, ''); // ID basado en fecha y hora

    // Almacenar en la base de datos
    const nuevaLlave = new Llave({ idAcceso, llavePublica, llavePrivada });
    await nuevaLlave.save();

    res.status(201).json({
      idAcceso,
      llavePublica,
      llavePrivada,
      //mensaje: 'Par de llaves RSA generado y almacenado con éxito',
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al generar las llaves RSA' });
  }
};

exports.getLlaveById = async (req, res) => {
  const { idAcceso } = req.params;

  try {
    const llave = await Llave.findOne({ idAcceso });

    if (!llave) {
      return res.status(404).json({ error: 'Llave no encontrada' });
    }

    res.status(200).json({
      llavePublica: llave.llavePublica,
      llavePrivada: llave.llavePrivada,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al buscar la llave' });
  }
};

exports.postToken = async (req, res) => {
  // Obtener el header de Authorization
  const authHeader = req.header('Authorization');

  if (!authHeader || !authHeader.startsWith('Basic ')) {
    return res.status(401).json({ error: 'Authorization header is required and must use Basic Auth' });
  }

  // Decodificar credenciales de Basic Auth
  const base64Credentials = authHeader.split(' ')[1];
  const credentials = Buffer.from(base64Credentials, 'base64').toString('ascii');
  const [username, password] = credentials.split(':');

  try {
    // Buscar credenciales en la base de datos
    const user = await Credential.findOne({ username: username });
    if (!user) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    // Validar contraseña con bcrypt
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    // Validar el campo grant_type
    const { grant_type } = req.body;
    if (grant_type !== 'client_credentials') {
      return res.status(400).json({ error: 'grant_type must be "client_credentials"' });
    }

    // Generar token con duración de 5 minutos
    const payload = {
      sub: user._id,
      username: user.username,
      iat: Math.floor(Date.now() / 1000),
    };
    const token = jwt.sign(payload, 'your-secret-key', { expiresIn: '5m' });

    res.status(201).json({ token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al procesar la solicitud' });
  }
};
