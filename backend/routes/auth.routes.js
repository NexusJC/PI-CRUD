const router = require('express').Router();
const { login, register } = require('../controllers/auth.controller');

router.post('/login', login);         // si ya lo tienes
router.post('/register', register);   // <-- NUEVO

module.exports = router;
