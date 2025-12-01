import { pool } from "../db.js";

export const getDashboardStats = async (req, res) => {
  try {
    // === TOTAL DE PLATILLOS ===
    const [platillos] = await pool.query(
      "SELECT COUNT(*) AS total FROM platillos"
    );

    // === TOTAL DE USUARIOS ===
    const [usuarios] = await pool.query(
      "SELECT COUNT(*) AS total FROM users"
    );

    // === TOTAL DE EMPLEADOS ===
    const [empleados] = await pool.query(
      "SELECT COUNT(*) AS total FROM users WHERE role = 'employee'"
    );

    // === TOTAL DE ADMINISTRADORES ===
    const [admins] = await pool.query(
      "SELECT COUNT(*) AS total FROM users WHERE role = 'admin'"
    );

    res.json({
      platillosTotales: platillos[0].total,
      usuariosRegistrados: usuarios[0].total,
      empleadosActivos: empleados[0].total,
      adminsTotales: admins[0].total
    });

  } catch (error) {
    console.error("❌ Error en getDashboardStats:", error);
    res.status(500).json({ message: "Error al obtener estadísticas" });
  }
};
