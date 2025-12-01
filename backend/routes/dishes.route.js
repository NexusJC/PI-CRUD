import express from 'express';
import { saveDish, getAllDishes, deleteDish } from '../controllers/dishes.controller.js';

const router = express.Router();

// Ya no usamos multer aquí, la imagen se sube desde el front a Cloudinary
router.post('/', saveDish);

router.get('/', getAllDishes);
router.delete('/:id', deleteDish);

export default router;
