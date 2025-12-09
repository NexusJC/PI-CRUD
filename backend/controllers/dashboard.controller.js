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
    // CAMBIO ÚNICO: antes era role = 'employee'
    // ahora usamos el rol real de tu sistema: 'empleado'
    // y mantenemos 'employee' por si alguno se guardó así.
    const [empleados] = await pool.query(
      "SELECT COUNT(*) AS total FROM users WHERE role IN ('empleado', 'employee')"
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

// ================================
// ÓRDENES EN LOS ÚLTIMOS 7 DÍAS
// ================================
export const getOrdersLast7Days = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `
      SELECT 
        DATE(created_at) AS fecha,
        COUNT(*) AS total
      FROM orders
      WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 6 DAY)
      GROUP BY DATE(created_at)
      ORDER BY fecha;
      `
    );

    // Normalizar los 7 días
    const today = new Date();
    const map = new Map();

    rows.forEach(r => {
      const key = r.fecha.toISOString().slice(0, 10);
      map.set(key, r.total);
    });

    const result = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(today.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      result.push({
        fecha: key,
        total: map.get(key) || 0
      });
    }

    res.json(result);
  } catch (error) {
    console.error("Error en getOrdersLast7Days:", error);
    res.status(500).json({ error: "Error obteniendo órdenes de los últimos 7 días" });
  }
};

// ================================
// PLATILLOS MÁS VENDIDOS
// ================================
export const getTopDishes = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `
      SELECT 
        od.dish_name AS nombre,
        SUM(od.quantity) AS total_vendidos
      FROM order_details od
      GROUP BY od.dish_name
      ORDER BY total_vendidos DESC
      LIMIT 5;
      `
    );

    res.json(rows);
  } catch (error) {
    console.error("Error en getTopDishes:", error);
    res.status(500).json({ error: "Error obteniendo platillos más vendidos" });
  }
};
