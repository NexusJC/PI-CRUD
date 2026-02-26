import { Router } from "express";
import {
  getEmployees,
  createEmployee,
  updateEmployee,
  deleteEmployee
} from "../controllers/users.controller.js";

const router = Router();

// Obtener SOLO empleados
router.get("/", getEmployees);

// Crear empleado nuevo (con imagen opcional)
router.post("/", createEmployee);


// Editar empleado sin imagen
router.put("/:id", updateEmployee);


// Borrar empleado
router.delete("/:id", deleteEmployee);

export default router;
