const mongoose = require('mongoose');

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

module.exports = Llave;

