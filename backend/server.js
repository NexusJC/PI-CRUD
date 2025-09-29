// server.js
const express = require('express');
const dotenv = require('dotenv');
const app = express();

// Cargar las variables de entorno
dotenv.config();

// Middleware para manejar solicitudes JSON
app.use(express.json());

// Rutas de autenticación
const authRoutes = require('./routes/auth.routes.js');
app.use('/auth', authRoutes);

// Ruta básica de prueba
app.get('/', (req, res) => {
  res.send('Hello World');
});

// Configuración del puerto
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
