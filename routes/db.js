const mysql = require('mysql2');
const config = require('../config');

exports.getConnection=function(cb){
  const db = mysql.createConnection (config.db);
    // connect to database
  db.connect((err) => {
      if (err) {
          throw err;
      }
      console.log('Connected to database');
  });
  cb(null,db);
}

exports.release=function(connection,cb){
    connection.end();
    cb();
}

