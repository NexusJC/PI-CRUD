import { pool } from "../db.js";

export const getCajas = async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM cajas");
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const createCaja = async (req, res) => {
  const { nombre, numero_de_caja, estado } = req.body;
  try {
    const [result] = await pool.query(
      "INSERT INTO cajas (nombre, numero_de_caja, estado) VALUES (?, ?, ?)",
      [nombre, numero_de_caja, estado]
    );
    res.status(201).json({ message: "Caja creada", id: result.insertId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const deleteCaja = async (req, res) => {
  const { id } = req.params;
  try {
    const [result] = await pool.query("DELETE FROM cajas WHERE id = ?", [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Caja no encontrada" });
    }
    res.json({ message: "Caja eliminada" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
