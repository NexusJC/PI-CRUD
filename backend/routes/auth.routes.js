import express from "express";
import { register, login } from "../controllers/auth.controller.js";

const router = express.Router();

// Ruta para el registro de usuario
router.post("/register", register);

// Ruta para el login
router.post("/login", login);

export default router;
