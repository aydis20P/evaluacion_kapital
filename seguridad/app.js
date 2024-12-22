var express = require('express');
var bodyParser = require('body-parser');
const { validateGetLlaves, validateGetLlavesById, validatePostToken, handleValidationErrors } = require('./validations/llaves-validator');
const { getLlaves, getLlaveById, postToken } = require('./controllers/seguridad');

var app = express();
app.use(express.json());
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))
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

app.get(
  '/llaves',
  validateGetLlaves, 
  handleValidationErrors,
  getLlaves
);

app.get(
  '/llaves/:idAcceso', 
  validateGetLlavesById,
  handleValidationErrors,
  getLlaveById
);

app.post(
  '/token',
  validatePostToken,
  handleValidationErrors,
  postToken
);


app.listen(3001, function () {
  console.log('Example app listening on port 3001!');
});
