// backend/server.js
import express from "express";
import cors from "cors";
// Si vas a usar variables locales en .env, descomenta la siguiente línea:
// import dotenv from "dotenv"; dotenv.config();

import { pool } from "./db.js"; // usa el pool que lee MYSQL_URL

const app = express();

// middlewares básicos
app.use(express.json());
app.use(
  cors({
    origin: process.env.CORS_ORIGIN?.split(",") ?? "*",
    credentials: true,
  })
);

// health check (para verificar que Railway levantó el servicio)
app.get("/health", (_req, res) => res.status(200).send("ok"));

// test rápido de conexión a la base de datos (opcional)
app.get("/ping-db", async (_req, res) => {
  try {
    const [rows] = await pool.query("SELECT 1 AS ok");
    res.json(rows[0]); // { ok: 1 }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// === aquí monta tus rutas reales ===
// Ejemplo (una vez convertidas a ESM):
// import authRouter from "./routes/auth.js";
// app.use("/api/auth", authRouter);

// 404 por defecto
app.use((req, res) => {
  res.status(404).json({ error: "Not found" });
});

// manejador de errores
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error("[ERROR]", err);
  res.status(500).json({ error: "Internal Server Error" });
});

// puerto asignado por Railway
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`API corriendo en :${PORT}`);
});

// (opcional) export para tests o serverless
export default app;
