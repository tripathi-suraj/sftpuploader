const mysql = require('mysql2');
const config = require('../config');

const connection = mysql.createConnection(config.db);

connection.connect((err) => {
  if (err) {
    console.error('Error connecting to MySQL:', err);
    process.exit(1);
  }
  console.log('Connected to MySQL');
});

module.exports = connection;
