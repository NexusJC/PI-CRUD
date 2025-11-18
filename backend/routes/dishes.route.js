const express = require('express');
const router = express.Router();
const { saveDish, getAllDishes } = require('../controllers/dishes.controller');
const upload = require('../middlewares/upload.middleware');

router.post('/', upload.single('image'), saveDish);

router.get('/', getAllDishes);

export default router;

