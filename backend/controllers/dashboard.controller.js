import { db } from "../db.js";

export const getDashboardStats = async (req, res) => {
  try {
    // === TOTAL DE PLATILLOS ===
    const [platillos] = await db.query(
      "SELECT COUNT(*) AS total FROM platillos"
    );

    // === TOTAL DE USUARIOS ===
    const [usuarios] = await db.query(
      "SELECT COUNT(*) AS total FROM users"
    );

    // === TOTAL DE EMPLEADOS (role = 'employee') ===
    const [empleados] = await db.query(
      "SELECT COUNT(*) AS total FROM users WHERE role = 'employee'"
    );

    // === TOTAL DE ADMINISTRADORES (role = 'admin') ===
    const [admins] = await db.query(
      "SELECT COUNT(*) AS total FROM users WHERE role = 'admin'"
    );

    res.json({
      platillosTotales: platillos[0].total,
      usuariosRegistrados: usuarios[0].total,
      empleadosActivos: empleados[0].total,
      adminsTotales: admins[0].total
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al obtener estadísticas" });
  }
};
