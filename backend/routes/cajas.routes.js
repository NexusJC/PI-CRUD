import express from "express";
import { getCajas, createCaja, deleteCaja } from "../controllers/cajas.controller.js";

const router = express.Router();

// Obtener todas las cajas
router.get("/cajas", getCajas);

// Crear una nueva caja
router.post("/cajas", createCaja);

// Eliminar una caja por ID
router.delete("/cajas/:id", deleteCaja);

export default router;
