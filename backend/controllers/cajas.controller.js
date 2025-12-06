import { pool } from "../db.js";

// Obtener todas las cajas
export const getCajas = async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT c.*, u.name AS empleado_nombre
            FROM cajas c
            LEFT JOIN users u ON c.empleado_id = u.id
        `);
        res.json(rows);
    } catch (error) {
        res.status(500).json({ message: "Error al obtener cajas" });
    }
};

// Crear caja
export const createCaja = async (req, res) => {
    try {
        const { numero_caja, empleado_id, estado } = req.body;

        await pool.query(`
            INSERT INTO cajas (numero_caja, empleado_id, estado)
            VALUES (?, ?, ?)
        `, [numero_caja, empleado_id || null, estado]);

        res.json({ success: true, message: "Caja registrada exitosamente" });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Error al crear la caja" });
    }
};

// Eliminar caja
export const deleteCaja = async (req, res) => {
    try {
        const { id } = req.params;

        await pool.query("DELETE FROM cajas WHERE id = ?", [id]);

        res.json({ success: true, message: "Caja eliminada correctamente" });
    } catch (error) {
        console.error("Error deleteCaja:", error);
        res.status(500).json({ message: "Error al eliminar la caja" });
    }
};

// Editar caja
export const updateCaja = async (req, res) => {
    try {
        const { id } = req.params;
        const { numero_caja, empleado_id, estado } = req.body;

        await pool.query(`
            UPDATE cajas
            SET numero_caja = ?, empleado_id = ?, estado = ?
            WHERE id = ?
        `, [numero_caja, empleado_id || null, estado, id]);

        res.json({ success: true });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Error al actualizar caja" });
    }
};
