import { pool } from "../db.js";

// ===========================
//   Obtener platillo más vendido
// ===========================
export const getTopDish = async () => {
  const [rows] = await pool.query(
    `SELECT dish_name, SUM(quantity) AS total_sold
     FROM order_details
     GROUP BY dish_name
     ORDER BY total_sold DESC
     LIMIT 1`
  );
  return rows.length > 0 ? rows[0].dish_name : "Sin datos";
};

// ===========================
//   Total de usuarios registrados
// ===========================
export const getTotalUsers = async () => {
  const [rows] = await pool.query(`SELECT COUNT(*) AS total FROM users`);
  return rows[0].total;
};

// ===========================
//   Total empleados
// ===========================
export const getTotalEmployees = async () => {
  const [rows] = await pool.query(
    `SELECT COUNT(*) AS total FROM users WHERE role = 'empleado'`
  );
  return rows[0].total;
};

// ===========================
//   Total admins
// ===========================
export const getTotalAdmins = async () => {
  const [rows] = await pool.query(
    `SELECT COUNT(*) AS total FROM users WHERE role = 'admin'`
  );
  return rows[0].total;
};

// ===========================
//   Total platillos
// ===========================
export const getTotalDishes = async () => {
  const [rows] = await pool.query(`SELECT COUNT(*) AS total FROM platillos`);
  return rows[0].total;
};

// ===========================
//   Ventas últimos 7 días
// ===========================
export const getSalesLast7Days = async () => {
  const [rows] = await pool.query(
    `SELECT DATE(created_at) AS day, SUM(total) AS total_sales
     FROM orders
     WHERE created_at >= NOW() - INTERVAL 7 DAY
     GROUP BY day
     ORDER BY day ASC`
  );
  return rows;
};

// ===========================
//   Top 5 platillos más vendidos
// ===========================
export const getTop5Dishes = async () => {
  const [rows] = await pool.query(
    `SELECT dish_name, SUM(quantity) AS total_sold
     FROM order_details
     GROUP BY dish_name
     ORDER BY total_sold DESC
     LIMIT 5`
  );
  return rows;
};

// ===========================
//   CONTROLLER PRINCIPAL PARA EL DASHBOARD
// ===========================
export const getDashboardData = async (req, res) => {
  try {
    const [
      topDish,
      totalUsers,
      totalEmployees,
      totalAdmins,
      totalDishes,
      salesLast7Days,
      top5Dishes,
    ] = await Promise.all([
      getTopDish(),
      getTotalUsers(),
      getTotalEmployees(),
      getTotalAdmins(),
      getTotalDishes(),
      getSalesLast7Days(),
      getTop5Dishes(),
    ]);

    res.json({
      topDish,
      totalUsers,
      totalEmployees,
      totalAdmins,
      totalDishes,
      salesLast7Days,
      top5Dishes,
    });

  } catch (error) {
    console.error("Error obteniendo datos del dashboard:", error);
    res.status(500).json({ error: "Error obteniendo datos del dashboard" });
  }
};
