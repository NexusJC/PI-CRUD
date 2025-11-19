import { Router } from "express";
import { getUsers, login, register,forgotPassword,resetPassword } from "../controllers/auth.controller.js";

const router = Router();

// ruta para obtener todos los usuarios
router.get("/users", getUsers);

// ruta para el inicio de sesión
router.post("/login", login);

// ruta para el registro de nuevos usuarios
router.post("/register", register);

// nueva ruta para solicitar recuperación
router.post("/forgot-password", forgotPassword);

// nueva ruta para cambiar contraseña con token
router.post("/reset-password", resetPassword);

export default router;
