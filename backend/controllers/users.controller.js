import { pool } from "../db.js";
import bcrypt from "bcrypt";

// Obtener SOLO empleados
export const getEmployees = async (req, res) => {
  try {
    // Traemos image_url y profile_picture por compatibilidad
    const [rows] = await pool.query(
      "SELECT id, name, email, telefono, image_url, profile_picture, created_at FROM users WHERE role = 'empleado'"
    );
    res.json(rows);
  } catch (error) {
    console.error("Error obteniendo empleados:", error);
    res.status(500).json({ error: "Error obteniendo empleados" });
  }
};

// Crear empleado usando Cloudinary (image_url viene del frontend)
export const createEmployee = async (req, res) => {
  try {
    const { name, telefono, email, password, image_url } = req.body;

    // Validación básica
    if (!name || !telefono || !email || !password) {
      return res.status(400).json({ error: "Faltan datos obligatorios" });
    }

    // Encriptar la contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    // Guardamos la URL de Cloudinary en image_url
    await pool.query(
      `INSERT INTO users (name, email, telefono, role, image_url, password)
       VALUES (?, ?, ?, 'empleado', ?, ?)`,
      [name, email, telefono, image_url || null, hashedPassword]
    );

    res.status(201).json({ message: "Empleado creado correctamente" });

  } catch (error) {
    console.error("Error creando empleado:", error);
    res.status(500).json({ error: "Error en el servidor" });
  }
};

// Editar empleado (nombre, teléfono, email)
export const updateEmployee = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, telefono, email } = req.body;

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

// Actualizar foto del empleado (también usando image_url desde el frontend)
export const updateEmployeePhoto = async (req, res) => {
  try {
    const { id } = req.params;
    const { image_url } = req.body;

    await pool.query(
      "UPDATE users SET image_url = ? WHERE id = ?",
      [image_url || null, id]
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

    await pool.query("DELETE FROM users WHERE id = ?", [id]);

    res.json({ message: "Empleado eliminado correctamente" });
  } catch (error) {
    console.error("Error eliminando empleado:", error);
    res.status(500).json({ error: "Error eliminando empleado" });
  }
};
