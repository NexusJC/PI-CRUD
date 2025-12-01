import express from 'express';
import { saveDish, getAllDishes, deleteDish } from '../controllers/dishes.controller.js';
import { upload } from '../config/upload.js';

const router = express.Router();

router.post('/', upload.single('imagen'), saveDish);
router.get('/', getAllDishes);
router.delete('/:id', deleteDish);

export default router;
