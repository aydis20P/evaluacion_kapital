const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

mongoose.connect('mongodb://mongoCont:27017/seguridad', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const llaveSchema = new mongoose.Schema({
  idAcceso: { type: String, required: true },
  llavePublica: { type: String, required: true },
  llavePrivada: { type: String, required: true },
  fechaCreacion: { type: Date, default: Date.now },
});

const Llave = mongoose.model('Llave', llaveSchema);

const credentialSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true }, // Contraseña hasheada
});

const Credential = mongoose.model('Credential', credentialSchema);

// inicializar credenciales default
async function initializeCredentials() {
  const initialCredentials = [
    { username: 'Kapital', password: 'K@p1t@1pwD3s' },
  ];

  for (const cred of initialCredentials) {
    const existingCredential = await Credential.findOne({ username: cred.username });
    if (!existingCredential) {
      const hashedPassword = await bcrypt.hash(cred.password, 10);
      await Credential.create({ username: cred.username, password: hashedPassword });
      console.log(`Credencial creada: ${cred.username}`);
    } else {
      console.log(`Credencial ya existe: ${cred.username}`);
    }
  }
}

mongoose.connection.once('open', async () => {
  console.log('Conexión a MongoDB establecida');

  // Inicializar credenciales de ejemplo
  await initializeCredentials();
});


module.exports.Credential = Credential;
module.exports.Llave = Llave;

