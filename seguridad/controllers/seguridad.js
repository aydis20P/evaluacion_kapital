const NodeRSA = require('node-rsa');
const Llave = require('../repository/datasource');
const jwt = require('jsonwebtoken');

exports.getLlaves = async (req, res) => {
  try {
    // Generar par de llaves RSA
    const key = new NodeRSA({ b: 512 });
    const llavePublica = key.exportKey('public').replace(/-----[A-Z\s]+-----|\n/g, '');
    const llavePrivada = key.exportKey('private').replace(/-----[A-Z\s]+-----|\n/g, '');
    const idAcceso = new Date().toISOString().replace(/[-:.TZ]/g, ''); // ID basado en fecha y hora

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

exports.postToken = (req, res) => {
  // Obtener el header de Authorization
  const authHeader = req.header('Authorization');

  if (!authHeader || !authHeader.startsWith('Basic ')) {
    return res.status(401).json({ error: 'Authorization header is required and must use Basic Auth' });
  }

  // Decodificar credenciales de Basic Auth
  const base64Credentials = authHeader.split(' ')[1];
  const credentials = Buffer.from(base64Credentials, 'base64').toString('ascii');
  const [username, password] = credentials.split(':');

  // Validar credenciales
  const validUsername = 'Kapital';
  const validPassword = 'K@p1t@1pwD3s';

  if (username !== validUsername || password !== validPassword) {
    return res.status(401).json({ error: 'Invalid username or password' });
  }

  // Validar el campo grant_type
  const { grant_type } = req.body;

  if (grant_type !== 'client_credentials') {
    return res.status(400).json({ error: 'grant_type debe ser "client_credentials"' });
  }

  try {
    // Datos del payload (personalizar según sea necesario)
    const payload = {
      sub: '1234567890',
      name: 'John Doe',
      iat: Math.floor(Date.now() / 1000), // Fecha actual en segundos
    };

    // Generar token con duración de 5 minutos
    const token = jwt.sign(payload, 'your-secret-key', { expiresIn: '5m' });

    res.status(201).json({ token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al generar el token' });
  }
};

