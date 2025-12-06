import { Router } from "express";
import { getDashboardStats } from "../controllers/dashboard.controller.js";
import { pool } from "../db.js"; // ← IMPORTACIÓN CORRECTA

const router = Router();

// ===== Ruta que ya existía (NO SE TOCA) =====
router.get("/stats", getDashboardStats);

// ===== NUEVA RUTA: Platillos más vendidos =====
router.get("/top-dishes", async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT 
                od.dish_name AS dish,
                SUM(od.quantity) AS total_sold
            FROM order_details od
            GROUP BY od.dish_name
            ORDER BY total_sold DESC
            LIMIT 5;
        `);

        res.json(rows);
    } catch (error) {
        console.error("Error al obtener platillos más vendidos:", error);
        res.status(500).json({ error: "Error al obtener datos" });
    }
});


export default router;
