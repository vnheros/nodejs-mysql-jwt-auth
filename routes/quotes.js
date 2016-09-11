var express = require('express'),
    jwt     = require('express-jwt'),
    config  = require('../config'),
    db      = require('../db');

var app = module.exports = express.Router();

var jwtCheck = jwt({
  secret: config.secretKey
});

function getPublicQuotesDB(done){
    db.get().query('SELECT * FROM quotes WHERE private=0', function(err, rows) {
        if (err) throw err;
        done(rows);
    });
}

function getPrivateQuotesDB(done){
    db.get().query('SELECT * FROM quotes WHERE private=1', function(err, rows) {
        if (err) throw err;
        done(rows);
    });
}

app.get('/api/public/quote', function(req, res) {
  getPublicQuotesDB(function(result) {
      res.status(200).send(result);
  });
});

app.use('/api/private', jwtCheck);

app.get('/api/private/quote', function(req, res) {
  getPrivateQuotesDB(function(result) {
      res.status(200).send(result);
  });
});