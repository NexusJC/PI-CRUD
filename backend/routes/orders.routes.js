import express from "express";
import {createOrder, getOrders, getOrderDetails} from "../controllers/orders.controller.js";

const router = express.Router();

// Crear pedido
router.post("/create", createOrder);

// Obtener lista de pedidos
router.get("/list", getOrders);

// Obtener detalles de un pedido
router.get("/:id/details", getOrderDetails);

export default router;
