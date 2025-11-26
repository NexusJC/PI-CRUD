import { pool } from "../db.js";
import bcrypt from "bcrypt";

// Obtener SOLO empleados
export const getEmployees = async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT id, name, email, telefono, profile_picture, created_at FROM users WHERE role = 'empleado'"
    );
    res.json(rows);
  } catch (error) {
    console.error("Error obteniendo empleados:", error);
    res.status(500).json({ error: "Error obteniendo empleados" });
  }
};

export const createEmployee = async (req, res) => {
  try {
    const { name, telefono, email, password } = req.body;

    // Validación básica
    if (!name || !telefono || !email || !password) {
      return res.status(400).json({ error: "Faltan datos obligatorios" });
    }

    // Imagen opcional
    const photo = req.file ? req.file.filename : null;

    // Encriptar la contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insertar empleado REAL
    await pool.query(
      `INSERT INTO users (name, email, telefono, role, profile_picture, password)
       VALUES (?, ?, ?, 'empleado', ?, ?)`,
      [name, email, telefono, photo, hashedPassword]
    );

    res.json({ message: "Empleado creado correctamente" });

  } catch (error) {
    console.error("Error creando empleado:", error);
    res.status(500).json({ error: "Error en el servidor" });
  }
};


// Editar empleado
export const updateEmployee = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, telefono } = req.body;

    await pool.query(
      "UPDATE users SET name = ?, telefono = ? WHERE id = ?",
      [name, telefono, id]
    );

    res.json({ message: "Empleado actualizado correctamente" });
  } catch (error) {
    console.error("Error actualizando empleado:", error);
    res.status(500).json({ error: "Error actualizando empleado" });
  }
};
// Actualizar foto del empleado
export const updateEmployeePhoto = async (req, res) => {
  try {
    const { id } = req.params;

    const photo = req.file ? req.file.filename : null;

    await pool.query(
      "UPDATE users SET profile_picture = ? WHERE id = ?",
      [photo, id]
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
