import { Router } from "express";
import { getUsers, login, register } from "../controllers/auth.controller.js";

const router = Router();

// ruta para obtener todos los usuarios
router.get("/users", getUsers);

// ruta para el inicio de sesión
router.post("/login", login);

// ruta para el registro de nuevos usuarios
router.post("/register", register);

export default router;
