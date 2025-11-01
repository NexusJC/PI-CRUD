import { Router } from "express";
import { getUsers, login, register } from "../controllers/auth.controller.js";

const router = Router();

// Ruta para obtener todos los usuarios
router.get("/users", getUsers);

// Ruta para el inicio de sesión
router.post("/login", login);

// Ruta para el registro de nuevos usuarios
router.post("/register", register);

export default router;
