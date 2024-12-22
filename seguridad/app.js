var express = require('express');
const { validateGetLlaves, validateGetLlavesById, validatePostToken } = require('./validations/llaves-validator');
const { validationResult } = require('express-validator');

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

app.get('/llaves', validateGetLlaves, (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  // Lógica del controlador
  res.status(201).send('Llaves obtenidas');
});

app.get('/llaves/:idAcceso', validateGetLlavesById, (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  // Lógica del controlador
  res.status(200).send('Llave obtenida por ID');
});

app.post('/token', validatePostToken, (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  // Lógica del controlador
  res.status(201).send({ token: 'jwt-token-ejemplo' });
});


app.listen(3001, function () {
  console.log('Example app listening on port 3001!');
});
