import express from "express";
import {
  createOrder,
  getOrders,
  getOrderDetails,
  deliverOrder,
  cancelOrder,
  updateOrder,
  getAllOrders
} from "../controllers/orders.controller.js";
import { authRequired } from "../middlewares/authRequired.js";

const router = express.Router();

// Crear pedido
router.post("/create", createOrder);

// Obtener lista de pedidos
router.get("/list", getOrders);

// Obtener detalles de un pedido
router.get("/:id/details", getOrderDetails);

// ENTREGAR pedido
router.put("/:id/deliver", deliverOrder);

// CANCELAR pedido
router.put("/:id/cancel", cancelOrder);

// EDITAR pedido
router.put("/:id/edit", updateOrder);

// (versión con auth, la dejo igual que la tenías)
router.post("/create", authRequired, createOrder);

// Obtener todos los pedidos (para admin, etc.)
router.get("/all", getAllOrders);

export default router;
