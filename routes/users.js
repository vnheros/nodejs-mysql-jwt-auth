var express = require('express'),
    _       = require('lodash'),
    config  = require('../config'),
    jwt     = require('jsonwebtoken'),
    ejwt    = require('express-jwt'),
    db      = require('../db');

var app = module.exports = express.Router();

var jwtCheck = ejwt({
  secret: config.secretKey
});

function createToken(user) {
  return jwt.sign(_.omit(user, 'password'), config.secretKey, { expiresIn: 60*60*5 });
}

function getUserDB(username, done) {
  db.get().query('SELECT * FROM users WHERE username = ? LIMIT 1', [username], function(err, rows, fields) {
    if (err) throw err;
    //console.log(rows[0]);
    done(rows[0]);
  });
}

app.post('/user/create', function(req, res) {  
  if (!req.body.username || !req.body.password) {
    return res.status(400).send("You must send the username and the password");
  }

  getUserDB(req.body.username, function(user){
    if(!user) {
      user = {
        username: req.body.username,
        password: req.body.password,
        email: req.body.email,
        role: 'Regitered'
      };
      db.get().query('INSERT INTO users SET ?', [user], function(err, result){
        if (err) throw err;
        newUser = {
          id: result.insertId,
          username: user.username,
          password: user.password,
          email: user.email,
          role: 'Regitered'
        };
        //console.log(newUser);
        res.status(201).send({
          id_token: createToken(newUser)
        });
      });
    }
    else res.status(400).send("A user with that username already exists");
  });
});

app.post('/user/login', function(req, res) {
  if (!req.body.username || !req.body.password) {
    return res.status(400).send("You must send the username and the password");
  }

  getUserDB(req.body.username, function(user){
    if (!user) {
      return res.status(401).send("The username is not existing");
    }

    if (user.password !== req.body.password) {
      return res.status(401).send("The username or password don't match");
    }

    res.status(201).send({
      id_token: createToken(user)
    });
  });
});

app.get('/user/check/:username', function(req, res) {
  if (!req.params.username) {
    return res.status(400).send("You must send a username");
  }

  getUserDB(req.params.username, function(user){
    if(!user) res.status(201).send({username: "OK"});
    else res.status(400).send("A user with that username already exists");
  });
});

app.get('/user/verify', jwtCheck, function(req, res){
  var user = req.user;
        db.get().query('SELECT * FROM users WHERE username = ? LIMIT 1', [user.username], function(err, rows) {
            if(err){
              res.status(422).send({error: 'No user found.'});
            }
            var foundUser = rows[0];
            res.send(foundUser);
        });
});
