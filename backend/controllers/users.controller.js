import { pool } from "../db.js";
import bcrypt from "bcrypt";

// Obtener solo empleados
// Obtener empleados + caja asignada
// Obtener empleados + caja asignada
export const getEmployees = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
        u.id,
        u.name,
        u.email,
        u.telefono,
        u.image_url,
        u.created_at,
        c.numero_caja AS numero_caja
      FROM users u
      LEFT JOIN cajas c
        ON c.empleado_id = u.id
      WHERE u.role = 'empleado'
      ORDER BY u.created_at DESC
    `);

    res.json(rows);
  } catch (error) {
    console.error("Error obteniendo empleados:", error);
    res.status(500).json({ error: "Error obteniendo empleados" });
  }
};



export const createEmployee = async (req, res) => {
  try {
    const { name, telefono, email, password, image_url } = req.body;

    if (!name || !telefono || !email || !password) {
      return res.status(400).json({ error: "Faltan datos obligatorios" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await pool.query(
      `INSERT INTO users (name, email, telefono, role, image_url, password)
       VALUES (?, ?, ?, 'empleado', ?, ?)`,
      [name, email, telefono, image_url || null, hashedPassword]
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
    const { name, telefono, email, image_url } = req.body;

    await pool.query(
      `UPDATE users 
       SET name = ?, telefono = ?, email = ?, image_url = ? 
       WHERE id = ?`,
      [name, telefono, email, image_url || null, id]
    );

    res.json({ message: "Empleado actualizado correctamente" });

  } catch (error) {
    console.error("Error actualizando empleado:", error);
    res.status(500).json({ error: "Error actualizando empleado" });
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
