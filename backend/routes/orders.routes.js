import express from "express";
import {createOrder,getOrders,getOrderDetails,deliverOrder,cancelOrder,updateOrder} from "../controllers/orders.controller.js";
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

router.post("/create", authRequired, createOrder);

export default router;
