import express from 'express';
import {
  saveDish,
  getAllDishes,
  deleteDish,
  updateDish     
} from '../controllers/dishes.controller.js';

const router = express.Router();

router.post('/', saveDish);
router.get('/', getAllDishes);
router.put('/:id', updateDish);
router.delete('/:id', deleteDish);

export default router;