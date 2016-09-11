var mysql = require('mysql');
var pool  = null;

exports.connect = function() {
  pool = mysql.createPool({
    host     : 'myhost',
    user     : 'myuser',
    password : 'mypassword',
    database : 'mydb'
  });
}

exports.get = function() {
  return pool;
}
