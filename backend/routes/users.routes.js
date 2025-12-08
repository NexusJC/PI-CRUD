import { Router } from "express";
// import upload from "../middlewares/upload.middleware.js";
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

// Crear empleado nuevo (recibe JSON con image_url desde el frontend)
router.post("/", createEmployee);

// Editar empleado (nombre, teléfono, email)
router.put("/:id", updateEmployee);

// Actualizar solo la foto del empleado (también con image_url por JSON)
router.put("/:id/photo", updateEmployeePhoto);

// Borrar empleado
router.delete("/:id", deleteEmployee);

export default router;
