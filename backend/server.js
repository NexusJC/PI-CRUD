// backend/server.js  (REEMPLAZA TODO EL ARCHIVO)

// ===== imports =====
import express from "express";
import cors from "cors";
import helmet from "helmet";
import { pool } from "./db.js";

import path from "path";
import { fileURLToPath } from "url";

// ===== app & config base =====
const app = express();
app.use(express.json());
app.use(helmet());
app.use(
  cors({
    origin: process.env.CORS_ORIGIN?.split(",") ?? "*",
    credentials: true,
  })
);

// ===== BLOQUE ESTÁTICO (sirve frontend y redirige a /menu/) =====
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const FRONT_ROOT = path.join(__dirname, "..", "frontend");

// 1) sirve TODO el frontend (css/js/img)
app.use(express.static(FRONT_ROOT));

// 2) sirve explícitamente /menu/*
app.use("/menu", express.static(path.join(FRONT_ROOT, "menu")));

// 3) raíz -> redirige a /menu/
app.get("/", (_req, res) => res.redirect(302, "/menu/"));

// ===== RUTAS DE DIAGNÓSTICO =====
app.get("/health", (_req, res) => res.status(200).send("ok"));
app.get("/ping-db", async (_req, res) => {
  try {
    const [rows] = await pool.query("SELECT 1 AS ok");
    res.json(rows[0]);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ===== TUS RUTAS API (monta DESPUÉS del bloque estático) =====
import authRouter from "./routes/auth.routes.js";
app.use("/api/auth", authRouter);

// ===== 404 y manejador de errores (AL FINAL) =====
app.use((req, res) => res.status(404).json({ error: "Not found" }));
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error("[ERROR]", err);
  res.status(500).json({ error: "Internal Server Error" });
});

// ===== listen =====
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`API corriendo en :${PORT}`));

export default app;
