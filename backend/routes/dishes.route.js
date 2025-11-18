const express = require('express');
const router = express.Router();
const { saveDish, getAllDishes } = require('../controllers/dishes.controller');
const upload = require('../middlewares/upload.middleware');

// POST /api/dishes
router.post('/', upload.single('image'), saveDish);

// GET /api/dishes
router.get('/', getAllDishes);

module.exports = router;
