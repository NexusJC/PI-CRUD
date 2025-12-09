import { Router } from "express";
import {
  getDashboardStats,
  getTopDishes,
  getOrdersLast7Days
} from "../controllers/dashboard.controller.js";

const router = Router();

// ===== Ruta que ya existía (NO se toca su URL) =====
router.get("/stats", getDashboardStats);

// ===== NUEVA RUTA: Órdenes en los últimos 7 días =====
router.get("/orders-last-7-days", getOrdersLast7Days);

//platillos más vendidos
router.get("/top-dishes", getTopDishes);
//Ingresos totales
router.get("/ingresos", getIngresosTotales);
//Ordenes hoy
router.get("/ordenes-hoy", getOrdenesHoy);
export default router;
