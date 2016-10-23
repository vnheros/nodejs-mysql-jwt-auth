var express = require('express'),
    roles   = require('../roles');
    jwt     = require('express-jwt'),
    config  = require('../config'),
    db      = require('../db');

var app = module.exports = express.Router();

var jwtCheck = jwt({
  secret: config.secretKey
});

function getTodosDB(username, done) {
  db.get().query('SELECT * FROM todos WHERE username = ? OR public = 1', [username], function(err, rows) {
    if (err) throw err;
    done(rows);
  });
}

app.get('/todos', jwtCheck, function(req, res) {
  getTodosDB(req.user.username, function(rows){
    res.status(201).send(rows);
  });
});

app.post('/todos', jwtCheck, function(req, res) {
  todo = {
    task: req.body.task,
    deadline: req.body.deadline,
    public: req.body.public,
    completed: 0,
    username: req.user.username
  };
  db.get().query('INSERT INTO todos SET ?', [todo], function(err, result){
    if (err) throw err;
    newTodo = {
      id: result.insertId,
      task: todo.task,
      deadline: todo.deadline,
      public: todo.public,
      completed: todo.completed,
      username: todo.username
    };
    res.status(201).send(newTodo);
  });
});

app.delete('/todos/:id', jwtCheck, roles.checkRole(['Moderator','Administrator']), function(req, res){
  db.get().query('DELETE FROM todos WHERE id = ?', [req.params.id], function(err, result){
    if (err) throw err;
    res.status(201).send({result: "OK"});
  });
});