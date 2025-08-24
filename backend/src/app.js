import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { pool } from "./db.js";
dotenv.config();

const app = express();
app.use(cors());              // permite llamadas desde el frontend
app.use(express.json());      // parsea JSON

// Salud
app.get("/api/ping", async (_, res) => {
  const [r] = await pool.query("SELECT 1 AS ok");
  res.json(r[0]);
});

// Crear ticket
app.post("/api/tickets", async (req, res) => {
  try {
    const { code } = req.body;                 // ej: "A-0001"
    if (!code) return res.status(400).json({ error: "code requerido" });
    const [result] = await pool.query(
      "INSERT INTO ticket (code) VALUES (?)",
      [code]
    );
    res.status(201).json({ id: result.insertId, code, status: "waiting" });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "No se pudo crear" });
  }
});

// Listar tickets
app.get("/api/tickets", async (req, res) => {
  const [rows] = await pool.query(
    "SELECT id, code, status, created_at FROM ticket ORDER BY id DESC LIMIT 200"
  );
  res.json(rows);
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`🚀 API http://localhost:${PORT}`));
