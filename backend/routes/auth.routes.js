const express = require('express');
const router = express.Router();

// NO destructures. Importa el objeto completo:
const authCtrl = require('../controllers/auth.controller');

// Rutas
router.post('/register', authCtrl.register);
router.post('/login', authCtrl.login);

module.exports = router;
