const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'mysql.railway.internal',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASS || 'PjZwDOAFlBsPiqNGRCWomEYIictlbRkA',
  database: process.env.DB_NAME || 'LA_PARRILLA_AZTECA',
  port: process.env.DB_PORT || 27475,
});

module.exports = pool;
