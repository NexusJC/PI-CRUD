import express from "express";
import { createOrder, getOrders } from "../controllers/orders.controller.js";

const router = express.Router();

router.post("/create", createOrder);
router.get("/list", getOrders);
router.get("/:id/details", getOrderDetails);
export default router;
