import { Router } from "express";
import upload from "../middlewares/upload.middleware.js";
import {
  getEmployees,
  createEmployee,
  updateEmployee,
  deleteEmployee,
  updateEmployeePhoto
} from "../controllers/users.controller.js";

const router = Router();

// Obtener SOLO empleados
router.get("/", getEmployees);

// Crear empleado nuevo (con imagen opcional)
router.post("/", upload.single("profile_picture"), createEmployee);

// Editar empleado sin imagen
router.put("/:id", updateEmployee);

// Actualizar solo la foto del empleado
router.put("/:id/photo", upload.single("profile_picture"), updateEmployeePhoto);

// Borrar empleado
router.delete("/:id", deleteEmployee);

export default router;
