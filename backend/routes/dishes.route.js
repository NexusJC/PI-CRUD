import express from 'express';
import { saveDish, getAllDishes } from '../controllers/dishes.controller.js';
import upload from '../middlewares/upload.middleware.js';

const router = express.Router();

router.post('/', upload.single('image'), saveDish);
router.get('/', getAllDishes);

export default router;
