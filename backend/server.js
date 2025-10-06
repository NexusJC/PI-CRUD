const express = require('express');
const mysql = require('mysql2');
const dotenv = require('dotenv');
const app = express();

dotenv.config();

const connection = mysql.createConnection({
  host: process.env.MYSQL_HOST,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE
});

connection.connect((err) => {
  if (err) {
    console.error('Error al conectarse a la base de datos:', err);
    return;
  }
  console.log('Conectado a la base de datos. ');
});
  
app.use(express.json());

app.get('/', (req, res) => {
  res.send('Hello World');
});

const authRoutes = require('./routes/auth.routes.js');
app.use('/auth', authRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto: ${PORT}`);
});
