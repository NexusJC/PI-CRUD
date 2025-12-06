import { Router } from "express";
import { getCajas, createCaja, deleteCaja, updateCaja, deleteCaja } from "../controllers/cajas.controller.js";

const router = Router();

router.get("/cajas", getCajas);
router.post("/cajas", createCaja);
router.delete("/cajas/:id", deleteCaja);
router.put("/cajas/:id", updateCaja);
router.delete("/cajas/:id", deleteCaja);

export default router;
