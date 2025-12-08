import { pool } from "../db.js";
import bcrypt from "bcrypt";

// Obtener SOLO empleados (role = 'empleado')
export const getEmployees = async (_req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT id, name, email, telefono, image_url, created_at FROM users WHERE role = 'empleado'"
    );
    res.json(rows);
  } catch (error) {
    console.error("Error obteniendo empleados:", error);
    res.status(500).json({ error: "Error obteniendo empleados" });
  }
};

// Crear empleado nuevo (con foto opcional)
export const createEmployee = async (req, res) => {
  try {
    const { name, telefono, email, password } = req.body;

    if (!name || !telefono || !email || !password) {
      return res.status(400).json({ error: "Faltan datos obligatorios" });
    }

    // Foto subida con multer (campo 'profile_picture' desde el FormData)
    const photoFilename = req.file ? req.file.filename : null;

    // Encriptar contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    await pool.query(
      `INSERT INTO users (name, email, telefono, role, image_url, password)
       VALUES (?, ?, ?, 'empleado', ?, ?)`,
      [name, email, telefono, photoFilename, hashedPassword]
    );

    res.status(201).json({ message: "Empleado creado correctamente" });
  } catch (error) {
    console.error("Error creando empleado:", error);
    res.status(500).json({ error: "Error creando empleado" });
  }
};

// Actualizar datos de empleado (sin tocar contraseña ni foto)
export const updateEmployee = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, telefono, email } = req.body;

    if (!id) {
      return res.status(400).json({ error: "ID de empleado requerido" });
    }

    await pool.query(
      "UPDATE users SET name = ?, telefono = ?, email = ? WHERE id = ?",
      [name, telefono, email, id]
    );

    res.json({ message: "Empleado actualizado correctamente" });
  } catch (error) {
    console.error("Error actualizando empleado:", error);
    res.status(500).json({ error: "Error actualizando empleado" });
  }
};

// Actualizar solo la foto del empleado
export const updateEmployeePhoto = async (req, res) => {
  try {
    const { id } = req.params;
    const photoFilename = req.file ? req.file.filename : null;

    if (!id) {
      return res.status(400).json({ error: "ID de empleado requerido" });
    }

    await pool.query(
      "UPDATE users SET image_url = ? WHERE id = ?",
      [photoFilename, id]
    );

    res.json({ message: "Foto actualizada correctamente" });
  } catch (error) {
    console.error("Error actualizando foto:", error);
    res.status(500).json({ error: "Error actualizando foto" });
  }
};

// Eliminar empleado
export const deleteEmployee = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ error: "ID de empleado requerido" });
    }

    await pool.query("DELETE FROM users WHERE id = ?", [id]);

    res.json({ message: "Empleado eliminado correctamente" });
  } catch (error) {
    console.error("Error eliminando empleado:", error);
    res.status(500).json({ error: "Error eliminando empleado" });
  }
};
