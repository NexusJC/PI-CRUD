const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller.js'); 

router.get('/users', authController.getUsers);

router.post('/login', authController.login);

router.post('/register', authController.register);

module.exports = router;
