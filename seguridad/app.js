var express = require('express');
const OpenApiValidator = require('express-openapi-validator');

var app = express();

app.use(
  OpenApiValidator.middleware({
    apiSpec: './Seguridad-Kapital.yaml',
    validateRequests: true,
    validateResponses: false,
  }),
);

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

app.get('/llaves', function (req, res, next) {
  res.json([
    { id: 1, type: 'cat', name: 'max' },
    { id: 2, type: 'cat', name: 'mini' },
  ]);
});

app.listen(3001, function () {
  console.log('Example app listening on port 3001!');
});
